import type { Transition, Variants } from "framer-motion";

/** Motion scale — springs, never linear. */
export const spring = {
  /** Section entrances, large moves */
  soft: { type: "spring", stiffness: 120, damping: 20, mass: 0.9 } as Transition,
  /** Micro-interactions: buttons, toggles, cursor */
  snappy: { type: "spring", stiffness: 300, damping: 30 } as Transition,
  /** Hero kinetic type */
  heavy: { type: "spring", stiffness: 80, damping: 18, mass: 1.2 } as Transition,
};

export const stagger = 0.06;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: spring.soft },
};

export const container = (delayChildren = 0, staggerChildren = stagger): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});
