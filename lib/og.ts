/**
 * Helpers for share images (the preview card when a link is posted on X,
 * Telegram, Discord…). They're drawn on the server, so visitors never
 * contact Google or DexScreener.
 */

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Every download for a share image gives up after this long. Images are
 * built during deploys, and one stalled request would otherwise hang the
 * whole build; with a timeout the image just skips that font or logo.
 */
export const OG_FETCH_TIMEOUT_MS = 10_000;

// Same palette as globals.css (light mode). Images can't read CSS variables.
export const ogColors = {
  paper: "#f3f4ef",
  ink: "#121510",
  muted: "#566052",
  soft: "#e6e9df",
  acid: "#c8f13a",
  up: "#4d7c0f",
  down: "#c2410c",
};

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 800;
  style: "normal";
};

/**
 * Loads just the letters `text` needs from Google Fonts, as a TrueType file
 * the image renderer can read. Returns null on any failure; the image then
 * falls back to Next's built-in font instead of breaking.
 */
async function googleFont(
  family: string,
  weight: OgFont["weight"],
  text: string,
): Promise<OgFont | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}:wght@${weight}&text=${encodeURIComponent(text)}`,
      {
        next: { revalidate: 60 * 60 * 24 },
        signal: AbortSignal.timeout(OG_FETCH_TIMEOUT_MS),
      },
    ).then((res) => res.text());
    const url = css.match(
      /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/,
    )?.[1];
    if (!url) return null;
    const data = await fetch(url, {
      signal: AbortSignal.timeout(OG_FETCH_TIMEOUT_MS),
    }).then((res) => res.arrayBuffer());
    return { name: family, data, weight, style: "normal" };
  } catch {
    return null;
  }
}

/** Archivo for headings and IBM Plex Mono for labels, like the site. */
export async function ogFonts(text: string): Promise<OgFont[]> {
  const fonts = await Promise.all([
    googleFont("Archivo", 800, text),
    googleFont("IBM Plex Mono", 600, text),
  ]);
  return fonts.filter((font) => font !== null);
}
