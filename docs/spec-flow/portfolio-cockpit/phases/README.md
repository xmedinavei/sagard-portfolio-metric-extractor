# Portfolio Cockpit — Build Phases

> **Date:** 2026-07-12
> **Status:** Build-ready — `5` phases
> &nbsp;&nbsp;`✅` Phase 0 *(built + audited 2026-07-12)* · `✅` Phase 1 *(built + audited 2026-07-12; fixes in `01-load-and-grid-fixes.md`)* · `☐` Phase 2 · `☐` Phase 3 · `☐` Phase 4 *(flip to `☑` built, `✅` audited as each lands)*
> **Scope:** additive, gated, no migration; non-opted-in users (the CLI + 95-test suite + golden guard) observably unchanged.
> **Parent plan:** [`../01-plan.md`](../01-plan.md)  ·  **Spec:** [`../00-spec-and-scope.md`](../00-spec-and-scope.md)
> **Memory key:** `spec_flow_portfolio-cockpit`  ·  **Ground-truthed:** 2026-07-12 (workflows `wf_8cb631c5-2a4` + `wf_638c55b6-dd7`, 5 read-only `code-investigator` agents)

This directory is the **build-ready expansion** of the master plan — **one file per phase**, each a granular `action → file:line → acceptance` checklist. **Every `file:line` below was ground-truthed against the live tree on 2026-07-12** (HEAD `995965c`, clean). Build one phase per conversation via `/spec-flow:4-build-phase`; **Phase 0 is the atomic foundations gate** and must land before any other phase starts.

The whole web layer is **net-new + additive**. If you deleted `portfolio_metrics/webapp.py` and `web/` tomorrow, `make publish`, `make test`, and `make verify-golden` would pass **byte-identically**. The only edits to *shared* files are **append-only** (`Makefile` `.PHONY`, `.gitignore`, one new `pyproject` optional-extra key).

## Files

| # | File | Phase | What it builds |
| --- | --- | --- | --- |
| 0 | [`00-foundations.md`](./00-foundations.md) | Foundations (**GATE**) | `web` extra, `webapp.py` (3 API routes + SPA serve), Vite/React shell, `Makefile serve`+`build-web`, `.gitignore` — **freezes the `/api` envelope (§A) + the naming registry + the toolchain** |
| 1 | [`01-load-and-grid.md`](./01-load-and-grid.md) | Load flow + RAG grid | Found-reports list → **Load** → in-memory offline run → **sector-grouped RAG grid** (the cockpit skeleton + shared "loaded export" state) |
| 2 | [`02-trend-explorer.md`](./02-trend-explorer.md) | Flagship #1: over-time trend | NovaCloud ARR 5-quarter line (label-renames collapsed) + "insufficient history" guard |
| 3 | [`03-comparison-safety.md`](./03-comparison-safety.md) | Flagship #2: refuse + reconcile + exceptions + breadth | Refuse-to-compare, reconciliation (dedupe mirror-pair), sector-aware exceptions, breadth showcase (**first-to-cut**) |
| 4 | [`04-provenance.md`](./04-provenance.md) | Provenance + demo-ready | File-level click-to-source drill-down **+ demo-ready checklist** (commit pre-built bundle + full offline dry-run) |

*Mid-flight fixes (audit-driven, discovered during `/spec-flow:4-build-phase`) live in a suffixed sibling `0N-<slug>-fixes.md` next to their phase — they do **not** consume a new phase number.*

## Build DAG

*Phase 0 is the atomic foundations gate. Phase 1 wires the shared load lifecycle + "loaded export" state. Phases 2, 3, 4 are independent panels that read that state — they fan out as parallel tracks and converge at the demo-ready checklist folded into Phase 4's tail.*

```
                    ┌───────────────────────────────────────────┐
                    │  Phase 0 — Foundations (GATE)              │  freezes:
                    │  atomic · must land first                  │  • /api envelope (§A.1–A.3)
                    │  web extra · webapp.py · Vite/React shell  │  • 1.1.0 export shape (§A.4)
                    │  Makefile serve/build-web · .gitignore     │  • naming registry · toolchain
                    └───────────────────┬───────────────────────┘
                                        │  (every phase Depends-on 0)
                                        ▼
                    ┌───────────────────────────────────────────┐
                    │  Phase 1 — Load flow + found-reports list  │  the app shell +
                    │  + sector-grouped RAG grid                 │  shared "loaded export" state
                    └───────────────────┬───────────────────────┘
                                        │  (P2/P3/P4 each read the loaded export P1 wires)
            ┌───────────────────────────┼───────────────────────────┐
            ▼                           ▼                           ▼
 ┌────────────────────┐   ┌──────────────────────────────┐   ┌────────────────────┐
 │ Phase 2            │   │ Phase 3                      │   │ Phase 4            │   ← parallel
 │ Trend explorer     │   │ Refuse + reconcile +         │   │ Provenance         │     tracks
 │ (flagship #1)      │   │ exceptions + breadth         │   │ drill-down         │
 └─────────┬──────────┘   └──────────────┬───────────────┘   └─────────┬──────────┘
           │   (P4 wires click-to-source into P2's trend points when both exist)  │
           └───────────────────────────┬─────────────────────────────────────────┘
                                       ▼
                       ┌──────────────────────────────────┐
                       │ Demo-ready checklist              │   ← converge:
                       │ (Phase 4 tail: 4.2 pre-built      │     retained P5.2 + P5.3,
                       │  bundle + 4.3 offline dry-run)    │     hoisted per plan §7 note
                       └──────────────────────────────────┘

Legend: A──▶B = B Depends-on A (A Blocks B). Phases on the same row with no edge
between them (P2, P3, P4) are Parallelizable-with each other. P4's provenance PANEL
is parallel; its click-wiring into P2's trend points is a soft feed, not a hard block.
```

## Naming registry

> **Use these names verbatim across all phases.** Derived once here from the live tree; every phase doc and every build agent must reuse them exactly — no synonyms, no drift. Field names under "Export contract" are the **1.1.0 export as the backend actually emits it** (Slice 3, `schema.py`) — the SPA binds these verbatim and **must not** bind the three RESERVED names.

### New files — backend

| Path | Symbol / export | Phase |
| --- | --- | --- |
| `portfolio_metrics/webapp.py` | `create_app(intake_dir=INTAKE_DIR) -> Flask` (app factory; optional param defaults, so `create_app()` still holds — tests point it at a temp dir) | 0 |
| `portfolio_metrics/webapp.py` | `run_pipeline_in_memory(intake_dir: Path, *, recall_mode="enhanced") -> MetricsLongExport` | 0 |
| `portfolio_metrics/webapp.py` | `list_intake_reports(intake_dir: Path) -> list[str]` | 0 |
| `portfolio_metrics/webapp.py` | route handlers `api_reports`, `api_run`, `api_metrics`, `spa_index` | 0 |
| `portfolio_metrics/webapp.py` | module-level cache `_LATEST_EXPORT: MetricsLongExport \| None` | 0 |
| `portfolio_metrics/webapp.py` | `main()` — `python -m portfolio_metrics.webapp` entry point for `make serve` | 0 |

### New files — frontend (`web/`, Vite + React + TypeScript)

| Path | Symbol / export | Phase |
| --- | --- | --- |
| `web/package.json`, `web/vite.config.ts`, `web/tsconfig.json`, `web/index.html` | scaffold (Vite `base:"./"`) | 0 |
| `web/src/main.tsx` | React entry | 0 |
| `web/src/App.tsx` | `App` (top-level state machine `idle→loading→loaded→error`) | 0 |
| `web/src/api.ts` | `fetchReports()`, `runPipeline()`, `fetchMetrics()` | 0 |
| `web/src/types.ts` | `MetricRow`, `IssueRow`, `ExportMetadata`, `MetricsExport`, `ReportsResponse`, `RunResponse` | 0 |
| `web/src/components/ReportsList.tsx` | `ReportsList` | 1 |
| `web/src/components/RagGrid.tsx` | `RagGrid` | 1 |
| `web/src/lib/grid.ts` | pure grid logic (`SECTOR_ORDER`, `CANONICAL_METRIC_ORDER`, `parsePeriodKey`, `classifyCell`, `sectorApplicableMetrics`, `groupCompaniesBySector`, `latestByCompanyMetric`) — Phase-1-private, unit-tested | 1 |
| `web/src/lib/appState.ts` | `initialStatus` (cold-start gate) — Phase-1-private | 1 |
| `web/src/components/TrendExplorer.tsx` | `TrendExplorer` | 2 |
| `web/src/components/RefusePanel.tsx` | `RefusePanel` | 3 |
| `web/src/components/ReconciliationPanel.tsx` | `ReconciliationPanel` | 3 |
| `web/src/components/ExceptionsPanel.tsx` | `ExceptionsPanel` | 3 |
| `web/src/components/BreadthPanel.tsx` | `BreadthPanel` *(first-to-cut de-scope candidate)* | 3 |
| `web/src/components/ProvenanceDrawer.tsx` | `ProvenanceDrawer` | 4 |

### Edits to existing symbols (all append-only)

| Symbol | Where (`file:line`) | Change |
| --- | --- | --- |
| `.PHONY` list | `Makefile:12` | append two words: `serve build-web` |
| `serve` + `build-web` targets | `Makefile` after `:67` | new recipe blocks (mirror `publish` `Makefile:52-53`) |
| `[project.optional-dependencies]` | `pyproject.toml:22` | add key `web = ["flask>=3.1,<4.0"]` (alongside existing `dev`) |
| `.gitignore` | append (after `:24`) | one line: `node_modules/` |

### API routes, query keys, constants

| Key / route / const | Value / shape | Phase |
| --- | --- | --- |
| `GET /api/reports` | → `ReportsResponse` (§A.1) | 0 |
| `POST /api/run` | → `RunResponse` (§A.2) | 0 |
| `GET /api/metrics` | → `{ export: MetricsExport \| null }` (§A.3) | 0 |
| `GET /` (+ static assets) | serve `web/dist/index.html` same-origin (no CORS) | 0 |
| `RECALL_MODE` | `"enhanced"` — passed **explicitly** to every library call | 0 |
| `INTAKE_DIR` | `"intake-pdf"` (globbed as `intake-pdf/*.pdf` — G1 explicit inputs) | 0 |
| `SECTOR_ORDER` | `["saas", "credit", "marketplace", "payments"]` | 1 |
| `REFUSED_STATUS` | `"refused"` (a `comparison_status` value) | 3 |
| `INTEREST_MARGIN_BASIS` | `"interest_margin"` (a `metric_basis` value) | 3 |
| `RECONCILE_CODE` | `"cross_source_discrepancy"` (issue `code`) | 3 |
| `BASIS_COLLISION_CODE` | `"basis_collision"` (issue `code`) | 3 |
| `MISSING_METRIC_CODE` | `"missing_metric"` (issue `code`) | 3 |

### Export contract field names (bind verbatim — see `00-foundations.md` §A.4 for the full frozen shape)

- **`MetricRow`** (`metrics[]`, from `NormalizedMetric` `schema.py:144`, **23 fields**): the panels bind `company_name`, `sector`, `canonical_metric`, `value`, `period`, `comparison_status`, `metric_basis`, `source_file`, `raw_label`, `raw_value_text`, `confidence`, `source_snippet`, `source_page`, `display_value`, `unit`, `document_type`, `detection_method`.
- **`IssueRow`** (`issues[]`, from `NormalizationIssue` `schema.py:173`, **13 fields**): `severity`, `code`, `message`, `source_file`, `company_name`, `canonical_metric`, `period`, `expected_value`, `observed_value`, `delta`, `raw_label`, `raw_value_text`, `source_page`.
- **`ExportMetadata`** (`export_metadata`, `schema.py:203`, **13 fields**): `schema_version`, `generated_at`, `metric_count`, `issue_count`, `document_count`, `recall_mode`, `core_metrics`, `optional_metrics`, `source_parsed_artifacts`, …
- **⛔ RESERVED — do NOT bind in v1** (three dead fields; see §A.4): issue `code == "unrecognized_label"` (never emitted), `MetricRow.currency` (always `null`), `comparison_status == "unchecked"` (never assigned).

## How an agent uses this

1. **Confirm Phase 0 has landed** (its `Status` is `☑`/`✅`). If not, build Phase 0 first — it is the gate and freezes every cross-phase contract in its §A.
2. **Pick a phase** whose `Depends-on` are all satisfied (use the DAG — P2/P3/P4 are parallel-track and can be built in any order once P1 is in).
3. Open that `0N-<slug>.md` and **work its TODOs top-to-bottom**, group by group.
4. **Satisfy each group's `Acceptance`** before moving on; copy from the `Template to copy:` pointer rather than writing from scratch.
5. **Keep the backend suite green** the whole way (`make test` → 95, `make verify-golden` → legacy byte-identical); add the phase's stated frontend/backend tests.
6. **Verify non-opted-in users are observably unchanged** — the CLI never imports `flask`/`webapp`; deleting the web layer restores byte-identical output.
7. Run **`/spec-flow:4-build-phase`** to drive the phase (it records deviations back into the phase doc's `§ Live findings` / `§ Implementation notes`, and emits a `0N-<slug>-fixes.md` sibling for any audit follow-ups).

## Open items inherited from the plan

*Carried forward from `01-plan.md` §9 (all resolved at the plan gate) — restated so a build agent sees them without re-reading the plan.*

1. **Breadth panel (`BreadthPanel`, P3.4)** — build as the label-drift / raw-terminology showcase, but it is the **first-to-cut de-scope candidate**: if Phase 3 runs long, omit `3.4` **without touching** `3.1`–`3.3`. *(Owner: Xavier, decided 2026-07-12.)*
2. **Demo-ready checklist (P4 tail)** — the retained `P5.2` (commit a known-good pre-built bundle) + `P5.3` (full offline dry-run) are demo-safety, not cosmetic; they run before the interview regardless of the P5 visual-polish deferral.
3. **Visual polish (former P5.1)** — **deferred** (graded core is P0–P4). Not a phase here.

---

*Index authored 2026-07-12. Additive-first; every `file:line` ground-truthed. Feeds `/spec-flow:4-build-phase` (Phase 0 first — the atomic foundations gate).*
