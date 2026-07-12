# Phase 1: Load flow + found-reports list + sector-grouped RAG grid (Build Spec)

> **Date:** 2026-07-12
> **Status:** ✅ Built + Audited (2026-07-12) · **11 frontend tests** (grid logic + cold-start gate) · backend `95` unchanged (`103` with `.[web]`) · audit fixes in [`01-load-and-grid-fixes.md`](./01-load-and-grid-fixes.md)
> **Scope:** additive, gated, no migration; non-opted-in users observably unchanged (frontend-only + read-only API calls).
> **Depends-on:** Phase 0 (foundations gate)  ·  **Blocks:** Phase 2, Phase 3, Phase 4 (they read the loaded export this phase wires)
> **Feeds:** the shared "loaded export" state + the grid cells that Phase 4 makes click-to-source  ·  **Parallelizable-with:** none (P2/P3/P4 depend on it)
> **Parent plan:** [`../01-plan.md` §7 Phase 1](../01-plan.md)  ·  **Index:** [`./README.md`](./README.md)
> **Target file(s) / code root:** `web/src/App.tsx`, `web/src/components/ReportsList.tsx`, `web/src/components/RagGrid.tsx`
> **Ground-truthed:** 2026-07-12

## Purpose

Phase 1 turns the Phase 0 shell into the **cockpit skeleton**: the app opens showing the **found-reports list** (from `GET /api/reports`) *before* any processing, a **Load reports** button triggers the one-click in-memory run (`POST /api/run`), and the result populates a **sector-grouped RAG grid** — companies × canonical metrics × latest period, grouped by the four `sector` values. It establishes the **shared "loaded export" state** in `App` that Phases 2/3/4 all read. Nothing here changes backend behaviour; every API call is read-only, and the panels bind the frozen §A.4 fields verbatim.

## §A Frozen cross-phase data contracts

*None declared here — all contracts are frozen in [`00-foundations.md` §A](./00-foundations.md). This phase **consumes** §A.1 (`ReportsResponse`), §A.2 (`RunResponse`), and §A.4 (`MetricsExport`).*

## § Phase 1 TODOs

> Format: **`action → file:line → acceptance`**. Work top-to-bottom; satisfy each group's **Acceptance** before moving on.
> Legend: `☐` to-do · `☑` implemented · `✅` acceptance verified.

### 1.1 Pre-run state — found-reports list before processing

- `✅` **1.1a** `ReportsList` component → `web/src/components/ReportsList.tsx` (new). On mount, `App` calls `fetchReports()` (`api.ts`, Phase 0) → renders `reports[]` from **§A.1** as a plain list with the `count`, plus a **Load reports** button. Shows this in the `idle` state (before any run).
- **Acceptance:** ✅ a fresh start with only raw PDFs in `intake-pdf/` shows the file list + count and the Load button, with **nothing parsed yet** (success criterion #7). *Build note:* `App` fetches reports in an **independent** `useEffect` so a scan failure sets only `reportsError` and never flips the app to the metrics-error state (frontend investigator's retrocompat callout). Cold-start gate is guarded by the pure `initialStatus()` helper (`appState.test.ts`).

*Template to copy: none in-repo; keep it a thin presentational component reading `ReportsResponse`.*

### 1.2 Load flow — one click → in-memory run → render

- `✅` **1.2a** Wire the Load button → `App` calls `runPipeline()` (`POST /api/run`, **§A.2**), sets state `loading` (spinner), on success stores `export` in the shared "loaded export" state and moves to `loaded` → `web/src/App.tsx`. Show `parsed`/`total`/`elapsed_s` ("24/24 parsed in 0.9 s") from the envelope. *Build note:* the shared state is the existing `data: MetricsExport | null` (prop-drilled to `<RagGrid export={data} />`; later panels bind the same prop — no context needed for one top-level `App`).
- `✅` **1.2b** Error affordance: if `parsed < total`, render a non-blocking "N of M parsed" note (never blank the screen) — mirrors the plan §8 rollback posture.
- **Acceptance:** ✅ one click processes **all** current intake PDFs and renders in `< ~3 s`; the parsed/total line reflects the real corpus (24/24 today). Verified via data-path smoke (`POST /api/run` → 1.1.0, 24/24, 116 metrics). *Build note (A4 fix):* `ReportsList` also renders during `loading` (button → "Loading…", list stays visible) so its loading affordance is reachable.

*Template to copy: standard React fetch-on-click; the envelope shape is §A.2.*

### 1.3 Sector-grouped RAG grid

- `✅` **1.3a** `RagGrid` component → `web/src/components/RagGrid.tsx` (new). Group `export.metrics` (**§A.4 `MetricRow`**) by `sector` in the fixed order `SECTOR_ORDER = ["saas","credit","marketplace","payments"]` (naming registry). Within each sector: rows = companies (`company_name`), columns = `canonical_metric` (all 8, `CANONICAL_METRIC_ORDER`), cell = latest-period `value`. Uses `display_value` for the cell text. **⚠️ Build correction:** `period` is emitted as `"Q<n> YYYY"` (quarter FIRST) — a lexical `max()` is **wrong** (would pick `Q4 2024` over `Q2 2025`). Latest-period selection parses `(year, quarter)` via `parsePeriodKey` (guarded by a dedicated test — NovaCloud ARR picks `Q2 2025` $34.2M, not the lexical-max `Q4 2024` $29.1M). Pure logic lives in `web/src/lib/grid.ts` (unit-tested without a DOM).
- `✅` **1.3b** Honesty affordances (spec FR6): a cell whose metric is **not applicable to that sector** renders as **`N/A`**, never "missing" (success #5); a metric that *is* expected but absent for a company renders as a genuine gap **`—`**. Credit gross margin is shown but marked **"not ranked"** (`comparison_status === "refused"`). **⚠️ A1 fix (HIGH):** applicability is **sector-aware** — a metric is applicable if reported **or** backend-flagged `missing_metric` for a company in that sector; otherwise the grid printed false "N/A" on core metrics the exceptions panel lists as missing. See [`01-load-and-grid-fixes.md`](./01-load-and-grid-fixes.md) A1.
- `✅` **1.3c** Do **not** bind the three RESERVED fields (`currency`, `comparison_status=="unchecked"`, `code=="unrecognized_label"`) — verified by the contract auditor (only `comparison_status === "refused"` is branched).
- **Acceptance:** ✅ 10 companies grouped under their 4 sectors; LendBridge's gross margin appears but is **not ranked**; no cell says "missing"/false-"N/A" for a metric's applicability. **⚠️ Count correction:** the live raw-parse path yields **saas 90 / credit 15** / marketplace 7 / payments 4 (LendBridge 15 = 3×5, MediSight 11); the doc's `91/14` matches the committed golden (fixtures path). The grid is **count-agnostic** (no hardcoded counts). See fixes A3.

*Template to copy: none in-repo; a straightforward grouped table. Sector counts + membership confirmed live (plan §3.3).*

> ⚠️ **Hazard callouts (carried from Phase 0):**
> - **H1/H2/H3** apply transitively — but this is a **frontend-only** phase, so it inherits them through the Phase 0 API (it never calls the pipeline directly). Do not add a second run path that bypasses `POST /api/run`.
> - **RESERVED bindings** (H5-adjacent): never bind `currency` / `unchecked` / `unrecognized_label` — they are legal-but-dead (§A.4).

## § Retrocompat notes

| Change | Class | Why safe |
| --- | --- | --- |
| New React components `ReportsList`, `RagGrid` | ✅ SAFE | New files under `web/src/` — outside packaged/ruff/pytest scope; render-only. |
| New app state ("loaded export") in `App.tsx` | ✅ SAFE | Frontend state; no backend contract added or changed. |
| Read-only calls to `/api/reports` + `/api/run` | ✅ SAFE | Routes frozen in Phase 0 §A; `/api/run` is idempotent from the app's view (re-run re-globs); no writes to the repo. |

**Net: zero breaking, zero migration.** Non-opted-in users observably unchanged — this phase adds only frontend files and read-only API reads.

## § Definition of done

1. [x] All `1.M` task groups complete; every **Acceptance** met.
2. [x] Frontend tests present — **11 green** (Vitest, logic-only per user choice): grid grouping + year-aware latest-period + N/A-vs-gap-vs-refused classifier + sector-aware applicability (A1) + cold-start gate (`initialStatus`). `make test` still **95** flask-absent / **103** with `.[web]` (backend untouched — **zero `.py` changed**). *Deviation:* "Load populates grid" is not DOM-unit-tested (logic-only choice) — covered by typecheck + build + data-path smoke (fixes A2).
3. [x] Every change classified in **§ Retrocompat notes**; nothing BREAKING (retrocompat auditor: HOLDS, 1 LOW accepted).
4. [x] No RESERVED field bound; grid reads only §A.4 fields (contract auditor: HOLDS; `tsc --noEmit` exit 0 = machine-checked proof).
5. [x] Symbol names match the README naming registry verbatim (`ReportsList`, `RagGrid`, `SECTOR_ORDER`); new internal helper modules `grid.ts`/`appState.ts` added to the registry (fixes C1).
6. [x] *(n/a — no §A here; Phase 0 owns the contracts; this phase only consumes §A.1/§A.2/§A.4.)*

---

## § Live findings *(build agent — 2026-07-12)*

Ground-truthed by 2 `code-investigator` agents (frontend seam + live data) before writing, and 3 `phase-auditor` agents after:

1. **`period` format = `"Q<n> YYYY"` (quarter first)** — a lexical `max()` picks the wrong "latest" (`Q4 2024` > `Q2 2025`). NovaCloud ARR would read $29.1M instead of the true-latest $34.2M. → year-aware `parsePeriodKey` + a dedicated guard test.
2. **Sector split drift — root-caused + accepted (2026-07-12):** the live raw-parse path (`run_pipeline_in_memory`, what the app runs) yields **saas 90 / credit 15**; the golden yields **91 / 14** (matching the doc). Root cause: the golden normalizes a **frozen 24-file parse snapshot** (`tests/golden/parsed/*.parsed.json`, markdown-table text) while the demo runs the current `LocalPdfParser` (space-padded text) — same PDFs, different serialization → (a) live recovers a **real** LendBridge Q2 2024 headcount the snapshot missed (+1), (b) the snapshot NRR 119% is attributed to TalentVault live vs MediSight in the snapshot (−1, an attribution ambiguity). **Owner decision = ACCEPT + DOCUMENT:** golden stays the frozen legacy retrocompat canary; live parser (90/15) is the demo's source of truth. Grid is count-agnostic → no Phase 1 defect. Full write-up + deferred options in [`01-load-and-grid-fixes.md`](./01-load-and-grid-fixes.md) A3.
3. **`display_value` is inconsistent for `usd` rows** (`cash_balance` always `$`, `monthly_burn` never, `arr_eop`/`revenue_qtr` mixed). Phase 1 binds `display_value` verbatim (provenance-faithful, per §1.3a); consistent `$`-formatting is a candidate for the deferred P5.1 visual pass — **not** re-derived here (would risk diverging displayed text from provenance).
4. **HIGH audit finding (A1):** corpus-only applicability produced false "N/A" on core metrics the backend flags `missing_metric` — fixed to sector-aware applicability. Verified on the live corpus (marketplace/payments no longer N/A on cash/burn).

## § Implementation notes *(build agent — 2026-07-12)*

- **Files (all under `web/`, zero Python):** NEW `web/src/lib/grid.ts` (pure grid logic), `web/src/lib/appState.ts` (`initialStatus`), `web/src/components/RagGrid.tsx`, `web/src/components/ReportsList.tsx`, `web/src/lib/grid.test.ts` + `appState.test.ts`; EDITED `web/src/App.tsx` (Load flow + shared state), `web/vite.config.ts` (Vitest `test` block), `web/package.json` (+`vitest` devDep + `test` script), `web/package-lock.json`.
- **Test approach:** Vitest **logic-only** (user choice) — riskable logic (period parsing, N/A/gap/refused classification, sector applicability, cold-start gate) extracted to pure functions; `node` env, no jsdom. 11 tests.
- **Shared "loaded export" seam:** the existing `data: MetricsExport | null` in `App`, prop-drilled as `<RagGrid export={data} />`. P2/P3/P4 panels bind the same prop (prop-drill, not context — one top-level `App`).
- **Verification:** `npm test` 11 green · `npm run build` (tsc + vite) green · backend 103/95 dots zero-fail · golden 15 byte-identical · data-path smoke (served bundle byte-identical to `web/dist`, `/api/reports`+`/api/run`+`/api/metrics` live) · live applicability cross-check.
- **Audit:** 3 `phase-auditor` lenses — retrocompat HOLDS, contract/registry HOLDS, acceptance found 1 HIGH + 2 MED + 2 LOW; all resolved inline or accepted → see [`01-load-and-grid-fixes.md`](./01-load-and-grid-fixes.md).

## § Unblocked phases *(build agent — 2026-07-12)*

- **Phase 2 (Trend explorer)**, **Phase 3 (Refuse/reconcile/exceptions/breadth)**, **Phase 4 (Provenance)** are now unblocked: each binds `App`'s shared `data` (the loaded `MetricsExport`) via a `export={data}` prop, exactly as `RagGrid` does. They are parallel-track (build in any order).
- Phase 3 note: it introduces `REFUSED_STATUS` / `MISSING_METRIC_CODE` named consts — Phase 1 hardcodes those literals with a `// Phase 3 formalizes` comment; Phase 3 should refactor `grid.ts` to import them.
