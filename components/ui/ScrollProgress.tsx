"use client";

import { m, useScroll, useSpring } from "framer-motion";

/** Hairline progress bar pinned to the top edge. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <m.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-px origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
