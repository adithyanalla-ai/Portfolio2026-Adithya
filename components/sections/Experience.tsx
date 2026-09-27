import { experience } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y container-x">
      <SectionHeader
        id="experience-title"
        index="02"
        label="Experience"
        title={
          <>
            From freelancer to <em className="text-accent">lead</em>, in under two years.
          </>
        }
      />

      <ol className="border-t border-line">
        {experience.map((role) => (
          <li key={role.company} className="grid gap-8 border-b border-line py-12 md:grid-cols-12 md:py-16">
            <Reveal className="md:col-span-3">
              <div className="md:sticky md:top-[calc(var(--nav-h)+2rem)]">
                <p className="label">{role.period}</p>
                <p className="mt-3 font-display text-7xl font-light text-line-strong md:text-8xl" aria-hidden>
                  {role.start.slice(2)}
                  <span className="text-accent">’</span>
                </p>
              </div>
            </Reveal>

            <div className="md:col-span-9">
              <Reveal>
                <h3 className="font-display text-display-md">{role.title}</h3>
                <p className="mt-2 text-lg text-bone-soft">{role.company}</p>
              </Reveal>

              {role.path ? (
                <Reveal delay={0.08} className="mt-8">
                  <p className="label mb-3">Promotion path</p>
                  <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-0">
                    {role.path.map((step, i) => {
                      const last = i === role.path!.length - 1;
                      return (
                        <li key={step.title} className="flex items-center">
                          <span
                            className={`rounded-full border px-3.5 py-1.5 text-sm ${
                              last
                                ? "border-accent bg-accent-soft text-bone"
                                : "border-line text-bone-soft"
                            }`}
                          >
                            {step.title}
                            {step.note ? <span className="ml-2 text-muted">{step.note}</span> : null}
                          </span>
                          {!last ? (
                            <span aria-hidden className="mx-2 hidden h-px w-6 bg-line-strong sm:block" />
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                </Reveal>
              ) : null}

              <RevealGroup as="ul" className="mt-10 grid gap-x-10 gap-y-5 lg:grid-cols-2">
                {role.highlights.map((h, i) => (
                  <RevealItem as="li" key={h} className="flex gap-4 text-bone-soft">
                    <span className="label pt-1 text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-pretty leading-relaxed">{h}</span>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
