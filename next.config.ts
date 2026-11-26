import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  devIndicators: false,
  async redirects() {
    return [
      {
        source: encodeURI("/על-המתחם/"),
        destination: encodeURI("/סניף-אשדוד/"),
        permanent: true,
      },
      ...[
        "המתקנים-שלנו",
        "ninja-park-נינגה-פארק",
        "מתחם-הטרמפולינות",
        "קיר-טיפוס",
        "וויט-פול",
      ].map((slug) => ({
        source: encodeURI(`/${slug}/`),
        destination: "/#facilities",
        permanent: true,
      })),
      ...["מכוניות-מתנגשות", "מגרש-גימבורי-לילדים", "בור-הגומי"].map(
        (slug) => ({
          source: encodeURI(`/${slug}/`),
          destination: encodeURI("/סניף-אשדוד/#facilities"),
          permanent: true,
        }),
      ),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
