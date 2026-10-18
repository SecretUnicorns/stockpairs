# Contributing to stockpairs

stockpairs is an open directory of meme coins paired with tokenized stocks and crypto tokens. Every pair is checked by hand before it's listed, and we skip anything that looks like a rug.

## Suggest a pair or report a mistake

No code needed — open an issue with one of the forms:

- **[Suggest a pair](../../issues/new?template=suggest-pair.yml)** for a coin that's missing.
- **[Report a correction](../../issues/new?template=correction.yml)** for a wrong address, a dead pool, or a token that rugged.

## Add a pair yourself

Each pair is one entry in [`data/pairs.json`](data/pairs.json):

```json
{
  "chain": "robinhood",
  "token": {
    "symbol": "NUDES",
    "address": "0xbe98b75361935b18d688409424a869a4C3dC7401"
  },
  "pairedWith": {
    "symbol": "SNAP",
    "name": "Snap",
    "kind": "tokenized-stock",
    "address": "0xF6589F11Bc40b669e584073F428B05562F568733"
  },
  "dexscreenerUrl": "https://dexscreener.com/robinhood/0x383957bce2341f59ff97c47eda2ad3b3b839b7050adc8a4747a398abca0ad552"
}
```

- `chain`: `robinhood` or `solana`. Robinhood Chain is the focus and is listed first.
- `token`: the meme coin. `symbol` has no `$`, and must be unique — it becomes the page address (`/pairs/nudes`).
- `pairedWith.kind`: what the pool trades against:
  - `tokenized-stock` — a token that tracks a share price (e.g. SNAP)
  - `bridged-crypto` — a token backed by a coin on another chain (e.g. ZEC)
  - `crypto-token` — its own crypto token (e.g. STONK)
- `dexscreenerUrl`: the DexScreener page of the specific pool. Its last part is the pool address; prices, liquidity and charts are read from it.

Then check it locally:

```bash
npm install
npm run dev
```

The new row should show live numbers on the board, and its page at `/pairs/<symbol>` should show a chart. `npm run build` fails if two pairs share a symbol.

Open a pull request with one pair (or one correction) per PR, and say in the description why it isn't a rug.

## Ground rules

- **No personal information** anywhere — not in issues, files, commits, or pull requests. Contract and pool addresses are fine; personal wallets, names and contact details are not.
- **Disclose involvement.** If you're on the team, paid to promote, or a large holder, say so. It won't get the pair rejected.
- **Nothing here is financial advice**, and listing a pair is not an endorsement.
