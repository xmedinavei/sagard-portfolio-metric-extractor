// Pure, React-free logic for the Phase 3 "trust the numbers" panels (refuse-to-compare,
// reconciliation, sector-aware exceptions, label-drift breadth). Everything the panels can
// get wrong — which issue `code` to bind, how to dedupe a cross-source conflict, how to
// group missing metrics — lives here so it is unit-testable without a DOM. Binds only the
// frozen 00-foundations.md §A.4 fields; never the 3 RESERVED ones (currency,
// comparison_status === "unchecked", code === "unrecognized_label").

import type { CanonicalMetric, IssueRow, MetricRow, SectorKind } from "../types";
import { CANONICAL_METRIC_ORDER, cellKey } from "./grid";

// ── Naming-registry constants (README §"API routes, query keys, constants"). Defined
// fresh here (additive-safe) rather than re-pointing grid.ts's private "missing_metric"
// literal, so App.tsx stays the only shared-file edit. ────────────────────────────────
export const REFUSED_STATUS = "refused"; // a comparison_status value
export const INTEREST_MARGIN_BASIS = "interest_margin"; // a metric_basis value
export const RECONCILE_CODE = "cross_source_discrepancy"; // issue code (the DISAGREE signal)
export const BASIS_COLLISION_CODE = "basis_collision"; // issue code
export const MISSING_METRIC_CODE = "missing_metric"; // issue code
// Additive (Build note, beyond the registry's RECONCILE_CODE): the positive counterpart of
// a cross-source discrepancy — the same metric appears in BOTH documents and they AGREE.
// Reading it lets the reconciliation panel be an honest "we checked N, all agree" signal
// instead of only showing disagreements. It is an emitted (info) code, never RESERVED.
export const CROSS_SOURCE_MATCH_CODE = "cross_document_duplicate";
// Additive: intra-DOCUMENT candidate collisions the engine resolved (two candidate values for
// the same metric inside ONE report → it kept the primary reading). Surfacing the count turns
// a bare "0 disagreements" into visible evidence of the reconciliation work actually done.
export const CANDIDATE_CONFLICT_CODE = "conflicting_candidates";

// A stable, collision-free key for a cross-document conflict/agreement. Distinct
// (company, metric, period) triples never collide (JSON.stringify of the tuple), so this
// is the correct dedupe key — unlike the spec's original magnitude-pair "mirror" key,
// which was built on a data misread (see 03-comparison-safety-fixes.md, D1).
function conflictKey(issue: IssueRow): string {
  return JSON.stringify([issue.company_name, issue.canonical_metric, issue.period]);
}

// ── 3.1 Refuse-to-compare ────────────────────────────────────────────────────────────

// Every metric the backend refused to rank because it was measured on a different basis
// (credit gross margin = interest margin). These carry comparison_status === "refused"
// and metric_basis === "interest_margin". Live: the 5 LendBridge gross-margin rows, and
// ONLY those.
export function refusedRows(metrics: MetricRow[]): MetricRow[] {
  return metrics.filter((m) => m.comparison_status === REFUSED_STATUS);
}

// The companion issue(s) that explain WHY a comparison was refused. NOTE: the backend
// leaves company_name null on this issue (the company is named inside `message`), so the
// panel must read the company from the refused rows, not from this issue's company_name.
export function basisCollisionIssues(issues: IssueRow[]): IssueRow[] {
  return issues.filter((i) => i.code === BASIS_COLLISION_CODE);
}

// ── 3.2 Reconciliation (cross-source check) ──────────────────────────────────────────

export interface ReconEntry {
  company: string | null;
  metric: CanonicalMetric | null;
  period: string | null;
  observed: number | null; // company report — RETAINED (the number we kept)
  expected: number | null; // portfolio summary — SUPPRESSED (the number we set aside)
  delta: number | null; // round(observed - expected, 6); the gap
  message: string;
}

export interface ReconSummary {
  conflicts: ReconEntry[]; // genuine disagreements (own report kept). 0 in the live data.
  matchCount: number; // metrics confirmed to AGREE across both documents (live: 22)
  checkedCount: number; // total metrics that appeared in both documents = conflicts + matches
  resolvedConflictCount: number; // intra-DOCUMENT candidate collisions auto-resolved (live: 7)
}

function toReconEntry(issue: IssueRow): ReconEntry {
  return {
    company: issue.company_name,
    metric: issue.canonical_metric,
    period: issue.period,
    observed: issue.observed_value,
    expected: issue.expected_value,
    delta: issue.delta,
    message: issue.message,
  };
}

// Dedupe a set of cross-document issues to one entry per (company, metric, period). We
// keep the first occurrence — within one code the natural key is already unique in the
// live data, so this is a defensive collapse, not a load-bearing one.
function dedupeByKey(issues: IssueRow[]): IssueRow[] {
  const seen = new Set<string>();
  const out: IssueRow[] = [];
  for (const issue of issues) {
    const key = conflictKey(issue);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(issue);
  }
  return out;
}

// The reconciliation panel's data. Binds RECONCILE_CODE (the DISAGREE signal — H4: NOT
// cross_document_conflicting_candidates, which carries no delta) for conflicts, and
// CROSS_SOURCE_MATCH_CODE for the confirmed agreements. Conflicts are sorted largest-gap
// first so a hero conflict (if any) leads.
export function reconciliationSummary(issues: IssueRow[]): ReconSummary {
  const conflicts = dedupeByKey(issues.filter((i) => i.code === RECONCILE_CODE))
    .map(toReconEntry)
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0));
  const matchCount = dedupeByKey(issues.filter((i) => i.code === CROSS_SOURCE_MATCH_CODE)).length;
  const resolvedConflictCount = issues.filter((i) => i.code === CANDIDATE_CONFLICT_CODE).length;
  return {
    conflicts,
    matchCount,
    checkedCount: conflicts.length + matchCount,
    resolvedConflictCount,
  };
}

// ── 3.3 Exceptions / early-warning (sector-aware missing metrics) ─────────────────────

export interface MissingGroup {
  company: string;
  sector: SectorKind | null;
  metrics: CanonicalMetric[]; // distinct, in canonical order
}

// Build a company -> sector lookup from the metric rows (each company has exactly one
// sector in the enhanced export).
function companySectorMap(metrics: MetricRow[]): Map<string, SectorKind> {
  const map = new Map<string, SectorKind>();
  for (const m of metrics) map.set(m.company_name, m.sector);
  return map;
}

// Missing metrics grouped by company. The backend already decides sector-awareness (it
// only flags a metric missing if it applies to that company's sector), so the frontend
// renders faithfully and must NOT re-derive "missing" itself. The raw issues fire per
// document/period, so we dedupe to distinct (company, metric) and then suppress any pair that
// has a reported value: live 30 raw -> 18 distinct -> 10 genuine gaps (mirrors the grid).
// LendBridge (credit) has zero missing issues, so it never appears (it is never asked for
// SaaS metrics) — this is exactly success criterion #5 ("zero false missing").
export function missingMetricsByCompany(
  metrics: MetricRow[],
  issues: IssueRow[],
): MissingGroup[] {
  const sectors = companySectorMap(metrics);
  // A (company, metric) is only a GENUINE gap if no value was actually reported for it. The
  // backend fires `missing_metric` per document/period, so a company that reports a metric in
  // its latest quarter can still carry a missing_metric for an EARLIER quarter — which the
  // grid shows as a live number while this panel would call "missing" (a self-contradiction
  // that breaks the "no false missing alarms" promise). Mirror the grid: suppress any pair
  // that has ANY reported value (the grid always shows the latest available). Live: this drops
  // 8 false gaps (18 -> 10), so Exceptions now exactly matches the grid's "—" cells.
  const reported = new Set<string>();
  for (const m of metrics) {
    if (m.value !== null) reported.add(cellKey(m.company_name, m.canonical_metric));
  }
  const byCompany = new Map<string, Set<CanonicalMetric>>();
  for (const issue of issues) {
    if (issue.code !== MISSING_METRIC_CODE) continue;
    if (!issue.company_name || !issue.canonical_metric) continue;
    if (reported.has(cellKey(issue.company_name, issue.canonical_metric))) continue; // reported ⇒ not a gap
    let set = byCompany.get(issue.company_name);
    if (!set) {
      set = new Set<CanonicalMetric>();
      byCompany.set(issue.company_name, set);
    }
    set.add(issue.canonical_metric);
  }
  const order = (m: CanonicalMetric) => CANONICAL_METRIC_ORDER.indexOf(m);
  return [...byCompany.entries()]
    .map(([company, set]) => ({
      company,
      sector: sectors.get(company) ?? null,
      metrics: [...set].sort((a, b) => order(a) - order(b)),
    }))
    .sort((a, b) => a.company.localeCompare(b.company));
}

// Total distinct (company, metric) gaps across the whole portfolio (live: 10, after the
// reported-value suppression above — mirrors the grid's "—" cells).
export function totalMissingCount(groups: MissingGroup[]): number {
  return groups.reduce((sum, g) => sum + g.metrics.length, 0);
}

// ── 3.4 Breadth — label-drift showcase ───────────────────────────────────────────────

export interface BreadthEntry {
  metric: CanonicalMetric;
  labels: string[]; // distinct raw_label values, sorted
  isOptional: boolean;
}

// For each canonical metric, how many DISTINCT source labels (the companies' own wording)
// collapse to it. This is the label-drift story: one canonical ID, many raw terms — and it
// is honest (there is no open raw-tail, so no "other/unrecognized" bucket is invented).
// Only metrics that actually appear are listed, in canonical order.
export function breadthByMetric(
  metrics: MetricRow[],
  optionalMetrics: CanonicalMetric[] = [],
): BreadthEntry[] {
  const optional = new Set(optionalMetrics);
  const byMetric = new Map<CanonicalMetric, Set<string>>();
  for (const m of metrics) {
    const label = m.raw_label.trim();
    if (!label) continue;
    let set = byMetric.get(m.canonical_metric);
    if (!set) {
      set = new Set<string>();
      byMetric.set(m.canonical_metric, set);
    }
    set.add(label);
  }
  const entries: BreadthEntry[] = [];
  for (const metric of CANONICAL_METRIC_ORDER) {
    const set = byMetric.get(metric);
    if (!set || set.size === 0) continue;
    entries.push({
      metric,
      labels: [...set].sort(),
      isOptional: optional.has(metric),
    });
  }
  return entries;
}

// Total distinct source labels across every canonical metric (live: 29).
export function totalDistinctLabels(entries: BreadthEntry[]): number {
  return entries.reduce((sum, e) => sum + e.labels.length, 0);
}
