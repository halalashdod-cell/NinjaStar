import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { attractions, paths } from "@/lib/content";
import { Icon, NinjaStar } from "@/components/icon";
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
          src="/images/park.jpg"
          alt="ילדים גולשים ומשחקים בבריכת הכדורים של נינג׳ה סטאר"
          fill
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="hero-shade" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span />
              נינג׳ה סטאר. הרבה יותר מיום כיף.
            </p>
            <h1>
              קופצים.
              <br />
              מטפסים.
              <br />
              <span>חוגגים.</span>
            </h1>
            <p className="hero-description">
              פחות מסכים. יותר רגעים ביחד.
              <br />
              עולם של אתגרים וחוויות לכל המשפחה.
            </p>
            <div className="hero-actions">
              <a href="#branches" className="button button-red">
                <Icon name="pin" size={18} />
                איפה נפגשים?
              </a>
              <Link href={paths.birthdays} className="button button-glass">
                <Icon name="cake" size={18} />
                יש סיבה לחגיגה
              </Link>
            </div>
            <div className="hero-footnote">
              <Icon name="sparkles" size={16} />
              <span>רחובות</span>
              <i /> <span>אשדוד</span>
              <i />
              <span>הוד השרון</span>
            </div>
          </div>
          <div className="hero-sticker">
            <NinjaStar />
            <span>
              כאן
              <br />
              מוציאים
              <br />
              <strong>אנרגיה!</strong>
            </span>
          </div>
          <span className="hero-photo-credit">הרגעים שלנו. החוויות שלכם.</span>
        </div>
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
