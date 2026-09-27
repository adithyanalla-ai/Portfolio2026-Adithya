"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog";

/** Sticky "On this page" list; the current heading is tracked with IntersectionObserver. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page">
      <p className="label mb-4">On this page</p>
      <ol className="border-l border-line">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                className={`-ml-px block border-l py-1.5 text-sm leading-snug transition-colors duration-300 ${
                  item.depth === 3 ? "pl-7" : "pl-4"
                } ${current ? "border-accent text-primary" : "border-transparent text-muted hover:text-primary"}`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
