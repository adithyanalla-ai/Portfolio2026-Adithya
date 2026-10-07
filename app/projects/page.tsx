import type { Metadata } from "next";
import Link from "next/link";
import { projects, site } from "@/lib/content";
import { projectPages } from "@/lib/projectPages";
import { pageMeta } from "@/lib/seo";
import { jsonLd } from "@/lib/jsonld";
import { breadcrumbs, personRef } from "@/lib/schema";

export const metadata: Metadata = pageMeta({
  title: "Projects by Adithya Reddy Nalla: AI, ML and Research",
  description:
    "Projects by Adithya Reddy Nalla: the GBNI agent framework, the MITHRA cybercrime platform, an explainable diabetes risk app, and more AI and data work.",
  path: "/projects",
  absoluteTitle: true,
});

/** Projects with their own page, then the ones documented in a blog write-up. */
const writeUpOnly = projects
  .filter((p) => p.href && !["GBNI", "MITHRA", "Diabetes"].some((n) => p.name.startsWith(n)))
  .map((p) => ({ name: p.name, kicker: p.kicker, summary: p.summary, href: p.href! }));

export default function ProjectsIndex() {
  const items = [
    ...projectPages.map((p) => ({ name: p.keyword, kicker: p.kicker, summary: p.description, href: `/projects/${p.slug}` })),
    ...writeUpOnly,
  ];
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/projects`,
        url: `${site.url}/projects`,
        name: "Projects by Adithya Reddy Nalla",
        author: personRef,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: items.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: it.name,
            url: `${site.url}${it.href}`,
          })),
        },
      },
      breadcrumbs([["Projects", `${site.url}/projects`]]),
    ],
  };

  return (
    <main id="main" className="container-x pb-[var(--section-y)] pt-[calc(var(--nav-h)+clamp(3rem,2rem+5vw,7rem))]">
      <header className="grid gap-8 md:grid-cols-12">
        <p className="label flex items-center gap-3 md:col-span-3">
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          Projects
        </p>
        <div className="anim-fade-up-lcp md:col-span-9" style={{ "--d": "60ms" } as React.CSSProperties}>
          <h1 className="font-display text-display font-light">
            Projects by <em className="text-accent">Adithya Reddy Nalla</em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-secondary text-pretty">
            Agent frameworks, security R&amp;D, explainable ML and data engineering, each with the problem, approach, stack and
            results. More about me on the{" "}
            <Link href="/about" className="link-draw text-accent hover:text-accent-hover">
              About page
            </Link>
            .
          </p>
        </div>
      </header>

      <ul className="mt-16 border-t border-line md:mt-24">
        {items.map((it) => (
          <li key={it.href} className="border-b border-line">
            <Link href={it.href} className="group grid gap-4 py-10 md:grid-cols-12 md:py-12">
              <span className="label text-accent md:col-span-3">{it.kicker}</span>
              <span className="md:col-span-9">
                <h2 className="font-display text-h3 transition-colors group-hover:text-accent">{it.name}</h2>
                <span className="mt-3 block max-w-2xl text-secondary text-pretty">{it.summary}</span>
                <span className="label mt-4 inline-block text-primary">
                  {it.href.startsWith("/blog") ? "Read the write-up" : "View the project"} →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
    </main>
  );
}
