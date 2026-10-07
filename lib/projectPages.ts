/**
 * Keyword-focused project pages (/projects/[slug]).
 *
 * Every fact here comes from the résumé, the papers or existing posts. Anything not yet
 * confirmed is listed in `todos` (shown as dashed boxes in `npm run dev`, hidden in
 * production) and marked `// TODO` below. Keep descriptions high-level: no patent-pending
 * or security-sensitive implementation details.
 */

export type Screenshot = { src: string; alt: string; width: number; height: number; caption?: string };

export type ProjectPage = {
  slug: string;
  /** Exact target keyword, used verbatim as the H1. */
  keyword: string;
  /** Short name for links and breadcrumbs. */
  name: string;
  /** <title> (absolute, ~55 chars). */
  title: string;
  /** Meta description (~150 chars). */
  description: string;
  kicker: string;
  intro: string;
  status: string[];
  problem: string[];
  approach: string[];
  stack: { group: string; items: string[] }[];
  results: { value: string; label: string }[];
  resultNotes?: string[];
  screenshots: Screenshot[];
  links: { label: string; href: string }[];
  /** Related long-form post, if any. */
  writeUp?: string;
  /** Last content change (sitemap lastmod, schema dateModified). */
  updated: string;
  schema:
    | { type: "SoftwareApplication"; applicationCategory: string; operatingSystem?: string }
    | { type: "CreativeWork" };
  /** Scholarly sources for schema `citation`. */
  citations?: { name: string; url: string; publisher: string; date?: string }[];
  keywords: string[];
  /** What Adithya still needs to supply (dev-only display). */
  todos: string[];
};

export const projectPages: ProjectPage[] = [
  {
    slug: "gbni-generative-brand-narrative-intelligence",
    keyword: "GBNI: Generative Brand Narrative Intelligence",
    name: "GBNI",
    title: "GBNI: Generative Brand Narrative Intelligence Framework",
    description:
      "GBNI (Generative Brand Narrative Intelligence) is a state-aware multimodal AI agent framework for emotionally adaptive brand communication, on SSRN.",
    kicker: "Research framework · Agentic AI",
    intro:
      "GBNI is my state-aware multimodal agent framework for emotionally adaptive brand communication. Two papers are on SSRN, and its companion project, Autonomous Agency Workflows, runs agents in production.",
    status: ["Published on SSRN (v1 and v2)", "IEEE paper and book in preparation"],
    problem: [
      "Most generative systems treat every request as the first: a prompt goes in, text comes out, and nothing is remembered. That works for one-off tasks but fails for communication, where the right message depends on what has already happened and how the audience is responding.",
      "A brand needs a voice that stays recognisably its own while adapting to the emotional context it speaks into, consistently across every medium it uses.",
    ],
    approach: [
      "State-aware: the agent keeps an explicit picture of the situation, updates it as events occur, and generates from that state rather than from the latest request alone.",
      "Multimodal: one narrative is kept coherent across the media a brand uses.",
      "Emotionally adaptive: the voice adjusts to the emotional context while staying on-brand.",
      "GBNI v2 extends the Emotionally Adaptive Brand Narrative (EABN) framework to be consistency-governed, causally self-optimizing and multi-tenant.",
    ],
    stack: [
      { group: "Approach", items: ["State-aware agents", "Multimodal generation", "Multi-agent orchestration"] },
      // TODO: confirm the concrete models, providers and libraries used for GBNI before listing them.
      { group: "Production (Autonomous Agency Workflows)", items: ["LLM automation pipelines", "Agentic workflows"] },
    ],
    results: [
      { value: "2", label: "Papers on SSRN (v1 and v2)" },
      { value: "5", label: "Autonomous agent pipelines in production" },
      { value: "20+ hrs", label: "Staff time recovered every week" },
    ],
    resultNotes: ["A 120+ page IEEE paper and a book manuscript expanding the framework are in preparation."],
    screenshots: [], // TODO: add diagrams or screenshots (see todos for suggested shots and alt text).
    links: [
      { label: "GBNI v2 on SSRN (Abstract ID 7531958)", href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7531958" },
      { label: "GBNI v1 on SSRN (Abstract ID 6845958)", href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6845958" },
      { label: "GBNI explained (blog post)", href: "/blog/gbni-state-aware-agents" },
    ],
    writeUp: "/blog/gbni-state-aware-agents",
    updated: "2026-10-07",
    schema: { type: "CreativeWork" },
    citations: [
      {
        name: "Generative Brand Narrative Intelligence v2: Consistency-Governed, Causally Self-Optimizing, and Multi-Tenant Extension of the Emotionally Adaptive Brand Narrative (EABN) Framework",
        url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7531958",
        publisher: "SSRN",
        date: "2026-09",
      },
      {
        name: "Generative Brand Narrative Intelligence: A State-aware Multimodal Agent Framework for Autonomous Emotionally Adaptive Brand Communication",
        url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6845958",
        publisher: "SSRN",
        date: "2026-05",
      },
    ],
    keywords: ["GBNI", "Generative Brand Narrative Intelligence", "state-aware AI agents", "multimodal agents", "brand communication AI", "EABN framework"],
    todos: [
      "Tech stack: confirm models, providers and libraries (e.g. which LLM APIs and orchestration tools) GBNI and Autonomous Agency Workflows use.",
      "Screenshots: e.g. a high-level diagram of the state loop (alt: 'GBNI state loop: input updates the narrative state, which conditions the next message') and an anonymised workflow run (alt: 'Autonomous Agency Workflows dashboard showing completed agent runs'). Remove client data first.",
      "Links: add a code repository or demo if one can be public.",
    ],
  },
  {
    slug: "mithra-cybercrime-rapid-response-intelligence-platform",
    keyword: "MITHRA: Cybercrime Rapid-Response and Intelligence Platform",
    name: "MITHRA",
    title: "MITHRA: Cybercrime Rapid-Response & Intelligence Platform",
    description:
      "MITHRA is Adithya Reddy Nalla's self-directed R&D platform for responding to cybercrime quickly and turning incident signals into usable intelligence.",
    kicker: "Self-directed R&D · Security",
    intro:
      "MITHRA is a self-directed R&D platform for responding to cybercrime quickly and turning incident signals into usable intelligence. Its manuscript is in preparation for a Scopus-indexed journal.",
    status: ["Self-directed R&D", "Manuscript in preparation (Scopus-indexed journal)"],
    problem: [
      "When a cybercrime is reported, speed matters and the useful signals are scattered. MITHRA aims to shorten the path from an incident to a coordinated response and to turn individual reports into intelligence that can be acted on.",
      // TODO: confirm who MITHRA is for (victims, investigators, organisations) and the scope it covers.
    ],
    approach: [
      "Engineered with Claude Code- and Codex-assisted development workflows.",
      "Applies agentic AI and large language models to incident intake and intelligence.",
      // TODO: add a high-level architecture summary (no security-sensitive or unpublished details).
    ],
    stack: [
      { group: "AI", items: ["Agentic AI", "Large language models"] },
      { group: "Engineering", items: ["Claude Code-assisted development", "Codex-assisted development"] },
      // TODO: confirm languages, frameworks, data stores and hosting.
    ],
    results: [{ value: "Scopus", label: "Target: Scopus-indexed journal (manuscript in preparation)" }],
    resultNotes: ["Results will be reported in the manuscript."],
    screenshots: [], // TODO: add screenshots with all case data redacted.
    links: [{ label: "What I'm building in 2026 (blog post)", href: "/blog/what-im-building-in-2026" }],
    updated: "2026-10-07",
    schema: { type: "SoftwareApplication", applicationCategory: "SecurityApplication" },
    keywords: ["MITHRA", "cybercrime rapid response", "cyber threat intelligence platform", "agentic AI security", "cybercrime intelligence"],
    todos: [
      "Problem: confirm the target users and scope.",
      "Approach: add a high-level architecture summary that is safe to publish.",
      "Tech stack: confirm languages, frameworks, data stores and hosting.",
      "Results: add any evaluation numbers or pilots you can share, or keep 'reported in the manuscript'.",
      "Screenshots: e.g. incident intake screen (alt: 'MITHRA incident intake form with fields for incident type and evidence') and intelligence view (alt: 'MITHRA dashboard grouping related incidents'). Redact all case data.",
      "Links: add a demo, repository or manuscript link when public. Schema operatingSystem is omitted until the platform form (web, mobile) is confirmed.",
    ],
  },
  {
    slug: "diabetes-risk-prediction-web-app",
    keyword: "Diabetes Risk Prediction Web App",
    name: "Diabetes Risk Prediction",
    title: "Diabetes Risk Prediction Web App with Explainable ML",
    description:
      "An explainable diabetes risk prediction web app: a tuned Random Forest (82%+ accuracy, 0.87 ROC-AUC) with SHAP explanations, deployed on Streamlit.",
    kicker: "Peer-reviewed · Explainable ML",
    intro:
      "A diabetes risk prediction web app that estimates risk and explains every prediction it makes. The work is published in a peer-reviewed journal (IJSRED, October 2022) and runs as an interactive Streamlit app.",
    status: ["Peer-reviewed (IJSRED, Oct 2022)", "Deployed as a Streamlit web app"],
    problem: [
      "A risk score without a reason is a number someone must take on faith. In healthcare that isn't enough: a clinician or patient needs to know why the model reached its answer.",
      "For screening, the model also has to rank risk well across every threshold, not just score well at one.",
    ],
    approach: [
      "Analysed the clinical dataset, then trained a Random Forest, which captures non-linear interactions between clinical features and needs no feature scaling.",
      "Tuned hyperparameters with GridSearchCV using k-fold cross-validation, optimising ROC-AUC so the search rewards good risk ranking rather than raw accuracy.",
      "Explained predictions with SHAP: a global view of which features drive risk across the population, and a local view of which values raised or lowered one person's score.",
      "Deployed the model as an interactive Streamlit web app.",
    ],
    stack: [
      { group: "Modelling", items: ["Python", "scikit-learn", "Random Forest", "GridSearchCV"] },
      { group: "Explainability", items: ["SHAP"] },
      { group: "App", items: ["Streamlit"] },
      // TODO: confirm data libraries (e.g. pandas, NumPy) and the dataset used.
    ],
    results: [
      { value: "82%+", label: "Accuracy" },
      { value: "0.87", label: "ROC-AUC" },
      { value: "1", label: "SHAP explanation per prediction" },
    ],
    resultNotes: ["Research software, not a clinical diagnostic tool."],
    screenshots: [], // TODO: add app screenshots (see todos).
    links: [
      { label: "Paper in IJSRED (October 2022)", href: "https://ijsred.com" },
      { label: "Explaining every prediction (blog post)", href: "/blog/explaining-every-prediction-diabetes-risk" },
    ],
    writeUp: "/blog/explaining-every-prediction-diabetes-risk",
    updated: "2026-10-07",
    schema: { type: "SoftwareApplication", applicationCategory: "HealthApplication", operatingSystem: "Web browser" },
    citations: [
      {
        name: "Diabetes Data Analysis and Machine Learning Based Prediction Model on Streamlit Web App",
        url: "https://ijsred.com",
        publisher: "International Journal of Scientific Research and Engineering Development (IJSRED)",
        date: "2022-10",
      },
    ],
    keywords: ["diabetes risk prediction", "diabetes prediction web app", "explainable machine learning", "SHAP", "Random Forest", "Streamlit"],
    todos: [
      "Dataset: name the dataset (and its licence) the model was trained on.",
      "Tech stack: confirm data libraries (pandas, NumPy, Matplotlib, etc.).",
      "Links: add the live Streamlit app URL, the code repository, and the paper's direct URL or DOI (the IJSRED link currently points to the journal home page).",
      "Screenshots: input form (alt: 'Diabetes risk prediction web app form for entering glucose, BMI, age and other measurements'), result (alt: 'Predicted diabetes risk with a SHAP chart showing which measurements raised or lowered it'), global importance (alt: 'SHAP summary plot ranking the features that drive diabetes risk').",
    ],
  },
];

export const getProjectPage = (slug: string) => projectPages.find((p) => p.slug === slug);
