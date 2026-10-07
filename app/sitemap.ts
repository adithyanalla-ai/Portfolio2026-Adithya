import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import { figures, figureSrc } from "@/lib/figures";

export const dynamic = "force-static";

/** Every public page, on the canonical www origin (site.url). */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const changed = (p: (typeof posts)[number]) => new Date(`${p.updated ?? p.date}T00:00:00Z`);
  // The blog index changes when a post is added or updated; the homepage on every deploy.
  const blogUpdated = new Date(Math.max(...posts.map((p) => changed(p).getTime())));
  return [
    { url: `${site.url}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
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
