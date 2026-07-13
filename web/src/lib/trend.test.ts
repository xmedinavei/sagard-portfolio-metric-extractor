import { describe, expect, it } from "vitest";

import type { MetricRow } from "../types";
import {
  buildAllCompaniesSeries,
  buildSeries,
  distinctCompanies,
  formatAxisTick,
  hasSufficientHistory,
  metricsForCompany,
  metricsPresent,
  seriesBreakdown,
  yDomain,
} from "./trend";

// A MetricRow factory: fills the 23 §A.4 fields with harmless defaults so each test only
// states the handful of fields it cares about. `over` wins over the defaults. (Same shape
// as grid.test.ts — kept local so this file has no cross-test dependency.)
function mkRow(
  over: Pick<MetricRow, "company_name" | "sector" | "canonical_metric"> & Partial<MetricRow>,
): MetricRow {
  return {
    period: "Q1 2025",
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

// NovaCloud's live arr_eop comes out of the export in filename order (NOT chronological):
// Q1 2025, Q2 2024, Q2 2025, Q3 2024, Q4 2024. This fixture reproduces that ordering so
// the tests prove the series is re-sorted to true chronological order. The two distinct
// raw_labels mirror the live data (the metric was renamed once across the 5 PDFs).
const NOVACLOUD_ARR: MetricRow[] = [
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q1 2025", value: 31_600_000, display_value: "$31.6M", raw_label: "End-of-Period ARR" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q2 2024", value: 24_100_000, display_value: "$24.1M", raw_label: "End-of-Period ARR" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q2 2025", value: 34_200_000, display_value: "$34.2M", raw_label: "ARR (End of Period)" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q3 2024", value: 26_800_000, display_value: "$26.8M", raw_label: "End-of-Period ARR" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q4 2024", value: 29_100_000, display_value: "$29.1M", raw_label: "End-of-Period ARR" }),
];

// A compact multi-company corpus for the selector helpers + the history bands: NovaCloud
// (5 periods), a 2-period company (FleetLink-like → trips the guard at the boundary), and
// a single-period company (ApexFreight-like).
const CORPUS: MetricRow[] = [
  ...NOVACLOUD_ARR,
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "monthly_burn", period: "Q2 2025", value: 4_200_000, display_value: "4.2M" }),
  mkRow({ company_name: "FleetLink", sector: "marketplace", canonical_metric: "revenue_qtr", period: "Q4 2024", value: 1_000_000, display_value: "$1.0M" }),
  mkRow({ company_name: "FleetLink", sector: "marketplace", canonical_metric: "revenue_qtr", period: "Q1 2025", value: 1_200_000, display_value: "$1.2M" }),
  mkRow({ company_name: "ApexFreight", sector: "marketplace", canonical_metric: "revenue_qtr", period: "Q2 2025", value: 9_300_000, display_value: "9.3M" }),
];

describe("buildSeries", () => {
  it("collapses NovaCloud arr_eop into one chronological 5-point series", () => {
    const points = buildSeries(NOVACLOUD_ARR, "NovaCloud", "arr_eop");
    // A plain string sort would put "Q1 2025" before "Q2 2024" (quarter dominates year);
    // the raw export order starts with "Q1 2025" too. The series must be TRUE chronology.
    expect(points.map((p) => p.period)).toEqual([
      "Q2 2024",
      "Q3 2024",
      "Q4 2024",
      "Q1 2025",
      "Q2 2025",
    ]);
    // Values then run monotonically 24.1M -> 34.2M — the flagship line.
    expect(points.map((p) => p.value)).toEqual([
      24_100_000, 26_800_000, 29_100_000, 31_600_000, 34_200_000,
    ]);
    // display_value is bound verbatim (provenance-faithful), not reformatted.
    expect(points[4].displayValue).toBe("$34.2M");
  });

  it("does not re-split one metric across its raw_label drift", () => {
    // The 5 NovaCloud rows carry 2 different raw_labels but ONE canonical_metric — they
    // must stay a single 5-point series, never split into per-label stubs.
    const points = buildSeries(NOVACLOUD_ARR, "NovaCloud", "arr_eop");
    expect(points).toHaveLength(5);
  });

  it("carries the distinct raw_labels behind the plotted points (for the collapse note)", () => {
    // The honest "one line across N source labels" note is derived from the plotted set:
    // NovaCloud's 5 points span exactly 2 distinct source labels, so the note can never
    // over- or under-count vs what is actually on the line.
    const labels = new Set(
      buildSeries(NOVACLOUD_ARR, "NovaCloud", "arr_eop").map((p) => p.rawLabel),
    );
    expect(labels.size).toBe(2);
  });

  it("drops null values, null/unparseable periods, and dedupes duplicate periods", () => {
    const rows = [
      mkRow({ company_name: "X", sector: "saas", canonical_metric: "arr_eop", period: "Q1 2025", value: 10, display_value: "$10" }),
      // null value → dropped (a null is not a zero); it must not become a (0) point.
      mkRow({ company_name: "X", sector: "saas", canonical_metric: "arr_eop", period: "Q2 2025", value: null, display_value: "n/a" }),
      // null period → dropped (an undated row cannot sit on the time axis).
      mkRow({ company_name: "X", sector: "saas", canonical_metric: "arr_eop", period: null, value: 50, display_value: "$50" }),
      // unparseable period ("FY2024" is not "Q<n> YYYY") → dropped, never placed at key -1.
      mkRow({ company_name: "X", sector: "saas", canonical_metric: "arr_eop", period: "FY2024", value: 60, display_value: "$60" }),
      // duplicate Q1 2025 → deduped to one point (conflict handling is Phase 3, not a line point).
      mkRow({ company_name: "X", sector: "saas", canonical_metric: "arr_eop", period: "Q1 2025", value: 99, display_value: "$99" }),
    ];
    const points = buildSeries(rows, "X", "arr_eop");
    expect(points).toHaveLength(1);
    expect(points[0].period).toBe("Q1 2025");
    expect(points[0].value).toBe(10);
  });
});

describe("hasSufficientHistory — the insufficient-history guard", () => {
  it("passes NovaCloud (5 distinct periods)", () => {
    expect(hasSufficientHistory(buildSeries(NOVACLOUD_ARR, "NovaCloud", "arr_eop"))).toBe(true);
  });

  it("trips on a 2-period company (the < 3 boundary)", () => {
    const points = buildSeries(CORPUS, "FleetLink", "revenue_qtr");
    expect(points).toHaveLength(2);
    expect(hasSufficientHistory(points)).toBe(false);
  });

  it("trips on a single-period company", () => {
    const points = buildSeries(CORPUS, "ApexFreight", "revenue_qtr");
    expect(points).toHaveLength(1);
    expect(hasSufficientHistory(points)).toBe(false);
  });

  it("renders at exactly MIN_TREND_POINTS — the ==3 boundary (MediSight/PeopleFlow shape)", () => {
    // MediSight & PeopleFlow have exactly 3 quarters of arr_eop; they MUST render, not
    // trip the guard. Locking the boundary guards against an off-by-one (`>` vs `>=`) that
    // would silently hide every 3-quarter company yet still pass the 5/2/1 tests.
    const rows = [
      mkRow({ company_name: "MediSight", sector: "saas", canonical_metric: "arr_eop", period: "Q4 2024", value: 20_000_000, display_value: "$20.0M" }),
      mkRow({ company_name: "MediSight", sector: "saas", canonical_metric: "arr_eop", period: "Q1 2025", value: 22_000_000, display_value: "$22.0M" }),
      mkRow({ company_name: "MediSight", sector: "saas", canonical_metric: "arr_eop", period: "Q2 2025", value: 24_000_000, display_value: "$24.0M" }),
    ];
    const points = buildSeries(rows, "MediSight", "arr_eop");
    expect(points).toHaveLength(3);
    expect(hasSufficientHistory(points)).toBe(true);
  });
});

describe("selector helpers", () => {
  it("lists distinct companies alphabetically", () => {
    expect(distinctCompanies(CORPUS)).toEqual(["ApexFreight", "FleetLink", "NovaCloud"]);
  });

  it("lists a company's reported metrics in canonical order, never empty", () => {
    // NovaCloud reports arr_eop + monthly_burn; the order follows CANONICAL_METRIC_ORDER
    // (arr_eop before monthly_burn), and only metrics it actually has are offered.
    expect(metricsForCompany(CORPUS, "NovaCloud")).toEqual(["arr_eop", "monthly_burn"]);
  });
});

// A multi-company corpus for the all-companies overlay (V3): SaaS companies with NRR over
// several quarters (the league), a 2-quarter company (insufficient), a lender with a REFUSED
// margin (different basis), and PeopleFlow reporting revenue in GBP (non-USD money).
const OVERLAY_CORPUS: MetricRow[] = [
  // NovaCloud NRR — 5 quarters (the league leader)
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q2 2024", value: 115, unit: "percentage", display_value: "115%" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q3 2024", value: 117, unit: "percentage", display_value: "117%" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q4 2024", value: 119, unit: "percentage", display_value: "119%" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q1 2025", value: 121, unit: "percentage", display_value: "121%" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q2 2025", value: 123, unit: "percentage", display_value: "123%" }),
  // CarbonTrack NRR — exactly 3 quarters (renders)
  mkRow({ company_name: "CarbonTrack", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q4 2024", value: 118, unit: "percentage", display_value: "118%" }),
  mkRow({ company_name: "CarbonTrack", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q1 2025", value: 120, unit: "percentage", display_value: "120%" }),
  mkRow({ company_name: "CarbonTrack", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q2 2025", value: 121, unit: "percentage", display_value: "121%" }),
  // ShortCo NRR — only 2 quarters (insufficient history)
  mkRow({ company_name: "ShortCo", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q1 2025", value: 110, unit: "percentage", display_value: "110%" }),
  mkRow({ company_name: "ShortCo", sector: "saas", canonical_metric: "net_revenue_retention_pct", period: "Q2 2025", value: 112, unit: "percentage", display_value: "112%" }),
  // NovaCloud gross margin — comparable (3 quarters)
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "gross_margin_pct", period: "Q4 2024", value: 76, unit: "percentage", display_value: "76%" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "gross_margin_pct", period: "Q1 2025", value: 77, unit: "percentage", display_value: "77%" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "gross_margin_pct", period: "Q2 2025", value: 78, unit: "percentage", display_value: "78%" }),
  // LendBridge gross margin — REFUSED (interest margin, a different basis) over 3 quarters
  mkRow({ company_name: "LendBridge", sector: "credit", canonical_metric: "gross_margin_pct", period: "Q4 2024", value: 60, unit: "percentage", display_value: "60%", comparison_status: "refused", metric_basis: "interest_margin" }),
  mkRow({ company_name: "LendBridge", sector: "credit", canonical_metric: "gross_margin_pct", period: "Q1 2025", value: 61, unit: "percentage", display_value: "61%", comparison_status: "refused", metric_basis: "interest_margin" }),
  mkRow({ company_name: "LendBridge", sector: "credit", canonical_metric: "gross_margin_pct", period: "Q2 2025", value: 62, unit: "percentage", display_value: "62%", comparison_status: "refused", metric_basis: "interest_margin" }),
  // Revenue: NovaCloud + CarbonTrack in USD, PeopleFlow in GBP (non-USD money → excluded)
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "revenue_qtr", period: "Q4 2024", value: 7_200_000, display_value: "$7.2M" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "revenue_qtr", period: "Q1 2025", value: 7_900_000, display_value: "$7.9M" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "revenue_qtr", period: "Q2 2025", value: 8_400_000, display_value: "$8.4M" }),
  mkRow({ company_name: "PeopleFlow", sector: "saas", canonical_metric: "revenue_qtr", period: "Q4 2024", value: 4_900_000, display_value: "4.9M" }),
  mkRow({ company_name: "PeopleFlow", sector: "saas", canonical_metric: "revenue_qtr", period: "Q1 2025", value: 5_000_000, display_value: "5.0M" }),
  mkRow({ company_name: "PeopleFlow", sector: "saas", canonical_metric: "revenue_qtr", period: "Q2 2025", value: 5_100_000, display_value: "5.1M" }),
];

describe("buildAllCompaniesSeries — the all-companies overlay (V3)", () => {
  it("plots 3+-quarter companies as trend lines and 1-2-quarter companies as snapshot dots", () => {
    const { series, excluded } = buildAllCompaniesSeries(OVERLAY_CORPUS, "net_revenue_retention_pct");
    const kinds = Object.fromEntries(series.map((s) => [s.company, s.kind]));
    expect(kinds["NovaCloud"]).toBe("line"); // 5 quarters
    expect(kinds["CarbonTrack"]).toBe("line"); // exactly 3 quarters
    expect(kinds["ShortCo"]).toBe("point"); // 2 quarters → snapshot DOT, no longer excluded
    // every plotted series gets a non-empty colour
    expect(series.every((s) => s.color.length > 0)).toBe(true);
    // a single/short-history company is now SHOWN as a dot, not excluded as "insufficient history"
    expect(excluded.some((e) => e.company === "ShortCo")).toBe(false);
  });

  it("seriesBreakdown counts trend lines vs snapshot dots", () => {
    const { series } = buildAllCompaniesSeries(OVERLAY_CORPUS, "net_revenue_retention_pct");
    const b = seriesBreakdown(series);
    expect(b.total).toBe(3); // NovaCloud + CarbonTrack + ShortCo
    expect(b.lines).toBe(2); // NovaCloud, CarbonTrack
    expect(b.points).toBe(1); // ShortCo
  });

  it("excludes a refused-basis company by name (LendBridge interest margin)", () => {
    const { series, excluded } = buildAllCompaniesSeries(OVERLAY_CORPUS, "gross_margin_pct");
    expect(series.map((s) => s.company)).toEqual(["NovaCloud"]);
    expect(excluded).toContainEqual({ company: "LendBridge", reason: "different basis" });
  });

  it("excludes a non-USD money series by name (PeopleFlow GBP revenue)", () => {
    const { series, excluded } = buildAllCompaniesSeries(OVERLAY_CORPUS, "revenue_qtr");
    expect(series.map((s) => s.company)).toEqual(["NovaCloud"]);
    expect(excluded).toContainEqual({ company: "PeopleFlow", reason: "reported in GBP" });
  });

  it("does not list a company that simply never reports the metric (absent != excluded)", () => {
    // LendBridge reports no NRR at all → it is absent from BOTH series and excluded.
    const { series, excluded } = buildAllCompaniesSeries(OVERLAY_CORPUS, "net_revenue_retention_pct");
    const named = [...series.map((s) => s.company), ...excluded.map((e) => e.company)];
    expect(named).not.toContain("LendBridge");
  });
});

describe("metricsPresent", () => {
  it("lists every metric present anywhere, in canonical order", () => {
    // OVERLAY_CORPUS carries revenue_qtr, gross_margin_pct, net_revenue_retention_pct.
    expect(metricsPresent(OVERLAY_CORPUS)).toEqual([
      "revenue_qtr",
      "gross_margin_pct",
      "net_revenue_retention_pct",
    ]);
  });
});

describe("yDomain — standardized axes", () => {
  it("anchors money & counts at 0 (honest magnitude)", () => {
    expect(yDomain([24_100_000, 34_200_000], "arr_eop")).toEqual({ min: 0, max: 34_200_000 });
    expect(yDomain([78, 142], "headcount")).toEqual({ min: 0, max: 142 });
  });

  it("includes 0 as the ceiling for all-negative money (burn)", () => {
    expect(yDomain([-550_000, -980_000], "monthly_burn")).toEqual({ min: -980_000, max: 0 });
  });

  it("fits percentages to the nearest 5 (never squashed into a flat 0-based line)", () => {
    expect(yDomain([112, 123], "net_revenue_retention_pct")).toEqual({ min: 110, max: 125 });
    expect(yDomain([52, 78], "gross_margin_pct")).toEqual({ min: 50, max: 80 });
  });

  it("guards a degenerate (single-value / empty) domain", () => {
    expect(yDomain([100], "net_revenue_retention_pct")).toEqual({ min: 100, max: 105 });
    expect(yDomain([], "arr_eop")).toEqual({ min: 0, max: 1 });
  });
});

describe("formatAxisTick", () => {
  it("formats each axis endpoint by metric kind", () => {
    expect(formatAxisTick(0, "arr_eop")).toBe("$0");
    expect(formatAxisTick(34_200_000, "revenue_qtr")).toBe("$34.2M");
    expect(formatAxisTick(110, "net_revenue_retention_pct")).toBe("110%");
    expect(formatAxisTick(142, "headcount")).toBe("142");
  });
});
