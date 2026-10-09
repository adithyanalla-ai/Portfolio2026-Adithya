import { publications } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";

/** Academic-citation styling: numbered references, italic venues, hanging indent. */
export function Publications() {
  return (
    <section id="research" aria-labelledby="research-title" className="section-y container-x">
      <SectionHeader
        id="research-title"
        index="05"
        label="Publications"
        title={
          <>
            On the <em className="text-accent">record</em>.
          </>
        }
        aside="Peer-reviewed and preprint work. Three papers are on SSRN: a theory of marketing advantage under Algorithmic Parity and both GBNI papers (v1 and v2); a GBNI IEEE paper, a MITHRA Scopus-track manuscript and a book are in preparation."
      />

      <RevealGroup as="ol" className="border-t border-line md:ml-[25%]">
        {publications.map((pub, i) => (
          <RevealItem
            as="li"
            key={pub.title}
            className="group grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-10 sm:grid-cols-[4rem_1fr]"
          >
            <span className="text-sm font-medium tabular-nums text-accent">[{i + 1}]</span>
            <article>
              <p className="label mb-4">{pub.kind}</p>
              <h3 className="font-display text-2xl leading-snug text-balance sm:text-3xl">
                “{pub.title}.”
              </h3>
              <p className="mt-4 text-secondary">
                <cite className="italic">{pub.venue}</cite>
                <span className="text-muted">
                  {" · "}
                  {pub.date}
                  {pub.id ? <> · {pub.id}</> : null}
                </span>
              </p>
              {pub.href ? (
                <a
                  href={pub.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap label mt-6 inline-flex items-center gap-2 text-secondary hover:text-accent"
                >
                  <span className="link-draw">View source</span>
                  <Arrow />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
