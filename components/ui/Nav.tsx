"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isHomePath, isOnRoute, nav, navHref, site, type NavItem } from "@/lib/content";
import { container, fadeUp, spring } from "@/lib/motion";
import { ThemeToggle } from "./ThemeToggle";

const sectionIds = nav.filter((n) => !n.href).map((n) => n.id);

/** Active section via IntersectionObserver: a thin band across the middle of the viewport decides. */
function useActiveSection(ids: readonly string[], enabled: boolean) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    if (!enabled) return;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
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
  }, [ids, enabled]);
  return enabled ? active : "";
}

/** Same-page hash links stay plain <a> (spring-scrolled by SmoothAnchors); everything else routes via next/link. */
function NavLink({
  item,
  onHome,
  className,
  onClick,
  children,
  current,
}: {
  item: NavItem;
  onHome: boolean;
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
  current: boolean;
}) {
  const href = navHref(item, onHome);
  const aria = current ? (item.href ? "page" : "location") : undefined;
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} onClick={onClick} aria-current={aria}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick} aria-current={aria}>
      {children}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const onHome = isHomePath(pathname);
  const activeSection = useActiveSection(sectionIds, onHome);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  const isCurrent = (item: NavItem) =>
    item.href ? isOnRoute(pathname, item.href) : item.id === activeSection;

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

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mql.matches && setOpen(false);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled && !open ? "border-b border-line bg-surface/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="container-x flex h-[var(--nav-bar)] items-center justify-between gap-4">
        {onHome ? (
          <a href="#top" className="group flex items-baseline gap-2" onClick={close}>
            <Logo />
          </a>
        ) : (
          <Link href="/" className="group flex items-baseline gap-2" onClick={close}>
            <Logo />
          </Link>
        )}

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const current = isCurrent(item);
            return (
              <li key={item.id}>
                <NavLink
                  item={item}
                  onHome={onHome}
                  current={current}
                  className={`relative flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors duration-300 ${
                    current ? "text-primary" : "text-muted hover:text-primary"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-1 rounded-full bg-accent transition-all duration-500 ease-[var(--ease-spring)] ${
                      current ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            ref={menuButton}
            type="button"
            className="grid size-11 place-items-center rounded-full transition-colors hover:bg-accent-soft lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3 w-5" aria-hidden>
              <m.span
                className="absolute left-0 top-0 h-px w-5 bg-primary"
                animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
                transition={spring.snappy}
              />
              <m.span
                className="absolute bottom-0 left-0 h-px w-5 bg-primary"
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
            className="fixed inset-0 top-[var(--nav-h)] z-40 flex flex-col justify-between gap-8 overflow-y-auto overscroll-contain bg-surface px-[max(var(--gutter),env(safe-area-inset-left))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <m.ul className="flex flex-col" initial="hidden" animate="visible" variants={reduce ? container(0, 0) : container(0.05, 0.05)}>
              {nav.map((item) => (
                <m.li key={item.id} variants={fadeUp}>
                  <NavLink
                    item={item}
                    onHome={onHome}
                    current={isCurrent(item)}
                    onClick={close}
                    className="flex min-h-12 items-center justify-between border-b border-line py-3 [@media(max-height:480px)]:py-2"
                  >
                    <span className="font-display text-h3">{item.label}</span>
                    {isCurrent(item) ? <span aria-hidden className="size-1.5 rounded-full bg-accent" /> : null}
                  </NavLink>
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

function Logo() {
  return (
    <>
      <span aria-hidden className="font-display text-xl italic">
        AR
      </span>
      <span aria-hidden className="label hidden transition-colors group-hover:text-primary sm:inline">
        {site.name}
      </span>
      <span className="sr-only">{site.name}, home</span>
    </>
  );
}
