import type { Trend } from "@/lib/candles";
import { formatPercent } from "@/lib/format";

const WIDTH = 96;
const HEIGHT = 28;
// Keeps the line's stroke from being clipped at the top and bottom edge.
const PAD = 2;

/** A tiny line chart of a trend, green if it ended up, orange if down. */
export default function Sparkline({ trend }: { trend: Trend | null }) {
  if (!trend) return <span className="text-muted">—</span>;

  const { points, change } = trend;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const spread = max - min || 1;
  const line = points
    .map((point, i) => {
      const x = (i / (points.length - 1)) * WIDTH;
      const y = PAD + (1 - (point - min) / spread) * (HEIGHT - 2 * PAD);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`7 day trend: ${formatPercent(change)}`}
      className={`ml-auto block ${change >= 0 ? "text-up" : "text-down"}`}
    >
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
