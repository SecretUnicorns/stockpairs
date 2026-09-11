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
    <button
      type="button"
      onClick={copy}
      title="Copy address"
      className="cursor-pointer text-left font-mono break-all hover:underline"
    >
      {address}
      <span aria-live="polite" className="ml-2 font-sans text-xs">
        {status === "copied" && "Copied!"}
        {status === "failed" && "Copy failed"}
      </span>
    </button>
  );
}
