"use client";

import { useEffect, useRef } from "react";
import { useHydratedReducedMotion } from "@/lib/hooks";

/**
 * Animated diagram of the lead-generation pipeline: leads stream in from four channels,
 * pass Extract → Clean → Dedupe → Score, and land in the campaign_performance report.
 * Invalid rows drop out at Clean, duplicates merge away at Dedupe, survivors are scored
 * hot / warm / cold. It's a simulation (counts are illustrative, not production data).
 *
 * Drawn in one SVG; a requestAnimationFrame loop moves a fixed pool of dots by writing
 * attributes directly (no React re-renders), and only runs while the diagram is on screen.
 * Reduced motion → the static diagram.
 */

const W = 320;
const H = 486;
const TRUNK_X = 20; // the flow line runs through the stage badges
const ENTRY_Y = 76; // where the source curves meet the trunk (top of Extract)
const SOURCES = ["Meta ads", "Google Ads", "LinkedIn", "Web · CRM"];
const SRC_W = 74;
const srcX = (i: number) => i * ((W - SRC_W) / 3);

const STAGES = [
  { n: 1, title: "Extract", sub: "connectors.py", table: "raw_leads" },
  { n: 2, title: "Clean", sub: "Python", table: "clean_leads" },
  { n: 3, title: "Dedupe", sub: "Python + SQL", table: "golden_leads" },
  { n: 4, title: "Score", sub: "SQL", table: "lead_scores" },
];
const STAGE_H = 50;
const STAGE_W = 196;
const stageTop = (k: number) => ENTRY_Y + k * 82;
const stageMid = (k: number) => stageTop(k) + STAGE_H / 2;
const REPORT_TOP = stageTop(4);
const REPORT_H = 80;
const REPORT_BADGE_Y = REPORT_TOP + 24;
const TIERS = [
  { label: "Hot", fill: "var(--accent)" },
  { label: "Warm", fill: "color-mix(in oklab, var(--accent) 45%, var(--text-muted))" },
  { label: "Cold", fill: "var(--text-muted)" },
];
const BAR_X = 212;
const BAR_W = 94;

// Distances along the trunk (from ENTRY_Y) at which a dot reaches each badge / the report.
const AT = [...STAGES.map((_, k) => stageMid(k) - ENTRY_Y), REPORT_BADGE_Y - ENTRY_Y];
const CURVE_S = 0.8; // seconds on the source curve
const SPEED = 88; // viewBox units per second on the trunk
const SPAWN_EVERY = 0.3;
const POOL = 36;
const DIE_S = 0.45;

type Fate = "ok" | "invalid" | "dupe";
type Dot = { on: boolean; src: number; t: number; fate: Fate; tier: number; passed: number; dying: number };

function bezier(sx: number, u: number) {
  // P0 (sx, 34) → P1 (sx, 58) → P2 (TRUNK_X, 50) → P3 (TRUNK_X, ENTRY_Y)
  const p = [
    [sx, 34],
    [sx, 58],
    [TRUNK_X, 50],
    [TRUNK_X, ENTRY_Y],
  ];
  const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u ** 2, d = u ** 3;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
}

export function LeadPipeline({ className = "" }: { className?: string }) {
  const reduce = useHydratedReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const badgeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const srcRefs = useRef<(SVGRectElement | null)[]>([]);
  const countRefs = useRef<(SVGTextElement | null)[]>([]);
  const barRefs = useRef<(SVGRectElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (reduce || !svg) return;
    const dots: Dot[] = Array.from({ length: POOL }, () => ({ on: false, src: 0, t: 0, fate: "ok", tier: 0, passed: -1, dying: 0 }));
    const glow = new Array(STAGES.length + 1).fill(0);
    const srcGlow = new Array(SOURCES.length).fill(0);
    const counts = new Array(STAGES.length).fill(0);
    const tiers = [0, 0, 0];
    let spawnIn = 0;
    let raf = 0;
    let last = 0;
    let visible = false;

    const fmt = new Intl.NumberFormat("en-IN");
    const bump = (k: number) => {
      counts[k]++;
      const el = countRefs.current[k];
      if (el) el.textContent = `${fmt.format(counts[k])} rows`;
    };
    const drawBars = () => {
      const total = tiers[0] + tiers[1] + tiers[2] || 1;
      tiers.forEach((c, i) => barRefs.current[i]?.setAttribute("width", String(Math.max(2, (c / total) * BAR_W))));
    };

    const spawn = () => {
      const d = dots.find((x) => !x.on);
      if (!d) return;
      const r = Math.random();
      d.on = true;
      d.src = Math.floor(Math.random() * SOURCES.length);
      d.t = 0;
      d.fate = r < 0.18 ? "invalid" : r < 0.33 ? "dupe" : "ok";
      const s = Math.random();
      d.tier = s < 0.3 ? 0 : s < 0.72 ? 1 : 2;
      d.passed = -1;
      d.dying = 0;
      srcGlow[d.src] = 1;
    };

    const step = (dt: number) => {
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawn();
        spawnIn = SPAWN_EVERY * (0.6 + Math.random() * 0.8);
      }
      dots.forEach((d, i) => {
        const el = dotRefs.current[i];
        if (!el) return;
        if (!d.on) {
          el.setAttribute("opacity", "0");
          return;
        }
        d.t += dt;
        let x: number, y: number;
        let fill = "var(--text-muted)";
        let r = 3.2;
        let opacity = 1;
        if (d.t < CURVE_S) {
          [x, y] = bezier(srcX(d.src) + SRC_W / 2, d.t / CURVE_S);
        } else {
          // Where the dot stops: invalid at Clean, duplicate at Dedupe, everyone else at the report.
          const stop = d.fate === "invalid" ? AT[1] : d.fate === "dupe" ? AT[2] : AT[4];
          const dist = Math.min((d.t - CURVE_S) * SPEED, stop);
          x = TRUNK_X;
          y = ENTRY_Y + dist;
          while (d.passed + 1 < AT.length && dist >= AT[d.passed + 1]) {
            const k = ++d.passed;
            glow[k] = 1;
            const survives = !(k === 1 && d.fate === "invalid") && !(k === 2 && d.fate === "dupe");
            if (k < STAGES.length && survives) bump(k);
            if (k === 4) {
              tiers[d.tier]++;
              drawBars();
            }
          }
          if (d.passed >= 1 && d.fate !== "invalid") fill = "var(--text-secondary)";
          if (d.passed >= 2) fill = "var(--text-primary)";
          if (d.passed >= 3) fill = TIERS[d.tier].fill;
          if (dist >= stop) {
            d.dying += dt;
            const k = Math.min(1, d.dying / DIE_S);
            opacity = 1 - k;
            if (d.fate === "invalid") {
              x += k * 16; // rejected rows slide out of the flow
              fill = "var(--text-muted)";
            } else {
              r = 3.2 * (1 - k * 0.8); // duplicates and delivered leads fold into their target
            }
            if (k >= 1) d.on = false;
          }
        }
        el.setAttribute("cx", x.toFixed(1));
        el.setAttribute("cy", y.toFixed(1));
        el.setAttribute("r", r.toFixed(2));
        el.setAttribute("opacity", opacity.toFixed(2));
        el.style.fill = fill;
      });
      const decay = Math.exp(-dt * 5);
      glow.forEach((g, k) => {
        glow[k] = g * decay;
        badgeRefs.current[k]?.setAttribute("fill-opacity", (0.12 + glow[k] * 0.26).toFixed(3));
      });
      srcGlow.forEach((g, k) => {
        srcGlow[k] = g * decay;
        srcRefs.current[k]?.setAttribute("stroke-opacity", (0.35 + srcGlow[k] * 0.65).toFixed(3));
      });
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      step(dt);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(svg);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce]);

  return (
    <figure className={className}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-labelledby="lead-pipeline-title"
      >
        <title id="lead-pipeline-title">
          Lead pipeline: Meta lead ads, Google Ads, LinkedIn and website, CRM and event forms feed 1 Extract (connectors.py,
          raw_leads), 2 Clean (Python, clean_leads), 3 Dedupe (Python and SQL, golden_leads), 4 Score (SQL, lead_scores),
          then 5 Report (campaign_performance).
        </title>

        {/* Sources and the curves that merge them into one flow */}
        {SOURCES.map((s, i) => {
          const cx = srcX(i) + SRC_W / 2;
          return (
            <g key={s}>
              <path
                d={`M${cx} 34 C${cx} 58 ${TRUNK_X} 50 ${TRUNK_X} ${ENTRY_Y}`}
                fill="none"
                className="stroke-line-strong"
                strokeWidth={1}
              />
              <rect
                ref={(el) => {
                  srcRefs.current[i] = el;
                }}
                x={srcX(i) + 0.5}
                y={0.5}
                width={SRC_W - 1}
                height={33}
                rx={8}
                className="fill-surface-sunken stroke-accent"
                strokeOpacity={0.35}
              />
              <text x={cx} y={21} textAnchor="middle" fontSize={11} className="fill-secondary">
                {s}
              </text>
            </g>
          );
        })}

        {/* Trunk */}
        <line x1={TRUNK_X} y1={ENTRY_Y} x2={TRUNK_X} y2={REPORT_BADGE_Y} className="stroke-line-strong" strokeWidth={1} />

        {/* Stages with their output tables */}
        {STAGES.map((s, k) => {
          const top = stageTop(k);
          const mid = stageMid(k);
          return (
            <g key={s.title}>
              <rect x={0.5} y={top + 0.5} width={STAGE_W} height={STAGE_H - 1} rx={12} className="fill-surface-raised stroke-line-strong" />
              <circle
                ref={(el) => {
                  badgeRefs.current[k] = el;
                }}
                cx={TRUNK_X}
                cy={mid}
                r={11}
                className="fill-accent stroke-accent"
                fillOpacity={0.12}
                strokeOpacity={0.6}
              />
              <text x={42} y={mid - 3} fontSize={13} fontWeight={600} className="fill-primary">
                {s.title}
              </text>
              <text x={42} y={mid + 13} fontSize={11} className="fill-muted">
                {s.sub}
              </text>
              <line x1={STAGE_W + 1} y1={mid} x2={214} y2={mid} className="stroke-line-strong" strokeDasharray="2 3" />
              <rect x={214.5} y={mid - 19} width={W - 215} height={38} rx={8} className="fill-surface-sunken stroke-line" />
              <text x={224} y={mid - 3} fontSize={11} fontWeight={500} className="fill-secondary">
                {s.table}
              </text>
              <text
                ref={(el) => {
                  countRefs.current[k] = el;
                }}
                x={224}
                y={mid + 12}
                fontSize={10}
                className="fill-muted tabular-nums"
              >
                {reduce ? "table" : "0 rows"}
              </text>
            </g>
          );
        })}

        {/* Report */}
        <g>
          <rect x={0.5} y={REPORT_TOP + 0.5} width={W - 1} height={REPORT_H} rx={12} className="fill-accent-soft stroke-accent" strokeOpacity={0.5} />
          <circle
            ref={(el) => {
              badgeRefs.current[4] = el;
            }}
            cx={TRUNK_X}
            cy={REPORT_BADGE_Y}
            r={11}
            className="fill-accent stroke-accent"
            fillOpacity={0.12}
            strokeOpacity={0.6}
          />
          <text x={42} y={REPORT_BADGE_Y - 2} fontSize={13} fontWeight={600} className="fill-primary">
            Report
          </text>
          <text x={42} y={REPORT_BADGE_Y + 14} fontSize={11} className="fill-muted">
            campaign_performance
          </text>
          <text x={42} y={REPORT_TOP + 66} fontSize={10} className="fill-muted">
            Leads by score tier
          </text>
          {TIERS.map((t, i) => {
            const y = REPORT_TOP + 20 + i * 18;
            return (
              <g key={t.label}>
                <text x={BAR_X - 8} y={y + 6} textAnchor="end" fontSize={10} className="fill-secondary">
                  {t.label}
                </text>
                <rect x={BAR_X} y={y} width={BAR_W} height={7} rx={3.5} className="fill-surface-sunken" />
                <rect
                  ref={(el) => {
                    barRefs.current[i] = el;
                  }}
                  x={BAR_X}
                  y={y}
                  width={[0.3, 0.42, 0.28][i] * BAR_W}
                  height={7}
                  rx={3.5}
                  style={{ fill: t.fill }}
                />
              </g>
            );
          })}
        </g>

        {/* Moving leads (pool) */}
        {reduce
          ? null
          : Array.from({ length: POOL }, (_, i) => (
              <circle
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                r={3.2}
                cx={-10}
                cy={-10}
                opacity={0}
              />
            ))}

        {/* Stage numbers sit above the dots so they stay legible as leads pass through the badges */}
        {[...STAGES.map((_, k) => stageMid(k)), REPORT_BADGE_Y].map((y, k) => (
          <text key={k} x={TRUNK_X} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={600} className="pointer-events-none fill-accent">
            {k + 1}
          </text>
        ))}
      </svg>
      <figcaption className="mt-3 text-center text-xs text-muted">
        {reduce ? "Pipeline architecture" : "Live simulation · illustrative counts"}
      </figcaption>
    </figure>
  );
}
