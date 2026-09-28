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
import katex from "katex";
import { renderChart } from "./charts";
import { figures, figureSrc, figureSrcSet } from "./figures";

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
 *   description: ≤160 chars   (optional — meta description; falls back to summary)
 *   keywords: a, b, c         (optional — extra search phrases)
 *   updated: 2026-10-01       (optional — dateModified)
 *   image: aglier-fig9        (optional — a key from lib/figures.ts, used as the hero + in JSON-LD)
 *   featured: true            (optional — pins the post to the top of /blog)
 *   ---
 *
 * Extras on top of standard Markdown:
 *   > [!NOTE] Optional title       → callout (NOTE, TIP, KEY, CAUTION)
 *   ```python                      → syntax-highlighted code with a language label
 *   ![alt](fig:aglier-fig9 "Caption") → responsive figure from lib/figures.ts
 *   $inline$ and $$block$$ TeX     → MathML (rendered by the browser, no fonts or JS)
 *   ```chart {json}               → build-time SVG chart + data table (see lib/charts.ts)
 *   ## Frequently asked questions  → its ### questions become FAQPage structured data
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
  updated?: string;
  summary: string;
  description: string;
  tags: string[];
  keywords: string[];
  image?: string;
  featured: boolean;
  readingMinutes: number;
  wordCount: number;
};

export type Faq = { question: string; answer: string };

export type Post = PostMeta & { html: string; toc: TocItem[]; faq: Faq[] };

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

const tex = (src: string, displayMode: boolean) =>
  katex.renderToString(src, { output: "mathml", displayMode, throwOnError: true });

const CALLOUTS: Record<string, string> = { NOTE: "Note", TIP: "Tip", KEY: "Key idea", CAUTION: "Caution" };

function render(markdown: string) {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const md = new Marked({ gfm: true });

  md.use({
    extensions: [
      {
        name: "mathBlock",
        level: "block",
        start: (src: string) => src.indexOf("$$"),
        tokenizer(src: string) {
          const m = src.match(/^\$\$([\s\S]+?)\$\$(?:\n|$)/);
          if (m) return { type: "mathBlock", raw: m[0], text: m[1].trim() };
        },
        renderer: (t) => `<div class="math-block">${tex((t as unknown as { text: string }).text, true)}</div>\n`,
      },
      {
        name: "mathInline",
        level: "inline",
        start: (src: string) => src.indexOf("$"),
        tokenizer(src: string) {
          const m = src.match(/^\$(?!\s)([^$\n]+?)(?<!\s)\$/);
          if (m) return { type: "mathInline", raw: m[0], text: m[1] };
        },
        renderer: (t) => tex((t as unknown as { text: string }).text, false),
      },
    ],
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
      // A paragraph holding only an image renders as a bare <figure> (a figure can't live inside <p>).
      paragraph(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, { tokens }: Tokens.Paragraph) {
        const inner = this.parser.parseInline(tokens);
        const onlyImage = tokens.filter((t) => !(t.type === "text" && !t.raw.trim())).every((t) => t.type === "image");
        return onlyImage && tokens.length ? `${inner}\n` : `<p>${inner}</p>\n`;
      },
      image({ href, title, text }: Tokens.Image) {
        if (href.startsWith("fig:")) {
          const f = figures[href.slice(4)];
          if (!f) throw new Error(`Unknown figure "${href}" (add it to lib/figures.ts)`);
          // The registry's descriptive alt wins; the Markdown alt is a short fallback label.
          const alt = f.alt || text;
          const cap = title ? `<figcaption>${title}</figcaption>` : "";
          return `<figure class="figure"><a href="${figureSrc(f, 1600)}" class="figure-link" aria-label="Open full-size image: ${escapeHtml(
            alt,
          )}"><img src="${figureSrc(f, 800)}" srcset="${figureSrcSet(f)}" sizes="(min-width: 1024px) 42rem, 100vw" width="${f.width}" height="${
            f.height
          }" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></a>${cap}</figure>`;
        }
        return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async">`;
      },
      code({ text, lang }: Tokens.Code) {
        const language = (lang ?? "").split(/\s/)[0];
        if (language === "chart") return renderChart(text);
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

/** Pull Q&A pairs from a "## Frequently asked questions" section for FAQPage structured data. */
function extractFaq(body: string): Faq[] {
  const m = body.match(/^## Frequently asked questions\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  if (!m) return [];
  return m[1]
    .split(/^### /m)
    .slice(1)
    .map((block) => {
      const [q, ...rest] = block.split("\n");
      const answer = rest
        .join(" ")
        .replace(/\$([^$]+)\$/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`>]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return { question: q.trim(), answer };
    })
    .filter((f) => f.question && f.answer);
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

  const prose = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/<[^>]+>/g, " ");
  const words = prose.trim().split(/\s+/).length;
  const list = (v?: string) => (v ? v.split(",").map((t) => t.trim()).filter(Boolean) : []);
  if (meta.image && !figures[meta.image]) throw new Error(`content/blog/${file}: unknown image "${meta.image}"`);
  const summary = meta.summary ?? "";
  const { html, toc } = render(body);
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title,
    date: meta.date,
    updated: meta.updated,
    summary,
    description: meta.description ?? summary,
    tags: list(meta.tags),
    keywords: list(meta.keywords),
    image: meta.image,
    featured: meta.featured === "true",
    readingMinutes: Math.max(1, Math.round(words / 230)),
    wordCount: words,
    html,
    toc,
    faq: extractFaq(body),
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toMeta = ({ html, toc, faq, ...meta }: Post): PostMeta => meta;

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
