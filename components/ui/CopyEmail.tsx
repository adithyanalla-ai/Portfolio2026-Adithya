"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { spring } from "@/lib/motion";

export function CopyEmail({ email, className = "" }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`tap label inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-secondary transition-colors hover:border-line-strong hover:text-primary ${className}`}
    >
      <span className="relative inline-grid h-4 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={copied ? "done" : "copy"}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={spring.snappy}
          >
            {copied ? "Copied to clipboard" : "Copy email"}
          </m.span>
        </AnimatePresence>
      </span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {copied ? (
          <path d="M5 12l5 5L20 7" />
        ) : (
          <>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </>
        )}
      </svg>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
