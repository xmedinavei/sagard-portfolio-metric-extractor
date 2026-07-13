# Demo honesty script — what to *say* vs. what the screen *shows*

> **Purpose.** The cockpit's whole pitch is *trust*. That only survives contact with a
> technical audience if every claim you make out loud is backed by something on screen. This
> is the one-page crib sheet for the live demo: the wins to show confidently, and the honest
> gaps to *narrate* rather than fake. The governing rule is simple:
>
> **Never put a number on a slide the screen cannot back up.**
>
> Ground truth was re-verified against a live `make serve` run (24/24 PDFs, schema 1.1.0,
> enhanced mode) on 2026-07-12.

---

## 1. Show these confidently — the screen backs the story

| Moment | What to show | The line |
|---|---|---|
| **NRR league** | The SaaS grid, NRR column heat-shaded green→red with **ConstructIQ marked ▼ laggard** | "Retention is a live league — NovaCloud leads at 123%, ConstructIQ trails at 112% and carries the highest churn. The heat and the ▼ are computed *within the sector only* — we never colour a SaaS number against a payments number." |
| **NovaCloud ARR stitch** | Trend → NovaCloud → ARR: one clean 5-quarter line, with the "collapsed 2 source labels" note | "The pack renamed this line across quarters; the tool stitched it back into one series. One dot became five." |
| **Lender refusal (the moat)** | The grid's LendBridge gross margin "· not ranked" + the Refused-comparisons panel | "A lender's 'gross margin' is interest margin — a different machine. The tool *refuses* to rank it against SaaS margins. Refusing is the feature." |
| **ClearPay operating cash** | Click ClearPay's cash cell → drawer shows **$32.2M operating** under the $38.4M headline | "$6.2M of that cash is client money it legally can't spend. The tool already computed the real $32.2M — and now shows it." |
| **All-companies overlay** | Trend → "All companies" → NRR: every SaaS line on one axis, with the honest "Hidden: LendBridge (different basis)" note | "The league over time — and notice what's *hidden*: the lender, named with a reason, not silently dropped." |
| **Sector-aware N/A** | Any lender/marketplace row: ARR/NRR = N/A, not "missing" | "A lender has no ARR — so we mark it *not applicable*, never a false 'missing' alarm." |
| **Provenance** | Click any number → source **file**, original label, confidence, excerpt | "Every number is one click from its source file." |

---

## 2. Narrate these — do **not** claim what the screen can't show

### 2.1 Intra-SaaS gross-margin bases (Trap B) — *roadmap, not built*
- **Truth:** the lender-vs-SaaS refusal fires live. What is **not** built: flagging that two
  *SaaS* companies (CarbonTrack excl. CS+DS, MediSight excl. impl+CS, three silent) compute
  margin differently. The five SaaS margins sit in one rankable column.
- **Say:** *"Our strongest guardrail — lender vs SaaS — works on screen. The next rung is
  flagging that even two SaaS firms define margin differently. That's a defined roadmap item:
  widen the refuse-set once those bases are declared."*
- **Do not say:** "none of the five margins are comparable" while the grid ranks them. If
  asked directly, own it: *"Correct — in v1 we only refuse the lender; the intra-SaaS case is
  next."*

### 2.2 ConstructIQ mislabeled burn (Trap C) — *refusal built, corrected read not shown*
- **Truth:** the tool refuses to silently rescale ConstructIQ's "quarterly" burn into the
  monthly field (correct — a wrong number is worse than a blank). It shows a "—" gap. It does
  **not** display the $0.30M/mo corrected read or the ~37-month runway.
- **Say:** *"We refuse to rescale a mislabeled burn rather than guess. The corrected 37-month
  runway is analysis we'd surface for a human to confirm — it's not auto-computed on screen."*
- **Do not** put "~37-month runway" on a slide as a tool output.

### 2.3 Revenue trend shows 4 of 5 quarters (Trap A) — *intentional*
- **Truth:** NovaCloud's Q2'24 "Total Billings $5.8M" is deliberately **not** blanket-aliased
  to revenue, so the revenue line has 4 points. The **default** flagship view is **ARR**,
  which is fully restored (5/5).
- **Say:** *"Default view is ARR — five clean quarters. Switch to Revenue and you'll see four:
  we deliberately don't merge 'Total Billings' on an undeclared equivalence. That conservatism
  is the point — a flagged blank beats a wrong number."*

### 2.4 PeopleFlow currency (Trap C) — *display flag, not FX, and a data caveat*
- **Truth:** PeopleFlow reports in **£**. The cockpit now flags its money cells
  **"£… · not comparable (GBP)"** — the tool *refusing* the cross-currency comparison. There
  is **no** FX conversion (roadmap). **Data caveat:** the parsed corpus does not actually
  carry a `£` symbol (it's labelled `usd`); the "GBP" flag comes from a small **human-owned
  currency rulebook** in the frontend, not from the parser.
- **Say:** *"PeopleFlow is in pounds, so we flag it 'not comparable' instead of faking a
  conversion. That flag is driven by our currency rulebook — the same human-owned rulebook
  pattern as the rest of the tool — because today's parser doesn't capture the symbol."*
- **Do not** show PeopleFlow's figures as USD-converted.

### 2.5 MediSight cross-source reconciliation — *the catch isn't in this quarter's data*
- **Truth:** the reconciliation panel honestly reads **"22 agree, 0 disagree."** The dramatic
  MediSight "$27.9M vs $22.4M, +5.5M" catch described in the planning docs is **not present in
  the shipped corpus** — the Portfolio Snapshot agrees with MediSight's own report at $27.9M.
- **Say:** *"The cross-source check runs every quarter. On this quarter's packs everything
  agrees, so it says so. We don't manufacture a discrepancy to demo the catch — the guardrail
  is present and would flag a real mismatch."*
- **Do not** present a live +5.5M reconciliation catch.

### 2.6 Provenance is file-level — *page-level is roadmap*
- **Truth:** provenance is **file-level**. The drawer no longer shows a page number (even
  though the parser populates page 1 internally), so the screen matches the claim.
- **Say:** *"Traceable to the source *file* today. Page- and sentence-level anchoring is a
  defined roadmap upgrade — we say what's true."*

---

## 3. The one-sentence guardrail for the whole demo
> Show the wins where the screen proves the claim (NRR league, ARR stitch, lender refusal,
> ClearPay $32.2M, the honest overlay). For everything else, describe the *discipline* — what
> the tool refuses, and what's on the roadmap — and let the honesty be the selling point.
