import type { MetadataRoute } from "next";
import { pairs, pairSlug } from "@/lib/pairs";
import { SITE_URL } from "@/lib/site";

/** Tells search engines about the board and every pair page. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    ...pairs.map((pair) => ({
      url: `${SITE_URL}/pairs/${pairSlug(pair)}`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];
}
