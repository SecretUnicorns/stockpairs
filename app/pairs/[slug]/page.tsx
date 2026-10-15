import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyAddress from "@/app/copy-address";
import PriceChart from "@/app/pairs/[slug]/price-chart";
import { getMarketData } from "@/lib/dexscreener";
import {
  changeTone,
  formatDate,
  formatPercent,
  formatPrice,
  formatUsd,
} from "@/lib/format";
import { getChartCandles } from "@/lib/geckoterminal";
import {
  chainLabels,
  findPair,
  type Pair,
  pairedKindLabels,
  pairs,
  pairSlug,
} from "@/lib/pairs";
import { correctionUrl } from "@/lib/site";

// Only the pairs in data/pairs.json have pages; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return pairs.map((pair) => ({ slug: pairSlug(pair) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/pairs/[slug]">): Promise<Metadata> {
  const pair = findPair((await params).slug);
  if (!pair) return {};
  return {
    title: `$${pair.token.symbol} / $${pair.pairedWith.symbol} — stockpairs`,
    description: `$${pair.token.symbol} is a meme coin on ${chainLabels[pair.chain]} paired with $${pair.pairedWith.symbol}, a ${pairedKindLabels[pair.pairedWith.kind]} for ${pair.pairedWith.name}. Live price, liquidity, how the pairing works, and the risks.`,
  };
}

/** What the paired asset is, in plain words. */
function pairedExplainer({ chain, pairedWith }: Pair): string {
  const chainName = chainLabels[chain];
  switch (pairedWith.kind) {
    case "tokenized-stock":
      return `$${pairedWith.symbol} is a token on ${chainName} that tracks the share price of ${pairedWith.name}. It is not the share itself: it carries no ownership or voting rights, and it can trade above or below the real stock.`;
    case "bridged-crypto":
      return `$${pairedWith.symbol} is a token on ${chainName} backed by real ${pairedWith.name} held on another chain. It is only worth ${pairedWith.name} as long as the bridge holding the real coins does its job.`;
    case "crypto-token":
      return `$${pairedWith.symbol} is ${pairedWith.name}'s own crypto token on ${chainName}. It has its own price, separate from any stock.`;
  }
}

/** Risks specific to what the coin is paired with. */
function pairedRisk({ pairedWith }: Pair): string {
  switch (pairedWith.kind) {
    case "tokenized-stock":
      return `The token can drift away from the real ${pairedWith.name} share price, especially while the stock market is closed and the token keeps trading.`;
    case "bridged-crypto":
      return `If the bridge behind $${pairedWith.symbol} is hacked or fails, $${pairedWith.symbol} can lose its backing, and every pool priced in it suffers.`;
    case "crypto-token":
      return `$${pairedWith.symbol} is itself a volatile crypto token, so it adds its own swings on top of the meme coin's.`;
  }
}

/** Why trading against another token, not dollars, matters. */
function pairingExplainer({ token, pairedWith }: Pair): string {
  const coin = `$${token.symbol}`;
  const paired = `$${pairedWith.symbol}`;
  return `${coin} trades in a liquidity pool against ${paired} instead of against a dollar coin. Buying ${coin} in that pool means paying in ${paired}, so its dollar price moves with both coins: a move in ${paired} shifts the price of ${coin} even when nobody trades ${coin}.`;
}

function daysSince(ms: number): number {
  return Math.floor((Date.now() - ms) / 86_400_000);
}

export default async function PairPage({ params }: PageProps<"/pairs/[slug]">) {
  const pair = findPair((await params).slug);
  if (!pair) notFound();

  const market = (await getMarketData([pair])).get(pair) ?? null;
  const { token, pairedWith } = pair;
  const created = market?.poolCreatedAt ?? null;
  const pool = market?.listedPoolAddress ?? null;
  // Tokens in circulation, implied by today's market cap and price.
  const supply =
    market?.marketCap && market.priceUsd
      ? market.marketCap / market.priceUsd
      : null;
  const candles = pool
    ? await getChartCandles(pair.chain, pool, token.address)
    : null;

  const stats = [
    { label: "Price", value: formatPrice(market?.priceUsd ?? null) },
    {
      label: "24h",
      value: formatPercent(market?.priceChange24h ?? null),
      tone: changeTone(market?.priceChange24h ?? null),
    },
    { label: "Market cap", value: formatUsd(market?.marketCap ?? null) },
    { label: "Liquidity", value: formatUsd(market?.liquidityUsd ?? null) },
    { label: "24h volume", value: formatUsd(market?.volume24h ?? null) },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 pt-12 pb-6">
      <Link
        href="/"
        className="self-start font-mono text-xs font-semibold tracking-widest text-muted uppercase hover:text-foreground"
      >
        ← All pairs
      </Link>

      <header className="flex flex-col gap-4">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest uppercase">
          <span aria-hidden="true" className="size-2 bg-acid" />
          {chainLabels[pair.chain]}
          {market?.dex && ` · ${market.dex}`}
        </span>
        <div className="flex items-center gap-4">
          {market?.imageUrl && (
            <Image
              src={market.imageUrl}
              alt=""
              width={64}
              height={64}
              preload
              className="size-14 shrink-0 rounded-full sm:size-16"
            />
          )}
          <h1 className="text-5xl font-extrabold tracking-tighter sm:text-7xl">
            ${token.symbol}
          </h1>
        </div>
        <p className="max-w-xl text-lg text-muted">
          A meme coin paired with{" "}
          <span className="font-semibold text-foreground">
            ${pairedWith.symbol}
          </span>
          , a {pairedKindLabels[pairedWith.kind]} for {pairedWith.name}.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <CopyAddress address={token.address} />
          <a
            href={pair.dexscreenerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-foreground bg-acid px-3 py-2 font-mono text-xs font-semibold text-acid-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-[#17100c]"
          >
            Chart on DexScreener ↗
          </a>
        </div>
      </header>

      <dl className="grid grid-cols-2 border-t border-l border-foreground bg-surface sm:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 border-r border-b border-foreground p-4 last:col-span-2 sm:last:col-span-1"
          >
            <dt className="font-mono text-[11px] tracking-widest text-muted uppercase">
              {stat.label}
            </dt>
            <dd
              className={`font-mono text-xl font-semibold ${stat.tone ?? ""}`}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-2">
        {candles?.hourly && candles.hourly.length > 0 ? (
          <PriceChart
            symbol={token.symbol}
            hourly={candles.hourly}
            daily={candles.daily}
            supply={supply}
          />
        ) : (
          <p className="border border-foreground bg-surface px-4 py-16 text-center text-muted">
            Chart unavailable right now.
          </p>
        )}
        {pool && (
          <p className="font-mono text-[11px] tracking-widest text-muted uppercase">
            Chart data:{" "}
            <a
              href={`https://www.geckoterminal.com/${pair.chain}/pools/${pool}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              GeckoTerminal
            </a>
          </p>
        )}
      </section>

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        <Section number="01" title="What it's paired with">
          <p>{pairedExplainer(pair)}</p>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            ${pairedWith.symbol} contract:
            <CopyAddress address={pairedWith.address} />
          </p>
        </Section>

        <Section number="02" title="How the pairing works">
          <p>{pairingExplainer(pair)}</p>
        </Section>

        <Section number="03" title="Where it trades">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted">Chain</dt>
            <dd>{chainLabels[pair.chain]}</dd>
            <dt className="text-muted">Exchange</dt>
            <dd>{market?.dex ?? "—"}</dd>
            <dt className="text-muted">Pool created</dt>
            <dd>
              {formatDate(created)}
              {created !== null && (
                <span className="text-muted">
                  {" "}
                  · {daysSince(created)} days ago
                </span>
              )}
            </dd>
            <dt className="text-muted">Pool liquidity</dt>
            <dd>{formatUsd(market?.liquidityUsd ?? null)}</dd>
          </dl>
        </Section>

        <Section number="04" title="Risks">
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>{pairedRisk(pair)}</li>
            <li>
              Meme coins can lose most of their value fast, and the liquidity in
              a pool can be pulled at any time.
            </li>
            <li>
              Copycat tokens reuse popular names. Check the contract address
              above before you trade.
            </li>
          </ul>
        </Section>
      </div>

      <p className="border-t border-foreground pt-4 text-sm text-muted">
        Something wrong or out of date on this page?{" "}
        <a
          href={correctionUrl(token.symbol)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline hover:text-orange"
        >
          Report a correction ↗
        </a>
      </p>
    </main>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-foreground pt-4">
      <span className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">
        {number} / {title}
      </span>
      {children}
    </section>
  );
}
