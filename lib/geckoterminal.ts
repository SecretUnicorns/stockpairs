import type { Candle } from "@/lib/candles";
import type { Chain } from "@/lib/pairs";

const API = "https://api.geckoterminal.com/api/v2";
// Charts don't need to be as fresh as prices, and the free API allows
// about 30 calls a minute (we make two per pair), so share each chart for
// five minutes.
const REVALIDATE_SECONDS = 300;
// 30 days of hourly candles in one call; the chart groups them into
// 4-hour and daily candles itself.
const HOURS = 720;
// Daily candles back to the pool's creation, for the "all" range. 1000 is
// the API's maximum, almost three years.
const DAYS = 1000;
// How long to wait before the one retry when GeckoTerminal is busy.
const RETRY_DELAY_MS = 1500;

const networks: Record<Chain, string> = {
  solana: "solana",
  robinhood: "robinhood",
};

export type ChartCandles = {
  /** The last 30 days, one candle per hour. */
  hourly: Candle[] | null;
  /** Everything since the pool was created, one candle per day. */
  daily: Candle[] | null;
};

/**
 * USD candles for `tokenAddress` in the given pool, oldest first.
 *
 * `token` picks which side of the pool to price, so the MEME/AMC pool gives
 * MEME's price, not AMC's. Solana addresses are case-sensitive here, so pass
 * the pool address as DexScreener returns it, not from the lowercased URL.
 *
 * Never throws: a series is null if GeckoTerminal is down or rate-limited.
 */
export async function getChartCandles(
  chain: Chain,
  poolAddress: string,
  tokenAddress: string,
): Promise<ChartCandles> {
  const [hourly, daily] = await Promise.all([
    getHourlyCandles(chain, poolAddress, tokenAddress),
    fetchCandles(
      `${ohlcvUrl(chain, poolAddress)}/day?limit=${DAYS}&token=${tokenAddress}`,
    ),
  ]);
  return { hourly, daily };
}

/**
 * Just the hourly candles, for the board's sparklines. Same URL as the pair
 * page uses, so both share one cached response instead of two API calls.
 */
export function getHourlyCandles(
  chain: Chain,
  poolAddress: string,
  tokenAddress: string,
): Promise<Candle[] | null> {
  return fetchCandles(
    `${ohlcvUrl(chain, poolAddress)}/hour?limit=${HOURS}&token=${tokenAddress}`,
  );
}

function ohlcvUrl(chain: Chain, poolAddress: string): string {
  return `${API}/networks/${networks[chain]}/pools/${poolAddress}/ohlcv`;
}

async function fetchCandles(url: string): Promise<Candle[] | null> {
  // The free API answers 429 when too many requests arrive at once, e.g.
  // while a deploy builds every page. One short pause usually clears it.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (res.ok) return toCandles(await res.json());
      const busy = res.status === 429 || res.status >= 500;
      if (!busy) return null;
    } catch {
      // Network hiccup: worth one more try too.
    }
    if (attempt === 1) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
  return null;
}

function toCandles(body: unknown): Candle[] {
  const list: number[][] =
    (body as { data?: { attributes?: { ohlcv_list?: number[][] } } })?.data
      ?.attributes?.ohlcv_list ?? [];
  return list
    .map(([time, open, high, low, close]) => ({
      time,
      open,
      high,
      low,
      close,
    }))
    .reverse();
}
