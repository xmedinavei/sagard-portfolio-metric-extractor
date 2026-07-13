// Sector-grouped RAG grid (Phase 1). Companies (rows) × canonical metrics (columns),
// grouped by sector in SECTOR_ORDER, each cell showing the latest-period value. All
// rendering decisions come from the pure classifier in ../lib/grid so they stay
// unit-testable. Visual RAG colouring is the deferred P5.1 polish pass; Phase 1 owns
// the structure + the two honesty affordances (N/A-by-sector and "not ranked").

import { useState } from "react";
import type { CSSProperties } from "react";

import type { CanonicalMetric, MetricRow, MetricsExport } from "../types";
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
import { heatColor, laggardKey, portfolioHeat, type HeatCell } from "../lib/heat";
import { buildSeries, formatDelta, type TrendPoint } from "../lib/trend";

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

// ── Trend view (per-cell over-time) ──────────────────────────────────────────────────────────
// A compact, SELF-SCALED sparkline: it shows the SHAPE of a company's own metric over its
// reported quarters (comparing magnitudes stays the job of the heat colour + the value number).
// The tooltip lists every quarter's value, so "which quarter" is always one hover away.
const SPARK_W = 78;
const SPARK_H = 22;
const SPARK_PAD = 3;
function Sparkline({ points }: { points: TrendPoint[] }) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = points.length;
  const x = (i: number) =>
    n === 1 ? SPARK_W / 2 : SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
  const y = (v: number) => SPARK_PAD + (SPARK_H - 2 * SPARK_PAD) * (1 - (v - min) / span);
  const poly = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const title = points.map((p) => `${p.period}: ${p.displayValue}`).join("  →  ");
  return (
    <svg
      width={SPARK_W}
      height={SPARK_H}
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      role="img"
      aria-label={title}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <title>{title}</title>
      <polyline points={poly} fill="none" stroke="#3a5a8c" strokeWidth="1.5" />
      <circle cx={x(0)} cy={y(points[0].value)} r="1.6" fill="#9aa5b5" />
      <circle cx={x(n - 1)} cy={y(points[n - 1].value)} r="2.2" fill="#3a5a8c" />
    </svg>
  );
}

// The per-cell over-time sub-line under a value in Trend view: the sparkline + a plain,
// QUARTER-NAMED delta ("▲ +8% vs Q1 2025 · latest Q2 2025"). A single-quarter cell says so
// explicitly instead of drawing a fake one-point line (the anti-guessing rule used everywhere).
function TrendSubline({ points, metric }: { points: TrendPoint[]; metric: CanonicalMetric }) {
  if (points.length === 0) return null;
  const latest = points[points.length - 1];
  if (points.length === 1) {
    return <div style={{ ...subLabel, marginTop: "0.2rem" }}>· only {latest.period} reported</div>;
  }
  const prior = points[points.length - 2];
  const d = formatDelta(metric, latest.value, prior.value);
  // Arrow COLOUR = which way the number moved: green rose (▲), red fell (▼), grey when there is no
  // good/bad direction (headcount) or it is a refused/flat cell. Matches the cell background so the
  // two never disagree. (Owner's call: a falling logo churn shows red though it is an improvement.)
  const color = d.improving === null ? "#5b6472" : d.arrow === "▲" ? "#2f7a46" : "#b3401f";
  return (
    <div style={{ marginTop: "0.2rem" }}>
      <div>
        <Sparkline points={points} />
      </div>
      <div style={{ ...subLabel, marginTop: "0.1rem", whiteSpace: "normal", lineHeight: 1.25 }}>
        <span style={{ color, fontWeight: 600 }}>
          {d.arrow} {d.text}
        </span>{" "}
        vs {prior.period} · latest {latest.period}
      </div>
    </div>
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
  // Trend view: adds a per-cell sparkline + quarter-over-quarter delta ON TOP of the latest
  // snapshot. It sits ALONGSIDE the quarter buttons, never replacing them — you can still pin any
  // single quarter or "Latest reported".
  const [trend, setTrend] = useState(false);
  const effectivePeriod = period && periods.includes(period) ? period : null;
  // The snapshot the cells + heat are computed from: a pinned quarter, else each company's latest.
  // Trend view always uses the latest snapshot and layers the over-time view onto each cell.
  const activePeriod = trend ? null : effectivePeriod;
  const cells = activePeriod
    ? valuesForPeriod(metrics, activePeriod)
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
    const lk = laggardKey(g.companies, cells);
    if (lk) laggardKeys.add(lk);
  }
  // Rank EVERY heatable metric — money AND ratios — across the whole EQUITY BOOK (cross-sector), so
  // a company is coloured against the rest of the book regardless of business type (the owner's call
  // for the Q-report grid). The CREDIT book (the lender) is kept out: its figures are a different
  // basis. Heat is only consumed in the Q-report views, so this never affects Trend view.
  const equityCompanies = [...sectorOf.keys()].filter((c) => sectorOf.get(c) !== "credit");
  for (const [k, v] of portfolioHeat(equityCompanies, cells)) heat.set(k, v);

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
        {trend
          ? "Trend view — each cell shows its quarter-over-quarter trend; only cells with more than one quarter are coloured (by their own direction — see the note below), and the within-sector level heat returns in the Latest / per-quarter views."
          : effectivePeriod
            ? `Showing each company's ${effectivePeriod} figure.`
            : "Latest reported figure per company."}{" "}
        {!trend && (
          <>
            Cells are heat-shaded green → red by ranking each company against the whole{" "}
            <em>equity book</em> (every PE company, cross-sector — money and ratios alike, business
            type ignored). The lender is kept separate (its figures are a different basis).
            Same-quarter peers only; ▼ marks the lowest NRR.{" "}
          </>
        )}
        A <em>· Qx 20xx</em> tag means the figure is from an older quarter (the company reported
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
          own. Each company keeps a market tag. The heat ranks every company against the whole equity
          book (cross-sector — a marketplace is coloured against SaaS too); the lender is kept
          separate.
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
          {[...periods].reverse().map((p) => {
            const active = !trend && effectivePeriod === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  setTrend(false);
                }}
                aria-pressed={active}
                style={pillStyle(active)}
              >
                {p}
              </button>
            );
          })}
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
            onClick={() => {
              setPeriod(null);
              setTrend(false);
            }}
            aria-pressed={!trend && effectivePeriod === null}
            style={pillStyle(!trend && effectivePeriod === null)}
          >
            Latest reported
          </button>
          {/* A second divider, then the over-time Trend view (adds a per-cell sparkline + delta). */}
          <span
            aria-hidden="true"
            style={{ width: 1, alignSelf: "stretch", background: "#d0d5dd", margin: "0.15rem 0.35rem" }}
          />
          <button
            type="button"
            onClick={() => setTrend(true)}
            aria-pressed={trend}
            style={pillStyle(trend)}
          >
            Trend (over time)
          </button>
        </div>
      )}
      {!trend && effectivePeriod && (
        <p style={{ color: "#5b6472", fontSize: "0.8rem", margin: "0 0 0.6rem", maxWidth: 900 }}>
          Showing <strong>{effectivePeriod}</strong> — <strong>{reportedCompanies}</strong> of{" "}
          {totalCompanies} companies reported at least one metric this quarter (an empty cell means
          that company did not report it in {effectivePeriod}). Most companies in this sample only
          filed the latest quarter; NovaCloud and LendBridge have the full five-quarter history.
        </p>
      )}

      {/* Trend-view legend — in Trend view ONLY cells with a trend are coloured, by the company's
          OWN direction of travel (no level heat here). */}
      {trend && (
        <p style={{ color: "#5b6472", fontSize: "0.8rem", margin: "0 0 0.6rem", maxWidth: 920 }}>
          <strong>Trend view</strong> compares each company to its <strong>own previous quarter</strong>{" "}
          (not to other companies). Only cells with more than one quarter are coloured — by which way
          the number moved this quarter:{" "}
          <span style={{ color: "#2f7a46", fontWeight: 600 }}>green</span> = it rose (▲),{" "}
          <span style={{ color: "#b3401f", fontWeight: 600 }}>red</span> = it fell (▼),{" "}
          <span style={{ color: "#5b6472", fontWeight: 600 }}>grey</span> = flat, or a metric with no
          good/bad direction (headcount). For most metrics up is the good way; the one exception is{" "}
          <em>logo churn</em> — a fall (<span style={{ color: "#b3401f", fontWeight: 600 }}>red ▼</span>)
          is actually an improvement there (fewer customers lost). Single-quarter cells are left
          blank; the within-sector level heat returns in the Latest / per-quarter views.
        </p>
      )}

      {/* Heat legend — the green→red LEVEL scale (Latest / per-quarter views only; Trend view has
          its own colour rule explained above). */}
      {!trend && (
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
          — <strong>each company ranked against the whole equity book</strong> (cross-sector,
          same-quarter peers; the lender kept separate). ▼ = the lowest NRR.
        </span>
        <span style={{ color: "#858b94" }}>
          A <strong>white</strong> value cell is a real number with no comparable figure to rank here
          (non-USD money, an older quarter, a refused basis, or headcount) — shown, not ranked.
        </span>
      </div>
      )}

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
        // The "no heat shading" note is about the LEVEL peer-ranking — irrelevant in Trend view,
        // which colours by each company's own direction (even a lone company gets coloured there).
        const noHeatNote =
          trend || groupHasHeat
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
                      activePeriod === null &&
                      cell.kind === "value" &&
                      cell.row &&
                      parsePeriodKey(cell.row.period) < newestKey
                        ? cell.row.period
                        : null;

                    // Trend view colours ONLY cells that have a trend (>= 2 quarters), by the
                    // company's OWN direction on this metric — "good" = the metric moved the right
                    // way per HEAT_DIRECTION (note: falling logo churn is GOOD). A single-quarter,
                    // flat, non-directional (headcount) or refused cell stays uncoloured. There is
                    // NO level heat in Trend view; it returns in the Latest / per-quarter views.
                    const trendPoints =
                      trend && cell.kind === "value" ? buildSeries(metrics, company, metric) : [];
                    let trendTone: "green" | "red" | null = null;
                    if (trend && trendPoints.length >= 2) {
                      const a = trendPoints[trendPoints.length - 2];
                      const b = trendPoints[trendPoints.length - 1];
                      const d = formatDelta(metric, b.value, a.value);
                      // Colour by which way the NUMBER moved (▲ rose = green, ▼ fell = red); grey
                      // only when there's no good/bad direction (headcount) or it's flat. A refused
                      // cell IS coloured here — Trend view judges its OWN direction, not a peer
                      // comparison, so a lender's own margin rising is green (still "not ranked" vs
                      // the equity book). (Owner's call: a falling logo churn shows red.)
                      trendTone = d.improving === null ? null : d.arrow === "▲" ? "green" : "red";
                    }

                    let style: CSSProperties = cellStyle(cell);
                    if (currency) style = { ...style, color: "#555" };
                    if (trend) {
                      // own-trend highlight: green = the number rose, red = it fell, else uncoloured.
                      if (trendTone === "green") style = { ...style, background: heatColor(1) };
                      else if (trendTone === "red") style = { ...style, background: heatColor(0) };
                    } else {
                      // Latest / per-quarter views: a ranked cell gets its red→green tint. Everything
                      // else stays WHITE — a value with no comparable figure to rank (non-USD money,
                      // an older/stale quarter, a refused basis, or headcount) as well as gaps / N/A.
                      if (!currency && heatCell) style = { ...style, background: heatCell.color };
                      if (isLaggard) style = { ...style, borderLeft: "3px solid #92400e" };
                    }

                    const value = (
                      <CellValue
                        cell={cell}
                        currency={currency}
                        operating={operating}
                        isLaggard={!trend && isLaggard}
                        stalePeriod={stalePeriod}
                      />
                    );
                    // Trend view: the company's own over-time sub-line under the value. A refused
                    // (different-basis) cell is shown but its delta is never green/red-judged.
                    const trendSub =
                      trend && cell.kind === "value" ? (
                        <TrendSubline points={trendPoints} metric={metric} />
                      ) : null;
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
                        {trendSub}
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
