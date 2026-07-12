import { describe, expect, it } from "vitest";

import type { IssueRow, MetricRow } from "../types";
import {
  basisCollisionIssues,
  breadthByMetric,
  missingMetricsByCompany,
  reconciliationSummary,
  refusedRows,
  totalDistinctLabels,
  totalMissingCount,
} from "./comparison";

// MetricRow factory (23 §A.4 fields) — same pattern as grid.test.ts / trend.test.ts. Each
// test only states the fields it cares about; `over` wins over the harmless defaults.
function mkRow(
  over: Pick<MetricRow, "company_name" | "sector" | "canonical_metric"> & Partial<MetricRow>,
): MetricRow {
  return {
    period: "Q2 2025",
    value: 0,
    unit: "usd",
    display_value: "$0",
    raw_label: "",
    raw_value_text: "",
    source_file: "x.pdf",
    source_page: null,
    source_snippet: "",
    document_type: "company_report",
    confidence: 1,
    parsing_method: null,
    detection_method: "table_row",
    metric_basis: "quarterly",
    notes: [],
    is_valid: true,
    parse_error: null,
    value_normalized: null,
    currency: null,
    comparison_status: "comparable",
    ...over,
  };
}

// IssueRow factory (13 §A.4 fields).
function mkIssue(over: Pick<IssueRow, "code"> & Partial<IssueRow>): IssueRow {
  return {
    severity: "warning",
    message: "",
    source_file: "x.pdf",
    source_page: null,
    company_name: null,
    canonical_metric: null,
    raw_label: null,
    raw_value_text: null,
    period: null,
    expected_value: null,
    observed_value: null,
    delta: null,
    ...over,
  };
}

describe("refusedRows + basisCollisionIssues (3.1 refuse-to-compare)", () => {
  // 5 LendBridge gross-margin rows refused on interest-margin basis, plus comparable rows
  // that must NOT be swept in.
  const REFUSED_CORPUS: MetricRow[] = [
    ...["Q2 2024", "Q3 2024", "Q4 2024", "Q1 2025", "Q2 2025"].map((period) =>
      mkRow({
        company_name: "LendBridge",
        sector: "credit",
        canonical_metric: "gross_margin_pct",
        period,
        unit: "percentage",
        display_value: "60%",
        comparison_status: "refused",
        metric_basis: "interest_margin",
      }),
    ),
    mkRow({ company_name: "LendBridge", sector: "credit", canonical_metric: "revenue_qtr" }),
    mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop" }),
  ];

  it("surfaces exactly the refused rows and nothing comparable", () => {
    const refused = refusedRows(REFUSED_CORPUS);
    expect(refused).toHaveLength(5);
    expect(refused.every((r) => r.company_name === "LendBridge")).toBe(true);
    expect(refused.every((r) => r.canonical_metric === "gross_margin_pct")).toBe(true);
    expect(refused.every((r) => r.metric_basis === "interest_margin")).toBe(true);
  });

  it("filters basis_collision and ignores every other issue code (open 9-value set)", () => {
    const issues = [
      mkIssue({ code: "basis_collision", canonical_metric: "gross_margin_pct", message: "Refused..." }),
      mkIssue({ code: "missing_metric", company_name: "MediSight", canonical_metric: "headcount" }),
      mkIssue({ code: "portfolio_summary_document" }),
      mkIssue({ code: "cross_document_duplicate" }),
    ];
    const collisions = basisCollisionIssues(issues);
    expect(collisions).toHaveLength(1);
    expect(collisions[0].message).toBe("Refused...");
  });
});

describe("reconciliationSummary (3.2 cross-source check)", () => {
  it("binds cross_source_discrepancy for conflicts, NOT the marker code (H4)", () => {
    const issues = [
      // The numeric discrepancy — this is what a conflict card renders.
      mkIssue({
        code: "cross_source_discrepancy",
        company_name: "TalentVault",
        canonical_metric: "arr_eop",
        period: "Q2 2025",
        observed_value: 20_800_000,
        expected_value: 22_400_000,
        delta: -1_600_000,
      }),
      // The paired marker for the SAME tuple — carries no delta; must be ignored so the
      // same conflict is never shown twice.
      mkIssue({
        code: "cross_document_conflicting_candidates",
        company_name: "TalentVault",
        canonical_metric: "arr_eop",
        period: "Q2 2025",
      }),
    ];
    const summary = reconciliationSummary(issues);
    expect(summary.conflicts).toHaveLength(1);
    expect(summary.conflicts[0].observed).toBe(20_800_000); // company report, retained
    expect(summary.conflicts[0].expected).toBe(22_400_000); // summary, suppressed
    expect(summary.conflicts[0].delta).toBe(-1_600_000);
  });

  it("dedupes duplicate discrepancy rows by (company, metric, period)", () => {
    const one = mkIssue({
      code: "cross_source_discrepancy",
      company_name: "CarbonTrack",
      canonical_metric: "arr_eop",
      period: "Q2 2025",
      observed_value: 15_200_000,
      expected_value: 16_900_000,
      delta: -1_700_000,
    });
    const summary = reconciliationSummary([one, { ...one }]);
    expect(summary.conflicts).toHaveLength(1);
  });

  it("counts confirmed matches and sorts conflicts by largest gap first", () => {
    const issues = [
      mkIssue({ code: "cross_source_discrepancy", company_name: "A", canonical_metric: "arr_eop", period: "Q2 2025", delta: -1_600_000, observed_value: 1, expected_value: 2 }),
      mkIssue({ code: "cross_source_discrepancy", company_name: "B", canonical_metric: "arr_eop", period: "Q2 2025", delta: -1_700_000, observed_value: 1, expected_value: 2 }),
      mkIssue({ code: "cross_document_duplicate", company_name: "C", canonical_metric: "headcount", period: "Q2 2025" }),
      mkIssue({ code: "cross_document_duplicate", company_name: "D", canonical_metric: "arr_eop", period: "Q2 2025" }),
    ];
    const summary = reconciliationSummary(issues);
    expect(summary.conflicts.map((c) => c.company)).toEqual(["B", "A"]); // |1.7M| before |1.6M|
    expect(summary.matchCount).toBe(2);
    expect(summary.checkedCount).toBe(4); // 2 conflicts + 2 matches
  });

  it("sorts a null-delta conflict last (defensive — treated as gap 0)", () => {
    const issues = [
      mkIssue({ code: "cross_source_discrepancy", company_name: "NoDelta", canonical_metric: "arr_eop", period: "Q2 2025", delta: null }),
      mkIssue({ code: "cross_source_discrepancy", company_name: "HasDelta", canonical_metric: "arr_eop", period: "Q2 2025", delta: -900_000 }),
    ];
    const summary = reconciliationSummary(issues);
    expect(summary.conflicts.map((c) => c.company)).toEqual(["HasDelta", "NoDelta"]);
  });

  it("is an honest all-clear when there are no discrepancies (the live case after the fix)", () => {
    const issues = Array.from({ length: 22 }, (_, i) =>
      mkIssue({ code: "cross_document_duplicate", company_name: `Co${i}`, canonical_metric: "arr_eop", period: "Q2 2025" }),
    );
    const summary = reconciliationSummary(issues);
    expect(summary.conflicts).toHaveLength(0);
    expect(summary.matchCount).toBe(22);
    expect(summary.checkedCount).toBe(22);
  });
});

describe("missingMetricsByCompany (3.3 sector-aware exceptions)", () => {
  // Sectors come from the metric rows; LendBridge is credit and has NO missing issues.
  const METRICS: MetricRow[] = [
    mkRow({ company_name: "MediSight", sector: "saas", canonical_metric: "arr_eop" }),
    mkRow({ company_name: "FleetLink", sector: "marketplace", canonical_metric: "revenue_qtr" }),
    mkRow({ company_name: "LendBridge", sector: "credit", canonical_metric: "gross_margin_pct" }),
  ];
  // 30-raw-vs-18-distinct in miniature: MediSight cash_balance is flagged in 4 periods.
  const ISSUES: IssueRow[] = [
    ...["Q2 2024", "Q3 2024", "Q4 2024", "Q2 2025"].map((period) =>
      mkIssue({ code: "missing_metric", company_name: "MediSight", canonical_metric: "cash_balance", period }),
    ),
    mkIssue({ code: "missing_metric", company_name: "MediSight", canonical_metric: "monthly_burn", period: "Q2 2025" }),
    mkIssue({ code: "missing_metric", company_name: "FleetLink", canonical_metric: "headcount", period: "Q2 2025" }),
    // A non-missing code that must be ignored.
    mkIssue({ code: "cross_document_duplicate", company_name: "MediSight", canonical_metric: "arr_eop" }),
  ];

  it("dedupes per (company, metric), groups by company, attaches sector, orders canonically", () => {
    const groups = missingMetricsByCompany(METRICS, ISSUES);
    expect(groups.map((g) => g.company)).toEqual(["FleetLink", "MediSight"]); // alphabetical
    const medi = groups.find((g) => g.company === "MediSight");
    expect(medi?.sector).toBe("saas");
    // cash_balance flagged 4x collapses to one; canonical order (cash_balance before monthly_burn).
    expect(medi?.metrics).toEqual(["cash_balance", "monthly_burn"]);
  });

  it("never lists a company with no missing issues (LendBridge / credit — success #5)", () => {
    const groups = missingMetricsByCompany(METRICS, ISSUES);
    expect(groups.some((g) => g.company === "LendBridge")).toBe(false);
    expect(totalMissingCount(groups)).toBe(3); // MediSight(2) + FleetLink(1)
  });

  it("skips missing_metric issues with a null company or metric (defensive)", () => {
    const issues = [
      mkIssue({ code: "missing_metric", company_name: null, canonical_metric: "headcount" }),
      mkIssue({ code: "missing_metric", company_name: "MediSight", canonical_metric: null }),
      mkIssue({ code: "missing_metric", company_name: "MediSight", canonical_metric: "cash_balance" }),
    ];
    const groups = missingMetricsByCompany(METRICS, issues);
    expect(groups).toHaveLength(1);
    expect(groups[0].company).toBe("MediSight");
    expect(groups[0].metrics).toEqual(["cash_balance"]);
  });
});

describe("breadthByMetric (3.4 label-drift showcase)", () => {
  const METRICS: MetricRow[] = [
    mkRow({ company_name: "A", sector: "saas", canonical_metric: "arr_eop", raw_label: "End-of-Period ARR" }),
    mkRow({ company_name: "B", sector: "saas", canonical_metric: "arr_eop", raw_label: "Contracted ARR" }),
    mkRow({ company_name: "C", sector: "saas", canonical_metric: "arr_eop", raw_label: "End-of-Period ARR" }), // dup label
    mkRow({ company_name: "D", sector: "saas", canonical_metric: "net_revenue_retention_pct", raw_label: "NRR (LTM)" }),
    mkRow({ company_name: "E", sector: "saas", canonical_metric: "gross_margin_pct", raw_label: "" }), // blank skipped
  ];

  it("counts distinct source labels per metric, in canonical order, flagging optional metrics", () => {
    const entries = breadthByMetric(METRICS, ["net_revenue_retention_pct", "logo_churn_pct"]);
    expect(entries.map((e) => e.metric)).toEqual(["arr_eop", "net_revenue_retention_pct"]);
    const arr = entries.find((e) => e.metric === "arr_eop");
    expect(arr?.labels).toEqual(["Contracted ARR", "End-of-Period ARR"]); // distinct + sorted
    expect(arr?.isOptional).toBe(false);
    expect(entries.find((e) => e.metric === "net_revenue_retention_pct")?.isOptional).toBe(true);
  });

  it("skips blank raw_labels and totals the distinct label count", () => {
    const entries = breadthByMetric(METRICS);
    // gross_margin_pct's only row has a blank label -> the metric is dropped entirely.
    expect(entries.some((e) => e.metric === "gross_margin_pct")).toBe(false);
    expect(totalDistinctLabels(entries)).toBe(3); // 2 arr_eop labels + 1 nrr label
  });
});
