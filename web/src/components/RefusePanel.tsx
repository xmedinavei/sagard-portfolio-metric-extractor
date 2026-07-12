// Refuse-to-compare panel (Phase 3, flagship #2 part 1). Surfaces the metrics the backend
// refused to rank because they were measured on a different basis (a credit lender's
// "gross margin" is really an interest margin, not comparable to SaaS gross margins). All
// filtering lives in ../lib/comparison so it stays unit-tested; this is a thin renderer.

import type { MetricsExport, MetricRow } from "../types";
import { METRIC_LABELS } from "../lib/grid";
import { INTEREST_MARGIN_BASIS, basisCollisionIssues, refusedRows } from "../lib/comparison";

// The refusal reason, derived from the row's own basis (data-driven, not hardcoded) so it
// stays honest if a future refusal is on a different basis than interest margin.
function refusalReason(row: MetricRow): string {
  if (row.metric_basis === INTEREST_MARGIN_BASIS) {
    return "refused: different basis (interest margin vs gross margin)";
  }
  return "refused: different basis (not comparable to sector peers)";
}

export function RefusePanel({
  export: exp,
  onSelectRow,
}: {
  export: MetricsExport;
  // Optional (Phase 4): make the refused numbers click-to-source too, so the flagship-#2
  // "we won't rank this" moment is one click from the source that proves the different
  // basis. Absent = the panel renders exactly as in Phase 3.
  onSelectRow?: (row: MetricRow) => void;
}) {
  const refused = refusedRows(exp.metrics);
  const collisions = basisCollisionIssues(exp.issues);
  if (refused.length === 0) return null;

  // Group the refused rows by company (the basis_collision issue leaves company_name null,
  // so the company must come from these rows, not the issue).
  const byCompany = new Map<string, MetricRow[]>();
  for (const row of refused) {
    const list = byCompany.get(row.company_name) ?? [];
    list.push(row);
    byCompany.set(row.company_name, list);
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Refused comparisons</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        Numbers we <strong>will not rank</strong> against sector peers because they are
        measured on a different basis. Showing them — but honestly flagged — beats silently
        comparing apples to oranges.
      </p>

      {collisions.map((issue, i) => (
        <p
          key={i}
          role="status"
          style={{
            color: "#8a4b00",
            background: "#fff8ec",
            border: "1px solid #f0dcae",
            borderRadius: 6,
            padding: "0.6rem 0.9rem",
            fontSize: "0.85rem",
          }}
        >
          {issue.message}
        </p>
      ))}

      {[...byCompany.entries()].map(([company, rows]) => (
        <div key={company} style={{ margin: "0.75rem 0" }}>
          <h3 style={{ fontSize: "1rem", margin: "0 0 0.35rem" }}>
            {company}{" "}
            <span style={{ color: "#888", fontWeight: 400, fontSize: "0.85rem" }}>
              ({rows.length} refused {rows.length === 1 ? "row" : "rows"})
            </span>
          </h3>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
            {rows.map((row, i) => (
              <li key={i} style={{ margin: "0.15rem 0" }}>
                <strong>{METRIC_LABELS[row.canonical_metric]}</strong>{" "}
                <span
                  style={
                    onSelectRow
                      ? {
                          fontVariantNumeric: "tabular-nums",
                          cursor: "pointer",
                          textDecoration: "underline dotted",
                        }
                      : { fontVariantNumeric: "tabular-nums" }
                  }
                  role={onSelectRow ? "button" : undefined}
                  tabIndex={onSelectRow ? 0 : undefined}
                  title={onSelectRow ? "Click to see the source of this number" : undefined}
                  onClick={onSelectRow ? () => onSelectRow(row) : undefined}
                  onKeyDown={
                    onSelectRow
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectRow(row);
                          }
                        }
                      : undefined
                  }
                >
                  {row.display_value}
                </span>{" "}
                <span style={{ color: "#888" }}>({row.period})</span> —{" "}
                <span style={{ color: "#8a4b00" }}>{refusalReason(row)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
