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

/** Text colour class for a price move: up, down, or flat/unknown. */
export function changeTone(value: number | null): string {
  if (value === null || value === 0) return "text-muted";
  return value > 0 ? "text-up" : "text-down";
}

// Fixed to UTC so the server and every visitor see the same date.
const date = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function formatDate(ms: number | null): string {
  return ms === null ? MISSING : date.format(ms);
}

/** `8RVBk8vx…EGkS` → `8RVB…EGkS`, `0xbe98b7…7401` → `0xbe98…7401`. */
export function shortAddress(address: string): string {
  const head = address.startsWith("0x") ? 6 : 4;
  return `${address.slice(0, head)}…${address.slice(-4)}`;
}

/** How long ago `ms` was, compactly: "5h", "39d". */
export function formatAge(ms: number | null, now: number): string {
  if (ms === null) return MISSING;
  const hours = Math.max(0, Math.floor((now - ms) / 3_600_000));
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
}
