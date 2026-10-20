import Image from "next/image";
import animation from "@/public/brand/chubbicorn-coding.webp";

/**
 * Cin's animated Chubbicorn typing on a laptop, for empty and error states.
 * The animation has a cream background, so it sits in a circle that reads
 * as intentional on both themes. Kept unoptimized so it stays animated, and
 * loaded eagerly: it's only rendered when it's about to be seen.
 */
export default function CodingChubbicorn({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Image
      src={animation}
      alt=""
      unoptimized
      loading="eager"
      className={`rounded-full border border-border object-cover ${className}`}
    />
  );
}
