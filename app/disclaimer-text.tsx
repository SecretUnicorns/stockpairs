/**
 * The disclaimer itself. Rendered in the footer and inside the gate that new
 * visitors have to agree to, so the two can never drift apart.
 */
export default function DisclaimerText() {
  return (
    <>
      <p>
        stockpairs is for informational purposes only and is not financial
        advice. We are not financial advisors. Listing a token or stock here is
        not an endorsement, recommendation, or suggestion to buy, sell, or hold
        it. We did not create, launch, or issue any of the tokens listed, and we
        are not affiliated with any of them or their projects.
      </p>
      <p>
        Token and stock pairings and contract addresses may be inaccurate or out
        of date, and any token may be a scam or a honeypot (a token you can buy
        but can&apos;t sell). Always verify the contract address and do your own
        research before you trade.
      </p>
      <p>
        We are not responsible for how any token, or the stock or crypto it is
        paired with, moves in price. Tokenized stocks can trade far above or
        below the real stock, and liquidity can disappear at any time.
      </p>
      <p>
        We are not responsible for any losses, including losses from honeypots,
        scams, rug pulls, or incorrect information on this site. Crypto and
        tokenized stocks are highly risky — use this site at your own risk.
      </p>
    </>
  );
}
