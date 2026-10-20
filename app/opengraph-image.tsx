import { ImageResponse } from "next/og";
import { OG_SIZE, ogColors as c, ogFonts, WORDMARK } from "@/lib/og";
import { chainLabels, chainRank, pairs } from "@/lib/pairs";

export const alt =
  "stockpairs — live board of meme coins paired with tokenized stocks and crypto";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const stamp = "LIVE BOARD";
  const title = "Stock Pairs";
  const tagline = "Stock pairs on Robinhood Chain, plus Solana.";
  // Robinhood Chain first, like everywhere else on the site.
  const chains = [...new Set(pairs.map((pair) => pair.chain))]
    .sort((a, b) => chainRank[a] - chainRank[b])
    .map((chain) => chainLabels[chain]);
  const footer = [`${pairs.length} pairs`, ...chains, "A Chubbicorns project"]
    .join(" · ")
    .toUpperCase();
  const fonts = await ogFonts(stamp + tagline + footer);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
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
          fontSize: 28,
          letterSpacing: 4,
        }}
      >
        <div style={{ width: 20, height: 20, background: c.acid }} />
        {stamp}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <img
          src={WORDMARK.src}
          alt={title}
          width={1000}
          height={Math.round(1000 / WORDMARK.ratio)}
        />
        <div style={{ fontSize: 38, color: c.muted }}>{tagline}</div>
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "IBM Plex Mono",
          fontSize: 24,
          letterSpacing: 3,
          color: c.muted,
          borderTop: `3px solid ${c.ink}`,
          paddingTop: 24,
        }}
      >
        {footer}
      </div>
    </div>,
    { ...size, fonts },
  );
}
