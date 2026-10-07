import type { Metadata } from "next";
import Link from "next/link";
import { about, education, experience, marketing, publications, site } from "@/lib/content";
import { projectPages } from "@/lib/projectPages";
import { pageMeta } from "@/lib/seo";
import { jsonLd } from "@/lib/jsonld";
import { breadcrumbs, person } from "@/lib/schema";

export const metadata: Metadata = pageMeta({
  title: "About Adithya Reddy Nalla | Lead AI Engineer, Hyderabad",
  description:
    "About Adithya Reddy Nalla, Lead AI Engineer at Eject Solutions in Hyderabad: experience, research on SSRN, education at KL University and how to get in touch.",
  path: "/about",
  absoluteTitle: true,
});

const structured = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${site.url}/about`,
      url: `${site.url}/about`,
      name: "About Adithya Reddy Nalla",
      mainEntity: person,
    },
    breadcrumbs([["About", `${site.url}/about`]]),
  ],
};

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-16">
      <h2 id={id} className="font-display text-h3 md:col-span-4">
        {title}
      </h2>
      <div className="flex flex-col gap-5 md:col-span-8">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main id="main" className="container-x pb-[var(--section-y)] pt-[calc(var(--nav-h)+clamp(3rem,2rem+5vw,7rem))]">
      <header className="grid gap-8 md:grid-cols-12">
        <p className="label flex items-center gap-3 md:col-span-3">
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          About
        </p>
        <div className="anim-fade-up-lcp md:col-span-9" style={{ "--d": "60ms" } as React.CSSProperties}>
          <h1 className="font-display text-h2 font-light text-balance">About Adithya Reddy Nalla</h1>
          <p className="mt-6 max-w-[44rem] text-lede text-secondary text-pretty">{about.lede}</p>
          <p className="mt-6 text-sm text-muted">Lead AI Engineer at Eject Solutions Pvt Ltd · {site.location}</p>
        </div>
      </header>

      <div className="mt-16 md:mt-24">
        <Block id="what-i-do" title="What I do">
          {about.body.map((b) => (
            <p key={b} className="text-lg leading-relaxed text-secondary text-pretty">
              {b}
            </p>
          ))}
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {about.stats.map((s) => (
              <li key={s.label} className="bg-surface p-6">
                <p className="font-display text-4xl text-accent">{s.value}</p>
                <p className="label mt-3">{s.label}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="experience" title="Experience">
          <ol className="flex flex-col gap-8">
            {experience.map((r) => (
              <li key={r.company}>
                <p className="label">{r.period}</p>
                <h3 className="mt-2 font-display text-2xl">
                  {r.title}, {r.company}
                </h3>
                <ul className="mt-4 flex flex-col gap-2">
                  {r.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="flex gap-3 text-secondary text-pretty">
                      <span aria-hidden className="mt-3 h-px w-3 shrink-0 bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="text-secondary text-pretty">
            On the growth side, I&rsquo;ve run lead-generation, admissions and election campaigns: {marketing.stats
              .slice(0, 3)
              .map((s) => `${s.value} ${s.label.toLowerCase()}`)
              .join(", ")}
            . See the{" "}
            <Link href="/#marketing" className="link-draw text-accent hover:text-accent-hover">
              marketing section
            </Link>
            .
          </p>
        </Block>

        <Block id="projects" title="Projects">
          <ul className="flex flex-col gap-4">
            {projectPages.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="group">
                  <span className="link-draw font-display text-xl text-primary group-hover:text-accent">{p.keyword}</span>
                  <span className="mt-1 block text-secondary text-pretty">{p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/projects" className="link-draw self-start text-sm text-accent hover:text-accent-hover">
            All projects
          </Link>
        </Block>

        <Block id="research" title="Research">
          <ul className="flex flex-col gap-4">
            {publications.map((p) => (
              <li key={p.title} className="text-secondary text-pretty">
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noopener" className="link-draw text-primary hover:text-accent">
                    {p.title}
                  </a>
                ) : (
                  <span className="text-primary">{p.title}</span>
                )}
                <span className="block text-sm text-muted">
                  {p.venue} · {p.date}
                  {p.id ? ` · ${p.id}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="education" title="Education">
          <p className="text-lg text-secondary">
            {education.degree}, {education.school} ({education.period}), {education.grade}.
          </p>
        </Block>

        <Block id="contact" title="Contact">
          <p className="text-lg text-secondary text-pretty">
            Email{" "}
            <a href={`mailto:${site.email}`} className="link-draw text-accent hover:text-accent-hover">
              {site.email}
            </a>{" "}
            or connect on{" "}
            <a href={site.linkedin} target="_blank" rel="noopener me" className="link-draw text-accent hover:text-accent-hover">
              LinkedIn
            </a>
            . I also write on the{" "}
            <Link href="/blog" className="link-draw text-accent hover:text-accent-hover">
              blog
            </Link>
            .
          </p>
        </Block>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
    </main>
  );
}
