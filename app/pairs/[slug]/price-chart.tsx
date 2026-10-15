"use client";

import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  PriceScaleMode,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import { aggregate, type Candle } from "@/lib/candles";
import {
  changeTone,
  formatDate,
  formatPercent,
  formatPrice,
  formatUsd,
} from "@/lib/format";

const HOUR = 60 * 60;

/** How far back each range looks, and how big each candle is. */
const ranges = {
  "24h": { span: 24 * HOUR, candle: HOUR },
  "7d": { span: 7 * 24 * HOUR, candle: 4 * HOUR },
  "30d": { span: 30 * 24 * HOUR, candle: 24 * HOUR },
};
type Range = keyof typeof ranges | "all";
const rangeLabels: Record<Range, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  all: "All",
};

/** What the candles show: the token price, or price × supply. */
const modes = { mcap: "Market cap", price: "Price" };
type Mode = keyof typeof modes;

function candlesFor(
  hourly: Candle[],
  daily: Candle[] | null,
  range: Range,
): Candle[] {
  // "All" uses the daily series, which goes back to the pool's creation.
  if (range === "all") return daily ?? [];
  const { span, candle } = ranges[range];
  const candles = hourly;
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

/**
 * `supply` is today's market cap ÷ price. Without it, only price is shown.
 */
export default function PriceChart({
  hourly,
  daily,
  supply,
}: {
  hourly: Candle[];
  daily: Candle[] | null;
  supply: number | null;
}) {
  const [range, setRange] = useState<Range>("7d");
  const [mode, setMode] = useState<Mode>(supply === null ? "price" : "mcap");
  const container = useRef<HTMLDivElement>(null);
  const series = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const chart = useRef<IChartApi | null>(null);

  const visible = useMemo(() => {
    const scale = mode === "mcap" && supply !== null ? supply : 1;
    return candlesFor(hourly, daily, range).map((c) => ({
      time: c.time,
      open: c.open * scale,
      high: c.high * scale,
      low: c.low * scale,
      close: c.close * scale,
    }));
  }, [hourly, daily, range, mode, supply]);
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

  // Swap the candles whenever the range or mode changes.
  useEffect(() => {
    series.current?.applyOptions({
      priceFormat: {
        type: "custom",
        formatter: mode === "mcap" ? formatUsd : formatPrice,
        minMove: 1e-10,
      },
    });
    // Coins can rise thousands of times from launch, which would flatten
    // everything else on a normal scale. A log scale gives every 10× the
    // same height.
    series.current?.priceScale().applyOptions({
      mode:
        range === "all" ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
    });
    series.current?.setData(
      visible.map((c) => ({ ...c, time: c.time as UTCTimestamp })),
    );
    chart.current?.timeScale().fitContent();
  }, [visible, mode, range]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {supply !== null && (
            <Toggle
              label="Chart shows"
              options={modes}
              value={mode}
              onChange={setMode}
            />
          )}
          <Toggle
            label="Chart range"
            options={
              daily && daily.length > 0
                ? rangeLabels
                : { "24h": "24h", "7d": "7d", "30d": "30d" }
            }
            value={range}
            onChange={setRange}
          />
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
        aria-label={`${modes[mode]} chart, last ${range}`}
        className="h-80 w-full border border-foreground sm:h-96"
      />
      {range === "all" && visible.length > 0 && (
        <p className="text-xs text-muted">
          All: daily candles since this pool was created (
          {formatDate(visible[0].time * 1000)}), on a log scale so launch-day
          prices don&apos;t flatten the rest.
        </p>
      )}
      {mode === "mcap" && (
        <p className="text-xs text-muted">
          Market cap = price × today&apos;s supply. If tokens were burned or
          minted in this period, earlier candles are approximate.
        </p>
      )}
    </div>
  );
}

/** A row of square toggle buttons, one per option. */
function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Partial<Record<T, string>>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex">
      {(Object.entries(options) as [T, string][]).map(([option, text]) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className="-ml-px cursor-pointer border border-foreground bg-surface px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase first:ml-0 hover:bg-orange hover:text-[#17100c] aria-pressed:bg-acid aria-pressed:text-acid-ink"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
