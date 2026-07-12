// Provenance drawer (Phase 4 — "trust the numbers"). A slide-over that opens when the
// user clicks any number in the cockpit (a grid cell from Phase 1, a trend point from
// Phase 2) and shows where that number came from: the source file, the source's own label
// and value text, the confidence, and the excerpt it was read from. Provenance is FILE
// level in v1 (source_page is null on every live row — DEC-C), so we say so honestly and
// never show a page number. All display logic lives in ../lib/provenance (unit-tested);
// this file is a thin renderer + the open/close shell.

import { useEffect } from "react";

import type { MetricRow } from "../types";
import { METRIC_LABELS } from "../lib/grid";
import { provenanceView } from "../lib/provenance";

// One labelled provenance field (a term/definition pair).
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: "0.7rem 0" }}>
      <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#888" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.9rem", color: "#222", marginTop: "0.15rem", wordBreak: "break-word" }}>
        {children}
      </div>
    </div>
  );
}

export function ProvenanceDrawer({
  row,
  onClose,
}: {
  row: MetricRow | null;
  onClose: () => void;
}) {
  // Esc closes the drawer. The effect is a no-op (adds no listener) when nothing is open,
  // and cleans up its listener whenever `row` changes or the drawer unmounts.
  useEffect(() => {
    if (!row) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [row, onClose]);

  if (!row) return null;
  const p = provenanceView(row);

  return (
    // Backdrop — clicking it (outside the panel) closes the drawer.
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.28)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 1000,
      }}
    >
      {/* The panel. stopPropagation so a click inside does NOT close it. */}
      <aside
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label="Source provenance"
        style={{
          width: "min(440px, 92vw)",
          height: "100%",
          background: "#fff",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.18)",
          padding: "1.25rem 1.4rem",
          overflowY: "auto",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Source</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "none",
              fontSize: "1.4rem",
              lineHeight: 1,
              cursor: "pointer",
              color: "#888",
            }}
          >
            ×
          </button>
        </div>

        {/* What number this is: the canonical metric, company, period + the shown value. */}
        <p style={{ color: "#666", fontSize: "0.85rem", margin: "0.35rem 0 0" }}>
          {METRIC_LABELS[row.canonical_metric]} — <strong>{row.company_name}</strong>
          {row.period ? ` · ${row.period}` : ""}
        </p>
        <div style={{ fontSize: "1.7rem", fontWeight: 600, margin: "0.5rem 0 0.25rem", fontVariantNumeric: "tabular-nums" }}>
          {p.displayValue}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "0.9rem 0" }} />

        <Field label="Source file">
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem" }}>{p.sourceFile}</span>
        </Field>
        <Field label="Reported as (source's own label)">"{p.rawLabel}"</Field>
        <Field label="Reported value (as printed)">
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{p.rawValueText}</span>
        </Field>
        <Field label="Confidence">{p.confidencePct}</Field>
        <Field label="Provenance granularity">
          {p.granularityLabel}
          {p.pageDisplay ? ` · ${p.pageDisplay}` : ""}
        </Field>

        {/* Only shown when there IS an excerpt (116/116 live rows have one; guard is
            defensive so a rare empty snippet never renders an empty box). */}
        {p.snippet.trim() !== "" && (
          <Field label="Source excerpt">
            <pre
              style={{
                margin: "0.2rem 0 0",
                padding: "0.6rem 0.7rem",
                background: "#f7f7f8",
                border: "1px solid #ececef",
                borderRadius: 6,
                fontSize: "0.8rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "ui-monospace, monospace",
                color: "#333",
              }}
            >
              {p.snippet}
            </pre>
          </Field>
        )}

        <p style={{ color: "#999", fontSize: "0.75rem", marginTop: "1rem" }}>
          Every number in the cockpit is one click from its source. Provenance is file-level
          in v1 — page/sentence anchoring is on the roadmap.
        </p>
      </aside>
    </div>
  );
}
