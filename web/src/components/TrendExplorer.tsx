// Over-time trend explorer. Three modes:
//   * "All companies" (DEFAULT) — every company on ONE metric (lines for >=3 quarters, snapshot
//     dots for fewer). Incomparable series (lender interest-margin, non-USD money) are excluded
//     and named, never silently overlaid.
//   * "One company" — one company across its metrics (the label-drift flagship).
//   * "All metrics" — small multiples: one compact chart per metric, all companies at once.
// Y-axes are STANDARDIZED per metric (money & counts anchored at 0; percentages fitted to the
// nearest 5). Company COLOURS are consistent across every chart. All ordering/axis logic lives
// in ../lib/trend so it stays unit-testable; this file is a thin, dependency-light inline-SVG
// renderer (no chart library, to keep the offline bundle small).

import type { CSSProperties } from "react";
import { useState } from "react";

import type { CanonicalMetric, MetricRow, MetricsExport } from "../types";
import { METRIC_FULL_NAME, METRIC_LABELS } from "../lib/grid";
import type { CompanySeries, TrendPoint } from "../lib/trend";
import {
  MIN_TREND_POINTS,
  SERIES_PALETTE,
  buildAllCompaniesSeries,
  buildSeries,
  distinctCompanies,
  formatAxisTick,
  hasSufficientHistory,
  metricsForCompany,
  metricsPresent,
  seriesBreakdown,
  yDomain,
} from "../lib/trend";

const selectStyle: CSSProperties = {
  padding: "0.3rem 0.5rem",
  fontSize: "0.9rem",
  marginRight: "0.75rem",
};

// Full-size chart geometry (single-company + one-metric overlay).
const W = 680;
const H = 280;
const PAD = { top: 28, right: 32, bottom: 46, left: 72 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;
const LINE_COLOR = "#2b6cb0";

// Compact geometry for the "All metrics" small multiples.
const MW = 340;
const MH = 176;
const MPAD = { top: 20, right: 14, bottom: 30, left: 54 };
const MINNER_W = MW - MPAD.left - MPAD.right;
const MINNER_H = MH - MPAD.top - MPAD.bottom;

type TrendMode = "all" | "single" | "grid";

const MODE_LABELS: Record<TrendMode, string> = {
  all: "All companies",
  single: "One company",
  grid: "All metrics",
};

// Give a series its consistent per-company colour (so a company is the same colour everywhere).
function recolor(series: CompanySeries[], colorOf: Map<string, string>): CompanySeries[] {
  return series.map((s) => ({ ...s, color: colorOf.get(s.company) ?? s.color }));
}

// "Q2 2025" -> "Q2'25" for the cramped small-multiple x axis.
const abbrevPeriod = (p: string) => p.replace(/ 20(\d\d)$/, "'$1");

export function TrendExplorer({
  export: exp,
  onSelectRow,
}: {
  export: MetricsExport;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const metrics = exp.metrics;
  const companies = distinctCompanies(metrics);
  // Default to the all-companies league view (the flagship cross-company story).
  const [mode, setMode] = useState<TrendMode>("all");
  // One consistent colour per company, used across every chart (all-companies + all-metrics).
  const colorOf = new Map(companies.map((c, i) => [c, SERIES_PALETTE[i % SERIES_PALETTE.length]]));

  // ── One-company mode state ───────────────────────────────────────────────────────────
  const defaultCompany = companies.includes("NovaCloud") ? "NovaCloud" : (companies[0] ?? "");
  const [companyChoice, setCompanyChoice] = useState(defaultCompany);
  const company = companies.includes(companyChoice) ? companyChoice : defaultCompany;
  const metricOptions = metricsForCompany(metrics, company);
  const [metricChoice, setMetricChoice] = useState<CanonicalMetric | null>(null);
  const singleMetric: CanonicalMetric | null =
    metricChoice && metricOptions.includes(metricChoice)
      ? metricChoice
      : metricOptions.includes("arr_eop")
        ? "arr_eop"
        : (metricOptions[0] ?? null);

  // ── All-companies mode state ─────────────────────────────────────────────────────────
  const allMetrics = metricsPresent(metrics);
  const [allMetricChoice, setAllMetricChoice] = useState<CanonicalMetric | null>(null);
  const allMetric: CanonicalMetric | null =
    allMetricChoice && allMetrics.includes(allMetricChoice)
      ? allMetricChoice
      : allMetrics.includes("net_revenue_retention_pct")
        ? "net_revenue_retention_pct"
        : allMetrics.includes("arr_eop")
          ? "arr_eop"
          : (allMetrics[0] ?? null);

  if (companies.length === 0) return null;

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Trend over time</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0, maxWidth: 950 }}>
        Quarter-over-quarter. See <em>all companies</em> on one metric, <em>one company</em> across
        its metrics, or <em>every metric</em> at once. Y-axes are standardized per metric — money
        &amp; headcount start at <strong>0</strong>, percentages fit their own range — and each
        company keeps one colour throughout. A trend needs {MIN_TREND_POINTS}+ quarters; fewer shows
        as a snapshot dot.
      </p>

      {/* Mode toggle. */}
      <div style={{ margin: "0.75rem 0", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {(["all", "single", "grid"] as TrendMode[]).map((m) => (
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
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {mode === "single" && (
        <SingleCompanyView
          metrics={metrics}
          companies={companies}
          company={company}
          metric={singleMetric}
          metricOptions={metricOptions}
          onCompanyChange={(c) => {
            setCompanyChoice(c);
            setMetricChoice(null);
          }}
          onMetricChange={(m) => setMetricChoice(m)}
          onSelectRow={onSelectRow}
        />
      )}
      {mode === "all" && (
        <AllCompaniesView
          metrics={metrics}
          metric={allMetric}
          metrics_options={allMetrics}
          colorOf={colorOf}
          onMetricChange={(m) => setAllMetricChoice(m)}
          onSelectRow={onSelectRow}
        />
      )}
      {mode === "grid" && (
        <AllMetricsView
          metrics={metrics}
          allMetrics={allMetrics}
          colorOf={colorOf}
          onSelectRow={onSelectRow}
        />
      )}
    </section>
  );
}

// ── One-company view (the label-drift flagship) ─────────────────────────────────────────
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
  const rawLabels = new Set(points.map((p) => p.rawLabel));

  return (
    <>
      <div style={{ margin: "0.75rem 0" }}>
        <label>
          <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.4rem" }}>Company</span>
          <select style={selectStyle} value={company} onChange={(e) => onCompanyChange(e.target.value)}>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        {metric !== null && (
          <label>
            <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.4rem" }}>Metric</span>
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
          metric={metric}
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
          {METRIC_LABELS[metric]} data — at least {MIN_TREND_POINTS} are needed to show a trend.
        </p>
      )}

      {metric !== null && sufficient && rawLabels.size > 1 && (
        <p style={{ color: "#666", fontSize: "0.8rem", maxWidth: W }}>
          Plotted as one metric across <strong>{rawLabels.size}</strong> different source labels (e.g.{" "}
          {[...rawLabels].slice(0, 2).map((l) => `"${l}"`).join(", ")}) — the backend collapsed the
          label drift into a single series.
        </p>
      )}
    </>
  );
}

// ── All-companies overlay view (one metric) ─────────────────────────────────────────────
function AllCompaniesView({
  metrics,
  metric,
  metrics_options,
  colorOf,
  onMetricChange,
  onSelectRow,
}: {
  metrics: MetricRow[];
  metric: CanonicalMetric | null;
  metrics_options: CanonicalMetric[];
  colorOf: Map<string, string>;
  onMetricChange: (metric: CanonicalMetric) => void;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const built = metric ? buildAllCompaniesSeries(metrics, metric) : { series: [], excluded: [] };
  const series = recolor(built.series, colorOf);
  const excluded = built.excluded;

  const companySector = new Map(metrics.map((m) => [m.company_name, m.sector]));
  const sectorsShown = new Set(series.map((s) => companySector.get(s.company)));

  return (
    <>
      <div style={{ margin: "0.75rem 0" }}>
        {metric !== null && (
          <label>
            <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.4rem" }}>Metric</span>
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
            metric={metric}
            label={METRIC_LABELS[metric]}
            onSelectRow={onSelectRow}
          />
          <Legend series={series} />
          {(() => {
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
              Showing levels across <strong>{sectorsShown.size}</strong> sectors — a cross-sector view
              of trends, not a within-sector ranking. Ratios (NRR, margin) are like-for-like; money
              levels are shown as reported.
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

// ── All-metrics view (small multiples) ──────────────────────────────────────────────────
function AllMetricsView({
  metrics,
  allMetrics,
  colorOf,
  onSelectRow,
}: {
  metrics: MetricRow[];
  allMetrics: CanonicalMetric[];
  colorOf: Map<string, string>;
  onSelectRow?: (row: MetricRow) => void;
}) {
  // Build every metric's overlay once; recolour to the shared company map.
  const perMetric = allMetrics.map((m) => ({
    metric: m,
    series: recolor(buildAllCompaniesSeries(metrics, m).series, colorOf),
  }));
  // A shared legend = every company that appears in any mini-chart (consistent colours).
  const legendCompanies = [...new Set(perMetric.flatMap((pm) => pm.series.map((s) => s.company)))].sort();

  return (
    <>
      {legendCompanies.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1rem", margin: "0.25rem 0 0.75rem" }}>
          {legendCompanies.map((c) => (
            <span key={c} style={{ display: "inline-flex", alignItems: "center", fontSize: "0.8rem", color: "#444" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 3,
                  borderRadius: 2,
                  background: colorOf.get(c),
                  marginRight: "0.35rem",
                }}
              />
              {c}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1rem",
        }}
      >
        {perMetric.map(({ metric, series }) => (
          <MiniChart key={metric} metric={metric} series={series} onSelectRow={onSelectRow} />
        ))}
      </div>

      <p style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.6rem", maxWidth: 950 }}>
        Every metric at a glance. Each chart&apos;s y-axis is standardized for its own type, and a
        series is hidden from a metric only where it is not comparable (a lender&apos;s interest
        margin, or non-USD money) — the same honesty rule as the single-metric view.
      </p>
    </>
  );
}

// A colour-swatch legend under the overlay chart. Swatch shape encodes the kind: a bar for a
// trend line, a dot for a single-quarter snapshot.
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
          {s.kind === "point" && <span style={{ color: "#5b6472", marginLeft: "0.25rem" }}>(snapshot)</span>}
        </span>
      ))}
    </div>
  );
}

// Full-size single-company line chart. Only reached when points.length >= MIN_TREND_POINTS.
function TrendChart({
  points,
  metric,
  label,
  onSelectRow,
}: {
  points: TrendPoint[];
  metric: CanonicalMetric;
  label: string;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const { min: minV, max: maxV } = yDomain(points.map((p) => p.value), metric);
  const span = maxV - minV || 1;
  const x = (i: number) => PAD.left + (i / (points.length - 1)) * INNER_W;
  const y = (v: number) => PAD.top + INNER_H - ((v - minV) / span) * INNER_H;
  const polyline = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, height: "auto", border: "1px solid #eee", borderRadius: 6 }}
      role="img"
      aria-label={`${label} over ${points.length} quarters`}
    >
      {/* standardized y-axis: domain endpoints (not data points) */}
      <line x1={PAD.left} y1={y(maxV)} x2={W - PAD.right} y2={y(maxV)} stroke="#eee" />
      <line x1={PAD.left} y1={y(minV)} x2={W - PAD.right} y2={y(minV)} stroke="#eee" />
      <text x={PAD.left - 8} y={y(maxV)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#5f6672">
        {formatAxisTick(maxV, metric)}
      </text>
      <text x={PAD.left - 8} y={y(minV)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#5f6672">
        {formatAxisTick(minV, metric)}
      </text>

      <polyline points={polyline} fill="none" stroke={LINE_COLOR} strokeWidth="2" />

      {points.map((p, i) => (
        <g key={p.period}>
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

// Full-size all-companies overlay chart: one polyline (or dots) per company on a shared,
// standardized axis.
function AllCompaniesChart({
  series,
  metric,
  label,
  onSelectRow,
}: {
  series: CompanySeries[];
  metric: CanonicalMetric;
  label: string;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const periodKeys = [...new Set(series.flatMap((s) => s.points.map((p) => p.periodKey)))].sort((a, b) => a - b);
  const xIndex = new Map(periodKeys.map((k, i) => [k, i]));
  const keyToPeriod = new Map<number, string>();
  for (const s of series) for (const p of s.points) keyToPeriod.set(p.periodKey, p.period);

  const { min: minV, max: maxV } = yDomain(series.flatMap((s) => s.points.map((p) => p.value)), metric);
  const span = maxV - minV || 1;
  const denom = Math.max(1, periodKeys.length - 1);
  const x = (periodKey: number) => PAD.left + ((xIndex.get(periodKey) ?? 0) / denom) * INNER_W;
  const y = (v: number) => PAD.top + INNER_H - ((v - minV) / span) * INNER_H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, height: "auto", border: "1px solid #eee", borderRadius: 6 }}
      role="img"
      aria-label={`${label} across ${series.length} companies`}
    >
      <line x1={PAD.left} y1={y(maxV)} x2={W - PAD.right} y2={y(maxV)} stroke="#eee" />
      <line x1={PAD.left} y1={y(minV)} x2={W - PAD.right} y2={y(minV)} stroke="#eee" />
      <text x={PAD.left - 8} y={y(maxV)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#5f6672">
        {formatAxisTick(maxV, metric)}
      </text>
      <text x={PAD.left - 8} y={y(minV)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#5f6672">
        {formatAxisTick(minV, metric)}
      </text>

      {periodKeys.map((k) => (
        <text key={k} x={x(k)} y={H - PAD.bottom + 20} textAnchor="middle" fontSize="11" fill="#666">
          {keyToPeriod.get(k)}
        </text>
      ))}

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
              aria-label={onSelectRow ? `${s.company} ${p.period} ${p.displayValue} — view source` : undefined}
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

// Compact all-companies chart for the "All metrics" small multiples: one per metric, acronym
// title, standardized axis, no per-point value labels (kept clean at small size).
function MiniChart({
  metric,
  series,
  onSelectRow,
}: {
  metric: CanonicalMetric;
  series: CompanySeries[];
  onSelectRow?: (row: MetricRow) => void;
}) {
  const periodKeys = [...new Set(series.flatMap((s) => s.points.map((p) => p.periodKey)))].sort((a, b) => a - b);
  const xIndex = new Map(periodKeys.map((k, i) => [k, i]));
  const keyToPeriod = new Map<number, string>();
  for (const s of series) for (const p of s.points) keyToPeriod.set(p.periodKey, p.period);

  const { min: minV, max: maxV } = yDomain(series.flatMap((s) => s.points.map((p) => p.value)), metric);
  const span = maxV - minV || 1;
  const denom = Math.max(1, periodKeys.length - 1);
  const x = (periodKey: number) => MPAD.left + ((xIndex.get(periodKey) ?? 0) / denom) * MINNER_W;
  const y = (v: number) => MPAD.top + MINNER_H - ((v - minV) / span) * MINNER_H;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 6, padding: "0.5rem 0.6rem", background: "#fff" }}>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a202c" }}>
        {METRIC_LABELS[metric]}{" "}
        <span style={{ fontWeight: 400, fontSize: "0.72em", color: "#858b94" }}>
          · {METRIC_FULL_NAME[metric]}
        </span>
      </div>
      {series.length === 0 ? (
        <div style={{ color: "#858b94", fontSize: "0.8rem", padding: "1.5rem 0", textAlign: "center" }}>
          No comparable series
        </div>
      ) : (
        <svg viewBox={`0 0 ${MW} ${MH}`} width="100%" style={{ height: "auto" }} role="img" aria-label={`${METRIC_LABELS[metric]} across ${series.length} companies`}>
          <line x1={MPAD.left} y1={y(maxV)} x2={MW - MPAD.right} y2={y(maxV)} stroke="#eee" />
          <line x1={MPAD.left} y1={y(minV)} x2={MW - MPAD.right} y2={y(minV)} stroke="#eee" />
          <text x={MPAD.left - 6} y={y(maxV)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#858b94">
            {formatAxisTick(maxV, metric)}
          </text>
          <text x={MPAD.left - 6} y={y(minV)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#858b94">
            {formatAxisTick(minV, metric)}
          </text>
          {periodKeys.map((k) => (
            <text key={k} x={x(k)} y={MH - MPAD.bottom + 14} textAnchor="middle" fontSize="9" fill="#858b94">
              {abbrevPeriod(keyToPeriod.get(k) ?? "")}
            </text>
          ))}
          {series.map((s) => (
            <g key={s.company}>
              {s.kind === "line" && (
                <polyline
                  points={s.points.map((p) => `${x(p.periodKey)},${y(p.value)}`).join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="1.8"
                />
              )}
              {s.points.map((p) => (
                <circle
                  key={p.period}
                  cx={x(p.periodKey)}
                  cy={y(p.value)}
                  r={s.kind === "line" ? 2.5 : 4}
                  fill={s.color}
                  stroke={s.kind === "point" ? "#fff" : undefined}
                  strokeWidth={s.kind === "point" ? 1.2 : undefined}
                  style={onSelectRow ? { cursor: "pointer" } : undefined}
                  role={onSelectRow ? "button" : undefined}
                  tabIndex={onSelectRow ? 0 : undefined}
                  aria-label={onSelectRow ? `${s.company} ${p.period} ${p.displayValue} — view source` : undefined}
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
                    {s.kind === "point" ? " (snapshot)" : ""}
                  </title>
                </circle>
              ))}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
