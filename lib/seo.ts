import type { Metadata } from "next";
import { site } from "./content";

/** Default share image (1200×630) for pages without their own; blog posts generate one per post. */
export const ogImage = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: `${site.name}: ${site.role}`,
  type: "image/jpeg",
};

/**
 * Title, description, canonical, Open Graph and Twitter tags for one page, kept in sync.
 * Next.js replaces (doesn't merge) nested `openGraph` / `twitter` objects from the layout,
 * so every page sets them all here. `path` is relative to site.url (metadataBase).
 */
export function pageMeta({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  /** Use the title as-is instead of the "%s — Adithya Reddy" template. */
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      siteName: site.name,
      locale: "en_IN",
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}
