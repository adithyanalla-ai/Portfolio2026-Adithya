"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { PostMeta } from "@/lib/blog";
import { spring } from "@/lib/motion";
import { PostRow } from "./PostRow";

/**
 * Tag filter + post list. "All" hides the featured post (it's shown above);
 * picking a tag searches every post, featured included.
 */
export function BlogExplorer({
  posts,
  featuredSlug,
  dateLabels,
}: {
  posts: PostMeta[];
  featuredSlug?: string;
  dateLabels: Record<string, string>;
}) {
  const [tag, setTag] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [posts]);

  const visible = tag ? posts.filter((p) => p.tags.includes(tag)) : posts.filter((p) => p.slug !== featuredSlug);

  const chip = (active: boolean) =>
    `tap label rounded-full border px-3.5 py-2 transition-[color,border-color,background-color,transform] duration-300 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] ${
      active ? "border-accent bg-accent-soft text-primary" : "border-line hover:border-line-strong hover:text-primary"
    }`;

  return (
    <div>
      <div role="group" aria-label="Filter posts by topic" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={tag === null} onClick={() => setTag(null)} className={chip(tag === null)}>
          All <span className="ml-1 opacity-60">{posts.length}</span>
        </button>
        {tags.map(([t, n]) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(tag === t ? null : t)}
            className={chip(tag === t)}
          >
            {t} <span className="ml-1 opacity-60">{n}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {tag ? `${visible.length} posts tagged ${tag}` : "Showing all posts"}
      </p>

      <ol className="mt-10 border-t border-line">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((post, i) => (
            <m.li
              key={post.slug}
              className="border-b border-line"
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0, transition: { ...spring.soft, delay: reduce ? 0 : i * 0.07 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <PostRow post={post} dateLabel={dateLabels[post.slug]} />
            </m.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  );
}
