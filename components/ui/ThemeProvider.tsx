"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

function readStored(): Theme | null {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

/** Apply a theme with a brief token cross-fade (class is removed once it settles). */
function applyTheme(next: Theme, animate: boolean) {
  const root = document.documentElement;
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 500);
  }
  root.dataset.theme = next;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const themeRef = useRef<Theme>("dark");

  useEffect(() => {
    // Sync with whatever the pre-paint script applied.
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    themeRef.current = current;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from DOM
    setTheme(current);

    // Until the visitor picks a theme, keep following the OS setting.
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (readStored()) return;
      const next: Theme = mql.matches ? "light" : "dark";
      themeRef.current = next;
      applyTheme(next, true);
      setTheme(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = themeRef.current === "dark" ? "light" : "dark";
    themeRef.current = next;
    applyTheme(next, true);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage blocked: theme still applies for this visit */
    }
    setTheme(next);
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
