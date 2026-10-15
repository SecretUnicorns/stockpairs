"use client";

import { useEffect, useState } from "react";
import { shortAddress } from "@/lib/format";

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
    <span className="relative inline-block">
      <button
        type="button"
        onClick={copy}
        title={`Copy ${address}`}
        aria-label={`Copy address ${address}`}
        className="cursor-pointer bg-soft px-1.5 py-0.5 font-mono text-xs whitespace-nowrap text-muted hover:text-foreground"
      >
        {shortAddress(address)}
      </button>
      {/* Positioned out of the flow so showing it never shifts the layout. */}
      <span
        aria-live="polite"
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-acid font-mono text-xs whitespace-nowrap text-acid-ink empty:bg-transparent"
      >
        {status === "copied" && "Copied!"}
        {status === "failed" && "Copy failed"}
      </span>
    </span>
  );
}
