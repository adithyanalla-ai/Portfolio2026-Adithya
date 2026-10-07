/**
 * Registered images, pre-resized to 800w and ≤1600w WebP (see docs/DEVELOPMENT.md → Images).
 * Markdown references them by key — `![alt](fig:aglier-fig9 "Caption")` — and the
 * blog renders a responsive <img srcset> with fixed dimensions (no layout shift).
 */

export type Figure = {
  /** Path without the `-800.webp` / `-1600.webp` suffix */
  base: string;
  /** Intrinsic size of the largest variant */
  width: number;
  height: number;
  /** Width of the largest variant file (≤1600) */
  maxWidth: number;
  alt: string;
  /** Shown under the image when it's used as a post's hero */
  caption?: string;
};

export const figures: Record<string, Figure> = {
  "aglier-fig9": {
    base: "/images/aglier/fig9-annotated-view",
    width: 1227,
    height: 1282,
    maxWidth: 1227,
    caption: "FIG. 9: Annotated view of the robot (Cam Bot). Four clamps hold the trunk; the arm, gripper and basket do the picking.",
    alt: "Annotated patent drawing of the Aglier tree-climbing fruit-harvesting robot clamped to a trunk with four clamps, showing the AI camera module, articulated arm, gripper, collection basket, battery pack and communication module.",
  },
  "aglier-fig14": {
    base: "/images/aglier/fig14-harvest-cycle-timing",
    width: 1600,
    height: 867,
    maxWidth: 1600,
    alt: "Timing diagram of the per-fruit harvest cycle in five stages: climb and reposition, vision confirmation and AI decision, manipulator approach, cut or grasp, and transfer to the basket, with a structured event log feeding the GBNI narrative tier.",
  },
  "aglier-fig3": {
    base: "/images/aglier/fig3-claw-closure-geometry",
    width: 1536,
    height: 1024,
    maxWidth: 1536,
    alt: "Geometry of a claw pair closing around a tree trunk, showing claw length L, trunk radius r and closure angle theta, with the relationships r = L sin(theta/2) and theta = 2 arcsin(r/L).",
  },
  "aglier-fig5": {
    base: "/images/aglier/fig5-bark-engagement-embodiments",
    width: 1536,
    height: 1024,
    maxWidth: 1536,
    alt: "Six alternative bark-engagement designs: claw friction clamp, microspine array, hybrid adhesive and microspine foot, tendon-driven wrap gripper, wheeled spring-cinch mechanism and pneumatic flexible clamp.",
  },
  "parity-fig1": {
    base: "/images/algorithmic-parity/fig1-ai-adoption",
    width: 1400,
    height: 680,
    maxWidth: 1400,
    alt: "Line chart of organizational AI use from 2020 to 2025: any AI use rises from about 50 percent to 88 percent, and generative AI use rises from 33 percent in 2023 to 79 percent in 2025.",
  },
  "parity-fig2": {
    base: "/images/algorithmic-parity/fig2-stylized-advantage",
    width: 1400,
    height: 720,
    maxWidth: 1400,
    alt: "Stylized chart: advantage from generic AI adoption falls linearly as category adoption share rises from 0 to 1, while advantage from Differentiation Capital rises slowly; the lines cross near 0.6, in the algorithmic parity phase.",
  },
  "parity-fig3": {
    base: "/images/algorithmic-parity/fig3-differentiation-capital",
    width: 1400,
    height: 1240,
    maxWidth: 1400,
    caption: "The Differentiation Capital framework: from AI diffusion to sustainable marketing advantage.",
    alt: "Framework diagram: AI diffusion leads to algorithmic parity, which moves advantage to five Differentiation Capital components (brand, proprietary data, human trust, causal learning, visibility), producing sustainable marketing advantage, reinforced by the Synthetic Content Paradox.",
  },
};

export const figureSrc = (f: Figure, w: 800 | 1600) => `${f.base}-${w}.webp`;
export const figureSrcSet = (f: Figure) => `${figureSrc(f, 800)} 800w, ${figureSrc(f, 1600)} ${f.maxWidth}w`;
