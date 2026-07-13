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

// The serif stack used for the Concord brand marks — a premium, "established" feel that reads
// as a real product, distinct from the sans-serif body. System fonts only (offline-safe).
const BRAND_SERIF = "Georgia, 'Times New Roman', 'Liberation Serif', serif";
const BRAND_INK = "#16233d";

// Concord's OWN brand mark — two overlapping rings (convergence / agreement / comparability,
// the meaning of "concord"). Original artwork, not derived from any real brand.
function ConcordMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle cx="13" cy="17" r="8.5" fill="none" stroke="#2b6cb0" strokeWidth="2.4" />
      <circle cx="21" cy="17" r="8.5" fill="none" stroke={BRAND_INK} strokeWidth="2.4" />
    </svg>
  );
}

// The Sagard attribution. Renders the OFFICIAL logo if you place the licensed asset at
// web/public/sagard-logo.svg (bundled offline by `make build-web`); until then it falls back to
// a plain "SAGARD" text wordmark. I intentionally do NOT ship Sagard's trademarked logo — supply
// the official file yourself, since this is a case-study demo prepared FOR Sagard.
function SagardLogo() {
  const [failed, setFailed] = useState(false);
  if (failed) return <SagardWordmark />;
  return (
    <img
      src="sagard-logo.png"
      alt="Sagard"
      style={{ height: 30, display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}

// Text fallback for the Sagard attribution (shown until the official logo file is added). Uses
// only the name in text + a neutral mark — not a reproduction of any real logo.
function SagardWordmark() {
  return (
    <span
      aria-label="Sagard"
      style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", color: BRAND_INK }}
    >
      <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 0.5 L15.5 8 L8 15.5 L0.5 8 Z" fill={BRAND_INK} />
        <path d="M8 4.2 L11.8 8 L8 11.8 L4.2 8 Z" fill="#ffffff" />
      </svg>
      <span style={{ fontWeight: 700, letterSpacing: "0.18em", fontSize: "0.95rem" }}>SAGARD</span>
    </span>
  );
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

  // Nav-bar "Back to start": jump the page back to the top. The plain (x, y) form is the most
  // engine-compatible way to scroll the window, and it honours the CSS `scroll-behavior: smooth`
  // in index.css — so it animates smoothly without relying on the object-form `behavior` flag
  // (which some engines ignore, the likely cause of it "not working").
  function backToStart() {
    window.scrollTo(0, 0);
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
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0.85rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          {/* Left: the Concord brand + slogan (moved up from the body into the title bar). */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", minWidth: 0 }}>
            <ConcordMark size={30} />
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: BRAND_SERIF,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "0.005em",
                  color: BRAND_INK,
                  lineHeight: 1.05,
                }}
              >
                Concord
              </h1>
              <p
                style={{
                  margin: 0,
                  fontFamily: BRAND_SERIF,
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                  color: "#334155",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                One comparable, source-traced view of every portfolio company.
              </p>
            </div>
          </div>

          {/* Right: the Sagard attribution + the Re-run / Back-to-start actions. */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#8a8f99",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "0.15rem",
                }}
              >
                Prepared for
              </div>
              <SagardLogo />
            </div>
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
        </div>
      </header>

      <main
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 1400,
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <p style={{ color: "#666", margin: "0 0 1.25rem", maxWidth: 820, fontSize: "0.9rem" }}>
          Same label ≠ same metric — every number is normalized to be comparable and traceable to
          its source. Local &amp; offline · Sagard case study.
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

          <ExceptionsPanel export={data} />

          <BreadthPanel export={data} />

          {/* Cross-source check moved to the end: on this corpus it's a quiet "all agree",
              so it reads best as a closing reassurance rather than a headline. */}
          <ReconciliationPanel export={data} />

          <ProvenanceDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
        </>
      )}
      </main>
    </>
  );
}
