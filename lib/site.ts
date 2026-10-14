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
