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

/** Where contributions go. Change this if the project moves repos. */
export const REPO_URL = "https://github.com/SecretUnicorns/stockpairs";

/** Opens the "Suggest a pair" issue form. */
export const suggestPairUrl = `${REPO_URL}/issues/new?template=suggest-pair.yml`;

/** Opens the "Report a correction" form with the pair already filled in. */
export function correctionUrl(symbol: string): string {
  const params = new URLSearchParams({
    template: "correction.yml",
    title: `Correction: $${symbol}`,
    pair: symbol.toLowerCase(),
  });
  return `${REPO_URL}/issues/new?${params}`;
}
