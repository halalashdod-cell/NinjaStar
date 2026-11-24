import type { Metadata } from "next";
import Link from "next/link";
import { attractions, paths } from "@/lib/content";
import { Icon } from "@/components/icon";
import { AttractionCard } from "@/components/photo-card";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { HeroVideo } from "@/components/hero-video";
import {
  SectionHeading,
  BirthdayBanner,
  BranchesSection,
  FaqSection,
  ContactSection,
} from "@/components/sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <HeroVideo />
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
              מתחמי נינג׳ה, טרמפולינות וטיפוס ברחובות, אשדוד והוד השרון.
              לבילוי משפחתי, ימי הולדת ואירועים קבוצתיים.
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
      </section>
      <section className="section container attractions-home" id="facilities">
        <SectionHeading title="המתקנים שלנו">
          <Link href="#branches" className="text-link">
            לסניפים שלנו <Icon name="left" size={18} />
          </Link>
        </SectionHeading>
        <div className="attraction-grid home-attractions">
          {attractions.slice(0, 4).map((a) => (
            <AttractionCard key={a.id} attraction={a} />
          ))}
        </div>
      </section>
      <section className="why-section">
        <div className="container why-layout" data-reveal>
          <div>
            <h2>הצוות שלנו</h2>
          </div>
          <div className="why-features">
            <div>
              <Icon name="users" size={28} />
              <h3>מקבלים אתכם בחיוך</h3>
              <p>עוזרים להכיר את המתחם ולבחור פעילות.</p>
            </div>
            <div>
              <Icon name="shield" size={28} />
              <h3>מלווים את הפעילות</h3>
              <p>מסבירים על המתקנים ועל כללי השימוש במקום.</p>
            </div>
            <div>
              <Icon name="cake" size={28} />
              <h3>מפעילים את החגיגה</h3>
              <p>משחקים משותפים וטקס עוגה עם הצוות.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="birthday-section">
        <BirthdayBanner />
      </div>
      <BranchesSection />
      <ReviewsCarousel />
      <FaqSection />
      <ContactSection />
    </div>
  );
}
