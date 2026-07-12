# Phase 3 — Build Deviations & Audit Fixes (`03-comparison-safety-fixes.md`)

> **Date:** 2026-07-12 · **Sibling of:** [`03-comparison-safety.md`](./03-comparison-safety.md)
> **Trigger:** (a) a Step-2 live-verify investigation that found the reconciliation panel's spec example was **fiction** caused by a real backend parser bug; (b) a Step-5 adversarial audit by 3 `phase-auditor` agents (lenses: retrocompat · contract/registry · acceptance/DoD).
> **Result:** the four functional acceptances **HOLD** against live data; **no Critical/High** findings. This phase carries **one user-approved backend parser fix** (out of the usual frontend-only scope) plus documentation/registry reconciliations. Frontend gate: **33** vitest tests, `tsc`+`vite` green (213.8 kB / 66.9 kB gz). Backend gate: **105** flask-present / **97** flask-absent / golden **15 byte-identical**; ruff clean.

## TL;DR — severity table

| # | Sev | Finding | Resolution |
| --- | --- | --- | --- |
| **P1** | **HIGH-impact (approved)** | The offline PDF reader picked the **last** table column (prior quarter) on whitespace/layout tables, mislabeling it as the current quarter → **11 false `cross_source_discrepancy` conflicts** + **15 silently-wrong numbers** across 4 companies. The spec's whole reconciliation example (MediSight +5.5M mirror) was built on this artifact. | **FIXED** (backend, user-approved) — made the whitespace branch period-aware, mirroring the markdown path. Golden byte-identical; 26 live rows corrected; 0 residual conflicts. |
| **D1** | Deviation | Spec §3.2b mandated a **magnitude-pair mirror** dedupe key (`{|observed|,|expected|}`). That key was designed for a conflict that does not exist; it collapses 0 rows. | **DEVIATION** — replaced with the correct **natural key `(company, metric, period)`**; reconciliation reframed as an honest cross-source **check** (0 disagree / 22 agree). |
| A1 | MED | The parser fix (a shared backend change) was unclassified in the phase's §Retrocompat notes; the phase still said "frontend-only". | **FIXED (doc)** — added a §Retrocompat notes row (CONDITIONAL) + this doc; the fix is not gated by `recall_mode` (a correctness fix). |
| A2 | MED→**accepted** | `whitespace_context` persists across tables on a page; a hypothetical non-period table after a period table could inherit a stale column index. | **ACCEPTED + documented** — zero impact on the live corpus (only the 26 intended rows moved); a reset would be ambiguous vs an "N/A" data row and could re-introduce the bug. Scope documented in code + here. |
| A3 | MED | 3.1 `basis_collision.company_name` is **null** live (company is only in `message`). | **HANDLED** — `RefusePanel` derives the company from the refused **rows** (which carry it), not the issue. |
| A4 | LOW | `comparison.ts` + new const `CROSS_SOURCE_MATCH_CODE` absent from the README naming registry. | **FIXED (doc)** — added a `comparison.ts` row + the const row. |
| A5 | LOW | DoD "make test still 95" + acceptance numbers (MediSight +5.5M, 34 issues, 30 labels) were stale post-fix. | **FIXED (doc)** — DoD → 97/105; acceptance text restated to live numbers (0 conflicts / 22 matches, 30-raw→18-distinct, 29 labels). |
| A6 | LOW | `INTEREST_MARGIN_BASIS` was defined but never read in production. | **FIXED** — `RefusePanel` now derives the refusal reason from the row's `metric_basis` (data-driven). |
| A7 | LOW | Defensive branches untested (null-company `missing_metric` skip; null-`delta` sort). | **FIXED** — added 2 unit tests (`comparison.test.ts`). |

---

## P1 — offline parser read the wrong table column *(user-approved backend fix)*

- **Problem.** `LocalPdfParser` (pure `pypdf`, `extraction_mode="layout"`) emits whitespace-aligned columns, **not** markdown. In `detect_metrics.py`, `_split_label_and_value`'s whitespace branch took `columns[-1]` — the **last** column. CarbonTrack / TalentVault / ClearPay / ConstructIQ print their Q2 reports as **two-column** tables (`Metric | Q2 2025 | Q1 2025`), so the reader grabbed the **prior-quarter (Q1)** value and stamped it "Q2 2025". Against the single-column portfolio summary that produced **11 false `cross_source_discrepancy` conflicts** (CarbonTrack ×6 + TalentVault ×5). The markdown path already had a period-aware picker (`_select_table_value_column`) but it was wired only to markdown tables; the golden fixtures are all markdown, so the bug was invisible to the suite. This is the same live-whitespace-vs-golden-markdown seam that produced the Phase-1 90/15-vs-91/14 count drift.
- **Why the spec was fiction.** The spec's "MediSight own-report 27.9M vs summary 22.4M = +5.5M, TalentVault −5.5M mirror" was a planning-time misread: the 22.4M is **TalentVault's** ARR, MediSight's 27.9M matches the summary exactly (a `cross_document_duplicate`, no conflict), and "+5.5M" subtracted two different companies' numbers.
- **Fix (3 edits, whitespace branch only).** (1) a loop-local `whitespace_context` that detects the whitespace period-header row and persists across the blank lines layout tables put between rows; (2) the call site passes `table_context` for markdown lines and `whitespace_context` for whitespace lines; (3) a factored `_split_whitespace_columns` helper + the whitespace branch now selects the period-matching column when one is tracked, else keeps the historical `columns[-1]`. Reuses `_select_table_value_column`/`_build_table_context` verbatim. The markdown branch is untouched.
- **Retrocompat — proven.** Golden **15 byte-identical** (markdown golden never executes the whitespace branch — the branches are mutually exclusive). Full suite **103→105** flask-present / **95→97** flask-absent — the count moved **only** because 2 locking tests were added (`tests/test_detect_metrics.py`); **no existing test changed**. Ruff clean. `import portfolio_metrics` still loads no flask.
- **Blast radius (live app path).** **26 rows corrected across 4 companies**, all `Q2 2025` two-column tables: 11 were the false conflicts (→ 0), **15 were silently-wrong numbers never even flagged** (ClearPay/ConstructIQ aren't in the summary). `metric_count` stays **116**. After: `cross_source_discrepancy` 11→0, `cross_document_conflicting_candidates` 11→0, `cross_document_duplicate` 11→22, e.g. CarbonTrack ARR Q2 `$15.2M → $16.9M`. No genuine conflict was suppressed — all 11 were pure artifacts.
- **Approval.** Xavier chose "Approach A — fix the parser bug, then build all 4" via AskUserQuestion (2026-07-12), and chose **not** to gate the fix by `recall_mode` (it is a correctness fix, byte-identical golden in both modes).
- **Files:** `portfolio_metrics/detect_metrics.py`, `tests/test_detect_metrics.py` (+2 tests). **Retrocompat:** ⚠️ CONDITIONAL (corrects live layout output in both modes; safe — no consumer depended on the prior-quarter misread; golden frozen canary byte-identical).

## D1 — reconciliation dedupe key + panel reframe *(deviation from spec §3.2b)*

- **Problem.** Spec §3.2b keyed the mirror dedupe on the unordered magnitude pair `{|observed_value|, |expected_value|}`. That key existed to collapse the MediSight/TalentVault "±5.5M mirror" — which is fiction. On real data it collapses **0** rows.
- **Fix.** After the parser fix there are **0** disagreements and **22** confirmed agreements. `reconciliationSummary` therefore: binds `RECONCILE_CODE` (`cross_source_discrepancy`) for disagreements (H4 — never the delta-less `cross_document_conflicting_candidates` marker), dedupes defensively on the **natural key `(company, canonical_metric, period)`**, sorts largest-`|delta|` first, and counts confirmed matches via `CROSS_SOURCE_MATCH_CODE` (`cross_document_duplicate`). `ReconciliationPanel` renders an honest **cross-source check** — "N verified across both documents, X agree, Y disagree" — with an all-clear when Y = 0 and a conflict card if one ever appears.
- **Approval.** Xavier chose "reconciliation = honest cross-source check" via AskUserQuestion. Demo narrative: the reconciliation feature **caught a real parser bug** on day one.
- **Files:** `web/src/lib/comparison.ts`, `web/src/components/ReconciliationPanel.tsx`, `comparison.test.ts`.

## A2 — stale `whitespace_context` *(accepted latent hazard)*

- **Problem.** `whitespace_context` persists for the rest of a page and is only replaced by a later period-header. A hypothetical non-period table following a period table could read a stale column index.
- **Resolution — ACCEPT.** Zero impact on the live corpus (all three auditors confirmed only the 26 intended rows moved; 0 nulls). A reset would need to distinguish a new-table header from a data row with an unparseable value (an "N/A" cell) — ambiguous, and getting it wrong would re-introduce the prior-quarter bug for rows after the "N/A". So we do not guess; the fallback stays `columns[-1]` when no header is tracked. Scope documented in `detect_metrics.py`. Deferred: robust multi-table scoping belongs to a dedicated parser task with its own layout-table fixtures.

## Ground-truth reconciliations folded in (A3/A5)

- **3.1 refuse:** live = **5** LendBridge `gross_margin_pct` refused (all `interest_margin`) + exactly **1** `basis_collision`; the collision issue's `company_name` is **null**, so the panel sources the company from the refused rows.
- **3.3 exceptions:** live = **30 raw** `missing_metric` issues → **18 distinct** `(company, metric)` (the check fires per document/period); the panel dedupes to distinct. **LendBridge (credit) has zero** missing issues, so it never appears — a lender is never asked for SaaS metrics (success #5). Spec's "34 issues" was stale.
- **3.4 breadth:** live = **29** distinct `raw_label`s across the canonical metrics (spec said ~30); both optional metrics present (NRR 11 rows, logo churn 10). Panel counts are data-driven, never hardcoded.

## Verification checklist

- [x] P1 fixed — whitespace period-aware column pick; golden 15 byte-identical; 26 rows corrected; 0 false conflicts.
- [x] D1 — natural-key dedupe + honest cross-source-check panel; H4 respected (binds `cross_source_discrepancy`, ignores the marker).
- [x] A1 fixed — §Retrocompat notes row for `detect_metrics.py` (CONDITIONAL) + this doc.
- [x] A2 accepted — documented in code + here.
- [x] A3 handled — company from refused rows (basis_collision.company_name null).
- [x] A4 fixed — README registry rows (`comparison.ts` + `CROSS_SOURCE_MATCH_CODE`).
- [x] A5 fixed — DoD → 97/105; acceptance text restated to live numbers.
- [x] A6 fixed — `INTEREST_MARGIN_BASIS` wired into `RefusePanel` (data-driven).
- [x] A7 fixed — 2 defensive unit tests added.
- [x] Frontend gate: `npm test` **33 passed**, `npm run build` green (213.8 kB / 66.9 kB gz).
- [x] Backend gate: **105** flask-present / **97** flask-absent; golden **15** byte-identical; ruff clean.
