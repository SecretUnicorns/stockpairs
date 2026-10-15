import type { Chain, Pair } from "@/lib/pairs";

const API = "https://api.dexscreener.com";
// Every visitor within this window shares one set of API calls.
const REVALIDATE_SECONDS = 60;
// DexScreener accepts at most 30 comma-separated addresses per request.
const MAX_ADDRESSES = 30;

/** The subset of a DexScreener pair response that we read. */
type DexPair = {
  pairAddress: string;
  baseToken: { address: string };
  priceUsd?: string;
  marketCap?: number;
  priceChange?: { h24?: number };
  liquidity?: { usd?: number };
  volume?: { h24?: number };
};

/** Live numbers for one row of the board. `null` means unavailable. */
export type MarketData = {
  /** Token-level: from the token's main pool, where it is the base token. */
  priceUsd: number | null;
  priceChange24h: number | null;
  marketCap: number | null;
  /** Pool-level: from the pool listed for this pair. */
  liquidityUsd: number | null;
  volume24h: number | null;
};

/** The pool address is the last segment of the DexScreener pair URL. */
export function poolAddress(pair: Pair): string {
  return new URL(pair.dexscreenerUrl).pathname.split("/").pop() ?? "";
}

/**
 * Fetches live market data for every pair, keyed by the pair object.
 *
 * Two lookups per chain, because a pool's token-level numbers belong to its
 * base token: in the MEME/AMC pool, AMC is the base, so that pool's price and
 * market cap are AMC's. Token stats therefore come from the token endpoint
 * (the token's own main pool), and liquidity/volume from our listed pool.
 *
 * Never throws: if DexScreener is down, the affected values are null.
 */
export async function getMarketData(
  pairs: Pair[],
): Promise<Map<Pair, MarketData>> {
  const chains = [...new Set(pairs.map((pair) => pair.chain))];

  const [tokenPools, listedPools] = await Promise.all([
    lookup(chains, pairs, "tokens", (pair) => pair.token.address),
    lookup(chains, pairs, "pairs", poolAddress),
  ]);

  const tokenPool = (pair: Pair) =>
    tokenPools.find((dex) => same(dex.baseToken.address, pair.token.address));
  const listedPool = (pair: Pair) =>
    listedPools.find((dex) => same(dex.pairAddress, poolAddress(pair)));

  return new Map(
    pairs.map((pair) => {
      const token = tokenPool(pair);
      const pool = listedPool(pair);
      return [
        pair,
        {
          priceUsd: toNumber(token?.priceUsd),
          priceChange24h: token?.priceChange?.h24 ?? null,
          marketCap: token?.marketCap ?? null,
          liquidityUsd: pool?.liquidity?.usd ?? null,
          volume24h: pool?.volume?.h24 ?? null,
        },
      ];
    }),
  );
}

/** Calls one DexScreener endpoint for every chain and merges the results. */
async function lookup(
  chains: Chain[],
  pairs: Pair[],
  endpoint: "tokens" | "pairs",
  address: (pair: Pair) => string,
): Promise<DexPair[]> {
  const requests = chains.flatMap((chain) => {
    const addresses = pairs.filter((pair) => pair.chain === chain).map(address);
    return chunk(addresses, MAX_ADDRESSES).map((batch) => {
      const path =
        endpoint === "tokens"
          ? `/tokens/v1/${chain}/${batch.join(",")}`
          : `/latest/dex/pairs/${chain}/${batch.join(",")}`;
      return fetchPairs(path);
    });
  });
  return (await Promise.all(requests)).flat();
}

async function fetchPairs(path: string): Promise<DexPair[]> {
  try {
    const res = await fetch(API + path, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const body = await res.json();
    // /tokens returns an array; /latest/dex/pairs returns { pairs: [...] }.
    return (Array.isArray(body) ? body : body.pairs) ?? [];
  } catch {
    return [];
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

// Pair URLs are lowercased, so compare addresses case-insensitively.
function same(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function toNumber(value: string | undefined): number | null {
  const number = Number(value);
  return value && Number.isFinite(number) ? number : null;
}
