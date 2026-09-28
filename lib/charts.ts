import "server-only";

/**
 * Build-time SVG charts for blog posts. A fenced ```chart block holds a JSON spec;
 * this renders it to static, theme-aware SVG (colours come from CSS tokens, so the
 * same markup is correct in light and dark) plus a data table for screen readers
 * and anyone who prefers numbers. No client JavaScript.
 *
 * Supported specs:
 *   { "type": "range", "title", "unit", "rows": [{ "label", "min", "max", "note"? }], "total"?: "Label" }
 *   { "type": "curve", "title", "curve": "<name in CURVES>", "x": {...}, "y": {...}, "marks": [x, ...] }
 */

type RangeSpec = {
  type: "range";
  title: string;
  caption?: string;
  unit: string;
  rows: { label: string; min: number; max: number; note?: string }[];
  total?: string;
};

type Axis = { label: string; min: number; max: number; ticks: number[]; format?: "deg" | "ratio" };

type CurveSpec = {
  type: "curve";
  title: string;
  caption?: string;
  curve: keyof typeof CURVES;
  x: Axis;
  y: Axis;
  marks?: number[];
};

export type ChartSpec = RangeSpec | CurveSpec;

/** Named functions a curve chart can plot (kept in code so Markdown never evaluates expressions). */
const CURVES = {
  /** Claw closure angle θ (degrees) for a normalised trunk radius x = r / L. */
  "closure-angle": (x: number) => (2 * Math.asin(Math.min(1, Math.max(0, x))) * 180) / Math.PI,
} as const;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(n < 1 ? 2 : 1).replace(/\.?0+$/, ""));
let uid = 0;

function frame(title: string, caption: string | undefined, svg: string, table: string, id: string) {
  return `<figure class="chart" aria-labelledby="${id}-t">
<figcaption id="${id}-t" class="chart-title">${esc(title)}</figcaption>
${svg}
${caption ? `<p class="chart-caption">${esc(caption)}</p>` : ""}
<details class="chart-table"><summary>View the data as a table</summary>${table}</details>
</figure>\n`;
}

function renderRange(spec: RangeSpec) {
  const id = `chart-${++uid}`;
  const rows = [...spec.rows];
  const totalMin = rows.reduce((s, r) => s + r.min, 0);
  const totalMax = rows.reduce((s, r) => s + r.max, 0);
  const all = spec.total ? [...rows, { label: spec.total, min: totalMin, max: totalMax, note: "Sum of the stage ranges" }] : rows;

  const W = 720;
  const labelW = 200;
  const valueW = 92;
  const plotX = labelW;
  const plotW = W - labelW - valueW;
  const rowH = 46;
  const top = 8;
  const axisH = 34;
  const H = top + all.length * rowH + axisH;

  const niceMax = Math.ceil(Math.max(...all.map((r) => r.max)));
  const step = niceMax > 10 ? 2 : 1;
  const ticks: number[] = [];
  for (let t = 0; t <= niceMax; t += step) ticks.push(t);
  const xMax = ticks[ticks.length - 1];
  const sx = (v: number) => plotX + (v / xMax) * plotW;

  const grid = ticks
    .map(
      (t) =>
        `<line class="chart-grid" x1="${sx(t)}" x2="${sx(t)}" y1="${top}" y2="${top + all.length * rowH}"/>` +
        `<text class="chart-tick" x="${sx(t)}" y="${top + all.length * rowH + 20}" text-anchor="middle">${t}</text>`,
    )
    .join("");

  const bars = all
    .map((r, i) => {
      const y = top + i * rowH;
      const isTotal = spec.total && i === all.length - 1;
      const x1 = sx(r.min);
      const w = Math.max(6, sx(r.max) - x1);
      const range = `${fmt(r.min)}–${fmt(r.max)} ${spec.unit}`;
      return `<g class="chart-row${isTotal ? " chart-row-total" : ""}">
<title>${esc(r.label)}: ${range}${r.note ? ` (${esc(r.note)})` : ""}</title>
<rect class="chart-hit" x="0" y="${y}" width="${W}" height="${rowH}"/>
${isTotal ? `<line class="chart-rule" x1="0" x2="${W}" y1="${y + 1}" y2="${y + 1}"/>` : ""}
<text class="chart-label" x="0" y="${y + rowH / 2 + 5}">${esc(r.label)}</text>
<rect class="chart-bar" x="${x1}" y="${y + rowH / 2 - 7}" width="${w}" height="14" rx="4"/>
<text class="chart-value" x="${W}" y="${y + rowH / 2 + 5}" text-anchor="end">${range}</text>
</g>`;
    })
    .join("");

  const svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-t" preserveAspectRatio="xMinYMin meet">
${grid}${bars}
<text class="chart-tick" x="${plotX + plotW}" y="${H - 1}" text-anchor="end">${esc(spec.unit === "s" ? "seconds" : spec.unit)}</text>
</svg>`;

  const table = `<table><thead><tr><th scope="col">Stage</th><th scope="col">Min (${esc(spec.unit)})</th><th scope="col">Max (${esc(
    spec.unit,
  )})</th></tr></thead><tbody>${all
    .map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${fmt(r.min)}</td><td>${fmt(r.max)}</td></tr>`)
    .join("")}</tbody></table>`;

  return frame(spec.title, spec.caption, svg, table, id);
}

function renderCurve(spec: CurveSpec) {
  const id = `chart-${++uid}`;
  const f = CURVES[spec.curve];
  if (!f) throw new Error(`Unknown chart curve "${spec.curve}"`);

  const W = 720;
  const H = 380;
  const m = { l: 64, r: 24, t: 16, b: 56 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const sx = (v: number) => m.l + ((v - spec.x.min) / (spec.x.max - spec.x.min)) * pw;
  const sy = (v: number) => m.t + ph - ((v - spec.y.min) / (spec.y.max - spec.y.min)) * ph;
  const tickLabel = (v: number, a: Axis) => (a.format === "deg" ? `${fmt(v)}°` : fmt(v));

  const pts: string[] = [];
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const x = spec.x.min + ((spec.x.max - spec.x.min) * i) / N;
    pts.push(`${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`);
  }

  const grid =
    spec.y.ticks
      .map(
        (t) =>
          `<line class="chart-grid" x1="${m.l}" x2="${W - m.r}" y1="${sy(t)}" y2="${sy(t)}"/>` +
          `<text class="chart-tick" x="${m.l - 10}" y="${sy(t) + 4}" text-anchor="end">${tickLabel(t, spec.y)}</text>`,
      )
      .join("") +
    spec.x.ticks
      .map((t) => `<text class="chart-tick" x="${sx(t)}" y="${H - m.b + 22}" text-anchor="middle">${tickLabel(t, spec.x)}</text>`)
      .join("");

  const marks = (spec.marks ?? [])
    .map((x) => {
      const y = f(x);
      return `<g class="chart-point"><title>${esc(spec.x.label)} = ${fmt(x)} → ${esc(spec.y.label)} ≈ ${fmt(Math.round(y * 10) / 10)}°</title>
<circle class="chart-hit" cx="${sx(x)}" cy="${sy(y)}" r="16"/>
<line class="chart-guide" x1="${sx(x)}" x2="${sx(x)}" y1="${sy(y)}" y2="${m.t + ph}"/>
<circle class="chart-dot" cx="${sx(x)}" cy="${sy(y)}" r="5"/>
<text class="chart-value" x="${sx(x) - 10}" y="${sy(y) - 10}" text-anchor="end">${fmt(Math.round(y))}°</text></g>`;
    })
    .join("");

  const svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-t" preserveAspectRatio="xMinYMin meet">
${grid}
<line class="chart-axis" x1="${m.l}" x2="${W - m.r}" y1="${m.t + ph}" y2="${m.t + ph}"/>
<polyline class="chart-line" points="${pts.join(" ")}"/>
${marks}
<text class="chart-tick" x="${m.l + pw / 2}" y="${H - 8}" text-anchor="middle">${esc(spec.x.label)}</text>
<text class="chart-tick" x="16" y="${m.t + ph / 2}" text-anchor="middle" transform="rotate(-90 16 ${m.t + ph / 2})">${esc(spec.y.label)}</text>
</svg>`;

  const rows = [...new Set([...spec.x.ticks, ...(spec.marks ?? [])])].sort((a, b) => a - b);
  const table = `<table><thead><tr><th scope="col">${esc(spec.x.label)}</th><th scope="col">${esc(spec.y.label)}</th></tr></thead><tbody>${rows
    .map((x) => `<tr><td>${fmt(x)}</td><td>${fmt(Math.round(f(x) * 10) / 10)}°</td></tr>`)
    .join("")}</tbody></table>`;

  return frame(spec.title, spec.caption, svg, table, id);
}

export function renderChart(json: string): string {
  let spec: ChartSpec;
  try {
    spec = JSON.parse(json);
  } catch (e) {
    throw new Error(`Invalid chart JSON: ${(e as Error).message}`);
  }
  if (spec.type === "range") return renderRange(spec);
  if (spec.type === "curve") return renderCurve(spec);
  throw new Error(`Unknown chart type "${(spec as { type: string }).type}"`);
}
