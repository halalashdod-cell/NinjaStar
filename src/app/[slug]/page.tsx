import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  attractions,
  branches,
  contact,
  paths,
  routeSlugs,
} from "@/lib/content";
import { Icon, NinjaStar } from "@/components/icon";
import { EntryDemo, PricingCards } from "@/components/interactive";
import { AttractionCard } from "@/components/photo-card";
import { LeadForm } from "@/components/lead-form";
import {
  ContactSection,
  FaqSection,
  PageHero,
  SectionHeading,
} from "@/components/sections";

export function generateStaticParams() {
  return routeSlugs.map((slug) => ({ slug }));
}
// Permit runtime resolution of percent-encoded Hebrew paths as well as prerendered URLs.
export const dynamicParams = true;

function normalizedSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return "";
  }
}

const specialPages: Record<string, { title: string; description: string }> = {
  "ימי-הולדת": {
    title: "ימי הולדת ואירועים",
    description:
      "חוגגים יום הולדת בנינג׳ה סטאר עם החברים, הפעילויות והכיף. חבילות יום הולדת בסניפי רחובות, אשדוד והוד השרון.",
  },
  "מחירון-כניסה": {
    title: "מחירון כניסה",
    description:
      "מחירי הכניסה לנינג׳ה סטאר: כניסה לשעתיים, חבילות עם קיר טיפוס וכרטיסיות. בחרו סניף ותכננו את הביקור.",
  },
  "עבודה-במתחם": {
    title: "עבודה במתחם",
    description:
      "רוצים להצטרף לצוות נינג׳ה סטאר? בחרו סניף וספרו לנו קצת על עצמכם בטופס המועמדות.",
  },
  enter: {
    title: "אישור השתתפות",
    description:
      "מידע לקראת הביקור ואישור השתתפות במתקני נינג׳ה סטאר. מסך הדגמה בלבד.",
  },
  "הצהרת-נגישות": {
    title: "נגישות",
    description:
      "מידע על הנגישות באתר ובסניפי נינג׳ה סטאר ודרכי יצירת קשר בנושא נגישות.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = normalizedSlug((await params).slug);
  const branch = branches.find((b) => b.slug === slug);
  const details = branch
    ? { title: `נינג׳ה סטאר ${branch.name}`, description: branch.description }
    : specialPages[slug];
  if (!details) return {};
  return {
    ...details,
    alternates: { canonical: `/${slug}/` },
    openGraph: {
      title: details.title,
      description: details.description,
      url: `/${slug}/`,
      images: [
        { url: branch?.image || "/images/park.jpg" },
      ],
    },
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = normalizedSlug((await params).slug);
  const branch = branches.find((b) => b.slug === slug);
  if (branch)
    return (
      <>
        <PageHero
          eyebrow={`הסניפים שלנו · ${branch.name}`}
          title={`נינג׳ה סטאר\n${branch.name}`}
          description={branch.description}
          image={branch.image}
        >
          <div className="hero-actions">
            <a
              href={branch.waze}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-red"
            >
              <Icon name="navigation" size={18} />
              נווטו אלינו
            </a>
            <a href="#contact" className="button button-glass">
              מתכננים ביקור
            </a>
          </div>
        </PageHero>
        <div className="container branch-info-strip">
          <div>
            <Icon name="pin" size={24} />
            <div>
              <strong>{branch.label}</strong>
              <span>{branch.address}</span>
              <small>{branch.location}</small>
            </div>
          </div>
          <div>
            <Icon name="clock" size={24} />
            <div>
              <strong>שעות פתיחה</strong>
              <span>
                א׳–ה׳ <bdi>16:00–20:00</bdi> · ו׳ <bdi>13:00–17:00</bdi>
              </span>
              <small>
                שבתות, חגים וחופשים <bdi>{branch.weekend}</bdi>
              </small>
            </div>
          </div>
          <div>
            <Icon name="phone" size={24} />
            <div>
              <strong>טלפון לבירורים</strong>
              <a href={contact.phoneHref} dir="ltr">
                {contact.phone}
              </a>
              <small>מומלץ לברר שעות וזמינות לפני הגעה</small>
            </div>
          </div>
        </div>
        <section className="section container" id="facilities">
          <SectionHeading title="המתקנים בסניף">
            <Link href={paths.pricing} className="text-link">
              למחירון הכניסה <Icon name="ticket" size={18} />
            </Link>
          </SectionHeading>
          <div className="attraction-grid">
            {attractions
              .filter((a) => branch.attractions.includes(a.id))
              .map((a) => (
                <AttractionCard attraction={a} key={a.id} />
              ))}
          </div>
          <p className="fine-print">
            תמונות מרשת נינג׳ה סטאר.
          </p>
        </section>
        <section className="container branch-birthday">
          <Icon name="cake" size={42} />
          <div>
            <h2>ימי הולדת בסניף</h2>
            <p>פעילות במתחם, הפעלה עם הצוות וטקס עוגה.</p>
          </div>
          <Link href={paths.birthdays} className="button button-blue">
            פרטים על ימי הולדת
          </Link>
        </section>
        <ContactSection initialBranch={branch.id} />
      </>
    );

  if (slug === "מחירון-כניסה")
    return (
      <>
        <PageHero
          eyebrow="מחירון כניסה"
          title="מחירון כניסה"
          description="כרטיסי כניסה לשעתיים, תוספות וכרטיסיות."
        />
        <section className="section container pricing-section">
          <PricingCards />
          <div className="extras-grid">
            <div>
              <Icon name="ticket" size={29} />
              <h3>כרטיסיות</h3>
              <p>
                כרטיסייה ל־10 כניסות <strong>₪490</strong>
              </p>
              <p>
                כרטיסייה ל־10 כניסות עם קיר טיפוס <strong>₪560</strong>
              </p>
            </div>
            <div>
              <Icon name="zap" size={29} />
              <h3>מכוניות מתנגשות</h3>
              <p>
                מכוניות מתנגשות בסניף אשדוד <strong>₪15</strong>
              </p>
              <p className="fine-print">פעילות בתשלום נפרד, בהתאם לזמינות.</p>
            </div>
          </div>
          <div className="pricing-important">
            <Icon name="sparkles" size={22} />
            <p>
              הורה מלווה אינו משלם. הכניסה למתקנים עם גרביים נגד החלקה — אפשר
              לרכוש בקופות. המחירים מבוססים על האתר הקיים ויש לאשרם מול הסניף.
            </p>
          </div>
          <div className="entry-link-panel">
            <Icon name="shield" size={26} />
            <div>
              <h3>אישור השתתפות</h3>
              <p>
                כדי להשתתף בפעילות יש להשלים אישור השתתפות ולהכיר את תנאי
                השימוש.
              </p>
            </div>
            <Link href={paths.entry} className="text-link">
              לאישור ההשתתפות <Icon name="left" size={18} />
            </Link>
          </div>
        </section>
        <FaqSection />
        <ContactSection />
      </>
    );

  if (slug === "ימי-הולדת")
    return (
      <>
        <PageHero
          eyebrow="ימי הולדת ואירועים"
          title="ימי הולדת בנינג׳ה סטאר"
          description="ימי הולדת עם פעילות במתקנים, הפעלה, כיבוד וטקס עוגה. לתיאום בוחרים את אחד משלושת הסניפים."
          image="/images/hero.jpg"
        >
          <a href="#enquiry" className="button button-red">
            <Icon name="cake" size={18} />
            בואו נתכנן את החגיגה
          </a>
        </PageHero>
        <section className="section container birthday-intro">
          <div>
            <h2>
              חוגגים עם <span>הצוות</span>
            </h2>
            <p>
              הצוות שלנו מקבל את החברים בחיוך, מלווה את המשחקים ומנחה את טקס
              העוגה. בחרו סניף כדי לתאם את פרטי החגיגה.
            </p>
            <div className="birthday-branch-links">
              {branches.map((b) => (
                <a key={b.id} href="#enquiry">
                  <Icon name="pin" size={15} />
                  {b.name}
                </a>
              ))}
            </div>
          </div>
          <div className="birthday-intro-photo">
            <Image
              src="/images/birthday.jpg"
              alt="כיבוד בחגיגת יום הולדת בנינג׳ה סטאר"
              fill
              sizes="(max-width: 750px) 90vw, 45vw"
            />
            <NinjaStar className="intro-star" />
          </div>
        </section>
        <section className="package-section">
          <div className="container">
            <SectionHeading title="מה כוללת החגיגה?" />
            <div className="package-grid">
              {[
                {
                  icon: "zap" as const,
                  title: "פעילות במתחמים",
                  text: "כניסה למתחמי הפעילות הכלולים בחבילה.",
                },
                {
                  icon: "users" as const,
                  title: "הפעלה עם הצוות",
                  text: "משחקים ואתגרים בהנחיית הצוות שלנו.",
                },
                {
                  icon: "cake" as const,
                  title: "כיבוד וטקס עוגה",
                  text: "כיבוד לחברים וטקס עוגה בהנחיית הצוות.",
                },
                {
                  icon: "sparkles" as const,
                  title: "הזמנות מעוצבות",
                  text: "הזמנות נינג׳ה סטאר לקראת החגיגה.",
                },
              ].map((p) => (
                <div key={p.title}>
                  <Icon name={p.icon} size={32} />
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
            <p className="fine-print">
              תיאור כללי על בסיס האתר הקיים. הרכב החבילה, המחיר והתנאים הסופיים
              בתיאום עם הסניף.
            </p>
          </div>
        </section>
        <ContactSection birthday />
        <FaqSection />
      </>
    );

  if (slug === "עבודה-במתחם")
    return (
      <>
        <PageHero
          eyebrow="עבודה במתחם"
          title="עבודה בנינג׳ה סטאר"
          description="רוצים להצטרף לצוות? השאירו פרטים וציינו באיזה סניף תרצו לעבוד."
        />
        <section className="section container narrow recruitment-section">
          <LeadForm variant="recruitment" />
        </section>
      </>
    );

  if (slug === "enter")
    return (
      <>
        <PageHero
          eyebrow="אישור השתתפות"
          title="אישור השתתפות"
          description="מכירים את תנאי ההשתתפות ומגיעים מוכנים לביקור."
        />
        <section className="section container narrow">
          <EntryDemo />
        </section>
      </>
    );

  if (slug === "הצהרת-נגישות")
    return (
      <>
        <PageHero
          eyebrow="נגישות"
          title="נגישות באתר ובסניפים"
          description="מידע על נגישות האתר והסניפים ודרכי יצירת קשר."
        />
        <section className="section container narrow prose">
          <h2>נגישות באתר ההדגמה</h2>
          <p>
            האתר כולל ניווט באמצעות מקלדת, קישור לדילוג לתוכן, כותרות מובנות,
            תוויות לשדות טופס ותמיכה בהעדפת תנועה מופחתת. התאמות אלו נבדקות כחלק
            מפיתוח האתר; הצהרה מלאה תושלם לפני העלייה לאוויר.
          </p>
          <h2>נגישות בסניפים</h2>
          <p>
            באתר הקיים מפורסם מידע על מעלית, בית שימוש נגיש, ריהוט נגיש ועמדת
            שירות נגישה. לבירור התאמות בסניף מסוים לפני הביקור יש לפנות לצוות.
          </p>
          <h2>יצירת קשר</h2>
          <p>איש הקשר בנושא נגישות באתר הקיים: אדי.</p>
          <a href="mailto:ninjastar.rehovot@gmail.com">
            ninjastar.rehovot@gmail.com
          </a>
          <p>
            <a href={contact.phoneHref} dir="ltr">
              {contact.phone}
            </a>
          </p>
        </section>
      </>
    );

  notFound();
}
