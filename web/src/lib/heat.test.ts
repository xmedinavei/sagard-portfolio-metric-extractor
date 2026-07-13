import { describe, expect, it } from "vitest";

import type { MetricRow } from "../types";
import { cellKey, latestByCompanyMetric } from "./grid";
import { heatColor, heatFraction, laggardKey, sectorHeat } from "./heat";

// Same MetricRow factory shape as grid.test.ts / trend.test.ts — harmless defaults so each
// test only states the fields it cares about.
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

describe("heatFraction — value → [0,1] with direction", () => {
  it("higher_better maps min→0 and max→1", () => {
    expect(heatFraction(112, 112, 123, "higher_better")).toBe(0);
    expect(heatFraction(123, 112, 123, "higher_better")).toBe(1);
    expect(heatFraction(118, 112, 123, "higher_better")).toBeCloseTo(6 / 11, 5);
  });

  it("lower_better inverts (least churn is best)", () => {
    expect(heatFraction(3.8, 3.8, 6.3, "lower_better")).toBe(1); // lowest churn → best
    expect(heatFraction(6.3, 3.8, 6.3, "lower_better")).toBe(0); // highest churn → worst
  });

  it("returns neutral 0.5 for a degenerate peer set (all equal)", () => {
    // Never paint a false green/red when there is nothing to rank against.
    expect(heatFraction(50, 50, 50, "higher_better")).toBe(0.5);
  });
});

describe("heatColor — pale red→amber→green scale", () => {
  it("anchors red at 0, amber at 0.5, green at 1, and clamps out-of-range", () => {
    expect(heatColor(0)).toBe("rgb(250, 219, 214)"); // red
    expect(heatColor(0.5)).toBe("rgb(254, 246, 214)"); // amber
    expect(heatColor(1)).toBe("rgb(209, 240, 216)"); // green
    expect(heatColor(-1)).toBe(heatColor(0)); // clamp low
    expect(heatColor(2)).toBe(heatColor(1)); // clamp high
  });
});

// The SaaS NRR league (Doc i §7): NovaCloud 123 (best) … ConstructIQ 112 (laggard), with
// PeopleFlow 118 correctly INCLUDED (NRR is a ratio — a GBP-computed ratio is still
// comparable, so currency never excludes it).
const NRR_LEAGUE: MetricRow[] = [
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "net_revenue_retention_pct", value: 123, unit: "percentage", display_value: "123%" }),
  mkRow({ company_name: "CarbonTrack", sector: "saas", canonical_metric: "net_revenue_retention_pct", value: 121, unit: "percentage", display_value: "121%" }),
  mkRow({ company_name: "PeopleFlow", sector: "saas", canonical_metric: "net_revenue_retention_pct", value: 118, unit: "percentage", display_value: "118%" }),
  mkRow({ company_name: "ConstructIQ", sector: "saas", canonical_metric: "net_revenue_retention_pct", value: 112, unit: "percentage", display_value: "112%" }),
];

describe("sectorHeat — within-sector, comparable-only tinting", () => {
  it("ranks the NRR league: best fraction 1, laggard fraction 0, PeopleFlow included", () => {
    const companies = ["CarbonTrack", "ConstructIQ", "NovaCloud", "PeopleFlow"];
    const heat = sectorHeat("saas", companies, latestByCompanyMetric(NRR_LEAGUE));
    expect(heat.get(cellKey("NovaCloud", "net_revenue_retention_pct"))?.fraction).toBe(1);
    expect(heat.get(cellKey("ConstructIQ", "net_revenue_retention_pct"))?.fraction).toBe(0);
    // PeopleFlow (a GBP company) IS heated for NRR — a ratio is currency-neutral.
    expect(heat.has(cellKey("PeopleFlow", "net_revenue_retention_pct"))).toBe(true);
  });

  it("never heats a refused cell (different basis)", () => {
    const rows = [
      mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "gross_margin_pct", value: 78, unit: "percentage", display_value: "78%" }),
      mkRow({ company_name: "CarbonTrack", sector: "saas", canonical_metric: "gross_margin_pct", value: 73, unit: "percentage", display_value: "73%" }),
      // a refused margin (interest-margin basis) must be left uncoloured — no honest peer scale.
      mkRow({ company_name: "OddCo", sector: "saas", canonical_metric: "gross_margin_pct", value: 60, unit: "percentage", display_value: "60%", comparison_status: "refused", metric_basis: "interest_margin" }),
    ];
    const heat = sectorHeat("saas", ["CarbonTrack", "NovaCloud", "OddCo"], latestByCompanyMetric(rows));
    expect(heat.has(cellKey("OddCo", "gross_margin_pct"))).toBe(false);
    expect(heat.has(cellKey("NovaCloud", "gross_margin_pct"))).toBe(true);
  });

  it("ranks only same-(newest)-period cells — a stale quarter is excluded from heat", () => {
    const rows = [
      mkRow({ company_name: "Current1", sector: "saas", canonical_metric: "revenue_qtr", period: "Q2 2025", value: 8_000_000, display_value: "$8.0M" }),
      mkRow({ company_name: "Current2", sector: "saas", canonical_metric: "revenue_qtr", period: "Q2 2025", value: 4_000_000, display_value: "$4.0M" }),
      // A company whose latest revenue is an OLDER quarter — must NOT be heat-ranked against
      // the current-quarter peers (cross-period comparison the tool must not make silently).
      mkRow({ company_name: "Stale", sector: "saas", canonical_metric: "revenue_qtr", period: "Q4 2024", value: 6_000_000, display_value: "$6.0M" }),
    ];
    const heat = sectorHeat("saas", ["Current1", "Current2", "Stale"], latestByCompanyMetric(rows));
    expect(heat.get(cellKey("Current1", "revenue_qtr"))?.fraction).toBe(1);
    expect(heat.get(cellKey("Current2", "revenue_qtr"))?.fraction).toBe(0);
    expect(heat.has(cellKey("Stale", "revenue_qtr"))).toBe(false);
  });

  it("never heats a non-USD money cell (PeopleFlow GBP revenue)", () => {
    const rows = [
      mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "revenue_qtr", value: 8_400_000, display_value: "$8.4M" }),
      mkRow({ company_name: "CarbonTrack", sector: "saas", canonical_metric: "revenue_qtr", value: 4_100_000, display_value: "$4.1M" }),
      mkRow({ company_name: "PeopleFlow", sector: "saas", canonical_metric: "revenue_qtr", value: 5_100_000, display_value: "5.1M" }),
    ];
    const heat = sectorHeat("saas", ["CarbonTrack", "NovaCloud", "PeopleFlow"], latestByCompanyMetric(rows));
    expect(heat.has(cellKey("PeopleFlow", "revenue_qtr"))).toBe(false); // GBP → not comparable
    expect(heat.has(cellKey("NovaCloud", "revenue_qtr"))).toBe(true);
  });

  it("applies the lower_better direction for churn (least churn tints best)", () => {
    const rows = [
      mkRow({ company_name: "CarbonTrack", sector: "saas", canonical_metric: "logo_churn_pct", value: 3.8, unit: "percentage", display_value: "3.8%" }),
      mkRow({ company_name: "ConstructIQ", sector: "saas", canonical_metric: "logo_churn_pct", value: 6.3, unit: "percentage", display_value: "6.3%" }),
    ];
    const heat = sectorHeat("saas", ["CarbonTrack", "ConstructIQ"], latestByCompanyMetric(rows));
    // least churn (3.8) is BEST → fraction 1; most churn (6.3) is WORST → fraction 0.
    expect(heat.get(cellKey("CarbonTrack", "logo_churn_pct"))?.fraction).toBe(1);
    expect(heat.get(cellKey("ConstructIQ", "logo_churn_pct"))?.fraction).toBe(0);
  });

  it("skips a metric with fewer than two comparable peers, and never heats headcount", () => {
    const rows = [
      // only one company has cash_balance → nothing to rank → skipped.
      mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "cash_balance", value: 19_600_000, display_value: "$19.6M" }),
      // headcount is neutral (size, not performance) → never heated even with two peers.
      mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "headcount", value: 142, unit: "count", display_value: "142" }),
      mkRow({ company_name: "CarbonTrack", sector: "saas", canonical_metric: "headcount", value: 78, unit: "count", display_value: "78" }),
    ];
    const heat = sectorHeat("saas", ["CarbonTrack", "NovaCloud"], latestByCompanyMetric(rows));
    expect(heat.has(cellKey("NovaCloud", "cash_balance"))).toBe(false);
    expect(heat.has(cellKey("NovaCloud", "headcount"))).toBe(false);
    expect(heat.has(cellKey("CarbonTrack", "headcount"))).toBe(false);
  });
});

describe("laggardKey — the explicit worst performer", () => {
  it("returns the lowest-NRR company in the sector", () => {
    const companies = ["CarbonTrack", "ConstructIQ", "NovaCloud", "PeopleFlow"];
    const key = laggardKey(companies, latestByCompanyMetric(NRR_LEAGUE));
    expect(key).toBe(cellKey("ConstructIQ", "net_revenue_retention_pct"));
  });

  it("returns null when there is only one comparable peer (nothing to rank)", () => {
    const rows = [
      mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "net_revenue_retention_pct", value: 123, unit: "percentage", display_value: "123%" }),
    ];
    expect(laggardKey(["NovaCloud"], latestByCompanyMetric(rows))).toBeNull();
  });

  it("returns null when all comparable peers tie (no genuine laggard)", () => {
    const rows = [
      mkRow({ company_name: "A", sector: "saas", canonical_metric: "net_revenue_retention_pct", value: 120, unit: "percentage", display_value: "120%" }),
      mkRow({ company_name: "B", sector: "saas", canonical_metric: "net_revenue_retention_pct", value: 120, unit: "percentage", display_value: "120%" }),
    ];
    expect(laggardKey(["A", "B"], latestByCompanyMetric(rows))).toBeNull();
  });
});
