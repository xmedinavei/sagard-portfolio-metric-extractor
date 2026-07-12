// Pure, React-free logic for the sector-grouped RAG grid (Phase 1).
//
// Everything the grid can get *wrong* lives here so it can be unit-tested without a
// DOM: (1) year-aware "latest period" selection, and (2) the honesty classifier that
// distinguishes a structurally not-applicable cell (N/A) from a genuine per-company
// gap (—). Binds only the frozen 00-foundations.md §A.4 fields; never the 3 RESERVED
// ones (currency, comparison_status === "unchecked", code === "unrecognized_label").

import type { CanonicalMetric, IssueRow, MetricRow, SectorKind } from "../types";

// The backend's sector-aware "expected but absent" signal (an issue `code`). A metric
// flagged missing for a company is EXPECTED there — so an empty cell for it is a real
// gap, not a structural N/A. Phase 3 formalizes this literal as MISSING_METRIC_CODE;
// the grid's honesty rule already needs it here (§1.3b: zero false "missing"/"N/A").
const MISSING_METRIC_CODE = "missing_metric";

// Sector display order (naming registry — use verbatim). Any sector not listed here
// still renders, appended after these, so an unexpected sector is never dropped.
export const SECTOR_ORDER: SectorKind[] = ["saas", "credit", "marketplace", "payments"];

// The grid's fixed column set = every canonical metric, in the schema-declared order
// (schema.py:8-17). Every sector table shows all 8 columns so the honesty affordance
// is visible: metrics a sector never reports render as N/A rather than being hidden.
export const CANONICAL_METRIC_ORDER: CanonicalMetric[] = [
  "revenue_qtr",
  "arr_eop",
  "gross_margin_pct",
  "cash_balance",
  "monthly_burn",
  "headcount",
  "net_revenue_retention_pct",
  "logo_churn_pct",
];

// Short human labels for the metric columns (display only — not a data contract).
export const METRIC_LABELS: Record<CanonicalMetric, string> = {
  revenue_qtr: "Revenue (Q)",
  arr_eop: "ARR (EoP)",
  gross_margin_pct: "Gross margin",
  cash_balance: "Cash balance",
  monthly_burn: "Monthly burn",
  headcount: "Headcount",
  net_revenue_retention_pct: "NRR",
  logo_churn_pct: "Logo churn",
};

// Human labels for the four sectors (display only).
export const SECTOR_LABELS: Record<SectorKind, string> = {
  saas: "SaaS",
  credit: "Credit",
  marketplace: "Marketplace",
  payments: "Payments",
};

// The backend emits periods as "Q<n> YYYY" (quarter FIRST, e.g. "Q2 2025"). A plain
// string sort is WRONG — it would rank "Q4 2024" above "Q2 2025" because the quarter
// char dominates the year. We fold it into a single monotonic integer year*10+quarter
// so max() over the key picks the real latest period. Unparseable/null periods sort
// to the bottom (-1) so a dated row always beats an undated one.
export function parsePeriodKey(period: string | null): number {
  if (!period) return -1;
  const match = /^Q([1-4])\s+(\d{4})$/.exec(period.trim());
  if (!match) return -1;
  const quarter = Number(match[1]);
  const year = Number(match[2]);
  return year * 10 + quarter;
}

// Collision-free composite key for a (company, metric) cell. JSON.stringify of the
// pair is unambiguous (distinct pairs never map to the same string) and, unlike a
// hand-picked separator char, cannot be forged by punctuation inside a company name.
export function cellKey(company: string, metric: CanonicalMetric): string {
  return JSON.stringify([company, metric]);
}

// For each (company, canonical_metric) keep only the latest-period row (year-aware).
export function latestByCompanyMetric(metrics: MetricRow[]): Map<string, MetricRow> {
  const latest = new Map<string, MetricRow>();
  for (const row of metrics) {
    const key = cellKey(row.company_name, row.canonical_metric);
    const current = latest.get(key);
    if (!current || parsePeriodKey(row.period) > parsePeriodKey(current.period)) {
      latest.set(key, row);
    }
  }
  return latest;
}

// Per sector, the set of canonical metrics that are APPLICABLE there. A metric is
// applicable if some company in the sector reports it OR the backend flags it as a
// `missing_metric` for some company in the sector. The second half is essential: in a
// small sector (e.g. one payments company) a core metric like monthly_burn may be
// reported by nobody yet still be EXPECTED — the backend says so via missing_metric.
// Without it the grid would print a false "N/A — not applicable" on the very cells the
// exceptions panel lists as missing (a self-contradiction). A metric absent from a
// sector's set is genuinely structural N/A; a company lacking an applicable metric is a
// real gap.
export function sectorApplicableMetrics(
  metrics: MetricRow[],
  issues: IssueRow[] = [],
): Map<SectorKind, Set<CanonicalMetric>> {
  const applicable = new Map<SectorKind, Set<CanonicalMetric>>();
  const companySector = new Map<string, SectorKind>();

  const add = (sector: SectorKind, metric: CanonicalMetric) => {
    let set = applicable.get(sector);
    if (!set) {
      set = new Set<CanonicalMetric>();
      applicable.set(sector, set);
    }
    set.add(metric);
  };

  for (const row of metrics) {
    companySector.set(row.company_name, row.sector);
    add(row.sector, row.canonical_metric);
  }
  for (const issue of issues) {
    if (issue.code !== MISSING_METRIC_CODE) continue;
    if (!issue.company_name || !issue.canonical_metric) continue;
    const sector = companySector.get(issue.company_name);
    if (sector) add(sector, issue.canonical_metric);
  }
  return applicable;
}

export interface SectorGroup {
  sector: SectorKind;
  companies: string[]; // sorted for stable display
}

// Group companies under their sector, ordered by SECTOR_ORDER. A sector with no rows
// is omitted; a sector outside SECTOR_ORDER is appended (never silently dropped).
export function groupCompaniesBySector(metrics: MetricRow[]): SectorGroup[] {
  const bySector = new Map<SectorKind, Set<string>>();
  for (const row of metrics) {
    let set = bySector.get(row.sector);
    if (!set) {
      set = new Set<string>();
      bySector.set(row.sector, set);
    }
    set.add(row.company_name);
  }
  const groups: SectorGroup[] = [];
  const emitted = new Set<SectorKind>();
  for (const sector of SECTOR_ORDER) {
    const companies = bySector.get(sector);
    if (companies && companies.size) {
      groups.push({ sector, companies: [...companies].sort() });
      emitted.add(sector);
    }
  }
  for (const [sector, companies] of bySector) {
    if (!emitted.has(sector) && companies.size) {
      groups.push({ sector, companies: [...companies].sort() });
    }
  }
  return groups;
}

// A grid cell has exactly one of three honest states:
//   "value" — a real latest-period number for this company×metric
//   "na"    — the metric is not applicable to this company's sector (structural)
//   "gap"   — the metric applies to the sector but this company has no row (real gap)
export type CellKind = "value" | "na" | "gap";

export interface Cell {
  kind: CellKind;
  row: MetricRow | null; // populated only when kind === "value"
  // A real number that must NOT be ranked against sector peers because it was measured
  // on a different basis (credit gross margin = interest margin). §A.4 comparison_status
  // === "refused"; Phase 3 formalizes this as REFUSED_STATUS, but the grid must already
  // refuse to rank it.
  notRanked: boolean;
}

export function classifyCell(
  company: string,
  metric: CanonicalMetric,
  sector: SectorKind,
  latest: Map<string, MetricRow>,
  applicable: Map<SectorKind, Set<CanonicalMetric>>,
): Cell {
  const sectorSet = applicable.get(sector);
  const isApplicable = !!sectorSet && sectorSet.has(metric);
  if (!isApplicable) {
    return { kind: "na", row: null, notRanked: false };
  }
  const row = latest.get(cellKey(company, metric)) ?? null;
  if (!row) {
    return { kind: "gap", row: null, notRanked: false };
  }
  return { kind: "value", row, notRanked: row.comparison_status === "refused" };
}

// Text shown in a cell. "value" uses the backend's own display_value verbatim (the
// provenance-faithful rendering); "na" and "gap" get honest, distinct markers.
export function cellText(cell: Cell): string {
  if (cell.kind === "na") return "N/A";
  if (cell.kind === "gap") return "—";
  return cell.row ? cell.row.display_value : "—";
}
