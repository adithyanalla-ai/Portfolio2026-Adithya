"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { ThemeProvider } from "./ThemeProvider";

/**
 * LazyMotion + `m` components keep the Framer Motion bundle small.
 * reducedMotion="user" makes every transform animation respect the OS setting.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
