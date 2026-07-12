// Over-time trend explorer (Phase 2 — flagship insight #1). Reads the loaded export and
// plots one company/metric as a multi-quarter line. The demo default is NovaCloud ARR,
// which renders as a single continuous 5-quarter line (24.1 -> 34.2M) even though the
// source PDFs renamed the label — the backend collapsed those renames into one
// canonical_metric, so we simply plot period vs value. When a series has fewer than
// MIN_TREND_POINTS distinct quarters we show "insufficient history" instead of
// fabricating a trend (success criterion #6). All ordering/guarding logic lives in
// ../lib/trend so it stays unit-testable without a DOM; this file is a thin renderer
// (dependency-light inline SVG — no chart library, to keep the offline bundle small).

import type { CSSProperties } from "react";
import { useState } from "react";

import type { CanonicalMetric, MetricRow, MetricsExport } from "../types";
import { METRIC_LABELS } from "../lib/grid";
import type { TrendPoint } from "../lib/trend";
import {
  MIN_TREND_POINTS,
  buildSeries,
  distinctCompanies,
  hasSufficientHistory,
  metricsForCompany,
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

export function TrendExplorer({
  export: exp,
  onSelectRow,
}: {
  export: MetricsExport;
  // Optional (Phase 4): clicking a plotted point reports its source row so App can open
  // the provenance drawer. Absent = the trend renders exactly as in Phase 2.
  onSelectRow?: (row: MetricRow) => void;
}) {
  const metrics = exp.metrics;
  const companies = distinctCompanies(metrics);

  // Demo default is NovaCloud; fall back to the first company if it is absent.
  const defaultCompany = companies.includes("NovaCloud") ? "NovaCloud" : (companies[0] ?? "");
  const [companyChoice, setCompanyChoice] = useState(defaultCompany);
  // The *effective* company: the user's choice if still valid, else the default. Deriving
  // it each render (instead of an effect) keeps the panel correct if the loaded export
  // changes underneath it — no stale selection to clean up.
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

  // Defensive: App only renders this panel when an export is loaded, but an empty export
  // (or a company with no metrics) has nothing to trend.
  if (companies.length === 0 || metric === null) return null;

  const points = buildSeries(metrics, company, metric);
  const sufficient = hasSufficientHistory(points);

  // How many DISTINCT source labels collapsed into this one series — the flagship's "one
  // line despite renames" story. Derived from the PLOTTED points (not a re-filter of the
  // raw metrics) so the count can never disagree with what's actually on the line;
  // computed honestly from the data (never hardcoded) and only shown when there is real
  // drift (> 1 label).
  const rawLabels = new Set(points.map((p) => p.rawLabel));

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Trend over time</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        Quarter-over-quarter for one company &amp; metric. A trend needs at least{" "}
        {MIN_TREND_POINTS} quarters — below that we show <em>insufficient history</em>{" "}
        rather than guess.
      </p>

      <div style={{ margin: "0.75rem 0" }}>
        <label>
          <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.4rem" }}>
            Company
          </span>
          <select
            style={selectStyle}
            value={company}
            onChange={(e) => {
              setCompanyChoice(e.target.value);
              setMetricChoice(null); // reset the metric to the new company's default
            }}
          >
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.4rem" }}>
            Metric
          </span>
          <select
            style={selectStyle}
            value={metric}
            onChange={(e) => setMetricChoice(e.target.value as CanonicalMetric)}
          >
            {metricOptions.map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sufficient ? (
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

      {sufficient && rawLabels.size > 1 && (
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
    </section>
  );
}

// The inline SVG line chart. Only reached when points.length >= MIN_TREND_POINTS (>= 3),
// so `points.length - 1` is always >= 2 (no divide-by-zero on the x axis).
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
      <text
        x={PAD.left - 8}
        y={y(maxV)}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize="11"
        fill="#999"
      >
        {maxPoint?.displayValue}
      </text>
      <text
        x={PAD.left - 8}
        y={y(minV)}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize="11"
        fill="#999"
      >
        {minPoint?.displayValue}
      </text>

      {/* the trend line */}
      <polyline points={polyline} fill="none" stroke={LINE_COLOR} strokeWidth="2" />

      {/* points + per-point value and period labels */}
      {points.map((p, i) => (
        <g key={p.period}>
          {/* A larger transparent hit target makes the point easy to click (Phase 4). */}
          {onSelectRow && (
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r="12"
              fill="transparent"
              style={{ cursor: "pointer" }}
              onClick={() => onSelectRow(p.row)}
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
          <text
            x={x(i)}
            y={H - PAD.bottom + 20}
            textAnchor="middle"
            fontSize="11"
            fill="#666"
          >
            {p.period}
          </text>
        </g>
      ))}
    </svg>
  );
}
