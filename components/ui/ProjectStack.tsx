"use client";

import { m, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { figures, figureSrc } from "@/lib/figures";
import { Arrow } from "./Arrow";
import type { Project } from "@/lib/content";
import { useHydratedReducedMotion, useMediaQuery } from "@/lib/hooks";

/**
 * Sticky stacked-scroll: each project pins below the nav and the ones
 * beneath recede (scale + dim) as the next card slides over them.
 * Where pinning would hide content (phones, short laptops, landscape tablets) the
 * cards scroll normally but keep the same motion: each one recedes (scale + dim)
 * as its end leaves the screen. Reduced motion → a plain list.
 */
export function ProjectStack({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useHydratedReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const fits = useCardsFitViewport(ref, projects.length);
  const windows = useOverlapWindows(ref, projects.length);
  const stacked = wide && !reduce && fits;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <ol ref={ref} className="relative flex flex-col gap-6 md:gap-[12vh]">
      {projects.map((p, i) => (
        <ProjectCard
          key={p.name}
          project={p}
          i={i}
          n={projects.length}
          progress={scrollYProgress}
          stacked={stacked}
          recede={!stacked && !reduce}
          overlap={windows[i]}
        />
      ))}
    </ol>
  );
}

/** True when the tallest card, pinned below the nav with its stack offset, fits in the viewport. */
function useCardsFitViewport(ref: React.RefObject<HTMLOListElement | null>, n: number) {
  const [fits, setFits] = useState(false);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const nav = document.querySelector("header")?.getBoundingClientRect().height ?? 68;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // offsetHeight ignores the scale transform applied while stacking
      const tallest = Math.max(...[...list.querySelectorAll("article")].map((a) => (a as HTMLElement).offsetHeight));
      const topOffset = nav + 1.5 * rem + (n - 1) * 1.1 * rem;
      setFits(tallest + topOffset + 16 <= window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, n]);
  return fits;
}

/**
 * For each card, the section scroll progress (0–1, matching useScroll's "start start" → "end end")
 * at which the NEXT card reaches mid-screen and at which it reaches its pinned spot.
 */
function useOverlapWindows(ref: React.RefObject<HTMLOListElement | null>, n: number) {
  const [windows, setWindows] = useState<([number, number] | undefined)[]>([]);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const items = [...list.children] as HTMLElement[];
      const vh = window.innerHeight;
      const range = list.offsetHeight - vh;
      if (range <= 0) return;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const nav = document.querySelector("header")?.getBoundingClientRect().height ?? 68;
      const clamp = (v: number) => Math.min(1, Math.max(0, v));
      // Natural (un-stuck) position of each item: sum of previous heights + the list's row gap.
      // offsetTop can't be used because sticky items report their shifted position.
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
      const tops: number[] = [];
      items.forEach((el, i) => tops.push(i === 0 ? 0 : tops[i - 1] + items[i - 1].offsetHeight + gap));
      setWindows(
        items.map((_, i) => {
          if (i === n - 1) return undefined;
          const nextTop = tops[i + 1];
          const pinAt = nav + 1.5 * rem + (i + 1) * 1.1 * rem;
          // start receding once the next card's top reaches mid-screen, not the moment it peeks in
          const enters = clamp((nextTop - vh * 0.55) / range);
          const pins = clamp((nextTop - pinAt) / range);
          return [enters, Math.max(enters + 0.001, pins)] as [number, number];
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, n]);
  return windows;
}

function ProjectCard({
  project: p,
  i,
  n,
  progress,
  stacked,
  recede,
  overlap,
}: {
  project: Project;
  i: number;
  n: number;
  progress: MotionValue<number>;
  stacked: boolean;
  recede: boolean;
  /** Scroll-progress window in which the next card slides over this one: [enters screen, pins]. */
  overlap?: [number, number];
}) {
  const itemRef = useRef<HTMLLIElement>(null);
  // Unpinned layouts: 0 when the card's end is a third of the way up the screen, 1 once it has left the top.
  const { scrollYProgress: leave } = useScroll({ target: itemRef, offset: ["end 0.35", "end start"] });
  const leaveScale = useTransform(leave, [0, 1], [1, 0.94]);
  const leaveDim = useTransform(leave, [0, 1], [0, 0.45]);
  const start = i / n;
  // Recede only while the next card is actually sliding over this one, so the card you're
  // reading stays at full size and brightness while pinned. Fallback before measurement: equal slots.
  const [from, to] = overlap ?? [Math.min(1, start + 0.5 / n), Math.min(1, start + 1 / n)];
  const last = i === n - 1;
  const scale = useTransform(progress, [from, Math.max(from + 0.001, 1)], [1, 1 - (n - 1 - i) * 0.035]);
  const figs = (p.images ?? []).map((k) => figures[k]).filter(Boolean);
  // A logo takes the main spot and every figure becomes a thumbnail; otherwise the first figure leads.
  const main = p.logo ? undefined : figs[0];
  const thumbs = p.logo ? figs : figs.slice(1);
  const dim = useTransform(progress, [from, Math.max(from + 0.001, to)], [0, last ? 0 : 0.5]);

  return (
    <li
      ref={itemRef}
      className={stacked ? "sticky" : undefined}
      style={stacked ? { top: `calc(var(--nav-h) + 1.5rem + ${i * 1.1}rem)` } : undefined}
    >
      <m.article
        style={
          stacked
            ? { scale, transformOrigin: "50% 0%" }
            : recede
              ? { scale: leaveScale, transformOrigin: "50% 100%" }
              : undefined
        }
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 110, damping: 20 }}
        className="group relative overflow-hidden rounded-2xl border border-line bg-surface-raised"
        aria-labelledby={`project-${i}`}
      >
        <div className="grid gap-10 p-6 sm:p-10 md:min-h-[62vh] md:grid-cols-12 md:p-14">
          <div className="flex flex-col justify-between gap-10 md:col-span-5">
            <div className="flex items-center justify-between">
              <span className="label text-accent">{p.index} / 0{n}</span>
              {p.meta ? (
                <span className="label rounded-full border border-line px-3 py-1">{p.meta}</span>
              ) : null}
            </div>
            {p.logo ? (
              <Link
                href={p.href ?? "#work"}
                className="group/logo mx-auto flex w-full max-w-[18rem] items-center justify-center rounded-3xl border border-line bg-[#fefefe] p-6 transition-[border-color,translate,scale] duration-500 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:border-line-strong active:scale-[0.985] active:duration-150 md:max-w-[20rem] md:p-8"
                aria-label={`${p.name}: read the write-up`}
              >
                <Image
                  src={`${p.logo}-512.webp`}
                  width={512}
                  height={512}
                  alt={`${p.name} logo: a friendly robot rising from two green leaves`}
                  sizes="(min-width: 768px) 20rem, 18rem"
                  unoptimized
                  className="h-auto w-full transition-[scale] duration-700 ease-[var(--ease-spring)] group-hover/logo:scale-[1.03]"
                />
              </Link>
            ) : main ? (
              <a
                href={figureSrc(main, 1600)}
                className="block overflow-hidden rounded-xl border border-line bg-white transition-[border-color,translate,scale] duration-500 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:border-line-strong active:scale-[0.985] active:duration-150"
                aria-label={`Open full-size image: ${main.alt}`}
              >
                <Image
                  src={figureSrc(main, 800)}
                  width={800}
                  height={Math.round((800 * main.height) / main.width)}
                  alt={main.alt}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="mx-auto h-auto max-h-[38vh] w-auto object-contain md:max-h-[42vh]"
                />
              </a>
            ) : (
              <span
                aria-hidden
                className="hidden font-display text-[clamp(6rem,4rem+10vw,14rem)] md:block font-light italic leading-none text-line-strong transition-colors duration-700 group-hover:text-accent"
              >
                {p.index}
              </span>
            )}
          </div>

          <div className="flex flex-col justify-end md:col-span-7">
            <p className="label">{p.kicker}</p>
            <h3 id={`project-${i}`} className="mt-4 font-display text-h3">
              {p.name}
            </h3>
            <p className="mt-5 max-w-xl text-lg text-secondary text-pretty">{p.summary}</p>
            <ul className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-3 text-sm leading-relaxed text-secondary sm:text-base">
                  <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-accent" />
                  {pt}
                </li>
              ))}
            </ul>
            {thumbs.length ? (
              <ul
                className={`mt-6 grid gap-2 ${thumbs.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}
                aria-label={`${p.name} patent figures`}
              >
                {thumbs.map((f) => (
                  <li key={f.base}>
                    <a
                      href={figureSrc(f, 1600)}
                      className="block overflow-hidden rounded-lg border border-line bg-white transition-[border-color,translate,scale] duration-500 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:border-line-strong"
                      aria-label={`Open full-size image: ${f.alt}`}
                    >
                      <Image
                        src={figureSrc(f, 800)}
                        width={800}
                        height={Math.round((800 * f.height) / f.width)}
                        alt=""
                        sizes="12rem"
                        className="aspect-[3/2] h-auto w-full object-contain"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <ul className="flex flex-wrap gap-2" aria-label="Focus areas">
                {p.tags.map((t) => (
                  <li key={t} className="label rounded-full bg-accent-soft px-3 py-1 text-secondary">
                    {t}
                  </li>
                ))}
              </ul>
              {p.href ? (
                <Link href={p.href} className="tap group/link inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover">
                  <span className="link-draw">Read the write-up</span>
                  <span className="transition-transform duration-500 ease-[var(--ease-spring)] group-hover/link:translate-x-0.5">
                    <Arrow direction="right" />
                  </span>
                  <span className="sr-only">about {p.name}</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        {stacked || recede ? (
          <m.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-surface"
            style={{ opacity: stacked ? dim : leaveDim }}
          />
        ) : null}
      </m.article>
    </li>
  );
}
