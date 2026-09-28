"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * prefers-reduced-motion, but always `false` on the server and the first client render.
 * Use it wherever the answer changes what gets *rendered* (not just animation values):
 * framer's useReducedMotion reads the media query synchronously on the client, which makes
 * the first client render differ from the server HTML and triggers a hydration error (#418).
 */
export function useHydratedReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
