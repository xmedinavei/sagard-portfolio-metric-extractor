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

// The metric column GROUPS — dependent metrics sit together and read left → right as a story of
// company health. Rendered as a banner row above the columns so the grouping is obvious; the
// flattened order below is the grid's canonical column order (a display choice, independent of
// the export's field order).
export interface MetricGroup {
  label: string;
  metrics: CanonicalMetric[];
}
export const METRIC_GROUPS: MetricGroup[] = [
  { label: "Grow · Profit", metrics: ["revenue_qtr", "arr_eop", "gross_margin_pct"] },
  { label: "Keep", metrics: ["net_revenue_retention_pct", "logo_churn_pct"] },
  { label: "Fund", metrics: ["cash_balance", "monthly_burn"] },
  { label: "Scale", metrics: ["headcount"] },
];

// Flattened column order (single source of truth = METRIC_GROUPS). Every sector table shows all
// 8 columns so the honesty affordance stays visible: metrics a sector never reports render as N/A.
export const CANONICAL_METRIC_ORDER: CanonicalMetric[] = METRIC_GROUPS.flatMap((g) => g.metrics);

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

// One-line "what this sector is" subtitle under each sector table (visual support only).
export const SECTOR_DESCRIPTION: Record<SectorKind, string> = {
  saas: "Software companies — subscription economics: recurring revenue, retention, churn.",
  credit: "Private lender — yield & credit metrics; its margin is interest-based, not SaaS-comparable.",
  marketplace: "Two-sided marketplaces — transaction-volume revenue, thin margins.",
  payments: "Payments processor — transaction-volume revenue; note the restricted client cash.",
};

// The full name behind each column acronym (small visual support in the header).
export const METRIC_FULL_NAME: Record<CanonicalMetric, string> = {
  revenue_qtr: "Quarterly revenue",
  arr_eop: "Annual Recurring Revenue",
  gross_margin_pct: "Gross profit margin",
  cash_balance: "Cash & equivalents",
  monthly_burn: "Monthly net burn",
  headcount: "Total headcount",
  net_revenue_retention_pct: "Net Revenue Retention",
  logo_churn_pct: "Logo churn rate",
};

// A plain-language "what it means" for each metric — shown as the column header's tooltip.
export const METRIC_DESCRIPTION: Record<CanonicalMetric, string> = {
  revenue_qtr: "Recognized revenue for the quarter.",
  arr_eop: "Annualized value of active subscriptions at the end of the period.",
  gross_margin_pct: "Revenue minus cost of goods sold, as a % of revenue.",
  cash_balance: "Cash on hand at the end of the period.",
  monthly_burn: "Net cash consumed per month (shown negative — money going out).",
  headcount: "Full-time employees at the end of the period.",
  net_revenue_retention_pct:
    "Revenue kept and expanded from existing customers over the last twelve months (>100% = net expansion).",
  logo_churn_pct: "Share of customers lost over the last twelve months.",
};

// ── Reporting-currency rulebook (Trap C — currency). Human-owned data: which companies
// report their pack in a non-USD currency. In production this comes from the backend
// `currency` field (RESERVED / null in v1), so we keep a small explicit map here — exactly
// the "human-owned rulebook the machine applies" the design calls for. Default is USD.
// Without this, PeopleFlow's GBP levels (printed as a bare "5.1M") sit silently in the same
// USD column as everyone else — the very currency trap the tool exists to prevent. ─────────
export const REPORTING_CURRENCY: Record<string, string> = {
  PeopleFlow: "GBP", // pack states "GBP"; levels are printed without a symbol, e.g. "5.1M"
};

// Symbol per ISO currency code (display only). An unknown code falls back to no symbol.
export const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", GBP: "£", EUR: "€" };

// The canonical metrics that are money AMOUNTS, so a currency applies. Percentages and
// counts (gross margin, NRR, logo churn, headcount) are NOT currency-denominated — you never
// FX-convert a ratio — so they are never currency-flagged.
export const CURRENCY_DENOMINATED_METRICS: Set<CanonicalMetric> = new Set([
  "revenue_qtr",
  "arr_eop",
  "cash_balance",
  "monthly_burn",
]);

// The currency a company reports in (default USD).
export function reportingCurrency(company: string): string {
  return REPORTING_CURRENCY[company] ?? "USD";
}

// If this (company, metric) money value is reported in a non-USD currency, return that
// currency code so the grid can flag it "not comparable" to the USD column; else null.
export function nonUsdCurrency(company: string, metric: CanonicalMetric): string | null {
  const currency = reportingCurrency(company);
  if (currency === "USD") return null;
  if (!CURRENCY_DENOMINATED_METRICS.has(metric)) return null;
  return currency;
}

// Format a raw USD amount as a short "$X.XM" string (display only). Every value on this
// corpus is millions-scale and the source packs print one decimal, so we match that.
export function formatUsdShort(value: number): string {
  return `$${(value / 1_000_000).toFixed(1)}M`;
}

// Some source packs print money BARE ("27.9M") and others with a "$" ("$34.2M"). A grid whose
// whole pitch is comparability must not show a bare number beside a symboled one — so for a
// money metric with no currency symbol we prefix the COMPANY's reporting currency. Prefixing a
// blanket "$" would be WRONG: PeopleFlow reports in GBP and prints bare, so "$" would stamp a
// false USD label (the exact currency trap the tool refuses). USD companies get "$"; PeopleFlow
// gets "£". Non-money metrics (%, counts) are never touched, and text that already carries a
// symbol (incl. a parenthesised "($0.55M)" burn) is returned unchanged.
export function withCurrencySymbol(
  text: string,
  metric: CanonicalMetric,
  company: string,
): string {
  if (!CURRENCY_DENOMINATED_METRICS.has(metric)) return text;
  if (/[£$€]/.test(text)) return text;
  const symbol = CURRENCY_SYMBOL[reportingCurrency(company)] ?? "$";
  return `${symbol}${text}`;
}

// A backend-computed, basis-adjusted figure that differs from the headline value — the one
// live case is ClearPay's `value_normalized` = $32.2M OPERATING cash beside the headline
// $38.4M (the $6.2M gap is segregated client money it legally cannot spend — Trap C). This
// number is already in the export; without surfacing it the cockpit hides what the tool
// CAUGHT. Returns the adjusted figure + a short note, or null for every ordinary row (where
// `value_normalized` is null or equal to the headline).
export interface OperatingValueView {
  text: string; // e.g. "$32.2M"
  note: string; // e.g. "operating cash — excludes restricted client funds"
}
export function operatingValueView(row: MetricRow): OperatingValueView | null {
  if (row.value_normalized === null || row.value === null) return null;
  if (row.value_normalized === row.value) return null;
  // Currency guard: value_normalized is a USD-basis adjustment and formatUsdShort always
  // prints "$". A non-USD company with a normalized figure is not a real case today, but this
  // keeps BOTH the grid and the drawer honest — never stamp "$" on a £ figure (the very
  // mislabel the tool exists to prevent).
  if (reportingCurrency(row.company_name) !== "USD") return null;
  return {
    text: formatUsdShort(row.value_normalized),
    note: "operating cash — excludes restricted client funds",
  };
}

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

// Every distinct reported period, newest first — drives the grid's "as of quarter" selector.
export function distinctPeriods(metrics: MetricRow[]): string[] {
  const set = new Set<string>();
  for (const m of metrics) if (m.period) set.add(m.period);
  return [...set].sort((a, b) => parsePeriodKey(b) - parsePeriodKey(a));
}

// For each (company, canonical_metric), the row reported IN a specific period (or absent). Lets
// the grid show a chosen historical quarter instead of only the latest snapshot.
export function valuesForPeriod(
  metrics: MetricRow[],
  period: string,
): Map<string, MetricRow> {
  const map = new Map<string, MetricRow>();
  for (const row of metrics) {
    if (row.period !== period) continue;
    map.set(cellKey(row.company_name, row.canonical_metric), row);
  }
  return map;
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

// ── Display grouping (Phase 5) ────────────────────────────────────────────────────────────
// The grid groups companies two ways: by MARKET (SaaS / Credit / Marketplace / Payments) or by
// investment STRATEGY (Private Equity vs Private Credit). Grouping is display-only — heat is
// always ranked within a company's actual MARKET, never across it, so comparability holds in
// both views (a marketplace margin is never ranked against a SaaS one, even when shown together).
export type Strategy = "private_equity" | "private_credit";
export const STRATEGY_OF: Record<SectorKind, Strategy> = {
  saas: "private_equity",
  marketplace: "private_equity",
  payments: "private_equity",
  credit: "private_credit",
};
const STRATEGY_ORDER: Strategy[] = ["private_equity", "private_credit"];
export const STRATEGY_LABELS: Record<Strategy, string> = {
  private_equity: "Private Equity",
  private_credit: "Private Credit",
};
const STRATEGY_DESCRIPTION: Record<Strategy, string> = {
  private_equity:
    "Equity-held operating companies (software, marketplace, payments) — monitored on growth & profitability.",
  private_credit:
    "Private lender — monitored on its own credit / yield basis, never mixed into the equity book.",
};

// A display group of companies (one table): a market sector or an investment strategy.
export interface DisplayGroup {
  key: string;
  label: string; // "SaaS" or "Private Equity"
  description: string;
  companies: string[]; // sorted
}

// Company → its market sector (each company has exactly one).
export function companySectors(metrics: MetricRow[]): Map<string, SectorKind> {
  const map = new Map<string, SectorKind>();
  for (const m of metrics) map.set(m.company_name, m.sector);
  return map;
}

export function groupByMarket(metrics: MetricRow[]): DisplayGroup[] {
  return groupCompaniesBySector(metrics).map((g) => ({
    key: g.sector,
    label: SECTOR_LABELS[g.sector],
    description: SECTOR_DESCRIPTION[g.sector],
    companies: g.companies,
  }));
}

// Within a strategy table, order companies by MARKET (SECTOR_ORDER: SaaS first, then marketplace,
// payments, …) and alphabetically inside a market — so the Private Equity table reads SaaS-first
// instead of a flat A→Z mix of sectors. Heat is still ranked within each actual market, so this is
// a pure row-ordering (display) choice; comparability is unaffected.
export function groupByStrategy(metrics: MetricRow[]): DisplayGroup[] {
  const sectors = companySectors(metrics);
  const marketRank = (company: string) => {
    const sector = sectors.get(company);
    const i = sector ? SECTOR_ORDER.indexOf(sector) : -1;
    return i === -1 ? SECTOR_ORDER.length : i; // unknown/absent market sorts last, never dropped
  };
  const orderByMarketThenName = (set: Set<string>) =>
    [...set].sort((a, b) => marketRank(a) - marketRank(b) || a.localeCompare(b));

  const byStrat = new Map<Strategy, Set<string>>();
  for (const [company, sector] of sectors) {
    const strat = STRATEGY_OF[sector];
    let set = byStrat.get(strat);
    if (!set) {
      set = new Set<string>();
      byStrat.set(strat, set);
    }
    set.add(company);
  }
  const out: DisplayGroup[] = [];
  for (const strat of STRATEGY_ORDER) {
    const set = byStrat.get(strat);
    if (set && set.size) {
      out.push({
        key: strat,
        label: STRATEGY_LABELS[strat],
        description: STRATEGY_DESCRIPTION[strat],
        companies: orderByMarketThenName(set),
      });
    }
  }
  return out;
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
