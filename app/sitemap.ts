import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import { figures, figureSrc } from "@/lib/figures";
import { projectPages } from "@/lib/projectPages";

export const dynamic = "force-static";

/** Every public page, on the canonical www origin (site.url). */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const changed = (p: (typeof posts)[number]) => new Date(`${p.updated ?? p.date}T00:00:00Z`);
  // The blog index changes when a post is added or updated; the homepage on every deploy.
  const blogUpdated = new Date(Math.max(...posts.map((p) => changed(p).getTime())));
  // Bump when the About copy or the résumé data in lib/content.ts changes.
  const aboutUpdated = new Date("2026-10-12T00:00:00Z");
  const projectsUpdated = new Date(Math.max(...projectPages.map((p) => new Date(`${p.updated}T00:00:00Z`).getTime())));
  // The homepage summarises everything, so it changes whenever any of it does (not on every build).
  const homeUpdated = new Date(Math.max(aboutUpdated.getTime(), projectsUpdated.getTime(), blogUpdated.getTime()));
  return [
    { url: `${site.url}/`, lastModified: homeUpdated, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/about`, lastModified: aboutUpdated, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${site.url}/projects`,
      lastModified: projectsUpdated,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projectPages.map((p) => ({
      url: `${site.url}/projects/${p.slug}`,
      lastModified: new Date(`${p.updated}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${site.url}/blog`, lastModified: blogUpdated, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: changed(p),
      ...(p.image && figures[p.image] ? { images: [`${site.url}${figureSrc(figures[p.image], 1600)}`] } : {}),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
