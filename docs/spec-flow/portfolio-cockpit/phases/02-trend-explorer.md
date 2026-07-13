# Phase 2: Flagship #1 — over-time trend explorer (Build Spec)

> **Date:** 2026-07-12
> **Status:** ✅ Built + Audited (2026-07-12) · **10 frontend tests** (5-point chronological series · ==3 boundary · <3 guard · null/unparseable/dedupe · raw-label collapse · selector helpers) · backend `95`/`103` unchanged, golden `15` byte-identical · audit fixes in [`02-trend-explorer-fixes.md`](./02-trend-explorer-fixes.md)
> **Scope:** additive, gated, no migration; non-opted-in users observably unchanged (frontend-only, reads loaded export).
> **Depends-on:** Phase 0 (foundations gate), Phase 1 (loaded export state)  ·  **Blocks:** none
> **Feeds:** the trend points that Phase 4 makes click-to-source (soft feed)  ·  **Parallelizable-with:** Phase 3, Phase 4
> **Parent plan:** [`../01-plan.md` §7 Phase 2](../01-plan.md)  ·  **Index:** [`./README.md`](./README.md)
> **Target file(s) / code root:** `web/src/components/TrendExplorer.tsx`
> **Ground-truthed:** 2026-07-12

## Purpose

Phase 2 builds the **first demo insight**: an over-time view where a single company/metric renders as a multi-quarter line. The flagship is **NovaCloud ARR across 5 quarters (24.1 → 34.2M)** rendered as **one continuous series** even though the source PDFs renamed the label along the way (**2 distinct source labels in the live PDFs** — `"End-of-Period ARR"` and `"ARR (End of Period)"`; the spec originally said "3", corrected to the ground truth) — the backend already collapsed those renames to one `canonical_metric`, so the frontend just plots `period` vs `value`. A companion guard shows **"insufficient history"** for any company with fewer than 3 periods, so the cockpit never fabricates a trend. This is a parallel-track panel: it reads the loaded export (Phase 1) and adds no backend contract.

## §A Frozen cross-phase data contracts

*None declared here — consumes [`00-foundations.md` §A.4](./00-foundations.md) (`MetricsExport.metrics[]`: the `period`, `canonical_metric`, `value`, `company_name` fields).*

## § Phase 2 TODOs

> Format: **`action → file:line → acceptance`**. Work top-to-bottom; satisfy each group's **Acceptance** before moving on.
> Legend: `☐` to-do · `☑` implemented · `✅` acceptance verified.

### 2.1 Trend panel — multi-quarter series per company/metric

- `✅` **2.1a** `TrendExplorer` component → `web/src/components/TrendExplorer.tsx` (new). From the loaded `export.metrics` (**§A.4 `MetricRow`**), build a series per `(company_name, canonical_metric)`: points = `{ period, value }` sorted by `period`, filtering out rows where `value` is `null` (nullable per §A.4). Default view = **NovaCloud `arr_eop`**. *(Built: series logic in `web/src/lib/trend.ts` `buildSeries`; component is a thin SVG renderer with a company/metric selector defaulting to NovaCloud/`arr_eop`.)*
- `✅` **2.1b** Render NovaCloud ARR as **one 5-quarter line** (24.1 → 34.2M). The label renames (**2 distinct source labels live**, not 3) are already collapsed by the backend into a single `canonical_metric` — the frontend must **not** re-split by `raw_label` (that would break the single series). Use `display_value` for point labels. *(Built: `buildSeries` keys only on `(company_name, canonical_metric)`; sorts by the year-aware `parsePeriodKey` so the filename-ordered rows become true chronology; `display_value` bound verbatim.)*
- **Acceptance:** NovaCloud `arr_eop` renders as exactly **5 points on one series** (not 3 series, not a gap); the values match the live export (24.1/… /34.2M).

*Template to copy: none in-repo; a minimal SVG/canvas line or a tiny inline chart. Keep it dependency-light for the offline bundle (avoid heavy chart libs that bloat `web/dist`).*

### 2.2 Thin-history guard — "insufficient history", never fabricated

- `✅` **2.2a** For a `(company, metric)` with **fewer than 3 distinct `period` values**, render **"insufficient history"** instead of a line → `TrendExplorer.tsx`. Never interpolate, never draw a 1- or 2-point "trend." *(Built: `MIN_TREND_POINTS = 3` + `hasSufficientHistory`; the `==3` boundary is unit-locked so an off-by-one can't silently hide 3-quarter companies.)*
- **Acceptance:** a single-period company (5 of 10 companies today are single-period) shows the **"insufficient history"** guard, not a line (success criterion #6). Companies with ≥3 periods (NovaCloud, LendBridge, MediSight, PeopleFlow) render lines.

*Template to copy: reuse the series-builder from 2.1a; branch on `points.length < 3`.*

> ⚠️ **Hazard callouts:**
> - **Do NOT re-split by `raw_label`** — the backend already collapsed label drift into one `canonical_metric`; splitting by the source's raw terminology would shatter the flagship 5-quarter line into three stubs. (This is the *point* of the insight — show it as one line, then Phase 3/4 reveal the underlying label variety.)
> - **`period` and `value` are nullable** (§A.4) — filter nulls before plotting; a null `value` is not a zero.

## § Retrocompat notes

| Change | Class | Why safe |
| --- | --- | --- |
| New `TrendExplorer` component | ✅ SAFE | New file under `web/src/components/`; render-only; reads loaded export. |
| New `web/src/lib/trend.ts` pure logic | ✅ SAFE | New file under `web/src/lib/`; DOM-free, unit-tested; imports only `../types` (type-only) + `./grid` (no import cycle — grid/types do not import trend). |
| Append `<TrendExplorer export={data} />` + its import in `App.tsx` | ✅ SAFE | 2 additive lines **inside** the pre-existing `status === "loaded" && data` block, after `<RagGrid>`; no new fetch/route/`useEffect`/global state; Phase 1 states + tests observably unchanged. |
| No backend calls added | ✅ SAFE | Reuses Phase 1's loaded export state; no new route, no new contract; zero `.py` changed. |

**Net: zero breaking, zero migration.** Non-opted-in users observably unchanged — a frontend-only panel.

## § Definition of done

1. [x] All `2.M` task groups complete; every **Acceptance** met (verified live: NovaCloud = 5 chronological points one series; single- and 2-period companies show the guard, ≥3 render).
2. [x] **10** frontend tests (over the `~2` target — 5-point series, `==3` boundary, `<3` guard at 1 & 2 periods, null/unparseable/dedupe, raw-label collapse count, selector helpers); `make test` still **95** flask-absent / **103** flask-present; golden **15** byte-identical; **zero `.py` changed**.
3. [x] Every change classified in **§ Retrocompat notes**; nothing BREAKING.
4. [x] Series never re-split by `raw_label` (keyed only on `(company, canonical_metric)`, tested); nulls + null/unparseable periods filtered (tested).
5. [x] Symbol name matches the README naming registry verbatim (`TrendExplorer`); new `web/src/lib/trend.ts` added to the registry (audit C1).
6. [x] *(n/a — no §A here; consumes `00-foundations.md` §A.4.)*

---

## § Live findings

- **Ordering is the whole game.** Live NovaCloud `arr_eop` rows arrive in **filename-alphabetical** order (`Q1 2025, Q2 2024, Q2 2025, Q3 2024, Q4 2024`), NOT chronological. Reusing Phase 1's `parsePeriodKey` (`year*10+quarter`) sorts them to the true 24.1 → 26.8 → 29.1 → 31.6 → 34.2M line; a plain string sort would wrongly place `Q1 2025` first.
- **Label drift is 2, not 3.** The spec narrated "3 renames"; the live PDFs carry only **2** distinct `raw_label`s for NovaCloud ARR (`"End-of-Period ARR"` ×4 + `"ARR (End of Period)"` ×1). The UI computes the count from data (never hardcoded) so the screen shows "2"; spec text corrected. The load-bearing fact (collapse to one `canonical_metric`) holds.
- **History bands (live, all 10 companies):** **≥3 periods → render** — NovaCloud(5), LendBridge(5), MediSight(3), PeopleFlow(3); **<3 → "insufficient history"** — FleetLink(2) + ApexFreight / CarbonTrack / ClearPay / ConstructIQ / TalentVault(1). The **2-period FleetLink** is the guard's real boundary case (the spec only mentioned single-period companies).
- **No nulls in live data.** 0 null values / 0 null periods across 116 rows, so the null/unparseable-period filter is a no-op on the demo corpus — covered only by **synthetic** tests (added post-audit, MED-2).
- **`Portfolio_Snapshot_Q2_2025.pdf` yields 0 metric rows** (inert for trends); the 10 companies come purely from per-company PDFs.

## § Implementation notes

- **Architecture mirrors Phase 1:** pure logic in `web/src/lib/trend.ts` (unit-tested, DOM-free), thin renderer in `web/src/components/TrendExplorer.tsx`. Forced by the test harness — vitest runs in a **node** env (no jsdom) and the glob only matches `src/**/*.test.ts`, so a rendered `.test.tsx` is neither matched nor runnable.
- **Dependency-light chart:** hand-rolled inline SVG `<polyline>` + points + min/max reference lines; **no chart library** added. Bundle 205.9 kB / **65 kB gz** (~+4 kB vs Phase 1). Reuses `parsePeriodKey`, `CANONICAL_METRIC_ORDER`, `METRIC_LABELS` from `./grid` (registry single-source-of-truth).
- **Selector beyond the flagship default:** company + metric dropdowns default to NovaCloud/`arr_eop` so the analyst can explore live. The *effective* selection is derived each render (no `useEffect`) → survives an export reload without a stale choice; `metricsForCompany` only offers metrics the company actually reports (never an empty series).
- **`rawLabel` carried on `TrendPoint`** (post-audit LOW-2) so the "one line across N source labels" note is derived from the **plotted** set and can never disagree with the drawn line.
- **Same-period conflict** is deduped deterministically (first-after-sort wins) and left to Phase 3 reconciliation (documented in `trend.ts`) — accepted, not a v1 concern (the flagship NovaCloud series is conflict-free live).
- **Gate:** 21 frontend tests green (11 Phase 1 + 10 Phase 2); `tsc` + `vite build` green; backend **103**/**95**, golden **15** byte-identical; **zero `.py` changed**.

## § Unblocked phases

- **Phase 4 (provenance)** can now wire click-to-source into the trend points (soft feed, spec §4.1c): each SVG `<circle>` maps to a period's `MetricRow` — add an `onPointClick` prop to `TrendExplorer` **additively** when Phase 4 lands (do not change the Phase 2 acceptance).
- **Phase 3** stays independent (parallel-track) — nothing in Phase 2 blocks it; both bind the same shared `data` export via `export={data}`.
