"use client";

import { useEffect, useState } from "react";

/** Copies the current page URL. Falls back to showing the URL if the clipboard is blocked. */
export function CopyLink() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="tap label inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 transition-[color,border-color,translate,scale] duration-300 hover:-translate-y-px hover:border-line-strong hover:text-primary active:translate-y-0 active:scale-[0.97]"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {state === "copied" ? (
          <path d="M5 12l5 5L20 7" />
        ) : (
          <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
        )}
      </svg>
      <span aria-live="polite">{state === "copied" ? "Link copied" : state === "failed" ? "Copy the address bar" : "Copy link"}</span>
    </button>
  );
}
