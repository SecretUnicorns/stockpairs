import CopyAddress from "@/app/copy-address";
import { getMarketData } from "@/lib/dexscreener";
import { formatPercent, formatPrice, formatUsd } from "@/lib/format";
import { chainLabels, pairedKindLabels, pairs } from "@/lib/pairs";

export default async function Home() {
  const market = await getMarketData(pairs);

  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-8">
      <h1>stockpairs</h1>
      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="p-2">Token</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">24h</th>
              <th className="p-2 text-right">Market cap</th>
              <th className="p-2 text-right">Liquidity</th>
              <th className="p-2 text-right">24h volume</th>
              <th className="p-2">Contract address</th>
              <th className="p-2">Paired with</th>
              <th className="p-2">Paired asset address</th>
              <th className="p-2">Chain</th>
              <th className="p-2">Pool</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => {
              const data = market.get(pair);
              const change = data?.priceChange24h ?? null;
              return (
                <tr
                  key={`${pair.chain}:${pair.token.address}`}
                  className="border-t"
                >
                  <td className="p-2">${pair.token.symbol}</td>
                  <td className="p-2 text-right tabular-nums">
                    {formatPrice(data?.priceUsd ?? null)}
                  </td>
                  <td
                    className={`p-2 text-right tabular-nums ${
                      change === null || change === 0
                        ? ""
                        : change > 0
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {formatPercent(change)}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {formatUsd(data?.marketCap ?? null)}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {formatUsd(data?.liquidityUsd ?? null)}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {formatUsd(data?.volume24h ?? null)}
                  </td>
                  <td className="p-2">
                    <CopyAddress address={pair.token.address} />
                  </td>
                  <td className="p-2">
                    ${pair.pairedWith.symbol} —{" "}
                    {pairedKindLabels[pair.pairedWith.kind]} for{" "}
                    {pair.pairedWith.name}
                  </td>
                  <td className="p-2">
                    <CopyAddress address={pair.pairedWith.address} />
                  </td>
                  <td className="p-2">{chainLabels[pair.chain]}</td>
                  <td className="p-2">
                    <a
                      href={pair.dexscreenerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      DexScreener
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="w-full max-w-6xl text-sm">
        Market data from DexScreener, refreshed about once a minute. Price, 24h
        change and market cap are for the token across its main pool; liquidity
        and 24h volume are for the pool listed here.
      </p>
      <p className="w-full max-w-6xl text-sm">
        Every pair trades against a token, not the asset itself. A tokenized
        stock is a token that tracks a share price — it is not the share, it
        carries no ownership or voting rights, and it can trade above or below
        the real stock. Bridged crypto is a token on this chain backed by the
        real coin held elsewhere.
      </p>
    </main>
  );
}
