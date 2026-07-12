# Phase 1: Load flow + found-reports list + sector-grouped RAG grid (Build Spec)

> **Date:** 2026-07-12
> **Status:** Not started · target `~3` frontend tests *(flip to In progress / Built / Audited)*
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

- `☐` **1.1a** `ReportsList` component → `web/src/components/ReportsList.tsx` (new). On mount, `App` calls `fetchReports()` (`api.ts`, Phase 0) → renders `reports[]` from **§A.1** as a plain list with the `count`, plus a **Load reports** button. Shows this in the `idle` state (before any run).
- **Acceptance:** a fresh start with only raw PDFs in `intake-pdf/` shows the file list + count and the Load button, with **nothing parsed yet** (success criterion #7 — list shown *before* processing).

*Template to copy: none in-repo; keep it a thin presentational component reading `ReportsResponse`.*

### 1.2 Load flow — one click → in-memory run → render

- `☐` **1.2a** Wire the Load button → `App` calls `runPipeline()` (`POST /api/run`, **§A.2**), sets state `loading` (spinner), on success stores `export` in the shared "loaded export" state and moves to `loaded` → `web/src/App.tsx`. Show `parsed`/`total`/`elapsed_s` ("24/24 parsed in 0.9 s") from the envelope.
- `☐` **1.2b** Error affordance: if `parsed < total`, render a non-blocking "N of M parsed" note (never blank the screen) — mirrors the plan §8 rollback posture.
- **Acceptance:** one click processes **all** current intake PDFs and renders in `< ~3 s`; the parsed/total line reflects the real corpus (24/24 today).

*Template to copy: standard React fetch-on-click; the envelope shape is §A.2.*

### 1.3 Sector-grouped RAG grid

- `☐` **1.3a** `RagGrid` component → `web/src/components/RagGrid.tsx` (new). Group `export.metrics` (**§A.4 `MetricRow`**) by `sector` in the fixed order `SECTOR_ORDER = ["saas","credit","marketplace","payments"]` (naming registry). Within each sector: rows = companies (`company_name`), columns = `canonical_metric`, cell = latest-period `value` (pick the max `period` per company×metric). Use `display_value` for the cell text and `unit` for formatting.
- `☐` **1.3b** Honesty affordances (spec FR6): a cell whose metric is **not applicable to that sector** renders as **`N/A`**, never as "missing" (success criterion #5 — zero false "missing"). Gross margin for a credit company is shown but visibly marked **"not ranked"** (it becomes the refuse-to-compare story in Phase 3, but the grid must already not rank it).
- `☐` **1.3c** Do **not** bind the three RESERVED fields (`currency`, `comparison_status=="unchecked"`, `code=="unrecognized_label"`) — see `00-foundations.md` §A.4.
- **Acceptance:** 10 companies grouped under their 4 sectors (saas 91 / credit 14 / marketplace 7 / payments 4 rows in the current corpus); LendBridge's gross margin appears but is **not ranked** beside the SaaS companies; no cell says "missing" for a metric that doesn't apply to that sector.

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

1. [ ] All `1.M` task groups complete; every **Acceptance** met.
2. [ ] ~3 frontend tests (reports list renders before run; Load populates the grid; N/A-by-sector renders `N/A` not "missing"); `make test` still **95** (backend untouched).
3. [ ] Every change classified in **§ Retrocompat notes**; nothing BREAKING.
4. [ ] No RESERVED field bound; grid reads only §A.4 fields.
5. [ ] Symbol names match the README naming registry verbatim (`ReportsList`, `RagGrid`, `SECTOR_ORDER`).
6. [ ] *(n/a — no §A here; Phase 0 owns the contracts.)*

---

## § Live findings *(build agent fills during `/spec-flow:4-build-phase`)*

## § Implementation notes *(build agent fills)*

## § Unblocked phases *(build agent fills)*
