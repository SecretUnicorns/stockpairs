import type { Metadata } from "next";
import PairsTable from "@/app/pairs-table";
import { weekTrend } from "@/lib/candles";
import { getMarketData } from "@/lib/dexscreener";
import { getHourlyCandles } from "@/lib/geckoterminal";
import { pairs } from "@/lib/pairs";
import { suggestPairUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Market data, 7-day trends, and when it was all loaded. */
async function loadBoard() {
  const market = await getMarketData(pairs);
  const rows = await Promise.all(
    pairs.map(async (pair) => {
      const data = market.get(pair) ?? null;
      const pool = data?.listedPoolAddress;
      const hourly = pool
        ? await getHourlyCandles(pair.chain, pool, pair.token.address)
        : null;
      return { pair, market: data, trend: weekTrend(hourly) };
    }),
  );
  // One clock for the whole board, so server and browser show the same ages.
  return { rows, loadedAt: Date.now() };
}

export default async function Home() {
  const { rows, loadedAt } = await loadBoard();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pt-12 pb-6">
      <header className="flex flex-col gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest uppercase">
          <span aria-hidden="true" className="size-2 bg-acid" />
          Live board
        </span>
        <h1 className="text-5xl font-extrabold tracking-tighter sm:text-7xl">
          stockpairs
        </h1>
        <p className="max-w-xl text-muted">
          Meme coins paired with tokenized stocks on Robinhood Chain, plus
          Solana. Live from DexScreener.
        </p>
        <a
          href={suggestPairUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start border border-foreground bg-acid px-3 py-2 font-mono text-xs font-semibold text-acid-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-[#17100c]"
        >
          Suggest a pair ↗
        </a>
      </header>

      <PairsTable rows={rows} now={loadedAt} />

      <div className="flex flex-col gap-2 text-sm text-muted">
        <p>
          Market data from DexScreener, refreshed about once a minute. Price,
          24h change and market cap are for the token across its main pool;
          liquidity and 24h volume are for the pool listed here.
        </p>
        <p>
          Every pair trades against a token, not the asset itself. A tokenized
          stock is a token that tracks a share price — it is not the share, it
          carries no ownership or voting rights, and it can trade above or below
          the real stock. Bridged crypto is a token on this chain backed by the
          real coin held elsewhere.
        </p>
      </div>
    </main>
  );
}
