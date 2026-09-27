"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Counts the numeric part of a stat ("₹1.4Cr+", "3,000+", "20+ hrs") up from zero
 * once it scrolls into view. Server-renders the final value so it is never wrong without JS.
 */
export function Counter({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reduce || !match) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const useCommas = num.includes(",");
    const duration = 1600;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(2, -10 * p); // ease-out-expo
      const n = target * (p === 1 ? 1 : eased);
      const s = useCommas
        ? Math.round(n).toLocaleString("en-US")
        : n.toFixed(decimals);
      setDisplay(`${prefix}${s}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>{display}</span>
    </span>
  );
}
