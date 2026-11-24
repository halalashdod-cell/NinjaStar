import { NextResponse } from "next/server";
import { LeadError, readLeadRequest, saveLead, validateLead } from "@/lib/leads.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const lead = validateLead(await readLeadRequest(request));
    const address = (request.headers.get("x-vercel-forwarded-for")
      || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const id = await saveLead(lead, address);
    return NextResponse.json({
      success: true, persisted: true, id,
      message: lead.type === "recruitment"
        ? "המועמדות נקלטה בהצלחה. תודה שפניתם אלינו!"
        : "הפרטים נקלטו בהצלחה. תודה שפניתם אלינו!",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Never send database errors, credentials, or submitted personal data to logs/UI.
    const status = error instanceof LeadError ? error.status : 503;
    const message = error instanceof LeadError ? error.message : "לא הצלחנו לשמור את הפנייה כרגע. נסו שוב מאוחר יותר.";
    return NextResponse.json({ success: false, persisted: false, message }, {
      status,
      headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "600" } : {}) },
    });
  }
}
