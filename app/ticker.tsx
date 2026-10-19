/**
 * A ticker like "$ZCAT". Archivo draws its "$" narrower and shorter than its
 * capitals, so it looks undersized next to the letters; this scales just the
 * "$" up to match. Use it wherever a ticker is shown as a name (not inside
 * running sentences).
 */
export default function Ticker({ symbol }: { symbol: string }) {
  return (
    <>
      <span className="text-[1.15em] leading-none">$</span>
      {symbol}
    </>
  );
}
