"use client";

import { AnimatePresence, m } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { marketing } from "@/lib/content";
import { spring } from "@/lib/motion";

const TABS = [
  { id: "impact", label: "Impact" },
  { id: "experience", label: "Experience" },
  { id: "campaigns", label: "Campaigns" },
  { id: "skills", label: "Skills" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: spring.snappy } };

/**
 * Segmented toggle over the growth-marketing résumé. A pill slides under the active tab
 * (measured, so it works without layout animations); full ARIA tabs pattern with
 * arrow / Home / End keys.
 */
export function MarketingTabs() {
  const [active, setActive] = useState<TabId>("impact");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const index = TABS.findIndex((t) => t.id === active);

  useLayoutEffect(() => {
    const place = () => {
      const el = tabs.current[index];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    place();
    window.addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener("resize", place);
  }, [index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = TABS.length - 1;
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(TABS[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-2">
        <div
          role="tablist"
          aria-label="Marketing résumé"
          onKeyDown={onKeyDown}
          className="relative inline-flex rounded-full border border-line bg-surface-sunken p-1"
        >
          {pill ? (
            <span
              aria-hidden
              className="absolute top-1 bottom-1 rounded-full bg-accent transition-[left,width] duration-500 ease-[var(--ease-spring)]"
              style={{ left: pill.left, width: pill.width }}
            />
          ) : null}
          {TABS.map((t, i) => {
            const selected = t.id === active;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`mkt-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`mkt-panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(t.id)}
                className={`tap relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 sm:px-6 ${
                  selected ? "text-on-accent" : pill ? "text-secondary hover:text-primary" : "text-secondary"
                } ${selected && !pill ? "bg-accent" : ""}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-10 min-h-[24rem]">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={active}
            role="tabpanel"
            id={`mkt-panel-${active}`}
            aria-labelledby={`mkt-tab-${active}`}
            tabIndex={0}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={spring.snappy}
          >
            {active === "impact" ? <Impact /> : null}
            {active === "experience" ? <Roles /> : null}
            {active === "campaigns" ? <Campaigns /> : null}
            {active === "skills" ? <Competencies /> : null}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Impact() {
  return (
    <div>
      <m.ul
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5"
      >
        {marketing.stats.map((s, i) => (
          <m.li
            key={s.label}
            variants={item}
            className={`bg-surface p-6 sm:p-8 ${i === marketing.stats.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <p className="font-display text-4xl text-accent md:text-5xl">{s.value}</p>
            <p className="label mt-3">{s.label}</p>
          </m.li>
        ))}
      </m.ul>
      <p className="mt-10 max-w-3xl text-lg leading-relaxed text-secondary text-pretty">{marketing.summary}</p>
    </div>
  );
}

function Roles() {
  return (
    <m.ol variants={stagger} initial="hidden" animate="visible" className="border-t border-line">
      {marketing.roles.map((r) => (
        <m.li key={r.title} variants={item} className="grid gap-6 border-b border-line py-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="label">{r.period}</p>
            <h3 className="mt-3 font-display text-2xl text-balance">{r.title}</h3>
            <p className="mt-2 text-secondary">{r.company}</p>
          </div>
          <ul className="flex flex-col gap-4 md:col-span-8">
            {r.points.map((pt) => (
              <li key={pt} className="flex gap-3 leading-relaxed text-secondary text-pretty">
                <span aria-hidden className="mt-3 h-px w-3 shrink-0 bg-accent" />
                {pt}
              </li>
            ))}
          </ul>
        </m.li>
      ))}
    </m.ol>
  );
}

function Campaigns() {
  return (
    <m.ul variants={stagger} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2">
      {marketing.campaigns.map((c) => (
        <m.li key={c.name} variants={item} className="flex flex-col rounded-2xl border border-line bg-surface-raised p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="label rounded-full bg-accent-soft px-3 py-1 text-secondary">{c.tag}</span>
            <span className="label">{c.period}</span>
          </div>
          <h3 className="mt-6 font-display text-2xl text-balance">{c.name}</h3>
          <p className="mt-4 font-display text-4xl text-accent">{c.highlight}</p>
          <ul className="mt-6 flex flex-col gap-3 border-t border-line pt-6">
            {c.points.map((pt) => (
              <li key={pt} className="flex gap-3 text-sm leading-relaxed text-secondary text-pretty sm:text-base">
                <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-accent" />
                {pt}
              </li>
            ))}
          </ul>
        </m.li>
      ))}
    </m.ul>
  );
}

function Competencies() {
  return (
    <div>
      <m.dl variants={stagger} initial="hidden" animate="visible" className="border-t border-line">
        {marketing.competencies.map((g) => (
          <m.div key={g.label} variants={item} className="grid gap-4 border-b border-line py-6 md:grid-cols-12">
            <dt className="label pt-1.5 md:col-span-3">{g.label}</dt>
            <dd className="flex flex-wrap gap-2 md:col-span-9">
              {g.items.map((s) => (
                <span key={s} className="rounded-full border border-line px-3 py-1 text-sm text-secondary">
                  {s}
                </span>
              ))}
            </dd>
          </m.div>
        ))}
      </m.dl>
      <p className="mt-8 flex gap-3 text-secondary">
        <span className="label pt-1 text-accent">Leadership</span>
        <span className="text-pretty">{marketing.leadership}</span>
      </p>
    </div>
  );
}
