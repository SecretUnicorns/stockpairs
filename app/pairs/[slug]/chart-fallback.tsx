"use client";

import { useEffect, useState } from "react";
import PriceChart from "@/app/pairs/[slug]/price-chart";
import type { ChartCandles } from "@/lib/geckoterminal";

type State =
  | { status: "loading" }
  | { status: "ready"; candles: ChartCandles }
  | { status: "failed" };

/**
 * Shown when the page was built without chart data (GeckoTerminal was busy).
 * Loads the candles from the browser instead, so a visitor never gets stuck
 * on "unavailable", and offers a retry if that fails too.
 */
export default function ChartFallback({
  slug,
  symbol,
  supply,
}: {
  slug: string;
  symbol: string;
  supply: number | null;
}) {
  const [state, setState] = useState<State>({ status: "loading" });
  // Bumped by "Try again" to run the request once more.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/pairs/${slug}/candles`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((candles: ChartCandles) => {
        if (!cancelled) setState({ status: "ready", candles });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  if (state.status === "ready" && state.candles.hourly) {
    return (
      <PriceChart
        symbol={symbol}
        hourly={state.candles.hourly}
        daily={state.candles.daily}
        supply={supply}
      />
    );
  }

  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center gap-3 border border-foreground bg-surface px-4 py-16 text-center text-muted"
    >
      {state.status === "failed" ? (
        <>
          <p>Chart unavailable right now.</p>
          <button
            type="button"
            onClick={retry}
            className="cursor-pointer border border-foreground bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-orange hover:text-[#17100c]"
          >
            Try again
          </button>
        </>
      ) : (
        <p>Loading chart…</p>
      )}
    </div>
  );
}
