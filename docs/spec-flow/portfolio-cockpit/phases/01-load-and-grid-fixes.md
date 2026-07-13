# Phase 1 — Audit Fixes (`01-load-and-grid-fixes.md`)

> **Date:** 2026-07-12 · **Sibling of:** [`01-load-and-grid.md`](./01-load-and-grid.md)
> **Trigger:** Step-5 adversarial audit of the built Phase 1 by 3 `phase-auditor` agents (lenses: retrocompat · contract/registry · acceptance/DoD).
> **Result:** retrocompat + contract lenses **HOLD** (LOW advisories only); acceptance lens found **1 HIGH + 2 MED + 2 LOW**. All actionable findings resolved **inline**; the rest recorded as accepted deviations. Frontend gate after fixes: **11 tests green**, `tsc`+`vite build` green; backend **103/95** unchanged, golden **15** byte-identical.

## TL;DR — severity table

| # | Sev | Finding | Resolution |
| --- | --- | --- | --- |
| A1 | **HIGH** | Grid printed "N/A — not applicable to this sector" for **core** metrics (marketplace/payments `cash_balance`,`monthly_burn`) that the backend itself flags as `missing_metric` — a self-contradiction vs. Phase 3's exceptions panel. | **FIXED** — applicability is now sector-aware: a metric is applicable if reported **or** backend-flagged missing for a company in that sector. Verified on live corpus. |
| A2 | MED | DoD #2 named 3 test behaviors; only 1 (N/A classification) was unit-tested. | **PARTIALLY FIXED** — extracted `initialStatus()` pure helper + test (covers "reports list before run"). "Load populates grid" recorded as an **accepted** logic-only gap (covered by typecheck + build + data-path smoke). |
| A3 | MED | Recorded "live 90/15" vs. committed golden "91/14" (golden matches the doc). | **RECORDED (no frontend change)** — grid is provably count-agnostic. Pre-existing backend/data divergence between the raw-PDF parse (app path) and the fixtures the golden is built from. Flagged for owner. |
| A4 | LOW | `ReportsList` `loading` prop was dead/unreachable. | **FIXED** — `ReportsList` now also renders during `loading` (button shows its own spinner, file list stays visible); prompt hidden while loading. |
| A5 | LOW | Latest-period tie-break is first-in-array-wins. | **ACCEPTED** — deterministic; 0 ties in live data; conflict surfacing is Phase 3's reconciliation story. |
| C1 | LOW | `web/src/lib/grid.ts` + `appState.ts` absent from the naming registry. | **FIXED** — registry rows added in `README.md`. |
| C2 | LOW | `"refused"` literal hardcoded; `export` used as a prop name. | **ACCEPTED** — `REFUSED_STATUS` refactor deferred to Phase 3 (per registry); `export` prop is intentional (mirrors the envelope field), legal TS/JSX. |
| R1 | LOW | Production `tsc --noEmit` now transitively needs the `vitest` devDep (test files are in `include`). | **ACCEPTED** — the only build path (`make build-web` = `npm ci && npm run build`) installs devDeps; no `--omit=dev` path exists. One-line `exclude` available if that ever changes. |

---

## A1 — false "N/A" on backend-flagged core metrics *(HIGH — fixed)*

- **Problem:** `sectorApplicableMetrics` derived "applicable to a sector" from *"some company in the sector reports it in this corpus."* In the small marketplace (ApexFreight, FleetLink) and payments (ClearPay) sectors, **no** company reports `cash_balance`/`monthly_burn`, so the grid rendered those cells `N/A` with tooltip "Not applicable to this sector." But the backend emits `missing_metric` for those exact `(company, metric)` pairs — they are **expected but absent**, i.e. genuine gaps. The grid thus made a positive false claim, and would contradict Phase 3's ExceptionsPanel in the same cockpit (an interviewer-visible inconsistency, inverting success criterion #5).
- **Fix:** `sectorApplicableMetrics(metrics, issues)` — a metric is applicable to a sector if it is **reported by** any company there **or** flagged `missing_metric` for any company there. The `missing_metric` issue is the backend's **sector-aware** "expected" signal (e.g. LendBridge/credit is flagged only for `headcount`, so a lender is correctly *not* expected to have ARR/cash/burn → those stay N/A). `RagGrid` now passes `exp.issues`.
- **Files:** `web/src/lib/grid.ts` (`sectorApplicableMetrics` + `MISSING_METRIC_CODE` literal), `web/src/components/RagGrid.tsx:63`.
- **Test:** `grid.test.ts` — "treats a backend-flagged missing metric as a gap, not N/A" (`ApexFreight/cash_balance` → `gap`) + "still marks a genuinely sector-inapplicable metric as N/A" (`ApexFreight/arr_eop` → `na`).
- **Acceptance:** live cross-check — marketplace & payments N/A columns dropped from 5/4 to `{arr_eop, NRR, logo_churn}` (3 each); `cash_balance`/`monthly_burn` now render as gaps; credit stays N/A on the 5 a lender isn't expected to have. Consistent with the 30 live `missing_metric` issues.
- **Retrocompat:** ✅ SAFE — frontend-only; tightens a label, adds no contract; `MISSING_METRIC_CODE` is the schema literal, Phase 3 formalizes the named const.

## A2 — DoD test-coverage gap *(MED — partially fixed + accepted)*

- **Problem:** DoD #2 named "reports list renders before run", "Load populates the grid", "N/A-by-sector renders N/A not missing". Only the third was unit-tested (logic-only). The first two are App-level React wiring, unit-tested by nothing (only `tsc` + `vite build` + the Phase-0 `/api/run` smoke).
- **Fix:** extracted the cold-start decision into `initialStatus(cachedExport)` (`web/src/lib/appState.ts`) with `appState.test.ts` — `initialStatus(null) === "idle"` (the gate that makes the reports-list-before-run behavior hold) and `initialStatus(export) === "loaded"`.
- **Accepted remainder:** "Load populates the grid" (the `handleLoad → setData → RagGrid` wiring) stays **not** DOM-unit-tested — a deliberate consequence of the user's **logic-only** test choice. It is covered by: `tsc --noEmit` (component binds the frozen types), `vite build` (compiles), and the data-path smoke (`POST /api/run` → the export the grid renders). Honest status: behaviors #1 and #3 unit-tested; #2 verified by typecheck + build + smoke + the P4 offline dry-run.
- **Retrocompat:** ✅ SAFE.

## A3 — live 90/15 vs. golden 91/14 *(MED — root-caused; resolution = accept + document)*

- **Problem:** the app's path (`run_pipeline_in_memory`, raw-PDF parse) yields `LendBridge 15 / MediSight 11` → **saas 90 / credit 15**; the committed `tests/golden/metrics_long.enhanced.json` yields `LendBridge 14 / MediSight 12` → **91 / 14** (matches the doc). Both total 116.
- **Root cause (investigated 2026-07-12):** the two run **different parse inputs by design**. The golden test (`tests/test_golden.py:59-74`) normalizes a **frozen 24-file parse snapshot** at `tests/golden/parsed/*.parsed.json` (NOT the 3-file `tests/fixtures/parsed/` demo set, and NOT the raw PDFs). That frozen snapshot renders PDF tables as **markdown pipe-tables** (`| Net Revenue Retention(LTM) | 119% |`); the current `LocalPdfParser` (what the demo runs) renders them as **space-padded columns**. Same PDFs, same numbers — the detector attributes/recovers differently on the two text shapes:
  1. **+1 credit:** the current parser recovers a **real** `LendBridge Q2 2024 headcount` (162 — "Total Headcount 162" is literally in the PDF) that the frozen snapshot missed. *The live parser is more correct here.*
  2. **−1 MediSight:** the snapshot's `NRR (LTM) 119%` is attributed to **TalentVault** by the current parser (then deduped against TalentVault's own report) but to **MediSight** by the frozen snapshot — an **attribution ambiguity** in the multi-company summary (which company owns the 119%?), not a recall miss (the 119% IS detected live).
- **Resolution — ACCEPT + DOCUMENT (owner decision, 2026-07-12):** no change to the golden or the parser. The golden stays the **frozen legacy retrocompat canary** (its purpose: legacy byte-identical to pre-change 1.0.0 — regenerating it would redefine that anchor, which the retrocompat-non-negotiable rule forbids without deliberate review). The **live parser (90/15) is the demo's source of truth**. The frontend is **count-agnostic** (grep-confirmed: no count literals in `web/src`), so Phase 1 is unaffected. The phase doc's `91/14` acceptance is annotated with the live `90/15`.
- **Deferred (owner may revisit before the interview):** (a) regenerate `tests/golden/parsed/` + baselines from the current parser if demo==golden consistency is wanted (deliberate, timestamp-pinned, redefines the legacy canary); (b) settle the snapshot NRR owner (MediSight vs TalentVault) and fix the attribution heuristic if wrong.
- **Retrocompat:** ✅ SAFE — nothing changed; the divergence is a pre-existing Phase-0-era backend/data matter, out of Phase 1's frontend scope.

## A4 — dead `loading` prop *(LOW — fixed)*

- **Problem:** `ReportsList` only mounted in `idle`; clicking Load flipped to `loading`, unmounting it, so its `loading` branch never rendered.
- **Fix:** App renders `ReportsList` when `idle || loading`, passing `loading={status === "loading"}`; the top-level bare "Loading…" is removed; the "No run yet" prompt is hidden while loading. The file list now stays visible with a disabled "Loading…" button during the run (better demo UX + prevents double-submit).
- **Files:** `web/src/App.tsx`, `web/src/components/ReportsList.tsx`.
- **Retrocompat:** ✅ SAFE.

## A5 / C2 / R1 — accepted deviations (no code change)

- **A5** (latest-period tie-break, first-wins): deterministic; live golden has 0 company×metric×period ties. Conflict surfacing belongs to Phase 3 reconciliation. Left as-is with a code comment.
- **C2a** (`"refused"` literal): correct + schema-faithful today; Phase 3 introduces `REFUSED_STATUS` and `grid.ts` will import it then (do not pre-empt). **C2b** (`export` prop): legal TS/JSX, intentional mirror of the §A.2/§A.4 envelope field; every later panel uses the same `{ export: exp }` shape.
- **R1** (`tsc` needs `vitest`): only bites a `npm ci --omit=dev` install, which no build path here uses (`make build-web` = `npm ci && npm run build`). One-line fix (`"exclude": ["src/**/*.test.ts"]`) available if a prod-only install is ever added.

## Verification checklist

- [x] A1 fixed + unit-tested + live-corpus cross-checked (N/A columns correct per sector).
- [x] A2 `initialStatus` extracted + tested; remainder recorded as accepted logic-only gap.
- [x] A3 recorded; frontend confirmed count-agnostic; flagged for owner.
- [x] A4 fixed; `loading` prop now reachable.
- [x] C1 registry rows added.
- [x] Frontend gate: `npm test` **11 passed**, `npm run build` (tsc + vite) green.
- [x] Backend gate: **103** (flask present) / **95** (flask-absent) dots, zero failures; golden **15** byte-identical; **zero `.py` changed**.
