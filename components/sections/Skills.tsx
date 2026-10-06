import { skills } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkillExplorer } from "@/components/ui/SkillExplorer";
import { Reveal } from "@/components/ui/Reveal";

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y container-x">
      <SectionHeader
        id="skills-title"
        index="06"
        label="Capabilities"
        title={
          <>
            A toolkit, <em className="text-accent">organised</em>.
          </>
        }
        aside="Six disciplines, one practice. Pick a category to see what sits inside it."
      />
      <Reveal amount={0.15}>
        <SkillExplorer groups={skills} />
      </Reveal>
    </section>
  );
}
