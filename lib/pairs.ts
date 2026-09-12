import pairsData from "@/data/pairs.json";

export type Chain = "solana" | "robinhood";

export const chainLabels: Record<Chain, string> = {
  solana: "Solana",
  robinhood: "Robinhood Chain",
};

/**
 * What the paired asset actually is on-chain. Every pair trades against a
 * token, never the underlying stock or coin itself.
 */
export type PairedKind = "tokenized-stock" | "bridged-crypto" | "crypto-token";

export const pairedKindLabels: Record<PairedKind, string> = {
  "tokenized-stock": "tokenized stock",
  "bridged-crypto": "bridged crypto",
  "crypto-token": "crypto token",
};

export type Asset = {
  symbol: string;
  address: string;
};

export type PairedAsset = Asset & {
  name: string;
  kind: PairedKind;
};

export type Pair = {
  chain: Chain;
  token: Asset;
  pairedWith: PairedAsset;
  dexscreenerUrl: string;
};

export const pairs = pairsData as Pair[];
