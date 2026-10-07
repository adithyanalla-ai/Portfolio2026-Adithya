import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/content";
import { getProjectPage, projectPages, type ProjectPage } from "@/lib/projectPages";
import { pageMeta } from "@/lib/seo";
import { jsonLd } from "@/lib/jsonld";
import { breadcrumbs, personRef } from "@/lib/schema";
import { Arrow } from "@/components/ui/Arrow";
import { Todo } from "@/components/ui/Todo";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return projectPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = getProjectPage((await params).slug);
  if (!p) return {};
  return {
    ...pageMeta({ title: p.title, description: p.description, path: `/projects/${p.slug}`, absoluteTitle: true }),
    keywords: p.keywords,
  };
}

function structuredData(p: ProjectPage) {
  const url = `${site.url}/projects/${p.slug}`;
  const base = {
    "@id": `${url}#project`,
    name: p.keyword,
    alternateName: p.name,
    description: p.description,
    url,
    author: personRef,
    creator: personRef,
    keywords: p.keywords.join(", "),
    dateModified: p.updated,
    inLanguage: "en",
    ...(p.citations?.length
      ? {
          citation: p.citations.map((c) => ({
            "@type": "ScholarlyArticle",
            name: c.name,
            url: c.url,
            publisher: { "@type": "Organization", name: c.publisher },
            ...(c.date ? { datePublished: c.date } : {}),
          })),
        }
      : {}),
  };
  const work =
    p.schema.type === "SoftwareApplication"
      ? {
          "@type": "SoftwareApplication",
          ...base,
          applicationCategory: p.schema.applicationCategory,
          ...(p.schema.operatingSystem ? { operatingSystem: p.schema.operatingSystem } : {}),
        }
      : { "@type": "CreativeWork", ...base };
  return {
    "@context": "https://schema.org",
    "@graph": [
      work,
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: p.title,
        description: p.description,
        mainEntity: { "@id": `${url}#project` },
        author: personRef,
        dateModified: p.updated,
      },
      breadcrumbs([
        ["Projects", `${site.url}/projects`],
        [p.name, url],
      ]),
    ],
  };
}

const isExternal = (href: string) => href.startsWith("http");

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-16">
      <h2 id={id} className="font-display text-h3 md:col-span-4">
        {title}
      </h2>
      <div className="flex flex-col gap-5 md:col-span-8">{children}</div>
    </section>
  );
}

export default async function ProjectPageView({ params }: { params: Promise<Params> }) {
  const p = getProjectPage((await params).slug);
  if (!p) notFound();
  const others = projectPages.filter((o) => o.slug !== p.slug);

  return (
    <main id="main" className="container-x pb-[var(--section-y)] pt-[calc(var(--nav-h)+clamp(2.5rem,2rem+3vw,5rem))]">
      <nav aria-label="Breadcrumb">
        <ol className="label flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="tap link-draw hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/projects" className="tap link-draw hover:text-primary">
              Projects
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-secondary">
            {p.name}
          </li>
        </ol>
      </nav>

      <header className="anim-fade-up-lcp mt-10 max-w-4xl" style={{ "--d": "60ms" } as React.CSSProperties}>
        <p className="label text-accent">{p.kicker}</p>
        <h1 className="mt-5 font-display text-h2 font-light text-balance">{p.keyword}</h1>
        <p className="mt-6 max-w-[44rem] text-lede text-secondary text-pretty">{p.intro}</p>
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Status">
          {p.status.map((s) => (
            <li key={s} className="label rounded-full border border-line px-3 py-1">
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          By{" "}
          <Link href="/about" className="link-draw text-secondary hover:text-primary">
            Adithya Reddy Nalla
          </Link>
          , Lead AI Engineer in Hyderabad.
        </p>
      </header>

      <div className="mt-16">
        <Todo items={p.todos} />
      </div>

      <div className="mt-8">
        <Section id="problem" title="Problem">
          {p.problem.map((t) => (
            <p key={t} className="text-lg leading-relaxed text-secondary text-pretty">
              {t}
            </p>
          ))}
        </Section>

        <Section id="approach" title="Approach">
          <ul className="flex flex-col gap-4">
            {p.approach.map((t) => (
              <li key={t} className="flex gap-3 text-lg leading-relaxed text-secondary text-pretty">
                <span aria-hidden className="mt-3.5 h-px w-3 shrink-0 bg-accent" />
                {t}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="tech-stack" title="Tech stack">
          <dl className="flex flex-col gap-5">
            {p.stack.map((g) => (
              <div key={g.group}>
                <dt className="label">{g.group}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <span key={s} className="rounded-full border border-line px-3 py-1 text-sm text-secondary">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="results" title="Results">
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {p.results.map((r) => (
              <li key={r.label} className="bg-surface p-6">
                <p className="font-display text-4xl text-accent">{r.value}</p>
                <p className="label mt-3">{r.label}</p>
              </li>
            ))}
          </ul>
          {p.resultNotes?.map((n) => (
            <p key={n} className="text-secondary text-pretty">
              {n}
            </p>
          ))}
        </Section>

        {p.screenshots.length || process.env.NODE_ENV !== "production" ? (
          <Section id="screenshots" title="Screenshots">
            {p.screenshots.length ? (
              <ul className="grid gap-6 sm:grid-cols-2">
                {p.screenshots.map((s) => (
                  <li key={s.src}>
                    <figure>
                      <Image
                        src={s.src}
                        width={s.width}
                        height={s.height}
                        alt={s.alt}
                        sizes="(min-width: 768px) 30vw, 100vw"
                        className="h-auto w-full rounded-xl border border-line"
                      />
                      {s.caption ? <figcaption className="mt-2 text-sm text-muted">{s.caption}</figcaption> : null}
                    </figure>
                  </li>
                ))}
              </ul>
            ) : (
              <Todo items={["No screenshots yet: add them to `screenshots` in lib/projectPages.ts (each with descriptive alt text)."]} />
            )}
          </Section>
        ) : null}

        <Section id="links" title="Links">
          <ul className="flex flex-col gap-3">
            {p.links.map((l) => (
              <li key={l.href}>
                {isExternal(l.href) ? (
                  <a href={l.href} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 text-accent hover:text-accent-hover">
                    <span className="link-draw">{l.label}</span>
                    <Arrow />
                  </a>
                ) : (
                  <Link href={l.href} className="group inline-flex items-center gap-2 text-accent hover:text-accent-hover">
                    <span className="link-draw">{l.label}</span>
                    <Arrow direction="right" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <section aria-labelledby="more-projects" className="border-t border-line py-12 md:py-16">
          <h2 id="more-projects" className="font-display text-h3">
            More projects
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/projects/${o.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line p-6 transition-colors hover:border-line-strong"
                >
                  <span className="label text-accent">{o.kicker}</span>
                  <span className="mt-3 font-display text-2xl text-balance">{o.keyword}</span>
                  <span className="mt-3 text-secondary text-pretty">{o.description}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/projects" className="link-draw text-accent hover:text-accent-hover">
              All projects
            </Link>
            <Link href="/about" className="link-draw text-accent hover:text-accent-hover">
              About Adithya Reddy Nalla
            </Link>
          </p>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData(p))} />
    </main>
  );
}
