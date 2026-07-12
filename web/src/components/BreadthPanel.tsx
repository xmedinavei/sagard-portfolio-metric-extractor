// Breadth panel (Phase 3, part 4 — the first-to-cut de-scope candidate, kept). A label-drift
// showcase: the 10 companies write the SAME metric under many different names ("End-of-Period
// ARR", "Contracted ARR", "Subscription ARR (end of period)", …) and the engine collapses
// each metric's varied wording into one comparable canonical ID. Honest — there is no open
// raw-tail, so no invented "other/unrecognized" bucket. Logic in ../lib/comparison
// (unit-tested); thin renderer here.

import type { MetricsExport } from "../types";
import { METRIC_LABELS } from "../lib/grid";
import { breadthByMetric, totalDistinctLabels } from "../lib/comparison";

export function BreadthPanel({ export: exp }: { export: MetricsExport }) {
  const entries = breadthByMetric(exp.metrics, exp.export_metadata.optional_metrics);
  if (entries.length === 0) return null;
  const total = totalDistinctLabels(entries);

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Source-terminology breadth</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        The portfolio uses <strong>{total}</strong> different source labels for{" "}
        <strong>{entries.length}</strong> canonical metrics. Each metric&apos;s varied wording
        is collapsed into one comparable ID — that is what makes the grid and trends line up.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr>
              <th style={thStyle}>Canonical metric</th>
              <th style={thStyle}># labels</th>
              <th style={{ ...thStyle, textAlign: "left" }}>Source labels seen</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.metric}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {METRIC_LABELS[entry.metric]}
                  {entry.isOptional && (
                    <span style={{ color: "#888", fontWeight: 400 }}> · optional</span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {entry.labels.length}
                </td>
                <td style={{ ...tdStyle, textAlign: "left", color: "#555" }}>
                  {entry.labels.join("; ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const thStyle = {
  border: "1px solid #e2e2e2",
  padding: "0.35rem 0.55rem",
  textAlign: "right" as const,
  background: "#fafafa",
};

const tdStyle = {
  border: "1px solid #e2e2e2",
  padding: "0.35rem 0.55rem",
  textAlign: "right" as const,
  verticalAlign: "top" as const,
};
