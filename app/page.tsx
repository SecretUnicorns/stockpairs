import PairsTable from "@/app/pairs-table";
import { getMarketData } from "@/lib/dexscreener";
import { pairs } from "@/lib/pairs";

export default async function Home() {
  const market = await getMarketData(pairs);
  const rows = pairs.map((pair) => ({
    pair,
    market: market.get(pair) ?? null,
  }));

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
          Meme coins paired with tokenized stocks and crypto, live from
          DexScreener.
        </p>
      </header>

      <PairsTable rows={rows} />

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
