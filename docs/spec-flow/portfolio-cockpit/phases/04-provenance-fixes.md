# Phase 4 — Build Deviations & Audit Fixes (`04-provenance-fixes.md`)

> **Date:** 2026-07-12 · **Sibling of:** [`04-provenance.md`](./04-provenance.md)
> **Trigger:** a Step-5 adversarial audit by 3 `phase-auditor` agents (lenses: retrocompat · contract/registry · acceptance/DoD + test-adequacy).
> **Result:** the three functional acceptances (4.1 provenance drawer · 4.2 committed bundle · 4.3 offline dry-run) **HOLD** against live data; **no Critical/High** findings. Phase 4 is **frontend-only + a committed static bundle** — zero Python changed. Frontend gate: **40** vitest tests, `tsc`+`vite` green (218.0 kB / 68.2 kB gz). Backend gate: **105** flask-present / **97** flask-absent / golden **15** byte-identical; ruff clean.

## TL;DR — severity table

| # | Sev | Finding | Resolution |
| --- | --- | --- | --- |
| **A-MED1** | MED | The Refuse panel re-renders the flagship-#2 **refused numbers** as plain (non-clickable) text, so they are not one-click-to-source — vs the **graded** success criterion #4 ("every displayed number is one click from its source"). `4.1b/4.1c` had only wired grid cells + trend points. | **FIXED** — threaded the existing optional `onSelectRow` prop into `RefusePanel`; the refused `display_value` is now a clickable, keyboard-operable source trigger. Additive (panel renders unchanged when the prop is absent). |
| **A-MED2** | MED | The demo-critical **click → drawer render → close** path has zero *executed* test coverage, and the DoD's "click a grid cell → drawer shows …" test cannot run under the node-only Vitest config (glob `src/**/*.test.ts`, no jsdom). | **ACCEPTED (logic-only) + hardened.** Xavier locked "Vitest logic-only, no jsdom" in Phase 1 — adding a jsdom project would reverse that decision, so we do **not**. Coverage instead = the tested pure projection (`provenanceView`) + `tsc` type-checking the whole wiring + the drawer strings present in the served bundle + provenance data proven 116/116 live. Added a node-testable empty-snippet case + a drawer guard. The pixel-level click is the **manual demo rehearsal** (4.3 is inherently a rehearsal). |
| **A-MED3** | MED | 4.2 says "git status shows the **committed** web/dist bundle," but mid-build the bundle + new files are **untracked** — a `git commit -a` would ship the wiring edits **without** the drawer or the bundle. | **HANDLED at commit** — the commit MUST use explicit `git add` (or `git add -A`), never `commit -a`. The `.gitignore` negation is correct and the bundle is fresh; committing is the handoff decision (matching the P0–P3 rhythm). Not a code defect. |
| **R-LOW1** | LOW | `!web/dist/**` re-includes *everything* under `web/dist`; being the last match it would silently un-ignore a hypothetical future `web/dist/node_modules/`. Zero impact today (Vite emits only `index.html` + one hashed JS). | **FIXED** — appended a defensive re-exclude `web/dist/node_modules/` **after** the wildcard (last match wins). Verified `git check-ignore` now re-ignores it while the real bundle stays tracked. |
| **C-LOW1** | LOW | The new Phase-4-private lib `web/src/lib/provenance.ts` (+4 exports) and the additive `onSelectRow?` props are absent from the README naming registry ("single source of truth"). | **FIXED (doc)** — added a `provenance.ts` registry row + an `onSelectRow` note; a legitimate additive that mirrors `grid.ts`/`trend.ts`/`comparison.ts`, so "record it," not a violation. |
| C-nit | nit | `provenance.ts` comment said a "90.4%" row is distinguishable, but `0.9035` renders `"90.3%"` (IEEE-754 `toFixed` floor). | **FIXED** — comment corrected to `90.3%` (the honest float result); the same wrong assumption in the test was already corrected during the gate. |
| A-LOW1 | LOW | DoD item 2 + header carried stale counts ("make test still **95**", "**~2** frontend tests"). | **FIXED (doc)** — restated to **105** backend / **15** golden / **40** frontend (6 new provenance tests). Backend moved to 105/97 via the P3 user-approved parser fix. |

---

## A-MED1 — refused numbers are now click-to-source *(scope extension toward the graded SC#4)*

- **Problem.** The phase spec's `4.1b/4.1c` scoped click-to-source to **grid cells + trend points**. But the *graded* success criterion #4 (`00-spec-and-scope.md`, `01-plan.md` §6.3) is broader: *every displayed number* should be one click from its source. `RefusePanel` renders the LendBridge gross-margin **refused** numbers (`display_value`) as plain text — the exact flagship-#2 numbers a stakeholder is most likely to want to trace ("you refused to rank this — prove it").
- **Fix.** `RefusePanel` gained the same optional `onSelectRow?: (row: MetricRow) => void` prop as `RagGrid`/`TrendExplorer`; the refused `display_value` is wrapped in a clickable `role="button"` span (Enter/Space + click) that opens the provenance drawer for that row. `App.tsx` passes `onSelectRow={setSelectedRow}`. **Additive** — the panel renders identically when the prop is absent (Phase 3 acceptance intact).
- **Why not Reconciliation.** `ReconciliationPanel`'s observed/expected/delta are a **cross-document** comparison (two source files), not a single `MetricRow`, and the live data has **0 conflicts** so no card renders. The panel already names both source documents in its copy. Left as-is (recorded as a v-next: a two-source provenance view).
- **Files:** `web/src/components/RefusePanel.tsx`, `web/src/App.tsx`.

## A-MED2 — click→render coverage *(accepted logic-only, consistent with the locked test strategy)*

- **Problem.** DoD item 2 describes a click-through test (click a cell → drawer shows source_file/raw_label/confidence). Vitest here is **node-only** (`vite.config.ts:24-25`, `environment: "node"`, glob `src/**/*.test.ts`) — a `.test.tsx` component test would be silently excluded and has no DOM. So the click→drawer interaction is not *executed* in any test.
- **Resolution — ACCEPT + harden.** Xavier chose "**Vitest logic-only** (no Testing-Library/jsdom)" via AskUserQuestion in Phase 1; adding a jsdom test project now would reverse a locked decision. The consistent, honest coverage is:
  - the **pure projection** `provenanceView`/`formatConfidence` is unit-tested (7 tests) — the drawer is a thin renderer of exactly that;
  - `tsc --noEmit` type-checks the **entire** click wiring (RagGrid/TrendExplorer/RefusePanel → `onSelectRow` → `setSelectedRow` → `<ProvenanceDrawer>`);
  - the served bundle **contains** the drawer (grep of `web/dist/assets/*.js` for "source file (file-level)", "Source excerpt");
  - the offline dry-run proved the drawer's **data** is present on **116/116** rows;
  - the actual pixel-level click is the **manual demo rehearsal** — which is what `4.3` (offline dry-run of the demo script) *is*.
- **Hardened.** Added a node-testable empty-snippet passthrough test + a drawer guard that hides the excerpt block when the snippet is empty (defensive; 116/116 live rows have one).
- **Files:** `web/src/lib/provenance.test.ts`, `web/src/components/ProvenanceDrawer.tsx`.

## A-MED3 — commit hygiene for the bundle *(handled at the commit step)*

- **Problem.** 4.2's acceptance says the bundle is *committed*. Mid-build, `web/dist/`, `ProvenanceDrawer.tsx`, `provenance.ts`, `provenance.test.ts` are **untracked**; `git commit -a` stages only *modified tracked* files → it would ship the wiring **without** the drawer component or the bundle.
- **Resolution.** The Phase-4 commit uses **explicit `git add`** (the new files + `web/dist/`) or `git add -A` — never `commit -a`. Post-commit check: `git ls-files web/dist/assets` returns the hashed JS and `git show HEAD:web/dist/index.html` references it. Committing is the owner's handoff decision (matching P0–P3).

## R-LOW1 — `.gitignore` negation narrowed *(forward-compat hygiene)*

- **Problem.** `!web/dist/**` (last match) would override `node_modules/` for any path *inside* `web/dist`. No live blast radius (Vite never emits `node_modules` into `dist`).
- **Fix.** Appended `web/dist/node_modules/` **after** the wildcard. Verified: `git check-ignore -v web/dist/node_modules/foo.js` → `.gitignore:37:web/dist/node_modules/` (re-ignored); `web/dist/index.html` + the hashed JS stay un-ignored; `git add --dry-run web/dist` = exactly 2 files.
- **File:** `.gitignore`.

## Ground-truth confirmations folded in (what HOLDS)

- **4.1 wiring is real:** value cells (`RagGrid`), trend points (`TrendExplorer`, 12 px hit target), and now refused numbers (`RefusePanel`) all call `onSelectRow` → `setSelectedRow` → `<ProvenanceDrawer>`. N/A + gap cells are (correctly) not clickable; an "insufficient history" series has no plotted point to click (acceptable).
- **File-level honesty (DEC-C):** `provenanceView` returns `pageDisplay = null` when `source_page` is null (116/116), the drawer shows no page line and labels provenance "source file (file-level)"; it never fabricates a page.
- **Offline guard (H2):** `webapp.py:82` raises if any doc's `parser_used != "local"`; the dry-run's HTTP 200 over 24 docs is the proof.
- **Bundle freshness:** the committed `web/dist/assets/index-CdcmSSzs.js` was built **after** every source edit and contains the drawer + RefusePanel wiring.

## Verification checklist

- [x] A-MED1 fixed — RefusePanel refused numbers click-to-source; additive optional prop; Phase 3 render unchanged when absent.
- [x] A-MED2 accepted + hardened — logic-only per the locked strategy; empty-snippet test + drawer guard added; tradeoff documented.
- [x] A-MED3 — commit uses explicit `git add`; never `commit -a` (handoff step).
- [x] R-LOW1 fixed — defensive `web/dist/node_modules/` re-exclude; `git check-ignore` verified.
- [x] C-LOW1 fixed — README registry rows for `provenance.ts` + `onSelectRow`.
- [x] C-nit fixed — `provenance.ts` comment `90.4%`→`90.3%`.
- [x] A-LOW1 fixed — DoD + header restated to 105 / 15 / 40.
- [x] Frontend gate: `npm test` **40 passed**, `tsc` clean, `npm run build` green (218.0 kB / 68.2 kB gz).
- [x] Backend gate: **105** flask-present / **97** flask-absent; golden **15** byte-identical; ruff clean (no Python changed).
- [x] Offline dry-run: served committed bundle; 24/24 parsed in 0.93 s; both flagships + provenance (116/116) green; `parser_used == "local"`.
