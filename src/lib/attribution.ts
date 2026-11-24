export const attributionLimits = {
  utm_source: 200, utm_medium: 200, utm_campaign: 200,
  utm_term: 200, utm_content: 200,
  gclid: 512, gbraid: 512, wbraid: 512,
  landing_page: 500, referrer: 300,
} as const;
export type LeadAttribution = { -readonly [K in keyof typeof attributionLimits]: string | null };

export function normalizeAttribution(value: unknown): LeadAttribution {
  if (value !== undefined && (!value || typeof value !== "object" || Array.isArray(value))) {
    throw new Error("Invalid attribution");
  }
  const input = (value ?? {}) as Record<string, unknown>;
  const output = {} as LeadAttribution;
  for (const [key, limit] of Object.entries(attributionLimits)) {
    const field = key as keyof LeadAttribution;
    const raw = input[field];
    if (raw === undefined || raw === null || raw === "") { output[field] = null; continue; }
    if (typeof raw !== "string" || raw.length > limit || /[\u0000-\u001f\u007f]/.test(raw)) {
      throw new Error("Invalid attribution");
    }
    output[field] = raw.trim() || null;
  }
  if (output.landing_page && (!output.landing_page.startsWith("/") || /^\/\//.test(output.landing_page) || /[?#]/.test(output.landing_page))) {
    throw new Error("Invalid landing page");
  }
  if (output.referrer) {
    const referrer = new URL(output.referrer);
    if (!["https:", "http:"].includes(referrer.protocol) || referrer.origin !== output.referrer) throw new Error("Invalid referrer");
  }
  return output;
}

const storageKey = "ninjastar.attribution.v1";
// First landing, then the latest explicitly tagged campaign in this browser tab.
// Ordinary navigation never replaces a campaign with an unattributed visit.
export function captureAttribution(
  href: string, referrer: string, storage?: Pick<Storage, "getItem" | "setItem">,
): LeadAttribution {
  const url = new URL(href);
  let saved: LeadAttribution | undefined;
  try {
    const stored = storage?.getItem(storageKey);
    if (stored) saved = normalizeAttribution(JSON.parse(stored));
  } catch { /* Storage can be disabled or stale; the form must still work. */ }
  const input: Record<string, string | null> = {};
  for (const [key, limit] of Object.entries(attributionLimits)) {
    if (key === "landing_page" || key === "referrer") continue;
    const value = url.searchParams.get(key)?.replace(/[\u0000-\u001f\u007f]/g, "").trim();
    input[key] = value ? value.slice(0, limit) : null;
  }
  const tagged = Object.values(input).some(Boolean);
  if (saved && !tagged) return saved;
  let referringOrigin: string | null = null;
  try {
    const from = new URL(referrer);
    if (["https:", "http:"].includes(from.protocol) && from.origin !== url.origin && from.origin.length <= 300) referringOrigin = from.origin;
  } catch { /* Direct visits have no referrer. */ }
  if (input.gclid || input.gbraid || input.wbraid) {
    // These defaults infer Google Ads; explicit UTM values always take priority.
    input.utm_source ??= "google";
    input.utm_medium ??= "cpc";
  }
  const current = normalizeAttribution({ ...input, landing_page: url.pathname.slice(0, 500), referrer: referringOrigin });
  try { storage?.setItem(storageKey, JSON.stringify(current)); } catch { /* Best effort. */ }
  return current;
}

export function getBrowserAttribution(): LeadAttribution {
  let storage: Storage | undefined;
  try { storage = window.sessionStorage; } catch { /* Privacy mode can disable storage. */ }
  return captureAttribution(window.location.href, document.referrer, storage);
}
