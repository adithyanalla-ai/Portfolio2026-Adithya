import { Reveal } from "./Reveal";

type Props = {
  index: string;
  label: string;
  title: React.ReactNode;
  id: string;
  aside?: React.ReactNode;
};

/** Consistent section opener: mono index + label, large display title. */
export function SectionHeader({ index, label, title, id, aside }: Props) {
  return (
    <header className="mb-16 grid gap-8 md:mb-24 md:grid-cols-12">
      <Reveal className="md:col-span-3">
        <p className="label flex items-center gap-3">
          <span className="text-accent">{index}</span>
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          <span>{label}</span>
        </p>
      </Reveal>
      <Reveal className="md:col-span-9" delay={0.05}>
        <h2 id={id} className="font-display text-display-lg text-balance">
          {title}
        </h2>
        {aside ? <div className="mt-6 max-w-2xl text-lg text-bone-soft text-pretty">{aside}</div> : null}
      </Reveal>
    </header>
  );
}
