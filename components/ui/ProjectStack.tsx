"use client";

import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { figures, figureSrc } from "@/lib/figures";
import { Arrow } from "./Arrow";
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
  const main = p.images?.[0] ? figures[p.images[0]] : undefined;
  const thumbs = (p.images ?? []).slice(1).map((k) => figures[k]).filter(Boolean);
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
            {main ? (
              <a
                href={figureSrc(main, 1600)}
                className="block overflow-hidden rounded-xl border border-line bg-white transition-[border-color,transform] duration-500 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:border-line-strong"
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
              <ul className="mt-6 grid grid-cols-3 gap-2" aria-label={`More ${p.name} figures`}>
                {thumbs.map((f) => (
                  <li key={f.base}>
                    <a
                      href={figureSrc(f, 1600)}
                      className="block overflow-hidden rounded-lg border border-line bg-white transition-[border-color,transform] duration-500 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:border-line-strong"
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
                <Link href={p.href} className="group/link inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover">
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
