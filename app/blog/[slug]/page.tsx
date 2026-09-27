import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { site } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.date },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Person", name: site.name, url: site.url },
    url: `${site.url}/blog/${post.slug}`,
  };

  return (
    <main id="main" className="container-x pb-[var(--section-y)] pt-[calc(var(--nav-h)+clamp(3rem,2rem+4vw,6rem))]">
      <article className="mx-auto max-w-[42rem]">
        <Reveal>
          <Link href="/blog" className="label group inline-flex items-center gap-2 hover:text-primary">
            <Arrow direction="right" className="rotate-180" />
            <span className="link-draw">All posts</span>
          </Link>
        </Reveal>
        <Reveal delay={0.05} className="mt-10">
          <p className="label">
            <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
          </p>
          <h1 className="mt-5 font-display text-h2 font-light">{post.title}</h1>
          {post.summary ? <p className="mt-6 text-lede text-secondary text-pretty">{post.summary}</p> : null}
          {post.tags.length ? (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t} className="label rounded-full bg-accent-soft px-3 py-1 text-secondary">
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>
        <div className="prose mt-12 border-t border-line pt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
