import type { Metadata } from "next";
import { site } from "@/lib/content";
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

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: `${site.name} — AI/ML Engineer`,
    description: site.description,
    siteName: site.name,
    locale: "en_IN",
  },
};

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
