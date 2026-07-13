// Pure, React-free logic for the over-time trend explorer (Phase 2 — flagship #1).
//
// The flagship insight is NovaCloud ARR across 5 quarters rendered as ONE line — even
// though the export rows come out in filename order (NOT chronological) and the source
// PDFs renamed the metric along the way. Everything the panel can get *wrong* lives here
// so it can be unit-tested without a DOM:
//   1. chronological ordering — reuse the year-aware parsePeriodKey from grid.ts (a plain
//      string sort is wrong: it ranks "Q1 2025" before "Q2 2024" because the quarter char
//      dominates the year);
//   2. one series per canonical_metric — never re-split by raw_label (the backend already
//      collapsed the label drift; splitting on the source's wording would shatter the
//      flagship line into stubs);
//   3. the "insufficient history" guard — refuse to draw a trend from < 3 distinct
//      quarters instead of fabricating one (success criterion #6).
//
// Binds only the frozen 00-foundations.md §A.4 fields; never the 3 RESERVED ones
// (currency, comparison_status === "unchecked", code === "unrecognized_label").

import type { CanonicalMetric, MetricRow } from "../types";
import { CANONICAL_METRIC_ORDER, nonUsdCurrency, parsePeriodKey } from "./grid";
import { HEAT_DIRECTION } from "./heat";

// A (company, metric) needs at least this many DISTINCT periods before we draw a trend.
// Below it the panel shows "insufficient history" rather than a 1-2 point pseudo-line.
// 3 is the minimum that shows a direction with a midpoint (start, middle, end).
export const MIN_TREND_POINTS = 3;

// One plotted point: the period, its numeric value, the backend's own display string
// (used verbatim for the label — provenance-faithful), and the year-aware sort key so
// callers never have to re-parse the period.
export interface TrendPoint {
  period: string;
  value: number;
  displayValue: string;
  periodKey: number;
  rawLabel: string; // the source's own wording for THIS point — drives the honest
  // "one line across N source labels" note, counted from the plotted set so it can never
  // disagree with what's drawn.
  row: MetricRow; // the backing source row (Phase 4) — lets a click on this point open the
  // provenance drawer without re-looking-it-up. Populated by buildSeries; the dedupe keeps
  // the first (winning) row for a period, matching the value that's plotted.
}

// Build the chronological series for one (company, canonical_metric). Steps, in order:
//   1. keep only rows matching this company + metric (NEVER filter/split by raw_label);
//   2. drop rows with a null value or null/unparseable period (a null value is NOT a
//      zero — §A.4 — and an undated row cannot be placed on the time axis);
//   3. sort by the year-aware period key (grid.ts parsePeriodKey), NOT a string sort;
//   4. dedupe to DISTINCT periods (first row after sort wins) so both the history count
//      and the plotted points mean "distinct quarters". Two rows for the same period is
//      a conflict — Phase 3's reconciliation story, not a second point on this line.
export function buildSeries(
  metrics: MetricRow[],
  company: string,
  metric: CanonicalMetric,
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const row of metrics) {
    if (row.company_name !== company) continue;
    if (row.canonical_metric !== metric) continue;
    if (row.value === null || row.period === null) continue;
    const periodKey = parsePeriodKey(row.period);
    if (periodKey < 0) continue; // unparseable period — cannot place on the axis
    points.push({
      period: row.period,
      value: row.value,
      displayValue: row.display_value,
      periodKey,
      rawLabel: row.raw_label,
      row,
    });
  }
  points.sort((a, b) => a.periodKey - b.periodKey);

  const seen = new Set<number>();
  const distinct: TrendPoint[] = [];
  for (const point of points) {
    if (seen.has(point.periodKey)) continue; // keep the first row for each distinct period
    seen.add(point.periodKey);
    distinct.push(point);
  }
  return distinct;
}

// A series has enough history to draw a trend when it has >= MIN_TREND_POINTS distinct
// periods. `points` from buildSeries is already deduped, so length == distinct periods.
export function hasSufficientHistory(points: TrendPoint[]): boolean {
  return points.length >= MIN_TREND_POINTS;
}

// The distinct companies present in the export, alphabetically (stable selector order —
// mirrors the grid's `.sort()` so the two panels list companies the same way).
export function distinctCompanies(metrics: MetricRow[]): string[] {
  const companies = new Set<string>();
  for (const row of metrics) companies.add(row.company_name);
  return [...companies].sort();
}

// The canonical metrics a given company actually reports, in the fixed schema order
// (CANONICAL_METRIC_ORDER). Drives the metric dropdown so it never offers an empty
// series (a company only appears here if it has at least one reported metric).
export function metricsForCompany(
  metrics: MetricRow[],
  company: string,
): CanonicalMetric[] {
  const present = new Set<CanonicalMetric>();
  for (const row of metrics) {
    if (row.company_name === company) present.add(row.canonical_metric);
  }
  return CANONICAL_METRIC_ORDER.filter((m) => present.has(m));
}

// Every canonical metric present ANYWHERE in the export, in schema order — the metric list
// for the all-companies overlay (V3), which is not tied to a single company.
export function metricsPresent(metrics: MetricRow[]): CanonicalMetric[] {
  const present = new Set<CanonicalMetric>();
  for (const row of metrics) present.add(row.canonical_metric);
  return CANONICAL_METRIC_ORDER.filter((m) => present.has(m));
}

// ── All-companies overlay (Phase 5 — V3) ─────────────────────────────────────────────────
// EVERY comparable company that reports the metric is plotted, so "All companies" genuinely
// shows all of them. Because this corpus is mostly single-quarter (only NovaCloud has 5
// quarters; MediSight/PeopleFlow have 3; the rest report one quarter), companies split into:
//   * "line" — >= MIN_TREND_POINTS distinct quarters → a real trend polyline;
//   * "point" — 1-2 quarters → a single-quarter snapshot shown as a bare dot (NOT a
//     fabricated line — the anti-guessing guard still holds, we just never HIDE the company).
// Comparability is still enforced by EXCLUDING (and naming) the genuinely-incomparable:
//   * a REFUSED row (credit gross margin = interest margin) — a different basis;
//   * a non-USD MONEY metric (PeopleFlow GBP) — can't share a $ axis without FX (roadmap).
// A company that simply does not report the metric is absent, not "excluded" (mirrors N/A).
export interface CompanySeries {
  company: string;
  points: TrendPoint[];
  color: string;
  // "line" = >= MIN_TREND_POINTS distinct quarters → a real trend drawn as a polyline;
  // "point" = 1-2 quarters → a single-quarter SNAPSHOT drawn as bare dot(s), never a
  // fabricated line. Both are plotted so "All companies" genuinely shows every comparable co.
  kind: "line" | "point";
}
export interface ExcludedSeries {
  company: string;
  reason: string;
}
export interface AllCompaniesSeries {
  series: CompanySeries[]; // every comparable company: lines (>=3 quarters) + snapshot points (1-2)
  excluded: ExcludedSeries[]; // only the genuinely incomparable (refused basis / non-USD), each named
}

// A fixed, offline colour ramp (no external palette dependency — keeps the bundle self
// contained). Assigned by the sorted order of the included companies, so colours are stable
// across renders. This is the D3/Tableau "category-10" set, ORDERED STRONGEST-FIRST (blue, red,
// green, orange, purple …): companies are coloured by index, so the first ~9 hues are what
// actually get used, and these are the ones that stay legible against white. Earlier the ramp
// mixed several desaturated mid-value hues (slate, two near-identical teals) that blurred into
// one another on the busy all-companies overlay — this set keeps each line distinguishable, and
// the chart's hover-to-identify (a native SVG <title> per line) does the rest.
export const SERIES_PALETTE: string[] = [
  "#1f77b4", // blue
  "#d62728", // red
  "#2ca02c", // green
  "#ff7f0e", // orange
  "#9467bd", // purple
  "#17a2b8", // teal
  "#e377c2", // pink
  "#8c564b", // brown
  "#bcbd22", // olive
  "#7f7f7f", // gray
];

export function buildAllCompaniesSeries(
  metrics: MetricRow[],
  metric: CanonicalMetric,
): AllCompaniesSeries {
  const series: CompanySeries[] = [];
  const excluded: ExcludedSeries[] = [];
  for (const company of distinctCompanies(metrics)) {
    const rowsForMetric = metrics.filter(
      (r) => r.company_name === company && r.canonical_metric === metric,
    );
    if (rowsForMetric.length === 0) continue; // not reported here — absent, not "excluded"

    if (rowsForMetric.some((r) => r.comparison_status === "refused")) {
      excluded.push({ company, reason: "different basis" });
      continue;
    }
    const currency = nonUsdCurrency(company, metric);
    if (currency) {
      excluded.push({ company, reason: `reported in ${currency}` });
      continue;
    }
    const points = buildSeries(metrics, company, metric);
    if (points.length === 0) {
      // Reports the metric but no dated/valued row we can place on the axis — rare.
      excluded.push({ company, reason: "no dated value" });
      continue;
    }
    // Plotted either way: a trend line if it has enough history, else a snapshot dot.
    series.push({
      company,
      points,
      color: "",
      kind: points.length >= MIN_TREND_POINTS ? "line" : "point",
    });
  }
  series.forEach((s, i) => {
    s.color = SERIES_PALETTE[i % SERIES_PALETTE.length];
  });
  return { series, excluded };
}

// ── Chart y-axis standardization (Phase 5) ────────────────────────────────────────────────
// Make charts read consistently across metrics. MONEY & COUNTS are anchored at 0 (honest
// magnitude — a line rising from 0, not a zoomed-in slice); PERCENTAGES get a fitted axis
// rounded to the nearest 5 (a 0-based axis would squash NRR's 112–123% into a flat line).
const PERCENT_METRICS: Set<CanonicalMetric> = new Set([
  "gross_margin_pct",
  "net_revenue_retention_pct",
  "logo_churn_pct",
]);

export function yDomain(values: number[], metric: CanonicalMetric): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 1 };
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  if (!PERCENT_METRICS.has(metric)) {
    // money & counts: include 0 so magnitudes are honest.
    const min = Math.min(0, dataMin);
    const max = Math.max(0, dataMax);
    return { min, max: max === min ? min + 1 : max };
  }
  // percentages: a fitted axis rounded outward to the nearest 5.
  const min = Math.floor(dataMin / 5) * 5;
  const max = Math.ceil(dataMax / 5) * 5;
  return { min, max: max === min ? min + 5 : max };
}

// Format a y-axis endpoint for its metric (the endpoints are domain numbers, not data points).
export function formatAxisTick(value: number, metric: CanonicalMetric): string {
  if (PERCENT_METRICS.has(metric)) return `${Math.round(value)}%`;
  if (metric === "headcount") return `${Math.round(value)}`;
  return value === 0 ? "$0" : `$${(value / 1_000_000).toFixed(1)}M`;
}

// Convenience counts for the panel's honest caption ("N companies · M trends · K snapshots").
export function seriesBreakdown(series: CompanySeries[]): {
  total: number;
  lines: number;
  points: number;
} {
  const lines = series.filter((s) => s.kind === "line").length;
  return { total: series.length, lines, points: series.length - lines };
}

// ── Per-cell delta (the grid's Trend view) ────────────────────────────────────────────────
// The change from the PREVIOUS reported quarter to the latest, formatted honestly per metric:
//   * percentage metrics (gross margin, NRR, logo churn) → percentage-POINT change ("+5.0 pts"),
//     because a "% change of a %" (NRR 118→123 = "+4.2%") reads wrong — an analyst means points;
//   * money & counts → percent change ("+8%"); "n/a" when the prior value is 0 (no base).
// `improving` is the good/bad direction (drives green/red) from the single HEAT_DIRECTION source,
// so churn ▲ is a worsening (not improving) and burn getting less-negative ▲ is an improvement.
// It is null — no colour judgement — for headcount (no inherent good direction) and for a
// refused / different-basis cell (opts.neutral), where "better" is undefined.
export interface DeltaView {
  text: string; // "+8%" | "+5.0 pts" | "n/a"
  arrow: "▲" | "▼" | "—";
  improving: boolean | null;
}
export function formatDelta(
  metric: CanonicalMetric,
  latest: number,
  prior: number,
  opts?: { neutral?: boolean },
): DeltaView {
  const change = latest - prior;
  const arrow: "▲" | "▼" | "—" = change > 0 ? "▲" : change < 0 ? "▼" : "—";
  const sign = change > 0 ? "+" : change < 0 ? "-" : "±";
  let text: string;
  if (PERCENT_METRICS.has(metric)) {
    text = `${sign}${Math.abs(change).toFixed(1)} pts`; // a percentage's own delta is POINTS
  } else if (prior === 0) {
    text = "n/a"; // no meaningful % change from a zero base
  } else {
    text = `${sign}${Math.abs((change / Math.abs(prior)) * 100).toFixed(0)}%`;
  }
  let improving: boolean | null = null;
  const direction = HEAT_DIRECTION[metric];
  if (!opts?.neutral && direction && change !== 0) {
    improving = direction === "higher_better" ? change > 0 : change < 0;
  }
  return { text, arrow, improving };
}

