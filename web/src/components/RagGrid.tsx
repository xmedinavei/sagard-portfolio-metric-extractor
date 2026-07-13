// Sector-grouped RAG grid (Phase 1). Companies (rows) × canonical metrics (columns),
// grouped by sector in SECTOR_ORDER, each cell showing the latest-period value. All
// rendering decisions come from the pure classifier in ../lib/grid so they stay
// unit-testable. Visual RAG colouring is the deferred P5.1 polish pass; Phase 1 owns
// the structure + the two honesty affordances (N/A-by-sector and "not ranked").

import { useState } from "react";
import type { CSSProperties } from "react";

import type { MetricRow, MetricsExport } from "../types";
import {
  CANONICAL_METRIC_ORDER,
  CURRENCY_SYMBOL,
  METRIC_DESCRIPTION,
  METRIC_FULL_NAME,
  METRIC_GROUPS,
  METRIC_LABELS,
  SECTOR_LABELS,
  cellKey,
  classifyCell,
  companySectors,
  distinctPeriods,
  groupByMarket,
  groupByStrategy,
  groupCompaniesBySector,
  latestByCompanyMetric,
  nonUsdCurrency,
  operatingValueView,
  parsePeriodKey,
  sectorApplicableMetrics,
  cellText,
  valuesForPeriod,
  withCurrencySymbol,
  type Cell,
  type OperatingValueView,
} from "../lib/grid";
import { heatColor, laggardKey, sectorHeat, type HeatCell } from "../lib/heat";

type GroupMode = "market" | "strategy";

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

// A small toggle-pill style shared by the "Group by" and "Quarter" selectors, so the two
// control rows read as a matched pair.
function pillStyle(active: boolean): CSSProperties {
  return {
    padding: "0.2rem 0.65rem",
    fontSize: "0.8rem",
    cursor: "pointer",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    background: active ? "#2b6cb0" : "#fff",
    color: active ? "#fff" : "#334155",
  };
}

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
  const periods = distinctPeriods(metrics);
  // The grid shows each company's LATEST figure by default (period = null), or flips to a
  // specific reported quarter so you can see every quarter, not just the last one.
  const [period, setPeriod] = useState<string | null>(null);
  const effectivePeriod = period && periods.includes(period) ? period : null;
  const cells = effectivePeriod
    ? valuesForPeriod(metrics, effectivePeriod)
    : latestByCompanyMetric(metrics);

  // Group companies by MARKET (sector) or by investment STRATEGY (PE vs credit). Display-only.
  // Default to STRATEGY — the portfolio's own lens (equity book vs credit book) — with the
  // Private Equity table ordered SaaS-first by market (see groupByStrategy).
  const [groupMode, setGroupMode] = useState<GroupMode>("strategy");
  const displayGroups =
    groupMode === "strategy" ? groupByStrategy(metrics) : groupByMarket(metrics);
  const sectorOf = companySectors(metrics);

  // Heat + laggards are computed PER MARKET SECTOR (never across), so a colour always means the
  // same thing — "how this company ranks among its own-market peers" — whichever way we group.
  const heat = new Map<string, HeatCell>();
  const laggardKeys = new Set<string>();
  for (const g of groupCompaniesBySector(metrics)) {
    for (const [k, v] of sectorHeat(g.sector, g.companies, cells)) heat.set(k, v);
    const lk = laggardKey(g.companies, cells);
    if (lk) laggardKeys.add(lk);
  }

  // Pass issues so a backend-flagged missing metric reads as a gap, not a false N/A.
  const applicable = sectorApplicableMetrics(metrics, exp.issues);
  // The portfolio-wide newest quarter — tag any older-quarter value as stale (Latest mode only;
  // a selected quarter is stated by the selector, so no per-cell "· Qx" tag is needed then).
  const newestKey = newestPeriodKey(metrics);
  const totalCompanies = new Set(metrics.map((m) => m.company_name)).size;
  const reportedCompanies = new Set([...cells.values()].map((r) => r.company_name)).size;

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16233d", borderBottom: "2px solid #e8ecf2", paddingBottom: "0.3rem", marginBottom: "0.6rem" }}>
        Metrics by {groupMode === "strategy" ? "strategy" : "sector"}
      </h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        {effectivePeriod
          ? `Showing each company's ${effectivePeriod} figure.`
          : "Latest reported figure per company."}{" "}
        Cells are heat-shaded green → red{" "}
        <em>within each sector</em>, ranking <em>same-quarter peers only</em> (best → worst,
        where a sector has 2+ comparable companies); ▼ marks the sector laggard. A{" "}
        <em>· Qx 20xx</em> tag means the figure is from an older quarter (the company reported
        nothing newer). <em>N/A</em> = not applicable to the sector; <em>—</em> = a genuine gap;{" "}
        <em>not ranked</em> / <em>not comparable</em> = a real number on a different basis or
        currency — shown, but not ranked. NRR and logo churn are <em>LTM</em> (trailing twelve
        months), not quarterly.
      </p>

      {/* Group-by toggle — organize the tables by MARKET sector, or by investment STRATEGY
          (Private Equity vs Private Credit) to see the whole equity book together. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          margin: "0.2rem 0 0.5rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "#5b6472", fontWeight: 600, marginRight: "0.1rem" }}>
          Group by:
        </span>
        {(["market", "strategy"] as GroupMode[]).map((m) => {
          const active = groupMode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setGroupMode(m)}
              aria-pressed={active}
              style={pillStyle(active)}
            >
              {m === "market" ? "Market (SaaS · Credit · …)" : "Strategy (PE · Credit)"}
            </button>
          );
        })}
      </div>
      {groupMode === "strategy" && (
        <p style={{ color: "#5b6472", fontSize: "0.8rem", margin: "0 0 0.6rem", maxWidth: 900 }}>
          Grouped by investment strategy — the whole equity book in one table, the lender on its
          own. Each company keeps a market tag, and the heat still ranks a company only against its
          own-market peers (a marketplace&apos;s margin is never coloured against a SaaS one).
        </p>
      )}

      {/* Quarter selector — a left→right timeline (oldest → newest, the way people read time).
          `periods` is newest-first, so we reverse it; "Latest reported" (each company's own
          most-recent quarter) is set off with a divider on the RIGHT, the newest side. */}
      {periods.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            margin: "0.2rem 0 0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "#5b6472", fontWeight: 600, marginRight: "0.1rem" }}>
            Quarter:
          </span>
          <span aria-hidden="true" style={{ fontSize: "0.72rem", color: "#98a0ad", marginRight: "0.1rem" }}>
            older
          </span>
          {[...periods].reverse().map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={effectivePeriod === p}
              style={pillStyle(effectivePeriod === p)}
            >
              {p}
            </button>
          ))}
          <span aria-hidden="true" style={{ fontSize: "0.72rem", color: "#98a0ad", marginLeft: "0.1rem" }}>
            newer →
          </span>
          {/* divider, then the "most-recent-per-company" default on the newest (right) side. */}
          <span
            aria-hidden="true"
            style={{ width: 1, alignSelf: "stretch", background: "#d0d5dd", margin: "0.15rem 0.35rem" }}
          />
          <button
            type="button"
            onClick={() => setPeriod(null)}
            aria-pressed={effectivePeriod === null}
            style={pillStyle(effectivePeriod === null)}
          >
            Latest reported
          </button>
        </div>
      )}
      {effectivePeriod && (
        <p style={{ color: "#5b6472", fontSize: "0.8rem", margin: "0 0 0.6rem", maxWidth: 900 }}>
          Showing <strong>{effectivePeriod}</strong> — <strong>{reportedCompanies}</strong> of{" "}
          {totalCompanies} companies reported at least one metric this quarter (an empty cell means
          that company did not report it in {effectivePeriod}). Most companies in this sample only
          filed the latest quarter; NovaCloud and LendBridge have the full five-quarter history.
        </p>
      )}

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

      {/* Metric guide — a plain-language reference for each column (visual support; collapsible). */}
      <details open style={{ margin: "0.2rem 0 1.1rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: "#334155" }}>
          What each metric means
        </summary>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: "0.55rem 1.75rem",
            marginTop: "0.7rem",
          }}
        >
          {CANONICAL_METRIC_ORDER.map((metric) => (
            <div key={metric} style={{ fontSize: "0.82rem", lineHeight: 1.35 }}>
              <strong>{METRIC_LABELS[metric]}</strong>{" "}
              <span style={{ color: "#5b6472" }}>· {METRIC_FULL_NAME[metric]}</span>
              <div style={{ color: "#666" }}>{METRIC_DESCRIPTION[metric]}</div>
            </div>
          ))}
        </div>
      </details>

      {displayGroups.map((group) => {
        // Heat/laggards are the GLOBAL per-market maps computed above. A group "has heat" if any
        // of its companies is ranked; a group with none says WHY (single company, or no
        // same-quarter peers), so an unshaded table never reads as a broken heatmap.
        const singleCompany = group.companies.length < 2;
        const groupHasHeat = group.companies.some((c) =>
          CANONICAL_METRIC_ORDER.some((m) => heat.has(cellKey(c, m))),
        );
        const noHeatNote = groupHasHeat
          ? null
          : singleCompany
            ? "Only one company here — nothing to rank against, so no heat shading."
            : "No same-quarter peers to rank, so no heat shading here.";
        return (
        <div key={group.key} style={{ margin: "1rem 0", overflowX: "auto" }}>
          <h3 style={{ fontSize: "1rem", margin: "0 0 0.4rem" }}>
            {group.label}{" "}
            <span style={{ color: "#5b6472", fontWeight: 400 }}>
              ({group.companies.length}{" "}
              {group.companies.length === 1 ? "company" : "companies"})
            </span>
          </h3>
          <p style={{ color: "#5b6472", fontSize: "0.82rem", margin: "0 0 0.4rem", maxWidth: 900 }}>
            {group.description}
          </p>
          {noHeatNote && (
            <p style={{ color: "#5b6472", fontSize: "0.8rem", margin: "0 0 0.4rem" }}>
              {noHeatNote}
            </p>
          )}
          <table style={{ borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              {/* Metric-group banner — GROW·PROFIT / KEEP / FUND / SCALE, spanning their columns. */}
              <tr>
                <th aria-hidden="true" style={{ ...cellBase, border: "none", background: "transparent" }} />
                {METRIC_GROUPS.map((g, i) => (
                  <th
                    key={g.label}
                    colSpan={g.metrics.length}
                    style={{
                      padding: "0.2rem 0.55rem",
                      textAlign: "center",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "#5b6472",
                      background: "#eef1f5",
                      border: "1px solid #e2e2e2",
                      borderLeft: i === 0 ? "1px solid #e2e2e2" : "2px solid #cbd5e0",
                    }}
                  >
                    {g.label}
                  </th>
                ))}
              </tr>
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
                    {/* In strategy view a group spans markets, so tag each company's market. */}
                    {groupMode === "strategy" && sectorOf.get(company) && (
                      <span style={{ fontWeight: 400, fontSize: "0.72em", color: "#858b94" }}>
                        {" · "}
                        {SECTOR_LABELS[sectorOf.get(company)!]}
                      </span>
                    )}
                  </th>
                  {CANONICAL_METRIC_ORDER.map((metric) => {
                    // A cell's applicability (N/A) is per the COMPANY's own market sector — not
                    // the display group, which may span markets in strategy view.
                    const cell = classifyCell(
                      company,
                      metric,
                      sectorOf.get(company) ?? "saas",
                      cells,
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
                      cell.kind === "value" && laggardKeys.has(cellKey(company, metric));
                    // A figure from an older quarter than the portfolio's newest — tag it so a
                    // stale value never reads as current (e.g. FleetLink revenue from Q4 2024).
                    const stalePeriod =
                      effectivePeriod === null &&
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
