import { about, education, experience, projects, publications, site, skills } from "./content";

/**
 * Plain-text profile the AI chat answers from. Built from lib/content.ts so the assistant
 * always matches what the site says; edit content.ts, not this file.
 */
export function profileText(): string {
  const lines: string[] = [];
  lines.push(`Name: ${site.name}`);
  lines.push(`Role: ${site.role}`);
  lines.push(`Location: ${site.location}`);
  lines.push(`Summary: ${site.summary}`);
  lines.push(`Contact: email ${site.email}; phone ${site.phone}; LinkedIn ${site.linkedin}; website ${site.url}`);
  lines.push("");
  lines.push("About:");
  lines.push(about.lede);
  about.body.forEach((b) => lines.push(b));
  about.stats.forEach((s) => lines.push(`- ${s.value}: ${s.label}`));
  lines.push("");
  lines.push("Experience (most recent first):");
  experience.forEach((r) => {
    lines.push(`${r.title}, ${r.company} (${r.period})`);
    if (r.path) lines.push(`Promotion path: ${r.path.map((p) => p.title + (p.note ? ` (${p.note})` : "")).join(" -> ")}`);
    r.highlights.forEach((h) => lines.push(`- ${h}`));
  });
  lines.push("");
  lines.push("Projects:");
  projects.forEach((p) => {
    lines.push(`${p.name}: ${p.kicker}. ${p.summary}${p.meta ? ` [${p.meta}]` : ""}`);
    p.points.forEach((pt) => lines.push(`- ${pt}`));
    lines.push(`- Focus areas: ${p.tags.join(", ")}`);
  });
  lines.push("");
  lines.push("Publications and manuscripts:");
  publications.forEach((p) => lines.push(`- "${p.title}". ${p.venue}. ${p.date}.${p.id ? ` ${p.id}.` : ""} (${p.kind})`));
  lines.push(
    "- In preparation: a 120+ page IEEE paper and a book manuscript expanding GBNI; a MITHRA manuscript targeting a Scopus-indexed journal.",
  );
  lines.push("");
  lines.push("Skills:");
  skills.forEach((g) => lines.push(`- ${g.label}: ${g.items.join(", ")}`));
  lines.push("");
  lines.push(`Education: ${education.degree}, ${education.school}, ${education.period}, ${education.grade}.`);
  lines.push(`Relevant coursework: ${education.coursework.join(", ")}.`);
  return lines.join("\n");
}
