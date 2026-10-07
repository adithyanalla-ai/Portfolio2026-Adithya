import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Search and AI crawlers, allowed explicitly.
      { userAgent: ["Googlebot", "Bingbot", "GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
