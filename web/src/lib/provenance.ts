// Pure, React-free logic for the provenance drawer (Phase 4 — "trust the numbers").
//
// The drawer answers one question for any number in the cockpit: "where did this come
// from?" Everything the drawer can get *wrong* — how confidence is formatted, whether a
// page number is (honestly) shown — lives here so it is unit-testable without a DOM, the
// same lib/component split every web/src/lib/*.ts file follows. The .tsx drawer stays a
// thin renderer of what this returns.
//
// Binds only the frozen 00-foundations.md §A.4 provenance fields; never the 3 RESERVED
// ones (currency, comparison_status === "unchecked", code === "unrecognized_label").

import type { MetricRow } from "../types";

// The export's `confidence` is a 0.0–1.0 FRACTION (live golden range 0.9035–0.995), not a
// 0–100 number. We render it as a percentage with one decimal so a 90.3% row is
// distinguishable from a 99.5% one. Clamped to [0, 1] defensively, in case a future parser
// ever emits an out-of-range score — a UI must never print "-20%" or "150%".
export function formatConfidence(confidence: number): string {
  const clamped = Math.max(0, Math.min(1, confidence));
  return `${(clamped * 100).toFixed(1)}%`;
}

// The honest granularity label (DEC-C). Provenance is FILE-level in v1. NOTE: the local
// parser DOES populate `source_page` on live rows (a single-metric-table pack reads as page
// 1; a multi-page pack can read 2) — but page/sentence anchoring is a roadmap upgrade we do
// not claim yet, so v1 deliberately reports file-level only and never surfaces that page
// number (see `provenanceView`). Saying "file-level" while the drawer printed "· p. 1" would
// contradict the pitch; we keep the label and the drawer consistent.
export const PROVENANCE_GRANULARITY_LABEL = "source file (file-level)";

// The drawer's display-ready payload. A plain projection of one MetricRow's provenance
// fields, with the two values that need computing (confidence %, the optional page line).
export interface ProvenanceView {
  sourceFile: string;
  rawLabel: string; // the source's own wording for this number (label drift lives here)
  rawValueText: string; // the value exactly as printed in the source
  displayValue: string; // the backend's canonical rendering (what the grid/trend show)
  value: number | null; // the numeric value (null is NOT zero — §A.4)
  confidencePct: string; // e.g. "99.0%"
  snippet: string; // the source excerpt the value was read from
  // Always null in v1: provenance is FILE-level (DEC-C), so the drawer shows NO page line
  // even though the parser populates `source_page`. This is the single line that flips when
  // true page/sentence provenance ships.
  pageDisplay: string | null;
  granularityLabel: string; // always the file-level label in v1
}

export function provenanceView(row: MetricRow): ProvenanceView {
  return {
    sourceFile: row.source_file,
    rawLabel: row.raw_label,
    rawValueText: row.raw_value_text,
    displayValue: row.display_value,
    value: row.value,
    confidencePct: formatConfidence(row.confidence),
    snippet: row.source_snippet,
    // v1 commits to file-level provenance: suppress the parser's `source_page` (live rows
    // carry page 1) so the drawer never shows a page number the pitch calls roadmap.
    pageDisplay: null,
    granularityLabel: PROVENANCE_GRANULARITY_LABEL,
  };
}
