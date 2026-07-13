// Sector-grouped RAG grid (Phase 1). Companies (rows) × canonical metrics (columns),
// grouped by sector in SECTOR_ORDER, each cell showing the latest-period value. All
// rendering decisions come from the pure classifier in ../lib/grid so they stay
// unit-testable. Visual RAG colouring is the deferred P5.1 polish pass; Phase 1 owns
// the structure + the two honesty affordances (N/A-by-sector and "not ranked").

import type { CSSProperties } from "react";

import type { MetricRow, MetricsExport } from "../types";
import {
  CANONICAL_METRIC_ORDER,
  CURRENCY_SYMBOL,
  METRIC_LABELS,
  SECTOR_LABELS,
  cellKey,
  classifyCell,
  groupCompaniesBySector,
  latestByCompanyMetric,
  nonUsdCurrency,
  operatingValueView,
  sectorApplicableMetrics,
  cellText,
  type Cell,
  type OperatingValueView,
} from "../lib/grid";
import { laggardKey, sectorHeat } from "../lib/heat";

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

function CellValue({
  cell,
  currency,
  operating,
  isLaggard,
}: {
  cell: Cell;
  currency?: string | null;
  // The one basis-adjusted figure on the corpus (ClearPay operating cash) — shown as a small
  // sub-line under the headline so the tool SHOWS what it caught (Trap C).
  operating?: OperatingValueView | null;
  // The explicit sector laggard (lowest NRR) — a small ▼ tag reinforcing the red heat tint.
  isLaggard?: boolean;
}) {
  const text = cellText(cell);
  if (cell.kind === "value" && currency) {
    // A real number reported in a non-USD currency (PeopleFlow = GBP). Shown with its own
    // currency symbol and explicitly NOT comparable to the USD column — the tool refuses the
    // silent cross-currency comparison instead of committing it. FX conversion is roadmap.
    const symbol = CURRENCY_SYMBOL[currency] ?? "";
    // Prefix the symbol only if the backend display didn't already carry one (non-USD levels
    // print bare, e.g. "5.1M" -> "£5.1M"); never double up a "$"/"£"/"€".
    const shown = symbol && !/^[£$€]/.test(text) ? `${symbol}${text}` : text;
    return (
      <span title={`Reported in ${currency} — not comparable to the USD column`}>
        {shown}{" "}
        <span style={{ fontSize: "0.75em", color: "#888" }}>· not comparable ({currency})</span>
      </span>
    );
  }
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
  // A plain comparable value — it may carry a basis-adjusted operating figure (ClearPay)
  // and/or the sector-laggard tag.
  return (
    <span>
      {text}
      {isLaggard && (
        <span
          title="Lowest in its sector on this metric — the laggard"
          style={{ fontSize: "0.72em", color: "#b45309", marginLeft: "0.35rem" }}
        >
          ▼ laggard
        </span>
      )}
      {operating && (
        <span
          title={operating.note}
          style={{ display: "block", fontSize: "0.72em", color: "#2f7a46" }}
        >
          · {operating.text} operating
        </span>
      )}
    </span>
  );
}

export function RagGrid({
  export: exp,
  onSelectRow,
}: {
  export: MetricsExport;
  // Optional (Phase 4): clicking a value cell reports its source row so App can open the
  // provenance drawer. Absent = the grid renders and behaves exactly as in Phase 1.
  onSelectRow?: (row: MetricRow) => void;
}) {
  const metrics = exp.metrics;
  const groups = groupCompaniesBySector(metrics);
  const latest = latestByCompanyMetric(metrics);
  // Pass issues so a backend-flagged missing metric reads as a gap, not a false N/A.
  const applicable = sectorApplicableMetrics(metrics, exp.issues);

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Metrics by sector</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        Latest reported quarter per company. Cells are heat-shaded green → red{" "}
        <em>within each sector</em> (best → worst on comparable metrics); ▼ marks the sector
        laggard. <em>N/A</em> = the metric does not apply to that sector; <em>—</em> = a
        genuine gap for that company; <em>not ranked</em> = a real number measured on a
        different basis; <em>not comparable (GBP)</em> = reported in a non-USD currency, so it
        is not ranked against the USD column.
      </p>

      {groups.map((group) => {
        // Heat + laggard are computed PER SECTOR — never across sectors — so a company is
        // only ever ranked against genuine peers (comparability, the whole thesis).
        const heat = sectorHeat(group.sector, group.companies, latest);
        const laggard = laggardKey(group.companies, latest);
        return (
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
                    // Only a real value cell is a provenance target — N/A and gap cells
                    // have no source row to open.
                    const openRow = cell.kind === "value" ? cell.row : null;
                    const clickable = openRow !== null && !!onSelectRow;
                    const open = () => {
                      if (openRow && onSelectRow) onSelectRow(openRow);
                    };
                    // Non-USD money value (PeopleFlow GBP): flag + mute like a not-ranked
                    // cell so it never reads as comparable to the USD peers.
                    const currency =
                      cell.kind === "value" ? nonUsdCurrency(company, metric) : null;
                    // RAG heat (V1): `heat` already excludes refused + non-USD cells, so it
                    // is defined ONLY for a genuinely rankable value — never fighting the
                    // currency / not-ranked styling below.
                    const heatCell =
                      cell.kind === "value" ? heat.get(cellKey(company, metric)) : undefined;
                    // The one basis-adjusted figure on the corpus (ClearPay operating cash).
                    const operating =
                      cell.kind === "value" && cell.row ? operatingValueView(cell.row) : null;
                    const isLaggard =
                      cell.kind === "value" && cellKey(company, metric) === laggard;

                    let style: CSSProperties = cellStyle(cell);
                    if (currency) style = { ...style, color: "#555" };
                    else if (heatCell) style = { ...style, background: heatCell.color };
                    if (isLaggard) style = { ...style, borderLeft: "3px solid #b45309" };
                    if (clickable) style = { ...style, cursor: "pointer" };

                    return (
                      <td
                        key={metric}
                        style={style}
                        onClick={clickable ? open : undefined}
                        onKeyDown={
                          clickable
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  open();
                                }
                              }
                            : undefined
                        }
                        role={clickable ? "button" : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        title={clickable ? "Click to see the source of this number" : undefined}
                      >
                        <CellValue
                          cell={cell}
                          currency={currency}
                          operating={operating}
                          isLaggard={isLaggard}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        );
      })}
    </section>
  );
}
