/** One candle: prices in USD, `time` in seconds since 1970 (UTC). */
export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

/**
 * Merges candles into bigger ones, e.g. hourly into 4-hour or daily.
 * Expects candles oldest first.
 */
export function aggregate(candles: Candle[], seconds: number): Candle[] {
  const merged: Candle[] = [];
  for (const candle of candles) {
    const time = Math.floor(candle.time / seconds) * seconds;
    const last = merged.at(-1);
    if (last && last.time === time) {
      last.high = Math.max(last.high, candle.high);
      last.low = Math.min(last.low, candle.low);
      last.close = candle.close;
    } else {
      merged.push({ ...candle, time });
    }
  }
  return merged;
}

export type Trend = {
  /** Closing prices, oldest first, one per 4 hours. */
  points: number[];
  /** Percent change over the period. */
  change: number;
};

const WEEK = 7 * 24 * 60 * 60;

/** The last 7 days as a small series for a sparkline. */
export function weekTrend(hourly: Candle[] | null): Trend | null {
  const newest = hourly?.at(-1);
  if (!hourly || !newest) return null;
  const week = aggregate(
    hourly.filter((c) => c.time > newest.time - WEEK),
    4 * 60 * 60,
  );
  if (week.length < 2) return null;
  return {
    points: week.map((c) => c.close),
    change: (newest.close / week[0].open - 1) * 100,
  };
}
