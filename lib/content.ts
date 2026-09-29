/**
 * Single source of truth for all site copy.
 * Edit this file to update the portfolio — every section reads from here.
 */

export const site = {
  name: "Adithya Reddy",
  shortName: "Adithya",
  role: "AI/ML Engineer · Agentic AI & LLM Systems · Business Analyst",
  roleParts: ["AI/ML Engineer", "Agentic AI & LLM Systems", "Business Analyst"],
  summary:
    "I design agentic AI and LLM systems that leave the notebook, ship to production, and move the numbers a business actually reports on.",
  location: "Hyderabad, India",
  timezone: "Asia/Kolkata",
  url: "https://adithyareddy.online",
  email: "adithyareddy639@gmail.com",
  phone: "+91-90594 73960",
  phoneHref: "tel:+919059473960",
  linkedin: "https://www.linkedin.com/in/adithyareddy-ai",
  linkedinLabel: "linkedin.com/in/adithyareddy-ai",
  siteLabel: "adithyareddy.online",
  description:
    "Adithya Reddy — Lead AI Engineer in Hyderabad building agentic AI, LLM automation, and ML systems with measurable business impact. Published researcher.",
} as const;

export type NavItem = { id: string; label: string; /** Separate route instead of an on-page section */ href?: string };

export const nav: NavItem[] = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "research", label: "Research" },
  { id: "skills", label: "Skills" },
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "contact", label: "Contact" },
];

/** Home page check that also holds on static hosts serving `/index.html`. */
export const isHomePath = (pathname: string) => pathname === "/" || pathname.endsWith("/index.html");

/** Route match that tolerates static-host `.html` suffixes (`/blog.html`, `/blog/post.html`). */
export const isOnRoute = (pathname: string, href: string) => {
  const clean = pathname.replace(/\.html$/, "");
  return clean === href || clean.endsWith(href) || clean.includes(`${href}/`);
};

/** Resolve a nav item to a link that works from any page. */
export const navHref = (item: NavItem, onHome: boolean) =>
  item.href ?? (onHome ? `#${item.id}` : `/#${item.id}`);

export const about = {
  lede:
    "Three years of turning machine learning into operating leverage — from data pipelines to autonomous agents that do real work.",
  body: [
    "I sit where engineering meets the boardroom. I build ML, NLP and agentic LLM systems end-to-end, then work alongside C-suite leaders to decide where those systems should point next.",
    "I independently take AI work from idea to patent- and publication-ready — the same rigor goes into production pipelines as into peer-reviewed research.",
  ],
  stats: [
    { value: "3+", label: "Years building ML, NLP & agentic systems" },
    { value: "₹1.4Cr+", label: "Business impact facilitated" },
    { value: "3,000+", label: "Qualified leads generated" },
    { value: "20+ hrs", label: "Staff time automated weekly, across 4 organizations" },
  ],
} as const;

export type Role = {
  title: string;
  company: string;
  period: string;
  start: string;
  location?: string;
  path?: { title: string; note?: string }[];
  highlights: string[];
};

export const experience: Role[] = [
  {
    title: "Lead AI Engineer",
    company: "Eject Solutions Pvt Ltd",
    period: "Mar 2024 — Present",
    start: "2024",
    path: [
      { title: "Freelance AI & Data Engineer", note: "Mar 2024" },
      { title: "Business Analyst & AI Engineer" },
      { title: "Lead AI Engineer", note: "Nov 2025" },
    ],
    highlights: [
      "Built LLM-powered automation pipelines that replaced repetitive manual workflows across client operations.",
      "Designed an agentic AI architecture that was adopted as the company's production blueprint for new builds.",
      "Made model and pipeline deployment 40% faster.",
      "Delivered INR 4L in cost reduction on an engagement with KL University.",
      "Ran the data side of a lead-generation campaign that produced 3,000+ qualified leads.",
      "Reduced sprint delays by 35%.",
      "Shipped Power BI dashboards that gave leadership a live read on pipeline and performance metrics.",
    ],
  },
  {
    title: "Marketing Analytics Analyst",
    company: "INT360 Design Studio",
    period: "Mar 2023 — Mar 2024",
    start: "2023",
    highlights: [
      "Automated recurring reporting and data workflows, freeing the team from manual spreadsheet work.",
      "Built campaign and performance dashboards used for weekly marketing decisions.",
      "Designed and analysed A/B tests to validate creative and channel choices with evidence.",
      "Ran cohort analyses to surface retention and engagement patterns across customer segments.",
    ],
  },
];

export type Project = {
  index: string;
  name: string;
  kicker: string;
  summary: string;
  points: string[];
  tags: string[];
  meta?: string;
  /** Project mark, as a path without the `-256/-512.webp` suffix. Shown as the card's main visual. */
  logo?: string;
  /** Keys from lib/figures.ts. With a logo they're all thumbnails; otherwise the first is the main image. */
  images?: string[];
  /** Deeper write-up (usually a blog post). */
  href?: string;
  /** Animated diagram shown as the card's main visual. */
  diagram?: "lead-pipeline";
};

export const projects: Project[] = [
  {
    index: "01",
    name: "MITHRA",
    kicker: "Cybercrime rapid-response & intelligence platform",
    summary:
      "A self-directed R&D platform for responding to cybercrime quickly and turning incident signals into usable intelligence.",
    points: [
      "Engineered with Claude Code- and Codex-assisted development workflows.",
      "Manuscript in preparation, pursuing publication in a Scopus-indexed journal.",
    ],
    tags: ["Agentic AI", "LLMs", "Security", "R&D"],
    meta: "Self-directed R&D",
  },
  {
    index: "02",
    name: "Aglier",
    kicker: "Force-adaptive, lizard-inspired tree-climbing harvester",
    summary:
      "A robot that climbs trees and harvests fruit, deciding through a tiered edge–cloud architecture with an asynchronous narrative layer on top.",
    points: [
      "Paper submitted to IEEE Transactions on Robotics (Regular Paper, September 2026).",
      "Sole inventor, drafting the patent specification.",
      "Carries an onboard GBNI subsystem for state-aware reasoning.",
    ],
    tags: ["Robotics", "Computer Vision", "Embedded AI"],
    meta: "Submitted · IEEE T-RO",
    logo: "/images/aglier/logo",
    images: ["aglier-fig9", "aglier-fig14", "aglier-fig3", "aglier-fig5"],
    href: "/blog/aglier-ai-tree-climbing-fruit-harvesting-robot",
  },
  {
    index: "03",
    name: "GBNI (V2) & Autonomous Agency Workflows",
    kicker: "State-aware multimodal agents for adaptive brand communication",
    summary:
      "Generative Brand Narrative Intelligence — an agent framework that reads context and emotional state to adapt how a brand speaks.",
    points: [
      "Published on SSRN (Abstract ID: 6845958).",
      "Expanding into a 120+ page IEEE paper and a full book manuscript.",
      "5 autonomous agent pipelines in production, recovering 20+ hours every week.",
    ],
    tags: ["Multi-agent", "Multimodal", "LLMs", "Production"],
    meta: "SSRN · 6845958",
    href: "/blog/gbni-state-aware-agents",
  },
  {
    index: "04",
    name: "Lead Generation Data Pipeline",
    kicker: "Four ad channels in, one scored lead list out",
    summary:
      "A Python + SQL pipeline that pulls leads from every campaign channel, cleans and de-duplicates them into one golden record per person, scores them, and reports which campaigns bring leads worth calling.",
    points: [
      "One connector layer (connectors.py) lands Meta lead ads, Google Ads, LinkedIn and website, CRM and event forms in a single raw table.",
      "Python cleaning plus Python + SQL de-duplication build one golden record per lead before SQL scoring.",
      "Scores roll up into a campaign_performance report that compares channels on lead quality, not just volume.",
      "3,000+ qualified leads generated and ₹1.4Cr+ in revenue facilitated.",
    ],
    tags: ["Python", "SQL", "Data Engineering", "Lead Scoring"],
    meta: "₹1.4Cr+ facilitated",
    diagram: "lead-pipeline",
    href: "/blog/anatomy-of-a-lead-generation-pipeline",
  },
  {
    index: "05",
    name: "Diabetes Risk Prediction Engine",
    kicker: "Explainable clinical risk model, deployed",
    summary:
      "A peer-reviewed prediction model that estimates diabetes risk and explains every prediction it makes.",
    points: [
      "82%+ accuracy and 0.87 ROC-AUC with Random Forest tuned via GridSearchCV.",
      "SHAP explainability for per-patient feature attribution.",
      "Deployed as an interactive Streamlit web app.",
    ],
    tags: ["scikit-learn", "SHAP", "Streamlit"],
    meta: "Peer-reviewed",
    href: "/blog/explaining-every-prediction-diabetes-risk",
  },
];

export type Publication = {
  title: string;
  venue: string;
  date: string;
  id?: string;
  href?: string;
  kind: string;
};

export const publications: Publication[] = [
  {
    title:
      "Aglier: A Force-Adaptive, Lizard-Inspired Tree-Climbing Harvester with a Tiered Edge-Cloud Decision Architecture and an Asynchronous Narrative Layer",
    venue: "IEEE Transactions on Robotics",
    date: "Submitted Sept 2026",
    id: "Manuscript 26-1805",
    kind: "Under review · Regular paper",
  },
  {
    title:
      "Generative Brand Narrative Intelligence: A State-Aware Multimodal Agent Framework for Emotionally Adaptive Brand Communication",
    venue: "SSRN",
    date: "Preprint",
    id: "Abstract ID: 6845958",
    href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6845958",
    kind: "Working paper",
  },
  {
    title: "Diabetes Data Analysis and Machine Learning Based Prediction Model on Streamlit Web App",
    venue: "International Journal of Scientific Research and Engineering Development (ijsred.com)",
    date: "Oct 2022",
    href: "https://ijsred.com",
    kind: "Peer-reviewed journal",
  },
];

export type SkillGroup = { id: string; label: string; blurb: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    id: "agentic",
    label: "Agentic AI & LLMs",
    blurb: "Autonomous, tool-using systems that run in production.",
    items: [
      "Multi-agent orchestration",
      "LLM automation pipelines",
      "Prompt engineering",
      "Claude Code & Codex workflows",
    ],
  },
  {
    id: "ml",
    label: "Machine Learning",
    blurb: "Classical ML, done carefully and explained well.",
    items: [
      "Supervised learning",
      "Random Forest",
      "GridSearchCV tuning",
      "SHAP explainability",
      "NLP",
      "Deep learning",
      "scikit-learn",
    ],
  },
  {
    id: "genai",
    label: "Generative AI",
    blurb: "Generation that adapts to context and state.",
    items: ["Multimodal agents", "State-aware generation", "Narrative intelligence"],
  },
  {
    id: "analytics",
    label: "Analytics & BI",
    blurb: "From raw data to decisions leadership acts on.",
    items: ["Power BI", "A/B testing", "Cohort analysis", "Dashboarding", "Business analysis", "Lead analytics"],
  },
  {
    id: "mlops",
    label: "MLOps & Cloud",
    blurb: "Getting models deployed — and keeping them there.",
    items: ["Model deployment", "Pipeline automation", "Streamlit", "Reusable delivery templates"],
  },
  {
    id: "languages",
    label: "Core Languages",
    blurb: "The tools underneath everything else.",
    items: ["Python", "SQL"],
  },
];

export const education = {
  degree: "B.Tech, Data Science",
  school: "KL University",
  period: "2019 — 2023",
  grade: "8.1 CGPA",
  coursework: [
    "Machine Learning",
    "Deep Learning",
    "Natural Language Processing",
    "Statistics & Probability",
    "Data Structures & Algorithms",
    "Database Systems",
  ],
} as const;
