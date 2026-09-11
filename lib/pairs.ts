import pairsData from "@/data/pairs.json";

export type Chain = "solana" | "robinhood";

export const chainLabels: Record<Chain, string> = {
  solana: "Solana",
  robinhood: "Robinhood Chain",
};

export type Asset = {
  symbol: string;
  address: string;
};

export type PairedAsset = Asset & {
  name: string;
  kind: "stock" | "crypto";
};

export type Pair = {
  chain: Chain;
  token: Asset;
  pairedWith: PairedAsset;
  dexscreenerUrl: string;
};

export const pairs = pairsData as Pair[];
