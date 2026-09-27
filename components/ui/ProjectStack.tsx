"use client";

import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import type { Project } from "@/lib/content";
import { useMediaQuery } from "@/lib/hooks";

/**
 * Sticky stacked-scroll: each project pins below the nav and the ones
 * beneath recede (scale + dim) as the next card slides over them.
 * Mobile / reduced motion → a plain vertical list.
 */
export function ProjectStack({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const stacked = wide && !reduce;
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
        />
      ))}
    </ol>
  );
}

function ProjectCard({
  project: p,
  i,
  n,
  progress,
  stacked,
}: {
  project: Project;
  i: number;
  n: number;
  progress: MotionValue<number>;
  stacked: boolean;
}) {
  const start = i / n;
  const scale = useTransform(progress, [start, 1], [1, 1 - (n - 1 - i) * 0.035]);
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / n)], [0, i === n - 1 ? 0 : 0.5]);

  return (
    <li
      className="md:sticky"
      style={stacked ? { top: `calc(var(--nav-h) + 1.5rem + ${i * 1.1}rem)` } : undefined}
    >
      <m.article
        style={stacked ? { scale, transformOrigin: "50% 0%" } : undefined}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 110, damping: 20 }}
        className="group relative overflow-hidden rounded-2xl border border-line bg-ink-raised"
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
            <span
              aria-hidden
              className="hidden font-display text-[clamp(6rem,4rem+10vw,14rem)] md:block font-light italic leading-none text-line-strong transition-colors duration-700 group-hover:text-accent"
            >
              {p.index}
            </span>
          </div>

          <div className="flex flex-col justify-end md:col-span-7">
            <p className="label">{p.kicker}</p>
            <h3 id={`project-${i}`} className="mt-4 font-display text-display-md text-balance">
              {p.name}
            </h3>
            <p className="mt-5 max-w-xl text-lg text-bone-soft text-pretty">{p.summary}</p>
            <ul className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-3 text-sm leading-relaxed text-bone-soft sm:text-base">
                  <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-accent" />
                  {pt}
                </li>
              ))}
            </ul>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Focus areas">
              {p.tags.map((t) => (
                <li key={t} className="label rounded-full bg-accent-soft px-3 py-1 text-bone-soft">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {stacked ? (
          <m.div aria-hidden className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: dim }} />
        ) : null}
      </m.article>
    </li>
  );
}
