"use client";

import { m } from "framer-motion";
import type { Variants } from "framer-motion";
import { container, fadeUp, spring } from "@/lib/motion";

const fadeUpDelayed = (delay: number): Variants => ({
  hidden: fadeUp.hidden,
  visible: { opacity: 1, y: 0, transition: { ...spring.soft, delay } },
});

type Tag = "div" | "dl" | "section" | "ul" | "ol" | "li" | "p" | "h2" | "h3" | "header" | "article" | "span";

type RevealProps = {
  as?: Tag;
  className?: string;
  children: React.ReactNode;
  delay?: number;
  /** Fraction of the element that must be visible before it reveals */
  amount?: number;
};

/** Fade + slight rise when scrolled into view. Reduced motion → opacity only (via MotionConfig). */
export function Reveal({ as = "div", className, children, delay = 0, amount = 0.3 }: RevealProps) {
  const Component = m[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={delay ? fadeUpDelayed(delay) : fadeUp}
    >
      {children}
    </Component>
  );
}

/** Parent that staggers any <RevealItem> children. */
export function RevealGroup({
  as = "div",
  className,
  children,
  delay = 0,
  stagger,
  amount = 0.15,
}: RevealProps & { stagger?: number }) {
  const Component = m[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={container(delay, stagger)}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  as = "div",
  className,
  children,
}: {
  as?: Tag;
  className?: string;
  children: React.ReactNode;
}) {
  const Component = m[as];
  return (
    <Component className={className} variants={fadeUp}>
      {children}
    </Component>
  );
}
