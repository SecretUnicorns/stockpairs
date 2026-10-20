import Link from "next/link";
import CodingChubbicorn from "@/app/coding-chubbicorn";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <CodingChubbicorn className="size-40" />
      <span className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">
        404
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight">
        This page doesn&apos;t exist
      </h1>
      <p className="max-w-md text-muted">
        The pair may have been removed, or the link has a typo. Every pair we
        list is on the board.
      </p>
      <Link
        href="/"
        className="border border-foreground bg-acid px-3 py-2 font-mono text-xs font-semibold text-acid-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-[#17100c]"
      >
        Back to the board
      </Link>
    </main>
  );
}
