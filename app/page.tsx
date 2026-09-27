import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Publications } from "@/components/sections/Publications";
import { Skills } from "@/components/sections/Skills";
import { Education } from "@/components/sections/Education";
import { LatestWriting } from "@/components/sections/LatestWriting";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Publications />
      <Skills />
      <Education />
      <LatestWriting />
      <Contact />
    </main>
  );
}
