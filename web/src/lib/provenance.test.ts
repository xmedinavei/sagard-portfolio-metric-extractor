import { describe, expect, it } from "vitest";

import type { MetricRow } from "../types";
import {
  PROVENANCE_GRANULARITY_LABEL,
  formatConfidence,
  provenanceView,
} from "./provenance";

// Full 23-field MetricRow with sensible defaults; each test overrides only what matters
// (same factory pattern as grid.test.ts / trend.test.ts / comparison.test.ts). Defaults
// mirror a real live row (NovaCloud ARR, the flagship number a demo clicks first).
function mkRow(over: Partial<MetricRow> = {}): MetricRow {
  return {
    company_name: "NovaCloud",
    period: "Q2 2025",
    canonical_metric: "arr_eop",
    value: 34_200_000,
    unit: "usd",
    display_value: "$34.2M",
    raw_label: "ARR (End of Period)",
    raw_value_text: "$34.2M",
    source_file: "NovaCloud_Q2_2025.pdf",
    source_page: null,
    source_snippet: "| ARR (End of Period) | $34.2M |",
    document_type: "company_report",
    confidence: 0.9902,
    parsing_method: "local",
    detection_method: "table_row",
    metric_basis: "period_end",
    notes: [],
    is_valid: true,
    parse_error: null,
    sector: "saas",
    value_normalized: null,
    currency: null,
    comparison_status: "comparable",
    ...over,
  };
}

describe("formatConfidence", () => {
  it("renders a 0.0-1.0 fraction as a one-decimal percentage", () => {
    // The live golden range is 0.9035-0.995 — one decimal keeps them distinguishable.
    expect(formatConfidence(0.9902)).toBe("99.0%");
    // 0.9035 * 100 is 90.34999... in IEEE-754 (not exactly 90.35), so toFixed(1) floors to
    // "90.3" — the honest float result. A 0.1% wobble is immaterial for a confidence badge.
    expect(formatConfidence(0.9035)).toBe("90.3%");
    expect(formatConfidence(1)).toBe("100.0%");
    expect(formatConfidence(0)).toBe("0.0%");
  });

  it("clamps out-of-range scores so the UI never prints a nonsense percent", () => {
    expect(formatConfidence(1.5)).toBe("100.0%");
    expect(formatConfidence(-0.2)).toBe("0.0%");
  });
});

describe("provenanceView", () => {
  it("projects every provenance field the drawer shows", () => {
    const view = provenanceView(mkRow());
    expect(view.sourceFile).toBe("NovaCloud_Q2_2025.pdf");
    expect(view.rawLabel).toBe("ARR (End of Period)");
    expect(view.rawValueText).toBe("$34.2M");
    expect(view.displayValue).toBe("$34.2M");
    expect(view.value).toBe(34_200_000);
    expect(view.confidencePct).toBe("99.0%");
    expect(view.snippet).toBe("| ARR (End of Period) | $34.2M |");
  });

  it("shows file-level provenance and NO page number when source_page is null (the norm)", () => {
    // 116/116 live rows have source_page === null — DEC-C file-level provenance. The
    // drawer must not invent a page; pageDisplay stays null so the component renders none.
    const view = provenanceView(mkRow({ source_page: null }));
    expect(view.pageDisplay).toBeNull();
    expect(view.granularityLabel).toBe(PROVENANCE_GRANULARITY_LABEL);
    expect(view.granularityLabel).toBe("source file (file-level)");
  });

  it("shows a page line only if the backend ever populates a real page (forward-compat)", () => {
    // Not v1 (source_page is always null today), but the projection must be honest if it
    // ever isn't — so a real page number surfaces rather than being silently dropped.
    const view = provenanceView(mkRow({ source_page: 4 }));
    expect(view.pageDisplay).toBe("p. 4");
  });

  it("passes a null value through unchanged (a null value is not a zero)", () => {
    const view = provenanceView(mkRow({ value: null, display_value: "—" }));
    expect(view.value).toBeNull();
    expect(view.displayValue).toBe("—");
  });

  it("passes an empty snippet through as empty (the drawer then renders no excerpt box)", () => {
    // 116/116 live rows carry a snippet, but the projection must be honest if one is ever
    // empty — it returns "" (not a placeholder), and the drawer guards the excerpt block.
    const view = provenanceView(mkRow({ source_snippet: "" }));
    expect(view.snippet).toBe("");
  });
});
