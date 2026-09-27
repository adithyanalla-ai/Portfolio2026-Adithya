"use client";

import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-linked depth. `speed` is how far the layer drifts relative to the page:
 * positive lags behind (reads as further away), negative runs ahead.
 * Measured over the first `range` px of page scroll. Off entirely for reduced motion.
 */
export function Parallax({
  children,
  speed = 0.4,
  range = 900,
  fade = false,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  range?: number;
  fade?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, range], [0, range * speed]);
  const opacity = useTransform(scrollY, [0, range * 0.7], [1, 0]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <m.div className={className} style={{ y, opacity: fade ? opacity : undefined, willChange: "transform" }}>
      {children}
    </m.div>
  );
}
