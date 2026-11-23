import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { attractions, branches, contact, paths, routeSlugs } from "@/lib/content";
import { Icon, NinjaStar } from "@/components/icon";
import { AttractionExplorer, EntryDemo, PricingCards } from "@/components/interactive";
import { AttractionCard } from "@/components/photo-card";
import { ContactSection, FaqSection, PageHero, RelatedAttractions, SectionHeading } from "@/components/sections";

export function generateStaticParams() { return routeSlugs.map(slug => ({ slug })); }
// Permit runtime resolution of percent-encoded Hebrew paths as well as prerendered URLs.
export const dynamicParams = true;

function normalizedSlug(slug: string) {
  try { return decodeURIComponent(slug); } catch { return ""; }
}

const specialPages: Record<string, { title: string; description: string }> = {
  "המתקנים-שלנו": { title: "המתקנים שלנו", description: "מסלולי נינג׳ה, טרמפולינות, קירות טיפוס, בריכות כדורים ועוד. גלו את המתקנים ובחרו את האתגר הבא שלכם." },
  "ימי-הולדת": { title: "ימי הולדת ואירועים", description: "חוגגים יום הולדת בנינג׳ה סטאר עם החברים, הפעילויות והכיף. חבילות יום הולדת בסניפי רחובות, אשדוד והוד השרון." },
  "מחירון-כניסה": { title: "מחירון כניסה", description: "מחירי הכניסה לנינג׳ה סטאר: כניסה לשעתיים, חבילות עם קיר טיפוס וכרטיסיות. בחרו סניף ותכננו את הביקור." },
  "enter": { title: "אישור השתתפות", description: "מידע לקראת הביקור ואישור השתתפות במתקני נינג׳ה סטאר. מסך הדגמה בלבד." },
  "הצהרת-נגישות": { title: "נגישות", description: "מידע על הנגישות באתר ובסניפי נינג׳ה סטאר ודרכי יצירת קשר בנושא נגישות." },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = normalizedSlug((await params).slug);
  const branch = branches.find(b => b.slug === slug);
  const attraction = attractions.find(a => a.slug === slug);
  const details = branch ? { title: `נינג׳ה סטאר ${branch.name}`, description: branch.description } : attraction ? { title: attraction.title, description: attraction.description } : specialPages[slug];
  if (!details) return {};
  return { ...details, alternates: { canonical: `/${slug}/` }, openGraph: { title: details.title, description: details.description, url: `/${slug}/`, images: [{ url: branch?.image || attraction?.image || "/images/park.jpg" }] } };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = normalizedSlug((await params).slug);
  const branch = branches.find(b => b.slug === slug);
  if (branch) return <>
    <PageHero eyebrow={`הסניפים שלנו · ${branch.name}`} title={`הכיף שלכם,\nב${branch.name}.`} description={branch.description} image={branch.image}><div className="hero-actions"><a href={branch.waze} target="_blank" rel="noopener noreferrer" className="button button-red"><Icon name="navigation" size={18} />נווטו אלינו</a><a href="#contact" className="button button-glass">מתכננים ביקור</a></div></PageHero>
    <div className="container branch-info-strip"><div><Icon name="pin" size={24} /><div><strong>{branch.label}</strong><span>{branch.address}</span><small>{branch.location}</small></div></div><div><Icon name="clock" size={24} /><div><strong>מתי קופצים?</strong><span>א׳–ה׳ <bdi>16:00–20:00</bdi> · ו׳ <bdi>13:00–17:00</bdi></span><small>שבתות, חגים וחופשים <bdi>{branch.weekend}</bdi></small></div></div><div><Icon name="phone" size={24} /><div><strong>אנחנו כאן בשבילכם</strong><a href={contact.phoneHref} dir="ltr">{contact.phone}</a><small>מומלץ לברר שעות וזמינות לפני הגעה</small></div></div></div>
    <section className="section container"><SectionHeading eyebrow={`נפגשים ב${branch.name}`} title="מה מחכה לכם כאן?"><Link href={paths.pricing} className="text-link">למחירון הכניסה <Icon name="ticket" size={18} /></Link></SectionHeading><div className="attraction-grid">{attractions.filter(a => branch.attractions.includes(a.id)).map(a => <AttractionCard attraction={a} key={a.id} />)}</div><p className="fine-print">תמונות מרשת נינג׳ה סטאר. התאמת גיל וזמינות הפעילויות בבירור מול הסניף.</p></section>
    <section className="container branch-birthday"><Icon name="cake" size={42} /><div><h2>יש יום הולדת באופק?</h2><p>בואו להפוך את היום שלכם לחגיגה מלאה באקשן.</p></div><Link href={paths.birthdays} className="button button-blue">מגלים את החבילות</Link></section><ContactSection initialBranch={branch.id} /></>;

  const attraction = attractions.find(a => a.slug === slug);
  if (attraction) return <><PageHero eyebrow="המתקנים שלנו" title={attraction.title} description={attraction.description} image={attraction.image}><a href="#where" className="button button-red"><Icon name="pin" size={18} />באיזה סניף נפגשים?</a></PageHero><section className="section container attraction-details"><div><p className="eyebrow"><span />{attraction.tag}</p><h2>{attraction.label}</h2><p>{attraction.description}</p><ul className="check-list">{attraction.details.map(d => <li key={d}><Icon name="check" size={19} />{d}</li>)}</ul><p className="fine-print">התאמת גיל ותנאי השימוש נקבעים בהתאם למתקן ולהנחיות הסניף.</p></div><div className="where-card" id="where"><Icon name="pin" size={28} /><h3>כאן אפשר ליהנות מהמתקן</h3>{branches.filter(b => b.attractions.includes(attraction.id)).map(b => <Link href={`/${b.slug}/`} key={b.id}><span>{b.name}<small>{b.label}</small></span><Icon name="plus" size={19} /></Link>)}<Link className="text-link" href={paths.pricing}>למחירון הכניסה</Link></div></section><RelatedAttractions exclude={attraction.id} /><ContactSection /></>;

  if (slug === "המתקנים-שלנו") return <><PageHero eyebrow="המתקנים שלנו" title={"כל אחד\nוהאתגר שלו."} description="קפיצות, טיפוס, מסלולי נינג׳ה ומשחקים. בוחרים את מה שאוהבים, ומגלים עוד משהו בדרך." /><section className="section container"><AttractionExplorer /></section><FaqSection /><ContactSection /></>;

  if (slug === "מחירון-כניסה") return <><PageHero eyebrow="מחירון כניסה" title={"בוחרים חוויה.\nמתחילים לקפוץ."} description="כל מה שצריך לדעת כדי לתכנן את הביקור הבא שלכם." /><section className="section container pricing-section"><PricingCards /><div className="extras-grid"><div><Icon name="ticket" size={29} /><h3>עוד ביקור ועוד חיוך</h3><p>כרטיסייה ל־10 כניסות <strong>₪490</strong></p><p>כרטיסייה ל־10 כניסות עם קיר טיפוס <strong>₪560</strong></p></div><div><Icon name="zap" size={29} /><h3>מוסיפים סיבוב</h3><p>מכוניות מתנגשות בסניף אשדוד <strong>₪15</strong></p><p className="fine-print">פעילות בתשלום נפרד, בהתאם לזמינות.</p></div></div><div className="pricing-important"><Icon name="sparkles" size={22} /><p>הורה מלווה אינו משלם. הכניסה למתקנים עם גרביים נגד החלקה — אפשר לרכוש בקופות. המחירים מבוססים על האתר הקיים ויש לאשרם מול הסניף.</p></div><div className="entry-link-panel"><Icon name="shield" size={26} /><div><h3>רגע לפני הביקור</h3><p>כדי להשתתף בפעילות יש להשלים אישור השתתפות ולהכיר את תנאי השימוש.</p></div><Link href={paths.entry} className="text-link">לאישור ההשתתפות <Icon name="plus" size={18} /></Link></div></section><FaqSection /><ContactSection /></>;

  if (slug === "ימי-הולדת") return <><PageHero eyebrow="ימי הולדת ואירועים" title={"היום שלכם.\nהחוויה של כולם."} description="החברים הכי טובים, האתגרים הכי כיפיים, וחגיגה שעוד ידברו עליה. בואו לחגוג יום הולדת בנינג׳ה סטאר." image="/images/hero.jpg"><a href="#enquiry" className="button button-red"><Icon name="cake" size={18} />בואו נתכנן את החגיגה</a></PageHero><section className="section container birthday-intro"><div><p className="eyebrow"><span />חוגגים, משחקים, נהנים</p><h2>את הנרות מכבים.<br />את האנרגיה <span>משחררים.</span></h2><p>מסלולי נינג׳ה, טרמפולינות ומשחקים עם כל החברים. הצוות יעזור להתאים את הפעילות לגיל הילדים ולבנות חגיגה בסניף שבחרתם.</p><div className="birthday-branch-links">{branches.map(b => <a key={b.id} href="#enquiry"><Icon name="pin" size={15} />{b.name}</a>)}</div></div><div className="birthday-intro-photo"><Image src="/images/birthday.jpg" alt="כיבוד בחגיגת יום הולדת בנינג׳ה סטאר" fill sizes="(max-width: 750px) 90vw, 45vw" /><NinjaStar className="intro-star" /></div></section><section className="package-section"><div className="container"><SectionHeading eyebrow="החבילה שעושה את החגיגה" title="כל הדברים שילדים אוהבים." /><div className="package-grid">{[{ icon: "zap" as const, title: "פעילות במתחמים", text: "כניסה למתחמי הפעילות הכלולים בחבילה." }, { icon: "users" as const, title: "הפעלה עם הצוות", text: "פעילות לבחירה בהתאמה לגיל החוגגים." }, { icon: "cake" as const, title: "כיבוד וטקס עוגה", text: "חטיפים, פיצה, שתייה ורגע של משאלות." }, { icon: "sparkles" as const, title: "הזמנות מעוצבות", text: "הזמנות נינג׳ה סטאר לקראת החגיגה." }].map(p => <div key={p.title}><Icon name={p.icon} size={32} /><h3>{p.title}</h3><p>{p.text}</p></div>)}</div><p className="fine-print">תיאור כללי על בסיס האתר הקיים. הרכב החבילה, המחיר והתנאים הסופיים בתיאום עם הסניף.</p></div></section><ContactSection birthday /><FaqSection /></>;

  if (slug === "enter") return <><PageHero eyebrow="אישור השתתפות" title="לפני שקופצים." description="מכירים את תנאי ההשתתפות ומגיעים מוכנים לביקור." /><section className="section container narrow"><EntryDemo /></section></>;

  if (slug === "הצהרת-נגישות") return <><PageHero eyebrow="נגישות" title="כיף שכולם חלק ממנו." description="מידע על נגישות האתר והסניפים ודרכי יצירת קשר." /><section className="section container narrow prose"><h2>נגישות באתר ההדגמה</h2><p>האתר כולל ניווט באמצעות מקלדת, קישור לדילוג לתוכן, כותרות מובנות, תוויות לשדות טופס ותמיכה בהעדפת תנועה מופחתת. התאמות אלו נבדקות כחלק מפיתוח האתר; הצהרה מלאה תושלם לפני העלייה לאוויר.</p><h2>נגישות בסניפים</h2><p>באתר הקיים מפורסם מידע על מעלית, בית שימוש נגיש, ריהוט נגיש ועמדת שירות נגישה. לבירור התאמות בסניף מסוים לפני הביקור יש לפנות לצוות.</p><h2>יצירת קשר</h2><p>איש הקשר בנושא נגישות באתר הקיים: אדי.</p><a href="mailto:ninjastar.rehovot@gmail.com">ninjastar.rehovot@gmail.com</a><p><a href={contact.phoneHref} dir="ltr">{contact.phone}</a></p></section></>;

  notFound();
}
