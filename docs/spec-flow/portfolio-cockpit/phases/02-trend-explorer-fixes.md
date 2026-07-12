# Phase 2 — Audit Fixes (`02-trend-explorer-fixes.md`)

> **Date:** 2026-07-12 · **Sibling of:** [`02-trend-explorer.md`](./02-trend-explorer.md)
> **Trigger:** Step-5 adversarial audit of the built Phase 2 by 3 `phase-auditor` agents (lenses: retrocompat · contract/registry · acceptance/DoD).
> **Result:** retrocompat lens **HOLDS** (0 findings); contract/registry lens **HOLDS** except 1 LOW registry-hygiene row; acceptance lens found **2 MED + 3 LOW**, **none Critical/High** — the two named acceptances behaviorally held in the live code (NovaCloud = 5 chronological points; the `<3` guard trips at 1 and 2 periods). All actionable findings resolved **inline**; the rest recorded as accepted. Frontend gate after fixes: **21 tests green** (11 Phase 1 + 10 Phase 2), `tsc`+`vite build` green (205.9 kB / 65 kB gz); backend **103/95** unchanged, golden **15** byte-identical, **zero `.py` changed**.

## TL;DR — severity table

| # | Sev | Finding | Resolution |
| --- | --- | --- | --- |
| M1 | **MED** | The `<3` "insufficient history" guard was only tested at 5/2/1 periods — never at the load-bearing **`==3` boundary**. An off-by-one (`>` for `>=`) would silently flip 3-quarter companies (MediSight, PeopleFlow) to "insufficient history" and still pass all tests. | **FIXED** — added a 3-period (MediSight-shaped) test asserting the series renders (`hasSufficientHistory === true`, `points.length === 3`). |
| M2 | MED | The "nulls filtered" hazard (DoD #4) was only half-covered: the `value === null` drop was tested, but the **`period === null`** and **unparseable-period** (`periodKey < 0`) drops were not. Live data has no nulls, so synthetic tests are the only possible coverage. | **FIXED** — extended the drop/dedupe test with a `period: null` row and an unparseable `"FY2024"` row; both are asserted dropped. |
| L1 | LOW | Spec narrated "**3** label renames"; live data has only **2** distinct `raw_label`s. The UI was already honest (data-driven count), but a presenter reading the spec would say "3" while the screen says "2". | **FIXED (doc)** — corrected the spec Purpose + §2.1b to "2 distinct source labels"; no code change (UI computes the count). |
| L2 | LOW | The "one line across N source labels" note filtered the raw metrics separately from `buildSeries`, so an unparseable-period row could make the **count exceed the plotted set**. | **FIXED** — `TrendPoint` now carries `rawLabel`; the note is derived from the plotted `points`, so the count can never disagree with the drawn line (+ a test asserting NovaCloud spans exactly 2 labels). |
| L3 | LOW | `web/src/lib/trend.ts` + its exports were absent from the README naming registry (same class as Phase 1's `grid.ts`/`appState.ts`, C1). | **FIXED (doc)** — added a `web/src/lib/trend.ts` row to the README registry; added the `trend.ts` + `App.tsx`-wiring rows to the phase's §Retrocompat notes. |
| L4 | LOW | Same-period cross-source conflict is deduped **"first-after-sort wins"**, silently and source-order-dependent, for any user-selected series that has one. | **ACCEPTED** — Phase 3's reconciliation story; documented in `trend.ts`. The flagship default (NovaCloud) is conflict-free live, and enhanced-mode backend reconciles before export. Left as-is with a code comment. |

---

## M1 — `==3` boundary untested *(MED — fixed)*

- **Problem:** `hasSufficientHistory(points)` returns `points.length >= MIN_TREND_POINTS` (`web/src/lib/trend.ts`), but the tests only exercised 5 (pass), 2 (fail), 1 (fail). The minimum-that-must-render (`==3`) had no lock, and the two companies the §2.2 acceptance names by hand (MediSight = 3, PeopleFlow = 3) were never in a fixture. A regression to `>` would hide every 3-quarter company yet keep all 8 tests green.
- **Fix:** added `it("renders at exactly MIN_TREND_POINTS — the ==3 boundary …")` with a 3-row single-metric MediSight fixture → `expect(points).toHaveLength(3)` + `expect(hasSufficientHistory(points)).toBe(true)`.
- **Ground truth confirms no live defect:** the investigator verified MediSight & PeopleFlow each have exactly 3 `arr_eop` periods (their default metric), so they render today — this was a missing lock, not a present bug.
- **Files:** `web/src/lib/trend.test.ts`. **Retrocompat:** ✅ SAFE (test-only).

## M2 — null/unparseable-period drops untested *(MED — fixed)*

- **Problem:** `buildSeries` drops rows where `value === null || period === null` and where `parsePeriodKey < 0` (`trend.ts`), but only the `value === null` branch was tested. A regression that plotted an undated row at key `-1` would mis-order the entire line and ship unnoticed (live data has no nulls, so only synthetic tests can catch it).
- **Fix:** extended the drop/dedupe test with a `period: null` row (value 50) and an unparseable `period: "FY2024"` row (value 60); both are asserted excluded (`points` stays length 1).
- **Files:** `web/src/lib/trend.test.ts`. **Retrocompat:** ✅ SAFE (test-only).

## L1 — spec "3 renames" vs live "2 labels" *(LOW — fixed, doc)*

- **Problem:** spec Purpose + §2.1b said the ARR label was renamed "3 times"; live NovaCloud `arr_eop` carries **2** distinct `raw_label`s (`"End-of-Period ARR"` ×4, `"ARR (End of Period)"` ×1). The built UI computes the count from data (`rawLabels.size`) — so the *screen* is honest — but the spec text would mislead the demo narration.
- **Fix:** corrected the spec Purpose + §2.1b to "2 distinct source labels". No code change.
- **Files:** `02-trend-explorer.md`. **Retrocompat:** ✅ SAFE (doc-only).

## L2 — "N source labels" note could overcount *(LOW — fixed)*

- **Problem:** the note computed `rawLabels` by re-filtering `export.metrics` on `value !== null && period !== null`, but **not** on `parsePeriodKey >= 0`. A non-null-but-unparseable period would contribute its `raw_label` to the count even though `buildSeries` excludes that row from the line — so `N` could exceed the labels actually behind the drawn series.
- **Fix:** added `rawLabel` to `TrendPoint`; `buildSeries` sets it per kept point; the component derives the note from `new Set(points.map(p => p.rawLabel))`. Now the count is consistent-by-construction with the plotted set. Added a test asserting NovaCloud's 5 points span exactly 2 labels.
- **Files:** `web/src/lib/trend.ts`, `web/src/components/TrendExplorer.tsx`, `web/src/lib/trend.test.ts`. **Retrocompat:** ✅ SAFE (additive field; render-only).

## L3 — registry / retrocompat-table completeness *(LOW — fixed, doc)*

- **Problem:** the new pure-logic file `web/src/lib/trend.ts` (+ `MIN_TREND_POINTS`, `TrendPoint`, `buildSeries`, `hasSufficientHistory`, `distinctCompanies`, `metricsForCompany`) was absent from the README naming registry — inconsistent with Phase 1, whose `grid.ts` was registered (C1). The `App.tsx` wiring edit was also not enumerated in the phase's §Retrocompat notes.
- **Fix:** added a `web/src/lib/trend.ts` row to the README "New files — frontend" table; added `trend.ts` + `App.tsx`-wiring rows to §Retrocompat notes.
- **Files:** `phases/README.md`, `02-trend-explorer.md`. **Retrocompat:** ✅ SAFE (doc-only, additive rows). DoD #5's literal requirement (`TrendExplorer` verbatim) was already met.

## L4 — same-period conflict "first-wins" *(LOW — accepted, no code change)*

- **Problem:** `buildSeries` dedupes to one point per distinct period, keeping the first row after a stable key-only sort. For a user-selected series with a genuine same-period cross-source conflict, the plotted point is whichever source appeared first — chosen silently.
- **Resolution — ACCEPT:** conflict surfacing is **Phase 3's reconciliation** story (the same MediSight/TalentVault mirror-pair machinery), out of Phase 2's scope. The dedup is deterministic and documented in `trend.ts`. The flagship default (NovaCloud) is conflict-free in the live data, and enhanced-mode backend reconciliation suppresses mirror-pairs before the export reaches the frontend. Left as-is; Phase 3/4 may add a small "conflict on this quarter" marker if desired.

## Verification checklist

- [x] M1 fixed — `==3` boundary locked (MediSight-shaped fixture renders).
- [x] M2 fixed — `period: null` + unparseable-period drops tested.
- [x] L1 fixed — spec narration corrected to 2 labels; UI already data-driven.
- [x] L2 fixed — `rawLabel` on `TrendPoint`; note derived from plotted set + tested.
- [x] L3 fixed — README registry row + retrocompat-table rows added.
- [x] L4 accepted — Phase 3 reconciliation territory; documented in code.
- [x] Frontend gate: `npm test` **21 passed**, `npm run build` (tsc + vite) green (205.9 kB / 65 kB gz).
- [x] Backend gate: **103** (flask present) / **95** (flask-absent) dots, zero failures; golden **15** byte-identical; **zero `.py` changed**.
