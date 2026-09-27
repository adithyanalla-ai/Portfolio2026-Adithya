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

/** True on devices with a precise hovering pointer and no reduced-motion preference. */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
}
