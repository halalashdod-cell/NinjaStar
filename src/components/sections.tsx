import Image from "next/image";
import Link from "next/link";
import { branches, contact, faqs, paths } from "@/lib/content";
import { Icon, NinjaStar, WhatsAppIcon } from "./icon";
import { LeadForm } from "./lead-form";
import { BrandMark } from "./brand-mark";
import { FaqItem } from "./faq-item";

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-heading" data-reveal>
      <div>
        {eyebrow && (
          <p className="eyebrow">
            <span />
            {eyebrow}
          </p>
        )}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function BirthdayBanner() {
  return (
    <section className="birthday-banner container" data-reveal>
      <div className="birthday-copy">
        <p className="eyebrow light">
          <Icon name="cake" size={18} />
          ימי הולדת ואירועים
        </p>
        <h2>
          יום הולדת
          <br />
          שמגיע <span>לשיאים.</span>
        </h2>
        <p>
          פעילות במתקנים, הפעלה עם הצוות וטקס עוגה עם החברים.
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
      <SectionHeading title="הסניפים שלנו" />
      <div className="branches-grid">
        {branches.map((b) => (
          <article className="branch-card" key={b.id} data-reveal>
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
                  מגלים את הסניף <Icon name="left" size={16} />
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
      <div className="faq-heading" data-reveal>
        <p className="eyebrow">
          <span />
          רגע לפני שקופצים
        </p>
        <h2>
          שאלות <span>נפוצות</span>
        </h2>
        <p>
          לשאלות נוספות אפשר לפנות לצוות.
        </p>
        <a className="text-link" href={contact.phoneHref}>
          <Icon name="phone" size={18} />
          דברו איתנו
        </a>
      </div>
      <div className="faq-list">
        {faqs.map((f) => (
          <FaqItem key={f.question} question={f.question} answer={f.answer} />
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
        <div className="contact-copy" data-reveal>
          <h2>
            צרו <span>קשר</span>
          </h2>
          <p>
            לבירור פרטים על ביקור או לתיאום חגיגה, הצוות שלנו כאן לעזור.
          </p>
          <a className="contact-phone" href={contact.phoneHref}>
            <Icon name="phone" size={24} />
            <span dir="ltr">{contact.phone}</span>
          </a>
          <a className="contact-mail" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <a
            className="contact-whatsapp"
            href={contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            כתבו לנו בוואטסאפ
          </a>
          <NinjaStar className="contact-star" />
        </div>
        <LeadForm
          initialBranch={initialBranch}
          variant={birthday ? "birthday" : "visit"}
        />
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
            <p>נינג׳ה, טרמפולינות וימי הולדת.</p>
          </div>
          <div>
            <h3>מגלים את נינג׳ה סטאר</h3>
            <Link href={paths.attractions}>המתקנים שלנו</Link>
            <Link href={paths.birthdays}>ימי הולדת ואירועים</Link>
            <Link href={paths.pricing}>מחירון כניסה</Link>
            <Link href="/#contact">צרו קשר</Link>
            <Link href={paths.recruitment}>עבודה במתחם</Link>
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
          </div>
        </div>
      </footer>
      <a
        className="floating-contact"
        href={contact.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="פתיחת שיחה בוואטסאפ"
      >
        <WhatsAppIcon size={25} />
        <span>דברו איתנו</span>
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
        <h1>{title}</h1>
        <p className="page-hero-description">{description}</p>
        {children}
      </div>
      <NinjaStar className="page-hero-star" />
    </section>
  );
}
