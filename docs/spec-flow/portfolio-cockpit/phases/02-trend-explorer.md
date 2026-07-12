# Phase 2: Flagship #1 — over-time trend explorer (Build Spec)

> **Date:** 2026-07-12
> **Status:** Not started · target `~2` frontend tests *(flip to In progress / Built / Audited)*
> **Scope:** additive, gated, no migration; non-opted-in users observably unchanged (frontend-only, reads loaded export).
> **Depends-on:** Phase 0 (foundations gate), Phase 1 (loaded export state)  ·  **Blocks:** none
> **Feeds:** the trend points that Phase 4 makes click-to-source (soft feed)  ·  **Parallelizable-with:** Phase 3, Phase 4
> **Parent plan:** [`../01-plan.md` §7 Phase 2](../01-plan.md)  ·  **Index:** [`./README.md`](./README.md)
> **Target file(s) / code root:** `web/src/components/TrendExplorer.tsx`
> **Ground-truthed:** 2026-07-12

## Purpose

Phase 2 builds the **first demo insight**: an over-time view where a single company/metric renders as a multi-quarter line. The flagship is **NovaCloud ARR across 5 quarters (24.1 → 34.2M)** rendered as **one continuous series** even though the source PDFs renamed the label three times — the backend already collapsed those renames to one `canonical_metric`, so the frontend just plots `period` vs `value`. A companion guard shows **"insufficient history"** for any company with fewer than 3 periods, so the cockpit never fabricates a trend. This is a parallel-track panel: it reads the loaded export (Phase 1) and adds no backend contract.

## §A Frozen cross-phase data contracts

*None declared here — consumes [`00-foundations.md` §A.4](./00-foundations.md) (`MetricsExport.metrics[]`: the `period`, `canonical_metric`, `value`, `company_name` fields).*

## § Phase 2 TODOs

> Format: **`action → file:line → acceptance`**. Work top-to-bottom; satisfy each group's **Acceptance** before moving on.
> Legend: `☐` to-do · `☑` implemented · `✅` acceptance verified.

### 2.1 Trend panel — multi-quarter series per company/metric

- `☐` **2.1a** `TrendExplorer` component → `web/src/components/TrendExplorer.tsx` (new). From the loaded `export.metrics` (**§A.4 `MetricRow`**), build a series per `(company_name, canonical_metric)`: points = `{ period, value }` sorted by `period`, filtering out rows where `value` is `null` (nullable per §A.4). Default view = **NovaCloud `arr_eop`**.
- `☐` **2.1b** Render NovaCloud ARR as **one 5-quarter line** (24.1 → 34.2M). The 3 label renames are already collapsed by the backend into a single `canonical_metric` — the frontend must **not** re-split by `raw_label` (that would break the single series). Use `display_value` for point labels.
- **Acceptance:** NovaCloud `arr_eop` renders as exactly **5 points on one series** (not 3 series, not a gap); the values match the live export (24.1/… /34.2M).

*Template to copy: none in-repo; a minimal SVG/canvas line or a tiny inline chart. Keep it dependency-light for the offline bundle (avoid heavy chart libs that bloat `web/dist`).*

### 2.2 Thin-history guard — "insufficient history", never fabricated

- `☐` **2.2a** For a `(company, metric)` with **fewer than 3 distinct `period` values**, render **"insufficient history"** instead of a line → `TrendExplorer.tsx`. Never interpolate, never draw a 1- or 2-point "trend."
- **Acceptance:** a single-period company (5 of 10 companies today are single-period) shows the **"insufficient history"** guard, not a line (success criterion #6). Companies with ≥3 periods (NovaCloud, LendBridge, MediSight, PeopleFlow) render lines.

*Template to copy: reuse the series-builder from 2.1a; branch on `points.length < 3`.*

> ⚠️ **Hazard callouts:**
> - **Do NOT re-split by `raw_label`** — the backend already collapsed label drift into one `canonical_metric`; splitting by the source's raw terminology would shatter the flagship 5-quarter line into three stubs. (This is the *point* of the insight — show it as one line, then Phase 3/4 reveal the underlying label variety.)
> - **`period` and `value` are nullable** (§A.4) — filter nulls before plotting; a null `value` is not a zero.

## § Retrocompat notes

| Change | Class | Why safe |
| --- | --- | --- |
| New `TrendExplorer` component | ✅ SAFE | New file under `web/src/components/`; render-only; reads loaded export. |
| No backend calls added | ✅ SAFE | Reuses Phase 1's loaded export state; no new route, no new contract. |

**Net: zero breaking, zero migration.** Non-opted-in users observably unchanged — a frontend-only panel.

## § Definition of done

1. [ ] All `2.M` task groups complete; every **Acceptance** met.
2. [ ] ~2 frontend tests (NovaCloud ARR = 5 points one series; single-period company shows the guard); `make test` still **95**.
3. [ ] Every change classified in **§ Retrocompat notes**; nothing BREAKING.
4. [ ] Series never re-split by `raw_label`; nulls filtered.
5. [ ] Symbol name matches the README naming registry verbatim (`TrendExplorer`).
6. [ ] *(n/a — no §A here.)*

---

## § Live findings *(build agent fills during `/spec-flow:4-build-phase`)*

## § Implementation notes *(build agent fills)*

## § Unblocked phases *(build agent fills)*
