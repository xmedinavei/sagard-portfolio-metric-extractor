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
      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 0 }}>
        <strong>{total}</strong> sector-appropriate gaps across <strong>{groups.length}</strong>{" "}
        {groups.length === 1 ? "company" : "companies"}. Only metrics that a company&apos;s
        sector is expected to report are flagged — a lender is never marked &quot;missing&quot;
        for a SaaS metric it was never asked for.
      </p>

      <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
        {groups.map((group) => (
          <li key={group.company} style={{ margin: "0.3rem 0" }}>
            <strong>{group.company}</strong>{" "}
            {group.sector && (
              <span style={{ color: "#888" }}>({SECTOR_LABELS[group.sector]})</span>
            )}{" "}
            — {group.metrics.map((m) => METRIC_LABELS[m]).join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
}
