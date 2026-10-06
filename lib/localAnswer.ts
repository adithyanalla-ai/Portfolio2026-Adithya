import { about, education, experience, marketing, projects, publications, site, skills } from "./content";

/**
 * Offline answers from the résumé data: used when no AI key is configured, when the
 * API is unreachable, or on static hosting. Keyword intents, answered in first person.
 */
const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function localAnswer(question: string): string {
  const q = question.toLowerCase();
  const lead = experience[0];
  const find = (name: string) => projects.find((p) => p.name.toLowerCase().startsWith(name));

  if (has(q, "marketing", "campaign", "election", "admission", "growth", "meta ads", "a/b", "cost per lead", "business development")) {
    const [a, b] = marketing.campaigns;
    return `${marketing.summary} Campaigns: ${a.name} (${a.highlight}) and ${b.name} (${b.highlight}).`;
  }
  if (has(q, "aglier", "robot", "harvest", "patent", "robotics")) {
    const p = find("aglier")!;
    return `${p.name} is my ${p.kicker.toLowerCase()}: ${p.summary} ${p.points.join(" ")}`;
  }
  if (has(q, "gbni", "narrative", "ssrn", "brand")) {
    const p = find("gbni")!;
    return `${p.name}: ${p.summary} ${p.points.join(" ")}`;
  }
  if (has(q, "mithra", "cyber")) {
    const p = find("mithra")!;
    return `${p.name} is a ${p.kicker.toLowerCase()}. ${p.summary} ${p.points.join(" ")}`;
  }
  if (has(q, "diabetes", "shap", "streamlit", "health")) {
    const p = find("diabetes")!;
    return `${p.summary} ${p.points.join(" ")}`;
  }
  if (has(q, "lead", "pipeline", "revenue", "crore", "sql")) {
    const p = find("lead")!;
    return `${p.summary} ${p.points.join(" ")}`;
  }
  if (has(q, "publication", "paper", "research", "journal", "publish")) {
    return `My papers: ${publications.map((p) => `"${p.title}" (${p.venue}, ${p.date})`).join("; ")}.`;
  }
  if (has(q, "skill", "stack", "tech", "tools", "language", "python", "know")) {
    return `My toolkit: ${skills.map((g) => `${g.label}: ${g.items.slice(0, 4).join(", ")}`).join(". ")}.`;
  }
  if (has(q, "educat", "degree", "college", "university", "cgpa", "study", "studied")) {
    return `I have a ${education.degree} from ${education.school} (${education.period}, ${education.grade}).`;
  }
  if (has(q, "experience", "work", "job", "role", "eject", "company", "career", "promot", "int360")) {
    return `I'm ${lead.title} at ${lead.company} (${lead.period}), promoted from ${lead.path?.[0].title} to ${lead.title} in November 2025. Before that I was ${experience[1].title} at ${experience[1].company} (${experience[1].period}). Highlights: ${lead.highlights.slice(0, 3).join(" ")}`;
  }
  if (has(q, "contact", "email", "reach", "hire", "phone", "linkedin", "available", "freelance", "collaborat")) {
    return `The best way to reach me is email: ${site.email}. You can also call ${site.phone} or find me on LinkedIn at ${site.linkedinLabel}.`;
  }
  if (has(q, "where", "location", "based", "live", "city")) return `I'm based in ${site.location}.`;
  if (has(q, "impact", "achiev", "result", "number")) {
    return `${about.lede} ${about.stats.map((s) => `${s.value} ${s.label.toLowerCase()}`).join("; ")}.`;
  }
  if (has(q, "who", "about", "yourself", "introduce", "hello", "hi ", "hey")) {
    return `I'm ${site.name}, ${site.role}. ${site.summary} Ask me about my experience, projects like Aglier and GBNI, or my research.`;
  }
  return `I don't have a ready answer for that. Ask me about my experience, projects (Aglier, GBNI, MITHRA), research, skills or education, or email me at ${site.email}.`;
}
