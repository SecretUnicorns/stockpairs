import { getMarketData } from "@/lib/dexscreener";
import { getChartCandles } from "@/lib/geckoterminal";
import { findPair } from "@/lib/pairs";

/**
 * Chart data for one pair, for the browser to load itself when the page was
 * built while GeckoTerminal was busy. Same cached requests as the page, so
 * this adds no extra load once the data is there.
 */
export async function GET(
  _req: Request,
  ctx: RouteContext<"/pairs/[slug]/candles">,
) {
  const pair = findPair((await ctx.params).slug);
  if (!pair) return Response.json({ error: "Unknown pair" }, { status: 404 });

  const market = (await getMarketData([pair])).get(pair) ?? null;
  const pool = market?.listedPoolAddress;
  const candles = pool
    ? await getChartCandles(pair.chain, pool, pair.token.address)
    : null;

  if (!candles?.hourly?.length) {
    // Never let a failure be cached, so the next try asks again.
    return Response.json(
      { error: "Chart data unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(candles, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
