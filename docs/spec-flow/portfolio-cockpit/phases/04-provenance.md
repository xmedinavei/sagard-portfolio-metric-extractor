# Phase 4: Provenance drill-down + demo-ready checklist (Build Spec)

> **Date:** 2026-07-12
> **Status:** Not started · target `~2` frontend tests + 1 offline dry-run gate *(flip to In progress / Built / Audited)*
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

- `☐` **4.1a** `ProvenanceDrawer` → `web/src/components/ProvenanceDrawer.tsx` (new). Given a clicked `MetricRow`, show `source_file`, `raw_label`, `raw_value_text`, `value`/`display_value`, `confidence`, and `source_snippet`. Label the section **"source file (file-level)"** and, when `source_page` is `null` (the norm — §A.4), do **not** show a page number or a fake one (DEC-C, file-level provenance).
- `☐` **4.1b** Wire the open trigger from **grid cells** (Phase 1 `RagGrid`): clicking a cell passes its `MetricRow` to the drawer → edit `RagGrid.tsx` to emit the click (append-only prop; do not change its Phase 1 acceptance).
- `☐` **4.1c** *(soft feed — only if Phase 2 exists)* Wire the same drawer from **trend points** (Phase 2 `TrendExplorer`): clicking a point opens the drawer for that period's `MetricRow`.
- **Acceptance:** every displayed number (grid cell, and trend point when Phase 2 is present) is **one click** from its provenance — `source_file` + `raw_label` + `confidence` + snippet — with page-level honestly shown as file-level (success criterion #4).

*Template to copy: none in-repo; a slide-over/drawer reading the already-loaded `MetricRow`. All 6 provenance fields are populated 116/116 in the live export (plan §3.3).*

### 4.2 Commit the known-good pre-built bundle *(retained P5.2 — demo safety)*

- `☐` **4.2a** Build the production bundle: `make build-web` → `web/dist/`. Then **commit `web/dist/`** so the demo serves a frozen, known-good bundle. Note: `web/dist` is currently gitignored by `.gitignore:14` (`dist/`) — to commit it, add a **negation** `!web/dist/` (append-only, after the existing rules) OR force-add (`git add -f web/dist`). Prefer the explicit negation so it is reproducible.
- `☐` **4.2b** Confirm `make serve` serves the **committed** `web/dist` (never `npm run dev`) — this is the primary de-risk for the React choice (plan §8 rollback).
- **Acceptance:** `make serve` on the committed bundle renders the full cockpit with the **network off**; `git status` shows the committed `web/dist` bundle and no stray `node_modules`.

*Template to copy: the `.gitignore` negation pattern already used for outputs at `.gitignore:18-19` (`outputs/*` then `!outputs/.gitkeep`) — mirror that shape for `web/dist`.*

### 4.3 Full offline dry-run of the demo script *(retained P5.3 — demo safety)*

- `☐` **4.3a** With the network **off**, run the exact demo path end-to-end: start clean (raw PDFs only) → **Load reports** → sector RAG grid (P1) → NovaCloud 5-quarter trend (P2) → refuse-to-compare + reconciliation (P3) → click any number → provenance (P4).
- `☐` **4.3b** Confirm the **canary signals** (plan §8): both flagships render (NovaCloud 5-quarter ARR line; LendBridge GM "refused") and every number is one click from source. If either flagship is blank, stop and inspect before relying on the demo.
- **Acceptance:** end-to-end runs **< ~3 s**, fully offline, from the committed bundle; both flagships + provenance are green; `parser_used == "local"` throughout (no network attempted).

> ⚠️ **Hazard callouts:**
> - **`source_page` is null by design** — provenance is **file-level** in v1 (DEC-C). Never render a page number; label it "source file (file-level)."
> - **Serve the committed bundle, never a dev server** (H-demo): the demo must run `make serve` over the frozen `web/dist`, not `npm run dev` — the whole React-risk mitigation depends on this.
> - **Offline guard** (H2): the dry-run must confirm `parser_used == "local"` — the construction-time guarantee that no network path exists.

## § Retrocompat notes

| Change | Class | Why safe |
| --- | --- | --- |
| New `ProvenanceDrawer` component | ✅ SAFE | New file under `web/src/components/`; render-only. |
| Append click-emit prop to `RagGrid` (and `TrendExplorer` if present) | ✅ SAFE | Additive prop; Phase 1/2 acceptance unchanged (grid/trend still render without the drawer wired). |
| Commit `web/dist` + `.gitignore` negation `!web/dist/` | ⚠️ CONDITIONAL | Append-only negation after existing rules; mirrors the `outputs/` negation pattern (`.gitignore:18-19`); does not un-ignore anything else. |

**Net: zero breaking, zero migration.** Non-opted-in users observably unchanged — frontend files + a committed static bundle; the CLI/tests/golden guard are untouched, and deleting the web layer still restores byte-identical output.

## § Definition of done

1. [ ] All `4.M` task groups complete; every **Acceptance** met (4.1 provenance; 4.2 committed bundle; 4.3 offline dry-run).
2. [ ] ~2 frontend tests (click a grid cell → drawer shows source_file/raw_label/confidence; `source_page` null renders "file-level," no page number); `make test` still **95**; `make verify-golden` byte-identical.
3. [ ] Every change classified in **§ Retrocompat notes**; nothing BREAKING.
4. [ ] Demo dry-run passes fully offline from the committed bundle; both flagships + provenance green.
5. [ ] Symbol name matches the README naming registry verbatim (`ProvenanceDrawer`).
6. [ ] *(n/a — no §A here.)*

---

## § Live findings *(build agent fills during `/spec-flow:4-build-phase`)*

## § Implementation notes *(build agent fills)*

## § Unblocked phases *(build agent fills)*

*This is the convergence phase — completing it ships the graded core (P0–P4). Deferred: former P5.1 visual polish (not a phase here).*
