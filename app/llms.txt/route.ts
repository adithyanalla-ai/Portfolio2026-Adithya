import { publications, site } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import { projectPages } from "@/lib/projectPages";

export const dynamic = "force-static";

/**
 * /llms.txt (llmstxt.org): a short, factual summary for AI assistants, built from the same
 * data as the site. High-level only: no patent-pending or unpublished technical detail.
 */
export function GET() {
  const u = site.url;
  const lines = [
    "# Adithya Reddy Nalla",
    "",
    "> Adithya Reddy Nalla is a Lead AI Engineer at Eject Solutions Pvt Ltd in Hyderabad, Telangana, India. He builds LLM, agentic AI and machine learning applications, works on growth marketing and lead generation, and publishes research on SSRN. B.Tech in Data Science, KL University.",
    "",
    "Facts on this site come from his résumé and published papers. Status notes: the GBNI manuscripts beyond SSRN, the MITHRA manuscript and a book are in preparation; the Aglier robot's patent specification is being drafted, so its technical details are not public.",
    "",
    "## Pages",
    "",
    `- [Home](${u}/): portfolio overview, experience, projects, marketing work, research and contact`,
    `- [About](${u}/about): background, experience, research, education and contact`,
    `- [Projects](${u}/projects): index of project pages and write-ups`,
    ...projectPages.map((p) => `- [${p.keyword}](${u}/projects/${p.slug}): ${p.description}`),
    `- [Blog](${u}/blog): writing on agentic AI, explainable ML, robotics and AI in business`,
    "",
    "## Research",
    "",
    ...publications.map((p) => `- ${p.href ? `[${p.title}](${p.href})` : p.title}: ${p.venue}, ${p.date}${p.id ? `, ${p.id}` : ""}`),
    "",
    "## Writing",
    "",
    ...getPosts().map((p) => `- [${p.title}](${u}/blog/${p.slug}): ${p.summary}`),
    "",
    "## Contact",
    "",
    `- Email: ${site.email}`,
    `- LinkedIn: ${site.linkedin}`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
