// RAG heat-map colouring for the sector grid (Phase 5 — V1). PURE, React-free so it stays
// unit-testable without a DOM. Doc 0 §8 (D4) calls Panel 1 a "heatmap / RAG grid": a cell's
// background tints green → amber → red by how a company ranks against its peers, so the NRR
// "league" and the ConstructIQ laggard read at a glance instead of eyeballing a column.
//
// TWO honesty rules, straight from the thesis ("only compare like with like"):
//   1. Heat is computed WITHIN a sector, per metric — never across sectors. A SaaS ARR and a
//      payments revenue are different businesses; tinting one greener than the other would
//      manufacture the exact false comparison the tool exists to refuse.
//   2. Only genuinely comparable value cells are heated. A refused cell (credit gross margin
//      = interest margin), a non-USD cell (PeopleFlow GBP), an N/A or a gap is NEVER heated —
//      it has no comparable peer scale to sit on.
// Headcount is deliberately not heated: it is size, not performance (a bigger team is not
// "better"), so it stays neutral. Colour is always paired with the number itself (never
// colour-only), and the tints are pale, so the cell text stays fully readable.

import type { CanonicalMetric, MetricRow, SectorKind } from "../types";
import { cellKey, nonUsdCurrency, parsePeriodKey } from "./grid";

// Which direction is "good" for each heatable metric. A metric ABSENT from this map is never
// heated (headcount = neutral size metric).
export type HeatDirection = "higher_better" | "lower_better";
export const HEAT_DIRECTION: Partial<Record<CanonicalMetric, HeatDirection>> = {
  revenue_qtr: "higher_better",
  arr_eop: "higher_better",
  gross_margin_pct: "higher_better",
  cash_balance: "higher_better",
  monthly_burn: "higher_better", // burn is negative; less-negative (closer to 0) is better = higher
  net_revenue_retention_pct: "higher_better",
  logo_churn_pct: "lower_better", // less churn is better
};

// The metric whose sector laggard we call out explicitly (Doc i §7: ConstructIQ is the NRR
// laggard). Kept as a named constant so the grid and any test agree on the same column.
export const LAGGARD_METRIC: CanonicalMetric = "net_revenue_retention_pct";

// Map a value to [0,1] where 1 = best in its peer set, honouring direction. A degenerate peer
// set (all values equal) returns 0.5 — neutral amber — so we never paint a false green/red
// when there is nothing to rank against.
export function heatFraction(
  value: number,
  min: number,
  max: number,
  direction: HeatDirection,
): number {
  if (max === min) return 0.5;
  const t = (value - min) / (max - min); // 0 at the min, 1 at the max
  return direction === "higher_better" ? t : 1 - t;
}

// A pale background tint on a red → amber → green scale (fraction 0 = red, 0.5 = amber,
// 1 = green). Deliberately light so dark cell text stays readable on top.
export function heatColor(fraction: number): string {
  const f = Math.max(0, Math.min(1, fraction));
  const red = [250, 219, 214];
  const amber = [254, 246, 214];
  const green = [209, 240, 216];
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
  const [c1, c2, t] = f < 0.5 ? [red, amber, f / 0.5] : [amber, green, (f - 0.5) / 0.5];
  const [r, g, b] = [0, 1, 2].map((i) => lerp(c1[i], c2[i], t));
  return `rgb(${r}, ${g}, ${b})`;
}

export interface HeatCell {
  color: string; // the CSS background tint
  fraction: number; // 0 = worst peer, 1 = best peer (post-direction)
}

// One comparable value in a sector×metric peer set. A cell qualifies only if it is a real
// number that is NOT refused and NOT reported in a non-USD currency (both would make it
// incomparable to its peers).
function comparableEntries(
  metric: CanonicalMetric,
  companies: string[],
  latest: Map<string, MetricRow>,
): { key: string; value: number; periodKey: number }[] {
  const entries: { key: string; value: number; periodKey: number }[] = [];
  for (const company of companies) {
    const row = latest.get(cellKey(company, metric));
    if (!row || row.value === null) continue;
    if (row.comparison_status === "refused") continue; // different basis
    if (nonUsdCurrency(company, metric) !== null) continue; // non-USD money value
    entries.push({ key: cellKey(company, metric), value: row.value, periodKey: parsePeriodKey(row.period) });
  }
  // Rank only cells from the SAME (newest) period. Different companies' "latest" quarters can
  // differ (e.g. a company with no current-quarter figure), and heat-ranking a stale quarter
  // against a current one is the exact cross-period comparison the tool must not make silently.
  if (entries.length === 0) return entries;
  const newest = Math.max(...entries.map((e) => e.periodKey));
  return entries.filter((e) => e.periodKey === newest);
}

// Build a map from cellKey → heat tint for every comparable value cell in ONE sector. A
// metric with fewer than two comparable peers is skipped entirely (there is nothing to rank),
// so a lone company is never falsely coloured.
export function sectorHeat(
  _sector: SectorKind,
  companies: string[],
  latest: Map<string, MetricRow>,
): Map<string, HeatCell> {
  const out = new Map<string, HeatCell>();
  for (const metric of Object.keys(HEAT_DIRECTION) as CanonicalMetric[]) {
    const direction = HEAT_DIRECTION[metric]!;
    const entries = comparableEntries(metric, companies, latest);
    if (entries.length < 2) continue; // need >= 2 peers to rank
    const values = entries.map((e) => e.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    for (const e of entries) {
      const fraction = heatFraction(e.value, min, max, direction);
      out.set(e.key, { color: heatColor(fraction), fraction });
    }
  }
  return out;
}

// The cellKey of the single worst comparable performer for `metric` in this sector — the
// "laggard" the grid marks explicitly (default: the NRR league's laggard). null when there
// are fewer than two comparable peers (nothing to rank). Ties break on sorted company order
// (companies is already sorted), so the result is deterministic.
export function laggardKey(
  companies: string[],
  latest: Map<string, MetricRow>,
  metric: CanonicalMetric = LAGGARD_METRIC,
): string | null {
  const direction = HEAT_DIRECTION[metric];
  if (!direction) return null;
  const entries = comparableEntries(metric, companies, latest);
  if (entries.length < 2) return null;
  const min = Math.min(...entries.map((e) => e.value));
  const max = Math.max(...entries.map((e) => e.value));
  // A pure tie (every peer equal) has no genuine laggard — never tag one (it would also land
  // on an amber 0.5 tint, so the ▼ and the colour would disagree). Same "nothing to rank"
  // stance as the < 2 peers guard above.
  if (max === min) return null;
  let worst = entries[0];
  let worstFraction = Infinity;
  for (const e of entries) {
    const fraction = heatFraction(e.value, min, max, direction);
    if (fraction < worstFraction) {
      worstFraction = fraction;
      worst = e;
    }
  }
  return worst.key;
}
