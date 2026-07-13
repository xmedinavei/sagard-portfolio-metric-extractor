# Phase 4: Provenance drill-down + demo-ready checklist (Build Spec)

> **Date:** 2026-07-12
> **Status:** ✅ **Built + Audited** (2026-07-12) · **7** provenance frontend tests (**40** total vitest) + offline dry-run green · fixes in [`04-provenance-fixes.md`](./04-provenance-fixes.md)
> **Build deviation:** provenance click-to-source was additively extended to the **Refuse panel** (flagship-#2 refused numbers) to satisfy the graded success criterion #4, beyond the spec's grid+trend scope (audit A-MED1). Frontend-only; zero Python changed.
> **Scope:** additive, gated, no migration; non-opted-in users observably unchanged (frontend-only + a build/commit step).
> **Depends-on:** Phase 0 (foundations gate), Phase 1 (grid cells to click)  ·  **Blocks:** none (this is the convergence / ship phase)
> **Feeds:** the demo  ·  **Parallelizable-with:** Phase 2, Phase 3 (the provenance *panel*); the click-wiring into Phase 2's trend points is a **soft feed** — wire it when Phase 2 exists
> **Parent plan:** [`../01-plan.md` §7 Phase 4 + §7 note (retained P5.2/P5.3)](../01-plan.md)  ·  **Index:** [`./README.md`](./README.md)
> **Target file(s) / code root:** `web/src/components/ProvenanceDrawer.tsx`, `web/dist/` (committed bundle), `Makefile`
> **Ground-truthed:** 2026-07-12

## Purpose

Phase 4 makes the cockpit **trustworthy and demo-safe**. First, a **provenance drawer**: clicking any number (a grid cell from Phase 1, a trend point from Phase 2) opens a panel showing where that number came from — `source_file`, `raw_label`, `raw_value_text`, `confidence`, and `source_snippet`, labelled honestly as **"source file (file-level)"** because `source_page` is `null` by design in v1. Second, the **demo-ready checklist** (the retained `P5.2` + `P5.3`, hoisted here per the plan's §7 note): commit a known-good **pre-built bundle** and run a **full offline dry-run** so a live `npm run dev` failure or a stray network call can never kill the interview demo. This is the convergence phase — it consumes what P1/P2/P3 built and ships the graded core (P0–P4).

## Reorganization vs. the parent plan

- **`P5.2` + `P5.3` hoisted into this phase as `4.2` + `4.3`.** The plan deferred `P5.1` (visual polish) but explicitly **retained** the two demo-safety items (plan §7 note + §9 gate resolution). They live here — folded into Phase 4's tail — because "commit a known-good bundle + offline dry-run" is only meaningful once every panel (P1–P4) exists. Keeping them here means the graded core stays a clean **P0–P4** with no separate Phase 5.
- **Provenance is a drill-down triggered from other phases' surfaces.** Its *panel* is parallel-track (reads §A.4 fields), but its *click wiring* completes per surface: grid cells (Phase 1) are the baseline; trend points (Phase 2) are wired when Phase 2 is present. If Phase 4 is built before Phase 2, wire the grid path now and add the trend-point path when Phase 2 lands (a `04-provenance-fixes.md` sibling if needed).

## §A Frozen cross-phase data contracts

*None declared here — consumes [`00-foundations.md` §A.4](./00-foundations.md) (`MetricRow`: `source_file`, `raw_label`, `raw_value_text`, `value`, `confidence`, `source_snippet`, `source_page`).*

## § Phase 4 TODOs

> Format: **`action → file:line → acceptance`**. Work top-to-bottom; satisfy each group's **Acceptance** before moving on.
> Legend: `☐` to-do · `☑` implemented · `✅` acceptance verified.

### 4.1 Provenance drawer — one click from any number to its source

- `✅` **4.1a** `ProvenanceDrawer` → `web/src/components/ProvenanceDrawer.tsx` (new). Slide-over (Esc/backdrop/× to close) showing `source_file`, `raw_label`, `raw_value_text`, `display_value`/`value`, `confidence` (formatted `×100` → "99.0%"; the export's confidence is a **0.0–1.0 fraction**), and `source_snippet`. Labels provenance **"source file (file-level)"**; `pageDisplay` is null when `source_page` is null (the norm — 116/116), so no page number is shown (DEC-C). *Build note:* display logic lives in the new pure `web/src/lib/provenance.ts` (`provenanceView`/`formatConfidence`, unit-tested) — mirrors the grid.ts/trend.ts/comparison.ts lib+component split, since Vitest is node-only.
- `✅` **4.1b** Grid-cell trigger — `RagGrid.tsx` gained an optional `onSelectRow?(row)`; value cells (only) are clickable (`role="button"`, Enter/Space) and pass `Cell.row`. Append-only: absent prop = byte-identical Phase 1 render.
- `✅` **4.1c** Trend-point trigger — `TrendExplorer.tsx`/`TrendChart` gained the same optional `onSelectRow?`; each point has a 12 px transparent hit target → opens the drawer for that point's `MetricRow` (added additive `row: MetricRow` to `TrendPoint`). *Build note:* also extended to the **Refuse panel** refused numbers (audit A-MED1) for the graded SC#4.
- **Acceptance:** ✅ every displayed number — grid cell, trend point, **and refused number** — is **one click** from its provenance (`source_file` + `raw_label` + `confidence` + snippet), page-level honestly shown as file-level (success criterion #4). Verified live: provenance fields non-empty on **116/116** rows, `source_page` null 116/116.

*Template to copy: none in-repo; a slide-over/drawer reading the already-loaded `MetricRow`. All 6 provenance fields are populated 116/116 in the live export (plan §3.3).*

### 4.2 Commit the known-good pre-built bundle *(retained P5.2 — demo safety)*

- `✅` **4.2a** Built the production bundle: `make build-web` → `web/dist/` (rebuilt **after** the drawer + RefusePanel edits, so the frozen bundle includes Phase 4: `web/dist/assets/index-CdcmSSzs.js`). Un-ignored it with a **two-line** negation (audit R-LOW1): `!web/dist/` + `!web/dist/**` — a lone `!web/dist/` fails because the parent dir is excluded by the depth-agnostic `dist/` rule (git cannot re-include a file whose parent dir stays excluded); plus a defensive `web/dist/node_modules/` re-exclude. Verified via `git check-ignore -v`. *Build note:* the commit uses explicit `git add`, never `commit -a` (audit A-MED3), so the untracked drawer + bundle are actually staged.
- `✅` **4.2b** Confirmed `make serve` boots `python -m portfolio_metrics.webapp` serving the committed `web/dist` same-origin (never `npm run dev`) — the primary de-risk for the React choice (plan §8 rollback).
- **Acceptance:** ✅ `make serve` on the committed bundle renders the full cockpit offline (real HTTP: `GET /` → 200, `index-CdcmSSzs.js`); `git add --dry-run web/dist` = exactly `index.html` + the hashed JS, **no `node_modules`**. *(The `git commit` itself is the owner's handoff decision, matching P0–P3.)*

*Template to copy: the `.gitignore` negation pattern already used for outputs at `.gitignore:18-19` (`outputs/*` then `!outputs/.gitkeep`) — mirror that shape for `web/dist`.*

### 4.3 Full offline dry-run of the demo script *(retained P5.3 — demo safety)*

- `✅` **4.3a** Ran the demo path over real HTTP against the server serving the committed bundle: `GET /` → 200 (the frozen SPA); `GET /api/reports` → **24** PDFs listed **before** any run (success #7); `POST /api/run` → **24/24** parsed in **0.93 s**, schema **1.1.0**, **116** metrics. Provenance data present on every panel (drawer payload verified 116/116). *(The pixel-level click→drawer render is the manual demo rehearsal — audit A-MED2; the wiring is `tsc`-checked and the drawer is in the served bundle.)*
- `✅` **4.3b** Canary signals green: **Flagship #1** NovaCloud `arr_eop` = **5 quarters**; **Flagship #2** LendBridge gross margin = **5/5 refused** (`interest_margin`). Offline guard: `parser_used == "local"` enforced per-doc (`webapp.py:82`); no network client is importable from `webapp`.
- **Acceptance:** ✅ end-to-end **0.93 s** (< ~3 s), offline by construction (forced `LocalPdfParser`), from the committed bundle; both flagships + provenance green; `parser_used == "local"` throughout. *(A true network-off rehearsal on the demo laptop is the human pre-interview step; Phase-0 already proved offline under a hard network block.)*

> ⚠️ **Hazard callouts:**
> - **`source_page` is null by design** — provenance is **file-level** in v1 (DEC-C). Never render a page number; label it "source file (file-level)."
> - **Serve the committed bundle, never a dev server** (H-demo): the demo must run `make serve` over the frozen `web/dist`, not `npm run dev` — the whole React-risk mitigation depends on this.
> - **Offline guard** (H2): the dry-run must confirm `parser_used == "local"` — the construction-time guarantee that no network path exists.

## § Retrocompat notes

| Change | Class | Why safe |
| --- | --- | --- |
| New `ProvenanceDrawer` component + `web/src/lib/provenance.ts` | ✅ SAFE | New files under `web/src/`; render-only + pure logic. Inert until a row is selected (`row={null}` → renders null, no global key listener). |
| Optional `onSelectRow?` prop on `RagGrid`, `TrendExplorer`, **`RefusePanel`** | ✅ SAFE | Additive optional prop; Phase 1/2/3 acceptance unchanged (all render byte-identically when the prop is absent — auditor-confirmed). |
| Additive `row: MetricRow` field on `TrendPoint` (Phase-2-private) | ✅ SAFE | Populated by the sole producer `buildSeries`; no test/component constructs a `TrendPoint` literal, so a required field breaks nothing; existing fields + flagship behavior unchanged. |
| Commit `web/dist` + `.gitignore` two-line negation | ⚠️ CONDITIONAL | `!web/dist/` **and** `!web/dist/**` (a lone `!web/dist/` fails — parent dir excluded by `dist/`); plus a defensive `web/dist/node_modules/` re-exclude (audit R-LOW1). `git check-ignore`-verified to un-ignore ONLY the 2 bundle files; node_modules + build/ + egg-info stay ignored. |

**Net: zero breaking, zero migration.** Non-opted-in users observably unchanged — frontend files + a committed static bundle; **zero Python changed** (`make test` 105/97, `make verify-golden` 15 byte-identical, ruff clean); deleting the web layer still restores byte-identical CLI output.

## § Definition of done

1. [x] All `4.M` task groups complete; every **Acceptance** met (4.1 provenance; 4.2 committed bundle; 4.3 offline dry-run).
2. [x] **7** provenance frontend tests (`formatConfidence` ×2 incl. clamp; `provenanceView` ×5 incl. `source_page` null → "file-level"/no page, null value, empty snippet) — **40** total vitest, `tsc` clean; `make test` **105** (97 flask-absent); `make verify-golden` **15** byte-identical. *(The DoD's original "still 95" is stale — backend moved to 105/97 via the P3 user-approved parser fix.)*
3. [x] Every change classified in **§ Retrocompat notes**; nothing BREAKING.
4. [x] Demo dry-run passes offline from the committed bundle; both flagships + provenance green; `parser_used == "local"`.
5. [x] Symbol name matches the README naming registry verbatim (`ProvenanceDrawer`); new `provenance.ts` recorded as an additive registry row (audit C-LOW1).
6. [x] *(n/a — no §A here; consumes 00-foundations §A.4.)*

---

## § Live findings

- **Provenance data is complete + file-level:** all 6 fields non-empty on **116/116** rows; `source_page` null on **116/116** (DEC-C is a data fact, not just a design choice). `confidence` is a **0.0–1.0 fraction** (0.9035–0.995), so the drawer formats it `×100`.
- **The grid already carried the source row:** `Cell.row` (`grid.ts:169`) is populated for every value cell, so grid click-to-source needed no new lookup. Trend points did not carry it → added `TrendPoint.row` (additive).
- **Vitest is node-only** (glob `src/**/*.test.ts`, no jsdom) — the click→render interaction is not DOM-testable here; covered instead by the tested pure projection + `tsc` + the bundle-content check + the live data proof (audit A-MED2, accepted per Xavier's Phase-1 "logic-only" decision).

## § Implementation notes

- **Files (frontend + `.gitignore`; zero Python):** NEW `web/src/lib/provenance.ts` (`provenanceView`, `formatConfidence`, `PROVENANCE_GRANULARITY_LABEL`, `ProvenanceView`) + `provenance.test.ts` (7 tests) + `web/src/components/ProvenanceDrawer.tsx` (slide-over). EDITED `web/src/lib/trend.ts` (`TrendPoint.row`), `RagGrid.tsx` + `TrendExplorer.tsx` + **`RefusePanel.tsx`** (optional `onSelectRow`), `App.tsx` (`selectedRow` state + `<ProvenanceDrawer>`), `.gitignore` (two-line negation + defensive re-exclude). Rebuilt `web/dist` (`index-CdcmSSzs.js`).
- **Architecture:** display logic in `web/src/lib/provenance.ts` (unit-tested), thin `.tsx` renderer — mirrors the grid.ts/trend.ts/comparison.ts split forced by the node-only Vitest config.
- **Audit:** 3 `phase-auditor` lenses (retrocompat · contract/registry · acceptance/DoD) → **0 Critical/High**, all 3 acceptances hold. 7 findings (3 MED, 4 LOW) all fixed/accepted — see [`04-provenance-fixes.md`](./04-provenance-fixes.md). Notable: A-MED1 (extended click-to-source to the Refuse panel for SC#4); R-LOW1 (narrowed the `.gitignore` negation).

## § Unblocked phases

*This is the **convergence** phase — completing it ships the graded core (**P0–P4**). No further phases: former P5.1 visual polish is deferred (not a phase here). The demo-ready checklist (4.2 committed bundle + 4.3 offline dry-run) is done. Remaining owner action = the Phase-4 `git commit` (explicit `git add` per A-MED3), then Doc iii (deck).*
