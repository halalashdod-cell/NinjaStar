import type { MetadataRoute } from "next";
import { routeSlugs } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap { return ["/", ...routeSlugs.map(s => `/${s}/`)].map(path => ({ url: `https://ninja-star.co.il${path}` })); }
