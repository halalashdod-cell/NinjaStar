"use client";

import { useState, type CSSProperties } from "react";
import { branches, prices, paths } from "@/lib/content";
import { Icon } from "./icon";
import Link from "next/link";

export function PricingCards() {
  const [branch, setBranch] = useState("rehovot");
  return (
    <>
      <div className="pricing-filter">
        <span>בוחרים סניף:</span>
        <div
          className="filter-tabs pricing-tabs"
          style={{ "--tab-index": branches.findIndex((b) => b.id === branch) } as CSSProperties}
          role="group"
          aria-label="בחירת סניף למחירון"
        >
          {branches.map((b) => (
            <button
              key={b.id}
              aria-pressed={branch === b.id}
              onClick={() => setBranch(b.id)}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
      <p className="pricing-note">
        מחירון הבסיס המפורסם באתר הקיים מוצג לכל הסניפים. יש לאשר מחיר וזמינות
        מול סניף {branches.find((b) => b.id === branch)?.name}.
      </p>
      <div className="pricing-grid">
        {prices.map((price) => (
          <article
            key={price.title}
            className={`price-card ${price.popular ? "featured" : ""}`}
          >
            <Icon
              name={
                price.value === 50
                  ? "users"
                  : price.value === 70
                    ? "zap"
                    : "mountain"
              }
              size={30}
            />
            <h2>{price.title}</h2>
            <p>{price.subtitle}</p>
            <div className="price-value">
              <span>₪</span>
              {price.value}
            </div>
            <span className="price-per">לילד / לביקור</span>
            <ul>
              {price.features.map((feature) => (
                <li key={feature}>
                  <Icon name="check" size={17} />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              className={`button ${price.popular ? "button-blue" : "button-outline"}`}
              href={`/${branches.find((b) => b.id === branch)?.slug}/`}
            >
              פרטי הסניף
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}

export function EntryDemo() {
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="entry-demo">
      <Icon name="shield" size={38} />
      <h2>לפני שקופצים, מכירים את הכללים</h2>
      <p>
        הפעילות במתקנים כפופה לאישור השתתפות ולהנחיות הבטיחות. קטינים נדרשים
        לאישור הורה או אפוטרופוס.
      </p>
      <div className="form-demo">
        זהו מסך הדגמה בלבד. הוא אינו אוסף חתימה ואינו מהווה אישור השתתפות תקף.
      </div>
      <a
        className="text-link"
        href="https://ninja-star.co.il/enter/"
        target="_blank"
        rel="noopener noreferrer"
      >
        לצפייה בטופס ההשתתפות באתר הקיים
      </a>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => {
            setConfirmed(e.target.checked);
            setDone(false);
          }}
        />
        הבנתי שמדובר בהדגמה, ושיש להשלים אישור תקף לפני הביקור.
      </label>
      <button
        className="button button-blue"
        disabled={!confirmed}
        onClick={() => setDone(true)}
      >
        הצגת אישור הדגמה
      </button>
      <p role="status" className="form-message success">
        {done
          ? "ההדגמה הושלמה. לא נוצר אישור השתתפות — להשלמת התהליך יש לפנות לסניף."
          : ""}
      </p>
      <Link className="text-link" href={paths.pricing}>
        חזרה למחירון
      </Link>
    </div>
  );
}
