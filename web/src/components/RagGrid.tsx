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
  METRIC_DESCRIPTION,
  METRIC_FULL_NAME,
  METRIC_LABELS,
  SECTOR_DESCRIPTION,
  SECTOR_LABELS,
  cellKey,
  classifyCell,
  groupCompaniesBySector,
  latestByCompanyMetric,
  nonUsdCurrency,
  operatingValueView,
  parsePeriodKey,
  sectorApplicableMetrics,
  cellText,
  withCurrencySymbol,
  type Cell,
  type OperatingValueView,
} from "../lib/grid";
import { heatColor, laggardKey, sectorHeat } from "../lib/heat";

// The newest period anywhere in the export (year-aware). A value cell whose own period is
// older than this is a STALE figure (the company reported nothing newer) — the grid shows it
// with a small period tag so a cross-quarter row never reads as if it were current.
function newestPeriodKey(metrics: MetricRow[]): number {
  let max = -1;
  for (const m of metrics) {
    const k = parsePeriodKey(m.period);
    if (k > max) max = k;
  }
  return max;
}

const cellBase: CSSProperties = {
  border: "1px solid #e2e2e2",
  padding: "0.35rem 0.55rem",
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

function cellStyle(cell: Cell): CSSProperties {
  if (cell.kind === "na") return { ...cellBase, color: "#858b94", fontStyle: "italic" };
  if (cell.kind === "gap") return { ...cellBase, color: "#c77700" };
  if (cell.notRanked) return { ...cellBase, color: "#555" };
  return cellBase;
}

// One uniform style for every small cell annotation (currency/not-ranked/laggard/operating/
// period), so the sub-labels read as one system rather than drifting sizes.
const subLabel: CSSProperties = { fontSize: "0.75em", color: "#5b6472" };

function CellValue({
  cell,
  currency,
  operating,
  isLaggard,
  stalePeriod,
}: {
  cell: Cell;
  currency?: string | null;
  // The one basis-adjusted figure on the corpus (ClearPay operating cash) — shown as a small
  // sub-line under the headline so the tool SHOWS what it caught (Trap C).
  operating?: OperatingValueView | null;
  // The explicit sector laggard (lowest NRR) — a small ▼ tag reinforcing the red heat tint.
  isLaggard?: boolean;
  // Set when this value is from an OLDER quarter than the newest in the export (the company
  // reported nothing more recent) — shown as a "· Qx 20xx" tag so a stale figure is never
  // read as current.
  stalePeriod?: string | null;
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
        {shown}
        {/* stacked (block) so the long note doesn't widen the column */}
        <span style={{ ...subLabel, display: "block" }}>· not comparable ({currency})</span>
      </span>
    );
  }
  if (cell.kind === "value" && cell.notRanked) {
    // A real number on a different basis (credit gross margin = interest margin).
    // Shown, but explicitly not ranked against the sector's peers. Phase 3 tells the
    // full refuse-to-compare story; here the grid must already not rank it.
    return (
      <span title="Measured on a different basis (interest margin) — not comparable to the gross-margin column">
        {text} <span style={subLabel}>· not ranked</span>
      </span>
    );
  }
  if (cell.kind === "na") {
    return <span title="Not applicable to this sector">{text}</span>;
  }
  if (cell.kind === "gap") {
    return <span title="No value reported for this company (genuine gap)">{text}</span>;
  }
  // A plain comparable value — normalize money to its reporting-currency symbol so it never
  // sits bare beside a symboled peer; may also carry a basis-adjusted operating figure and/or a
  // laggard tag. (Non-USD cells never reach here — the currency branch above returns first.)
  const displayText = cell.row
    ? withCurrencySymbol(text, cell.row.canonical_metric, cell.row.company_name)
    : text;
  return (
    <span>
      {displayText}
      {isLaggard && (
        <span
          title="Lowest in its sector on this metric — the laggard"
          style={{ ...subLabel, color: "#92400e", marginLeft: "0.35rem" }}
        >
          ▼ laggard
        </span>
      )}
      {stalePeriod && (
        <span
          title={`Latest available figure — the company reported nothing newer (${stalePeriod})`}
          style={{ ...subLabel, marginLeft: "0.35rem" }}
        >
          · {stalePeriod}
        </span>
      )}
      {operating && (
        <span title={operating.note} style={{ ...subLabel, display: "block", color: "#2f7a46" }}>
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
  // The portfolio-wide newest quarter — used to tag any value from an older quarter as stale.
  const newestKey = newestPeriodKey(metrics);

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Metrics by sector</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        Latest reported figure per company. Cells are heat-shaded green → red{" "}
        <em>within each sector</em>, ranking <em>same-quarter peers only</em> (best → worst,
        where a sector has 2+ comparable companies); ▼ marks the sector laggard. A{" "}
        <em>· Qx 20xx</em> tag means the figure is from an older quarter (the company reported
        nothing newer). <em>N/A</em> = not applicable to the sector; <em>—</em> = a genuine gap;{" "}
        <em>not ranked</em> / <em>not comparable</em> = a real number on a different basis or
        currency — shown, but not ranked. NRR and logo churn are <em>LTM</em> (trailing twelve
        months), not quarterly.
      </p>

      {/* Heat legend — explains the green→red scale that shades the value cells. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          margin: "0.2rem 0 0.8rem",
          fontSize: "0.8rem",
          color: "#5b6472",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 600 }}>Heat:</span>
        <span>worst</span>
        <span
          aria-hidden="true"
          style={{ display: "inline-flex", borderRadius: 3, overflow: "hidden", border: "1px solid #e2e2e2" }}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <span key={f} style={{ display: "inline-block", width: 22, height: 12, background: heatColor(f) }} />
          ))}
        </span>
        <span>best</span>
        <span style={{ color: "#858b94" }}>
          — ranked within a sector, same-quarter peers only. ▼ = the sector laggard.
        </span>
      </div>

      {groups.map((group) => {
        // Heat + laggard are computed PER SECTOR — never across sectors — so a company is
        // only ever ranked against genuine peers (comparability, the whole thesis).
        const heat = sectorHeat(group.sector, group.companies, latest);
        const laggard = laggardKey(group.companies, latest);
        // A sector shows no heat when there is nothing SAME-QUARTER to rank — either a single
        // company, or 2+ companies whose latest figures are from different quarters. Naming
        // which keeps an unshaded table from reading as a broken heatmap.
        const singleCompany = group.companies.length < 2;
        const noHeatNote = singleCompany
          ? "Only one company in this sector — nothing to rank against, so no heat shading here."
          : heat.size === 0
            ? "These companies report different quarters — no same-quarter peers to rank, so no heat shading here."
            : null;
        return (
        <div key={group.sector} style={{ margin: "1rem 0", overflowX: "auto" }}>
          <h3 style={{ fontSize: "1rem", margin: "0 0 0.4rem" }}>
            {SECTOR_LABELS[group.sector]}{" "}
            <span style={{ color: "#5b6472", fontWeight: 400 }}>
              ({group.companies.length}{" "}
              {group.companies.length === 1 ? "company" : "companies"})
            </span>
          </h3>
          <p style={{ color: "#5b6472", fontSize: "0.82rem", margin: "0 0 0.4rem", maxWidth: 900 }}>
            {SECTOR_DESCRIPTION[group.sector]}
          </p>
          {noHeatNote && (
            <p style={{ color: "#5b6472", fontSize: "0.8rem", margin: "0 0 0.4rem" }}>
              {noHeatNote}
            </p>
          )}
          <table style={{ borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th scope="col" style={{ ...cellBase, textAlign: "left" }}>
                  Company
                </th>
                {CANONICAL_METRIC_ORDER.map((metric) => (
                  <th key={metric} scope="col" style={cellBase} title={METRIC_DESCRIPTION[metric]}>
                    <div>
                      {METRIC_LABELS[metric]}
                      {(metric === "net_revenue_retention_pct" ||
                        metric === "logo_churn_pct") && (
                        <span style={{ fontWeight: 400, color: "#5b6472" }}> · LTM</span>
                      )}
                    </div>
                    {/* the full metric name, small — visual support under the acronym (wraps, so
                        it never widens the column); hover the header for the plain definition. */}
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: "0.68em",
                        color: "#858b94",
                        whiteSpace: "normal",
                        lineHeight: 1.15,
                        marginTop: "0.1rem",
                      }}
                    >
                      {METRIC_FULL_NAME[metric]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.companies.map((company) => (
                <tr key={company}>
                  <th
                    scope="row"
                    style={{ ...cellBase, textAlign: "left", fontWeight: 600 }}
                  >
                    {company}
                  </th>
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
                    // RAG heat (V1): `heat` already excludes refused + non-USD + off-newest-
                    // period cells, so it is defined ONLY for a genuinely rankable, same-quarter
                    // value — never fighting the currency / not-ranked / stale styling below.
                    const heatCell =
                      cell.kind === "value" ? heat.get(cellKey(company, metric)) : undefined;
                    // The one basis-adjusted figure on the corpus (ClearPay operating cash).
                    const operating =
                      cell.kind === "value" && cell.row ? operatingValueView(cell.row) : null;
                    const isLaggard =
                      cell.kind === "value" && cellKey(company, metric) === laggard;
                    // A figure from an older quarter than the portfolio's newest — tag it so a
                    // stale value never reads as current (e.g. FleetLink revenue from Q4 2024).
                    const stalePeriod =
                      cell.kind === "value" &&
                      cell.row &&
                      parsePeriodKey(cell.row.period) < newestKey
                        ? cell.row.period
                        : null;

                    let style: CSSProperties = cellStyle(cell);
                    if (currency) style = { ...style, color: "#555" };
                    else if (heatCell) style = { ...style, background: heatCell.color };
                    if (isLaggard) style = { ...style, borderLeft: "3px solid #92400e" };

                    const value = (
                      <CellValue
                        cell={cell}
                        currency={currency}
                        operating={operating}
                        isLaggard={isLaggard}
                        stalePeriod={stalePeriod}
                      />
                    );
                    return (
                      // Keep the <td> a real table cell; the button role lives on an inner span
                      // so table semantics survive for screen readers (a11y).
                      <td key={metric} style={style}>
                        {clickable ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={open}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                open();
                              }
                            }}
                            title="Click to see the source of this number"
                            style={{ cursor: "pointer", display: "inline-block", width: "100%" }}
                          >
                            {value}
                          </span>
                        ) : (
                          value
                        )}
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
