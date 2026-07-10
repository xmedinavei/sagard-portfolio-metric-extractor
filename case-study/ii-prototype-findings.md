# Document ii — Evidence base: what the full export proves about the prototype

> **What this file is:** the verified result of running the prototype's metric export across **all 24**
> portfolio PDFs, and a defect audit of that output against the source documents. It is the evidence
> layer for **Document ii (The Prototype & Front-End)** — specifically the "what the tool does well /
> where it breaks today / why that proves the thesis" section, and the raw material for the live-demo
> insights. It does **not** replace Doc ii; it feeds it.
>
> **Status:** ✅ Export run and audited **2026-07-10**. Every number below is quoted from the source
> `outputs/parsed/*.parsed.md` files or from `outputs/metrics_long.json`. Nothing here is inferred.
> **Update (2026-07-10):** the backend recall fix has since shipped and been re-audited — recall
> **76% → 90%**, wrong values **1 → 0**, false alarms **15 → 0**, zero regressions. See **§2.1**.
>
> **How this was produced (auditable):**
> 1. `make publish` (i.e. `python -m portfolio_metrics publish --input-dir outputs/parsed …`) over the
>    24 checked-in parsed fixtures — **no API key needed**, the PDFs were already parsed.
> 2. A per-company adversarial reconciliation: one reviewer per company independently compared every
>    canonical metric in that company's **own source report** against what actually reached the export,
>    quoting source text verbatim. 10 companies, 0 tooling errors.

---

## 1. The one-line answer to "did we get the output we wanted?"

**At the headline: yes.** The export is clean and reproduces the README's last-validated run exactly.

**Underneath: no — and that gap is the most valuable thing the case study has.** The tool **silently
drops ~1 in 4 of the numbers that are physically printed in the PDFs**, imported **one wrong number**
by trusting a summary document over a company's own report, raises **15 false "missing metric" alarms**
on metrics that don't apply to a company's sector, and places **4 non-comparable metrics in shared
columns** with no warning. None of these are embarrassments to hide. They are the *live proof* of the
governing thesis — **"same label doesn't mean the same metric; comparability is the product"** — and
they map one-to-one onto the solution design already written in Doc 0 §4.2.1.

---

## 2. Verified headline numbers

| Export metadata | Value | Desired? |
|---|---|---|
| Documents processed | 24 | ✅ |
| Metrics exported (all valid) | 99 (99 valid, 0 invalid) | ✅ |
| Duplicate `(company, period, metric)` groups | 0 | ✅ |
| **Issues carried forward** | **125** | ⚠️ the real signal |

**Recall against the source documents** (the number that actually matters for a "trust the numbers" tool):

> **Before the fix:** Of **128** canonical metric values physically present in the 24 source PDFs, the
> export reproduced **97 correctly (76%)**, **silently dropped 30**, and **exported 1 wrong value**.
>
> **After the backend recall fix** (enhanced mode made the default at the Phase 5 cutover, 2026-07-10):
> the same 24-doc corpus now reproduces **115 correctly (90%)**, drops only **13** (down from 30),
> exports **0 wrong values** (down from 1), and raises **0 sector-blind false alarms** (down from 15) —
> with **0 regressions** (every value captured before is still captured; the enhanced set is a strict
> additive superset). Independently re-audited per-company against the same source PDFs. See **§2.1**.

That 76% was the "before" state. The 24% gap was not random noise — it clustered into five explainable,
fixable failure modes (§4), dominated by **label drift** (the tool matched metric names by brittle
string comparison, so a renamed line disappeared). The fix targeted exactly those classes; §2.1 shows the
after-state and, honestly, what still is *not* captured.

### Per-company reconciliation

| Company | Sector | Source pts | Captured OK | Silently dropped | Wrong | Sector-blind false alarms |
|---|---|---:|---:|---:|---:|---:|
| NovaCloud | SaaS | 40 | 30 | **10** | 0 | 0 |
| CarbonTrack | SaaS | 16 | 8 | **8** † | 0 | 0 |
| PeopleFlow | SaaS (GBP) | 18 | 11 | **7** | 0 | 0 |
| MediSight | SaaS | 12 | 10 | 1 | **1** | 0 |
| TalentVault | SaaS | 7 | 6 | 1 | 0 | 0 |
| ConstructIQ | SaaS | 8 | 7 | 1 ‡ | 0 | 0 |
| ApexFreight | Marketplace | 3 | 3 | 0 | 0 | 1 |
| FleetLink | Marketplace | 6 | 4 | 2 | 0 | 2 |
| ClearPay | Payments | 4 | 4 | 0 | 0 | 2 |
| LendBridge | Private credit | 14 | 14 | 0 | 0 | 10 |
| **Total** | | **128** | **97** | **30** | **1** | **15** |

† **CarbonTrack's 8 drops are its entire prior-period comparison column** — a distinct, structural
limitation (see §4-F), not label drift. Removing it, current-period recall is 97/120 ≈ **81%**.
‡ **ConstructIQ's 1 drop is a basis mismatch, not a pure miss** — the pack reports *Quarterly* Net Burn
while the tool's field is *monthly*; refusing to map it is arguably correct behaviour (see §4-D).

### 2.1 After the backend recall fix (enhanced default, 2026-07-10)

Independently re-audited the same way — one reviewer per company, same source PDFs, same denominator (the
128 physically-printed values do not change; only the numerator moves).

| Company | Sector | Printed | Before OK | **After OK** | Still dropped | Wrong | Sector-blind false alarms |
|---|---|---:|---:|---:|---:|---:|---:|
| NovaCloud | SaaS | 40 | 30 | **39** | 1 | 0 | 0 |
| CarbonTrack | SaaS | 16 | 8 | 8 | 8 † | 0 | 0 |
| PeopleFlow | SaaS (GBP) | 18 | 11 | **18** | 0 | 0 | 0 |
| MediSight | SaaS | 12 | 10 | **11** | 1 | **0** (was 1) | 0 |
| TalentVault | SaaS | 7 | 6 | **7** | 0 | 0 | 0 |
| ConstructIQ | SaaS | 8 | 7 | 7 | 1 ‡ | 0 | 0 |
| ApexFreight | Marketplace | 3 | 3 | 3 | 0 | 0 | **0** (was 1) |
| FleetLink | Marketplace | 6 | 4 | 4 | 2 | 0 | **0** (was 2) |
| ClearPay | Payments | 4 | 4 | 4 | 0 | 0 | **0** (was 2) |
| LendBridge | Private credit | 14 | 14 | 14 | 0 | 0 | **0** (was 10) |
| **Total** | | **128** | **97 (76%)** | **115 (90%)** | **13** | **0** | **0** |

**What the fix recovered (+18 correct captures, 97 → 115):** NovaCloud's ARR now reads across all 5
quarters (the `End-of-Period ARR` word-order variant + `Contracted ARR` were recovered by the alias work);
PeopleFlow's GBP `Subscription ARR (end of period)` and `Annual Logo Churn` are back (11 → 18, **full
recall**); MediSight's Q2 ARR is now the company's own **$27.9M** (not the summary's mis-transcribed
$22.4M) *and* it raises a cross-source discrepancy flag; and all **15 sector-blind false alarms**
(LendBridge ×10, marketplaces/payments ×5) are gone because the missing-metric check is now sector-aware.
**Zero regressions** — no value captured before was lost; enhanced is a strict additive superset of legacy.

**What is still not captured (13) — and why that is honest, not alarming:**
- **10 = out-of-scope Class F (narrative / prior-period parsing).** CarbonTrack's entire 8-value Q1
  comparison column, plus MediSight's Q1 headcount (114) and FleetLink's headcount (199) that appear
  **only in prose**, never in a table. This is a documented roadmap item (Doc 0 §7), not a label-drift miss.
- **2 = declared-equivalence deliberately *not* blanket-aliased.** NovaCloud's `Total Billings` and
  FleetLink's `Gross Transaction Revenue`. Auto-mapping these risks *semantic over-capture* — and a wrong
  number is worse than a flagged blank — so the tool leaves them and **raises a `missing_metric` warning**:
  flagged, not silent.
- **1 = deliberate basis refusal.** ConstructIQ's *Quarterly* Net Burn is not silently coerced into the
  *monthly* field. Refusing the unsafe basis is the governing thesis working as designed (§4-D).

Excluding the out-of-scope Class F rows, current-scope recall is **115/118 ≈ 97%**, and each of the 3
remaining gaps is either flagged or a correct refusal — **no silent drops within the fix's scope, and no
wrong values anywhere in the export.**

> **Reproduce:** `make publish` (now enhanced by default) over the 24 parsed fixtures → 116 metrics / 104
> issues / schema `1.1.0`; `make publish` with `--recall-mode legacy` reproduces the byte-identical 76%
> "before" (99 metrics / 125 issues / schema `1.0.0`). The gate is the one-flag rollback.

---

## 3. The flagship example (this is the demo)

**NovaCloud reports ARR in every single quarter, and the tool captured it in only one.**

| Quarter | ARR in the PDF (verbatim label) | Value | In the export? |
|---|---|---|---|
| Q2 2024 | `End-of-Period ARR` | $24.1M | ❌ dropped |
| Q3 2024 | `End-of-Period ARR` | $26.8M | ❌ dropped |
| Q4 2024 | `End-of-Period ARR` | $29.1M | ❌ dropped |
| Q1 2025 | `End-of-Period ARR` | $31.6M | ❌ dropped |
| Q2 2025 | `ARR(End of Period)` | $34.2M | ✅ captured |

The metric is identical; only the **word order of the label** changed. The alias map recognized
`ARR(End of Period)` and not `End-of-Period ARR`, so a clean $24.1M → $34.2M growth story collapses to a
single lonely data point. The same company's **revenue** line drifts across `Total Billings` →
`Recognized Revenue` → `Net Revenue` → `Recognized Revenue`, and the packs' **own footnotes declare the
equivalence** ("*Net Revenue is equivalent to Recognized Revenue in prior periods; terminology updated
for board reporting*") — yet the deterministic matcher never reads footnotes, so two of five revenue
points vanish too.

> **Why this is the perfect demo:** a Portfolio-Ops user opens the ARR trend and sees **one dot**. They
> assume NovaCloud only started reporting ARR last quarter. In reality the whole four-quarter trend is
> sitting in the PDFs, dropped by a string-match. **A silent blank is more dangerous than a loud error** —
> and it is exactly what "comparability is the product, not extraction" means.

---

## 4. Defect taxonomy — five classes, each verified, each mapped to a designed fix

### A. Silent drops from label drift — 30 drops, the dominant failure (Doc 0 §4.2.1 "label drift")
The alias map matches metric names literally, so any rename drops the value — and to the user the blank
is indistinguishable from "the company didn't report it." Several drops emit **no warning at all**.

| Canonical metric | Kept label | Dropped (drifted) label | Where | Footnote declares equivalence? |
|---|---|---|---|---|
| `arr_eop` | `ARR(End of Period)` | `End-of-Period ARR` | NovaCloud ×4 | n/a (pure word-order) |
| `arr_eop` | `Contracted ARR` | `Subscription ARR (end of period)` | PeopleFlow ×3 | — |
| `revenue_qtr` | `Recognized Revenue` | `Total Billings`, `Net Revenue` | NovaCloud ×2 | **yes** (both) |
| `revenue_qtr` | `Recognized Revenue` | `Quarterly Revenue (recognized)` | TalentVault ×1 | — |
| `revenue_qtr` | `Platform Revenue (recognized)` | `Gross Transaction Revenue` | FleetLink ×1 | basis may differ |
| `logo_churn_pct` | `Logo Churn(LTM)` | `Logo Churn Rate(LTM)` | NovaCloud ×3 | — *(no warning)* |
| `logo_churn_pct` | `Logo Churn(LTM)` | `Annual Logo Churn` | PeopleFlow ×3 | — *(no warning)* |
| `net_revenue_retention_pct` | `Net Dollar Retention` | `NRR(LTM)` | NovaCloud ×1 | **yes** |
| `net_revenue_retention_pct` | `Net Dollar Retention` | `Net Pound Retention-NPR(LTM)` | PeopleFlow ×1 | **yes** (GBP relabel) |

**Fix (already designed, Doc 0 §4.2.1):** canonical registry + a per-company **alias map** +
**footnote-equivalence stitching** (read the "*X is equivalent to Y*" footnotes the pack already prints).
The 4 footnote-declared cases would be recovered automatically by stitching alone.

### B. One wrong value imported across companies (Doc 0 §4.2.1 trap 6 / D5 reconciliation)
**MediSight Q2 2025 ARR is exported as `$22.4M`. MediSight's own report says `Contracted ARR (end of
period) 27.9M`.** The export's provenance field proves the source: `source_file =
Portfolio_Snapshot_Q2_2025.pdf`. The summary document contains a **transcription swap** — its MediSight
row shows `$22.4M` (which is actually *TalentVault's* number) while its own footnote says MediSight is
`27.9M`. The tool never captured MediSight's standalone `27.9M`, took the summary's swapped cell, and now
**MediSight and TalentVault both carry an identical `$22.4M`** in the export. This is the single most
important defect: a *wrong* number that looks perfectly clean.

### C. Sector-blind "missing metric" false alarms — 15 (Doc 0 §4.5 classifier + D2 tiering)
The tool applies one flat set of "core metrics" to every company, so it flags absences that are simply
not-applicable:
- **LendBridge (a lender): 10 false alarms** — flagged for missing `arr_eop` (×5 quarters) and
  `monthly_burn` (×5). A profitable specialty lender has no ARR and no "burn."
- **FleetLink / ApexFreight (marketplaces): 3** — flagged for missing `arr_eop`.
- **ClearPay (payments): 2** — flagged for missing `arr_eop` and `monthly_burn`.

**Fix:** the PE-vs-credit classifier (§4.5) routes the lender out; sector-aware **expected-metric tiers**
(D2) stop marketplace/payments companies being judged against SaaS metrics.

### D. Basis collisions — the same column holding non-comparable numbers (Doc 0 §4.2.1 basis-tags)
The tool transcribes the value correctly but drops it into a shared column with no basis tag, so two
numbers that *look* comparable are not:
- **LendBridge `Gross Margin` 58–62%** sits in the same `gross_margin_pct` column as NovaCloud's 76% —
  but the lender's footnote says it is "*interest income net of cost of funds*", a fundamentally different
  construct from a SaaS COGS-based margin. Its `Recognized Revenue` is likewise interest + fee income.
- **CarbonTrack `Gross Margin` 73%** excludes customer-success and data-science costs (footnote 3) — a
  non-standard cost base placed beside standard SaaS margins.
- **ClearPay `cash_balance` `$38.4M`** includes `$6.2M` of segregated client float that the pack's own
  footnote (3) says is "*excluded from all liquidity and runway calculations*." The exported liquidity
  figure overstates true cash by $6.2M.
- **ConstructIQ burn** is reported *quarterly* (`Quarterly Net Burn ($0.91M)`) while the field is
  *monthly*; the tool dropped it rather than silently mis-scale — the right instinct, but it should
  capture-with-conversion, not lose the signal.

**Fix:** mandatory **basis tags** + `value_normalized` + refuse-to-compare across bases (Doc 0 §4.2.1).

### E. Cross-document & restatement conflicts — 5 (Doc 0 D5, still OPEN)
Where a metric appears in more than one place, the tool silently keeps one and flags a warning:
- MediSight ARR: own `27.9M` vs summary `22.4M` (this is the wrong-value in B).
- MediSight NRR `119%`: exists **only** in the summary; MediSight's own reports never disclose NRR.
- TalentVault ARR: own `22.4M` vs summary `27.9M` — here the tool correctly kept the own-report value.
- NovaCloud NRR: Q3 report tables `117%`; Q4 report restates it to `116%`.
- PeopleFlow revenue: Q1 report says `4.7M`; Q2 report restates Q1 down to `4.6M`.

**Fix:** this is exactly decision **D5** (company-wins vs cross-validation flag vs additive-only) — still
Xavier's to make. The data now shows D5 is not hypothetical: 5 live conflicts, including 1 that produced a
wrong number.

### F. Structural extraction limits (Doc 0 §7 roadmap — parser fidelity)
- **Prior-period columns ignored.** CarbonTrack's report tables Q2 2025 **and** Q1 2025 side by side; the
  tool read only the current column, dropping all 8 Q1 comparatives — free history, lost.
- **Table-only detector misses narrative numbers.** MediSight Q1 headcount (`114`, in prose) and FleetLink
  Q1 headcount (`199`, in a footnote) were dropped because they weren't in the metrics table that quarter.

**Fix:** page-/snippet-level provenance + narrative extraction are already on the Doc 0 §7 roadmap
(rungs above the current file-level parser).

---

## 5. What this means for Document ii and the demo

1. **The prototype's honest story becomes:** "It reliably extracts, normalizes, and traces clean,
   single-labelled tables (76% today, all provenance-tagged, zero invalid rows) — and the 24% it misses
   is a **catalogue of exactly the comparability problems this product exists to solve.** Every gap has a
   designed fix." That is a *stronger* pitch than a fake 100%: it proves we understand the domain.
2. **Two demo insights, now backed by verified data:**
   - **Insight 1 (the trap):** NovaCloud's ARR trend is invisible in a naïve export (1 of 5 quarters) —
     then show it restored once alias-map + footnote-stitching are applied. This *is* "comparability is
     the product."
   - **Insight 2 (the collision):** the `gross_margin_pct` column silently puts a lender's interest
     margin (60%) next to SaaS gross margins (76%) — the tool visibly refusing that comparison is the moat
     vs a generic BI table.
3. **Roadmap realism:** every defect maps to an already-written solution (registry, alias map,
   footnote-stitching, basis tags, classifier, D2 tiers, D5, parser fidelity). The interviewers' "how
   would you handle X?" is answered by "we found X in our own output; here is the fix and its trade-off."

---

## 6. Corrections to prior working notes (so nothing stale survives)

- **NovaCloud ARR `$24M → $34.2M` series: confirmed real in the source** ($24.1 / 26.8 / 29.1 / 31.6 /
  34.2M) — earlier flagged "unverified." It IS in the PDFs; the finding is that the **export captures only
  1 of the 5** because of label drift.
- **LendBridge covenant series `+125 → +118 → +132 → +148 bps`: confirmed** (Q3 2024 → Q2 2025). It is a
  **non-canonical** metric, so it is correctly absent from the canonical export and lives only in the raw
  text — monitoring it is the credit-path / D2 sector-pack extension.
- **"PeopleFlow headcount 146": false alarm on my part.** Source says `Total Headcount 96`; the `146` is
  "average seats per customer." The tool picked correctly.

---

## 7. Reproduce it

```bash
cd personal/sagard-portfolio-metric-extractor
make publish          # publishes over outputs/parsed (all 24), no API key
# → outputs/metrics_long.{json,csv} + summary.md ; 24 docs / 99 valid / 125 issues
```
