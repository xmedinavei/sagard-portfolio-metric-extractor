# Phase 3: Flagship #2 — refuse-to-compare + reconciliation + exceptions + breadth (Build Spec)

> **Date:** 2026-07-12
> **Status:** Not started · target `~4` frontend tests (3 if breadth is cut) *(flip to In progress / Built / Audited)*
> **Scope:** additive, gated, no migration; non-opted-in users observably unchanged (frontend-only, reads loaded export).
> **Depends-on:** Phase 0 (foundations gate), Phase 1 (loaded export state)  ·  **Blocks:** none
> **Feeds:** refused/flagged rows that Phase 4 makes click-to-source (soft feed)  ·  **Parallelizable-with:** Phase 2, Phase 4
> **Parent plan:** [`../01-plan.md` §7 Phase 3](../01-plan.md)  ·  **Index:** [`./README.md`](./README.md)
> **Target file(s) / code root:** `web/src/components/RefusePanel.tsx`, `ReconciliationPanel.tsx`, `ExceptionsPanel.tsx`, `BreadthPanel.tsx`
> **Ground-truthed:** 2026-07-12

## Purpose

Phase 3 builds the **second demo insight** — the "trust the numbers" cluster that shows the cockpit is honest about what it *cannot* safely do. Four panels, all reading the loaded export: **(1) refuse-to-compare** (the credit lender's gross margin is flagged "refused — different basis," not silently ranked next to SaaS margins); **(2) reconciliation** (a company-report number that disagrees with the portfolio-summary number is surfaced with the delta, company-report winning); **(3) exceptions / early-warning** (genuinely missing metrics, but sector-aware so a lender is never falsely flagged for SaaS metrics); **(4) breadth** (a label-drift showcase — the source's own varied terminology collapsed to canonical IDs). Panel 4 is the **first-to-cut de-scope candidate**: if the phase runs long, omit `3.4` without touching `3.1`–`3.3`.

## Reorganization vs. the parent plan

- **Breadth (`3.4`) is explicitly de-scopable.** Per the plan's DEC-D (Xavier, 2026-07-12), `BreadthPanel` is built as a label-drift showcase but is the **first-to-cut** item: dropping it must **not** touch `3.1`/`3.2`/`3.3`. Build order within this phase therefore does `3.4` **last**.

## §A Frozen cross-phase data contracts

*None declared here — consumes [`00-foundations.md` §A.4](./00-foundations.md). Critical bindings: `MetricRow.comparison_status`/`metric_basis`/`raw_label`; `IssueRow.code` (the 9-value open set) + the reconciliation sub-fields `expected_value`/`observed_value`/`delta`/`period`/`company_name`/`canonical_metric`.*

## § Phase 3 TODOs

> Format: **`action → file:line → acceptance`**. Work top-to-bottom; satisfy each group's **Acceptance** before moving on.
> Legend: `☐` to-do · `☑` implemented · `✅` acceptance verified.

### 3.1 Refuse-to-compare panel

- `☐` **3.1a** `RefusePanel` → `web/src/components/RefusePanel.tsx` (new). Surface every `MetricRow` where `comparison_status === REFUSED_STATUS` (`"refused"`) — these carry `metric_basis === INTEREST_MARGIN_BASIS` (`"interest_margin"`). Render them visibly flagged: **"refused — different basis (interest margin vs gross margin)."** Also surface the companion `IssueRow` where `code === BASIS_COLLISION_CODE` (`"basis_collision"`), using its `message`.
- **Acceptance:** all **5** LendBridge gross-margin rows show "refused — different basis"; exactly **1** `basis_collision` issue is surfaced; **no other** rows are refused (the refused set is exactly those 5 — plan §3.3).

*Template to copy: none in-repo; a filtered list over `export.metrics` + `export.issues`.*

### 3.2 Reconciliation panel — cross-source discrepancy, own-report wins, dedupe the mirror

- `☐` **3.2a** `ReconciliationPanel` → `web/src/components/ReconciliationPanel.tsx` (new). Filter `export.issues` to `code === RECONCILE_CODE` (`"cross_source_discrepancy"`). For each, render a card using the **flat** issue fields (NOT a nested object): `company_name`, `canonical_metric`, `period`, `observed_value` (the **retained company-report** number), `expected_value` (the **suppressed summary** number), `delta` (`observed − expected`). Show it as "company report **won**" with the delta.
- `☐` **3.2b** **Dedupe the mirror-pair** (DEC-E): MediSight (+5.5M) and TalentVault (−5.5M) are the **same** conflict mirrored across two documents — and they are **different companies**, so a `(company, period, canonical_metric)` join will **not** catch it. Key the dedupe on the **unordered value-magnitude pair `{|observed_value|, |expected_value|}` within the same `period`** and collapse to **one card per conflict**. ⚠️ **Build-time live-verify:** the exact fields on the TalentVault mirror row were not confirmed against the live export in planning — before finalizing the key, print the two `cross_source_discrepancy` rows from a live run and confirm they share the magnitude pair (adjust the key if the data shows otherwise; record it in §Live findings).
- **Acceptance:** exactly **one** MediSight reconciliation card, showing observed 27.9M vs expected 22.4M (**delta +5.5M**), company-report winning; the TalentVault −5.5M mirror is **not** shown as a second card.

*Template to copy: none in-repo. Note the semantics are locked in `publish.py:188-217` — `observed_value`=retained, `expected_value`=suppressed, `delta=round(observed−expected,6)`.*

### 3.3 Exceptions / early-warning — sector-aware missing metrics

- `☐` **3.3a** `ExceptionsPanel` → `web/src/components/ExceptionsPanel.tsx` (new). Filter `export.issues` to `code === MISSING_METRIC_CODE` (`"missing_metric"`); each carries `company_name`, `canonical_metric`, `period`. Group by company. These are **already sector-aware** (the backend only flags a metric as missing if it applies to that company's sector), so the frontend just renders them faithfully — it must **not** re-derive "missing" itself.
- **Acceptance:** LendBridge (credit) shows only genuine gaps (e.g. one `headcount`), and **never** a SaaS metric like `arr_eop` as "missing" (success criterion #5 — zero false "missing"); the total missing set matches the export (34 issues today, sector-aware).

*Template to copy: none in-repo; a grouped list over the filtered issues.*

### 3.4 Breadth panel — label-drift showcase *(⚠️ FIRST-TO-CUT de-scope candidate)*

- `☐` **3.4a** `BreadthPanel` → `web/src/components/BreadthPanel.tsx` (new). Reframed per DEC-D as a **label-drift / raw-terminology showcase**: show how many **distinct `raw_label` values** (the source's own wording) collapse to each `canonical_metric`, plus the 2 optional canonical metrics present (`net_revenue_retention_pct`, `logo_churn_pct`). This is **on-thesis** (it reuses `raw_label`, already bound in provenance) and honest — there is **no open raw-tail**, so do **not** invent a "other/unrecognized" bucket.
- `☐` **3.4b** **De-scope switch:** if Phase 3 is running long, **omit this entire group** — do not wire `BreadthPanel` into `App`. Dropping `3.4` must leave `3.1`/`3.2`/`3.3` fully intact.
- **Acceptance:** EITHER the panel shows source-terminology breadth honestly (30 distinct raw labels across the canonical IDs + the 2 optional metrics, no fake raw-tail), OR it is cleanly omitted with the other three panels working and no dead import/route left behind.

*Template to copy: reuse the `raw_label` access from provenance (Phase 4) — group `export.metrics` by `canonical_metric`, count `distinct(raw_label)`.*

> ⚠️ **Hazard callouts (load-bearing for this phase):**
> - **H4 — reconciliation source:** bind reconciliation to `code === "cross_source_discrepancy"` (has `expected_value`/`observed_value`/`delta`), **NOT** to `code === "cross_document_conflicting_candidates"` (a different marker code with no delta fields). Both exist in the 9-value set.
> - **H5 — reserved bindings:** never bind `code === "unrecognized_label"` (never emitted), `currency` (always null), or `comparison_status === "unchecked"` (never assigned). See §A.4.
> - **H7 — mirror dedupe:** the reconciliation mirror-pair (MediSight +5.5M / TalentVault −5.5M) is one conflict; show it once (3.2b).
> - **Open `code` set:** there are **9** emitted `code` values (§A.4), not 4 — filter to the specific codes you render (`basis_collision`, `cross_source_discrepancy`, `missing_metric`) and **ignore the rest gracefully**; never assume the set is closed or switch-exhaustive.

## § Retrocompat notes

| Change | Class | Why safe |
| --- | --- | --- |
| New `RefusePanel`, `ReconciliationPanel`, `ExceptionsPanel`, `BreadthPanel` | ✅ SAFE | New files under `web/src/components/`; render-only; read the loaded export. |
| No backend calls added | ✅ SAFE | Reuses Phase 1's loaded export; no new route or contract. |
| Breadth panel omitted under de-scope | ✅ SAFE | Cutting `3.4` removes a leaf component; `3.1`–`3.3` untouched; no shared code affected. |

**Net: zero breaking, zero migration.** Non-opted-in users observably unchanged — frontend-only panels reading the frozen export.

## § Definition of done

1. [ ] All `3.M` task groups complete (or `3.4` cleanly omitted); every **Acceptance** met.
2. [ ] ~4 frontend tests (5 refused rows + 1 basis_collision; one deduped MediSight card; LendBridge no false SaaS "missing"; breadth honest OR absent); `make test` still **95**.
3. [ ] Every change classified in **§ Retrocompat notes**; nothing BREAKING.
4. [ ] Reconciliation bound to `cross_source_discrepancy` (not the marker); no RESERVED field bound; the mirror is deduped.
5. [ ] Symbol names match the README naming registry verbatim (`RefusePanel`, `ReconciliationPanel`, `ExceptionsPanel`, `BreadthPanel`, `REFUSED_STATUS`, `INTEREST_MARGIN_BASIS`, `RECONCILE_CODE`, `BASIS_COLLISION_CODE`, `MISSING_METRIC_CODE`).
6. [ ] *(n/a — no §A here.)*

---

## § Live findings *(build agent fills during `/spec-flow:4-build-phase`)*

## § Implementation notes *(build agent fills)*

## § Unblocked phases *(build agent fills)*
