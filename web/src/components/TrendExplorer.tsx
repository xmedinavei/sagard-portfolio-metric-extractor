// Over-time trend explorer.
//
// ONE primary surface — "every metric at a glance" small multiples — plus one scope knob:
//   * "All companies" (DEFAULT) — each mini-chart overlays every comparable company;
//   * "One company"            — each mini-chart shows just the chosen company's own trend.
// The mini-charts are GROUPED exactly like the tables (Grow · Profit / Keep / Fund / Scale) so
// the two sections tell the same story in the same order. Three charts per row so each is legible;
// click any chart to ENLARGE it in a modal (where you can trace a point back to its source doc).
//
// Y-axes are STANDARDIZED per metric (money & counts anchored at 0; percentages fitted to the
// nearest 5) and each company keeps ONE colour across every chart. All ordering/axis/series logic
// lives in ../lib/trend so it stays unit-testable; this file is a thin, dependency-light inline-SVG
// renderer (no chart library, to keep the offline bundle small). Comparability is still enforced:
// a lender's interest-margin (a different basis) and non-USD money (PeopleFlow's GBP) are excluded
// from a metric and NAMED, never silently overlaid on a shared axis.

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import type { CanonicalMetric, MetricRow, MetricsExport } from "../types";
import { METRIC_FULL_NAME, METRIC_GROUPS, METRIC_LABELS } from "../lib/grid";
import type { CompanySeries, ExcludedSeries, TrendPoint } from "../lib/trend";
import {
  MIN_TREND_POINTS,
  SERIES_PALETTE,
  buildAllCompaniesSeries,
  distinctCompanies,
  formatAxisTick,
  metricsPresent,
  seriesBreakdown,
  yDomain,
} from "../lib/trend";
import { HEAT_DIRECTION } from "../lib/heat";

const selectStyle: CSSProperties = {
  padding: "0.3rem 0.5rem",
  fontSize: "0.9rem",
  marginLeft: "0.4rem",
};

// Full-size chart geometry (the enlarge-modal chart).
const W = 720;
const H = 300;
const PAD = { top: 30, right: 34, bottom: 48, left: 74 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

// Compact geometry for the small multiples.
const MW = 340;
const MH = 176;
const MPAD = { top: 20, right: 14, bottom: 30, left: 54 };
const MINNER_W = MW - MPAD.left - MPAD.right;
const MINNER_H = MH - MPAD.top - MPAD.bottom;

type Scope = "all" | "one";

// A pill toggle button style shared by the scope control.
const pillStyle = (active: boolean): CSSProperties => ({
  padding: "0.3rem 0.75rem",
  fontSize: "0.85rem",
  cursor: "pointer",
  border: "1px solid #cbd5e0",
  borderRadius: 6,
  background: active ? "#2b6cb0" : "#fff",
  color: active ? "#fff" : "#333",
});

// The Grow/Keep/Fund/Scale banner above each block of mini-charts — mirrors the grid's group banner.
const groupBanner: CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#4a5568",
  background: "#f2f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "0.35rem 0.65rem",
  margin: "1.2rem 0 0.65rem",
};

// Give a series its consistent per-company colour (so a company is the same colour everywhere).
function recolor(series: CompanySeries[], colorOf: Map<string, string>): CompanySeries[] {
  return series.map((s) => ({ ...s, color: colorOf.get(s.company) ?? s.color }));
}

// In ONE-company scope, colour a metric's line by that company's OWN direction of travel over the
// period (first → last), honouring what "good" means for the metric (HEAT_DIRECTION): improving =
// green, worsening = red, no good/bad direction (headcount) or too few points = neutral slate. A
// FALLING logo churn or a rising (less-negative) burn are improvements → green. All-companies scope
// keeps the per-company palette instead (that view distinguishes companies, not direction).
const TREND_GOOD = "#2f7a46";
const TREND_BAD = "#b3401f";
const TREND_NEUTRAL = "#5b6472";
function directionColor(metric: CanonicalMetric, points: TrendPoint[]): string {
  const direction = HEAT_DIRECTION[metric];
  if (!direction || points.length < 2) return TREND_NEUTRAL;
  const change = points[points.length - 1].value - points[0].value;
  if (change === 0) return TREND_NEUTRAL;
  const improving = direction === "higher_better" ? change > 0 : change < 0;
  return improving ? TREND_GOOD : TREND_BAD;
}

// "Q2 2025" -> "Q2'25" for the cramped small-multiple x axis.
const abbrevPeriod = (p: string) => p.replace(/ 20(\d\d)$/, "'$1");

// A metric's series + exclusions, already recoloured and (in one-company scope) filtered to the
// chosen company. Built from the SAME buildAllCompaniesSeries used cross-company, so one-company
// scope inherits the identical comparability rules (refused basis / non-USD money → excluded).
interface ScopedMetric {
  series: CompanySeries[];
  excluded: ExcludedSeries[];
}

export function TrendExplorer({
  export: exp,
  onSelectRow,
}: {
  export: MetricsExport;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const metrics = exp.metrics;
  const companies = distinctCompanies(metrics);
  // One consistent colour per company, used across every chart.
  const colorOf = new Map(companies.map((c, i) => [c, SERIES_PALETTE[i % SERIES_PALETTE.length]]));

  // Scope: all companies (default) or one company. `expanded` drives the enlarge modal.
  const [scope, setScope] = useState<Scope>("all");
  const defaultCompany = companies.includes("NovaCloud") ? "NovaCloud" : (companies[0] ?? "");
  const [companyChoice, setCompanyChoice] = useState(defaultCompany);
  const company = companies.includes(companyChoice) ? companyChoice : defaultCompany;
  const [expanded, setExpanded] = useState<CanonicalMetric | null>(null);

  if (companies.length === 0) return null;

  // Build every present metric's scoped result once (canonical/grouped order preserved downstream).
  const present = new Set(metricsPresent(metrics));
  const scoped = new Map<CanonicalMetric, ScopedMetric>();
  for (const m of metricsPresent(metrics)) {
    const built = buildAllCompaniesSeries(metrics, m);
    let series = recolor(built.series, colorOf);
    let excluded = built.excluded;
    if (scope === "one") {
      // One company: keep only its series, and colour the line by its own direction (green rising /
      // red falling, per the metric's good direction) instead of the company palette colour.
      series = series
        .filter((s) => s.company === company)
        .map((s) => ({ ...s, color: directionColor(m, s.points) }));
      excluded = excluded.filter((e) => e.company === company);
    }
    scoped.set(m, { series, excluded });
  }

  // A metric earns a card when there is something to show for the current scope (a series, or an
  // honest "excluded" note). In one-company scope this naturally hides metrics the company omits.
  const hasCard = (m: CanonicalMetric) => {
    const r = scoped.get(m);
    return !!r && (r.series.length > 0 || r.excluded.length > 0);
  };

  // The company colour legend (all-companies scope only — one-company scope is self-evident).
  const companiesShown = [
    ...new Set(
      [...scoped.values()].flatMap((r) => r.series.map((s) => s.company)),
    ),
  ].sort();

  // Reset the modal whenever scope/company changes so it never points at a now-absent metric.
  const changeScope = (s: Scope) => {
    setScope(s);
    setExpanded(null);
  };
  const changeCompany = (c: string) => {
    setCompanyChoice(c);
    setExpanded(null);
  };

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16233d", borderBottom: "2px solid #e8ecf2", paddingBottom: "0.3rem", marginBottom: "0.6rem" }}>Trend over time</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0, maxWidth: 950 }}>
        Every metric at a glance, quarter over quarter — for <em>all companies</em> at once, or drill
        into <em>one</em>. Charts are grouped like the tables (Grow · Profit / Keep / Fund / Scale).
        Y-axes are
        standardized per metric — money &amp; headcount start at <strong>0</strong>, percentages fit
        their own range. In <em>all companies</em> each company keeps its own colour; in{" "}
        <em>one company</em> each line is coloured by its direction —{" "}
        <span style={{ color: "#2f7a46", fontWeight: 600 }}>green</span> where the metric is improving,{" "}
        <span style={{ color: "#b3401f", fontWeight: 600 }}>red</span> where it is worsening (a falling
        churn is an improvement → green; headcount has no good/bad direction → neutral). A trend needs{" "}
        {MIN_TREND_POINTS}+ quarters; fewer shows as a snapshot dot. <strong>Click any chart</strong>{" "}
        to enlarge it and trace a number to its source.
      </p>

      {/* Scope control: all companies vs one company. */}
      <div style={{ margin: "0.75rem 0", display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.8rem", color: "#666", marginRight: "0.2rem" }}>Show:</span>
        <button type="button" onClick={() => changeScope("all")} aria-pressed={scope === "all"} style={pillStyle(scope === "all")}>
          All companies
        </button>
        <button type="button" onClick={() => changeScope("one")} aria-pressed={scope === "one"} style={pillStyle(scope === "one")}>
          One company
        </button>
        {scope === "one" && (
          <label style={{ fontSize: "0.8rem", color: "#666", marginLeft: "0.3rem" }}>
            Company
            <select style={selectStyle} value={company} onChange={(e) => changeCompany(e.target.value)}>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Shared company-colour legend (all-companies scope). */}
      {scope === "all" && companiesShown.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1rem", margin: "0.25rem 0 0.5rem" }}>
          {companiesShown.map((c) => (
            <span key={c} style={{ display: "inline-flex", alignItems: "center", fontSize: "0.8rem", color: "#444" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 5,
                  borderRadius: 2,
                  background: colorOf.get(c),
                  marginRight: "0.4rem",
                }}
              />
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Grouped small multiples — one block per metric group, three charts per row. */}
      {METRIC_GROUPS.map((group) => {
        const cards = group.metrics.filter((m) => present.has(m) && hasCard(m));
        if (cards.length === 0) return null; // e.g. one-company scope where the company omits the whole group
        return (
          <div key={group.label}>
            <div style={groupBanner}>{group.label}</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "1rem",
                alignItems: "start",
              }}
            >
              {cards.map((m) => {
                const r = scoped.get(m)!;
                if (r.series.length === 0) return <ExcludedCard key={m} metric={m} excluded={r.excluded} />;
                return <MiniChart key={m} metric={m} series={r.series} onExpand={() => setExpanded(m)} />;
              })}
            </div>
          </div>
        );
      })}

      <p style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.9rem", maxWidth: 950 }}>
        A series is hidden from a metric only where it is not comparable — a lender&apos;s interest
        margin (a different basis) or non-USD money (kept off a shared&nbsp;$ axis) — never silently
        dropped. Click a chart to see which, and to trace any point to its source document.
      </p>

      {expanded !== null && scoped.get(expanded) && (
        <ChartModal
          metric={expanded}
          scope={scope}
          company={company}
          series={scoped.get(expanded)!.series}
          excluded={scoped.get(expanded)!.excluded}
          onClose={() => setExpanded(null)}
          onSelectRow={onSelectRow}
        />
      )}
    </section>
  );
}

// A muted card for a metric that exists for this scope but is not comparable here (one-company
// scope, e.g. PeopleFlow revenue reported in GBP). Honest placeholder, not a blank.
function ExcludedCard({ metric, excluded }: { metric: CanonicalMetric; excluded: ExcludedSeries[] }) {
  return (
    <div style={{ border: "1px dashed #d7dde5", borderRadius: 6, padding: "0.5rem 0.6rem", background: "#fafbfc" }}>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a202c" }}>
        {METRIC_LABELS[metric]}{" "}
        <span style={{ fontWeight: 400, fontSize: "0.72em", color: "#858b94" }}>· {METRIC_FULL_NAME[metric]}</span>
      </div>
      <div style={{ color: "#858b94", fontSize: "0.78rem", padding: "1.2rem 0", textAlign: "center" }}>
        Not shown — {excluded.map((e) => e.reason).join("; ")}.
      </div>
    </div>
  );
}

// A colour-swatch legend. Swatch shape encodes the kind: a bar for a trend line, a dot for a
// single-quarter snapshot.
function Legend({ series }: { series: CompanySeries[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1rem", marginTop: "0.4rem" }}>
      {series.map((s) => (
        <span key={s.company} style={{ display: "inline-flex", alignItems: "center", fontSize: "0.8rem", color: "#444" }}>
          <span
            style={
              s.kind === "line"
                ? { display: "inline-block", width: 22, height: 5, borderRadius: 2, background: s.color, marginRight: "0.4rem" }
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

// The full-size overlay chart used inside the enlarge modal: one polyline (or dots) per company on
// a shared, standardized axis. `showValues` prints per-point value labels — clean when it is a
// single company's own trend, too busy for a multi-company overlay, so the caller sets it.
function BigChart({
  series,
  metric,
  label,
  showValues,
  onSelectRow,
}: {
  series: CompanySeries[];
  metric: CanonicalMetric;
  label: string;
  showValues: boolean;
  onSelectRow?: (row: MetricRow) => void;
}) {
  const periodKeys = [...new Set(series.flatMap((s) => s.points.map((p) => p.periodKey)))].sort((a, b) => a - b);
  const xIndex = new Map(periodKeys.map((k, i) => [k, i]));
  const keyToPeriod = new Map<number, string>();
  for (const s of series) for (const p of s.points) keyToPeriod.set(p.periodKey, p.period);

  const { min: minV, max: maxV } = yDomain(series.flatMap((s) => s.points.map((p) => p.value)), metric);
  const span = maxV - minV || 1;
  const denom = Math.max(1, periodKeys.length - 1);
  // A lone quarter (all shown companies report the same single period — common in this corpus)
  // centers instead of pinning to the far-left edge.
  const x = (periodKey: number) =>
    periodKeys.length === 1
      ? PAD.left + INNER_W / 2
      : PAD.left + ((xIndex.get(periodKey) ?? 0) / denom) * INNER_W;
  const y = (v: number) => PAD.top + INNER_H - ((v - minV) / span) * INNER_H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ height: "auto", border: "1px solid #eee", borderRadius: 6 }}
      role="img"
      aria-label={`${label} across ${series.length} ${series.length === 1 ? "company" : "companies"}`}
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
            <>
              {/* Wide invisible "hit line" makes the thin line easy to hover; the native <title>
                  names the company so you never have to colour-match against the legend. */}
              <polyline
                points={s.points.map((p) => `${x(p.periodKey)},${y(p.value)}`).join(" ")}
                fill="none"
                stroke="transparent"
                strokeWidth="14"
              >
                <title>{s.company}</title>
              </polyline>
              <polyline
                points={s.points.map((p) => `${x(p.periodKey)},${y(p.value)}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
              >
                <title>{s.company}</title>
              </polyline>
            </>
          )}
          {s.points.map((p) => (
            <g key={p.period}>
              {showValues && (
                <text x={x(p.periodKey)} y={y(p.value) - 10} textAnchor="middle" fontSize="11" fill="#333">
                  {p.displayValue}
                </text>
              )}
              <circle
                cx={x(p.periodKey)}
                cy={y(p.value)}
                r={s.kind === "line" ? 4 : 5.5}
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
                  {onSelectRow ? " — click to see the source" : ""}
                </title>
              </circle>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

// A compact overlay chart for the small multiples: one per metric, acronym title, standardized
// axis, no per-point value labels (kept clean at small size). The WHOLE card is a button — click
// it to enlarge. Points are non-interactive here; source-tracing lives in the enlarged view.
function MiniChart({
  metric,
  series,
  onExpand,
}: {
  metric: CanonicalMetric;
  series: CompanySeries[];
  onExpand: () => void;
}) {
  const periodKeys = [...new Set(series.flatMap((s) => s.points.map((p) => p.periodKey)))].sort((a, b) => a - b);
  const xIndex = new Map(periodKeys.map((k, i) => [k, i]));
  const keyToPeriod = new Map<number, string>();
  for (const s of series) for (const p of s.points) keyToPeriod.set(p.periodKey, p.period);

  const { min: minV, max: maxV } = yDomain(series.flatMap((s) => s.points.map((p) => p.value)), metric);
  const span = maxV - minV || 1;
  const denom = Math.max(1, periodKeys.length - 1);
  const x = (periodKey: number) =>
    periodKeys.length === 1
      ? MPAD.left + MINNER_W / 2
      : MPAD.left + ((xIndex.get(periodKey) ?? 0) / denom) * MINNER_W;
  const y = (v: number) => MPAD.top + MINNER_H - ((v - minV) / span) * MINNER_H;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onExpand();
        }
      }}
      title={`Click to enlarge ${METRIC_LABELS[metric]}`}
      style={{
        border: "1px solid #eee",
        borderRadius: 6,
        padding: "0.5rem 0.6rem",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a202c" }}>
          {METRIC_LABELS[metric]}{" "}
          <span style={{ fontWeight: 400, fontSize: "0.72em", color: "#858b94" }}>· {METRIC_FULL_NAME[metric]}</span>
        </div>
        <span aria-hidden style={{ fontSize: "0.8rem", color: "#a0aec0" }}>⤢</span>
      </div>
      <svg viewBox={`0 0 ${MW} ${MH}`} width="100%" style={{ height: "auto" }} role="img" aria-label={`${METRIC_LABELS[metric]} across ${series.length} companies — click to enlarge`}>
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
              <>
                {/* Invisible hit line + native <title>: hover a line to read the company name. */}
                <polyline
                  points={s.points.map((p) => `${x(p.periodKey)},${y(p.value)}`).join(" ")}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="10"
                >
                  <title>{s.company}</title>
                </polyline>
                <polyline
                  points={s.points.map((p) => `${x(p.periodKey)},${y(p.value)}`).join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                >
                  <title>{s.company}</title>
                </polyline>
              </>
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
    </div>
  );
}

// The enlarge modal — a bigger version of the clicked chart, with the legend, an honest breakdown
// caption, any excluded-company note, and (one-company scope) the label-drift note. Clicking a
// point traces it to its source doc: we close the modal, then open the provenance drawer.
function ChartModal({
  metric,
  scope,
  company,
  series,
  excluded,
  onClose,
  onSelectRow,
}: {
  metric: CanonicalMetric;
  scope: Scope;
  company: string;
  series: CompanySeries[];
  excluded: ExcludedSeries[];
  onClose: () => void;
  onSelectRow?: (row: MetricRow) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const title = scope === "one" ? `${company} — ${METRIC_LABELS[metric]}` : METRIC_LABELS[metric];
  const singleSeries = series.length === 1;
  // Label-drift note: one company's series can span several source labels the backend collapsed.
  const rawLabels = singleSeries ? [...new Set(series[0].points.map((p) => p.rawLabel))] : [];
  const b = seriesBreakdown(series);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — enlarged chart`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "1.5rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "1.1rem 1.3rem 1.3rem",
          maxWidth: "min(94vw, 940px)",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a202c" }}>{title}</div>
            <div style={{ fontSize: "0.82rem", color: "#718096" }}>{METRIC_FULL_NAME[metric]}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close enlarged chart"
            style={{
              border: "1px solid #cbd5e0",
              borderRadius: 6,
              background: "#fff",
              cursor: "pointer",
              fontSize: "0.85rem",
              padding: "0.25rem 0.6rem",
              color: "#333",
            }}
          >
            Close ✕
          </button>
        </div>

        {series.length === 0 ? (
          <p role="status" style={{ color: "#c77700", background: "#fff8ec", border: "1px solid #f0dcae", borderRadius: 6, padding: "0.75rem 1rem" }}>
            No comparable series for {METRIC_LABELS[metric]} in this scope.
          </p>
        ) : (
          <>
            <BigChart
              series={series}
              metric={metric}
              label={title}
              showValues={singleSeries}
              onSelectRow={onSelectRow ? (row) => { onClose(); onSelectRow(row); } : undefined}
            />
            <Legend series={series} />
            {!singleSeries && (
              <p style={{ color: "#5b6472", fontSize: "0.8rem", marginTop: "0.4rem" }}>
                <strong>{b.total}</strong> {b.total === 1 ? "company" : "companies"} shown
                {b.lines > 0 && ` · ${b.lines} as trend ${b.lines === 1 ? "line" : "lines"} (3+ quarters)`}
                {b.points > 0 && ` · ${b.points} as single-quarter ${b.points === 1 ? "snapshot dot" : "snapshot dots"}`}
                . A company with one reported quarter is drawn as a dot, never a fabricated line.
              </p>
            )}
            {singleSeries && rawLabels.length > 1 && (
              <p style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.4rem" }}>
                Plotted as one metric across <strong>{rawLabels.length}</strong> different source labels
                (e.g. {rawLabels.slice(0, 2).map((l) => `"${l}"`).join(", ")}) — the backend collapsed the
                label drift into a single series.
              </p>
            )}
            {onSelectRow && (
              <p style={{ color: "#718096", fontSize: "0.78rem", marginTop: "0.35rem" }}>
                Click any point to trace that number back to its source document.
              </p>
            )}
          </>
        )}

        {excluded.length > 0 && (
          <p style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.5rem" }}>
            Hidden from this chart (kept honest, not silently dropped):{" "}
            {excluded.map((e, i) => (
              <span key={e.company}>
                {i > 0 ? "; " : ""}
                <strong>{e.company}</strong> ({e.reason})
              </span>
            ))}
            .
          </p>
        )}
      </div>
    </div>
  );
}
