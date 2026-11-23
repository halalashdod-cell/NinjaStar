import Image from "next/image";
import Link from "next/link";
import { branches, attractions, contact, faqs, paths } from "@/lib/content";
import { Icon, NinjaStar } from "./icon";
import { LeadForm } from "./lead-form";
import { AttractionCard } from "./photo-card";
import { BrandMark } from "./brand-mark";

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span />
          {eyebrow}
        </p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function BranchPicker() {
  return (
    <div className="branch-picker container">
      <div className="branch-picker-title">
        <Icon name="pin" size={28} />
        <div>
          <strong>איפה נפגשים?</strong>
          <span>שלושה סניפים. אינסוף חוויות.</span>
        </div>
      </div>
      {branches.map((b) => (
        <Link href={`/${b.slug}/`} key={b.id}>
          <div>
            <strong>{b.name}</strong>
            <span>{b.label}</span>
          </div>
          <Icon name="plus" size={22} />
        </Link>
      ))}
    </div>
  );
}

export function BirthdayBanner() {
  return (
    <section className="birthday-banner container">
      <div className="birthday-copy">
        <p className="eyebrow light">
          <Icon name="cake" size={18} />
          כאן חוגגים קצת אחרת
        </p>
        <h2>
          יום הולדת
          <br />
          שמגיע <span>לשיאים.</span>
        </h2>
        <p>
          החברים, האתגרים והרגע הזה שכולם זוכרים.
          <br />
          אתם מביאים את העוגה, אנחנו מביאים את האקשן.
        </p>
        <Link href={paths.birthdays} className="button button-white">
          בואו נתכנן את החגיגה
          <Icon name="cake" size={18} />
        </Link>
      </div>
      <div className="birthday-photo">
        <Image
          src="/images/park.jpg"
          alt="ילדים משחקים יחד בנינג׳ה סטאר"
          fill
          sizes="(max-width: 750px) 100vw, 50vw"
        />
        <div className="birthday-sticker">
          <NinjaStar />
          <span>
            היום
            <br />
            כולו שלכם!
          </span>
        </div>
      </div>
      <NinjaStar className="birthday-decoration" />
    </section>
  );
}

export function BranchesSection() {
  return (
    <section className="section container" id="branches">
      <SectionHeading
        eyebrow="קרובים אליכם, רחוקים מהשגרה"
        title="הסניף שלכם. הכיף של כולם."
      >
        <p>
          בחרו את המקום שבו
          <br />
          מתחילה ההרפתקה הבאה.
        </p>
      </SectionHeading>
      <div className="branches-grid">
        {branches.map((b) => (
          <article className="branch-card" key={b.id}>
            <Link href={`/${b.slug}/`} className="branch-image">
              <Image
                src={b.image}
                alt={b.imageAlt}
                fill
                sizes="(max-width: 650px) 90vw, 33vw"
              />
              <span className="branch-image-label">
                <Icon name="pin" size={15} />
                {b.label}
              </span>
            </Link>
            <div className="branch-card-copy">
              <Link href={`/${b.slug}/`}>
                <h3>{b.name}</h3>
              </Link>
              <p>{b.address}</p>
              <div className="branch-card-actions">
                <Link href={`/${b.slug}/`} className="text-link">
                  מגלים את הסניף <Icon name="plus" size={16} />
                </Link>
                <a
                  href={b.waze}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="directions-link"
                  aria-label={`ניווט לסניף ${b.name}`}
                >
                  <Icon name="navigation" size={18} />
                  ניווט
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="fine-print">התמונות מציגות מתקנים מרשת נינג׳ה סטאר.</p>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="faq-section section container">
      <div className="faq-heading">
        <p className="eyebrow">
          <span />
          רגע לפני שקופצים
        </p>
        <h2>
          שאלתם?
          <br />
          <span>אז הנה התשובות.</span>
        </h2>
        <p>
          עדיין מתלבטים? אנחנו כאן
          <br />
          כדי לעזור לכם לתכנן את הביקור.
        </p>
        <a className="text-link" href={contact.phoneHref}>
          <Icon name="phone" size={18} />
          דברו איתנו
        </a>
      </div>
      <div className="faq-list">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary>
              {f.question}
              <Icon name="plus" size={20} />
            </summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ContactSection({
  initialBranch,
  birthday = false,
}: {
  initialBranch?: string;
  birthday?: boolean;
}) {
  return (
    <section className="contact-section" id="contact">
      <div
        className="container contact-layout"
        id={birthday ? "enquiry" : undefined}
      >
        <div className="contact-copy">
          <p className="eyebrow">
            <span />
            הכיף שלכם מתחיל כאן
          </p>
          <h2>
            יאללה,
            <br />
            <span>נפגשים?</span>
          </h2>
          <p>
            לביקור משפחתי, ליום הולדת
            <br />
            או ליום כיף שכולם צריכים.
          </p>
          <a className="contact-phone" href={contact.phoneHref}>
            <Icon name="phone" size={24} />
            <span dir="ltr">{contact.phone}</span>
          </a>
          <a className="contact-mail" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <NinjaStar className="contact-star" />
        </div>
        <LeadForm initialBranch={initialBranch} birthday={birthday} />
      </div>
    </section>
  );
}

export function RelatedAttractions({ exclude }: { exclude?: string }) {
  return (
    <section className="section container">
      <SectionHeading eyebrow="לא עוצרים כאן" title="עוד סיבות לחייך">
        <Link href={paths.attractions} className="text-link">
          לכל המתקנים <Icon name="plus" size={17} />
        </Link>
      </SectionHeading>
      <div className="attraction-grid">
        {attractions
          .filter((a) => a.id !== exclude)
          .slice(0, 3)
          .map((a) => (
            <AttractionCard key={a.id} attraction={a} />
          ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <>
      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <Link
              className="brand"
              href="/"
              aria-label="נינג׳ה סטאר — עמוד הבית"
            >
              <BrandMark />
            </Link>
            <p>
              יותר תנועה. יותר ביחד.
              <br />
              הרבה יותר מיום כיף.
            </p>
          </div>
          <div>
            <h3>מגלים את נינג׳ה סטאר</h3>
            <Link href={paths.attractions}>המתקנים שלנו</Link>
            <Link href={paths.birthdays}>ימי הולדת ואירועים</Link>
            <Link href={paths.pricing}>מחירון כניסה</Link>
            <Link href="/#contact">צרו קשר</Link>
          </div>
          <div>
            <h3>הסניפים שלנו</h3>
            {branches.map((b) => (
              <Link key={b.id} href={`/${b.slug}/`}>
                {b.name} · {b.label}
              </Link>
            ))}
          </div>
          <div>
            <h3>נשארים בקשר</h3>
            <a href={contact.phoneHref} dir="ltr">
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <p className="footer-note">
              מחירים ושעות עשויים להשתנות.
              <br />
              מומלץ לברר מול הסניף לפני ההגעה.
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getUTCFullYear()} נינג׳ה סטאר. כל הזכויות שמורות.
          </span>
          <div>
            <Link href={paths.accessibility}>נגישות</Link>
            <span>גרסת הדגמה · ללא איסוף פניות</span>
          </div>
        </div>
      </footer>
      <a className="floating-contact" href="/#contact" aria-label="ליצירת קשר">
        <Icon name="chat" size={25} />
      </a>
    </>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={`page-hero ${image ? "with-image" : ""}`}>
      {image && (
        <>
          <Image
            src={image}
            alt="מתקנים ברשת נינג׳ה סטאר"
            fill
            priority
            sizes="100vw"
          />
          <div className="page-hero-shade" />
        </>
      )}
      <div className="container page-hero-content">
        <nav className="breadcrumbs" aria-label="מיקום באתר">
          <Link href="/">עמוד הבית</Link>
          <span>/</span>
          <span>{eyebrow}</span>
        </nav>
        <p className="eyebrow light">
          <span />
          {eyebrow}
        </p>
        <h1>{title}</h1>
        <p className="page-hero-description">{description}</p>
        {children}
      </div>
      <NinjaStar className="page-hero-star" />
    </section>
  );
}
