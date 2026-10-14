"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CopyAddress from "@/app/copy-address";
import type { MarketData } from "@/lib/dexscreener";
import {
  changeTone,
  formatPercent,
  formatPrice,
  formatUsd,
} from "@/lib/format";
import {
  type Chain,
  chainLabels,
  type Pair,
  type PairedKind,
  pairedKindLabels,
  pairSlug,
} from "@/lib/pairs";

export type Row = { pair: Pair; market: MarketData | null };

type SortKey =
  | "symbol"
  | "priceUsd"
  | "priceChange24h"
  | "marketCap"
  | "liquidityUsd"
  | "volume24h";
type SortDir = "asc" | "desc";

const sortableColumns: { key: SortKey; label: string }[] = [
  { key: "priceUsd", label: "Price" },
  { key: "priceChange24h", label: "24h" },
  { key: "marketCap", label: "Market cap" },
  { key: "liquidityUsd", label: "Liquidity" },
  { key: "volume24h", label: "24h volume" },
];

function sortValue(row: Row, key: SortKey): string | number | null {
  return key === "symbol" ? row.pair.token.symbol : (row.market?.[key] ?? null);
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
 * The board. The server fetches the rows; sorting and filtering happen here
 * in the browser, so they are instant and the page itself stays cached.
 */
export default function PairsTable({ rows }: { rows: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [chain, setChain] = useState<Chain | "all">("all");
  const [kind, setKind] = useState<PairedKind | "all">("all");

  const visible = sortRows(
    rows.filter(
      ({ pair }) =>
        (chain === "all" || pair.chain === chain) &&
        (kind === "all" || pair.pairedWith.kind === kind),
    ),
    sortKey,
    sortDir,
  );

  function sortBy(key: SortKey) {
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <FilterGroup
            label="Chain"
            value={chain}
            options={chainLabels}
            onChange={setChain}
          />
          <FilterGroup
            label="Paired with"
            value={kind}
            options={pairedKindLabels}
            onChange={setKind}
          />
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
              <th className="px-3 py-3 font-medium">Chain</th>
              <th className="px-3 py-3 font-medium">
                <span className="sr-only">Pool</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ pair, market }) => (
              <PairRow
                key={`${pair.chain}:${pair.token.address}`}
                pair={pair}
                market={market}
              />
            ))}
            {visible.length === 0 && (
              <tr className="border-t border-border">
                <td colSpan={9} className="px-3 py-10 text-center text-muted">
                  No pairs match these filters.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setChain("all");
                      setKind("all");
                    }}
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
}: {
  label: string;
  align: "left" | "right";
  dir: SortDir | null;
  onSort: () => void;
}) {
  return (
    <th
      aria-sort={
        dir === null ? undefined : dir === "asc" ? "ascending" : "descending"
      }
      className={`px-3 py-3 font-medium ${align === "right" ? "text-right" : ""}`}
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

/** A row of toggle buttons: "All" plus one per option. */
function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "all";
  options: Record<T, string>;
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

function PairRow({ pair, market }: Row) {
  const change = market?.priceChange24h ?? null;
  return (
    <tr className="border-t border-border transition-colors hover:bg-soft/60">
      <td className="px-3 py-3">
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
              ${pair.token.symbol}
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
      <td className="px-3 py-3 text-right font-mono">
        {formatUsd(market?.marketCap ?? null)}
      </td>
      <td className="px-3 py-3 text-right font-mono">
        {formatUsd(market?.liquidityUsd ?? null)}
      </td>
      <td className="px-3 py-3 text-right font-mono">
        {formatUsd(market?.volume24h ?? null)}
      </td>
      <td className="min-w-48 px-3 py-3">
        <div className="flex flex-col items-start gap-0.5">
          <span>
            <span className="font-semibold">${pair.pairedWith.symbol}</span>{" "}
            <span className="text-muted">
              · {pairedKindLabels[pair.pairedWith.kind]} for{" "}
              {pair.pairedWith.name}
            </span>
          </span>
          <CopyAddress address={pair.pairedWith.address} />
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="bg-soft px-2 py-1 font-mono text-[11px] tracking-wider whitespace-nowrap uppercase">
          {chainLabels[pair.chain]}
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <a
          href={pair.dexscreenerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-foreground px-2.5 py-1.5 font-mono text-[11px] font-semibold whitespace-nowrap transition hover:-translate-y-0.5 hover:bg-orange hover:text-[#17100c]"
        >
          DexScreener ↗
        </a>
      </td>
    </tr>
  );
}
