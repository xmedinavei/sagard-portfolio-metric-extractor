# Master Plan — Backend Recall & Comparability Fix (pre-requisite to Document ii)

> **What this file is:** the spec-flow **Stage 3 master plan** for fixing the prototype's backend *before*
> we write Document ii. It turns the verified defect audit (`ii-prototype-findings.md`) into a phased,
> retrocompat-audited build plan. **This is a planning document — no code is written or changed until you
> approve the phasing at the gate (§9).**
>
> **Why it exists (decision recorded 2026-07-10):** Xavier chose *"fix the backend first, then start Doc
> ii."* Rationale: Doc ii's two flagship demo moments — NovaCloud's ARR trend snapping back to 5 quarters,
> and the `gross_margin_pct` column *visibly refusing* the lender-vs-SaaS collision — are today only
> **promises**. Fixing the backend first makes them **live, reproducible demos**, which is far stronger in
> an FDE ("trust the numbers") interview.
>
> **Scope source:** we treat `ii-prototype-findings.md` (the verified 5-class defect audit) + Doc 0 §4.2.1
> (trap solutions) + §4.5 (PE/credit classifier) + §6A (metric tiers) as the **de-facto approved
> spec+scope** — the decisions are already locked there — rather than forcing a redundant Stage-1 pass.
> *(Confirm this at §9.)*
>
> **The one non-negotiable:** every change is **additive and gated**. Default behavior stays
> byte-identical to the validated run (24 docs / 99 valid / 0 invalid) and the 46 green tests, until a
> single deliberate cutover phase flips the default.

---

## 1. Why this exists (the problem, in one paragraph)

The export is clean at the headline (24 docs / 99 valid / 0 invalid / 0 duplicate groups) but reproduces
only **76% of the metric values physically printed in the source PDFs (97 of 128)**. It **silently drops
30** printed numbers, **exports 1 wrong value** (MediSight ARR), raises **15 sector-blind false "missing
metric" alarms**, and places **4 non-comparable numbers in shared columns** with no warning. Each gap is a
live instance of the governing thesis — *"same label doesn't mean the same metric; comparability is the
product."* This plan fixes them so Doc ii can demo the fix, not describe it.

**Non-negotiable retrocompat line:** the JSON/CSV export contract, the `EXPORT_SCHEMA_VERSION`, and the 46
passing tests are the baseline. All new behavior lands behind a `recall-mode` flag defaulting to **legacy**
(= today's exact output). Only Phase 5 flips the default, and it re-baselines the golden export + tests in
the same change.

---

## 2. Locked decisions this plan operationalizes

| # | Decision (owner: Xavier, 2026-07-09) | How this plan uses it |
|---|---|---|
| D1 | Quarterly monitoring, Portfolio-Ops anchor | The recall + false-alarm fixes are what make the monitoring grid trustworthy. |
| D2 | Tiered metric model (universal + sector packs) | Phase 2 (sector-aware expected-metric tiers) is D2 in code. |
| D3 | Automate deterministic/traceable; humans on judgment | All fixes are deterministic; D5 keeps a human on cross-source conflicts. |
| D4 | Cockpit front-end (deferred to Doc ii) | The `recall-mode` flag *is* the demo mechanism: same corpus, before/after. |
| **D5** | **Reconciliation policy — OPEN** | **Isolated in Phase 4, decision-gated. Not needed for the core fix** (see §3 finding). |

---

## 3. Current-state inventory (ground-truthed 2026-07-10, file:line-anchored)

Verified by a 5-agent read-only investigation + direct re-checks against the live code and the export.

### 3.1 Pipeline sketch
```
parsed .md  →  detect_metrics (label→alias, table + narrative)  →  normalize (basis, within-doc dedupe)
            →  pipeline (missing-metric check)  →  publish (cross-document dedupe, export, summary)
```

### 3.2 Reusable seams (where fixes attach)

| Seam | Anchor | Mechanism today | Additive? |
|---|---|---|---|
| **Alias registry** | `metric_aliases.py:43` (`ALIASES` tuple) | Flat, global tuple of `MetricAlias(canonical, label, unit, confidence, basis, narrative_safe)`. Frozen into a dict at import (`:127`). | ✅ append rows, zero call-site edits |
| **Match decision** | `metric_aliases.py:135` (`find_alias_for_label`) | **Exact** dict lookup on a normalized key — not fuzzy, not substring. `normalize_label_text` (`:36`) collapses case/punctuation but **preserves token order**. | ⚠️ shared fn body |
| **Silent-drop point** | `detect_metrics.py:152` (`continue`) | Unrecognized label → dropped with **no issue emitted**. This scope *has* the page context (`raw_lines`, `:89`) needed for footnote stitching. | ⚠️ shared path |
| **Missing-metric check** | `pipeline.py:52-80`, loop at `:67` | Iterates flat `CORE_METRICS` (6) for **every** company — the sector-blind choke point. Emits `code="missing_metric"` (`:73`). | ✅ swap the iterable |
| **Sector signal** | — | **Does not exist.** `classify_document` (`detect_metrics.py:211`) classifies doc *kind*, not business sector. No `sector`/`lender`/`credit` field anywhere. | ➕ new module needed |
| **Cross-doc dedupe (D5 home)** | `publish.py:100` + rank `publish.py:244` | **"Company-report-wins" is already implemented** — `company_report` always outranks `portfolio_summary`. Emits `cross_document_conflicting_candidates`. | ✅ enrich in collision branch |
| **Basis tag** | `schema.py:156` (`metric_basis`) + `metric_aliases.py:149` (`infer_metric_basis`) | Field **exists and is populated** ({quarterly, period_end, monthly, ltm, None}) but is an **uncontrolled string with no consumer** — nothing acts on it. | ✅ harden + add fields |
| **Value normalization** | — | **Does not exist.** No quarterly→monthly, no restricted-cash exclusion, no FX. `parse_values.py` only scales magnitude (k/m/b). | ➕ new pass |
| **Export contract** | `publish.py:21-42` (`EXPORT_SCHEMA_VERSION`, `CSV_FIELDNAMES`) | `metric_basis` already a CSV column (`:38`). New columns need header+row in lockstep. | ⚠️ lockstep |

### 3.3 The strategy-changing finding (verified against live code + export)

**Class B "wrong value" is a Class A drop in disguise.** MediSight's Q2'25 own report says
`Contracted ARR (end of period) 27.9M`, but that label normalizes to `contracted arr end of period`, which
is **not** an alias key → `find_alias_for_label(...)` returns **MISS** → the value was never captured.
Confirmed: **0 rows** anywhere in the export contain 27.9M; MediSight's Q2'25 ARR is the summary's
`$22.4M` as the *sole* survivor (no conflict issue was ever raised).

**Consequence:** adding the missing alias fixes Class A **and** Class B **and** surfaces the Class E
conflict — because the already-implemented "company-wins" rank (`publish.py:244`) will auto-select the
own-report 27.9M over the summary 22.4M and emit `cross_document_conflicting_candidates`. **D5 is not the
fix for MediSight** (D5 only triggers when ≥2 candidates already exist).

**Hidden test gap:** `test_pipeline.py:69` asserts MediSight ARR == 27.9M **and passes today** — because
the 3-doc *fixture* uses a recognized label while the real 24-doc *corpus* uses the drifted one. The bug
lives in the corpus, not the test. **Phase 1 must add a regression fixture carrying the real drifted
label**, or the green suite keeps hiding the defect.

---

## 4. Scope

**In scope (this plan):**
- Class A — label-drift silent drops (30) via additive aliases + footnote-equivalence stitching.
- Class B — the 1 wrong value (MediSight), fixed by the same alias work + existing company-wins rank.
- Class C — 15 sector-blind false alarms via a sector classifier + per-sector expected-metric tiers.
- Class D — 4 basis collisions via basis-tag hardening + `value_normalized` + a visible "refused
  comparison" flag.
- Class E / D5 — cross-validation enrichment, **decision-gated** (Phase 4).

**Out of scope (documented next-PR roadmap — Doc 0 §7):**
- Class F — prior-period comparison columns + narrative/footnote *number* extraction (parser fidelity).
- Page-level provenance (today is file-level by design).
- The private-credit metric pack as a first-class path (v1 routes the lender *out*, per §4.5).

**Non-goals:** no new canonical metric added to the 8; no change to the PE-scoped framing; no fuzzy
matching (see rejected option §6).

**Success = ** enhanced-mode recall materially above 76% on the 24-doc corpus, the MediSight value correct,
zero sector-blind false alarms for the lender/marketplace/payments companies, the collision visibly
flagged — **with the legacy default byte-identical and all tests green.**

---

## 5. Options considered (per decision, with the rejected paths)

**Class A — how to catch word-order / synonym drift:**
- **(chosen) Additive explicit alias rows + footnote stitching.** Append drifted labels to a gate-scoped
  `EXTENDED_ALIASES`; add a pre-pass that reads the packs' own "*X is equivalent to Y*" footnotes.
  *Pro:* precise, auditable, additive. *Con:* enumerated, not automatic.
- **(rejected — BREAKING) Token-sort `normalize_label_text`.** Would auto-catch word-order drift, but the
  normalizer is **shared** by company-name canonicalization (`detect_metrics.py:245`) and basis inference
  (`metric_aliases.py:152`); sorting tokens could collapse distinct company/label keys. Rejected.
- **(rejected — BREAKING) Fuzzy / substring matching in `find_alias_for_label`.** Risks **over-capture**:
  sibling labels like MediSight's `ARR Growth (YoY)` or `Expansion ARR as % of Total ARR` would wrongly map
  to `arr_eop`, injecting a *wrong* number — worse than a silent blank. Rejected in favor of exact rows.

**Class C — where the sector signal comes from:**
- **(chosen) New `classify_sector` helper** (mirroring `classify_document`) + a `sector_profiles` module of
  expected-metric sets. Additive; feeds the missing-check gate. *Con:* a genuinely new input to build.
- **(rejected) Reuse `classify_document`.** It only knows doc *kind*, not sector — insufficient.

**Class D — how to refuse unsafe comparisons:**
- **(chosen) Non-destructive guard** that emits a `basis_collision` issue + a `value_normalized` column,
  leaving the dedupe key untouched.
- **(rejected — BREAKING) Widen the dedupe key to include basis.** Two rows with the same
  `canonical_metric` but different basis would stop collapsing, changing dedupe outcomes and breaking
  `test_normalization.py` / `test_publish.py`. Rejected.

**D5 — reconciliation policy: still OPEN (Xavier).** Company-wins is already the behavior; the choice is
only whether Phase 4 adds a louder cross-validation flag (recommended: yes, additive). See §9.

---

## 6. Retrocompatibility audit

Default posture: **additive + gated**. `✅ SAFE` / `⚠️ CONDITIONAL` / `❌ BREAKING (rejected/redesigned)`.

| # | Change | Class | Affected shared code | Mitigation |
|---|--------|-------|----------------------|------------|
| 1 | `recall-mode` flag + optional `config` param on 3 seams | ⚠️ | `find_alias_for_label`, `pipeline.py:67`, basis pass callers | Default arg = legacy → existing callers unchanged; add both-mode tests |
| 2 | Gate-scoped `EXTENDED_ALIASES`, merged only when enhanced | ✅ | `metric_aliases.py:127` lookup | Legacy dict untouched; enhanced merge is a separate map |
| 3 | Append alias rows | ⚠️ | `_ALIAS_BY_LABEL` (last-wins) | Assert new normalized key not already present (unit test) |
| 4 | Emit `unrecognized_label` issue on silent drops | ⚠️ | `detect_metrics.py:152`, issue counts | Severity=info, additive to issues list; update count-asserting tests |
| 5 | New optional schema fields (`value_normalized`, `currency`, `comparison_status`) | ✅ | `schema.py:156+` | All default `None`; pydantic auto-serializes |
| 6 | New CSV columns for the above | ⚠️ | `CSV_FIELDNAMES` + `_metric_to_csv_row` | Add header **and** row key in lockstep; append at end |
| 7 | New issue codes (`basis_collision`) | ✅ | `code: str` unconstrained | Issues never filter metrics; recount is automatic |
| 8 | Harden `metric_basis` → controlled `Literal` | ⚠️ | `schema.py:156` | Literal **must** include {quarterly, period_end, monthly, ltm} + `None`, else legacy JSON rejects on load |
| 9 | Sector signal (`classify_sector` + `sector_profiles`) | ⚠️ | new module + `pipeline.py:67` iterable | No existing field mutated; `CORE_METRICS` left intact (still used by `publish.py:90`) |
| 10 | Update 2 tests pinning current wrong behavior | ⚠️ | `test_pipeline.py:88-90`, `test_cli_normalize.py:31` | Update **in lockstep** with Phase 2; keep a legacy-mode assertion too |
| 11 | Token-sort normalizer | ❌ **rejected** | shared normalizer | Redesigned as #3 (explicit rows) |
| 12 | Fuzzy match | ❌ **rejected** | `find_alias_for_label` | Redesigned as #3; add sibling-label negative fixtures |
| 13 | Basis in dedupe key | ❌ **rejected** | `normalize.py:101`, `publish.py:107` | Redesigned as #7 (non-destructive guard) |
| 14 | **Default flip** to enhanced (Phase 5 only) | ⚠️ **intentional** | golden export + several tests | Single cutover phase; re-baseline golden + tests together; flag = instant rollback |

**Net verdict: SAFE-by-construction.** Every recall improvement is inert until its gate is on; the export
*contract* is strictly additive; the **only** intentional default change is Phase 5, which re-baselines in
the same commit and is reversible by flipping one flag. The two genuinely BREAKING approaches were
identified and **designed around**, not taken. Two tests will be updated in lockstep — both currently pin
*wrong* behavior (a lender flagged for missing SaaS metrics).

---

## 7. Phased implementation plan

> Each phase is independently shippable and additive-first. **Phase 0 = additive foundations behind an
> atomic gate.** Only Phase 5 changes default behavior.

### Phase 0 — Foundations behind the `recall-mode` gate *(no behavior change)*
- **0.1** Add a `recall-mode` config (`legacy` default | `enhanced`) — CLI flag + config plumbing. *Acceptance:* flag parses; absent = legacy.
- **0.2** Thread an optional `config`/mode param (default legacy) through `find_alias_for_label`, the missing-check, and the normalize basis pass — *existing callers unchanged via default arg.* *Acceptance:* 46 tests green.
- **0.3** Introduce empty gate-scoped scaffolds: `EXTENDED_ALIASES` (empty tuple), `sector_profiles` module (returns `CORE_METRICS` in legacy), new `NormalizedMetric` optional fields (`value_normalized`/`currency`/`comparison_status`, default `None`), registered-but-unemitted issue codes. *Acceptance:* golden export byte-identical; new fields serialize as null.
- **0.4** Add a **golden-diff guard**: a `make verify-golden` target (or test) that diffs the 24-doc export against a committed baseline. *Acceptance:* passes on today's output — closes the "no full-golden guard exists" gap.
- *Acceptance (phase):* flag present but inert; 46 tests green; golden identical. **Independently shippable.**

### Phase 1 — Class A + B: alias recovery + footnote stitching *(behind gate)* ← **the core lever**
- **1.1** Populate `EXTENDED_ALIASES` with the verified drifted labels: `End-of-Period ARR`, `Contracted ARR (end of period)`, `Subscription ARR (end of period)`, `Logo Churn Rate(LTM)`, `Annual Logo Churn`, `NRR(LTM)`, `Net Pound Retention-NPR(LTM)`, `Total Billings`, `Net Revenue`, `Quarterly Revenue (recognized)`. *Acceptance:* each maps to the right canonical metric; each new key asserted collision-free (#3).
- **1.2** Add a **footnote-equivalence pre-pass** in `detect_metrics.py` (before the `:152` drop) that reads `(n) X … equivalent to Y` footnotes into a dynamic label map. *Acceptance:* the 4 footnote-declared cases recover automatically.
- **1.3** Add regression fixtures with the **real drifted labels** (MediSight `Contracted ARR (end of period)`, NovaCloud `End-of-Period ARR`) **and negative fixtures** (`ARR Growth (YoY)`, `Expansion ARR as % of Total ARR` must **not** map to `arr_eop`). *Acceptance:* over-capture guard passes.
- **1.4** (optional, #4) emit `unrecognized_label` info-issue on remaining drops. *Acceptance:* no more fully-silent drops.
- *Acceptance (phase, enhanced):* NovaCloud ARR = 5 quarters; MediSight own-report 27.9M captured, outranks summary 22.4M, emits `cross_document_conflicting_candidates`. **Legacy unchanged. Delivers demo insight #1.**

### Phase 2 — Class C: sector-aware missing-check *(behind gate)*
- **2.1** New `classify_sector(...) → SectorKind` helper (mirror `classify_document`). *Acceptance:* LendBridge→credit, FleetLink/ApexFreight→marketplace, ClearPay→payments, rest→saas.
- **2.2** `sector_profiles` = per-sector expected-metric sets; swap `pipeline.py:67` iterable to `expected_metrics_for(company)` when enhanced. *Acceptance:* lender not judged against `arr_eop`/`monthly_burn`.
- **2.3** Update the 2 pinning tests (#10) to assert corrected enhanced behavior + keep a legacy assertion. *Acceptance:* suite green in both modes.
- *Acceptance (phase, enhanced):* 15 false alarms → 0. **Delivers half of demo insight #2 (lender routed out).**

### Phase 3 — Class D: basis tags + refuse-to-compare *(behind gate)*
- **3.1** Harden `metric_basis` to a controlled `Literal` incl. existing values + `None` (#8). *Acceptance:* legacy JSON still loads.
- **3.2** New deterministic pass writing `value_normalized` (quarterly→monthly burn; ClearPay restricted-cash exclusion via footnote), never overwriting raw `value`. *Acceptance:* ClearPay normalized cash = $32.2M with raw $38.4M preserved.
- **3.3** Emit `basis_collision` issue when rows share a canonical metric but differ in basis (non-destructive, #13 avoided) + a "Refused comparisons" section in `render_summary_markdown`. *Acceptance:* LendBridge interest-margin flagged beside SaaS gross margins.
- *Acceptance (phase, enhanced):* the `gross_margin_pct` collision is visible. **Delivers the rest of demo insight #2.**

### Phase 4 — D5 cross-validation flag *(behind gate — DECISION-GATED on Xavier)*
- **4.1** In the collision branch (`publish.py:119-139`), compute own-vs-summary delta and emit a richer discrepancy issue/note. *Acceptance:* MediSight own-vs-summary (27.9M vs 22.4M) surfaces as a named cross-validation flag. **Blocked until D5 locked (§9).**

### Phase 5 — Cutover: flip default + re-baseline *(the one intentional default change — LAST)*
- **5.1** Flip `recall-mode` default to `enhanced`. **5.2** Re-run the export → new committed golden. **5.3** Update affected test expectations to enhanced values. **5.4** Re-run the recall audit; update `ii-prototype-findings.md` with **before/after** (76% → X%).
- *Acceptance:* new golden green; audit shows the improvement; rollback = flip default back.

---

## 8. Blast radius, rollback & observability

- **Blast radius:** contained to `metric_aliases.py`, `detect_metrics.py`, `normalize.py`, `pipeline.py`,
  `publish.py`, `schema.py` + new `sector_profiles`. No external consumers (self-contained CLI). The export
  *contract* stays additive (new nullable fields/columns only).
- **Rollback trigger + action:** the **`recall-mode` flag is the rollback** — set `legacy` to revert any
  phase instantly, no logic redeploy. For Phase 5, rollback = flip the default back.
- **Canary:** the Phase 0 **golden-diff guard**. Enhanced mode should only **add** rows; if it ever
  **changes an existing captured value**, that's the over-capture signal → stop and inspect. Legacy-mode
  golden must stay byte-identical through Phases 0–4.
- **Observability:** issue counts by `code` (existing summary) become the dashboard — `unrecognized_label`
  and `basis_collision` counts trending down/flagged is the health signal for the fix.

---

## 9. Open questions / approval gate  *(Stage 3 stops here — no code yet)*

**Confirm before build:**
1. **Scope source** — OK to treat `ii-prototype-findings.md` + Doc 0 §4.2.1/§4.5/§6A as the de-facto
   approved spec+scope (skip a redundant Stage-1 pass)? *(Recommended: yes.)*
2. **Phase boundary (incremental scoping)** — recommended **tight core = Phase 0 + Phase 1 + a scoped
   Phase 5 flip** (fixes 30 drops + the wrong value + demo insight #1) shipped first; Phases 2–3 (demo
   insight #2) as the second wave; Phase 4 decision-blocked. Accept, or go wider in one pass?
3. **D5 (Phase 4)** — lock the reconciliation policy now (recommended: **cross-validation flag**, additive,
   company-wins retained) or keep Phase 4 parked until after the core ships?

**On approval:** hand off to `/spec-flow:3-phase-plans` to explode the approved phases into per-phase build
specs + a build DAG. **No code is written until then.**

---

### Appendix — reproduce the current (before) state
```bash
cd personal/sagard-portfolio-metric-extractor
make publish            # 24 docs / 99 valid / 125 issues  (the 76% "before")
python -m pytest        # 46 passed  (the retrocompat baseline)
```
