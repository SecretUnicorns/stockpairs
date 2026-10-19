import { ImageResponse } from "next/og";
import { getMarketData } from "@/lib/dexscreener";
import { formatPercent, formatPrice, formatUsd } from "@/lib/format";
import { OG_FETCH_TIMEOUT_MS, OG_SIZE, ogColors as c, ogFonts } from "@/lib/og";
import {
  chainLabels,
  findPair,
  pairedKindLabels,
  pairs,
  pairSlug,
} from "@/lib/pairs";

export const alt = "Live stats for this stockpairs pair";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return pairs.map((pair) => ({ slug: pairSlug(pair) }));
}

/**
 * DexScreener serves logos in whatever format the browser accepts; the image
 * renderer only reads PNG and JPEG, so ask for PNG and embed it directly.
 */
async function logoDataUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url.replace("format=auto", "format=png"), {
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(OG_FETCH_TIMEOUT_MS),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/^image\/(png|jpeg)/.test(type)) return null;
    const base64 = Buffer.from(await res.arrayBuffer()).toString("base64");
    return `data:${type};base64,${base64}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const pair = findPair((await params).slug)!;
  const market = (await getMarketData([pair])).get(pair) ?? null;
  const logo = await logoDataUrl(market?.imageUrl ?? null);
  const change = market?.priceChange24h ?? null;

  const stamp = ["stockpairs", chainLabels[pair.chain], market?.dex]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  const subtitle = `paired with $${pair.pairedWith.symbol} — ${pairedKindLabels[pair.pairedWith.kind]} for ${pair.pairedWith.name}`;
  const stats = [
    { label: "MARKET CAP", value: formatUsd(market?.marketCap ?? null) },
    { label: "PRICE", value: formatPrice(market?.priceUsd ?? null) },
    {
      label: "24H",
      value: formatPercent(change),
      color:
        change === null || change === 0 ? c.ink : change > 0 ? c.up : c.down,
    },
  ];

  const fonts = await ogFonts(
    [
      stamp,
      `$${pair.token.symbol}`,
      subtitle,
      ...stats.flatMap((s) => [s.label, s.value]),
    ].join(""),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: c.paper,
        color: c.ink,
        fontFamily: "Archivo",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: "IBM Plex Mono",
          fontSize: 26,
          letterSpacing: 3,
        }}
      >
        <div style={{ width: 18, height: 18, background: c.acid }} />
        {stamp}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {logo && (
            <img
              src={logo}
              width={132}
              height={132}
              style={{ borderRadius: 66 }}
              alt=""
            />
          )}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 150,
              letterSpacing: -6,
              lineHeight: 1,
            }}
          >
            {/* Same 115% "$" as the Ticker component on the site. */}
            <span style={{ fontSize: 150 * 1.15 }}>$</span>
            {pair.token.symbol}
          </div>
        </div>
        <div style={{ fontSize: 34, color: c.muted }}>{subtitle}</div>
      </div>

      <div style={{ display: "flex", border: `3px solid ${c.ink}` }}>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "20px 28px",
              background: "#ffffff",
              borderLeft: i === 0 ? "none" : `3px solid ${c.ink}`,
              fontFamily: "IBM Plex Mono",
            }}
          >
            <div style={{ fontSize: 20, color: c.muted, letterSpacing: 3 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 48, color: stat.color ?? c.ink }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts },
  );
}
