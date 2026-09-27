import { site } from "@/lib/content";
import { NeuralField } from "@/components/ui/NeuralField";
import { LocalTime } from "@/components/ui/LocalTime";
import { Magnetic } from "@/components/ui/Magnetic";
import { Arrow } from "@/components/ui/Arrow";

/** Splits a word into letters that rise from behind a mask, staggered. */
function KineticWord({ word, start, className = "" }: { word: string; start: number; className?: string }) {
  return (
    <span aria-hidden className={`-mb-[0.2em] inline-flex overflow-hidden pb-[0.2em] pr-[0.08em] ${className}`}>
      {word.split("").map((ch, i) => (
        <span
          key={i}
          className="anim-rise inline-block"
          style={{ "--d": `${start + i * 45}ms` } as React.CSSProperties}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function Hero() {
  const [first, last] = site.name.split(" ");

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-[var(--nav-h)]"
    >
      {/* Generative layer, masked to fade toward the edges */}
      <div
        className="anim-fade absolute inset-0 -z-0 [mask-image:radial-gradient(ellipse_75%_65%_at_65%_45%,black_30%,transparent_100%)]"
        style={d(400)}
      >
        <NeuralField />
      </div>

      <div className="container-x relative z-10 flex flex-1 flex-col justify-between gap-12 pb-10 pt-10 md:pt-16">
        <div className="flex items-start justify-between gap-6">
          <p className="label anim-fade-up" style={d(100)}>
            <span className="text-accent">●</span>&nbsp; Lead AI Engineer — Eject Solutions
          </p>
          <p className="label anim-fade-up hidden text-right sm:block" style={d(200)}>
            {site.location}
            <br />
            <LocalTime timeZone={site.timezone} /> IST
          </p>
        </div>

        <div>
          <h1
            id="hero-title"
            aria-label={site.name}
            className="font-display text-display-xl font-light tracking-[-0.045em]"
          >
            <KineticWord word={first} start={150} />
            <br />
            <KineticWord word={last} start={420} className="italic text-accent" />
          </h1>

          <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12">
            <p className="anim-fade-up md:col-span-5" style={d(700)}>
              {site.roleParts.map((part, i) => (
                <span key={part} className="label block py-1 text-bone-soft">
                  <span className="text-accent">0{i + 1}</span>&nbsp;&nbsp;{part}
                </span>
              ))}
            </p>
            <p
              className="anim-fade-up-lcp text-lede text-pretty text-bone md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7"
              style={d(300)}
            >
              {site.summary}
            </p>
          </div>
        </div>

        <div
          className="anim-fade-up flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={d(1000)}
        >
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-bone-soft">
            <li>
              <a href={`mailto:${site.email}`} className="link-draw hover:text-bone">
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 hover:text-bone">
                <span className="link-draw">LinkedIn</span> <Arrow />
              </a>
            </li>
            <li>
              <a href={site.url} className="group inline-flex items-center gap-1 hover:text-bone">
                <span className="link-draw">{site.siteLabel}</span> <Arrow />
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-6">
            <a href="#about" className="label group hidden items-center gap-3 hover:text-bone md:inline-flex">
              <span aria-hidden className="relative block h-8 w-px overflow-hidden bg-line">
                <span className="anim-scroll-cue absolute inset-0 bg-accent" />
              </span>
              Scroll
            </a>
            <Magnetic>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-transform duration-300 active:scale-95"
              >
                Start a conversation <Arrow direction="right" />
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
