"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { branches } from "@/lib/content";
import { Icon } from "./icon";

export function LeadForm({
  initialBranch = "",
  variant = "visit",
}: {
  initialBranch?: string;
  variant?: "visit" | "birthday" | "recruitment";
}) {
  const id = useId();
  const recruitment = variant === "recruitment";
  const birthday = variant === "birthday";
  const Heading = recruitment ? "h2" : "h3";
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const submissionId = useRef<string | null>(null);
  const submitting = useRef(false);
  const pending = status === "pending";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    submissionId.current ??= crypto.randomUUID();
    const data = {
      ...Object.fromEntries(new FormData(form)),
      submissionId: submissionId.current,
      sourcePath: window.location.pathname,
    };
    submitting.current = true;
    setStatus("pending");
    setMessage("");
    try {
      const response = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || result.persisted !== true)
        throw new Error(
          result.message || "לא הצלחנו לשמור את הפנייה. נסו שוב.",
        );
      setStatus("success");
      setMessage(result.message);
      form.reset();
      submissionId.current = null;
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error && !(error instanceof TypeError) && !(error instanceof SyntaxError)
          ? error.message
          : "לא הצלחנו לשלוח את הפנייה. הפרטים נשארו בטופס, ואפשר לנסות שוב.",
      );
    } finally {
      submitting.current = false;
    }
  }
  return (
    <form
      className="lead-form"
      onSubmit={submit}
      onChange={() => { submissionId.current = null; }}
      aria-busy={pending}
      aria-label={
        recruitment ? "טופס מועמדות לעבודה" : "טופס התעניינות"
      }
    >
      <div className="form-heading">
        <Icon name={recruitment ? "users" : "chat"} size={26} />
        <div>
          <Heading>
            {recruitment
              ? "נשמח להכיר אתכם"
              : birthday
                ? "תיאום יום הולדת"
                : "פרטים ליצירת קשר"}
          </Heading>
          <p>
            {recruitment
              ? "בחרו סניף וספרו לנו קצת על עצמכם."
              : "בחרו סניף וסוג פנייה."}
          </p>
        </div>
      </div>
      <p className="form-purpose">הפרטים ישמשו ליצירת קשר בנוגע לפנייה.</p>
      <div className="form-grid">
        <label htmlFor={`${id}-name`}>
          שם מלא
          <input
            id={`${id}-name`}
            name="name"
            disabled={pending}
            placeholder="איך קוראים לכם?"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
          />
        </label>
        <label htmlFor={`${id}-phone`}>
          מספר טלפון
          <input
            id={`${id}-phone`}
            name="phone"
            disabled={pending}
            type="tel"
            inputMode="tel"
            placeholder="050-0000000"
            required
            pattern="[+0-9 ()-]{9,20}"
            maxLength={20}
            autoComplete="tel"
            dir="ltr"
          />
        </label>
        <label
          htmlFor={`${id}-branch`}
          className={recruitment ? "form-field-wide" : undefined}
        >
          {recruitment ? "באיזה סניף תרצו לעבוד?" : "באיזה סניף נפגשים?"}
          <span className="select-wrap">
            <select
              id={`${id}-branch`}
              name="branch"
              disabled={pending}
              defaultValue={initialBranch}
              required
            >
              <option value="" disabled>
                בחרו סניף
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Icon name="down" size={16} />
          </span>
        </label>
        {recruitment ? (
          <>
            <input type="hidden" name="type" value="recruitment" />
            <label htmlFor={`${id}-message`} className="form-field-wide">
              כמה מילים עליכם (לא חובה)
              <textarea
                id={`${id}-message`}
                name="message"
                disabled={pending}
                placeholder="ניסיון קודם, זמינות או מה מושך אתכם לעבודה אצלנו"
                maxLength={1000}
                rows={4}
              />
            </label>
          </>
        ) : (
          <label htmlFor={`${id}-type`}>
            מה מתכננים?
            <span className="select-wrap">
              <select
                id={`${id}-type`}
                name="type"
                disabled={pending}
                defaultValue={birthday ? "birthday" : "visit"}
              >
                <option value="visit">בילוי משפחתי</option>
                <option value="birthday">יום הולדת</option>
                <option value="group">אירוע או קבוצה</option>
                <option value="other">משהו אחר</option>
              </select>
              <Icon name="down" size={16} />
            </span>
          </label>
        )}
      </div>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="honeypot"
        aria-hidden="true"
      />
      <button
        className="button button-blue form-submit"
        type="submit"
        disabled={status === "pending"}
        aria-busy={status === "pending"}
      >
        <span key={status === "pending" ? "pending" : "ready"} className="submit-label">
          {status === "pending"
            ? "שולחים את הפרטים…"
            : recruitment
              ? "שליחת מועמדות"
              : "שליחת פרטים"}
        </span>
        <Icon
          name={status === "pending" ? "loading" : "sparkles"}
          size={18}
          className={status === "pending" ? "submit-spinner" : ""}
        />
      </button>
      <p className={`form-message ${status}`} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
