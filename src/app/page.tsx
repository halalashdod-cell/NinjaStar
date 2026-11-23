import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { attractions, paths } from "@/lib/content";
import { Icon } from "@/components/icon";
import { AttractionCard } from "@/components/photo-card";
import {
  BranchPicker,
  SectionHeading,
  BirthdayBanner,
  BranchesSection,
  FaqSection,
  ContactSection,
} from "@/components/sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <section className="hero">
        <Image
          className="hero-image"
          src="/images/stitch-arena.jpg"
          alt="הדמיית אווירה של זירת נינג׳ה בתאורת כחול ואדום"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>
              ברוכים הבאים
              <span>לנינג׳ה סטאר</span>
            </h1>
            <div className="hero-ribbon">
              <p>
                נינג׳ה, טרמפולינות וימי הולדת <span aria-hidden="true">•</span>{" "}
                חוויה לכל המשפחה
              </p>
            </div>
            <p className="hero-description">
              קופצים, מטפסים וחוגגים יחד. עולם של מתקנים ואתגרים, משחקים וימי
              הולדת בסניפי רחובות, אשדוד והוד השרון — חוויות שכולם זוכרים.
            </p>
            <div className="hero-actions">
              <Link
                href={`${paths.birthdays}#enquiry`}
                className="button button-blue"
              >
                <Icon name="cake" size={18} />
                מתכננים חגיגה
              </Link>
              <Link href={paths.pricing} className="button button-red">
                מחירים וכניסה
              </Link>
            </div>
          </div>
        </div>
        <span className="hero-photo-credit">תמונת אווירה</span>
      </section>
      <BranchPicker />
      <section className="section container attractions-home">
        <SectionHeading
          eyebrow="מתחם אחד. עולם של אפשרויות."
          title="כל אחד והאתגר שלו."
        >
          <Link href={paths.attractions} className="text-link">
            מגלים את כל המתקנים <Icon name="plus" size={18} />
          </Link>
        </SectionHeading>
        <div className="attraction-grid home-attractions">
          {attractions.slice(0, 4).map((a) => (
            <AttractionCard key={a.id} attraction={a} />
          ))}
        </div>
        <div className="attraction-footer">
          <span>
            <Icon name="zap" size={18} />
            מגיעים עם אנרגיה. יוצאים עם חוויות.
          </span>
          <p>מגוון המתקנים משתנה בין הסניפים.</p>
        </div>
      </section>
      <section className="why-section">
        <div className="container why-layout">
          <div>
            <p className="eyebrow">
              <span />
              זה הזמן שלכם ביחד
            </p>
            <h2>
              הילדים מוציאים אנרגיה.
              <br />
              אתם אוספים <span>רגעים.</span>
            </h2>
          </div>
          <div className="why-features">
            <div>
              <Icon name="users" size={28} />
              <h3>כיף לכל המשפחה</h3>
              <p>
                מקום לפעילות משותפת,
                <br />
                מהקטנטנים ועד ההורים.
              </p>
            </div>
            <div>
              <Icon name="mountain" size={28} />
              <h3>אתגר בכל פינה</h3>
              <p>
                קופצים, מטפסים ומגלים
                <br />
                משהו חדש בכל ביקור.
              </p>
            </div>
            <div>
              <Icon name="cake" size={28} />
              <h3>חוגגים בגדול</h3>
              <p>
                ימי הולדת, אירועים
                <br />
                וימי כיף עם החברים.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="birthday-section">
        <BirthdayBanner />
      </div>
      <BranchesSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
