import Image from "next/image";
import CopyAddress from "@/app/copy-address";
import { getMarketData } from "@/lib/dexscreener";
import { formatPercent, formatPrice, formatUsd } from "@/lib/format";
import { chainLabels, pairedKindLabels, pairs } from "@/lib/pairs";

export default async function Home() {
  const market = await getMarketData(pairs);

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

      <div className="overflow-x-auto border border-foreground bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-soft font-mono text-[11px] tracking-widest whitespace-nowrap text-muted uppercase">
            <tr>
              <th className="px-3 py-3 font-medium">Token</th>
              <th className="px-3 py-3 text-right font-medium">Price</th>
              <th className="px-3 py-3 text-right font-medium">24h</th>
              <th className="px-3 py-3 text-right font-medium">Market cap</th>
              <th className="px-3 py-3 text-right font-medium">Liquidity</th>
              <th className="px-3 py-3 text-right font-medium">24h volume</th>
              <th className="px-3 py-3 font-medium">Paired with</th>
              <th className="px-3 py-3 font-medium">Chain</th>
              <th className="px-3 py-3 font-medium">
                <span className="sr-only">Pool</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => {
              const data = market.get(pair);
              const change = data?.priceChange24h ?? null;
              return (
                <tr
                  key={`${pair.chain}:${pair.token.address}`}
                  className="border-t border-border transition-colors hover:bg-soft/60"
                >
                  <td className="px-3 py-3">
                    <div className="flex min-w-max items-center gap-3">
                      {data?.imageUrl ? (
                        <Image
                          src={data.imageUrl}
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
                        <span className="font-semibold">
                          ${pair.token.symbol}
                        </span>
                        <CopyAddress address={pair.token.address} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {formatPrice(data?.priceUsd ?? null)}
                  </td>
                  <td
                    className={`px-3 py-3 text-right font-mono font-medium ${
                      change === null || change === 0
                        ? "text-muted"
                        : change > 0
                          ? "text-up"
                          : "text-down"
                    }`}
                  >
                    {formatPercent(change)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {formatUsd(data?.marketCap ?? null)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {formatUsd(data?.liquidityUsd ?? null)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {formatUsd(data?.volume24h ?? null)}
                  </td>
                  <td className="min-w-48 px-3 py-3">
                    <div className="flex flex-col items-start gap-0.5">
                      <span>
                        <span className="font-semibold">
                          ${pair.pairedWith.symbol}
                        </span>{" "}
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
            })}
          </tbody>
        </table>
      </div>

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
