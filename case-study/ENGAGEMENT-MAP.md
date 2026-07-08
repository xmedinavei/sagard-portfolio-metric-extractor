# Engagement Map — Sagard "Portfolio Metrics Assistant" Case Study

> **What this file is:** the status board for the whole case-study engagement — the full sequence of
> documents we're producing, where each one stands, and the synthesis we agreed today so nothing gets lost
> between sessions. It is the "see the whole board" companion to the decision brief
> (`00-foundations-and-decisions.md`).
>
> **Status as of 2026-07-06:** Foundations researched and written; my independent re-research this session
> **confirmed the same recommended spine**. Decisions **D1–D3 are still OPEN** — Xavier answers them
> **tomorrow**. Nothing is locked.
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
| **0** | **Foundations & Decision Brief** (`00-foundations-and-decisions.md`) | Domain primer, corpus reality, the 4 key decisions with options + trade-offs + a recommendation each, Sagard tailoring, glossary. The choices are left OPEN for Xavier. | — | ✅ **Written**; ⏳ awaiting Xavier's D1–D3 choices (tomorrow) |
| **i** | **Context & Problem** | The business problem, the manual pain, why automation matters — tailored to Sagard, in business-stakeholder language. Answers case-study section (1). | D1–D3 locked | ⬜ Not started (next after decisions) |
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
> thing, and to make every number *traceable* back to the exact page it came from.

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

## 4. The pending decisions (Xavier answers tomorrow)

Full options + trade-offs live in the brief (§5–§8). Short form + my recommendation:

| # | Decision | My recommendation | Xavier's choice |
|---|----------|-------------------|-----------------|
| **D1** | Anchor workflow + persona | **A — Quarterly monitoring, anchored on Portfolio-Ops / Value-Creation lead** (deal teams = heavy secondary) | ⏳ tomorrow |
| **D2** | Metric set + philosophy | **B — Tiered** (universal tier + sector packs + raw tail + derived layer) | ⏳ tomorrow |
| **D3** | Automation ladder | **Rungs 1–4 — "Monitoring Cockpit"** (automate extract→normalize→aggregate→derive→detect; humans decide + own the rulebook) | ⏳ tomorrow |
| **D4** | Output / front-end | **Deferred** to Document ii. Leaning: self-contained HTML cockpit (primary) + cited "chat with your portfolio" (stretch) + one-pager (fallback) | deferred |

### The three open discussion points (the "deep conversation" for tomorrow)
1. **Persona emphasis (D1 nuance).** Anchor firmly on Portfolio Ops, or co-lead Ops + deal teams equally?
   *My lean:* anchor Ops, name deal teams the heavy secondary consumer — you get both stories without
   diluting who owns it.
2. **How hard to lean on the credit angle** (LendBridge → Sagard Credit Partners, their real direct-lending
   business). *My lean:* feature it as a **segment** ("...and it handles your credit book too"), not the
   anchor — there's only one lender in the corpus, so no credit-vs-credit benchmarking is possible.
3. **Breadth-vs-sharpness risk.** D1's danger is looking like a generic BI dashboard. *Mitigation to
   confirm:* every screen leads with **provenance** (the source trail behind each number) and with the tool
   **visibly refusing** unsafe comparisons — the two things incumbent tools bury.

---

## 5. Verification debt + immediate next actions (before any demo/deck)

These do **not** change the decisions, but must be done before numbers reach a slide (the whole pitch is
"trust the numbers"):

1. **Run the full 24-PDF export.** The current `outputs/` were generated on only **3 of 24** documents
   (26 metric rows). The parsed data for all 24 already exists on disk, so this needs **no API key** — just
   run the publish step over all parsed artifacts. *This is the recommended first action once decisions
   land.*
2. **Verify the historical (multi-quarter) numbers.** The brief's §4.3 cites earlier-quarter series
   (e.g. NovaCloud ARR $24M → $34.2M +42%; LendBridge covenant headroom +125 → +118 → +132 → +148 bps; the
   NRR league table). The **Q2 2025** figures and the snapshot are verified from the PDFs; the
   **earlier-quarter series are partly agent-derived and NOT yet checked** against every source PDF. Verify
   each against the real export before it appears in Doc i or the demo.
3. **Fix "missing vs Not-Applicable."** The tool currently flags a lender's absent ARR / cash / burn as
   "missing core metric" — a false alarm. This is part of implementing D2 (tiered + per-sector expected
   metrics) and should land before the exception/early-warning view is demoed.

---

## 6. Logistics

- **Timeline:** ~4–7 day runway (interview date TBC). **Deck is due 48h before the interview** — that sets
  the roadmap horizons and the front-end build budget.
- **Deck tool:** TBD (Google Slides / PowerPoint / other) — decide before Document iii.
- **Grading criteria (from the brief):** clarity of problem + solution; tailoring to non-technical business
  stakeholders; how well the demo tells the story; roadmap realism; handling of trade-offs/limitations
  questions.

---

## 7. File map (where everything lives)

| Path | What it is |
|------|-----------|
| `case-study/ENGAGEMENT-MAP.md` | **This file** — the status board / whole-board outline |
| `case-study/00-foundations-and-decisions.md` | Document 0 — the full decision brief (options, trade-offs, recommendations, glossary) |
| `case-study/` (to come) | Documents i (Context & Problem), ii (Prototype & Front-End), iii (Slides) |
| `intake-pdf/*.pdf` | The 24 sample portfolio-company PDFs (the corpus) |
| `outputs/` | Prototype output (metrics_long.json/.csv, summary.md, parsed/) — **currently a 3-doc slice; re-run needed** |
| `portfolio_metrics/` | The crawl-phase prototype source (Python CLI) |
| `spec/SPEC.md`, `plan/`, `options/` | Take-home-round material (spec, interview prep, architecture options) |
| `personal/Sagard docs/FDE - Interview #2 - Case Study - Xavier Medina.pdf` | The official case-study brief from Sagard |

---

### Next step
Xavier records **D1–D3** (in the brief's Decision Log, §2). Then, in order: run the full 24-PDF export +
verify numbers → write **Document i (Context & Problem)** → **Document ii (Prototype & Front-End)** →
**Document iii (Slides)**.
