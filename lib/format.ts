const MISSING = "—";

// Meme prices can be tiny ($0.0005354), so keep significant digits, not decimals.
const price = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 4,
});

// Big dollar amounts read better short: $2.98M, $341.6K.
const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function formatPrice(value: number | null): string {
  return value === null ? MISSING : price.format(value);
}

export function formatUsd(value: number | null): string {
  return value === null ? MISSING : compactUsd.format(value);
}

export function formatPercent(value: number | null): string {
  return value === null ? MISSING : `${percent.format(value)}%`;
}
