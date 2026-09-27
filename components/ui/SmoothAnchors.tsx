"use client";

import { animate } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Spring-driven anchor scrolling for every in-page link ("#id" or "/#id" on the home page).
 * The spring is interrupted the moment the visitor scrolls themselves.
 * Reduced motion → an instant jump. Focus moves to the target for keyboard/screen-reader users.
 */
export function SmoothAnchors() {
  const pathname = usePathname();

  useEffect(() => {
    let controls: ReturnType<typeof animate> | null = null;
    const stop = () => controls?.stop();

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a");
      const href = a?.getAttribute("href");
      if (!a || !href) return;

      let hash: string | null = null;
      if (href.startsWith("#")) hash = href;
      else if (href.startsWith("/#") && pathname === "/") hash = href.slice(1);
      if (!hash) return;

      const id = decodeURIComponent(hash.slice(1));
      const target = id === "top" || id === "" ? document.body : document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 68;
      const top = target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY - navH;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      stop();
      if (reduce) {
        window.scrollTo(0, top);
      } else {
        controls = animate(window.scrollY, top, {
          type: "spring",
          stiffness: 90,
          damping: 22,
          mass: 1,
          restDelta: 0.5,
          onUpdate: (v) => window.scrollTo(0, v),
        });
      }

      history.pushState(null, "", id === "top" ? pathname : `#${id}`);
      if (target !== document.body) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };

    document.addEventListener("click", onClick);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      stop();
      document.removeEventListener("click", onClick);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [pathname]);

  return null;
}
