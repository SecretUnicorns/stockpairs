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
