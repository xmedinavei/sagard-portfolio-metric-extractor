// Over-time trend explorer (Phase 2 — flagship insight #1; Phase 5 V3 — all-companies
// overlay). Two modes:
//   * "One company" (the demo default): NovaCloud ARR as a single continuous 5-quarter line
//     even though the source PDFs renamed the label — the backend collapsed those renames
//     into one canonical_metric, so we simply plot period vs value.
//   * "All companies" (V3): one line PER company for a single metric — the "league over
//     time". Comparability is guarded exactly like the grid: a refused-basis company (lender
//     interest margin) and a non-USD money series (PeopleFlow GBP) are EXCLUDED and named,
//     never silently overlaid on a shared axis.
// When a series has fewer than MIN_TREND_POINTS distinct quarters we show "insufficient
// history" instead of fabricating a trend. All ordering/guarding logic lives in ../lib/trend
// so it stays unit-testable without a DOM; this file is a thin renderer (dependency-light
// inline SVG — no chart library, to keep the offline bundle small).

import type { CSSProperties } from "react";
import { useState } from "react";

import type { CanonicalMetric, MetricRow, MetricsExport } from "../types";
import { METRIC_LABELS } from "../lib/grid";
import type { CompanySeries, TrendPoint } from "../lib/trend";
import {
  MIN_TREND_POINTS,
  buildAllCompaniesSeries,
  buildSeries,
  distinctCompanies,
  hasSufficientHistory,
  metricsForCompany,
  metricsPresent,
  seriesBreakdown,
} from "../lib/trend";

const selectStyle: CSSProperties = {
  padding: "0.3rem 0.5rem",
  fontSize: "0.9rem",
  marginRight: "0.75rem",
};

// SVG canvas geometry — plain constants (no chart library) so the offline bundle stays
// small; a dependency-light inline <polyline> is all the flagship needs.
const W = 680;
const H = 280;
const PAD = { top: 28, right: 32, bottom: 46, left: 72 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;
const LINE_COLOR = "#2b6cb0";

type TrendMode = "single" | "all";

export function TrendExplorer({
  export: exp,
  onSelectRow,
}: {
  export: MetricsExport;
  // Optional (Phase 4): clicking a plotted point reports its source row so App can open the
  // provenance drawer. Absent = the trend renders exactly as in Phase 2.
  onSelectRow?: (row: MetricRow) => void;
}) {
  const metrics = exp.metrics;
  const companies = distinctCompanies(metrics);
  const [mode, setMode] = useState<TrendMode>("single");

  // ── One-company mode state ───────────────────────────────────────────────────────────
  // Demo default is NovaCloud; fall back to the first company if it is absent.
  const defaultCompany = companies.includes("NovaCloud") ? "NovaCloud" : (companies[0] ?? "");
  const [companyChoice, setCompanyChoice] = useState(defaultCompany);
  // The *effective* company: the user's choice if still valid, else the default. Deriving it
  // each render (instead of an effect) keeps the panel correct if the loaded export changes.
  const company = companies.includes(companyChoice) ? companyChoice : defaultCompany;

  const metricOptions = metricsForCompany(metrics, company);
  const [metricChoice, setMetricChoice] = useState<CanonicalMetric | null>(null);
  // Effective metric: the user's choice if it exists for this company, else ARR (the
  // flagship) if present, else the company's first reported metric.
  const metric: CanonicalMetric | null =
    metricChoice && metricOptions.includes(metricChoice)
      ? metricChoice
      : metricOptions.includes("arr_eop")
        ? "arr_eop"
        : (metricOptions[0] ?? null);

  // ── All-companies mode state (V3) ────────────────────────────────────────────────────
  const allMetrics = metricsPresent(metrics);
  const [allMetricChoice, setAllMetricChoice] = useState<CanonicalMetric | null>(null);
  // Default the overlay to the NRR league (the flagship cross-company story), else ARR, else
  // the first metric present anywhere.
  const allMetric: CanonicalMetric | null =
    allMetricChoice && allMetrics.includes(allMetricChoice)
      ? allMetricChoice
      : allMetrics.includes("net_revenue_retention_pct")
        ? "net_revenue_retention_pct"
        : allMetrics.includes("arr_eop")
          ? "arr_eop"
          : (allMetrics[0] ?? null);

  // Defensive: App only renders this panel when an export is loaded; an empty export has
  // nothing to trend. (This return is after ALL hooks, so hook order is stable.)
  if (companies.length === 0) return null;

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Trend over time</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        Quarter-over-quarter. Switch between <em>one company</em> across its metrics and{" "}
        <em>all companies</em> on a single metric. A trend needs at least {MIN_TREND_POINTS}{" "}
        quarters — below that we show <em>insufficient history</em> rather than guess.
      </p>

      {/* Mode toggle (V3). */}
      <div style={{ margin: "0.75rem 0", display: "flex", gap: "0.4rem" }}>
        {(["single", "all"] as TrendMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            style={{
              padding: "0.3rem 0.75rem",
              fontSize: "0.85rem",
              cursor: "pointer",
              border: "1px solid #cbd5e0",
              borderRadius: 6,
              background: mode === m ? "#2b6cb0" : "#fff",
              color: mode === m ? "#fff" : "#333",
            }}
          >
            {m === "single" ? "One company" : "All companies"}
          </button>
        ))}
      </div>

      {mode === "single" ? (
        <SingleCompanyView
          metrics={metrics}
          companies={companies}
          company={company}
          metric={metric}
          metricOptions={metricOptions}
          onCompanyChange={(c) => {
            setCompanyChoice(c);
            setMetricChoice(null); // reset the metric to the new company's default
          }}
          onMetricChange={(m) => setMetricChoice(m)}
          onSelectRow={onSelectRow}
        />
      ) : (
        <AllCompaniesView
          metrics={metrics}
          metric={allMetric}
          metrics_options={allMetrics}
          onMetricChange={(m) => setAllMetricChoice(m)}
          onSelectRow={onSelectRow}
        />
      )}
    </section>
  );
}

// ── One-company view (the original Phase 2 flagship, unchanged behaviour) ────────────────
function SingleCompanyView({
  metrics,
  companies,
  company,
  metric,
  metricOptions,
  onCompanyChange,
  onMetricChange,
  onSelectRow,
}: {
  metrics: MetricRow[];
  companies: string[];
  company: string;
  metric: CanonicalMetric | null;
  metricOptions: CanonicalMetric[];
  onCompanyChange: (company: string) => void;
  onMetricChange: (metric: CanonicalMetric) => void;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const points = metric ? buildSeries(metrics, company, metric) : [];
  const sufficient = hasSufficientHistory(points);
  // How many DISTINCT source labels collapsed into this one series — the flagship's "one
  // line despite renames" story. Derived from the PLOTTED points so the count can never
  // disagree with what's on the line; only shown when there is real drift (> 1 label).
  const rawLabels = new Set(points.map((p) => p.rawLabel));

  return (
    <>
      <div style={{ margin: "0.75rem 0" }}>
        <label>
          <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.4rem" }}>
            Company
          </span>
          <select
            style={selectStyle}
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        {metric !== null && (
          <label>
            <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.4rem" }}>
              Metric
            </span>
            <select
              style={selectStyle}
              value={metric}
              onChange={(e) => onMetricChange(e.target.value as CanonicalMetric)}
            >
              {metricOptions.map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {metric === null ? (
        <p role="status" style={{ color: "#666" }}>
          {company} has no trendable metric.
        </p>
      ) : sufficient ? (
        <TrendChart
          points={points}
          label={`${company} — ${METRIC_LABELS[metric]}`}
          onSelectRow={onSelectRow}
        />
      ) : (
        <p
          role="status"
          style={{
            color: "#c77700",
            background: "#fff8ec",
            border: "1px solid #f0dcae",
            borderRadius: 6,
            padding: "0.75rem 1rem",
            maxWidth: W,
          }}
        >
          <strong>Insufficient history.</strong> {company} has{" "}
          {points.length === 1 ? "only one quarter" : `only ${points.length} quarters`} of{" "}
          {METRIC_LABELS[metric]} data — at least {MIN_TREND_POINTS} are needed to show a
          trend. We do not draw a line from fewer points.
        </p>
      )}

      {metric !== null && sufficient && rawLabels.size > 1 && (
        <p style={{ color: "#666", fontSize: "0.8rem", maxWidth: W }}>
          Plotted as one metric across <strong>{rawLabels.size}</strong> different source
          labels (e.g.{" "}
          {[...rawLabels]
            .slice(0, 2)
            .map((l) => `"${l}"`)
            .join(", ")}
          ) — the backend collapsed the label drift into a single series.
        </p>
      )}
    </>
  );
}

// ── All-companies overlay view (V3) ─────────────────────────────────────────────────────
function AllCompaniesView({
  metrics,
  metric,
  metrics_options,
  onMetricChange,
  onSelectRow,
}: {
  metrics: MetricRow[];
  metric: CanonicalMetric | null;
  metrics_options: CanonicalMetric[];
  onMetricChange: (metric: CanonicalMetric) => void;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const { series, excluded } = metric
    ? buildAllCompaniesSeries(metrics, metric)
    : { series: [], excluded: [] };

  // How many sectors the plotted lines span. A money metric (revenue/ARR/cash) can overlay
  // companies from different sectors on one axis — comparable as USD LEVELS, but not a
  // within-sector ranking (unlike the grid's per-sector heat). We say so honestly.
  const companySector = new Map(metrics.map((m) => [m.company_name, m.sector]));
  const sectorsShown = new Set(series.map((s) => companySector.get(s.company)));

  return (
    <>
      <div style={{ margin: "0.75rem 0" }}>
        {metric !== null && (
          <label>
            <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.4rem" }}>
              Metric
            </span>
            <select
              style={selectStyle}
              value={metric}
              onChange={(e) => onMetricChange(e.target.value as CanonicalMetric)}
            >
              {metrics_options.map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {metric === null || series.length === 0 ? (
        <p
          role="status"
          style={{
            color: "#c77700",
            background: "#fff8ec",
            border: "1px solid #f0dcae",
            borderRadius: 6,
            padding: "0.75rem 1rem",
            maxWidth: W,
          }}
        >
          <strong>No comparable series.</strong> No company reports{" "}
          {metric ? METRIC_LABELS[metric] : "this metric"} with a comparable, dated value.
        </p>
      ) : (
        <>
          <AllCompaniesChart
            series={series}
            label={metric ? METRIC_LABELS[metric] : ""}
            onSelectRow={onSelectRow}
          />
          <Legend series={series} />
          {(() => {
            // Honest breakdown: this corpus is mostly single-quarter, so most companies plot
            // as snapshot dots, not trend lines. Say exactly what's on screen.
            const b = seriesBreakdown(series);
            return (
              <p style={{ color: "#5b6472", fontSize: "0.8rem", maxWidth: W, marginTop: "0.4rem" }}>
                <strong>{b.total}</strong> {b.total === 1 ? "company" : "companies"} shown
                {b.lines > 0 && ` · ${b.lines} as trend ${b.lines === 1 ? "line" : "lines"} (3+ quarters)`}
                {b.points > 0 &&
                  ` · ${b.points} as single-quarter ${b.points === 1 ? "snapshot dot" : "snapshot dots"}`}
                . A company with one reported quarter is drawn as a dot, never a fabricated line.
              </p>
            );
          })()}
          {sectorsShown.size > 1 && (
            <p style={{ color: "#666", fontSize: "0.8rem", maxWidth: W, marginTop: "0.4rem" }}>
              Showing levels across <strong>{sectorsShown.size}</strong> sectors — a cross-sector
              view of trends, not a within-sector ranking. Ratios (NRR, margin) are like-for-like;
              money levels are shown as reported.
            </p>
          )}
        </>
      )}

      {excluded.length > 0 && (
        <p style={{ color: "#666", fontSize: "0.8rem", maxWidth: W, marginTop: "0.5rem" }}>
          Hidden from this overlay (kept honest, not silently dropped):{" "}
          {excluded.map((e, i) => (
            <span key={e.company}>
              {i > 0 ? "; " : ""}
              <strong>{e.company}</strong> ({e.reason})
            </span>
          ))}
          .
        </p>
      )}
    </>
  );
}

// A small colour-swatch legend under the overlay chart (one entry per plotted company). The
// swatch shape encodes the series kind: a bar for a trend line, a dot for a single-quarter
// snapshot — so the line/dot distinction is legible in the legend, not just on the chart.
function Legend({ series }: { series: CompanySeries[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1rem", maxWidth: W, marginTop: "0.4rem" }}>
      {series.map((s) => (
        <span key={s.company} style={{ display: "inline-flex", alignItems: "center", fontSize: "0.8rem", color: "#444" }}>
          <span
            style={
              s.kind === "line"
                ? { display: "inline-block", width: 16, height: 3, borderRadius: 2, background: s.color, marginRight: "0.35rem" }
                : { display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: s.color, border: "1.5px solid #fff", boxShadow: "0 0 0 1px " + s.color, marginRight: "0.4rem" }
            }
          />
          {s.company}
          {s.kind === "point" && (
            <span style={{ color: "#5b6472", marginLeft: "0.25rem" }}>(snapshot)</span>
          )}
        </span>
      ))}
    </div>
  );
}

// The inline SVG line chart (one company). Only reached when points.length >= MIN_TREND_POINTS
// (>= 3), so `points.length - 1` is always >= 2 (no divide-by-zero on the x axis).
function TrendChart({
  points,
  label,
  onSelectRow,
}: {
  points: TrendPoint[];
  label: string;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const values = points.map((p) => p.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const span = maxV - minV || 1; // a perfectly flat series → avoid divide-by-zero

  const x = (i: number) => PAD.left + (i / (points.length - 1)) * INNER_W;
  const y = (v: number) => PAD.top + INNER_H - ((v - minV) / span) * INNER_H;

  const polyline = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const maxPoint = points.find((p) => p.value === maxV);
  const minPoint = points.find((p) => p.value === minV);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, height: "auto", border: "1px solid #eee", borderRadius: 6 }}
      role="img"
      aria-label={`${label} over ${points.length} quarters`}
    >
      {/* min / max reference lines + their value labels on the y axis */}
      <line x1={PAD.left} y1={y(maxV)} x2={W - PAD.right} y2={y(maxV)} stroke="#eee" />
      <line x1={PAD.left} y1={y(minV)} x2={W - PAD.right} y2={y(minV)} stroke="#eee" />
      <text x={PAD.left - 8} y={y(maxV)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#5f6672">
        {maxPoint?.displayValue}
      </text>
      <text x={PAD.left - 8} y={y(minV)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#5f6672">
        {minPoint?.displayValue}
      </text>

      {/* the trend line */}
      <polyline points={polyline} fill="none" stroke={LINE_COLOR} strokeWidth="2" />

      {/* points + per-point value and period labels */}
      {points.map((p, i) => (
        <g key={p.period}>
          {/* A larger transparent hit target makes the point easy to click (Phase 4) and
              keyboard-operable (a11y): Tab to it, Enter/Space opens its source. */}
          {onSelectRow && (
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r="12"
              fill="transparent"
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              aria-label={`${p.period} ${p.displayValue} — view source`}
              onClick={() => onSelectRow(p.row)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectRow(p.row);
                }
              }}
            >
              <title>Click to see the source of this number</title>
            </circle>
          )}
          <circle
            cx={x(i)}
            cy={y(p.value)}
            r="4"
            fill={LINE_COLOR}
            style={onSelectRow ? { cursor: "pointer" } : undefined}
            onClick={onSelectRow ? () => onSelectRow(p.row) : undefined}
          />
          <text x={x(i)} y={y(p.value) - 10} textAnchor="middle" fontSize="11" fill="#333">
            {p.displayValue}
          </text>
          <text x={x(i)} y={H - PAD.bottom + 20} textAnchor="middle" fontSize="11" fill="#666">
            {p.period}
          </text>
        </g>
      ))}
    </svg>
  );
}

// The inline SVG overlay chart (V3): one polyline per company on a SHARED axis. The x axis
// is the union of every plotted period (chronological); the y axis is the global min/max
// across all series, so lines are directly comparable — which is exactly why the incomparable
// companies were already excluded upstream (buildAllCompaniesSeries).
function AllCompaniesChart({
  series,
  label,
  onSelectRow,
}: {
  series: CompanySeries[];
  label: string;
  onSelectRow?: (row: MetricRow) => void;
}) {
  // Shared, chronological x axis = every distinct period across all series.
  const periodKeys = [
    ...new Set(series.flatMap((s) => s.points.map((p) => p.periodKey))),
  ].sort((a, b) => a - b);
  const xIndex = new Map(periodKeys.map((k, i) => [k, i]));
  const keyToPeriod = new Map<number, string>();
  for (const s of series) for (const p of s.points) keyToPeriod.set(p.periodKey, p.period);

  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const span = maxV - minV || 1;

  const denom = Math.max(1, periodKeys.length - 1);
  const x = (periodKey: number) => PAD.left + ((xIndex.get(periodKey) ?? 0) / denom) * INNER_W;
  const y = (v: number) => PAD.top + INNER_H - ((v - minV) / span) * INNER_H;

  const maxPoint = series.flatMap((s) => s.points).find((p) => p.value === maxV);
  const minPoint = series.flatMap((s) => s.points).find((p) => p.value === minV);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, height: "auto", border: "1px solid #eee", borderRadius: 6 }}
      role="img"
      aria-label={`${label} across ${series.length} companies`}
    >
      {/* min / max reference lines + their value labels */}
      <line x1={PAD.left} y1={y(maxV)} x2={W - PAD.right} y2={y(maxV)} stroke="#eee" />
      <line x1={PAD.left} y1={y(minV)} x2={W - PAD.right} y2={y(minV)} stroke="#eee" />
      <text x={PAD.left - 8} y={y(maxV)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#5f6672">
        {maxPoint?.displayValue}
      </text>
      <text x={PAD.left - 8} y={y(minV)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#5f6672">
        {minPoint?.displayValue}
      </text>

      {/* period labels along the x axis (shared) */}
      {periodKeys.map((k) => (
        <text key={k} x={x(k)} y={H - PAD.bottom + 20} textAnchor="middle" fontSize="11" fill="#666">
          {keyToPeriod.get(k)}
        </text>
      ))}

      {/* one series per company: a trend LINE when it has >=3 quarters, else snapshot DOT(s) */}
      {series.map((s) => (
        <g key={s.company}>
          {s.kind === "line" && (
            <polyline
              points={s.points.map((p) => `${x(p.periodKey)},${y(p.value)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
            />
          )}
          {s.points.map((p) => (
            <circle
              key={p.period}
              cx={x(p.periodKey)}
              cy={y(p.value)}
              r={s.kind === "line" ? 3.5 : 5}
              fill={s.color}
              stroke={s.kind === "point" ? "#fff" : undefined}
              strokeWidth={s.kind === "point" ? 1.5 : undefined}
              style={onSelectRow ? { cursor: "pointer" } : undefined}
              role={onSelectRow ? "button" : undefined}
              tabIndex={onSelectRow ? 0 : undefined}
              aria-label={
                onSelectRow ? `${s.company} ${p.period} ${p.displayValue} — view source` : undefined
              }
              onClick={onSelectRow ? () => onSelectRow(p.row) : undefined}
              onKeyDown={
                onSelectRow
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectRow(p.row);
                      }
                    }
                  : undefined
              }
            >
              <title>
                {s.company} · {p.period} · {p.displayValue}
                {s.kind === "point" ? " (single-quarter snapshot)" : ""}
              </title>
            </circle>
          ))}
        </g>
      ))}
    </svg>
  );
}
