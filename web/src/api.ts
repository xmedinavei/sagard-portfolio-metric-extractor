// Thin fetch wrappers over the Phase-0 API envelope (00-foundations.md §A.1-A.3).
// Same-origin calls (the SPA is served by Flask), so no base URL / CORS is needed.

import type { MetricsExport, ReportsResponse, RunResponse } from "./types";

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${url} failed: HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

// GET /api/reports — the intake PDFs found before any processing (§A.1).
export function fetchReports(): Promise<ReportsResponse> {
  return getJson<ReportsResponse>("/api/reports");
}

// POST /api/run — trigger the in-memory offline run; returns the full export (§A.2).
export function runPipeline(): Promise<RunResponse> {
  return getJson<RunResponse>("/api/run", { method: "POST" });
}

// GET /api/metrics — the last cached export, or { export: null } if no run yet (§A.3).
export function fetchMetrics(): Promise<{ export: MetricsExport | null }> {
  return getJson<{ export: MetricsExport | null }>("/api/metrics");
}
