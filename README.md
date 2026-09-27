# Adithya Reddy — Portfolio

A single-page portfolio for Adithya Reddy (AI/ML Engineer · Agentic AI & LLM Systems · Business Analyst).
It's minimalist and led by typography, with motion based on spring physics.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (custom design tokens) · Framer Motion (via `LazyMotion`)

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## Design system

| | |
|---|---|
| **Display type** | *Fraunces*, a variable serif with a real italic. Used for the name, section titles and emphasis |
| **Body type** | *Geist*, a clean grotesk |
| **Labels / data** | *Geist Mono*, uppercase and tracked, for indices, dates and meta. Gives the page a lab-notebook feel |
| **Dark (default)** | ink `#0D0D0B` · bone `#ECE8DF` · muted `#8C887E` · accent vermilion `#FF6B3D` |
| **Light** | paper `#F2EEE6` · ink `#151412` · muted `#6B675E` · accent `#B33D16` (deepened to pass AA on paper) |
| **Spacing** | Tailwind's 4px base, fluid `--gutter` and `--section-y`, 12-column grid, 88rem max width |
| **Type scale** | Fluid `clamp()` tokens: `text-display-xl` (hero, up to about 11.5rem) → `display-lg` → `display-md` → `lede` |
| **Motion** | Springs only (`lib/motion.ts`). `soft` (120/20) for entrances, `snappy` (300/30) for micro-interactions. Entrances fade in with a 24px rise, staggered 60ms |

All colours are CSS variables in `app/globals.css`. Tailwind utilities such as `bg-ink`, `text-bone`, `text-accent` and `border-line`
point at those variables through `@theme inline`, so every class follows the theme automatically.

### Motion & interaction

- **Hero:** name letters rise from behind a mask. This is done in CSS so it plays before hydration, which protects LCP.
- **Neural field:** a canvas dot grid drifting on a sine flow. Near the cursor the dots warm up and wire themselves to it.
  It uses a DPR cap, pauses when off-screen or in a hidden tab, drops to 30fps on touch devices, and starts only once the main thread is idle.
- **Scroll progress:** a hairline bar at the top, driven by a spring.
- **Navigation:** smooth anchor scrolling, plus an active-section highlight driven by an `IntersectionObserver`.
- **Projects:** sticky stacked cards. Earlier cards shrink and dim as the next one slides over them. Desktop only.
- **Skills:** an ARIA tabs explorer (arrow, Home and End keys) instead of a wall of tag badges.
- **Stats:** count up once, when scrolled into view.
- **Cursor and magnetic buttons:** a custom cursor and magnetic primary buttons. Only on devices with `(hover: hover) and (pointer: fine)`.
- **Theme toggle:** a sun/moon morph. The choice persists to `localStorage`, and an inline script applies it before first paint, so there's no flash.
- **`prefers-reduced-motion`:**
  - Framer Motion runs with `reducedMotion="user"`, so animations fall back to opacity.
  - The custom cursor, magnetic pull, canvas animation and card stacking are switched off.
  - CSS animations collapse to near-zero duration.

---

## Editing content

**All copy lives in [`lib/content.ts`](lib/content.ts).** Every section reads from it:

| Export | Section |
|---|---|
| `site` | Name, role, hero summary, contact details, SEO description |
| `nav` | Anchor navigation (the `id` must match the section's `id`) |
| `about` | Lede, body paragraphs, stat tiles |
| `experience` | Roles, promotion path, highlights |
| `projects` | Featured work cards |
| `publications` | Citation-styled research list |
| `skills` | Skill categories for the explorer |
| `education` | Degree, school, grade, coursework |

Stat values such as `"₹1.4Cr+"` or `"3,000+"` count up automatically. The counter animates the numeric part and
keeps the prefix and suffix.

### Structure

```
app/
  layout.tsx            fonts, metadata, JSON-LD, no-flash theme script
  page.tsx              section order
  globals.css           design tokens, themes, keyframes
  opengraph-image.tsx   generated social card
  robots.ts, sitemap.ts, icon.svg
components/
  sections/             Hero, About, Experience, Projects, Publications, Skills, Education, Contact, Footer
  ui/                   Nav, ThemeToggle, Cursor, Magnetic, Reveal, ScrollProgress, NeuralField,
                        ProjectStack, SkillExplorer, Counter, CopyEmail, LocalTime, ...
lib/
  content.ts            ← edit this
  motion.ts             spring and stagger presets
  hooks.ts              media-query helpers
```

### Common tweaks

- **Accent colour:** change `--accent`, `--accent-soft`, `--field-accent` and `--selection` for both themes in `app/globals.css`.
  Check contrast against the background (aim for ≥ 4.5:1).
- **Fonts:** swap the `next/font/google` imports in `app/layout.tsx`. The CSS variable names stay the same.
- **Default theme:** change the `'dark'` fallback in `themeScript` in `app/layout.tsx`.
- **Domain:** change `site.url` in `lib/content.ts`. It feeds canonical URLs, Open Graph, robots and the sitemap.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **Add New → Project** and import the repo. The framework is detected as Next.js, and no settings or environment variables are needed.
3. Click **Deploy**.
4. To use the custom domain, go to **Project → Settings → Domains**, add `adithyareddy.online`, and create the DNS records Vercel shows.

Or from the CLI:

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

The whole page is statically prerendered, so it's served straight from Vercel's edge.
