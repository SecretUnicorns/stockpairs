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
  const pool = `${API}/networks/${networks[chain]}/pools/${poolAddress}/ohlcv`;
  const [hourly, daily] = await Promise.all([
    fetchCandles(`${pool}/hour?limit=${HOURS}&token=${tokenAddress}`),
    fetchCandles(`${pool}/day?limit=${DAYS}&token=${tokenAddress}`),
  ]);
  return { hourly, daily };
}

async function fetchCandles(url: string): Promise<Candle[] | null> {
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const body = await res.json();
    const list: number[][] = body?.data?.attributes?.ohlcv_list ?? [];
    return list
      .map(([time, open, high, low, close]) => ({
        time,
        open,
        high,
        low,
        close,
      }))
      .reverse();
  } catch {
    return null;
  }
}
