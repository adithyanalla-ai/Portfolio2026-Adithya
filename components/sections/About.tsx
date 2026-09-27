import { about } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-y container-x">
      <SectionHeader
        id="about-title"
        index="01"
        label="About"
        title={
          <>
            Engineering that <em className="text-accent">earns</em> its seat in the room.
          </>
        }
      />

      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-9 md:col-start-4">
          <Reveal>
            <p className="text-lede text-pretty">{about.lede}</p>
          </Reveal>
          <RevealGroup className="mt-8 grid gap-6 text-secondary sm:grid-cols-2" delay={0.1}>
            {about.body.map((p) => (
              <RevealItem as="p" key={p} className="text-pretty leading-relaxed">
                {p}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>

      <RevealGroup
        as="dl"
        className="mt-20 grid grid-cols-2 border-t border-line md:mt-28 lg:grid-cols-4"
      >
        {about.stats.map((s, i) => (
          <RevealItem
            key={s.label}
            className={`flex flex-col gap-3 border-b border-line py-8 pr-6 lg:border-b-0 ${
              i > 0 ? "lg:border-l lg:pl-8" : ""
            } ${i % 2 === 1 ? "border-l pl-6 lg:pl-8" : ""}`}
          >
            <dt className="text-sm text-muted text-pretty">{s.label}</dt>
            <dd className="order-first font-display text-h2 font-light">
              <Counter value={s.value} />
            </dd>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
