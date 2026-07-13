// Exceptions / early-warning panel (Phase 3, part 3). Lists metrics that are EXPECTED for a
// company (given its sector) but were not reported — genuine gaps, not structural N/A. The
// backend already makes this sector-aware (a credit lender is never asked for SaaS metrics),
// so the frontend renders faithfully and must NOT re-derive "missing" itself. Logic in
// ../lib/comparison (unit-tested); thin renderer here.

import type { MetricsExport } from "../types";
import { METRIC_LABELS, SECTOR_LABELS } from "../lib/grid";
import { missingMetricsByCompany, totalMissingCount } from "../lib/comparison";

export function ExceptionsPanel({ export: exp }: { export: MetricsExport }) {
  const groups = missingMetricsByCompany(exp.metrics, exp.issues);
  if (groups.length === 0) return null;
  const total = totalMissingCount(groups);

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.15rem" }}>Exceptions — expected metrics not reported</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0, maxWidth: 900 }}>
        <strong>Your &quot;chase this up&quot; list — what a company should have reported this
        quarter but didn&apos;t.</strong>
      </p>
      <p style={{ color: "#666", fontSize: "0.85rem", margin: "0.4rem 0 0", maxWidth: 900 }}>
        Each company is only checked for the metrics its <em>business type</em> is expected to
        report, so these <strong>{total}</strong> gaps across <strong>{groups.length}</strong>{" "}
        {groups.length === 1 ? "company" : "companies"} are <em>real</em> ones worth a follow-up —
        not noise. It is sector-smart: a lender is never flagged for &quot;missing ARR&quot;, because
        lenders don&apos;t have ARR — so you never waste time chasing a metric that never existed.
      </p>

      <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
        {groups.map((group) => (
          <li key={group.company} style={{ margin: "0.3rem 0" }}>
            <strong>{group.company}</strong>{" "}
            {group.sector && (
              <span style={{ color: "#5b6472" }}>({SECTOR_LABELS[group.sector]})</span>
            )}{" "}
            — {group.metrics.map((m) => METRIC_LABELS[m]).join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
}
