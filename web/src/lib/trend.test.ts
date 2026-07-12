import { describe, expect, it } from "vitest";

import type { MetricRow } from "../types";
import {
  buildSeries,
  distinctCompanies,
  hasSufficientHistory,
  metricsForCompany,
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
