"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/content";
import { container, fadeUp, spring } from "@/lib/motion";
import { ThemeToggle } from "./ThemeToggle";

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    // A thin band across the middle of the viewport decides which section is "current".
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const ids = nav.map((n) => n.id);

export function Nav() {
  const active = useActiveSection(ids);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled && !open
          ? "border-b border-line bg-ink/75 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="container-x flex h-[var(--nav-h)] items-center justify-between">
        <a
          href="#top"
          className="group flex items-baseline gap-2"
          onClick={() => setOpen(false)}
        >
          <span aria-hidden className="font-display text-xl italic">AR</span>
          <span aria-hidden className="label hidden transition-colors group-hover:text-bone sm:inline">
            {site.name}
          </span>
          <span className="sr-only">{site.name}, back to top</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors duration-300 ${
                    isActive ? "text-bone" : "text-muted hover:text-bone"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-1 rounded-full bg-accent transition-all duration-500 ease-[var(--ease-spring)] ${
                      isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            ref={menuButton}
            type="button"
            className="grid size-10 place-items-center rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3 w-5" aria-hidden>
              <m.span
                className="absolute left-0 top-0 h-px w-5 bg-bone"
                animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
                transition={spring.snappy}
              />
              <m.span
                className="absolute bottom-0 left-0 h-px w-5 bg-bone"
                animate={open ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }}
                transition={spring.snappy}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-menu"
            key="menu"
            className="fixed inset-0 top-[var(--nav-h)] z-40 flex flex-col justify-between bg-ink px-[var(--gutter)] pb-10 pt-8 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <m.ul
              className="flex flex-col gap-2"
              initial="hidden"
              animate="visible"
              variants={container(0.05, 0.05)}
            >
              {nav.map((item, i) => (
                <m.li key={item.id} variants={fadeUp}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-line py-3"
                  >
                    <span className="label text-accent">0{i + 1}</span>
                    <span className="font-display text-4xl">{item.label}</span>
                  </a>
                </m.li>
              ))}
            </m.ul>
            <p className="label">{site.location}</p>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
