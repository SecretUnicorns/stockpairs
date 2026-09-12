import { chainLabels, pairedKindLabels, pairs } from "@/lib/pairs";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-8">
      <h1>stockpairs</h1>
      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="p-2">Token</th>
              <th className="p-2">Contract address</th>
              <th className="p-2">Paired with</th>
              <th className="p-2">Paired asset address</th>
              <th className="p-2">Chain</th>
              <th className="p-2">Pool</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={`${pair.chain}:${pair.token.address}`} className="border-t">
                <td className="p-2">${pair.token.symbol}</td>
                <td className="p-2 font-mono break-all">{pair.token.address}</td>
                <td className="p-2">
                  ${pair.pairedWith.symbol} —{" "}
                  {pairedKindLabels[pair.pairedWith.kind]} for{" "}
                  {pair.pairedWith.name}
                </td>
                <td className="p-2 font-mono break-all">
                  {pair.pairedWith.address}
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
            ))}
          </tbody>
        </table>
      </div>
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
