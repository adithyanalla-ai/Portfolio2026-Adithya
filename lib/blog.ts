import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Marked, type Tokens } from "marked";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("python", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);

/**
 * Blog posts are Markdown files in /content/blog with a frontmatter block:
 *
 *   ---
 *   title: Post title
 *   date: 2026-09-01
 *   summary: One sentence for the index and meta description.
 *   tags: Agentic AI, Research
 *   featured: true            (optional — pins the post to the top of /blog)
 *   ---
 *
 * Extras on top of standard Markdown:
 *   > [!NOTE] Optional title       → callout (NOTE, TIP, KEY, CAUTION)
 *   ```python                      → syntax-highlighted code with a language label
 *   Raw HTML (e.g. <div class="figures">…</div>) for figure strips and timelines.
 *
 * Everything renders at build time — posts ship as static HTML with zero client JS.
 */

const DIR = path.join(process.cwd(), "content", "blog");

export type TocItem = { id: string; text: string; depth: 2 | 3 };

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  featured: boolean;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string; toc: TocItem[] };

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const decodeEntities = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);

const CALLOUTS: Record<string, string> = { NOTE: "Note", TIP: "Tip", KEY: "Key idea", CAUTION: "Caution" };

function render(markdown: string) {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const md = new Marked({ gfm: true });

  md.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, { tokens, depth }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        const plain = decodeEntities(inner.replace(/<[^>]+>/g, ""));
        let id = slugify(plain) || "section";
        const n = used.get(id) ?? 0;
        used.set(id, n + 1);
        if (n) id = `${id}-${n}`;
        if (depth === 2 || depth === 3) toc.push({ id, text: plain, depth });
        return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h${depth}>\n`;
      },
      blockquote(this: { parser: { parse: (t: Tokens.Generic[]) => string } }, { tokens }: Tokens.Blockquote) {
        const body = this.parser.parse(tokens);
        const m = body.match(/^<p>\[!(NOTE|TIP|KEY|CAUTION)\][ \t]*([^\n<]*)\n?/);
        if (!m) return `<blockquote>${body}</blockquote>\n`;
        const [marker, kind, title] = m;
        const rest = body.slice(marker.length).replace(/^<\/p>\n?/, "");
        const label = title.trim() || CALLOUTS[kind];
        return `<aside class="callout callout-${kind.toLowerCase()}" role="note"><p class="callout-title">${label}</p>${
          rest.startsWith("<") ? rest : `<p>${rest}`
        }</aside>\n`;
      },
      code({ text, lang }: Tokens.Code) {
        const language = (lang ?? "").split(/\s/)[0];
        const known = language && hljs.getLanguage(language);
        const html = known ? hljs.highlight(text, { language }).value : escapeHtml(text);
        const label = language ? `<figcaption>${escapeHtml(language)}</figcaption>` : "";
        return `<figure class="code">${label}<pre><code class="hljs">${html}</code></pre></figure>\n`;
      },
    },
  });

  const html = md.parse(markdown, { async: false }) as string;
  return { html, toc };
}

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

  const words = body.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  const { html, toc } = render(body);
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title,
    date: meta.date,
    summary: meta.summary ?? "",
    tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    featured: meta.featured === "true",
    readingMinutes: Math.max(1, Math.round(words / 230)),
    html,
    toc,
  };
}

let cache: Post[] | null = null;

function all(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const posts = fs.existsSync(DIR)
    ? fs
        .readdirSync(DIR)
        .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
        .map(parse)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)))
    : [];
  cache = posts;
  return posts;
}

const toMeta = ({ slug, title, date, summary, tags, featured, readingMinutes }: Post): PostMeta => ({
  slug,
  title,
  date,
  summary,
  tags,
  featured,
  readingMinutes,
});

export function getPosts(): PostMeta[] {
  return all().map(toMeta);
}

export function getPost(slug: string): Post | undefined {
  return all().find((p) => p.slug === slug);
}

/** Newer / older neighbours in date order. */
export function getAdjacent(slug: string) {
  const posts = getPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  return { newer: i > 0 ? posts[i - 1] : undefined, older: i >= 0 ? posts[i + 1] : undefined };
}

/** Posts sharing the most tags with this one. */
export function getRelated(slug: string, limit = 2): PostMeta[] {
  const posts = getPosts();
  const me = posts.find((p) => p.slug === slug);
  if (!me) return [];
  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: p.tags.filter((t) => me.tags.includes(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p);
}

export const formatDate = (iso: string, style: "long" | "short" = "long") =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  });
