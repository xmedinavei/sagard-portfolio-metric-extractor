// Reconciliation panel (Phase 3, flagship #2 part 2) — an honest cross-source CHECK. When
// a metric appears in BOTH a company's own report and the portfolio summary, the backend
// keeps the company's number (primary source) and flags any disagreement. This panel shows
// how many numbers were cross-checked, how many agreed, and surfaces any that disagreed
// (company report retained, summary set aside, with the gap). All logic is in
// ../lib/comparison (unit-tested); this is a thin renderer.
//
// Live today: 0 disagreements, 22 confirmed matches — the check ran clean. (During the
// build it caught a real parser bug that made 4 companies read a prior-quarter column;
// see 03-comparison-safety-fixes.md.)

import type { CSSProperties } from "react";

import type { MetricsExport } from "../types";
import { METRIC_LABELS } from "../lib/grid";
import { reconciliationSummary, type ReconEntry } from "../lib/comparison";

function fmt(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString();
}

const clearBox: CSSProperties = {
  color: "#276749",
  background: "#f0fff4",
  border: "1px solid #c6f6d5",
  borderRadius: 6,
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
};

function ConflictCard({ entry }: { entry: ReconEntry }) {
  return (
    <div
      style={{
        border: "1px solid #f0dcae",
        background: "#fff8ec",
        borderRadius: 6,
        padding: "0.6rem 0.9rem",
        margin: "0.5rem 0",
        fontSize: "0.85rem",
      }}
    >
      <strong>{entry.company}</strong> —{" "}
      {entry.metric ? METRIC_LABELS[entry.metric] : "metric"}{" "}
      <span style={{ color: "#5b6472" }}>({entry.period})</span>
      <div style={{ marginTop: "0.3rem", fontVariantNumeric: "tabular-nums" }}>
        Company report <strong>{fmt(entry.observed)}</strong> kept · portfolio summary{" "}
        {fmt(entry.expected)} set aside · gap{" "}
        <strong style={{ color: "#8a4b00" }}>{fmt(entry.delta)}</strong>
      </div>
    </div>
  );
}

export function ReconciliationPanel({ export: exp }: { export: MetricsExport }) {
  const { conflicts, matchCount, checkedCount, resolvedConflictCount } = reconciliationSummary(
    exp.issues,
  );
  if (checkedCount === 0) return null; // nothing appears in two documents to reconcile

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Cross-source check</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0, maxWidth: 820 }}>
        <strong>Do the two documents agree?</strong> Some numbers show up in <em>both</em> a
        company&apos;s own report <em>and</em> the portfolio-wide summary. We check they match — and
        if they disagree, we trust the company&apos;s own report and flag the mismatch.{" "}
        <strong>{checkedCount}</strong> numbers appeared in both: <strong>{matchCount}</strong>{" "}
        agree, <strong>{conflicts.length}</strong> disagree.
      </p>

      {conflicts.length === 0 ? (
        <p role="status" style={clearBox}>
          ✓ All <strong>{matchCount}</strong> cross-checked numbers agree across both sources
          this quarter — no discrepancy to reconcile.
        </p>
      ) : (
        <>
          {conflicts.map((entry, i) => (
            <ConflictCard key={i} entry={entry} />
          ))}
          <p style={{ color: "#666", fontSize: "0.8rem" }}>
            On a disagreement the company&apos;s own report is retained (primary source) and
            the summary&apos;s copy is set aside — never silently averaged.
          </p>
        </>
      )}

      {resolvedConflictCount > 0 && (
        <p style={{ color: "#5b6472", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          Separately, <strong>{resolvedConflictCount}</strong> candidate{" "}
          {resolvedConflictCount === 1 ? "collision was" : "collisions were"} auto-resolved{" "}
          <em>within</em> individual reports (two candidate readings for one metric → the
          primary reading kept), so the figures above are already de-conflicted.
        </p>
      )}
    </section>
  );
}
