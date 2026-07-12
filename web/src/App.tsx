import { useEffect, useState } from "react";

import { fetchMetrics } from "./api";
import type { MetricsExport } from "./types";

// Phase-0 shell: the smallest app that proves the API seam is live. It runs the
// state machine idle -> loading -> loaded -> error and, on mount, reads the last
// export from GET /api/metrics. Phase 1 adds the found-reports list + Load button;
// Phases 2-4 add the panels. This shell binds only the frozen §A.4 export fields.
type Status = "idle" | "loading" | "loaded" | "error";

export function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<MetricsExport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMetrics()
      .then((result) => {
        if (cancelled) return;
        setData(result.export);
        setStatus(result.export ? "loaded" : "idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 820,
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <h1>Portfolio Cockpit</h1>
      <p style={{ color: "#666" }}>
        Local, offline monitoring cockpit — Sagard case study.
      </p>

      {status === "loading" && <p>Loading…</p>}

      {status === "error" && (
        <p role="alert" style={{ color: "#b00020" }}>
          Could not reach the API: {error}
        </p>
      )}

      {status === "idle" && (
        <p>No run yet — load the intake reports to populate the cockpit.</p>
      )}

      {status === "loaded" && data && (
        <p>
          Loaded <strong>{data.export_metadata.metric_count}</strong> metrics from{" "}
          <strong>{data.export_metadata.document_count}</strong> reports (schema{" "}
          {data.export_metadata.schema_version}).
        </p>
      )}
    </main>
  );
}
