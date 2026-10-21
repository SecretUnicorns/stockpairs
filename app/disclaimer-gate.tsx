"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { DISCLAIMER_VERSION } from "@/lib/disclaimer";
import { SITE_NAME } from "@/lib/brand";

const KEY = "stockpairs:disclaimer";
// Ask again after 30 days, or immediately when DISCLAIMER_VERSION changes.
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const staticSubscribe = () => () => {};

function isCurrent(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw) as { v?: string; at?: number };
    return (
      saved.v === DISCLAIMER_VERSION &&
      typeof saved.at === "number" &&
      Date.now() - saved.at < TTL_MS
    );
  } catch {
    return false;
  }
}

/**
 * Blocks the board until the disclaimer has been read to the end and agreed
 * to. Renders nothing during SSR and hydration, so returning visitors never
 * see it flash. The disclaimer arrives as children, server-rendered.
 */
export default function DisclaimerGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const initial = useSyncExternalStore(
    staticSubscribe,
    () => (isCurrent(localStorage.getItem(KEY)) ? "ok" : "show"),
    () => "ssr",
  );
  const [agreed, setAgreed] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [checked, setChecked] = useState(false);

  const atEnd = (el: HTMLElement) =>
    el.scrollTop + el.clientHeight >= el.scrollHeight - 8;

  // Also covers the case where the disclaimer is short enough not to scroll.
  const scrollRef = useCallback((el: HTMLDivElement | null) => {
    if (el && atEnd(el)) setScrolledToEnd(true);
  }, []);

  if (agreed || initial !== "show") return null;

  function agree() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ v: DISCLAIMER_VERSION, at: Date.now() }),
      );
    } catch {
      // Storage can be unavailable (private mode). They still get in, but
      // they will be asked again next visit.
    }
    setAgreed(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-gate-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col border border-foreground bg-background p-5 shadow-xl"
      >
        <h2
          id="disclaimer-gate-title"
          className="mb-1 text-2xl font-extrabold tracking-tight"
        >
          Quick heads-up first
        </h2>
        <p className="mb-3 text-sm">
          {SITE_NAME} tracks risky assets. Scroll through these seven short
          points, then tick the box to see the board.
        </p>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            onScroll={(event) => {
              if (atEnd(event.currentTarget)) setScrolledToEnd(true);
            }}
            tabIndex={0}
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto border border-border bg-surface p-3 text-sm"
          >
            {children}
          </div>
          {/* The box stays locked until the end, so make "there's more
              below" impossible to miss. Floats inside the border. */}
          {!scrolledToEnd && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-px bottom-px flex h-16 items-end justify-center bg-linear-to-t from-surface via-surface/80 to-transparent pb-2"
            >
              <span className="border border-foreground bg-acid px-2.5 py-0.5 font-mono text-xs font-semibold text-acid-ink motion-safe:animate-bounce">
                ↓ Scroll for more
              </span>
            </div>
          )}
        </div>
        <label
          className={`mt-3 flex items-start gap-2 text-sm ${
            scrolledToEnd ? "" : "opacity-50"
          }`}
        >
          <input
            type="checkbox"
            disabled={!scrolledToEnd}
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-1"
          />
          <span>
            I&apos;ve read this, I understand {SITE_NAME} isn&apos;t financial
            advice, and I&apos;m using it at my own risk.
            {!scrolledToEnd && " (Scroll to the end first.)"}
          </span>
        </label>
        <button
          type="button"
          onClick={agree}
          disabled={!checked}
          className="mt-3 w-full cursor-pointer border border-foreground bg-acid px-3 py-3 font-mono text-sm font-semibold text-acid-ink transition enabled:hover:-translate-y-0.5 enabled:hover:bg-orange disabled:cursor-not-allowed disabled:opacity-30"
        >
          Show me the board
        </button>
      </div>
    </div>
  );
}
