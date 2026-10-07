import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Marketing } from "@/components/sections/Marketing";
import { Publications } from "@/components/sections/Publications";
import { Skills } from "@/components/sections/Skills";
import { Education } from "@/components/sections/Education";
import { LatestWriting } from "@/components/sections/LatestWriting";
import { Contact } from "@/components/sections/Contact";
import { Arcade } from "@/components/sections/Arcade";

export const metadata: Metadata = pageMeta({
  title: "Adithya Reddy Nalla | Lead AI Engineer in Hyderabad",
  description:
    "Portfolio of Adithya Reddy Nalla, a Lead AI Engineer in Hyderabad building LLM and machine learning applications. Explore projects, research, and contact details.",
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Marketing />
      <Publications />
      <Skills />
      <Education />
      <LatestWriting />
      <Contact />
      <Arcade />
    </main>
  );
}
