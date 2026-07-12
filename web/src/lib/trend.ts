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
import { CANONICAL_METRIC_ORDER, parsePeriodKey } from "./grid";

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
