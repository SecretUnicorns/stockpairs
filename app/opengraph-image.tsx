import { ImageResponse } from "next/og";
import { OG_SIZE, ogColors as c, ogFonts } from "@/lib/og";
import { pairs } from "@/lib/pairs";

export const alt =
  "stockpairs — live board of meme coins paired with tokenized stocks and crypto";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const stamp = "LIVE BOARD";
  const title = "stockpairs";
  const tagline = "Meme coins paired with tokenized stocks and crypto.";
  const footer = `${pairs.length} PAIRS · SOLANA · ROBINHOOD CHAIN · A CHUBBICORNS PROJECT`;
  const fonts = await ogFonts(stamp + title + tagline + footer);

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
        <div style={{ fontSize: 190, letterSpacing: -9, lineHeight: 1 }}>
          {title}
        </div>
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
