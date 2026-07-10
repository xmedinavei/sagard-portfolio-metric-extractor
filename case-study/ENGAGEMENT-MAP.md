# Engagement Map — Sagard "Portfolio Metrics Assistant" Case Study

> **What this file is:** the status board for the whole case-study engagement — the full sequence of
> documents we're producing, where each one stands, and the synthesis we agreed today so nothing gets lost
> between sessions. It is the "see the whole board" companion to the decision brief
> (`00-foundations-and-decisions.md`).
>
> **Status as of 2026-07-09:** Foundations complete. **D1–D4 are now LOCKED** (see §4). The case study is
> **scoped to the equity / PE path** — private credit is *classified out* (Doc 0 §4.5) and kept as a
> documented extension. **Document i (Context & Problem) is drafted** (`i-context-and-problem.md`); Document
> ii is next. Still open by design: **D5** (reconciliation) + metric sub-decisions **D2a–D2f**.
>
> **Plain-English promise:** finance/technical jargon is defined the first time it appears here, and fully
> in the brief's Glossary (§11). If a term is unfamiliar, check there.

---

## 1. The board — the documents we're producing (and the order)

We are **not** rebuilding the crawl-phase prototype (the Python CLI that already turns PDFs into a clean
metrics table with provenance). We are deciding how to **frame, extend, and demo** it for a *business*
audience, and packaging that into four documents.

| # | Document | What it is / covers | Depends on | Status |
|---|----------|---------------------|-----------|--------|
| **0** | **Foundations & Decision Brief** (`00-foundations-and-decisions.md`) | Domain primer, corpus reality, the 4 decisions (now locked), **§4.2.1 trap-solutions**, **§4.5 PE/credit classifier**, §6A metric sets, Sagard tailoring, glossary. | — | ✅ **Complete** (D1–D4 locked 2026-07-09; 1161 lines) |
| **i** | **Context & Problem** (`i-context-and-problem.md`) | The business problem, the manual pain, why automation matters — tailored to Sagard, in business-stakeholder language. Answers case-study section (1). | D1–D3 locked | ✅ **Drafted 2026-07-09** (under adversarial critique) |
| **ii** | **The Prototype & Front-End** | What the tool does today, how it works, its limits, **and the front-end demo design**. Future expansion lives at the *end* of this doc. Answers case-study sections (2) + (3). | Doc i | ⬜ Not started (front-end deliberately deferred) |
| **iii** | **Slides** | The presentation deck: problem → prototype → live demo → roadmap. Answers all four case-study sections in slide form. | Docs i + ii | ⬜ Not started (very last) |

> **Sequencing rule (why this order):** in a *business* case study the graders reward connecting technical
> work to business impact and a realistic roadmap. If we pick the wrong **persona** (who the tool serves) or
> the wrong **anchor workflow** (what job it does), every later slide is polished but aimed at the wrong
> target. So we lock persona + metrics + automation-line **first** (Doc 0), and only then write the
> persuasive documents. This is also why every choice is written up as an **assumption with its discarded
> alternatives** — in the interview Xavier can't ask questions, so *showing the reasoning for what he ruled
> out* is how he demonstrates judgment.

---

## 2. Where we are today (2026-07-06)

- Read all 24 sample PDFs + the existing prototype, spec, and take-home interview-prep material.
- Ran an 8-agent research pass (metric inventory + private-markets domain + Sagard-specific tailoring +
  output-format landscape → then option framing for each decision). It **independently reproduced** the
  spine already in the decision brief — a strong robustness signal.
- Confirmed the brief (`00-foundations-and-decisions.md`) is comprehensive and correct; **did not
  regenerate it**.
- Agreed the three open **discussion points** (§4 below) and the **verification debt** (§5 below).
- **Xavier will answer D1–D3 tomorrow.** D4 (front-end) stays deferred to Document ii, by Xavier's call.

---

## 3. The governing thesis + the "one story" spine

**Thesis the whole case study hangs on:**

> **"Same label doesn't mean the same metric. Comparability is the product — not extraction."**
> The tool's real job is to *guarantee* that any two numbers placed side by side actually mean the same
> thing, and to make every number *traceable* back to its source **file** (file-level today; page-level is
> a roadmap upgrade).

**The one-story spine (how the decisions interlock):**

> We automate the **quarterly portfolio-monitoring routine** *(D1: who + what job)* by standardizing every
> company onto a **tiered metric model** that only ever compares numbers that truly mean the same thing
> *(D2: the metrics)* — automating everything **deterministic and traceable** (extract → normalize →
> aggregate → derive → flag exceptions) while keeping **humans on every judgment and every external
> number** *(D3: the automation line).*

**Why the three decisions are one decision, not three:**
- D1 = monitoring *requires* D2 = tiered metrics, because monitoring is the one screen where a lender and a
  SaaS company appear together — exactly where the "gross margin means two different things" trap would
  bite. The tiered model is the guardrail that lets D1 exist without being wrong.
- D2 = tiered *enables* D3 = automate rungs 1–4, because basis-tags + per-sector expectations are precisely
  what let derived metrics (e.g. runway) and exception-detection run safely without a human — the machine
  *applies* a human-owned rulebook.
- D3's line — automate the deterministic/internal, keep humans on the interpretive/external — is what turns
  a "PDF scraper" into "the trusted data layer a Sagard team builds valuation, LP-reporting, and covenant
  work on top of." That is the sentence that wins the FDE (Forward Deployed Engineer) interview.

---

## 4. The decisions (LOCKED 2026-07-09)

Full options + trade-offs live in the brief (§5–§8). Locked choices:

| # | Decision | Locked choice |
|---|----------|-------------------|
| **D1** | Anchor workflow + persona | ✅ **A** — Quarterly monitoring, Portfolio-Ops anchor (deal teams secondary) **+ explore B (Watchlist) as a coexisting panel** |
| **D2** | Metric set + philosophy | ✅ **B** — Tiered (universal + sector packs + raw tail + derived); concrete sets in Doc 0 §6A |
| **D3** | Automation ladder | ✅ **Rungs 1–4** now ("Monitoring Cockpit"); rungs 5 & 6 = future-extension roadmap (Doc 0 §7) |
| **D4** | Output / front-end | ✅ **A** cockpit primary (+ B/C as panels, G chat stretch); build still deferred to Doc ii |
| **D5** | Reconciliation policy | ☐ **OPEN** — decide-later; recommendation B (cross-validation flag) held (Doc 0 §4.2.1) |

### The three discussion points — RESOLVED (2026-07-09)
1. **Persona emphasis (D1) →** anchor Ops; deal teams are the heavy *secondary* consumer. Both stories, no
   dilution of ownership.
2. **Credit angle →** resolved by *scope*, not emphasis: the tool **classifies** each pack (Doc 0 §4.5) and
   routes the single lender to its own path. v1 = PE; credit is the documented extension. Cleaner than
   featuring an un-benchmarkable lender.
3. **Breadth-vs-sharpness →** confirmed: every screen leads with **provenance** and with the tool **visibly
   refusing** unsafe comparisons — the moat vs generic BI.

---

## 5. Verification debt + immediate next actions (before any demo/deck)

These do **not** change the decisions, but must be done before numbers reach a slide (the whole pitch is
"trust the numbers"):

1. **Run the full 24-PDF export.** The current `outputs/` were generated on only **3 of 24** documents
   (26 metric rows). The parsed data for all 24 already exists on disk, so this needs **no API key** — just
   run the publish step over all parsed artifacts. *This is the recommended first action once decisions
   land.*
2. **Verify the historical (multi-quarter) numbers.** ✅ **The Q2'25 cross-company NRR league is now
   PDF-verified** (2026-07-09): NovaCloud 123 / CarbonTrack 121 / TalentVault 119 / PeopleFlow 118 (GBP) /
   ConstructIQ 112; ConstructIQ churn 6.3%. Also verified: NovaCloud revenue rename chain
   (5.8/6.5/7.2/7.9/8.4), ConstructIQ burn $0.91M/qtr + cash $11.2M, ClearPay $38.4/6.2/32.2. **Still
   unverified:** the earlier-quarter *series* (NovaCloud ARR $24M→$34.2M; LendBridge covenant
   +125→+118→+132→+148 bps) — check these before they appear in the demo.
3. **Fix "missing vs Not-Applicable."** The tool currently flags a lender's absent ARR / cash / burn as
   "missing core metric" — a false alarm. This is part of implementing D2 (tiered + per-sector expected
   metrics) and should land before the exception/early-warning view is demoed.

---

## 6. Logistics

- **Timeline (2026-07-09):** 4–7 day runway → interview ≈ **Jul 13–16**, deck due 48h before ≈ **Jul
  11–14**. Comfortable.
- **Deck tool:** ✅ **self-contained HTML deck published as a Claude Artifact** (browser-native on Ubuntu,
  full-screen present, PDF-via-print; unifies with the D4 HTML cockpit). Google Slides = fallback.
- **Grading criteria (from the brief):** clarity of problem + solution; tailoring to non-technical business
  stakeholders; how well the demo tells the story; roadmap realism; handling of trade-offs/limitations
  questions.

---

## 7. File map (where everything lives)

| Path | What it is |
|------|-----------|
| `case-study/ENGAGEMENT-MAP.md` | **This file** — the status board / whole-board outline |
| `case-study/00-foundations-and-decisions.md` | Document 0 — the full decision brief (options, trade-offs, recommendations, glossary) |
| `case-study/i-context-and-problem.md` | Document i — Context & Problem (✅ drafted 2026-07-09) |
| `case-study/` (to come) | Documents ii (Prototype & Front-End), iii (Slides) |
| `intake-pdf/*.pdf` | The 24 sample portfolio-company PDFs (the corpus) |
| `outputs/` | Prototype output — **`parsed/` covers all 24 docs** (usable for verification); **`metrics_long.csv/.json` is still a 3-doc slice → re-run the export before demo numbers** |
| `portfolio_metrics/` | The crawl-phase prototype source (Python CLI) |
| `spec/SPEC.md`, `plan/`, `options/` | Take-home-round material (spec, interview prep, architecture options) |
| `personal/Sagard docs/FDE - Interview #2 - Case Study - Xavier Medina.pdf` | The official case-study brief from Sagard |

---

### Next step
D1–D4 locked; **Document i drafted** (`i-context-and-problem.md`, under adversarial critique). Then, in
order: revise Doc i per critique → run the full 24-PDF export + verify remaining numbers → write **Document
ii (Prototype & Front-End)** → **Document iii (Slides, HTML Artifact deck)**.
