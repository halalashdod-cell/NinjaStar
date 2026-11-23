"use client";

import { useId, useState, type FormEvent } from "react";
import { branches } from "@/lib/content";
import { Icon } from "./icon";

export function LeadForm({ initialBranch = "", birthday = false }: { initialBranch?: string; birthday?: boolean }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("pending"); setMessage("");
    try {
      const response = await fetch("/api/leads/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "לא הצלחנו להשלים את ההדגמה. נסו שוב.");
      setStatus("success"); setMessage(result.message); form.reset();
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "אירעה שגיאה. נסו שוב."); }
  }
  return <form className="lead-form" onSubmit={submit} aria-label="טופס התעניינות להדגמה">
    <div className="form-heading"><Icon name="chat" size={26} /><div><h3>{birthday ? "מתחילים לתכנן את החגיגה" : "בואו נדבר על הביקור שלכם"}</h3><p>כמה פרטים קטנים, ואפשר להתחיל לדמיין.</p></div></div>
    <div className="form-demo"><Icon name="sparkles" size={16} />הדגמה בלבד — הפרטים אינם נשמרים או נשלחים לסניף. מומלץ להשתמש בפרטי דוגמה.</div>
    <div className="form-grid">
      <label htmlFor={`${id}-name`}>שם מלא<input id={`${id}-name`} name="name" placeholder="איך קוראים לכם?" required minLength={2} maxLength={80} autoComplete="name" /></label>
      <label htmlFor={`${id}-phone`}>מספר טלפון<input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" placeholder="050-0000000" required pattern="[+0-9 ()-]{9,20}" maxLength={20} autoComplete="tel" dir="ltr" /></label>
      <label htmlFor={`${id}-branch`}>באיזה סניף נפגשים?<span className="select-wrap"><select id={`${id}-branch`} name="branch" defaultValue={initialBranch} required><option value="" disabled>בחרו סניף</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select><Icon name="down" size={16} /></span></label>
      <label htmlFor={`${id}-type`}>מה מתכננים?<span className="select-wrap"><select id={`${id}-type`} name="type" defaultValue={birthday ? "birthday" : "visit"}><option value="visit">בילוי משפחתי</option><option value="birthday">יום הולדת</option><option value="group">אירוע או קבוצה</option><option value="other">משהו אחר</option></select><Icon name="down" size={16} /></span></label>
    </div>
    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
    <button className="button button-blue form-submit" type="submit" disabled={status === "pending"}>{status === "pending" ? "בודקים את הפרטים…" : "נסו את טופס ההדגמה"}<Icon name="sparkles" size={18} /></button>
    <p className={`form-message ${status}`} role="status" aria-live="polite">{message}</p>
  </form>;
}
