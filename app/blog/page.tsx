import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";
import { RevealGroup, RevealItem, Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes from Adithya Reddy on agentic AI, LLM systems, research and shipping ML in production.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <main id="main" className="container-x pb-[var(--section-y)] pt-[calc(var(--nav-h)+clamp(3rem,2rem+5vw,7rem))]">
      <header className="grid gap-8 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <p className="label flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            Blog
          </p>
        </Reveal>
        <Reveal className="md:col-span-9" delay={0.05}>
          <h1 className="font-display text-display font-light">
            Field <em className="text-accent">notes</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lede text-secondary text-pretty">
            Write-ups on agentic systems, research and the work of shipping ML that a business relies on.
          </p>
        </Reveal>
      </header>

      {posts.length ? (
        <RevealGroup as="ol" className="mt-16 border-t border-line md:mt-24 md:ml-[25%]">
          {posts.map((post) => (
            <RevealItem as="li" key={post.slug} className="border-b border-line">
              <Link
                href={`/blog/${post.slug}`}
                className="group grid gap-3 py-10 transition-colors md:grid-cols-[10rem_1fr_auto] md:gap-8"
              >
                <time dateTime={post.date} className="label pt-2">
                  {formatDate(post.date)}
                </time>
                <div>
                  <h2 className="font-display text-h3 transition-colors duration-300 group-hover:text-accent">
                    {post.title}
                  </h2>
                  {post.summary ? <p className="mt-3 max-w-2xl text-secondary text-pretty">{post.summary}</p> : null}
                  <p className="label mt-4">
                    {post.readingMinutes} min read
                    {post.tags.length ? <> · {post.tags.join(" · ")}</> : null}
                  </p>
                </div>
                <span className="hidden self-center text-xl text-muted transition-colors group-hover:text-accent md:block">
                  <Arrow direction="right" />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <p className="mt-16 text-secondary md:ml-[25%]">The first post is on its way.</p>
      )}
    </main>
  );
}
