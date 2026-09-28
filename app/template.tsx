"use client";

import { useEffect, useState } from "react";

// Survives across template remounts: false only until the first page has hydrated.
let hasNavigated = false;

/**
 * Page transition. A template remounts on every client-side navigation, so each new page
 * gets a short CSS fade-and-rise. The very first page load is skipped (the hero has its own
 * entrance, and delaying first paint would hurt LCP). The animation uses fill-mode
 * `backwards`, so no transform lingers afterwards to break sticky/fixed children.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => hasNavigated);
  useEffect(() => {
    hasNavigated = true;
  }, []);
  return <div className={animate ? "page-enter" : undefined}>{children}</div>;
}
