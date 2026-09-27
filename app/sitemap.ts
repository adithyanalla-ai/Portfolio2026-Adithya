import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { getPosts } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...getPosts().map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(`${p.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
