import Image from "next/image";
import { site } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";

/** Social posts from adios.marketing. Files: public/images/social/<file>-640.webp (grid) and -1080.webp (full size). */
const posts = [
  {
    file: "adios-diwali-campaign",
    alt: "adios.marketing post: Your Diwali campaign is already late. The festive season now starts at Navratri (11 Oct), with a four-week plan through Dhanteras (6 Nov) and Diwali (8 Nov).",
  },
  {
    file: "adios-qualified-leads",
    alt: "adios.marketing post: Meta's AI will find you more leads, not better ones. A cheap lead form with name and phone is compared with a qualified lead form that adds budget and timeline questions.",
  },
  {
    file: "adios-instagram-seo",
    alt: "adios.marketing post: hashtags alone won't get you found. Instagram reads your caption, the text on your image and your alt text, and its AI analyses on-screen text, visuals and voiceover.",
  },
  {
    file: "adios-search-multiplied",
    alt: "adios.marketing post: Search didn't die, it multiplied. Buyers discover brands through Google, TikTok, YouTube, Reddit and ChatGPT; 34% discover brands via search engines and 48% of Gen Z use social networks to research brands (GWI Core, 2026).",
  },
  {
    file: "adios-buyer-journey",
    alt: "adios.marketing post: the modern buyer journey. One buyer discovers on TikTok, researches on Google, verifies on Reddit, gets a recommendation from ChatGPT, then decides and buys.",
  },
];

const links = [
  { label: "Instagram", href: site.instagram, primary: true },
  { label: "Upwork profile", href: site.upwork },
  { label: "LinkedIn", href: site.linkedin },
];

export function SocialWork() {
  return (
    <section id="social" aria-labelledby="social-title" className="section-y container-x border-t border-line">
      <SectionHeader
        id="social-title"
        index="11"
        label="Social"
        title={
          <>
            Find me <em className="text-accent">elsewhere</em>.
          </>
        }
        aside={
          <>
            Posts from <strong className="font-medium text-primary">adios.marketing</strong> ({site.instagramLabel} on
            Instagram): short notes on AI search, lead quality and festive campaigns. Open any post to see it full size.
          </>
        }
      />

      <Reveal amount={0.1}>
        <ul className="flex flex-wrap items-center gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn group ${l.primary ? "btn-primary" : "btn-ghost"}`}
              >
                {l.label} <Arrow />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {posts.map((p) => (
            <li key={p.file}>
              <a
                href={`/images/social/${p.file}-1080.webp`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open full size: ${p.alt}`}
                className="block overflow-hidden rounded-2xl border border-line transition-[border-color,translate] duration-500 ease-[var(--ease-spring)] hover:-translate-y-1 hover:border-line-strong"
              >
                <Image
                  src={`/images/social/${p.file}-640.webp`}
                  width={640}
                  height={800}
                  alt={p.alt}
                  sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 46vw"
                  loading="lazy"
                  unoptimized
                  className="block h-auto w-full"
                />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
