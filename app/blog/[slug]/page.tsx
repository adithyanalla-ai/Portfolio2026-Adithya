import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getAdjacent, getPost, getPosts, getRelated } from "@/lib/blog";
import { site } from "@/lib/content";
import { figures, figureSrc } from "@/lib/figures";
import { jsonLd } from "@/lib/jsonld";
import { Arrow } from "@/components/ui/Arrow";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { CopyLink } from "@/components/blog/CopyLink";
import { PostRow } from "@/components/blog/PostRow";
import { LeadPipeline } from "@/components/ui/LeadPipeline";

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
    description: post.description,
    keywords: [...post.keywords, ...post.tags],
    authors: [{ name: site.name, url: site.url }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      siteName: site.name,
      locale: "en_IN",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.name],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { newer, older } = getAdjacent(post.slug);
  const related = getRelated(post.slug).filter((r) => r.slug !== newer?.slug && r.slug !== older?.slug);

  const url = `${site.url}/blog/${post.slug}`;
  const hero = post.image ? figures[post.image] : undefined;
  const author = { "@type": "Person", name: site.name, url: site.url, jobTitle: "Lead AI Engineer" };
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        wordCount: post.wordCount,
        keywords: [...post.keywords, ...post.tags].join(", "),
        articleSection: post.tags[0],
        inLanguage: "en",
        mainEntityOfPage: url,
        url,
        image: [
          hero ? `${site.url}${figureSrc(hero, 1600)}` : `${url}/opengraph-image`,
          ...(post.icon ? [`${site.url}${post.icon}-512.webp`] : []),
        ],
        author,
        publisher: author,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      ...(post.faq.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: post.faq.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <main id="main" className="container-x pb-[var(--section-y)] pt-[calc(var(--nav-h)+clamp(3rem,2rem+4vw,6rem))]">
      <article>
        {/* Header */}
        <header className="mx-auto max-w-[52rem]">
          <div className="anim-fade-up">
            <nav aria-label="Breadcrumb">
              <ol className="label flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="tap link-draw hover:text-primary">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/blog" className="tap link-draw hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="max-w-[40ch] truncate text-secondary">
                  {post.title}
                </li>
              </ol>
            </nav>
          </div>
          {/* CSS entrance (not JS-driven) so the title and summary paint before hydration: protects LCP. */}
          <div className="anim-fade-up-lcp mt-10" style={{ "--d": "80ms" } as React.CSSProperties}>
            <div className="flex items-center gap-4">
              {post.icon ? (
                <Image
                  src={`${post.icon}-256.webp`}
                  width={256}
                  height={256}
                  alt=""
                  sizes="3.5rem"
                  loading="eager"
                  unoptimized
                  className="size-14 shrink-0 rounded-2xl border border-line bg-[#fefefe] p-1.5"
                />
              ) : null}
              <p className="label text-accent">{post.tags.join(" · ")}</p>
            </div>
            <h1 className="mt-5 font-display text-h2 font-light">{post.title}</h1>
            {post.summary ? <p className="mt-6 max-w-[42rem] text-lede text-secondary text-pretty">{post.summary}</p> : null}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
              <p className="label tabular-nums">
                {site.name} · <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.updated ? (
                  <>
                    {" "}· Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                  </>
                ) : null}{" "}
                · {post.readingMinutes} min read
              </p>
              <CopyLink />
            </div>
          </div>
        </header>

        {post.diagram === "lead-pipeline" ? (
          <div className="mx-auto mt-12 max-w-[52rem] rounded-2xl border border-line bg-surface-raised px-5 py-8 sm:py-10">
            <LeadPipeline className="mx-auto w-full max-w-[22rem]" />
          </div>
        ) : hero ? (
          <div className="mx-auto mt-12 max-w-[52rem]">
            <figure>
              <Image
                src={figureSrc(hero, 1600)}
                width={hero.width}
                height={hero.height}
                alt={hero.alt}
                sizes="(min-width: 900px) 52rem, 100vw"
                loading="eager"
                className="mx-auto block h-auto w-full rounded-2xl border border-line bg-white"
                // Width-driven sizing: the aspect ratio reserves the height before load (no layout shift),
                // capped so a tall figure never exceeds 70% of the screen height.
                style={{ maxWidth: `min(100%, calc(70svh * ${(hero.width / hero.height).toFixed(4)}))` }}
              />
              {hero.caption ? (
                <figcaption className="mx-auto mt-3 max-w-[42rem] text-center text-sm text-muted text-pretty">{hero.caption}</figcaption>
              ) : null}
            </figure>
          </div>
        ) : null}

        {/* Body + table of contents */}
        <div className="mx-auto mt-12 grid max-w-[64rem] gap-12 lg:grid-cols-[12rem_minmax(0,42rem)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-[calc(var(--nav-h)+2rem)]">
              <TableOfContents items={post.toc} />
            </div>
          </aside>
          <div className="prose min-w-0" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>

        {/* Author */}
        <footer className="mx-auto mt-20 max-w-[52rem]">
          <div className="flex flex-col gap-6 rounded-2xl border border-line bg-surface-raised p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-accent font-display text-lg italic text-on-accent">
                AR
              </span>
              <div>
                <p className="font-medium">{site.name}</p>
                <p className="text-sm text-secondary">Lead AI Engineer · Agentic AI &amp; LLM systems · {site.location}</p>
              </div>
            </div>
            <Link href="/#contact" className="btn btn-primary group self-start sm:self-auto">
              Get in touch <Arrow direction="right" />
            </Link>
          </div>
        </footer>
      </article>

      {/* Prev / next */}
      {newer || older ? (
        <nav aria-label="More posts" className="mx-auto mt-16 grid max-w-[52rem] gap-4 sm:grid-cols-2">
          {older ? (
            <Link href={`/blog/${older.slug}`} className="group rounded-2xl border border-line p-6 transition-[border-color,translate,scale] duration-500 ease-[var(--ease-spring)] hover:-translate-y-1 hover:border-line-strong active:scale-[0.985] active:duration-150">
              <p className="label inline-flex items-center gap-2">
                <Arrow direction="right" className="rotate-180" /> Previous
              </p>
              <p className="mt-3 font-display text-xl leading-snug transition-colors group-hover:text-accent">{older.title}</p>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {newer ? (
            <Link href={`/blog/${newer.slug}`} className="group rounded-2xl border border-line p-6 text-right transition-[border-color,translate,scale] duration-500 ease-[var(--ease-spring)] hover:-translate-y-1 hover:border-line-strong active:scale-[0.985] active:duration-150">
              <p className="label inline-flex items-center gap-2">
                Next <Arrow direction="right" />
              </p>
              <p className="mt-3 font-display text-xl leading-snug transition-colors group-hover:text-accent">{newer.title}</p>
            </Link>
          ) : null}
        </nav>
      ) : null}

      {related.length ? (
        <section aria-labelledby="related" className="mx-auto mt-20 max-w-[52rem]">
          <h2 id="related" className="label">
            Related reading
          </h2>
          <ol className="mt-4 border-t border-line">
            {related.map((r) => (
              <li key={r.slug} className="border-b border-line">
                <PostRow post={r} dateLabel={formatDate(r.date, "short")} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
    </main>
  );
}
