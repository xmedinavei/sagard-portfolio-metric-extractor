// Sector-grouped RAG grid (Phase 1). Companies (rows) × canonical metrics (columns),
// grouped by sector in SECTOR_ORDER, each cell showing the latest-period value. All
// rendering decisions come from the pure classifier in ../lib/grid so they stay
// unit-testable. Visual RAG colouring is the deferred P5.1 polish pass; Phase 1 owns
// the structure + the two honesty affordances (N/A-by-sector and "not ranked").

import type { CSSProperties } from "react";

import type { MetricsExport } from "../types";
import {
  CANONICAL_METRIC_ORDER,
  METRIC_LABELS,
  SECTOR_LABELS,
  classifyCell,
  groupCompaniesBySector,
  latestByCompanyMetric,
  sectorApplicableMetrics,
  cellText,
  type Cell,
} from "../lib/grid";

const cellBase: CSSProperties = {
  border: "1px solid #e2e2e2",
  padding: "0.35rem 0.55rem",
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

function cellStyle(cell: Cell): CSSProperties {
  if (cell.kind === "na") return { ...cellBase, color: "#aaa", fontStyle: "italic" };
  if (cell.kind === "gap") return { ...cellBase, color: "#c77700" };
  if (cell.notRanked) return { ...cellBase, color: "#555" };
  return cellBase;
}

function CellValue({ cell }: { cell: Cell }) {
  const text = cellText(cell);
  if (cell.kind === "value" && cell.notRanked) {
    // A real number on a different basis (credit gross margin = interest margin).
    // Shown, but explicitly not ranked against the sector's peers. Phase 3 tells the
    // full refuse-to-compare story; here the grid must already not rank it.
    return (
      <span title="Different basis (interest margin) — not comparable to sector peers">
        {text} <span style={{ fontSize: "0.75em", color: "#888" }}>· not ranked</span>
      </span>
    );
  }
  if (cell.kind === "na") {
    return <span title="Not applicable to this sector">{text}</span>;
  }
  if (cell.kind === "gap") {
    return <span title="No value reported for this company (genuine gap)">{text}</span>;
  }
  return <span>{text}</span>;
}

export function RagGrid({ export: exp }: { export: MetricsExport }) {
  const metrics = exp.metrics;
  const groups = groupCompaniesBySector(metrics);
  const latest = latestByCompanyMetric(metrics);
  // Pass issues so a backend-flagged missing metric reads as a gap, not a false N/A.
  const applicable = sectorApplicableMetrics(metrics, exp.issues);

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Metrics by sector</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        Latest reported quarter per company. <em>N/A</em> = the metric does not apply to
        that sector; <em>—</em> = a genuine gap for that company; <em>not ranked</em> = a
        real number measured on a different basis.
      </p>

      {groups.map((group) => (
        <div key={group.sector} style={{ margin: "1rem 0", overflowX: "auto" }}>
          <h3 style={{ fontSize: "1rem", margin: "0 0 0.4rem" }}>
            {SECTOR_LABELS[group.sector]}{" "}
            <span style={{ color: "#888", fontWeight: 400 }}>
              ({group.companies.length}{" "}
              {group.companies.length === 1 ? "company" : "companies"})
            </span>
          </h3>
          <table style={{ borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th style={{ ...cellBase, textAlign: "left" }}>Company</th>
                {CANONICAL_METRIC_ORDER.map((metric) => (
                  <th key={metric} style={cellBase}>
                    {METRIC_LABELS[metric]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.companies.map((company) => (
                <tr key={company}>
                  <td style={{ ...cellBase, textAlign: "left", fontWeight: 600 }}>
                    {company}
                  </td>
                  {CANONICAL_METRIC_ORDER.map((metric) => {
                    const cell = classifyCell(
                      company,
                      metric,
                      group.sector,
                      latest,
                      applicable,
                    );
                    return (
                      <td key={metric} style={cellStyle(cell)}>
                        <CellValue cell={cell} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
