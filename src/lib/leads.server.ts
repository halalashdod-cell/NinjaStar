import { createHmac, randomUUID } from "node:crypto";

export class LeadError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type WebsiteLead = {
  id: string; name: string; phone: string; branch: string; type: string;
  message: string | null; sourcePath: string;
};
const invalid = () => new LeadError(400, "בדקו שם, מספר טלפון ובחירת סניף ונסו שוב.");
const unavailable = () => new LeadError(503, "לא הצלחנו לשמור את הפנייה כרגע. נסו שוב או פנו אלינו בטלפון.");
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateLead(value: unknown): WebsiteLead {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid();
  const body = value as Record<string, unknown>;
  if (body.website !== undefined && body.website !== "") throw invalid();
  if (
    typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 80 ||
    /[\u0000-\u001f\u007f]/.test(body.name) ||
    typeof body.phone !== "string" || !/^\+?[\d ()-]{9,20}$/.test(body.phone.trim()) ||
    typeof body.branch !== "string" || !["rehovot", "ashdod", "hod-hasharon"].includes(body.branch) ||
    typeof body.type !== "string" || !["visit", "birthday", "group", "other", "recruitment"].includes(body.type)
  ) throw invalid();
  const digits = body.phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) throw invalid();
  if (body.message !== undefined && (typeof body.message !== "string" || body.message.length > 1000 || body.message.includes("\0"))) {
    throw new LeadError(400, "כתבו הודעה קצרה, עד 1,000 תווים.");
  }
  if (body.submissionId !== undefined && (typeof body.submissionId !== "string" || !uuid.test(body.submissionId))) throw invalid();
  const sourcePath = body.sourcePath ?? "/";
  if (typeof sourcePath !== "string" || sourcePath.length > 500 || !sourcePath.startsWith("/") || sourcePath.startsWith("//") || /[?#\u0000-\u001f\u007f]/.test(sourcePath)) throw invalid();
  return {
    id: typeof body.submissionId === "string" ? body.submissionId : randomUUID(),
    name: body.name.trim(), phone: body.phone.trim().startsWith("+") ? `+${digits}` : digits,
    branch: body.branch, type: body.type,
    message: typeof body.message === "string" ? body.message.trim() || null : null, sourcePath,
  };
}

export async function readLeadRequest(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new LeadError(415, "פורמט הבקשה אינו נתמך.");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new LeadError(403, "הבקשה אינה נתמכת.");
  if (!request.body) throw invalid();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        throw new LeadError(413, "הבקשה ארוכה מדי.");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (error instanceof LeadError) throw error;
    throw new LeadError(400, "לא הצלחנו לקרוא את הפרטים.");
  } finally { reader.releaseLock(); }
}

export async function saveLead(
  lead: WebsiteLead,
  clientAddress: string,
  options: { env?: Record<string, string | undefined>; fetcher?: typeof fetch } = {},
) {
  const env = options.env ?? process.env;
  const keys = [...new Set([env.SUPABASE_SECRET_KEY, env.SUPABASE_SERVICE_ROLE_KEY]
    .map((key) => key?.trim()).filter((key): key is string => !!key))];
  const base = env.SUPABASE_URL?.trim();
  if (!keys.length || !base) {
    console.error("Lead storage unavailable", { reason: "missing_server_configuration" });
    throw unavailable();
  }
  let endpoint: URL;
  try {
    endpoint = new URL("/rest/v1/rpc/submit_website_lead", base);
    if (endpoint.protocol !== "https:") throw new Error("Invalid database URL");
  } catch { throw unavailable(); }

  try {
    for (const [index, key] of keys.entries()) {
      // Legacy service-role keys are JWTs; new secret keys belong only on apikey.
      const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
      if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
      // Store a keyed hash for rate limiting, never the visitor's raw IP address.
      const clientHash = createHmac("sha256", key).update(clientAddress || "unknown").digest("hex");
      const response = await (options.fetcher ?? fetch)(endpoint, {
        method: "POST", headers,
        body: JSON.stringify({
          p_id: lead.id, p_name: lead.name, p_phone: lead.phone,
          p_branch: lead.branch, p_type: lead.type, p_message: lead.message,
          p_source_path: lead.sourcePath, p_client_hash: clientHash,
        }),
        cache: "no-store", signal: AbortSignal.timeout(10000),
      });
      const result = await response.json().catch(() => null);
      // An authentication rejection cannot have saved the request. Try the
      // integration-managed server key, when present, against the same project.
      if (response.status === 401 && index + 1 < keys.length) continue;
      if (!response.ok) {
        if (result?.code === "P0001" && result.message === "lead_rate_limit") {
          throw new LeadError(429, "התקבלו פניות רבות בזמן קצר. נסו שוב בעוד כמה דקות או פנו אלינו בטלפון.");
        }
        if (result?.code === "P0001" && result.message === "lead_id_conflict") {
          throw new LeadError(409, "הפרטים השתנו. רעננו את העמוד ונסו שוב.");
        }
        console.error("Lead storage request failed", {
          status: response.status,
          code: typeof result?.code === "string" && /^[a-z0-9_]{1,40}$/i.test(result.code) ? result.code : "unknown",
        });
        throw unavailable();
      }
      if (result !== lead.id) {
        console.error("Lead storage unavailable", { reason: "invalid_database_acknowledgement" });
        throw unavailable();
      }
      return lead.id;
    }
    throw unavailable();
  } catch (error) {
    if (error instanceof LeadError) throw error;
    console.error("Lead storage unavailable", { reason: "network_or_timeout" });
    throw unavailable();
  }
}
