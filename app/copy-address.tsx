"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "copied" | "failed";

export default function CopyAddress({ address }: { address: string }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timeout = setTimeout(() => setStatus("idle"), 1500);
    return () => clearTimeout(timeout);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <span className="relative block">
      <button
        type="button"
        onClick={copy}
        title="Copy address"
        className="w-full cursor-pointer text-left font-mono break-all hover:underline"
      >
        {address}
      </button>
      {/* Positioned out of the flow so showing it never shifts the layout. */}
      <span
        aria-live="polite"
        className="pointer-events-none absolute right-0 bottom-0 bg-[var(--background)] pl-2 text-xs"
      >
        {status === "copied" && "Copied!"}
        {status === "failed" && "Copy failed"}
      </span>
    </span>
  );
}
