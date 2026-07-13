import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { fetchMetrics, fetchReports, runPipeline } from "./api";
import { BreadthPanel } from "./components/BreadthPanel";
import { ExceptionsPanel } from "./components/ExceptionsPanel";
import { ProvenanceDrawer } from "./components/ProvenanceDrawer";
import { RagGrid } from "./components/RagGrid";
import { ReconciliationPanel } from "./components/ReconciliationPanel";
import { RefusePanel } from "./components/RefusePanel";
import { ReportsList } from "./components/ReportsList";
import { TrendExplorer } from "./components/TrendExplorer";
import { initialStatus } from "./lib/appState";
import type { MetricRow, MetricsExport, ReportsResponse } from "./types";

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

// Nav-bar button styling (V2). Disabled = the in-flight re-run (muted, no pointer).
function navButtonStyle(disabled: boolean): CSSProperties {
  return {
    padding: "0.3rem 0.7rem",
    fontSize: "0.85rem",
    fontFamily: "system-ui, sans-serif",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    background: disabled ? "#f1f5f9" : "#fff",
    color: disabled ? "#94a3b8" : "#1a202c",
    cursor: disabled ? "default" : "pointer",
  };
}

export function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<MetricsExport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportsResponse | null>(null);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [runMeta, setRunMeta] = useState<RunMeta | null>(null);
  // Phase 4: the row whose provenance drawer is open (null = closed). Clicking any grid
  // cell or trend point sets it; the drawer's close button / Esc / backdrop clears it.
  const [selectedRow, setSelectedRow] = useState<MetricRow | null>(null);
  // Phase 5 (V2): an IN-PLACE re-run flag, kept separate from `status` so the nav-bar
  // "Re-run" re-parses without dropping back to the initial load screen — the cockpit stays
  // on screen with a subtle "Re-running…" cue.
  const [reloading, setReloading] = useState(false);
  // A re-run failure is surfaced inline (kept separate from the fatal `error`/`status`), so a
  // transient re-run error never blanks the panels the presenter is standing on.
  const [reRunError, setReRunError] = useState<string | null>(null);

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

  // Nav-bar "Re-run" (V2): re-parse the intake PDFs from disk WITHOUT flipping back to the
  // load screen. Same POST /api/run as handleLoad, but it flags `reloading` instead of
  // `status = "loading"`, so the loaded cockpit stays visible under a "Re-running…" cue.
  function handleReRun() {
    setReloading(true);
    setReRunError(null);
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
        // Keep status = "loaded": surface the error inline and leave the current export on
        // screen rather than swapping the whole cockpit for the fatal error view.
        setReRunError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setReloading(false));
  }

  // Nav-bar "Back to start": return to the top of the cockpit (the grid).
  function backToStart() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Sticky nav bar (V2): the app title + in-place Re-run + Back-to-start. Actions show
          once an export is loaded (nothing to re-run/scroll before the first load). */}
      <header
        className="cockpit-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 900,
          background: "rgba(255, 255, 255, 0.92)",
          borderBottom: "1px solid #e5e7eb",
          backdropFilter: "saturate(1.2) blur(4px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0.6rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            {/* A small brand mark so the sticky nav reads as a brand bar, not a repeat of the
                page's <h1> below it. */}
            <span
              aria-hidden="true"
              style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#2b6cb0" }}
            />
            Portfolio Cockpit
          </span>
          {status === "loaded" && (
            <span style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handleReRun}
                disabled={reloading}
                style={navButtonStyle(reloading)}
              >
                {reloading ? "Re-running…" : "↻ Re-run"}
              </button>
              <button type="button" onClick={backToStart} style={navButtonStyle(false)}>
                ↑ Back to start
              </button>
            </span>
          )}
        </div>
      </header>

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
          {reRunError && (
            <p
              role="alert"
              style={{
                color: "#b00020",
                background: "#fdecea",
                border: "1px solid #f5c6c2",
                borderRadius: 6,
                padding: "0.5rem 0.8rem",
              }}
            >
              Re-run failed: {reRunError}. Showing the previous results.
            </p>
          )}
          <p>
            Loaded <strong>{data.export_metadata.metric_count}</strong> metrics from{" "}
            <strong>{data.export_metadata.document_count}</strong> reports (schema{" "}
            {data.export_metadata.schema_version}).
          </p>

          {runMeta && (
            <p style={{ color: "#666" }}>
              {runMeta.parsed}/{runMeta.total} parsed in {runMeta.elapsed_s.toFixed(1)} s
              {reloading && (
                <span role="status" style={{ color: "#2b6cb0", marginLeft: "0.6rem" }}>
                  · Re-running…
                </span>
              )}
            </p>
          )}

          {runMeta && runMeta.parsed < runMeta.total && (
            <p role="status" style={{ color: "#c77700" }}>
              Note: {runMeta.parsed} of {runMeta.total} reports parsed —{" "}
              {runMeta.total - runMeta.parsed} could not be read and were skipped.
            </p>
          )}

          <RagGrid export={data} onSelectRow={setSelectedRow} />

          <TrendExplorer export={data} onSelectRow={setSelectedRow} />

          <RefusePanel export={data} onSelectRow={setSelectedRow} />

          <ReconciliationPanel export={data} />

          <ExceptionsPanel export={data} />

          <BreadthPanel export={data} />

          <ProvenanceDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
        </>
      )}
      </main>
    </>
  );
}
