import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { Arrow } from "@/components/ui/Arrow";

/** One post in a list: date column, title + summary, reading time. Server-safe (no hooks). */
export function PostRow({ post, dateLabel }: { post: PostMeta; dateLabel: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-3 py-9 transition-opacity duration-150 active:opacity-70 md:grid-cols-[9rem_1fr_auto] md:gap-10"
    >
      <time dateTime={post.date} className="label pt-1.5">
        {dateLabel}
      </time>
      <div>
        <h3 className="font-display text-h3 transition-colors duration-300 group-hover:text-accent">
          {post.title}
        </h3>
        {post.summary ? <p className="mt-3 max-w-2xl text-secondary text-pretty">{post.summary}</p> : null}
        <p className="label mt-4">{post.tags.join(" · ")}</p>
      </div>
      <span className="label hidden items-center gap-2 self-start whitespace-nowrap pt-1.5 transition-colors group-hover:text-accent md:inline-flex">
        {post.readingMinutes} min <Arrow direction="right" />
      </span>
    </Link>
  );
}
