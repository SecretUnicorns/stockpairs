"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CopyAddress from "@/app/copy-address";
import Sparkline from "@/app/sparkline";
import type { Trend } from "@/lib/candles";
import type { MarketData } from "@/lib/dexscreener";
import {
  changeTone,
  formatAge,
  formatPercent,
  formatPrice,
  formatUsd,
} from "@/lib/format";
import {
  type Chain,
  chainLabels,
  chainRank,
  type Pair,
  type PairedKind,
  pairedKindLabels,
  pairSlug,
} from "@/lib/pairs";
import Ticker from "@/app/ticker";
import CodingChubbicorn from "@/app/coding-chubbicorn";

export type Row = {
  pair: Pair;
  market: MarketData | null;
  /** The last 7 days, for the sparkline. */
  trend: Trend | null;
};

type SortKey =
  | "symbol"
  | "priceUsd"
  | "priceChange24h"
  | "trend"
  | "marketCap"
  | "liquidityUsd"
  | "volume24h"
  | "age";
type SortDir = "asc" | "desc";

const sortableColumns: { key: SortKey; label: string }[] = [
  { key: "priceUsd", label: "Price" },
  { key: "priceChange24h", label: "24h" },
  { key: "trend", label: "7d" },
  { key: "marketCap", label: "Market cap" },
  { key: "liquidityUsd", label: "Liquidity" },
  { key: "volume24h", label: "24h volume" },
  { key: "age", label: "Age" },
];

// The table only has room for the short name; filters keep the full one.
const chainTags: Record<Chain, string> = {
  robinhood: "Robinhood",
  solana: "Solana",
};

// Robinhood Chain is the focus, so its tag gets the accent colour.
const chainTagStyles: Record<Chain, string> = {
  robinhood: "bg-acid text-acid-ink",
  solana: "bg-soft",
};

function sortValue(row: Row, key: SortKey): string | number | null {
  switch (key) {
    case "symbol":
      return row.pair.token.symbol;
    case "trend":
      return row.trend?.change ?? null;
    case "age": {
      // Older pools were created earlier, so flip the sign: biggest = oldest.
      const created = row.market?.poolCreatedAt;
      return created == null ? null : -created;
    }
    default:
      return row.market?.[key] ?? null;
  }
}

/** Sorts a copy of the rows. Missing values always go last. */
function sortRows(rows: Row[], key: SortKey, dir: SortDir): Row[] {
  return [...rows].sort((a, b) => {
    const x = sortValue(a, key);
    const y = sortValue(b, key);
    if (x === null) return y === null ? 0 : 1;
    if (y === null) return -1;
    const order =
      typeof x === "string" && typeof y === "string"
        ? x.localeCompare(y)
        : Number(x) - Number(y);
    return dir === "asc" ? order : -order;
  });
}

/**
 * True if every word of the search appears somewhere in the pair: its symbol,
 * what it's paired with (symbol or company name), the chain, or an address.
 * "snap", "$meme", "amc robinhood" and a pasted contract address all work.
 */
function matchesSearch(pair: Pair, query: string): boolean {
  const words = query.toLowerCase().replaceAll("$", " ").split(/\s+/);
  const haystack = [
    pair.token.symbol,
    pair.token.address,
    pair.pairedWith.symbol,
    pair.pairedWith.name,
    pair.pairedWith.address,
    chainLabels[pair.chain],
  ]
    .join(" ")
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

/**
 * The board. The server fetches the rows; sorting and filtering happen here
 * in the browser, so they are instant and the page itself stays cached.
 */
export default function PairsTable({
  rows,
  now,
}: {
  rows: Row[];
  /** The server's clock at render time, used for pool ages. */
  now: number;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  // Until someone picks a column, Robinhood Chain pairs lead the board.
  const [userSorted, setUserSorted] = useState(false);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [chain, setChain] = useState<Chain | "all">("all");
  const [kind, setKind] = useState<PairedKind | "all">("all");
  const [query, setQuery] = useState("");
  const searchBox = useRef<HTMLInputElement>(null);

  // Only offer filters that can narrow the board: one chain or one kind of
  // pair means there's nothing to choose between.
  const chainOptions = [...new Set(rows.map(({ pair }) => pair.chain))];
  const kindOptions = [
    ...new Set(rows.map(({ pair }) => pair.pairedWith.kind)),
  ];
  // Same for the Chain column: with one chain it says the same on every row.
  const showChain = chainOptions.length > 1;

  const sorted = sortRows(
    rows.filter(
      ({ pair }) =>
        (chain === "all" || pair.chain === chain) &&
        (kind === "all" || pair.pairedWith.kind === kind) &&
        matchesSearch(pair, query.trim()),
    ),
    sortKey,
    sortDir,
  );
  // Sorting is stable, so each chain keeps its market cap order.
  const visible = userSorted
    ? sorted
    : [...sorted].sort(
        (a, b) => chainRank[a.pair.chain] - chainRank[b.pair.chain],
      );

  // Press "/" anywhere on the board to jump to the search box.
  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const typing = target.closest("input, textarea, [contenteditable]");
      if (event.key !== "/" || typing || event.metaKey || event.ctrlKey) {
        return;
      }
      event.preventDefault();
      searchBox.current?.focus();
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function showAll() {
    setQuery("");
    setChain("all");
    setKind("all");
  }

  function sortBy(key: SortKey) {
    setUserSorted(true);
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      // Names read A→Z; numbers start with the biggest.
      setSortDir(key === "symbol" ? "asc" : "desc");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-w-xl flex-col gap-1">
        <label
          htmlFor="pair-search"
          className="font-mono text-[11px] tracking-widest text-muted uppercase"
        >
          Search
        </label>
        <div className="relative">
          <input
            ref={searchBox}
            id="pair-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
            placeholder="A stock or token, e.g. SNAP or $MEME"
            autoComplete="off"
            spellCheck={false}
            className="w-full border border-foreground bg-surface px-3 py-2.5 pr-10 text-base outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-acid [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchBox.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 cursor-pointer px-3 text-muted hover:text-foreground"
            >
              ✕
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 border border-border px-1.5 font-mono text-[11px] text-muted sm:block"
            >
              /
            </kbd>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {chainOptions.length > 1 && (
            <FilterGroup
              label="Chain"
              value={chain}
              options={pick(chainLabels, chainOptions)}
              onChange={setChain}
            />
          )}
          {kindOptions.length > 1 && (
            <FilterGroup
              label="Paired with"
              value={kind}
              options={pick(pairedKindLabels, kindOptions)}
              onChange={setKind}
            />
          )}
        </div>
        <p
          aria-live="polite"
          className="font-mono text-[11px] tracking-widest text-muted uppercase"
        >
          Showing {visible.length} of {rows.length}
        </p>
      </div>

      <div className="overflow-x-auto border border-foreground bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-soft font-mono text-[11px] tracking-widest whitespace-nowrap text-muted uppercase">
            <tr>
              <SortHeader
                label="Token"
                align="left"
                sticky
                dir={sortKey === "symbol" ? sortDir : null}
                onSort={() => sortBy("symbol")}
              />
              {sortableColumns.map((column) => (
                <SortHeader
                  key={column.key}
                  label={column.label}
                  align="right"
                  dir={sortKey === column.key ? sortDir : null}
                  onSort={() => sortBy(column.key)}
                />
              ))}
              <th className="px-3 py-3 font-medium">Paired with</th>
              {showChain && <th className="px-3 py-3 font-medium">Chain</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <PairRow
                key={`${row.pair.chain}:${row.pair.token.address}`}
                row={row}
                now={now}
                showChain={showChain}
              />
            ))}
            {visible.length === 0 && (
              <tr className="border-t border-border">
                <td
                  colSpan={showChain ? 10 : 9}
                  className="px-3 py-10 text-center text-muted"
                >
                  <CodingChubbicorn className="mx-auto mb-3 size-24" />
                  {query.trim()
                    ? `No pairs match “${query.trim()}”.`
                    : "No pairs match these filters."}{" "}
                  <button
                    type="button"
                    onClick={showAll}
                    className="cursor-pointer underline hover:text-foreground"
                  >
                    Show all
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** A column header that sorts by its column. `dir` is null when inactive. */
function SortHeader({
  label,
  align,
  dir,
  onSort,
  sticky = false,
}: {
  label: string;
  align: "left" | "right";
  dir: SortDir | null;
  onSort: () => void;
  sticky?: boolean;
}) {
  return (
    <th
      aria-sort={
        dir === null ? undefined : dir === "asc" ? "ascending" : "descending"
      }
      className={`px-3 py-3 font-medium ${align === "right" ? "text-right" : ""} ${
        sticky ? `${stickyCell} bg-soft` : ""
      }`}
    >
      <button
        type="button"
        onClick={onSort}
        className={`relative cursor-pointer tracking-widest uppercase hover:text-foreground ${
          dir === null ? "" : "text-foreground"
        }`}
      >
        {label}
        {/* Drawn in the cell padding so it never widens the column. */}
        <span
          aria-hidden="true"
          className={`absolute ${align === "right" ? "right-full mr-1" : "left-full ml-1"}`}
        >
          {dir === "asc" ? "↑" : dir === "desc" ? "↓" : ""}
        </span>
      </button>
    </th>
  );
}

/** The entries of `labels` for the given keys, in the labels' order. */
function pick<T extends string>(
  labels: Record<T, string>,
  keys: T[],
): Partial<Record<T, string>> {
  return Object.fromEntries(
    (Object.keys(labels) as T[])
      .filter((key) => keys.includes(key))
      .map((key) => [key, labels[key]]),
  ) as Partial<Record<T, string>>;
}

/** A row of toggle buttons: "All" plus one per option. */
function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "all";
  options: Partial<Record<T, string>>;
  onChange: (value: T | "all") => void;
}) {
  const choices: [T | "all", string][] = [
    ["all", "All"],
    ...(Object.entries(options) as [T, string][]),
  ];
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1">
      <span className="font-mono text-[11px] tracking-widest text-muted uppercase">
        {label}
      </span>
      <div className="flex flex-wrap">
        {choices.map(([option, text]) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className="-ml-px cursor-pointer border border-foreground bg-surface px-2.5 py-1.5 font-mono text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase first:ml-0 hover:bg-orange hover:text-[#17100c] aria-pressed:bg-acid aria-pressed:text-acid-ink"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Keeps the token column in view while the table scrolls sideways on a
 * phone. It needs its own background, or the scrolled cells show through.
 */
const stickyCell = "sticky left-0 z-10 max-sm:border-r max-sm:border-border";

function PairRow({
  row,
  now,
  showChain,
}: {
  row: Row;
  now: number;
  showChain: boolean;
}) {
  const { pair, market, trend } = row;
  const change = market?.priceChange24h ?? null;
  return (
    <tr className="group border-t border-border">
      <td
        className={`px-3 py-3 ${stickyCell} bg-surface transition-colors group-hover:bg-soft`}
      >
        <div className="flex min-w-max items-center gap-3">
          {market?.imageUrl ? (
            <Image
              src={market.imageUrl}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full"
            />
          ) : (
            <span
              aria-hidden="true"
              className="size-8 shrink-0 rounded-full bg-border"
            />
          )}
          <div className="flex flex-col items-start gap-0.5">
            <Link
              href={`/pairs/${pairSlug(pair)}`}
              className="font-semibold underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              <Ticker symbol={pair.token.symbol} />
            </Link>
            <CopyAddress address={pair.token.address} />
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right font-mono">
        {formatPrice(market?.priceUsd ?? null)}
      </td>
      <td
        className={`px-3 py-3 text-right font-mono font-medium ${changeTone(change)}`}
      >
        {formatPercent(change)}
      </td>
      <td className="px-3 py-3 text-right">
        <Sparkline trend={trend} />
      </td>
      <td className="px-3 py-3 text-right font-mono">
        {formatUsd(market?.marketCap ?? null)}
      </td>
      <td className="px-3 py-3 text-right font-mono">
        {formatUsd(market?.liquidityUsd ?? null)}
      </td>
      <td className="px-3 py-3 text-right font-mono">
        {formatUsd(market?.volume24h ?? null)}
      </td>
      <td className="px-3 py-3 text-right font-mono text-muted">
        {formatAge(market?.poolCreatedAt ?? null, now)}
      </td>
      <td className="min-w-48 px-3 py-3">
        <div className="flex flex-col items-start gap-0.5">
          <span>
            <span className="font-semibold">
              <Ticker symbol={pair.pairedWith.symbol} />
            </span>{" "}
            <span className="text-muted">
              · {pairedKindLabels[pair.pairedWith.kind]} for{" "}
              {pair.pairedWith.name}
            </span>
          </span>
          <CopyAddress address={pair.pairedWith.address} />
        </div>
      </td>
      {showChain && (
        <td className="px-3 py-3">
          <span
            className={`px-2 py-1 font-mono text-[11px] tracking-wider whitespace-nowrap uppercase ${chainTagStyles[pair.chain]}`}
          >
            {chainTags[pair.chain]}
          </span>
        </td>
      )}
    </tr>
  );
}
