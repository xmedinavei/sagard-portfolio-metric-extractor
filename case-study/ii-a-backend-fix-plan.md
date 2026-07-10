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
| 5 | New optional schema fields (`value_normalized`, `currency`, `comparison_status`, `sector`) | ⚠️ | `schema.py:159` + the `publish.py:158` serializer | **Ground-truth correction (Stage 4):** `model_dump_json(indent=2)` has **no** `exclude_none`, so a bare new field emits `"…": null` on every row → legacy JSON is **not** byte-identical. Mitigation = **mode-gated serialization** (legacy dumps the 1.0.0 field set via `exclude`; enhanced dumps 1.1.0). See Part II §A + Phase 0. |
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
*wrong* behavior (a lender flagged for missing SaaS metrics). *(One Stage-4 ground-truth correction folded
into Part II: byte-identity requires mode-gated **serialization**, not just field defaults — today's
`model_dump_json` emits `null` for any new field. Phase 0 handles this.)*

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

---
---

# Part II — Build-ready phase specs (spec-flow Stage 4 "explode")

> **What this Part is:** the master plan above (Part I) exploded into **build-ready** per-phase specs —
> every `file:line` **ground-truthed against the live tree on 2026-07-10** by a 6-agent read-only
> investigation (one agent per phase). Per Xavier's instruction this lives **in this same document** (no
> separate `phases/` directory). Gate decisions locked 2026-07-10: **(1)** scope = Part I is the approved
> spec; **(2)** build order = tight core (P0 → P1 → scoped P5) first, P2/P3 second wave, P4 after; **(3)**
> D5 = cross-validation flag (additive, company-wins kept).
>
> **Overriding new requirement (Xavier):** *"the backend must work as the frontend (not prototyped yet)
> will expect."* → the export is now a **frozen contract** the future cockpit binds to. That contract is
> **§A** below; every phase references it by anchor and never re-describes it.

## II.0 — Ground-truth corrections that reshape Part I (read first)

The live-tree investigation found four things the plan-level view could not see. Each is folded into the
specs below.

| # | Finding (verified) | Effect on the build |
|---|---|---|
| **GT-1** | **Serializer emits nulls.** `publish.py:158` does `export.model_dump_json(indent=2)` with **no** `exclude_none`. Any new pydantic field serializes as `"field": null` on *every* row → legacy JSON is **not** byte-identical from field-defaults alone. | Phase 0 adds **mode-gated serialization** `_serialize_export(export, recall_mode)`: legacy dumps the 1.0.0 field set via `exclude=LEGACY_JSON_EXCLUDE`; enhanced dumps 1.1.0 with all fields. Same idea for CSV (mode-selected `CSV_FIELDNAMES`). |
| **GT-2** | **No config reaches the seams.** `Settings()` (cli.py:517) feeds only preflight + extract; the publish/normalize branches call workers with loose args. | `recall_mode` is threaded as an explicit **keyword-only param (default `"legacy"`)** through `normalize_documents → normalize_parser_output →` the 3 seams, and separately into `build_metrics_export`. Not a free-riding Settings field. |
| **GT-3** | **No committed golden + `outputs/` is git-ignored.** `.gitignore:18 outputs/*` (only `.gitkeep` tracked); the 24 `outputs/parsed/*.parsed.json` and `metrics_long.json` are untracked. `make verify-golden` does not exist. | Phase 0 commits a golden **input corpus + baseline** under a tracked path (`tests/golden/`), and adds `make verify-golden` + `tests/test_golden.py`. Without this the "byte-identical" guarantee has nothing to diff against. |
| **GT-4** | **Two hidden inter-phase couplings.** (a) The Class-D gross-margin collision is undetectable until a **new `interest_margin` basis** is assigned to LendBridge — which needs **Phase 1 footnote-stitching** (footnote (4), `LendBridge…parsed.md:102`, is never read today). (b) `value_normalized` restricted-cash exclusion (ClearPay) also needs Phase-1 stitching to carry the $6.2M onto the candidate. | **Phase 3 `Depends-on: Phase 1`** for those two demos. Recorded in the DAG. The quarterly→monthly `/3` burn branch is a **no-op on today's corpus** (no quarterly-burn alias) — documented, not silently shipped. |

> **Test-count note:** `pytest` reports **46 passed** (that is the retrocompat baseline). That is 30 `def
> test_` functions, several parametrized (`test_pipeline` ×6, `test_detect_metrics` ×3) expanding to 46
> cases. Both numbers are correct; the guard is the **46-case** green suite.

## II.1 — Build DAG

```
                         ┌─────────────────────────────────────────────┐
                         │  PHASE 0 — Foundations gate (ATOMIC)         │
                         │  recall_mode plumbing · frozen §A contract   │
                         │  mode-gated serializer · golden guard        │
                         └───────────────┬─────────────────────────────┘
                                         │ (unblocks all; default=legacy ⇒ output unchanged)
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
   ┌────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐
   │ PHASE 1            │   │ PHASE 2                │   │ PHASE 3                │
   │ Class A+B alias    │   │ Class C sector-aware   │   │ Class D basis tags +   │
   │ recovery + footnote│   │ missing-metric check   │   │ value_normalized +     │
   │ stitching          │   │                        │   │ refuse-to-compare      │
   │ (demo insight #1)  │   │ (½ demo insight #2)    │   │ (½ demo insight #2)    │
   └─────────┬──────────┘   └───────────┬────────────┘   └───────────┬────────────┘
             │  Feeds interest_margin basis + restricted-cash amount  │
             └───────────────────────────────────────────▶───────────┘  (P3 Depends-on P1)
                                         │
                                         ▼
                         ┌─────────────────────────────────────────────┐
                         │  PHASE 4 — D5 cross-validation flag          │  Depends-on P0 (issue fields)
                         │  (additive enrichment; company-wins kept)    │
                         └───────────────┬─────────────────────────────┘
                                         ▼
                         ┌─────────────────────────────────────────────┐
                         │  PHASE 5 — Cutover (the ONLY default change)  │  converges all tracks
                         │  flip default → enhanced · re-baseline 2 tests│
                         │  regenerate+commit golden · re-run audit      │
                         └─────────────────────────────────────────────┘
```

**Edges:** P1 ∥ P2 (independent). P3 `Depends-on` P1 (GT-4). P4 `Depends-on` P0 (issue-field contract).
P5 `Depends-on` {P1,P2,P3,P4 that shipped}. **Tight-core track = P0 → P1 → (scoped) P5.**

## II.2 — Naming registry *(use these names verbatim in every phase and in the frontend)*

**New file:** `portfolio_metrics/sector_profiles.py`

| Symbol | Kind | Home | Notes |
|---|---|---|---|
| `recall_mode` | keyword param, `str` `"legacy"｜"enhanced"` | threaded everywhere | default `"legacy"` at every hop |
| `Settings.recall_mode` | `Literal["legacy","enhanced"] = "legacy"` | `config.py:32` (mirror `pdf_parser`) | Phase 5 flips the default token |
| `--recall-mode` | CLI arg, `choices=("legacy","enhanced")`, `default=None` | `cli.py` publish+normalize subparsers | resolve `args.recall_mode or settings.recall_mode` (mirror `--parser`, cli.py:557) |
| `EXTENDED_ALIASES` | `tuple[MetricAlias, ...]` | `metric_aliases.py:126` | gate-scoped; merged only when enhanced |
| `_EXTENDED_ALIAS_BY_LABEL` | `dict` | `metric_aliases.py:128` | `{**_ALIAS_BY_LABEL, **extended}` |
| `find_alias_for_label(raw_label, *, enhanced=False)` | fn | `metric_aliases.py:135` | branch on `enhanced`; do **not** mutate `normalize_label_text` |
| `resolve_candidate_alias(raw_label, matched_alias, *, enhanced=False)` | fn | `metric_aliases.py:143` | forward `enhanced` to both inner calls |
| `_EQUIVALENCE_RE`, `_build_footnote_equivalence_map(parser_output)` | regex + fn | `metric_aliases.py:44` / `detect_metrics.py` | whole-document scan (cross-page) |
| `SectorKind` | `Literal["saas","credit","marketplace","payments"]` | `schema.py:28` (beside `DocumentKind`) | new additive Literal |
| `classify_sector(parser_output) -> SectorKind` | fn | `detect_metrics.py:219` | mirror `classify_document`; reads `combined_text()` |
| `expected_metrics_for(sector) -> tuple[CanonicalMetric, ...]` | fn | `sector_profiles.py` | legacy/saas returns `CORE_METRICS` unchanged |
| **NormalizedMetric** new fields | `sector: SectorKind｜None=None`, `value_normalized: float｜None=None`, `currency: str｜None=None`, `comparison_status: Literal["comparable","refused","unchecked"]｜None=None` | after `schema.py:159` | frontend cockpit columns |
| `metric_basis` (hardened) | `Literal["quarterly","period_end","monthly","ltm","interest_margin"]｜None` | `schema.py:156` | **must** keep all 4 existing + None; `interest_margin` is new (GT-4) |
| **NormalizationIssue** new fields | `period: str｜None=None`, `expected_value: float｜None=None`, `observed_value: float｜None=None`, `delta: float｜None=None` | after `schema.py:173` | reconciliation-panel payload |
| **ExportMetadata** new field | `recall_mode: str = "legacy"` | after `schema.py:201` | |
| new issue codes | `"unrecognized_label"`, `"basis_collision"`, `"cross_source_discrepancy"` | (string literals) | additive; `code: str` is unconstrained |
| `EXPORT_SCHEMA_VERSION` | `"1.0.0"` legacy / `"1.1.0"` enhanced | `publish.py:21` | selected by mode, not bumped unconditionally |
| `_serialize_export(export)` (mode read from `export_metadata.recall_mode`), `LEGACY_JSON_EXCLUDE`, `LEGACY_RESULT_EXCLUDE`, `EXPORT_SCHEMA_VERSION_ENHANCED` | fn + consts | `publish.py` | mode-gated JSON (GT-1); ✅ built P0 (signature simplified vs original registry — see Phase 0 build log D-0a/b/c) |
| `CSV_FIELDNAMES` / `CSV_FIELDNAMES_ENHANCED` | tuples | `publish.py:22` | mode-selected header |
| golden guard | `tests/golden/parsed/*.parsed.json`, `tests/golden/metrics_long.legacy.json`, `make verify-golden`, `tests/test_golden.py` | new | GT-3 |

## §A — FROZEN backend→frontend contract *(declared once here; referenced by anchor)*

> This is the export shape the future **monitoring cockpit** binds to. **Legacy mode = today's 1.0.0
> exactly** (byte-identical). **Enhanced mode = 1.1.0**, a strict **superset** — every 1.0.0 field keeps
> its name/type; new fields are additive. The frontend targets **1.1.0**.

**`export_metadata`** (1.1.0): all 1.0.0 fields + `recall_mode: str`, `schema_version` becomes `"1.1.0"`.

**`metrics[]`** — each row (1.0.0 fields unchanged) **+** the cockpit's new bind targets:
| Field | Type | Frontend use |
|---|---|---|
| `sector` | `"saas"｜"credit"｜"marketplace"｜"payments"｜null` | group/tier the grid; route the lender out |
| `metric_basis` | `"quarterly"｜"period_end"｜"monthly"｜"ltm"｜"interest_margin"｜null` | basis badge on the cell |
| `value_normalized` | `float｜null` | show beside raw `value` (e.g. cash-ex-float, monthly burn) |
| `currency` | `str｜null` | currency badge (USD-only today ⇒ null) |
| `comparison_status` | `"comparable"｜"refused"｜"unchecked"｜null` | the "refused comparison" indicator |
| *(provenance, unchanged)* | `source_file`, `source_snippet`, `raw_label`, `raw_value_text`, `confidence`, `is_valid` | drill-down panel |

**`issues[]`** — the **enumerated code set** the exception + reconciliation panels switch on:
| `code` | Panel | New fields carried |
|---|---|---|
| `missing_metric` | Exception (now sector-aware) | `period` |
| `unrecognized_label` *(new)* | Exception ("dropped, not absent") | `period`, `raw_label` |
| `basis_collision` *(new)* | Refused-comparison | `period` |
| `cross_document_conflicting_candidates` | Reconciliation | `period`, `expected_value`, `observed_value`, `delta` |
| `cross_source_discrepancy` *(new, D5)* | Reconciliation | `period`, `expected_value`, `observed_value`, `delta` |
| `parse_failure`, `duplicate_candidate`, `conflicting_candidates`, `cross_document_duplicate`, `portfolio_summary_document` | *(unchanged)* | — |
> New `issues[]` fields (all `null` in 1.0.0): `period`, `expected_value`, `observed_value`, `delta`.
> **D5 semantics locked:** `observed_value` = retained (own/company-report) figure; `expected_value` =
> suppressed (summary) figure; `delta = observed − expected` (null-guarded).

---

## Phase 0 — Foundations gate *(Build Spec)*

> **Status:** ✅ **BUILT + AUDITED 2026-07-10** · **Scope:** additive, gated, no migration · **Depends-on:** — · **Blocks:** all ·
> **Parallelizable-with:** — · **Ground-truthed:** 2026-07-10 · **Target:** `cli.py`, `config.py`,
> `pipeline.py`, `detect_metrics.py`, `normalize.py`, `schema.py`, `publish.py`, `Makefile`, `tests/golden/`

**Purpose:** land the `recall_mode` gate + the frozen §A fields + mode-gated serialization + the golden
guard, all inert (default legacy ⇒ output byte-identical). Atomic: lands whole or not at all.

**§ Phase 0 TODOs** — `action → file:line → acceptance` · ☐ todo ☑ done

- **0.1 Gate plumbing (SAFE).**
  ☐ **0.1a** Add `recall_mode: Literal["legacy","enhanced"] = "legacy"` to `Settings` → `config.py:32` (mirror `pdf_parser`).
  ☐ **0.1b** Add `--recall-mode` (`choices=("legacy","enhanced")`, `default=None`) to the **publish** subparser → `cli.py:149`, and the **normalize** subparser → `cli.py:110` (template `cli.py:76-81`).
  ☐ **0.1c** Resolve `mode = args.recall_mode or settings.recall_mode` in `main()` publish branch → `cli.py:600-623` and normalize branch → `cli.py:585` (mirror `--parser` resolution at `cli.py:557`).
  - **Acceptance:** `publish --recall-mode enhanced` parses; no flag ⇒ `"legacy"`; 46 tests green.
- **0.2 Thread the mode to the 3 seams (SAFE/CONDITIONAL — default keeps callers byte-identical).**
  ☐ **0.2a** `normalize_documents(paths, *, recall_mode="legacy")` → `cli.py:264`; forward at the `normalize_parser_output(...)` call → `cli.py:300`.
  ☐ **0.2b** `normalize_parser_output(parser_output, *, recall_mode="legacy")` → `pipeline.py:9` (the fan-out hub); forward into `detect_metric_candidates` (`pipeline.py:12`), `normalize_candidates` (`pipeline.py:13`), `_build_missing_metric_issues` (`pipeline.py:35`).
  ☐ **0.2c** Add `*, recall_mode="legacy"` to `detect_metric_candidates` (`detect_metrics.py:77`), `normalize_candidates` (`normalize.py:15`), `_build_missing_metric_issues` (`pipeline.py:52`). Bodies unchanged this phase.
  - **Acceptance:** mode reaches all 3 seams; with `legacy`, every seam behaves exactly as today; 46 tests green.
- **0.3 Freeze §A fields (CONDITIONAL — serializer-gated, see 0.4).**
  ☐ **0.3a** Append §A `NormalizedMetric` fields → after `schema.py:159`; harden `metric_basis` → the 5-value `Literal|None` → `schema.py:156`.
  ☐ **0.3b** Append §A `NormalizationIssue` fields (`period`, `expected_value`, `observed_value`, `delta`) → after `schema.py:173`.
  ☐ **0.3c** Append `ExportMetadata.recall_mode` → after `schema.py:201`; set it in `build_metrics_export` → `publish.py:79-92`.
  - **Acceptance:** legacy `outputs/metrics_long.json` still loads (Literal includes all 4 existing bases + None); new fields exist, default None.
- **0.4 Mode-gated serialization + golden guard (CONDITIONAL/SAFE) — fixes GT-1 & GT-3.**
  ☐ **0.4a** Add `_serialize_export(export, *, recall_mode)` + `LEGACY_JSON_EXCLUDE` (excludes the new metric/issue/metadata fields) → `publish.py`; call it from `write_publish_artifacts` at `publish.py:158`; select `EXPORT_SCHEMA_VERSION` `"1.0.0"｜"1.1.0"` by mode → `publish.py:21,80`.
  ☐ **0.4b** Add `CSV_FIELDNAMES_ENHANCED = CSV_FIELDNAMES + (…§A cols…)` → `publish.py:22`; select by mode in `_write_csv_atomically` (`publish.py:362`, `extrasaction="ignore"`); mirror keys in `_metric_to_csv_row` → `publish.py:275`.
  ☐ **0.4c** Commit golden **input corpus** `tests/golden/parsed/*.parsed.json` (24) + baseline `tests/golden/metrics_long.legacy.json`; add `make verify-golden` (template `Makefile:52-53`) + `tests/test_golden.py` (template `test_publish.py:15-44`) diffing a legacy publish against the baseline.
  - **Acceptance:** `verify-golden` passes on today's output; a legacy publish is **byte-identical** to the committed baseline; an enhanced publish emits `schema_version:"1.1.0"` + the new keys.

**§ Retrocompat notes**
| Change | Class | Why safe |
|---|---|---|
| CLI flag + threaded `recall_mode` params | SAFE | default `"legacy"` at every hop; existing callers unchanged |
| New §A fields (default None) | CONDITIONAL | serialized only in enhanced via `_serialize_export`; legacy excluded ⇒ byte-identical |
| Hardened `metric_basis` Literal | CONDITIONAL | includes all 4 emitted values + None ⇒ legacy JSON still validates |
| `schema_version` selection | CONDITIONAL | legacy keeps `"1.0.0"`; no test pins the literal |
| Golden corpus + `verify-golden` | SAFE | new tracked files + new phony target; touches nothing existing |

**Net: zero breaking, zero migration.** Non-opted-in users (no flag) observe **byte-identical** output.

**§ Definition of done — ✅ MET (2026-07-10):** ✅ 55 tests green (46 baseline + 9 golden) · ✅ `make verify-golden` green (9) · ✅ legacy byte-identical (24-doc JSON **+ CSV + summary**, independently verified == pre-change HEAD `0826c92`) · ✅ enhanced emits 1.1.0 · ✅ flag inert by default · ✅ ruff clean.

### Phase 0 — Build log (deviations + audit fixes)

Built on the main thread 2026-07-10; audited by a 3-lens `phase-auditor` fan-out (retrocompat · contract/registry · acceptance/DoD); fixes applied and re-verified.

**Deviations from the spec (recorded):**
- **D-0a:** implemented `_serialize_export(export)` — reads the mode from `export.export_metadata.recall_mode` — instead of the registered `_serialize_export(export, *, recall_mode)`. Safer: the dumped exclude-set can never disagree with the metadata. Registry updated.
- **D-0b:** added helper constant `EXPORT_SCHEMA_VERSION_ENHANCED = "1.1.0"` (registry listed only `EXPORT_SCHEMA_VERSION`); version is still selected by mode. Registered.
- **D-0c:** added `LEGACY_RESULT_EXCLUDE` (a `NormalizationResult`-scoped subset of `LEGACY_JSON_EXCLUDE`) so the CLI normalize report reuses one exclude source (needed by F1).

**Audit fixes applied:**
- **F1 (major, real bug — FIXED):** `normalize --format json` was a SECOND legacy serialization surface leaking the §A fields (`build_normalize_report` → `model_dump` with no exclude). Fixed by threading `recall_mode` into `build_normalize_report` and gating with `LEGACY_RESULT_EXCLUDE`. Regression-guarded by two normalize-report tests. *(GT-1 originally anchored only the publish serializer — this is the missed second surface.)*
- **F2 (major, under-delivery — FIXED):** golden guard covered 3 docs vs the spec's 24. Committed the 24-doc corpus at `tests/golden/parsed/` + baselines for **all three artifacts** (`metrics_long.legacy.{json,csv}`, `summary.legacy.md`); the guard diffs all 24. Baseline **independently verified byte-identical to genuine pre-change HEAD** (ran HEAD code under `-S` isolation over 24 docs → 121,097 bytes identical) — resolves the "self-referential baseline" concern.
- **Coverage nits (FIXED):** added enhanced-CSV-columns, enhanced-issue-fields, and CLI-parse/resolve tests.
- **Dismissed (auditor error):** "`build_metrics_export.recall_mode` not keyword-only" — it already is (leading `*`).

> **Ship note:** `tests/golden/parsed/*.parsed.json` (24) + the 3 baselines are on disk but **not yet `git add`ed** (spec-flow defers shipping). They are not `.gitignore`d (only `outputs/*` is) — commit them when the phase ships.

---

## Phase 1 — Class A+B alias recovery + footnote stitching *(Build Spec)*

> **Status:** not started · **Scope:** additive, gated · **Depends-on:** Phase 0 · **Blocks:** Phase 3 (GT-4),
> Phase 5 · **Parallelizable-with:** Phase 2 · **Ground-truthed:** 2026-07-10 · **Target:** `metric_aliases.py`,
> `detect_metrics.py`, `tests/fixtures/parsed/`

**Purpose:** recover the 30 label-drift drops + the MediSight wrong value, behind the gate. Fixes Class A
**and** B (own-report 27.9M gets captured, then the existing company-wins rank auto-outranks the summary
22.4M and raises the conflict flag). Delivers **demo insight #1**.

**§ Phase 1 TODOs**
- **1.1 Gate-scoped extended alias map (SAFE).**
  ☐ **1.1a** Declare `EXTENDED_ALIASES` → `metric_aliases.py:126` (right after `ALIASES` closes at :125); build `_EXTENDED_ALIAS_BY_LABEL = {**_ALIAS_BY_LABEL, **{normalize_label_text(a.label): a for a in EXTENDED_ALIASES}}` → `metric_aliases.py:128` (template :127-128).
  ☐ **1.1b** `find_alias_for_label(raw_label, *, enhanced=False)` → `metric_aliases.py:135`: body `table = _EXTENDED_ALIAS_BY_LABEL if enhanced else _ALIAS_BY_LABEL; return table.get(normalize_label_text(raw_label))` (keep the `if not raw_label` guard). **Do not touch `normalize_label_text`** (shared, token-sort rejected §5).
  ☐ **1.1c** `resolve_candidate_alias(raw_label, matched_alias, *, enhanced=False)` → `metric_aliases.py:143`; forward `enhanced` to **both** inner `find_alias_for_label` calls (:146). Pass `enhanced` at the two call sites: `detect_metrics.py:131` and `normalize.py:26`.
  - **Acceptance:** `enhanced=True` resolves the drifted labels; `enhanced=False` is identical to today.
- **1.2 Populate the drifted labels (CONDITIONAL — collision-guarded).**
  ☐ **1.2a** Add rows to `EXTENDED_ALIASES` (template `metric_aliases.py:57-63`) for the word-order/synonym drifts: `End-of-Period ARR`, `Contracted ARR (end of period)`, `Subscription ARR (end of period)` → `arr_eop`; `Logo Churn Rate(LTM)`, `Annual Logo Churn` → `logo_churn_pct`; `NRR(LTM)`, `Net Pound Retention-NPR(LTM)` → `net_revenue_retention_pct`; `Quarterly Revenue (recognized)` → `revenue_qtr`. *(All 8 verified collision-free in the venv.)*
  ☐ **1.2b** Do **not** add blanket aliases for `Total Billings` / `Net Revenue` → `revenue_qtr`; recover those **only** via footnote-stitching (1.3), because the equivalence is *pack-declared*, not universal (semantic over-capture risk, GT).
  - **Acceptance:** a unit test asserts each new normalized key is absent from `_ALIAS_BY_LABEL` before merge; enhanced captures NovaCloud ARR ×5 and MediSight `Contracted ARR (end of period)` = 27.9M.
- **1.3 Footnote-equivalence pre-pass (SAFE) — whole-document (GT).**
  ☐ **1.3a** Add module-level `_EQUIVALENCE_RE` (matches `equivalent to`) + `_build_footnote_equivalence_map(parser_output)` (template `detect_metrics.py:44` + `:419-420`). Build the map **before the page loop** at `detect_metrics.py:88` (whole-document ⇒ captures cross-page snapshot footnotes).
  ☐ **1.3b** Consult the map at the alias-miss branch **before** the drop `continue` → `detect_metrics.py:131-132` (stitch), gated on enhanced. *(Note: footnote lines die earlier at `:113-114`, not at `:152` — the map is built by the independent scan, only the stitch is consumed here.)*
  - **Acceptance:** with a fixture carrying `(n) End-of-Period ARR is equivalent to ARR (End of Period)`, the drifted row is recovered in enhanced; legacy drops it as today.
- **1.4 Regression + negative fixtures (SAFE).**
  ☐ **1.4a** Add `tests/fixtures/parsed/MediSight_Q2_2025.parsed.json` (real `Contracted ARR (end of period)` table row + an `equivalent to` footnote). *(No standalone MediSight fixture exists today; source at `intake-pdf/MediSight_Q2_2025.pdf`.)*
  ☐ **1.4b** Add negative cases (`ARR Growth (YoY)`, `Expansion ARR as % of Total ARR` must **not** map to `arr_eop`) → `test_detect_metrics.py:45-128` param block. *(Guards a future fuzzy matcher; exact-match already refuses them.)*
  - **Acceptance:** positive fixture recovers in enhanced only; negatives never map to `arr_eop` in either mode.
- **1.5 (optional) `unrecognized_label` info-issue (CONDITIONAL).** ☐ emit at `detect_metrics.py:152` under enhanced, `severity="info"`, with `period`. — **Acceptance:** enhanced has no fully-silent drops; legacy issue counts unchanged.

**§ Retrocompat notes**
| Change | Class | Why safe |
|---|---|---|
| `EXTENDED_ALIASES` + separate merged map | SAFE | legacy `_ALIAS_BY_LABEL` untouched |
| `enhanced` flag on 2 resolvers | SAFE | default False = today's path |
| New alias rows | CONDITIONAL | collision-guard test; `arr_eop` etc. already in the enum |
| Footnote stitch | SAFE | enhanced-only; whole-doc scan; no legacy path change |

**Net: zero breaking.** Legacy output identical; enhanced adds recovered rows through the **existing**
`NormalizedMetric` shape (no §A field needed until Phase 3).

**§ Definition of done:** NovaCloud ARR 1→5 quarters (enhanced) · MediSight 27.9M captured + outranks 22.4M + `cross_document_conflicting_candidates` raised · negatives refused · legacy golden byte-identical.

---

## Phase 2 — Class C sector-aware missing-metric check *(Build Spec)*

> **Status:** not started · **Scope:** additive, gated · **Depends-on:** Phase 0 · **Blocks:** Phase 5 ·
> **Parallelizable-with:** Phase 1 · **Ground-truthed:** 2026-07-10 · **Target:** `detect_metrics.py`,
> `sector_profiles.py` (new), `pipeline.py`, `schema.py`, `tests/`

**Purpose:** stop the 15 sector-blind false alarms. **Key data-flow (GT):** sector **cannot** be
fingerprinted from captured metrics (LendBridge's credit anchors aren't aliases, so its captured set is
`{revenue_qtr, gross_margin_pct, headcount}` — identical to SaaS). Sector **must** be read from
`parser_output.combined_text()` **upstream**.

**§ Phase 2 TODOs**
- **2.1 `classify_sector` (SAFE).** ☐ **2.1a** Add `classify_sector(parser_output) -> SectorKind` → `detect_metrics.py:219` (after `classify_document`, template `:211-218`); match Doc 0 §4.5 unique anchors in `combined_text()` (`loan book`/`net interest margin`/`charge-off`/`covenant headroom`/`provision coverage`→credit; `GMV`/`take rate`→marketplace; `TPV`/`client float`→payments; else saas). ☐ **2.1b** Define `SectorKind` → `schema.py:28`. — **Acceptance:** LendBridge→credit, snapshot→saas, others correct; case-insensitive.
- **2.2 `sector_profiles` module (SAFE).** ☐ **2.2a** New `sector_profiles.py` with `expected_metrics_for(sector)` (template `metric_aliases.py:8`): `saas`→`CORE_METRICS` **unchanged**; `credit`→`{revenue_qtr, gross_margin_pct, headcount}`; marketplace/payments→their subsets. Keep `CORE_METRICS` intact (still used at `publish.py:90`). — **Acceptance:** `expected_metrics_for("saas") == CORE_METRICS` exactly.
- **2.3 Compute + thread sector (CONDITIONAL).** ☐ **2.3a** In `normalize_parser_output` (`pipeline.py:9`) compute `sector = classify_sector(parser_output)` and a `{company: sector}` map (between `:19` and `:34`); pass into `_build_missing_metric_issues` at `pipeline.py:34-40`. — **Acceptance:** map available at the missing-check; single existing caller unchanged (default legacy).
- **2.4 Gate the iterable swap (CONDITIONAL).** ☐ **2.4a** In `_build_missing_metric_issues` (`pipeline.py:52`), when enhanced iterate `expected_metrics_for(company_sectors[company])` instead of `CORE_METRICS` at the loop `pipeline.py:67`; legacy iterates `CORE_METRICS` unchanged; `code="missing_metric"` shape unchanged. — **Acceptance:** enhanced ⇒ LendBridge not flagged for `arr_eop`/`monthly_burn`; legacy identical.
- **2.5 Tests both-mode (CONDITIONAL/SAFE).** ☐ **2.5a** Split `test_pipeline.py:77-90`: keep a **legacy** variant (asserts unchanged, incl. `set(metrics) == {...}` at :87) + add an **enhanced** variant where `("LendBridge","arr_eop") not in missing` and `…monthly_burn not in missing` (`cash_balance` **verify** against the credit profile). ☐ **2.5b** **Do not** mutate `test_cli_normalize.py:31` (it runs no flag = legacy); **add** a new enhanced-mode CLI test asserting that line is **absent**. — **Acceptance:** both modes green; legacy string preserved.

**§ Retrocompat notes**
| Change | Class | Why safe |
|---|---|---|
| `classify_sector`, `sector_profiles`, `SectorKind` | SAFE | all-new symbols, zero call-site edits |
| Iterable swap at `pipeline.py:67` | CONDITIONAL | gated; `CORE_METRICS` not mutated (publish.py:90 stable) |
| Test updates | CONDITIONAL | legacy assertions retained; enhanced added |

**Net: zero breaking.** Non-opted-in users unchanged. *(2nd consumer noted: the "missing core metrics"
summary also renders in the publish path via `_summaries_by_source` (`publish.py:328`); threading
`recall_mode` through the shared `normalize_documents` covers both.)*

**§ Definition of done:** 15 false alarms → 0 (enhanced) · legacy golden + `test_cli_normalize.py:31` byte-identical · both-mode tests green.

---

## Phase 3 — Class D basis tags + value_normalized + refuse-to-compare *(Build Spec)*

> **Status:** not started · **Scope:** additive, gated · **Depends-on:** Phase 0, **Phase 1** (GT-4) ·
> **Blocks:** Phase 5 · **Parallelizable-with:** Phase 2 · **Ground-truthed:** 2026-07-10 · **Target:**
> `schema.py`, `metric_aliases.py`, `normalize.py`, `parse_values.py`, `publish.py`, `tests/`

**Purpose:** make the tool **visibly refuse** unsafe comparisons (demo insight #2). **GT-4:** the LendBridge
gross-margin collision is invisible until an `interest_margin` basis is assigned to it via Phase-1
footnote-stitching (footnote (4), `LendBridge…parsed.md:102`).

**§ Phase 3 TODOs**
- **3.1 Basis vocabulary (CONDITIONAL).** ☐ **3.1a** `metric_basis` Literal (schema.py:156, done in P0.3a) now must include `"interest_margin"`. ☐ **3.1b** Assign `interest_margin` to LendBridge's `Gross Margin` via a footnote-stitch rule in `infer_metric_basis` (`metric_aliases.py:149-155`) reading the P1 equivalence/footnote map, gated enhanced. — **Acceptance:** LendBridge GM basis = `interest_margin` (enhanced); SaaS GM stays `quarterly`.
- **3.2 `value_normalized` pass (CONDITIONAL).** ☐ **3.2a** In `normalize.py:59` (construction loop), enhanced-only, compute `value_normalized` (never overwrite raw `value` at `:43`): quarterly→monthly burn `/3` (needs a quarterly-burn basis; **no-op on today's corpus** — document); ClearPay restricted-cash exclusion needs the $6.2M **from Phase-1 stitching** onto the candidate (template `parse_values.py:110-136`). — **Acceptance:** ClearPay `value_normalized = 32.2M` with raw `38.4M` preserved (enhanced, given the new fixture).
- **3.3 `basis_collision` detection — non-destructive (CONDITIONAL).** ☐ **3.3a** In `build_metrics_export` **after** `_dedupe_cross_document_metrics` → `publish.py:74-76`, enhanced-only, group the deduped metrics by `canonical_metric` **across companies** and emit `code="basis_collision"` when `metric_basis` differs (template `publish.py:100-141`). **Do not** widen either dedup key (`normalize.py:101`, `publish.py:107`) — the collision is cross-company and never hits them anyway. — **Acceptance:** LendBridge `interest_margin` GM vs SaaS `quarterly` GM ⇒ one `basis_collision` issue; legacy emits none.
- **3.4 Refused-comparison surface (CONDITIONAL).** ☐ **3.4a** Set `comparison_status="refused"` on metrics implicated in a `basis_collision` (else `"comparable"` in enhanced, `None` in legacy). ☐ **3.4b** Add a "Refused comparisons" section to `render_summary_markdown` → before the final `return` at `publish.py:219`, filtering `code=="basis_collision"` (guard the early `return` at `:202`). — **Acceptance:** summary shows the refusal (enhanced); legacy summary byte-identical.
- **3.5 Fixtures (SAFE).** ☐ ClearPay + LendBridge fixtures under `tests/fixtures/parsed/` (footnote (3) restricted-cash, footnote (4) interest-margin). — **Acceptance:** tests exercise 3.2/3.3 deterministically.

**§ Retrocompat notes**
| Change | Class | Why safe |
|---|---|---|
| New §A fields (P0) + `interest_margin` basis | CONDITIONAL | serializer-gated (P0.4); Literal includes existing + None |
| `value_normalized` pass | CONDITIONAL | enhanced-only; never overwrites raw `value` |
| `basis_collision` scan | CONDITIONAL | additive issue; dedup keys untouched; counts self-recount |
| Summary section | CONDITIONAL | enhanced-only; legacy summary unchanged |

**Net: zero breaking.** Raw `value` never mutated (the canary invariant).

**§ Definition of done:** gross-margin collision visibly refused (enhanced) · ClearPay normalized cash beside raw · legacy golden byte-identical · raw `.value` baselines all green.

---

## Phase 4 — D5 cross-validation flag *(Build Spec)*

> **Status:** not started · **Scope:** additive, gated · **Depends-on:** Phase 0 (issue fields) ·
> **Blocks:** Phase 5 · **Parallelizable-with:** Phase 3 · **Ground-truthed:** 2026-07-10 · **Target:**
> `publish.py`, `tests/` · **Decision:** cross-validation flag, additive, **company-wins kept** (locked).

**Purpose:** surface own-vs-summary discrepancies louder for the reconciliation panel, without changing the
winner. Machinery already works when 2 candidates exist (NovaCloud precedent, `test_publish.py:86-147`).

**§ Phase 4 TODOs**
- **4.1 Thread the gate (SAFE).** ☐ **4.1a** `build_metrics_export(..., *, recall_mode="legacy")` → `publish.py:53`; forward into `_dedupe_cross_document_metrics(metrics, *, recall_mode="legacy")` → `publish.py:100`; pass `recall_mode=args.recall_mode` at the call site `cli.py:622`. — **Acceptance:** mode reaches the collision branch; default legacy.
- **4.2 Enrich in the collision branch (CONDITIONAL).** ☐ **4.2a** In the collision else-path (`publish.py:113-139`), enhanced-only, compute `delta = retained.value - suppressed.value` (null-guarded) and emit an additional `code="cross_source_discrepancy"` issue (template `publish.py:127-139`) with `period=retained.period`, `observed_value=retained.value`, `expected_value=suppressed.value`, `delta`. **Winner untouched** (`selected[key]=retained` fixed at `:117`). Keep the existing `cross_document_conflicting_candidates` unchanged (pinned by `test_publish.py:147`). — **Acceptance:** enhanced ⇒ MediSight own(27.9)-vs-summary(22.4) emits `cross_source_discrepancy` with `delta=+5.5M`; legacy emits only the existing issue.
- **4.3 Test (SAFE).** ☐ clone `test_publish.py:86-147` to assert the new issue + fields fire under enhanced and are absent under legacy. — **Acceptance:** both modes green.

**§ Retrocompat notes**
| Change | Class | Why safe |
|---|---|---|
| `recall_mode` on 2 keyword-only fns | SAFE | default legacy; additive |
| New `cross_source_discrepancy` issue | CONDITIONAL | new code string; serializer-gated fields; existing issue unchanged |

**Net: zero breaking.** Company-wins ordering and the existing conflict code preserved.

**§ Definition of done:** MediSight discrepancy surfaced with delta (enhanced) · winner unchanged · `test_publish.py:147` still green · legacy golden byte-identical.

---

## Phase 5 — Cutover *(Build Spec)* — the ONLY default change

> **Status:** not started · **Scope:** **intentional default change** + re-baseline · **Depends-on:** the
> phases that shipped · **Blocks:** — · **Ground-truthed:** 2026-07-10 · **Target:** `config.py`, `tests/`,
> `tests/golden/`, `case-study/ii-prototype-findings.md`

**Purpose:** flip default → enhanced, re-baseline the (narrow) affected tests, regenerate the committed
golden, re-run the audit. **Re-baseline is narrow (GT):** only 2 tests hold legacy values that flip; all
`.value ==` baselines are canary invariants that must **stay green** (breakage = over-capture regression,
not re-baseline).

**§ Phase 5 TODOs**
- **5.1 Flip default (BREAKING — intentional).** ☐ change `Settings.recall_mode` default `"legacy"`→`"enhanced"` → `config.py:32` (single-sourced; `--recall-mode default=None` defers to it). — **Acceptance:** no-flag runs now enhanced; rollback = flip token back.
- **5.2 Regenerate + commit golden (BREAKING).** ☐ re-run publish over the 24-doc corpus; overwrite `tests/golden/metrics_long.legacy.json` with an **enhanced** baseline (or add `metrics_long.enhanced.json` + point `verify-golden` at it). — **Acceptance:** `verify-golden` green against the new baseline.
- **5.3 Re-baseline the 2 pinning tests (BREAKING).** ☐ `test_cli_normalize.py:31` (now enhanced by default) → the LendBridge line becomes at most `missing core metrics: cash_balance`; ☐ `test_pipeline.py:87-90` → `arr_eop`/`monthly_burn` `not in missing`, relax `set(metrics) ==` at :87 to `>=` if P1 added LendBridge rows. Keep explicit `--recall-mode legacy` variants as guards. — **Acceptance:** suite green; the `any(missing_metric)` check at `test_publish.py:44` still passes.
- **5.4 Re-run audit + update evidence (SAFE).** ☐ re-run the recall audit; update `ii-prototype-findings.md` before/after (`:47` 76%→X%, `:67` totals row). — **Acceptance:** doc shows the improvement.

**§ Retrocompat notes:** this phase is the deliberate cutover; every change is gated behind *this phase*
and reversible by 5.1. **Net: one intentional default change, re-baselined in-commit, one-flag rollback.**

**§ Definition of done:** default enhanced · golden re-committed · 2 tests re-baselined + legacy guards green · `.value` canaries green · findings doc updated.

---

## II.9 — Cross-cutting invariants & conventions

1. **Ground-truth** — every `file:line` above verified against the live tree 2026-07-10 (6-agent fan-out).
2. **Retrocompat class on every change** — see each phase's table; default posture additive/gated/no-migration.
3. **Non-opted-in users observably unchanged** — enforced by the golden guard (Phase 0.4) + `--recall-mode legacy` test variants.
4. **Frozen contract once** — §A is the single source; phases reference it, never re-describe it.
5. **Naming verbatim** — §II.2 registry is authoritative for the frontend too.
6. **Hazard callouts carried:** (a) **GT-1 serializer** — never add a field without the mode-gated dump; (b) **GT-4 coupling** — P3 needs P1; (c) **canary** — never overwrite raw `.value`; enhanced only *adds* rows.
7. **Mid-flight fixes:** corrective work found during build is a **suffixed sibling section** `Phase N — fixes` appended here (single-file convention), not a new phase number.

## II.10 — Decisions locked in this expansion (technical, additive) + still-open

**Locked (recommended, additive — flagged for your veto):** byte-identity via **mode-gated serialization**;
golden committed under **`tests/golden/`**; sector computed **upstream** in `normalize_parser_output`;
`comparison_status ∈ {comparable,refused,unchecked}`; D5 `observed=own / expected=summary`; footnote
pre-pass **whole-document**; `Total Billings`/`Net Revenue` recovered **only** via declared-equivalence
footnotes (not blanket aliases); new `interest_margin` basis for the lender.

**Still yours:** **D2a–D2f** (Doc 0 §6A.4 metric sub-decisions) — not needed for this build. Nothing else
blocks Phase 0.

> **Next:** `/spec-flow:4-build-phase` for **Phase 0 first** (the atomic gate everything depends on).
