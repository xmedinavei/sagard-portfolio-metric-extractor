// TypeScript mirror of 00-foundations.md §A.4 — the frozen 1.1.0 export contract.
// Source of truth: portfolio_metrics/schema.py as emitted in ENHANCED mode. Bind these
// names VERBATIM. Three RESERVED cases must NEVER be bound (they render empty/false UI):
//   1. IssueRow.code === "unrecognized_label"  — never emitted by any runtime path.
//   2. MetricRow.currency                        — declared but never assigned; always null.
//   3. MetricRow.comparison_status === "unchecked" — legal enum value, never assigned.

export type CanonicalMetric =
  | "revenue_qtr"
  | "arr_eop"
  | "gross_margin_pct"
  | "cash_balance"
  | "monthly_burn"
  | "headcount"
  | "net_revenue_retention_pct"
  | "logo_churn_pct";

export type SectorKind = "saas" | "credit" | "marketplace" | "payments";

export type MetricBasis =
  | "quarterly"
  | "period_end"
  | "monthly"
  | "ltm"
  | "interest_margin";

// "unchecked" is RESERVED — never assigned by the backend. Do not branch UI on it.
export type ComparisonStatus = "comparable" | "refused" | "unchecked";

export type MeasurementUnit =
  | "usd"
  | "percentage"
  | "count"
  | "multiplier"
  | "basis_points"
  | "unknown";

export type DocumentKind = "company_report" | "portfolio_summary";

export interface MetricRow {
  company_name: string;
  period: string | null; // nullable
  canonical_metric: CanonicalMetric;
  value: number | null; // nullable — a null value is NOT a zero
  unit: MeasurementUnit;
  display_value: string;
  raw_label: string; // the source's own terminology (drives breadth + provenance)
  raw_value_text: string;
  source_file: string; // provenance anchor (file-level)
  source_page: number | null; // OFTEN null — provenance is file-level in v1
  source_snippet: string;
  document_type: DocumentKind;
  confidence: number;
  parsing_method: string | null;
  detection_method: "table_row" | "narrative"; // §A.4 inline union (verbatim)
  metric_basis: MetricBasis | null; // "interest_margin" forced for credit gross margin
  notes: string[];
  is_valid: boolean;
  parse_error: string | null;
  sector: SectorKind; // enhanced: always one of 4, never null
  value_normalized: number | null; // usually null
  currency: null; // RESERVED — do not bind; always null
  comparison_status: ComparisonStatus | null;
}

export interface IssueRow {
  severity: "info" | "warning" | "error";
  code: string; // OPEN set of 9 emitted values — render the ones you use, ignore the rest
  message: string;
  source_file: string;
  source_page: number | null;
  company_name: string | null;
  canonical_metric: CanonicalMetric | null;
  raw_label: string | null;
  raw_value_text: string | null;
  period: string | null; // reconciliation join key
  expected_value: number | null; // reconciliation: the SUPPRESSED summary value
  observed_value: number | null; // reconciliation: the RETAINED company-report value
  delta: number | null; // reconciliation: round(observed - expected, 6)
}

export interface ExportMetadata {
  schema_version: string; // "1.1.0" in enhanced
  generated_at: string; // ISO-8601
  generator_name: string;
  generator_version: string;
  source_parsed_artifacts: string[];
  document_count: number;
  metric_count: number; // = metrics.length
  valid_metric_count: number;
  invalid_metric_count: number;
  issue_count: number; // = issues.length
  core_metrics: CanonicalMetric[];
  optional_metrics: CanonicalMetric[];
  recall_mode: string; // "enhanced"
}

export interface MetricsExport {
  export_metadata: ExportMetadata;
  metrics: MetricRow[];
  issues: IssueRow[];
}

// GET /api/reports — §A.1
export interface ReportsResponse {
  reports: string[];
  intake_dir: string;
  count: number;
}

// POST /api/run — §A.2
export interface RunResponse {
  schema_version: string;
  parsed: number;
  total: number;
  elapsed_s: number;
  export: MetricsExport;
}
