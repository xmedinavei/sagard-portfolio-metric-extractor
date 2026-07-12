# Phase 3: Flagship #2 — refuse-to-compare + reconciliation + exceptions + breadth (Build Spec)

> **Date:** 2026-07-12
> **Status:** ✅ Built + Audited (2026-07-12) · all **4 panels** built (breadth kept) · **12 frontend tests** (comparison.ts logic) · backend **105**/**97**, golden **15** byte-identical · audit fixes + one **user-approved backend parser fix** in [`03-comparison-safety-fixes.md`](./03-comparison-safety-fixes.md)
> **Scope:** additive, gated, no migration; non-opted-in users observably unchanged. **Build deviation:** this phase also carries a user-approved backend correctness fix to `detect_metrics.py` (the offline parser read the wrong table column — see the fixes doc). The golden canary stays byte-identical.
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

- `✅` **3.1a** `RefusePanel` → `web/src/components/RefusePanel.tsx` (new). Surface every `MetricRow` where `comparison_status === REFUSED_STATUS` (`"refused"`) — these carry `metric_basis === INTEREST_MARGIN_BASIS` (`"interest_margin"`). Render them visibly flagged: **"refused — different basis (interest margin vs gross margin)."** Also surface the companion `IssueRow` where `code === BASIS_COLLISION_CODE` (`"basis_collision"`), using its `message`. *(Built: `refusedRows` + `basisCollisionIssues` in `comparison.ts`; the refusal reason is derived from the row's own `metric_basis` — data-driven, not hardcoded. **Build note:** the `basis_collision` issue's `company_name` is **null** live [company is only in `message`], so the panel takes the company from the refused **rows**, which carry it.)*
- **Acceptance:** ✅ all **5** LendBridge gross-margin rows show "refused — different basis"; exactly **1** `basis_collision` issue is surfaced; **no other** rows are refused (verified live: `comparable:111, refused:5`).

*Template to copy: none in-repo; a filtered list over `export.metrics` + `export.issues`.*

### 3.2 Reconciliation panel — cross-source discrepancy, own-report wins, dedupe the mirror

- `✅` **3.2a** `ReconciliationPanel` → `web/src/components/ReconciliationPanel.tsx` (new). Filter `export.issues` to `code === RECONCILE_CODE` (`"cross_source_discrepancy"`) for disagreements. Render each as a card using the **flat** issue fields: `company_name`, `canonical_metric`, `period`, `observed_value` (**retained company-report**), `expected_value` (**suppressed summary**), `delta` (`observed − expected`) — "company report **kept**." *(Built: `reconciliationSummary` in `comparison.ts`; H4 respected — binds `cross_source_discrepancy`, never the delta-less `cross_document_conflicting_candidates` marker.)*
- `✅` **3.2b** **Build deviation (see [`03-comparison-safety-fixes.md`](./03-comparison-safety-fixes.md) P1/D1).** The spec's magnitude-pair mirror dedupe was designed for the MediSight +5.5M / TalentVault −5.5M conflict — which **does not exist**. Live-verify found it was an artifact of a **backend parser bug** (the offline reader picked the prior-quarter column). After the **user-approved parser fix**, there are **0** disagreements and **22** confirmed agreements. Dedupe now uses the correct **natural key `(company, canonical_metric, period)`**; the panel is reframed as an honest cross-source **check** that also counts confirmed matches via `CROSS_SOURCE_MATCH_CODE` (`cross_document_duplicate`).
- **Acceptance:** ✅ (reframed) the panel shows an honest cross-source check — verified live **22 numbers cross-checked, 22 agree, 0 disagree** — and a conflict card (company report kept, summary set aside, signed delta, largest-`|delta|` first) would surface if any disagreement existed.

*Template to copy: none in-repo. Note the semantics are locked in `publish.py:188-217` — `observed_value`=retained, `expected_value`=suppressed, `delta=round(observed−expected,6)`.*

### 3.3 Exceptions / early-warning — sector-aware missing metrics

- `✅` **3.3a** `ExceptionsPanel` → `web/src/components/ExceptionsPanel.tsx` (new). Filter `export.issues` to `code === MISSING_METRIC_CODE` (`"missing_metric"`); each carries `company_name`, `canonical_metric`, `period`. Group by company. These are **already sector-aware** (the backend only flags a metric missing if it applies to that company's sector), so the frontend renders faithfully — it must **not** re-derive "missing". *(Built: `missingMetricsByCompany` in `comparison.ts`; the issues fire per document/period, so it dedupes to distinct `(company, metric)` — live **30 raw → 18 distinct** — and attaches sector.)*
- **Acceptance:** ✅ LendBridge (credit) has **zero** `missing_metric` issues live, so it never appears and can never show a SaaS metric like `arr_eop` as "missing" (success #5 — zero false "missing"); metrics ever flagged are only sector-appropriate core metrics (`cash_balance`, `headcount`, `monthly_burn`, `revenue_qtr`). *(Spec said "34 issues"; live is 30 raw / 18 distinct.)*

*Template to copy: none in-repo; a grouped list over the filtered issues.*

### 3.4 Breadth panel — label-drift showcase *(⚠️ FIRST-TO-CUT de-scope candidate)*

- `✅` **3.4a** `BreadthPanel` → `web/src/components/BreadthPanel.tsx` (new). Reframed per DEC-D as a **label-drift / raw-terminology showcase**: shows how many **distinct `raw_label` values** collapse to each `canonical_metric`, plus the 2 optional canonical metrics present (`net_revenue_retention_pct`, `logo_churn_pct`). On-thesis (reuses `raw_label`) and honest — **no invented "other/unrecognized" bucket**. *(Built: `breadthByMetric` in `comparison.ts`; counts are data-driven, never hardcoded; blank labels skipped.)*
- `✅` **3.4b** **De-scope switch — NOT taken.** Xavier chose "build all 4 panels" (AskUserQuestion), so `BreadthPanel` is built and wired into `App`. (Had it been cut, `3.1`/`3.2`/`3.3` would have stayed intact with no dead import.)
- **Acceptance:** ✅ the panel shows source-terminology breadth honestly — verified live **29 distinct raw labels** across the canonical metrics (spec said ~30) + both optional metrics present (NRR 11 rows, logo churn 10), no fake raw-tail.

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
| New `web/src/lib/comparison.ts` pure logic | ✅ SAFE | New file under `web/src/lib/`; DOM-free, unit-tested; imports only `../types` + `./grid` (no cycle). 5 registry consts defined fresh (additive) — `grid.ts`'s private `missing_metric` literal is left untouched. |
| Append 4 imports + 4 `<Panel export={data} />` to `App.tsx` | ✅ SAFE | 8 additive lines **inside** the pre-existing `status === "loaded" && data` block, after the Phase 1/2 panels; idle/loading/error + Phase 1/2 states observably unchanged. |
| **Backend parser fix — `detect_metrics.py` whitespace column picker** | ⚠️ **CONDITIONAL** | **Build deviation (user-approved).** Corrects a real bug (the offline layout reader took the last/prior-quarter column). Confined to the whitespace branch; the markdown branch (hence the **golden canary**) is byte-identical. Not gated by `recall_mode` (a correctness fix). Safe because no consumer depended on the buggy prior-quarter value, and the frozen golden output is unchanged. See [`03-comparison-safety-fixes.md`](./03-comparison-safety-fixes.md) P1. |
| +2 locking tests in `tests/test_detect_metrics.py` | ✅ SAFE | Additive tests only; suite count 95→97 flask-absent / 103→105 flask-present. No existing test changed. |
| Breadth panel omitted under de-scope | — | **Not taken** — all 4 panels built (Xavier chose "build all 4"). |

**Net: no ❌ BREAKING.** The frontend is net-new + additive. The one ⚠️ CONDITIONAL is the user-approved backend correctness fix, whose blast radius (26 live rows corrected across 4 companies) was empirically mapped and whose retrocompat contract — the byte-identical golden export + the 15-test golden guard + `import portfolio_metrics` loading no flask — is preserved.

## § Definition of done

1. [x] All 4 `3.M` task groups complete (breadth kept); every **Acceptance** met live.
2. [x] **12** frontend tests (comparison.ts logic — refused set, basis_collision filter, H4 bind-not-marker, natural-key dedupe, all-clear, LendBridge-absent, breadth distinct labels, + defensive null branches); total frontend **33** (11 P1 + 10 P2 + 12 P3). `make test` = **97** flask-absent / **105** flask-present (was 95/103; **+2** parser-fix locking tests only); golden **15** byte-identical.
3. [x] Every change classified in **§ Retrocompat notes** — including the user-approved backend parser fix (⚠️ CONDITIONAL); nothing BREAKING.
4. [x] Reconciliation bound to `cross_source_discrepancy` (not the marker — H4); no RESERVED field bound (H5); dedupe on the natural key `(company, metric, period)` (the spec's magnitude-pair mirror was fiction — see fixes doc D1).
5. [x] Symbol names match the README naming registry verbatim (`RefusePanel`, `ReconciliationPanel`, `ExceptionsPanel`, `BreadthPanel`, `REFUSED_STATUS`, `INTEREST_MARGIN_BASIS`, `RECONCILE_CODE`, `BASIS_COLLISION_CODE`, `MISSING_METRIC_CODE`); new `comparison.ts` + additive `CROSS_SOURCE_MATCH_CODE` added to the registry.
6. [x] *(n/a — no §A here; consumes `00-foundations.md` §A.4.)*

---

## § Live findings

- **The spec's reconciliation flagship was fiction — caused by a real parser bug.** A Step-2 live-verify found **no** MediSight `cross_source_discrepancy`; the "22.4M" belongs to TalentVault, MediSight's 27.9M is an exact `cross_document_duplicate`, and "+5.5M" subtracted two different companies. Root cause: the offline `LocalPdfParser` (whitespace layout) read `columns[-1]` = the **prior-quarter** column for the two-column reports of **CarbonTrack / TalentVault / ClearPay / ConstructIQ**, producing **11 false conflicts** + **15 silently-wrong numbers**. Fixed (user-approved) — see [`03-comparison-safety-fixes.md`](./03-comparison-safety-fixes.md) P1.
- **Post-fix live export (enhanced, the app path):** `cross_source_discrepancy` **0** (was 11), `cross_document_duplicate` **22** (was 11), `metric_count` **116** (unchanged). CarbonTrack ARR Q2 now `$16.9M` (was `$15.2M`).
- **Refuse (3.1):** exactly **5** LendBridge `gross_margin_pct` refused (all `interest_margin`); exactly **1** `basis_collision`, whose `company_name` is **null** (company only in `message`).
- **Exceptions (3.3):** **30 raw** `missing_metric` → **18 distinct** `(company, metric)`; **LendBridge has zero** (never asked for SaaS metrics); flagged metrics are only `cash_balance / headcount / monthly_burn / revenue_qtr`.
- **Breadth (3.4):** **29** distinct `raw_label`s (spec ~30); both optional metrics present (NRR 11, logo churn 10).
- **9-code open set:** 8 of 9 codes appear live (`parse_failure` never fires — all 24 PDFs parse cleanly). Panels filter to their specific codes and ignore the rest.

## § Implementation notes

- **Architecture mirrors Phase 1/2:** all fragile logic in `web/src/lib/comparison.ts` (DOM-free, unit-tested in the node-env vitest harness); the 4 panels are thin renderers (typecheck + build coverage). The 5 registry consts are defined **fresh** here (additive-safe) so `App.tsx` is the only shared frontend edit.
- **Reconciliation reframed** to an honest cross-source **check** (binds `cross_source_discrepancy` for disagreements + `cross_document_duplicate` for agreements; the latter is an additive const `CROSS_SOURCE_MATCH_CODE`, registered post-hoc). Shows "N verified, X agree, Y disagree" — all-clear when Y = 0, conflict card (largest-`|delta|` first) if any exists.
- **Backend parser fix** (`detect_metrics.py`, 3 edits, whitespace branch only) reuses the markdown path's `_select_table_value_column`. Golden byte-identical (markdown never hits the changed branch). Latent stale-`whitespace_context` hazard **accepted + documented** (zero corpus impact; a reset would be ambiguous vs an "N/A" data row).
- **Gate:** frontend **33** vitest + `tsc`+`vite` green (213.8 kB / 66.9 kB gz, ~+8 kB, no chart lib); backend **105**/**97**, golden **15** byte-identical, ruff clean.

## § Unblocked phases

- **Phase 4 (provenance)** can wire click-to-source into these panels' rows additively (each refused row / reconciliation card / exception maps to a `MetricRow`/`IssueRow` with `source_file` + `raw_label` + `source_snippet`). Do not change the Phase 3 acceptances.
- **Demo narrative unlocked:** flagship #2 = refuse-to-compare (5 LendBridge rows) **+** the cross-source check that *caught a real parser bug on day one* — a strong FDE "instrument → detect → root-cause" story.
