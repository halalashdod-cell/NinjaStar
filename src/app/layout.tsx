import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/sections";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ninja-star.co.il"),
  title: { default: "נינג׳ה סטאר | קופצים. מטפסים. חוגגים.", template: "%s | נינג׳ה סטאר" },
  description: "נינג׳ה סטאר — עולם של נינג׳ה, טרמפולינות, טיפוס וחוויות לכל המשפחה. סניפים ברחובות, אשדוד והוד השרון. ימי הולדת ובילוי משפחתי.",
  robots: { index: false, follow: false },
  openGraph: { siteName: "נינג׳ה סטאר", locale: "he_IL", type: "website", images: [{ url: "/images/park.jpg", width: 1200, height: 800, alt: "חוויות בנינג׳ה סטאר" }] },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="he" dir="rtl"><body><Header /><main id="main">{children}</main><Footer /></body></html>;
}
