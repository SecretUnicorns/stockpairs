# Contributing to Stock Pairs

Stock Pairs is a dashboard of meme coins paired with tokenized stocks and crypto tokens. The team decides by hand what gets listed, and we don't list rugs.

## Get a token listed or report a mistake

Use the contact link in the site's footer (or tag a Chubbicorns community member). Please don't open GitHub issues or pull requests to request listings.

## Adding a pair (for the team)

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

Open a pull request with one pair (or one correction) per PR.

## Ground rules

- **No personal information** anywhere — not in files, commits, or pull requests. Contract and pool addresses are fine; personal wallets, names and contact details are not.
- **Nothing here is financial advice**, and listing a pair is not an endorsement.
