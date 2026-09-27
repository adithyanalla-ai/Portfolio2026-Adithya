import { projects } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectStack } from "@/components/ui/ProjectStack";

export function Projects() {
  return (
    <section id="work" aria-labelledby="work-title" className="section-y container-x">
      <SectionHeader
        id="work-title"
        index="03"
        label="Selected work"
        title={
          <>
            Ideas taken all the way — to production, <em className="text-accent">patent</em>, and print.
          </>
        }
        aside="Five projects spanning production agent pipelines, a patent-bound robot, and peer-reviewed machine learning."
      />
      <ProjectStack projects={projects} />
    </section>
  );
}
