import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";
import { site } from "@/lib/content";
import { jsonLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";
import { breadcrumbs, personRef } from "@/lib/schema";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { SubscribeForm } from "@/components/blog/SubscribeForm";
import { BlogExplorer } from "@/components/blog/BlogExplorer";

const meta = pageMeta({
  title: "Blog: agentic AI, explainable ML and robotics",
  description:
    "Adithya Reddy's blog on agentic AI, LLM systems, explainable machine learning, AI robotics and measuring AI in business outcomes.",
  path: "/blog",
});
export const metadata: Metadata = {
  ...meta,
  alternates: { ...meta.alternates, types: { "application/rss+xml": "/blog/rss.xml" } },
};

export default function BlogIndex() {
  const posts = getPosts();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const topics = new Set(posts.flatMap((p) => p.tags)).size;
  const dateLabels = Object.fromEntries(posts.map((p) => [p.slug, formatDate(p.date, "short")]));
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${site.url}/blog#blog`,
        name: `${site.name}: Field notes`,
        url: `${site.url}/blog`,
        author: personRef,
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${site.url}/blog/${p.slug}`,
          datePublished: p.date,
          description: p.description,
          author: personRef,
        })),
      },
      breadcrumbs([["Blog", `${site.url}/blog`]]),
    ],
  };

  return (
    <main id="main" className="container-x pb-[var(--section-y)] pt-[calc(var(--nav-h)+clamp(3rem,2rem+5vw,7rem))]">
      <header className="grid gap-8 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <p className="label flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            Blog
          </p>
          <p className="label mt-4 tabular-nums">
            {posts.length} posts · {topics} topics
          </p>
        </Reveal>
        <Reveal className="md:col-span-9" delay={0.05}>
          <h1 className="font-display text-display font-light">
            Field <em className="text-accent">notes</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lede text-secondary text-pretty">
            Write-ups on agentic systems, explainable ML, research, and the work of shipping AI that a business relies on.
          </p>
        </Reveal>
      </header>

      {featured ? (
        <Reveal className="mt-16 md:mt-24" amount={0.2}>
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative grid gap-8 overflow-hidden rounded-2xl border border-line bg-surface-raised p-6 transition-[border-color,translate,scale] duration-500 ease-[var(--ease-spring)] hover:-translate-y-1 hover:border-line-strong active:scale-[0.985] active:duration-150 sm:p-10 md:grid-cols-12 md:p-14"
          >
            <div className="flex flex-col justify-between gap-6 md:col-span-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="label rounded-full bg-accent px-3 py-1 text-on-accent">Featured</span>
                <time dateTime={featured.date} className="label">
                  {formatDate(featured.date)}
                </time>
              </div>
              {featured.icon ? (
                <Image
                  src={`${featured.icon}-512.webp`}
                  width={512}
                  height={512}
                  alt={`${featured.title.split(":")[0]} logo`}
                  sizes="(min-width: 768px) 12rem, 7rem"
                  unoptimized
                  className="w-28 rounded-3xl border border-line bg-[#fefefe] p-3 transition-[scale] duration-700 ease-[var(--ease-spring)] group-hover:scale-[1.03] md:w-48 md:p-5"
                />
              ) : (
              <p className="hidden items-baseline gap-3 md:flex">
                <span className="font-display text-[clamp(4.5rem,3rem+5vw,7.5rem)] font-light italic leading-none text-line-strong transition-colors duration-700 group-hover:text-accent">
                  {featured.readingMinutes}
                </span>
                <span className="label">min read</span>
              </p>
              )}
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-h2 font-light transition-colors duration-300 group-hover:text-accent">
                {featured.title}
              </h2>
              <p className="mt-5 max-w-2xl text-lede text-secondary text-pretty">{featured.summary}</p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <p className="label">
                  <span className={featured.icon ? undefined : "md:hidden"}>{featured.readingMinutes} min read · </span>
                  {featured.tags.join(" · ")}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                  Read the post <Arrow direction="right" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      ) : null}

      {posts.length > 1 ? (
        <section aria-labelledby="all-posts" className="mt-20 grid gap-10 md:mt-28 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <h2 id="all-posts" className="label">
              All writing
            </h2>
          </Reveal>
          <Reveal className="md:col-span-9" amount={0.05}>
            <BlogExplorer posts={posts} featuredSlug={featured?.slug} dateLabels={dateLabels} />
          </Reveal>
        </section>
      ) : null}

      {posts.length === 0 ? <p className="mt-16 text-secondary">The first post is on its way.</p> : null}
      <section aria-label="Subscribe" className="mt-20 grid gap-10 border-t border-line pt-12 md:grid-cols-12">
        <div className="md:col-span-9 md:col-start-4">
          <SubscribeForm />
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
    </main>
  );
}
