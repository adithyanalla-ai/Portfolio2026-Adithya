"use client";

import { m, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { figures, figureSrc } from "@/lib/figures";
import { Arrow } from "./Arrow";
import { LeadPipeline } from "./LeadPipeline";
import type { Project } from "@/lib/content";
import { useHydratedReducedMotion } from "@/lib/hooks";

/**
 * Sticky stacked-scroll on every screen size: each project pins and the ones beneath
 * recede (scale + dim) as the next card slides over them.
 *
 * Cards shorter than the screen pin just below the nav (with a small stair-step offset).
 * Cards taller than the screen pin by their *bottom* edge instead (a negative sticky top),
 * so the whole card scrolls past before it holds and the next one covers it: nothing is
 * ever hidden unread, whatever the viewport height, zoom level or card length.
 * Reduced motion → a plain list.
 */
export function ProjectStack({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useHydratedReducedMotion();
  const layout = useStackLayout(ref, projects.length);
  const stacked = !reduce;
  // Page scroll in px. (A target-relative progress would go stale: useScroll measures the list
  // once, but the list keeps growing as images load and cover heights are applied.)
  const { scrollY } = useScroll();

  return (
    <ol ref={ref} className="relative flex flex-col gap-[8vh] md:gap-[12vh]">
      {projects.map((p, i) => (
        <ProjectCard
          key={p.name}
          project={p}
          i={i}
          n={projects.length}
          scrollY={scrollY}
          end={layout.end}
          stacked={stacked}
          top={layout.tops[i]}
          bottomPinned={layout.bottomPinned[i]}
          minHeight={layout.minHeights[i]}
          overlap={layout.windows[i]}
          nextOverlap={layout.windows[i + 1]}
        />
      ))}
    </ol>
  );
}

type StackLayout = {
  tops: number[];
  bottomPinned: boolean[];
  minHeights: number[];
  windows: ([number, number] | undefined)[];
  /** Page scroll (px) at which the list's end reaches the bottom of the screen. */
  end?: number;
};

/**
 * Measures the cards and returns, per card: its sticky `top` (px), whether it pins by its
 * bottom edge, a min-height so it fully covers every card pinned beneath it (a tall,
 * bottom-pinned card must not peek out below a shorter card stacked over it), and the
 * page-scroll window (px) [next card reaches mid-screen, next card pins] in which it recedes.
 */
function useStackLayout(ref: React.RefObject<HTMLOListElement | null>, n: number) {
  const [layout, setLayout] = useState<StackLayout>({ tops: [], bottomPinned: [], minHeights: [], windows: [] });
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const items = [...list.children] as HTMLElement[];
      const vh = window.innerHeight;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const nav = document.querySelector("header")?.getBoundingClientRect().height ?? 68;
      // Natural content height: the card's inner grid (unaffected by our min-height and by
      // the scale transform) plus the article's 1px borders.
      const heights = items.map((el) => {
        const inner = el.querySelector("article")?.firstElementChild as HTMLElement | null;
        return inner ? inner.offsetHeight + 2 : el.offsetHeight;
      });
      const base = items.map((_, i) => nav + 1.5 * rem + i * 1.1 * rem);
      const tops = heights.map((h, i) => Math.min(base[i], vh - h - 16));
      const bottomPinned = tops.map((t, i) => t < base[i]);

      // Each card reaches at least as low as the lowest pinned card beneath it.
      const minHeights: number[] = [];
      const effective: number[] = [];
      let lowest = -Infinity;
      heights.forEach((h, i) => {
        const need = Math.ceil(lowest - tops[i]) + 1;
        minHeights.push(need > h ? need : 0);
        effective.push(Math.max(h, minHeights[i]));
        lowest = Math.max(lowest, tops[i] + effective[i]);
      });

      // Natural (un-stuck) page position of each item: the list's top + previous heights + the
      // row gap (offsetTop can't be used: sticky items report their shifted position).
      const listTop = list.getBoundingClientRect().top + window.scrollY;
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
      const natural: number[] = [];
      effective.forEach((_, i) => natural.push(i === 0 ? listTop : natural[i - 1] + effective[i - 1] + gap));
      const end = natural[n - 1] + effective[n - 1] - vh; // page scroll where the list's end meets the screen's
      // In page-scroll px: card i+1's top reaches 55% of the screen → card i+1 pins.
      const windows = items.map((_, i) => {
        if (i === n - 1) return undefined;
        const enters = Math.round(natural[i + 1] - vh * 0.55);
        const pins = Math.round(natural[i + 1] - tops[i + 1]);
        return [enters, Math.max(enters + 1, pins)] as [number, number];
      });
      const next = { tops, bottomPinned, minHeights, windows, end: Math.round(end) };
      setLayout((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    // Re-measure when the cards or anything above them change size (images loading, fonts, resize).
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, n]);
  return layout;
}

function ProjectCard({
  project: p,
  i,
  n,
  scrollY,
  end,
  stacked,
  top,
  bottomPinned,
  minHeight,
  overlap,
  nextOverlap,
}: {
  project: Project;
  i: number;
  n: number;
  scrollY: MotionValue<number>;
  /** Page scroll (px) at which the list ends. */
  end?: number;
  stacked: boolean;
  /** Sticky top in px (negative for cards taller than the screen, which pin by their bottom). */
  top?: number;
  bottomPinned?: boolean;
  /** Min height (px) so the card covers the cards pinned beneath it. */
  minHeight?: number;
  /** Page-scroll window (px) in which the next card slides over this one: [enters screen, pins]. */
  overlap?: [number, number];
  /** The next card's window: while the card after next slides in, this one fades further back. */
  nextOverlap?: [number, number];
}) {
  // Recede only while the next card is actually sliding over this one, so the card you're
  // reading stays at full size and brightness while pinned. Before measurement: no effect.
  const [from, to] = overlap ?? [1e9, 1e9 + 1];
  const last = i === n - 1;
  const scale = useTransform(scrollY, [from, Math.max(from + 1, end ?? from + 1)], [1, 1 - (n - 1 - i) * 0.035]);
  const figs = (p.images ?? []).map((k) => figures[k]).filter(Boolean);
  // A diagram or logo takes the main spot and every figure becomes a thumbnail; otherwise the first figure leads.
  const main = p.logo ? undefined : figs[0];
  const thumbs = p.logo ? figs : figs.slice(1);
  // Half-dim while the next card slides over; nearly hidden once it is two cards deep, so only
  // clean edges show in the stair-step above the active card.
  const deepEnd = Math.max(to + 1, nextOverlap?.[1] ?? end ?? to + 1);
  // A bottom-pinned (tall) card shows real content, not just an edge, above the next card: fade it further.
  const dim = useTransform(scrollY, [from, to, deepEnd], last ? [0, 0, 0] : [0, bottomPinned ? 0.85 : 0.5, 0.9]);

  return (
    <li
      className={stacked ? "sticky" : undefined}
      // Before measurement (first paint) fall back to the stair-step below the nav.
      style={stacked ? { top: top !== undefined ? `${Math.round(top)}px` : `calc(var(--nav-h) + 1.5rem + ${i * 1.1}rem)` } : undefined}
    >
      <m.article
        style={
          stacked
            ? {
                scale,
                transformOrigin: bottomPinned ? "50% 100%" : "50% 0%",
                minHeight: minHeight ? `${minHeight}px` : undefined,
              }
            : undefined
        }
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 110, damping: 20 }}
        className="group relative flex flex-col justify-center overflow-hidden rounded-2xl border border-line bg-surface-raised"
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
            {p.diagram === "lead-pipeline" ? (
              <LeadPipeline className="mx-auto w-full max-w-[20rem]" />
            ) : p.logo ? (
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
        {stacked ? (
          <m.div aria-hidden className="pointer-events-none absolute inset-0 bg-surface" style={{ opacity: dim }} />
        ) : null}
      </m.article>
    </li>
  );
}
