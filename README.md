# Adithya Reddy — Portfolio

A portfolio and blog for Adithya Reddy (AI/ML Engineer · Agentic AI & LLM Systems · Business Analyst).
It's minimalist and led by typography, and its motion is driven by springs and scroll position.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (custom design tokens) · Framer Motion (via `LazyMotion`) · `marked` for blog Markdown

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## Design system

**Two typefaces only:** *Fraunces* (display: names, headings, emphasis, with a true italic) and *Geist* (body and labels).
Both load through `next/font`, which self-hosts and subsets them, so there's no layout shift. Labels are small uppercase Geist with wide letter-spacing, not a third face.

**Type scale:** a perfect fourth (1.333). The top sizes are fluid with `clamp()`:

| token | size | use |
|---|---|---|
| `text-label` | 12px | eyebrows, meta, dates |
| `text-base` | 17px / 1.7 | body |
| `text-lede` | ≈ 22.7px | intro paragraphs |
| `text-h3` | ≈ 30px | role titles, project names |
| `text-h2` | ≈ 54px | section titles |
| `text-display` | ≈ 71px | contact and blog headlines |
| `text-hero` | up to 120px | the name |

Display headings use tight tracking (−0.03em; −0.04em on the hero).

**Colour tokens**, tuned separately for each theme in `app/globals.css`:

| token | dark | light |
|---|---|---|
| `surface` / `surface-raised` / `surface-sunken` | `#0E0E0C` / `#161614` / `#0A0A09` | `#F6F4EF` / `#FFFFFF` / `#EDEAE3` |
| `primary` / `secondary` / `muted` (text) | `#EDEAE3` / `#B5B1A7` / `#8A867C` | `#161513` / `#4A4740` / `#69655C` |
| `line` / `line-strong` | bone at 10% / 20% | ink at 10% / 20% |
| `accent` / `accent-hover` | `#FF6B3D` / `#FF8A63` | `#B33D16` / `#942F0E` |

Every text/surface pair meets WCAG AA. Tailwind classes (`bg-surface`, `text-secondary`, `border-line`, `bg-accent`, …)
point at these variables through `@theme inline`, so every class follows the theme automatically.

**Spacing:** Tailwind's 4px base, a fluid `--gutter` and `--section-y`, a 12-column grid, and an 88rem max width.

### Motion

- **Springs everywhere.** Presets live in `lib/motion.ts`: `soft` for entrances, `snappy` for micro-interactions.
- **Section entrances:** fade in with a 24px rise. Children stagger 70ms apart (experience bullets, stats, list items).
- **Parallax:** scroll-linked depth on two elements. The hero's canvas layer lags behind the scroll, and the name drifts ahead of it.
- **Anchor links:** spring-animated scrolling (`components/ui/SmoothAnchors.tsx`). The scroll stops as soon as the visitor scrolls themselves, and focus moves to the target section.
- **Nav:** the active section is tracked with `IntersectionObserver`, and a hairline progress bar runs along the top.
- **Projects:** sticky stacked cards. Each one recedes as the next slides over it (desktop).
- **Buttons:** `.btn` lifts slightly on hover and presses in when clicked. The site uses the normal system cursor, with no custom cursor or magnetic effects.
- **Theme:** the toggle morphs between a sun and a moon. When the theme changes, colours cross-fade over 450ms.
- **Hero:** the name's letters rise from behind a mask. This runs in CSS, so it plays before hydration.
- **Reduced motion:** all of the above becomes plain opacity fades. There's no parallax, no stagger, no spring scrolling and no canvas animation.

### Theme behaviour

A blocking inline script in `app/layout.tsx` sets `data-theme` before first paint, so there's never a flash.
It uses the saved choice if there is one, otherwise the OS `prefers-color-scheme` setting, otherwise dark.
Until the visitor picks a theme, the site keeps following OS changes.

---

## Editing content

**All portfolio copy lives in [`lib/content.ts`](lib/content.ts):**

| Export | Drives |
|---|---|
| `site` | Name, role, hero summary, contact details, SEO |
| `nav` | Navigation. Items with an `id` scroll to that section; items with an `href` (like Blog) go to their own route |
| `about` | Lede, paragraphs, stat tiles (values like `"₹1.4Cr+"` count up automatically) |
| `experience` | Roles, promotion path, highlights |
| `projects` | Stacked project cards |
| `publications` | Citation list |
| `skills` | Skill categories for the tabbed explorer |
| `education` | Degree, grade, coursework |

### Writing blog posts

Posts are Markdown files in [`content/blog/`](content/blog). The filename becomes the URL:
`content/blog/my-post.md` is published at `/blog/my-post`.

```md
---
title: My post title
date: 2026-10-15
summary: One sentence for the blog index, the meta description and the social card.
tags: Agentic AI, Research
featured: true        # optional: pins the post as the big card at the top of /blog
---

Normal Markdown from here: headings, lists, links, tables, quotes.
```

Extras the blog understands:

| Write | Get |
|---|---|
| `## Heading` / `### Heading` | An anchor link and an entry in the sticky "On this page" table of contents |
| ```` ```python ```` fenced code | Syntax highlighting in theme colours, with a language label (python, sql, bash, typescript, json, yaml) |
| `> [!NOTE] Title` (also `TIP`, `KEY`, `CAUTION`) | A callout box. `KEY` is the large pull-quote style |
| `<div class="figures"><div><strong>40%</strong><span>caption</span></div>…</div>` | A strip of big numbers |
| `<ol class="timeline"><li><time>Mar 2024</time><strong>Title</strong><span>Detail</span></li>…</ol>` | A vertical timeline |

Each post automatically gets:
- a reading time;
- previous/next links and related posts (by shared tags);
- a copy-link button;
- a generated social image;
- JSON-LD metadata and a sitemap entry.

The three newest posts appear in the "Writing" section on the home page, and `/blog` has topic filters built from the tags.

- Copy `content/blog/_template.md` to start. Files beginning with `_` are ignored.
- Posts render to static HTML at build time, so they add no JavaScript. Only the filter and table of contents are interactive.

### Structure

```
app/
  layout.tsx            fonts, metadata, theme script, shared nav/footer
  page.tsx              home page: section order
  blog/page.tsx         blog index: featured post + filterable list
  blog/[slug]/          blog post page + generated social image
  globals.css           tokens, type scale, buttons, article (prose) styles
components/
  sections/             Hero, About, Experience, Projects, Publications, Skills, Education, LatestWriting, Contact, Footer
  blog/                 BlogExplorer (topic filter), TableOfContents, CopyLink, PostRow
  ui/                   Nav, ThemeToggle, ThemeProvider, SmoothAnchors, Parallax, Reveal, ScrollProgress,
                        NeuralField, ProjectStack, SkillExplorer, Counter, CopyEmail, LocalTime, Arrow
content/blog/           Markdown posts
lib/
  content.ts            ← portfolio copy
  blog.ts               Markdown loader
  motion.ts             spring and stagger presets
```

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **Add New → Project** and import the repo. It's detected as Next.js, and no settings or environment variables are needed.
3. Click **Deploy**.
4. To use the custom domain, go to **Project → Settings → Domains**, add `adithyareddy.online`, and create the DNS records Vercel shows.

Or from the CLI: `npx vercel` for a preview, `npx vercel --prod` for production.

Every route is prerendered as static HTML. To produce plain static files for any host, run `STATIC_EXPORT=1 npm run build`; the files land in `/out`.
