"use client";

import { AnimatePresence, m } from "framer-motion";
import { useRef, useState } from "react";
import type { SkillGroup } from "@/lib/content";
import { spring } from "@/lib/motion";

/**
 * Vertical tablist of skill categories with a single focused panel —
 * reads like an index, not a wall of badges. Full ARIA tabs pattern
 * with arrow / Home / End keyboard support.
 */
export function SkillExplorer({ groups }: { groups: SkillGroup[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = groups[active];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = groups.length - 1;
    let next = active;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div
        role="tablist"
        aria-label="Skill categories"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 md:col-span-5 md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:px-0 md:pb-0"
      >
        {groups.map((g, i) => {
          const selected = i === active;
          return (
            <button
              key={g.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`tab-${g.id}`}
              aria-selected={selected}
              aria-controls={`panel-${g.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`group flex shrink-0 items-baseline gap-4 whitespace-nowrap rounded-full border px-4 py-2 text-left transition-colors duration-300 md:whitespace-normal md:rounded-none md:border-0 md:border-b md:border-line md:px-0 md:py-5 ${
                selected
                  ? "border-accent text-bone"
                  : "border-line text-muted hover:text-bone"
              }`}
            >
              <span className={`label hidden md:inline ${selected ? "text-accent" : ""}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm md:font-display md:text-3xl md:transition-transform md:duration-500 md:ease-[var(--ease-spring)] md:group-aria-selected:translate-x-2">
                {g.label}
              </span>
              <span className="label ml-auto hidden md:inline">{g.items.length}</span>
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[22rem] md:col-span-6 md:col-start-7">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={group.id}
            role="tabpanel"
            id={`panel-${group.id}`}
            aria-labelledby={`tab-${group.id}`}
            tabIndex={0}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={spring.snappy}
            className="rounded-2xl border border-line p-6 sm:p-10"
          >
            <p className="label">{group.label}</p>
            <p className="mt-3 font-display text-2xl text-bone text-balance">{group.blurb}</p>
            <m.ul
              className="mt-8"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {group.items.map((item, i) => (
                <m.li
                  key={item}
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    visible: { opacity: 1, x: 0, transition: spring.snappy },
                  }}
                  className="flex items-baseline gap-4 border-b border-line py-3 last:border-b-0"
                >
                  <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-lg">{item}</span>
                </m.li>
              ))}
            </m.ul>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
