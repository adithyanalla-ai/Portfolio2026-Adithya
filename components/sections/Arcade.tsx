import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ArcadeLoader } from "@/components/ui/ArcadeLoader";

export function Arcade() {
  return (
    <section id="play" aria-labelledby="play-title" className="section-y container-x border-t border-line">
      <SectionHeader
        id="play-title"
        index="09"
        label="Play"
        title={
          <>
            Before you go, <em className="text-accent">play</em>.
          </>
        }
        aside="A small Pac-Man, built from scratch for this site. Keyboard, swipe or the on-screen buttons."
      />
      <Reveal amount={0.1}>
        <ArcadeLoader />
      </Reveal>
    </section>
  );
}
