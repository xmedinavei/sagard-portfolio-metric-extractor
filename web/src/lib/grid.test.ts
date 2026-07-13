import { describe, expect, it } from "vitest";

import type { IssueRow, MetricRow } from "../types";
import {
  cellKey,
  cellText,
  classifyCell,
  formatUsdShort,
  groupCompaniesBySector,
  latestByCompanyMetric,
  nonUsdCurrency,
  operatingValueView,
  parsePeriodKey,
  reportingCurrency,
  sectorApplicableMetrics,
} from "./grid";

// A MetricRow factory: fills the 23 §A.4 fields with harmless defaults so each test
// only states the handful of fields it cares about. `over` wins over the defaults.
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

// A compact stand-in for the live corpus, shaped to exercise every branch:
// - NovaCloud reports arr_eop across 5 out-of-order quarters (latest-period test)
//   and monthly_burn (so monthly_burn is "applicable" in saas).
// - PeopleFlow reports arr_eop but NOT monthly_burn (a genuine per-company gap).
// - LendBridge (credit) has a refused gross margin (interest margin) + revenue.
// - ApexFreight (marketplace) and ClearPay (payments) round out the four sectors.
const FIXTURE: MetricRow[] = [
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q2 2024", value: 24_100_000, display_value: "$24.1M" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q4 2024", value: 29_100_000, display_value: "$29.1M" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q2 2025", value: 34_200_000, display_value: "$34.2M" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q1 2025", value: 31_600_000, display_value: "$31.6M" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "arr_eop", period: "Q3 2024", value: 26_800_000, display_value: "$26.8M" }),
  mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "monthly_burn", period: "Q2 2025", value: 4_200_000, display_value: "4.2M" }),
  mkRow({ company_name: "PeopleFlow", sector: "saas", canonical_metric: "arr_eop", period: "Q2 2025", value: 12_000_000, display_value: "$12.0M" }),
  mkRow({ company_name: "LendBridge", sector: "credit", canonical_metric: "gross_margin_pct", period: "Q2 2025", value: 62, unit: "percentage", display_value: "62%", comparison_status: "refused", metric_basis: "interest_margin" }),
  mkRow({ company_name: "LendBridge", sector: "credit", canonical_metric: "revenue_qtr", period: "Q2 2025", value: 8_000_000, display_value: "$8.0M" }),
  mkRow({ company_name: "ApexFreight", sector: "marketplace", canonical_metric: "revenue_qtr", period: "Q2 2025", value: 9_300_000, display_value: "9.3M" }),
  mkRow({ company_name: "ClearPay", sector: "payments", canonical_metric: "cash_balance", period: "Q2 2025", value: 5_100_000, display_value: "$5.1M" }),
];

// An IssueRow factory (13 §A.4 fields) for the missing_metric applicability path.
function mkIssue(
  over: Pick<IssueRow, "code" | "company_name" | "canonical_metric"> & Partial<IssueRow>,
): IssueRow {
  return {
    severity: "warning",
    message: "",
    source_file: "x.pdf",
    source_page: null,
    raw_label: null,
    raw_value_text: null,
    period: null,
    expected_value: null,
    observed_value: null,
    delta: null,
    ...over,
  };
}

// The backend flags ApexFreight (marketplace) as missing cash_balance — an expected
// metric that no marketplace company happens to report. It must read as a gap, not N/A.
const ISSUES: IssueRow[] = [
  mkIssue({ code: "missing_metric", company_name: "ApexFreight", canonical_metric: "cash_balance" }),
];

describe("parsePeriodKey", () => {
  it("orders by year first, then quarter — Q2 2025 is later than Q4 2024", () => {
    expect(parsePeriodKey("Q2 2025")).toBeGreaterThan(parsePeriodKey("Q4 2024"));
    expect(parsePeriodKey("Q4 2024")).toBeGreaterThan(parsePeriodKey("Q1 2024"));
    expect(parsePeriodKey(null)).toBe(-1);
    expect(parsePeriodKey("garbage")).toBe(-1);
  });
});

describe("groupCompaniesBySector", () => {
  it("groups companies under their sector, ordered by SECTOR_ORDER", () => {
    const groups = groupCompaniesBySector(FIXTURE);
    expect(groups.map((g) => g.sector)).toEqual([
      "saas",
      "credit",
      "marketplace",
      "payments",
    ]);
    expect(groups.find((g) => g.sector === "saas")?.companies).toEqual([
      "NovaCloud",
      "PeopleFlow",
    ]);
    expect(groups.find((g) => g.sector === "credit")?.companies).toEqual(["LendBridge"]);
  });
});

describe("latestByCompanyMetric", () => {
  it("selects the TRUE latest quarter (year-aware), not the lexical max", () => {
    const latest = latestByCompanyMetric(FIXTURE);
    const cell = latest.get(cellKey("NovaCloud", "arr_eop"));
    // A naive string max() would wrongly pick "Q4 2024" ($29.1M); the real latest is
    // "Q2 2025" ($34.2M). This is the single most important correctness guard.
    expect(cell?.period).toBe("Q2 2025");
    expect(cell?.value).toBe(34_200_000);
    expect(cell?.display_value).toBe("$34.2M");
  });
});

describe("reporting currency (Trap C — currency)", () => {
  it("defaults to USD but marks a known non-USD company", () => {
    expect(reportingCurrency("NovaCloud")).toBe("USD");
    expect(reportingCurrency("PeopleFlow")).toBe("GBP");
  });

  it("flags a non-USD MONEY metric, but never a percentage/count or a USD company", () => {
    // PeopleFlow's money levels are GBP → flagged; a ratio (NRR) or count (headcount) is
    // never currency-flagged (you don't FX a percentage); USD companies are never flagged.
    expect(nonUsdCurrency("PeopleFlow", "revenue_qtr")).toBe("GBP");
    expect(nonUsdCurrency("PeopleFlow", "arr_eop")).toBe("GBP");
    expect(nonUsdCurrency("PeopleFlow", "net_revenue_retention_pct")).toBeNull();
    expect(nonUsdCurrency("PeopleFlow", "gross_margin_pct")).toBeNull();
    expect(nonUsdCurrency("PeopleFlow", "headcount")).toBeNull();
    expect(nonUsdCurrency("NovaCloud", "revenue_qtr")).toBeNull();
  });
});

describe("operating cash (Trap C — ClearPay $38.4M → $32.2M)", () => {
  it("formats a raw USD amount as short $X.XM", () => {
    expect(formatUsdShort(32_200_000)).toBe("$32.2M");
    expect(formatUsdShort(38_400_000)).toBe("$38.4M");
  });

  it("surfaces the basis-adjusted value + note when value_normalized differs", () => {
    // ClearPay's cash_balance: headline $38.4M, but $6.2M is restricted client money it
    // cannot spend, so the backend already computed operating cash = $32.2M. The tool must
    // SHOW that, not hide it.
    const clearpay = mkRow({
      company_name: "ClearPay", sector: "payments", canonical_metric: "cash_balance",
      value: 38_400_000, display_value: "$38.4M", value_normalized: 32_200_000,
    });
    const view = operatingValueView(clearpay);
    expect(view?.text).toBe("$32.2M");
    expect(view?.note).toContain("operating");
  });

  it("returns null for an ordinary row (no adjustment) and when normalized equals headline", () => {
    const plain = mkRow({ company_name: "NovaCloud", sector: "saas", canonical_metric: "cash_balance", value: 19_600_000, display_value: "$19.6M" });
    expect(operatingValueView(plain)).toBeNull();
    const equal = mkRow({ company_name: "X", sector: "saas", canonical_metric: "cash_balance", value: 100, value_normalized: 100 });
    expect(operatingValueView(equal)).toBeNull();
  });

  it("returns null when the headline value itself is null (defensive branch)", () => {
    const noHeadline = mkRow({ company_name: "X", sector: "saas", canonical_metric: "cash_balance", value: null, value_normalized: 100 });
    expect(operatingValueView(noHeadline)).toBeNull();
  });

  it("never labels a non-USD company's normalized figure with a $ (currency guard)", () => {
    // PeopleFlow reports in GBP; even if it carried a value_normalized we must NOT print "$".
    const gbp = mkRow({ company_name: "PeopleFlow", sector: "saas", canonical_metric: "cash_balance", value: 5_000_000, value_normalized: 4_500_000 });
    expect(operatingValueView(gbp)).toBeNull();
  });
});

describe("classifyCell — honesty affordances", () => {
  const latest = latestByCompanyMetric(FIXTURE);
  const applicable = sectorApplicableMetrics(FIXTURE);

  it("renders N/A for a metric no company in the sector reports", () => {
    // No credit company reports arr_eop → structurally not applicable.
    const cell = classifyCell("LendBridge", "arr_eop", "credit", latest, applicable);
    expect(cell.kind).toBe("na");
    expect(cellText(cell)).toBe("N/A");
  });

  it("distinguishes a genuine per-company gap (—) from N/A", () => {
    // monthly_burn IS applicable in saas (NovaCloud reports it), but PeopleFlow has no
    // row — a real gap, NOT a structural N/A. This is the "zero false missing" rule.
    const cell = classifyCell("PeopleFlow", "monthly_burn", "saas", latest, applicable);
    expect(cell.kind).toBe("gap");
    expect(cellText(cell)).toBe("—");
  });

  it("shows a refused metric as a real value but marks it not-ranked", () => {
    const cell = classifyCell("LendBridge", "gross_margin_pct", "credit", latest, applicable);
    expect(cell.kind).toBe("value");
    expect(cell.notRanked).toBe(true);
    expect(cellText(cell)).toBe("62%");
  });

  it("shows an ordinary comparable metric as a plain value", () => {
    const cell = classifyCell("NovaCloud", "arr_eop", "saas", latest, applicable);
    expect(cell.kind).toBe("value");
    expect(cell.notRanked).toBe(false);
    expect(cellText(cell)).toBe("$34.2M");
  });

  it("treats a backend-flagged missing metric as a gap, not N/A", () => {
    // No marketplace company reports cash_balance, but the backend flags it missing for
    // ApexFreight -> it is EXPECTED there, so the empty cell is a genuine gap (—), never
    // "not applicable to this sector". This is the honesty fix for success #5.
    const withIssues = sectorApplicableMetrics(FIXTURE, ISSUES);
    const cell = classifyCell("ApexFreight", "cash_balance", "marketplace", latest, withIssues);
    expect(cell.kind).toBe("gap");
    expect(cellText(cell)).toBe("—");
  });

  it("still marks a genuinely sector-inapplicable metric as N/A", () => {
    // arr_eop is SaaS-specific; no marketplace company reports it and none is flagged
    // missing for it -> genuinely not applicable to the sector.
    const withIssues = sectorApplicableMetrics(FIXTURE, ISSUES);
    const cell = classifyCell("ApexFreight", "arr_eop", "marketplace", latest, withIssues);
    expect(cell.kind).toBe("na");
    expect(cellText(cell)).toBe("N/A");
  });
});
