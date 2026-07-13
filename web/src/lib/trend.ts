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
// across renders. ~10 distinct, reasonably colour-blind-distinguishable hues.
export const SERIES_PALETTE: string[] = [
  "#2b6cb0", // blue
  "#c05621", // orange
  "#2f855a", // green
  "#b83280", // magenta
  "#6b46c1", // purple
  "#b7791f", // gold
  "#319795", // teal
  "#9b2c2c", // dark red
  "#4a5568", // slate
  "#00707a", // deep teal
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

// Convenience counts for the panel's honest caption ("N companies · M trends · K snapshots").
export function seriesBreakdown(series: CompanySeries[]): {
  total: number;
  lines: number;
  points: number;
} {
  const lines = series.filter((s) => s.kind === "line").length;
  return { total: series.length, lines, points: series.length - lines };
}
