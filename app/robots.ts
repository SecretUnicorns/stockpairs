import type { MetadataRoute } from "next";
import { isProduction, SITE_URL } from "@/lib/site";

/**
 * Search engines may index the live site. Preview deployments (one per PR)
 * ask not to be indexed, so they don't compete with it in results.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProduction) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
