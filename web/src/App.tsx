import { useEffect, useState } from "react";

import { fetchMetrics, fetchReports, runPipeline } from "./api";
import { RagGrid } from "./components/RagGrid";
import { ReportsList } from "./components/ReportsList";
import { initialStatus } from "./lib/appState";
import type { MetricsExport, ReportsResponse } from "./types";

// App shell + shared "loaded export" state. The state machine is idle -> loading ->
// loaded -> error. `data` (the last MetricsExport) IS the shared loaded-export seam
// that later phases' panels read via props — Phase 1 renders <RagGrid>, Phases 2-4
// add <TrendExplorer>/<RefusePanel>/<ProvenanceDrawer> the same way. Binds only the
// frozen §A.4 export fields; never the 3 RESERVED ones.
type Status = "idle" | "loading" | "loaded" | "error";

// The POST /api/run envelope header (§A.2), kept so the UI can show "24/24 in 0.9 s".
interface RunMeta {
  parsed: number;
  total: number;
  elapsed_s: number;
}

export function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<MetricsExport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportsResponse | null>(null);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [runMeta, setRunMeta] = useState<RunMeta | null>(null);

  // Cold start: read the last export (if the server already ran this process). This
  // effect OWNS the initial status transition — result.export ? loaded : idle — so a
  // fresh server (no prior run) lands on the idle prompt. (Preserved from Phase 0.)
  useEffect(() => {
    let cancelled = false;
    fetchMetrics()
      .then((result) => {
        if (cancelled) return;
        setData(result.export);
        setStatus(initialStatus(result.export));
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

  // Independent of the cold-start effect: list the intake PDFs found *before* any run
  // (success criterion #7). A scan failure sets only `reportsError` — it must NOT flip
  // the app to the error state (that is reserved for the metrics API being unreachable).
  useEffect(() => {
    let cancelled = false;
    fetchReports()
      .then((result) => {
        if (cancelled) return;
        setReports(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setReportsError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The one-click load: POST /api/run (in-memory, offline), then store the returned
  // export as the shared loaded state and surface the parsed/total/elapsed header.
  function handleLoad() {
    setStatus("loading");
    setError(null);
    runPipeline()
      .then((result) => {
        setData(result.export);
        setRunMeta({
          parsed: result.parsed,
          total: result.total,
          elapsed_s: result.elapsed_s,
        });
        setStatus("loaded");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      });
  }

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 1100,
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <h1>Portfolio Cockpit</h1>
      <p style={{ color: "#666" }}>
        Local, offline monitoring cockpit — Sagard case study.
      </p>

      {status === "error" && (
        <p role="alert" style={{ color: "#b00020" }}>
          Could not reach the API: {error}
        </p>
      )}

      {(status === "idle" || status === "loading") && (
        <ReportsList
          reports={reports}
          reportsError={reportsError}
          loading={status === "loading"}
          onLoad={handleLoad}
        />
      )}

      {status === "loaded" && data && (
        <>
          <p>
            Loaded <strong>{data.export_metadata.metric_count}</strong> metrics from{" "}
            <strong>{data.export_metadata.document_count}</strong> reports (schema{" "}
            {data.export_metadata.schema_version}).
          </p>

          {runMeta && (
            <p style={{ color: "#666" }}>
              {runMeta.parsed}/{runMeta.total} parsed in {runMeta.elapsed_s.toFixed(1)} s
            </p>
          )}

          {runMeta && runMeta.parsed < runMeta.total && (
            <p role="status" style={{ color: "#c77700" }}>
              Note: {runMeta.parsed} of {runMeta.total} reports parsed —{" "}
              {runMeta.total - runMeta.parsed} could not be read and were skipped.
            </p>
          )}

          <RagGrid export={data} />
        </>
      )}
    </main>
  );
}
