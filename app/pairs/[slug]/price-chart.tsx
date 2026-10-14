"use client";

import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import { aggregate, type Candle } from "@/lib/candles";
import { changeTone, formatPercent, formatPrice } from "@/lib/format";

const HOUR = 60 * 60;

/** How far back each range looks, and how big each candle is. */
const ranges = {
  "24h": { span: 24 * HOUR, candle: HOUR },
  "7d": { span: 7 * 24 * HOUR, candle: 4 * HOUR },
  "30d": { span: 30 * 24 * HOUR, candle: 24 * HOUR },
};
type Range = keyof typeof ranges;

function candlesFor(candles: Candle[], range: Range): Candle[] {
  const { span, candle } = ranges[range];
  // Measured from the newest candle, so server and browser agree.
  const since = (candles.at(-1)?.time ?? 0) - span;
  return aggregate(
    candles.filter((c) => c.time > since),
    candle,
  );
}

/**
 * The chart draws on a canvas, which can't use CSS classes, so read the
 * colour tokens from globals.css and hand them over as plain values.
 */
function themeOptions() {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    chart: {
      layout: {
        background: { color: token("--surface") },
        textColor: token("--muted"),
        fontFamily: token("--font-ibm-plex-mono"),
      },
      grid: {
        vertLines: { color: token("--soft") },
        horzLines: { color: token("--soft") },
      },
      rightPriceScale: { borderColor: token("--border") },
      timeScale: { borderColor: token("--border") },
    },
    series: {
      upColor: token("--up"),
      downColor: token("--down"),
      wickUpColor: token("--up"),
      wickDownColor: token("--down"),
      borderVisible: false,
    },
  };
}

export default function PriceChart({ candles }: { candles: Candle[] }) {
  const [range, setRange] = useState<Range>("7d");
  const container = useRef<HTMLDivElement>(null);
  const series = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const chart = useRef<IChartApi | null>(null);

  const visible = useMemo(() => candlesFor(candles, range), [candles, range]);
  const change =
    visible.length > 0
      ? (visible.at(-1)!.close / visible[0].open - 1) * 100
      : null;

  // Create the chart once, and repaint it when the system theme flips.
  useEffect(() => {
    const theme = themeOptions();
    const created = createChart(container.current!, {
      ...theme.chart,
      autoSize: true,
      timeScale: { ...theme.chart.timeScale, timeVisible: true },
    });
    series.current = created.addSeries(CandlestickSeries, {
      ...theme.series,
      priceFormat: { type: "custom", formatter: formatPrice, minMove: 1e-10 },
    });
    chart.current = created;

    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const repaint = () => {
      const next = themeOptions();
      created.applyOptions(next.chart);
      series.current?.applyOptions(next.series);
    };
    dark.addEventListener("change", repaint);
    return () => {
      dark.removeEventListener("change", repaint);
      created.remove();
    };
  }, []);

  // Swap the candles whenever the range changes.
  useEffect(() => {
    series.current?.setData(
      visible.map((c) => ({ ...c, time: c.time as UTCTimestamp })),
    );
    chart.current?.timeScale().fitContent();
  }, [visible]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Chart range" className="flex">
          {(Object.keys(ranges) as Range[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={range === option}
              onClick={() => setRange(option)}
              className="-ml-px cursor-pointer border border-foreground bg-surface px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wider uppercase first:ml-0 hover:bg-orange hover:text-[#17100c] aria-pressed:bg-acid aria-pressed:text-acid-ink"
            >
              {option}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs tracking-widest text-muted uppercase">
          {range}:{" "}
          <span className={`font-semibold ${changeTone(change)}`}>
            {formatPercent(change)}
          </span>
        </p>
      </div>
      <div
        ref={container}
        role="img"
        aria-label={`Price chart, last ${range}`}
        className="h-80 w-full border border-foreground sm:h-96"
      />
    </div>
  );
}
