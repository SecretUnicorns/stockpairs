/**
 * The live site's address. Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the
 * production domain (it follows a custom domain if one is added), so this
 * never needs editing. Locally it's the dev server.
 */
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

/** Only production should be in search results, not preview deployments. */
export const isProduction = process.env.VERCEL_ENV === "production";

/**
 * Where people ask to get a token listed or report a mistake: a DM link set
 * as the CONTACT_URL environment variable on Vercel, not in the code, so a
 * personal handle never ends up in the repo. Only https links are used; if
 * it isn't set, the contact links are simply not shown.
 */
export const CONTACT_URL = process.env.CONTACT_URL?.startsWith("https://")
  ? process.env.CONTACT_URL
  : null;
