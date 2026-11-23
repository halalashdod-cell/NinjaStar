import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ message: "פורמט הבקשה אינו נתמך." }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 4096) return NextResponse.json({ message: "הבקשה ארוכה מדי." }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ message: "לא הצלחנו לקרוא את הפרטים." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "פרטים לא תקינים." }, { status: 400 });
  if (body.website) return NextResponse.json({ message: "פרטים לא תקינים." }, { status: 400 });
  if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 80 || typeof body.phone !== "string" || !/^[+\d ()-]{9,20}$/.test(body.phone) || body.phone.replace(/\D/g, "").length < 9 || typeof body.branch !== "string" || !["rehovot", "ashdod", "hod-hasharon"].includes(body.branch) || typeof body.type !== "string" || !["visit", "birthday", "group", "other"].includes(body.type)) {
    return NextResponse.json({ message: "בדקו שם, מספר טלפון ובחירת סניף ונסו שוב." }, { status: 400 });
  }
  // Demo boundary: intentionally no database, email, logging of personal data, or external submission.
  return NextResponse.json({ demo: true, persisted: false, message: "ההדגמה הושלמה בהצלחה! הפרטים לא נשמרו ולא נשלחו לסניף. לתיאום ביקור אמיתי חייגו 08-8565537." }, { headers: { "Cache-Control": "no-store" } });
}
