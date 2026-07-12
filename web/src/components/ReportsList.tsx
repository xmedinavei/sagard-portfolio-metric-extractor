// Pre-run panel (Phase 1): shows the intake PDFs found by GET /api/reports *before*
// any processing (success criterion #7), plus the "Load reports" button that triggers
// the one-click in-memory run. Presentational only — App owns the fetch and the
// onLoad handler, so this stays trivial to reason about.

import type { ReportsResponse } from "../types";

interface ReportsListProps {
  reports: ReportsResponse | null; // null until GET /api/reports resolves
  reportsError: string | null; // a scan failure — never blocks the Load button
  loading: boolean; // true while POST /api/run is in flight
  onLoad: () => void;
}

export function ReportsList({ reports, reportsError, loading, onLoad }: ReportsListProps) {
  return (
    <section>
      {!loading && (
        <p>No run yet — load the intake reports to populate the cockpit.</p>
      )}

      <button
        onClick={onLoad}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Loading…" : "Load reports"}
      </button>

      {reports && (
        <>
          <p style={{ marginBottom: "0.25rem" }}>
            <strong>{reports.count}</strong>{" "}
            {reports.count === 1 ? "report" : "reports"} found in{" "}
            <code>{reports.intake_dir}/</code> — not processed yet.
          </p>
          <ul style={{ marginTop: 0, color: "#444" }}>
            {reports.reports.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </>
      )}

      {!reports && !reportsError && <p style={{ color: "#888" }}>Scanning intake folder…</p>}

      {reportsError && (
        <p style={{ color: "#888" }}>
          Could not list the intake folder ({reportsError}) — you can still load.
        </p>
      )}
    </section>
  );
}
