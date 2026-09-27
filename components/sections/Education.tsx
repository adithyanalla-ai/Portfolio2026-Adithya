import { education } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="container-x pb-[var(--section-y)]">
      <div className="grid gap-8 border-t border-line pt-12 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <p className="label flex items-center gap-3">
            <span className="text-accent">06</span>
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            <span>Education</span>
          </p>
        </Reveal>

        <div className="md:col-span-9">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="education-title" className="font-display text-display-md">
                {education.degree}
              </h2>
              <p className="mt-2 text-lg text-bone-soft">
                {education.school} · {education.period}
              </p>
            </div>
            <p className="font-display text-5xl font-light italic text-accent">
              {education.grade.split(" ")[0]}
              <span className="label ml-2 not-italic">CGPA</span>
            </p>
          </Reveal>

          <p className="label mt-12">Relevant coursework</p>
          <RevealGroup as="ul" className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-lg text-bone-soft" stagger={0.04}>
            {education.coursework.map((c, i) => (
              <RevealItem as="li" key={c}>
                {c}
                {i < education.coursework.length - 1 ? (
                  <span aria-hidden className="ml-2 text-line-strong">/</span>
                ) : null}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
