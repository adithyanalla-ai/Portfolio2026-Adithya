import "server-only";
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

/**
 * Blog posts are Markdown files in /content/blog with a small frontmatter block:
 *
 *   ---
 *   title: Post title
 *   date: 2026-09-01
 *   summary: One sentence for the index and meta description.
 *   tags: Agentic AI, Research
 *   ---
 *
 * Everything is read and rendered at build time — posts ship as static HTML with zero client JS.
 */

const DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

function parse(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter in content/blog/${file}`);
  const [, front, body] = match;

  const meta: Record<string, string> = {};
  for (const line of front.split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  if (!meta.title || !meta.date) throw new Error(`content/blog/${file} needs a title and date`);

  const words = body.trim().split(/\s+/).length;
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title,
    date: meta.date,
    summary: meta.summary ?? "",
    tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    readingMinutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(body, { async: false, gfm: true }) as string,
  };
}

function all(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map(parse)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPosts(): PostMeta[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return all().map(({ html, ...meta }) => meta);
}

export function getPost(slug: string): Post | undefined {
  return all().find((p) => p.slug === slug);
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
