/**
 * The disclaimer itself. Rendered in the footer and inside the gate that new
 * visitors have to agree to, so the two can never drift apart. Each point
 * opens with a short bold label so it can be skimmed.
 */
export default function DisclaimerText() {
  return (
    <>
      <p>
        <strong>Not financial advice.</strong> stockpairs is an information
        site. We are not financial advisors, and nothing here tells you to buy,
        sell, or hold anything. A pair being listed is not an endorsement.
      </p>
      <p>
        <strong>We don&apos;t run these tokens.</strong> We did not create,
        launch, or issue any token on this site, and we are not affiliated with
        their projects. Pairs suggested by the community are checked by hand,
        but that is not a safety guarantee.
      </p>
      <p>
        <strong>The data can be wrong.</strong> Prices, charts, and pool details
        come from third parties and can be delayed, inaccurate, or out of date,
        and so can our pairings and contract addresses. Copycat tokens reuse
        popular names: always check the contract address yourself before you
        trade.
      </p>
      <p>
        <strong>Tokenized stocks are not stocks.</strong> They track a share
        price but give you no ownership or voting rights, and they can trade far
        above or below the real stock — especially while the stock market is
        closed.
      </p>
      <p>
        <strong>Meme coins are extremely risky.</strong> Any token can be a
        scam, a rug pull, or a honeypot (one you can buy but can&apos;t sell),
        and the liquidity in a pool can disappear at any time. Only trade what
        you can afford to lose completely.
      </p>
      <p>
        <strong>Third parties are separate.</strong> We are not affiliated with
        DexScreener, GeckoTerminal, TradingView, GitHub, Robinhood, Robinhood
        Chain, Solana, or any other site, exchange, chain, or service linked
        from or named on this site. Links are there for convenience — we
        don&apos;t control those sites and aren&apos;t responsible for their
        content.
      </p>
      <p>
        <strong>Use at your own risk.</strong> We are not responsible for any
        losses, including from scams, rug pulls, honeypots, price moves, or
        incorrect information on this site.
      </p>
    </>
  );
}
