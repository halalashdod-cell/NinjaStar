export const paths = {
  attractions: "/#facilities",
  birthdays: "/ימי-הולדת/",
  pricing: "/מחירון-כניסה/",
  recruitment: "/עבודה-במתחם/",
  entry: "/enter/",
  accessibility: "/הצהרת-נגישות/",
};

export const contact = {
  phone: "08-8565537",
  phoneHref: "tel:+97288565537",
  email: "Halal.ashdod@gmail.com",
  whatsappHref: "https://wa.me/972533221496?text=%D7%94%D7%99%D7%99",
};

export const branches = [
  {
    id: "rehovot",
    name: "רחובות",
    slug: "סניף-רחובות",
    label: "אמריקן סיטי",
    address: "דרך הים 1, מתחם אמריקן סיטי, רחובות",
    location: "קומה 2, צמוד להולמס פלייס",
    image: "/images/park.jpg",
    imageAlt: "ילדים נהנים במתקני רשת נינג׳ה סטאר",
    description:
      "סניף רחובות נמצא במתחם אמריקן סיטי וכולל מסלול נינג׳ה, טרמפולינות, קירות טיפוס ובריכת כדורים.",
    attractions: ["ninja", "trampolines", "climbing", "ball-pool"],
    waze: "https://ul.waze.com/ul?preview_venue_id=22806847.228002934.575211&navigate=yes",
    weekend: "10:00–20:00",
  },
  {
    id: "ashdod",
    name: "אשדוד",
    slug: "על-המתחם",
    label: "קניון בימול",
    address: "קניון בימול, אזור התעשייה עד הלום, אשדוד",
    location: "קומה 2",
    image: "/images/ninja.jpg",
    imageAlt: "מסלול נינג׳ה ברשת נינג׳ה סטאר",
    description:
      "בסניף אשדוד שבקניון בימול תמצאו מסלול נינג׳ה, טרמפולינות, קירות טיפוס, בריכות כדורים וספוגים, ג׳ימבורי ומכוניות מתנגשות.",
    attractions: [
      "ninja",
      "trampolines",
      "climbing",
      "ball-pool",
      "cars",
      "kids",
      "foam",
    ],
    waze: "https://ul.waze.com/ul?place=ChIJJcHQl8CiAhURNpDNGYQ4xBk&ll=31.76643590%2C34.66547550&navigate=yes",
    weekend: "10:00–18:30",
  },
  {
    id: "hod-hasharon",
    name: "הוד השרון",
    slug: "סניף-הוד-השרון",
    label: "MEEX שרונים",
    address: "הרקון 2, מתחם MEEX שרונים, הוד השרון",
    location: "קומה 1, שער צהוב",
    image: "/images/hero.jpg",
    imageAlt: "זירת טרמפולינות ברשת נינג׳ה סטאר",
    description:
      "בסניף הוד השרון שבמתחם MEEX שרונים יש מסלול נינג׳ה, טרמפולינות, קירות טיפוס ובריכת כדורים.",
    attractions: ["ninja", "trampolines", "climbing", "ball-pool"],
    waze: "https://ul.waze.com/ul?preview_venue_id=22872385.228723853.4296&navigate=yes",
    weekend: "10:00–20:00",
  },
];

export const attractions = [
  {
    id: "ninja",
    slug: "ninja-park-נינגה-פארק",
    title: "נינג׳ה פארק",
    image: "/images/ninja.jpg",
    tag: "מסלול מכשולים",
    description:
      "מסלול נינג׳ה עם מכשולי מעבר, אחיזה ושיווי משקל. אפשר להתקדם בין האתגרים ולנסות כל מכשול בקצב שלכם.",
    details: [
      "מסלול מכשולים מגוון",
      "אתגרי שיווי משקל ואחיזה",
    ],
  },
  {
    id: "trampolines",
    slug: "מתחם-הטרמפולינות",
    title: "טרמפולינות",
    image: "/images/hero.jpg",
    tag: "קופצים גבוה",
    description:
      "זירת טרמפולינות לקפיצה ולמשחק משותף. הכניסה עם גרביים נגד החלקה ובהתאם להנחיות הצוות במקום.",
    details: [
      "זירת טרמפולינות רחבה",
      "בילוי פעיל עם המשפחה והחברים",
      "כניסה עם גרביים נגד החלקה",
    ],
  },
  {
    id: "climbing",
    slug: "קיר-טיפוס",
    title: "קיר טיפוס",
    image: "/images/climbing.jpg",
    tag: "קירות טיפוס",
    description:
      "קירות טיפוס עם נקודות אחיזה צבעוניות. הפעילות בהתאם להנחיות הצוות, וניתן לבחור כרטיס כניסה הכולל קיר טיפוס.",
    details: [
      "אתגרי טיפוס צבעוניים",
      "הפעילות בהתאם להנחיות הצוות",
      "ניתן לבחור כניסה הכוללת קיר טיפוס",
    ],
  },
  {
    id: "ball-pool",
    slug: "וויט-פול",
    title: "בריכת כדורים",
    image: "/images/park.jpg",
    tag: "וויט פול",
    description:
      "בריכת כדורים לבנה למשחק עם המשפחה והחברים.",
    details: [
      "בריכת כדורים לבנה",
      "משחק משותף עם המשפחה והחברים",
    ],
  },
  {
    id: "cars",
    slug: "מכוניות-מתנגשות",
    title: "מכוניות מתנגשות",
    image: "/images/cars.jpg",
    tag: "בסניף אשדוד",
    description:
      "מתחם מכוניות מתנגשות בסניף אשדוד. הפעילות בתשלום נפרד לפי המחירון.",
    details: [
      "הפעילות בסניף אשדוד",
      "תשלום נפרד לפי המחירון",
      "השימוש בהתאם להנחיות המפעילים",
    ],
  },
  {
    id: "kids",
    slug: "מגרש-גימבורי-לילדים",
    title: "ג׳ימבורי לילדים",
    image: "/images/kids.jpg",
    tag: "בסניף אשדוד",
    description:
      "משחקיית ג׳ימבורי בסניף אשדוד, עם מקום לזחילה, משחק וגילוי לקטנטנים.",
    details: [
      "משחקיית ג׳ימבורי",
      "זמן משחק לקטנטנים",
      "הצוות בסניף ישמח להמליץ על הפעילות המתאימה",
    ],
  },
  {
    id: "foam",
    slug: "בור-הגומי",
    title: "בריכת ספוגים",
    image: "/images/foam.jpg",
    tag: "בסניף אשדוד",
    description:
      "בריכת קוביות ספוג בסניף אשדוד. הצוות במקום מסביר כיצד להשתמש במתקן.",
    details: [
      "בריכת קוביות ספוג",
      "פעילות לפי הנחיות הצוות",
      "זמינות הפעילות בבירור מול הסניף",
    ],
  },
];

export const prices = [
  {
    title: "כניסה לפעוטות",
    subtitle: "כניסה לשעתיים · מתחת לגיל 3",
    value: 50,
    features: ["זמן משחק של שעתיים", "הורה מלווה ללא תשלום"],
    popular: false,
  },
  {
    title: "כניסה למתחם",
    subtitle: "כניסה לשעתיים · מעל גיל 3",
    value: 70,
    features: ["זמן פעילות של שעתיים", "מגוון המתקנים במתחם"],
    popular: true,
  },
  {
    title: "כניסה עם קיר טיפוס",
    subtitle: "מעל גיל 3 · כולל קיר טיפוס",
    value: 80,
    features: ["זמן פעילות של שעתיים", "כניסה למתחם קירות הטיפוס"],
    popular: false,
  },
];

export const faqs = [
  {
    question: "צריך להזמין מראש?",
    answer:
      "לביקור משפחתי מומלץ ליצור קשר עם הסניף ולברר זמינות לפני ההגעה. ימי הולדת ואירועים מתאמים מראש עם הצוות.",
  },
  {
    question: "מה צריך להביא?",
    answer:
      "מגיעים עם בגדים נוחים וגרביים נגד החלקה. ניתן לרכוש גרביים בקופות. לפני הפעילות יש להשלים אישור השתתפות ולהקשיב להנחיות הצוות.",
  },
  {
    question: "האם הורה מלווה משלם?",
    answer:
      "לפי המחירון באתר הקיים, הורה מלווה אינו משלם.",
  },
  {
    question: "יש פעילויות שמתאימות לילדים קטנים?",
    answer:
      "ברשת יש אזורים לקטנטנים, ובסניף אשדוד גם משחקיית ג׳ימבורי. הצוות בסניף ישמח לכוון אתכם לפעילות המתאימה.",
  },
  {
    question: "אפשר לחגוג יום הולדת?",
    answer:
      "כן! אפשר לתאם חגיגת יום הולדת עם פעילות במתחם, הפעלה וכיבוד. החבילה והזמינות משתנות בין הסניפים — צוות הסניף יעזור להתאים את החגיגה.",
  },
];

export const routeSlugs = [
  ...branches.map((b) => b.slug),
  ...Object.values(paths)
    .filter((path) => !path.includes("#"))
    .map((path) => path.slice(1, -1)),
];
