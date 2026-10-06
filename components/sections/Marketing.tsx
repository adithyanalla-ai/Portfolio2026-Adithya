import { SectionHeader } from "@/components/ui/SectionHeader";
import { MarketingTabs } from "@/components/ui/MarketingTabs";
import { Reveal } from "@/components/ui/Reveal";

export function Marketing() {
  return (
    <section id="marketing" aria-labelledby="marketing-title" className="section-y container-x">
      <SectionHeader
        id="marketing-title"
        index="04"
        label="Marketing"
        title={
          <>
            The <em className="text-accent">growth</em> side.
          </>
        }
        aside="Growth marketing, business development and campaign analytics: the same data and automation skills, pointed at leads, admissions and elections. Toggle through the marketing side of my résumé."
      />
      <Reveal amount={0.15}>
        <MarketingTabs />
      </Reveal>
    </section>
  );
}
