"use client";

import { m } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { spring } from "@/lib/motion";

/** Sun ↔ moon morph: a mask circle slides in to carve the crescent, rays retract. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      aria-pressed={!dark}
      className={`group relative grid size-10 place-items-center rounded-full text-primary transition-colors hover:bg-accent-soft ${className}`}
      data-cursor="hover"
    >
      <m.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden
        animate={{ rotate: dark ? 40 : 90 }}
        transition={spring.snappy}
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <m.circle
            r="9"
            fill="black"
            initial={false}
            animate={{ cx: dark ? 17 : 32, cy: dark ? 5 : -8 }}
            transition={spring.snappy}
          />
        </mask>
        <m.circle
          cx="12"
          cy="12"
          fill="currentColor"
          stroke="none"
          mask="url(#moon-mask)"
          initial={false}
          animate={{ r: dark ? 8 : 4.5 }}
          transition={spring.snappy}
        />
        <m.g
          initial={false}
          animate={{ opacity: dark ? 0 : 1, scale: dark ? 0.5 : 1 }}
          style={{ transformOrigin: "12px 12px" }}
          transition={spring.snappy}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="12" y1="2" x2="12" y2="4" transform={`rotate(${deg} 12 12)`} />
          ))}
        </m.g>
      </m.svg>
    </button>
  );
}
