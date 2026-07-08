# Document 0 — Foundations & Decision Brief
### Sagard "Portfolio Metrics Assistant" — Business Case Study (2nd round)

> **Status:** DRAFT for Xavier to review and decide. Every major decision below is left **OPEN**.
> **Purpose:** Define the business problem, the domain, and the key choices *before* we write the
> persuasive documents (Context, Prototype, Slides). Nothing here is locked until you record your
> choice in the **Decision Log** (Section 2).
> **Audience of the final case study:** Sagard's investment & portfolio-operations teams (business
> stakeholders), presented to the AI & Data team you'd join as a Forward Deployed Engineer (FDE).
> **Owner / builder:** Xavier Medina.
> **Grounding:** Direct reading of all 24 sample PDFs + web research on private-markets workflows and
> on Sagard specifically. Where a claim is inference (not public fact) it is marked *(inference)*.

---

## 0. How to read this document

- This is a **decision brief**, not a plan. It gives you *options with trade-offs* and *a
  recommendation* for each choice, then leaves the choice to you.
- **Jargon** (finance/technical terms) is explained in plain English the first time it appears and
  collected in the **Glossary** (Section 11). If a term is unfamiliar, check there.
- Each decision section ends with `☐ YOUR DECISION: __________` — fill it in when you're ready.
- The four decisions **interlock** into one coherent story (a "spine"). You can accept the whole
  recommended spine, or change any one axis — I note where changing one forces changes elsewhere.
- The word **prototype** here means the crawl-phase tool you already built (the Python CLI that turns
  PDFs into a clean metrics table with provenance). We are *not* rebuilding it; we are deciding how to
  *frame, extend, and demo* it.

---

## 1. The case study in one page

**What they asked for** (from the brief): a *business-focused* case study with (1) problem & context,
(2) your prototype — what it does, how it works, its limits, (3) a **live demo of a front-end**, and
(4) an evolution/roadmap with deliverables, timelines, dependencies, and success criteria. They grade:
clarity, tailoring to business stakeholders, how well the demo tells the story, roadmap realism, and how
you handle questions about trade-offs and limitations.

**The single thesis the whole case study should hang on:**

> **"Same label doesn't mean the same metric. Comparability is the product — not extraction."**
> The tool's real job is to *guarantee* that any two numbers placed side by side actually mean the same
> thing, and to make every number *traceable* back to the exact page it came from.

**Why that thesis wins:** pulling numbers out of PDFs is the easy, commodity part. The hard, valuable
part — the thing that makes an investment team *trust* and *adopt* the tool — is (a) knowing when two
similarly-named numbers are safe to compare, and (b) being able to click any number and see its source.
That reframes your prototype from "a PDF scraper" into "the trusted data layer a Sagard team would build
on."

**The three client pains the brief itself names**, and how the tool answers each:

| Client pain (from the brief) | How the tool answers it |
|---|---|
| (a) Quickly understand how each company is performing | One normalized view across companies + clean quarter-over-quarter trends |
| (b) Reduce manual work preparing summaries/dashboards | Auto extract + normalize + reconcile + flag exceptions; no re-keying |
| (c) Trust the numbers and trace them to source | Every number carries source file, page, original label, exact sentence, confidence |

---

## 2. Decision Log (the summary — fill this in)

Each decision is explained in full later. This table is the at-a-glance version. **My recommendation is
shown, but the choice is yours.**

| # | Decision | Options (short) | My recommendation | ☐ Your choice |
|---|----------|-----------------|-------------------|---------------|
| **D1** | Anchor **workflow + persona** | A Monitoring · B Watchlist · C Valuation · D LP-reporting · E Board-pack · F Covenant | **A — Quarterly monitoring (Portfolio-Ops)** | `__________` |
| **D2** | **Metric set + philosophy** | A SaaS core-six · B Tiered · C Thematic · D Minimal · E Union · F ILPA | **B — Tiered (universal + sector packs + raw tail + derived)** | `__________` |
| **D3** | **Automation ladder** (what we automate vs keep human) | Rungs 1–2 · **1–4** · 1–5 · 1–6 | **1–4 — "Monitoring Cockpit"** | `__________` |
| **D4** | **Output / front-end** (build deferred) | A Cockpit · B Trend · C Heatmap · D Exceptions · E One-pager · G Chat · H Export | **A cockpit (primary) + G chat (stretch) + E fallback** | `__________` |

> **Note on D4:** you asked to define the front-end *later*. D4 is included here as options + a leaning,
> but we lock it when we write Document ii (Prototype & Front-End). It's here so the roadmap and scope
> are complete.

---

## 3. Domain primer — how an investment & portfolio team actually works

A private-markets firm (like Sagard) raises a **fund** — a pool of money from outside investors — and
invests it into companies. Some key roles and terms:

- **GP (General Partner):** the firm that runs the fund and picks the investments. *This is Sagard.*
- **LP (Limited Partner):** the outside investors who put money into the fund (pension funds, insurers,
  family offices). They receive quarterly reports.
- **Portfolio company ("portco"):** a company the fund has invested in. *The 10 operating companies in
  your PDFs are portcos.*
- **NAV (Net Asset Value):** the estimated total current worth of the fund's holdings.

After a deal closes, the firm **monitors** each portco every quarter. The portco sends a **quarterly
reporting pack** (a PDF), and different internal teams use the same numbers for different jobs.

### 3.1 The players (personas)

| Persona | Plain-English role | Their "definition of done" |
|---|---|---|
| **Investment professional** (deal partner / principal) | Picks and manages deals; often sits on the portco's **board** | Fast, *directional* read — "is this company roughly on track vs the plan we underwrote?" Tolerates small fuzz |
| **Portfolio Operations / Value-Creation lead** ("operating partner") | Helps portcos *improve* after the deal; owns the quarterly monitoring routine | A standardized, comparable view across a messy multi-sector portfolio, refreshed fast |
| **Fund finance / Valuations analyst** | Sets each portco's quarterly **fair value** ("the mark") → the fund NAV | *Audit-ready*, reconciled, traceable numbers — auditors will challenge them |
| **Investor Relations / LP-reporting analyst** | Reports portco numbers to the fund's own investors (LPs) | External-facing exactness and consistency; every figure tie-able to a source |
| **Private-credit / risk analyst** | For *lenders*, checks each borrower stays within its loan promises (**covenants**) each quarter | Correct ratios on the contractually-defined number; catch stress early |

**Each player in depth.** All five read the *same* quarterly PDF, but use its numbers for very
different jobs. The one-line setup: the **GP** (Sagard) invests the **LPs'** money into **portcos**,
then monitors each portco every quarter through a reporting pack. These five people are the readers of
that pack.

1. **Investment professional** — the deal partner / principal.
   - *Who:* the person who chose this deal and now often sits on the company's **board**; they own the
     relationship.
   - *What they need:* a fast, **directional** read — "is this company roughly on track vs the plan we
     underwrote?" They accept small fuzziness because they want the answer *now*, not perfect.
   - *Camp:* **speed over precision.**

2. **Portfolio Operations / Value-Creation lead** — the operating partner.
   - *Who:* the team that helps portcos *improve* after the deal and owns the routine quarterly-monitoring
     job across the whole portfolio. At Sagard this is literally the **"Value Creation"** team.
   - *What they need:* one **standardized, comparable view** across a messy multi-sector portfolio,
     refreshed quickly. They are the ones doing the manual copy-paste grind today.
   - *Camp:* comparability + speed. **← the recommended D1 anchor** — the only persona who touches
     *every* metric, *every* company, *every* quarter.

3. **Fund finance / Valuations analyst.**
   - *Who:* sets each portco's quarterly **fair value** ("the mark"), which sums up into the fund's
     **NAV** (its total estimated worth).
   - *What they need:* **audit-ready, reconciled, traceable** numbers, because external auditors will
     challenge each figure.
   - *Camp:* **precision above all.**

4. **Investor Relations / LP-reporting analyst.**
   - *Who:* reports the portco numbers *outward* to the fund's own investors (the LPs), often in the
     industry-standard **ILPA** layout.
   - *What they need:* external-facing exactness and consistency; every figure tie-able to a source,
     because this is a consequential outside document.
   - *Camp:* **precision** (same as #3).

5. **Private-credit / risk analyst.**
   - *Who:* for companies the firm *lends to* (not owns), checks each borrower stays inside its loan
     promises (**covenants**) each quarter. In your corpus, **LendBridge** stands in for the real
     **Sagard Credit Partners**.
   - *What they need:* the correct ratio on the *contractually-defined* number, and early detection of
     stress (e.g., shrinking covenant headroom).
   - *Camp:* **precision + exact definitions** — and it exposes a corpus trap, since a lender's "gross
     margin" ≠ a SaaS company's.

`Key tension:` **Investment/deal teams want speed and a directional read; valuations/LP/credit teams
want an audited, reconciled number. The same tool must serve both — and provenance (source + confidence)
is exactly what lets it.`

`Design signal:` the five personas map almost one-to-one onto the D1 workflow options in §5 —
Investment→Watchlist, Portfolio Ops→Monitoring, Valuations→NAV, IR→LP-reporting, Credit→Covenant.
Anchoring on **Portfolio Ops (persona #2)** is the choice that covers the widest surface without
over-claiming — which is exactly why it is the recommended D1 anchor.

### 3.2 The workflows (where the metrics get used)

The research mapped 10 real workflows. The ones that matter for us:

1. **Quarterly portfolio monitoring pack** — the umbrella "how is every company doing this quarter"
   routine. Owner: Portfolio Ops. *This is the workflow the prototype most directly serves.*
2. **Watchlist / early-warning** — scan the whole book for stress (rising cash burn, falling retention,
   shrinking loan safety-margin) to intervene early. Owner: Portfolio Ops + investment team.
3. **Board-meeting prep** — digest one company's pack before its board meeting. Owner: deal partner.
4. **Valuation / NAV mark support** — feed revenue/margin into each company's quarterly fair value.
   Owner: fund finance.
5. **LP quarterly reporting** — report portco numbers to LPs in a standard format (often the **ILPA**
   template — an industry-standard layout). Owner: Investor Relations.
6. **Covenant monitoring** — for lenders, test each borrower's loan covenants quarterly. Owner: credit
   risk.

(Others: value-creation-plan tracking, thesis tracking vs the original deal case, cross-portfolio
benchmarking.)

### 3.3 The manual pain today (this is your problem statement seed)

> It's the second week after quarter-close. 20+ PDF packs have landed from a SaaS company, a lender, an
> ESG platform, a logistics firm. An analyst opens each, hunts for the numbers, and **hand-keys them into
> a master spreadsheet.** Company A calls it "ARR (End of Period)," Company B "Annual Recurring Revenue,"
> Company C "Contracted ARR" — the analyst must *know* these are the same. The lender reports a 62% "Gross
> Margin," but a footnote says it means *interest income minus cost of funds* — **not** the SaaS 78%
> "Gross Margin," so putting them in one column is quietly wrong. Last year the lender called one metric
> "Credit Loss Rate"; this year "Net Charge-off Rate" — so the **trend line silently breaks**. When it's
> done, the sheet is stale, error-prone, and **nobody can quickly trace a number to the page it came
> from.** Trust is low.

The pain is not "reading PDFs is hard." It is **reconciliation, comparability, trust, and time** — every
quarter, forever.

---

## 4. The corpus reality — what's actually in the 24 PDFs

This matters because your case study should be grounded in *your* data, not generic finance. The sample
corpus was clearly **designed as a teaching set**: it plants specific "traps" that mirror real
portfolio-monitoring pain.

### 4.1 Company / sector / period inventory

| Company | Sector (plain English) | Quarters available | Notes |
|---|---|---|---|
| **NovaCloud** | B2B SaaS — cloud analytics/observability | Q2'24 → Q2'25 (**5**) | Cleanest SaaS trend; reports full core-six + retention |
| **LendBridge** | Specialty finance — **SME lender** | Q2'24 → Q2'25 (**5**) | The **lender**; credit KPIs; the definition-trap star |
| **MediSight** | Healthcare SaaS | Q4'24 → Q2'25 (**3**) | ARR label drift; some metrics in prose only |
| **PeopleFlow** | HR / workforce SaaS | Q4'24 → Q2'25 (**3**) | **Reports in GBP** (£), not USD — currency trap |
| **FleetLink** | Logistics — freight marketplace | Q4'24, Q1'25 (**2**) | **Rebrands to ApexFreight** on 1 Apr 2025 |
| **ApexFreight** | Logistics — same co., post-rebrand | Q2'25 (**1**) | = FleetLink continued; identity-continuity trap |
| **TalentVault** | Talent-intelligence SaaS | Q2'25 (**1**) | Standalone discloses full six; snapshot omits headcount |
| **CarbonTrack** | ESG / carbon-accounting SaaS | Q2'25 (+Q1'25 inline) | Cleanest full reporter; in-doc QoQ |
| **ClearPay** | Fintech / payments | Q2'25 (+Q1'25 inline) | **Restricted-cash trap**; take-rate revenue |
| **ConstructIQ** | Construction-tech SaaS | Q2'25 (+Q1'25 inline) | **Reports burn QUARTERLY not monthly** (3× trap) |
| **Portfolio_Snapshot** | Internal roll-up (4 companies) | Q2'25 | Restates numbers under different labels |

**Reading of the design:** two companies have a full 5-quarter history and two more have 3 quarters —
enough for real **over-time** trends. Ten companies report in Q2'25 — enough for a **cross-company**
comparison. And the snapshot exists to test **reconciliation**. The corpus is purpose-built to prove all
three of the tool's differentiators at once.

### 4.2 The six designed "traps" (these ARE the business case)

1. **Label drift** — same metric, many names. E.g. revenue appears as *Total Billings / Recognized
   Revenue / Net Revenue / Quarterly Revenue / Gross Transaction Revenue / Platform Revenue*. NovaCloud
   alone renames its revenue line across 4 of its 5 quarters.
2. **Definition non-equivalence** — same name, *different meaning*. LendBridge's "Gross Margin" is
   footnoted as *interest income net of cost of funds* (a lending spread), **not** the SaaS
   cost-of-delivery margin. Comparing them by label is confidently wrong.
3. **Metric renames over time** — a company relabels its own metric between quarters. LendBridge's "Net
   Charge-off Rate" was "Credit Loss Rate" in two prior quarters; "Pre-Provision Operating Margin" was
   "Adjusted Operating Margin." Footnotes declare the equivalence; the trend breaks if you don't stitch.
4. **Missing vs Not-Applicable (N/A)** — a lender legitimately has **no** ARR, cash balance, or monthly
   burn. Your current tool flags these as *"missing core metric"* — a **false alarm** that overstates a
   data problem. "Missing" (should exist, wasn't found) and "N/A" (never applies to this business) are
   different, and conflating them destroys trust.
5. **Basis / unit traps** — ConstructIQ reports burn **per quarter**, everyone else **per month** (a 3×
   runway error if not converted); ClearPay's headline "Cash & Restricted Cash" ($38.4M) includes $6.2M
   of *segregated client money* that can't be spent (true operating cash = $32.2M); PeopleFlow reports in
   **GBP** (needs FX to compare in USD). Also *LTM* (last-twelve-months) vs single-quarter numbers.
6. **Cross-document reconciliation** — the Portfolio_Snapshot restates company numbers under *different
   labels* (NovaCloud's "ARR (End of Period)" becomes "Annual Recurring Revenue"; "Cash Balance" becomes
   "Cash"; "Total Headcount" becomes "FTE"). Rule: the company's own standalone report wins on conflict;
   the roll-up can still *add* fields the standalone omits. (Your prototype already does this.)

> **One extra, honest note:** in the parsed snapshot, the table under the "MediSight" header actually
> holds TalentVault's numbers and vice-versa — a real parsing-fidelity wrinkle. Your pipeline still routed
> the values to the right companies. Good "we handle messy reality" material, used carefully.

### 4.3 What insights this exact data can prove (for the demo)

**Over-time (needs multi-quarter companies):**
- **NovaCloud efficient-growth story:** ARR compounded ~$24M → $34.2M over 5 quarters (+42%), gross
  margin 74% → 78%, retention rising, monthly burn shrinking — *yet* cash drew down $29.5M → $19.6M
  (a runway-pressure story despite improving unit economics).
- **LendBridge credit trend:** loan book $274M → $316M, net-interest-margin 8.6% → 9.4%, charge-off rate
  improving 3.9% → 3.1% — *and* it demonstrates the rename trap (Credit Loss Rate ↔ Net Charge-off Rate)
  and a **non-monotonic** covenant headroom (+125 → +118 → +132 → +148 bps: it *dipped then widened*, a
  nice "trust the data, not the narrative" moment).

**Cross-company (Q2'25 slice):**
- **NRR (retention) league:** NovaCloud 123%, CarbonTrack 121%, TalentVault 119%, PeopleFlow 118%,
  ConstructIQ 112% — ConstructIQ is the laggard *and* has the highest SaaS churn (6.3%), an at-a-glance
  outlier — *with the guardrail that LendBridge is walled off (a lender has no NRR).*
- **Financing-risk flag:** ConstructIQ — ~12-month runway, evaluating a Series B (fundraise) — the only
  explicit raise signal; doubles as the quarterly-vs-monthly-burn trap demo.

**Trust / provenance:**
- Click NovaCloud's revenue → show 5 raw labels collapsed into one column, each with its source page.
- Show the snapshot restating NovaCloud under different labels, and the company report winning.

> **Operational reality:** the current `outputs/` were generated on only **3 of 24** PDFs (26 metric
> rows). We must **re-run the full 24-PDF export** before any demo. The code already supports it; it just
> needs running.

---

## 5. DECISION 1 — Anchor workflow + persona  `[OPEN — you asked to discuss further]`

**Why this decision matters:** this is the keystone. It decides *who you speak to*, *which companies you
foreground*, *which deliverable you build*, and *which traps become headline features*. Pick a narrow
slice (valuation, LP-reporting) and you hit a wall — the corpus has no EBITDA, no multiples, no fund-level
returns. Pick the umbrella and you keep every differentiator in play.

### Options

| Option | What it means | Pros | Cons | Verdict |
|---|---|---|---|---|
| **A. Quarterly monitoring** → Portfolio-Ops lead | The umbrella "how is every company doing" routine | Exercises all 3 differentiators at once; subsumes B & E as panels; feeds C/D/F; matches Sagard's "Value Creation" team | Risks looking like generic BI unless provenance leads; needs full 24-doc run + N/A fix | ✅ **RECOMMEND** |
| B. Watchlist / early-warning | Scan for deterioration | Highest "insight"; exception stream nearly free | Leans on trends only 4/10 companies have; needs the N/A fix | Fold in as a **panel** of A |
| C. Valuation / NAV support | Feed the quarterly marks | Highest-stakes; provenance shines | Corpus has no EBITDA/multiples → can't demo end-to-end; back-office audience | ❌ discard as anchor |
| D. LP reporting (ILPA) | External investor reports | Rides a standards tailwind | Your metrics are a strict *subset* of an LP report; IR is secondary audience | ❌ discard as anchor |
| E. Single board-pack | One company's pre-read | Most concrete, lowest-risk, always renders | Throws away cross-company + reconciliation | Reuse as A's **opener + fallback** |
| F. Covenant monitoring | Credit-only (LendBridge) | Maps to a **real Sagard business** (Sagard Credit Partners) | Only 1 lender → no benchmarking; needs credit-agreement definitions | Use as A's "handles your credit book too" proof |

### My recommendation: **A — Quarterly monitoring, anchored on the Portfolio-Ops / Value-Creation lead**
(with investment deal teams as heavy secondary users).

It's the *only* workflow that exercises cross-company comparison, over-time trends, and click-to-source
provenance **at once** — and every other option is a slice of it (B and E are panels; C, D, F sit
downstream consuming A's clean data). It also stops exactly where your data stops (the
company→period→metric layer), so you never overclaim.

**If you pick A, you're assuming:**
- Sagard runs a recurring quarterly monitoring routine where packs arrive as PDFs and get re-keyed by
  hand *(inference — supported by Sagard's public "Value Creation" team and the FDE job description, but
  not a documented fact; present as inference).*
- The primary internal client is a portfolio-ops / value-creation function (Sagard's closest *named*
  public team is "Value Creation").
- The portfolio is genuinely multi-sector (true for Sagard — this is *why* sector-aware normalization
  matters).
- The tool's job **ends** at the canonical metric layer and *feeds* valuation/LP/covenant work rather
  than performing it (so it needs no EBITDA, multiples, or fund returns).

**What we discard and why:** C & D (corpus can't close the loop end-to-end); F (single lender = no
benchmarking). All kept as one-line "where this feeds next" roadmap notes.

### Points to discuss (you flagged this one)
1. **Persona emphasis.** Anchor firmly on **Portfolio Ops**, or present it as **Portfolio Ops + deal
   teams** jointly? (Ops = the monitoring machine; deal teams = the sexier "board prep / watchlist" story.
   My lean: anchor Ops, name deal teams as the heavy secondary consumer — you get both.)
2. **How much to lean on the credit angle (LendBridge → Sagard Credit Partners).** It's a strong,
   verifiable Sagard hook. Feature it as a *segment* of A ("and it handles your credit book too"), not the
   anchor — agreed?
3. **Breadth vs sharpness risk.** A's danger is looking like a generic dashboard. Mitigation: lead every
   screen with provenance and with the tool *refusing* unsafe comparisons. Comfortable with that framing?

`☐ YOUR DECISION (D1): __________________________________`

---

## 6. DECISION 2 — Metric set + philosophy  `[OPEN]`

**Why this decision matters:** this choice decides whether your cross-company and cross-quarter numbers
can be *trusted* or are *confidently wrong*. The current tool standardizes on a **closed SaaS-shaped set
of 8 metrics** (revenue, ARR, gross margin, cash, monthly burn, headcount + optional NRR, logo churn).
The question is whether to keep, widen, re-theme, or shrink that — and under what rule for "when is a
comparison safe."

### Options

| Option | Philosophy | Pros | Cons | Verdict |
|---|---|---|---|---|
| A. Keep SaaS core-six | One closed list, everyone judged the same | Zero build; already tested | Silently compares lender vs SaaS "gross margin"; false "missing" flags; drops sector KPIs | Right for the *PoC*, wrong as target |
| **B. Tiered** (universal + sector packs + raw tail) | Comparable *where provably safe*, faithful always | Kills all 3 traps at once; fits a multi-sector book; fully additive over your core-six | More schema/config; needs a sector classifier; cross-sector roll-ups deliberately thin | ✅ **RECOMMEND** |
| C. Thematic scorecard | Score every company on Growth / Efficiency / Liquidity / Durability | Genuinely cross-sector at the *theme* level; great exec view | Comparability becomes *subjective* weighting — valuations/LP/credit won't accept it as source-of-truth | Use as a **view** on top of B |
| D. Minimal (3–4 rock-solid) | Standardize only the guaranteed-comparable | Maximum trust; tiny surface | Too thin — NRR/ARR/burn/credit KPIs stay raw, so workflows can't run on it | Use as B's **universal tier** |
| E. Union (every metric a field) | Capture everything as a first-class field | Nothing dropped | Schema explodes into sparse nulls; re-introduces the trap at scale | ❌ discard |
| F. ILPA template | Standardize on the LP-reporting industry template | Industry-standard vocabulary | Covers financial/ownership fields, not the operating KPIs monitoring needs | Use as an **export**, not the core |

### My recommendation: **B — the Tiered model.** Three concentric rings:

1. **Universal tier** — genuinely comparable across *any* business model: `revenue`, `headcount`,
   `operating cash`, and `gross margin` **carrying a mandatory basis tag** (`saas_cogs` vs
   `credit_spread`) so the two are *never* auto-compared.
2. **Sector packs** — keyed to each company's business type:
   - *SaaS pack:* ARR, NRR (net revenue retention), logo churn, ARR-per-employee.
   - *Credit pack:* loan book, net-interest-margin, net charge-off rate, provision coverage, covenant
     headroom, balance-sheet leverage.
   - *Marketplace pack:* completed shipments / GMV, take-rate, contribution margin per shipment.
   - *Payments pack:* total payment volume, take-rate, operating-vs-restricted cash.
3. **Raw tail** — every remaining company-specific KPI kept verbatim with provenance, never force-fit.

Plus a **per-sector expected-metric profile** that turns "a lender has no ARR" into an **N/A-by-sector**
signal instead of a false "missing" alarm.

**This is the only option that kills all three traps simultaneously:** non-equivalence (a metric shares a
canonical ID *only within its sector/definition*), missing-vs-N/A (per-sector expectations), and renames
(canonical IDs carry per-pack alias lists that stitch "Credit Loss Rate" ↔ "Net Charge-off Rate").

`★ New DERIVED metrics tier — this directly answers "what should the X metrics be":`
Numbers you *compute* (not extract), in a clearly-labelled layer so they're never confused with a
source-cited value:
- **Runway (months)** = cash ÷ monthly burn — *basis-guarded* (refuses to divide by ConstructIQ's
  quarterly burn as if monthly; uses ClearPay's $32.2M operating cash, not the $38.4M headline).
- **QoQ / YoY growth** per metric (off the rename-aware time series).
- **Rule of 40** (SaaS: growth% + margin% ≥ 40) — SaaS-gated.
- **ARR-per-employee** (SaaS efficiency — NovaCloud already computes it by hand).
- **Revenue-per-employee** — a *truly universal* efficiency metric (works for the lender and marketplace
  too).
- **Covenant headroom** (credit safety margin vs the loan's minimum).

**If you pick B, you're assuming:**
- A company's sector can be assigned cheaply and reliably (one-time, deterministic; LLM only for genuinely
  ambiguous cases like "is ClearPay payments or fintech-SaaS?").
- Cross-sector roll-ups are *intentionally* limited to the thin universal tier — the firm accepts that a
  lender and a SaaS company are compared only on revenue, headcount, and basis-tagged margin.
- Gross margin is **not** treated as universal-and-identical — it carries a basis tag and the two bases
  are never auto-compared.
- The canonical-ID list can grow additively from a closed 8-item set to a namespaced registry
  (`saas.arr_eop`, `credit.net_charge_off_rate`) *without breaking* current CSV/JSON consumers
  (retro-compatible).

**What we discard and why:** A (makes the false comparison), E (sparse explosion), F (incomplete as a
core — better as an export). C folds in as a *view*, D as the *universal tier*.

> This is also exactly the evolution your own take-home assumptions ledger already flagged
> (`plan/INTERVIEW_ASSUMPTIONS_LEDGER.md:241–245`: "sector-aware expectations, company-level metric
> profiles, not-found vs not-applicable"). B is you following your own roadmap.

`☐ YOUR DECISION (D2): __________________________________`

---

## 7. DECISION 3 — Automation ladder (what we automate vs keep human)  `[OPEN]`

**Why this decision matters:** these numbers don't stay in a spreadsheet. They flow into **audited NAV
marks**, **external LP reports**, and **legal covenant tests**. So the real question isn't "can we build
it" — it's **"where do we put the human."** Over-automate and an un-reviewed wrong number ships to an
auditor or an LP; under-automate and the team keeps re-keying PDFs.

**The line that governs every option:** not *easy-vs-hard to build*, but
**deterministic-and-traceable-and-internal** (safe to automate) vs
**interpretive-and-consequential-and-external** (keep a human). Think of a 6-rung ladder:

| Rung | Task | Can we automate it? Why / caveat |
|---|---|---|
| 1 | Extract + normalize | ✅ **Done.** Deterministic detection + alias map + provenance + confidence. Human clears a low-confidence queue. |
| 2 | Cross-company & over-time aggregation | ✅ **Yes, if gated** by a human-owned rulebook (sector map, rename map, entity-identity map for FleetLink→ApexFreight, FX/basis map). Machine *applies*, human *owns*. |
| 3 | Derived metrics & growth rates | ✅ **Yes, if basis-guarded.** Runway is 3× wrong on ConstructIQ's quarterly burn; ClearPay must use operating cash. Each derived figure declares its basis and refuses mismatched inputs. |
| 4 | Exception / early-warning **detection** | ✅ **Yes for detect + rank** — the exception stream already exists. Caveats: fix missing-vs-N/A first; thresholds need calibration. **Machine surfaces "look here"; human decides.** |
| 5 | Narrative commentary | ⚠️ **Partial.** Templated, number-grounded, cited prose ("ARR grew 8% QoQ to $34.2M") is safe. Free-form interpretation is *not* (a naive generator would call covenant headroom "tightening" when it widened). Draft-only, human signs. |
| 6 | Full board / LP pack generation | ⚠️ **Assembly yes, trust is the union of all lower risks** on the most audited, external output; also your metrics are a subset of ILPA. Auto-generate a **draft**, human signs, never auto-send. |

### Options (bundles of rungs)

| Option | Rungs | Pros | Cons | Verdict |
|---|---|---|---|---|
| Trusted Ledger | 1–2 | Highest trust; bulletproof live; kills the #1 pain (re-keying) | Leaves runway/exceptions/insight on the table; least "wow" | Safe floor, under-delivers |
| **Monitoring Cockpit** | **1–4** | All 3 pains + all 3 differentiators in one artifact; exception layer nearly free; everything auto is deterministic & auditable | Needs the N/A fix + threshold calibration first | ✅ **RECOMMEND** |
| + Draft commentary | 1–5 | Harder hit on manual work; very demo-able | First nondeterministic surface; needs strict templating + sign-off | Next increment on top |
| + One-click packs | 1–6 | Biggest "wow"; closes the loop | Highest risk on most audited output; partial ILPA coverage | Roadmap endpoint |

### My recommendation: **Rungs 1–4 — the "Monitoring Cockpit."**
Automate everything that is deterministic, traceable, and internal (extract → aggregate → derive →
detect-exceptions), and keep humans on the **decisions** (escalate / watchlist / mark / breach-call) and
on **anything external**. Two things stay human in *every* version: (a) the **equivalence rulebook**
(what's the same, what renames map, FX/units) — encoded once, human-owned; (b) a **low-confidence review
queue**.

**If you pick 1–4, you're assuming:**
- All 24 PDFs are run (current export is a 3-doc slice).
- A human-curated equivalence rulebook exists and is maintained (sector, rename, entity-identity, FX/basis
  maps); the machine only *applies* it.
- RAG (red/amber/green) and anomaly thresholds are **configurable and owned by the ops team**, not
  hard-coded as truth.
- Exceptions **surface and rank only** — no automated escalation, watchlist change, breach call, or
  valuation mark.
- Anything feeding a NAV mark / covenant test / LP table gets the adjusted-vs-reported flag and human
  reconciliation before external use.

**What we discard and why:** "Full autopilot" (auto-publish to LPs, free-form LLM interpretation — violates
every governance rule); "stop at rung 1" (leaves the differentiator unbuilt). Rungs 5–6 aren't rejected —
they're the **roadmap** (draft-only, human-signed).

`☐ YOUR DECISION (D3): __________________________________`

---

## 8. DECISION 4 — Output / front-end  `[OPEN — build deferred to Document ii, as you asked]`

You asked to define the front-end later. Here are the **8 options with trade-offs** (as requested) and a
*leaning*, but we lock the build when we write Document ii.

| Option | What the demo looks like | Demo power | Build effort | Verdict |
|---|---|---|---|---|
| **A. Interactive cockpit** (heatmap + trend + exceptions, provenance spine, one self-contained HTML file) | Whole portfolio → click any number → source snippet/page/confidence | ★★★★★ | High | ✅ likely **primary** |
| B. Trend explorer (click-to-source) | One company/metric over time, click a point → source | ★★★★ | Med | = panel 2 of A |
| C. Portfolio heatmap (RAG grid) | Companies × metrics, red/amber/green, sector-segmented | ★★★★ | Med | = panel 1 of A |
| D. Exception / early-warning report | Ranked list of what needs a look | ★★★ | **Low** (data exists) | = panel 3 of A |
| E. Single-company one-pager | One company scorecard, footnoted to source | ★★★ | Med | **opener + guaranteed-to-render fallback** |
| F. Trust / provenance review UI | Raw-vs-canonical + reconciliation ("company report wins") | ★★★★ | Med | Its provenance panel *is* A's spine |
| **G. "Chat with your portfolio"** (cited answers) | Ask in plain English → grounded answer + cited source rows | ★★★★★ | Med | **stretch secondary**, shown last |
| H. Board-pack PDF / Excel export | Auto-generated deck / wide spreadsheet with provenance columns | ★★ | Low | supporting leave-behind |
| — | Warehouse/BI feed, Slack digest | Low live-demo value | Low–Med | *mention verbally* only |

### My leaning (to confirm in Document ii):
- **Primary = A**, a **single self-contained HTML file** with the 24-doc data baked inline — no server,
  no API key, no network, so nothing can fail live. It's the only surface that shows all three
  differentiators + all three pains at once, and it leads with the moat (provenance), not BI chrome.
- **Secondary stretch = G**, a *strictly grounded* cited chat over the same data — it speaks Sagard's own
  AI vocabulary (they're an NLP-PhD-led AI team that watched the market leader ship a cited chat with
  Anthropic). Shown **last**, after the deterministic cockpit has already earned trust, with pre-cached
  answers so a live hiccup never breaks the story.
- **Fallback = E**, a pre-rendered NovaCloud one-pager PDF as a guaranteed-to-render safety net.

**What we discard and why:** a heavyweight React+server build (over-engineered for ~100 rows, adds live
failure modes); warehouse/BI feed and Slack digest (great talking points, poor live surfaces); a
standalone Excel export as the headline (undersells the tool).

`☐ YOUR DECISION (D4 — can wait): __________________________________`

---

## 9. Provisional problem statement + scope  (point 3 — locks after D1–D3)

**Problem (business framing):** Every quarter, Sagard's portfolio-monitoring team hand-transcribes 20+
inconsistent PDF packs into spreadsheets — reconciling different names for the same metric, avoiding false
comparisons across very different businesses, and losing the ability to trace any number to its source.
It's slow, error-prone, stale, and low-trust.

**What we automate** (rungs 1–4): extract → normalize into one shared vocabulary → reconcile the roll-up
against company reports → aggregate cross-company and over-time → compute derived metrics → *surface*
exceptions — every number carrying source page + confidence.

**What stays human:** the decisions (escalate / mark / breach-call), the equivalence rulebook, and
anything sent to auditors or LPs.

**In scope for the case study:**
- The quarterly monitoring workflow, for the Portfolio-Ops persona.
- The tiered metric model (universal + sector packs + raw tail + derived).
- The full 24-doc run.
- The cockpit demo with **one clean cross-company insight + one over-time insight.**

**Explicitly "improve later" (the roadmap slide):**
- Draft commentary (rung 5), one-click board/LP packs (rung 6).
- Warehouse/BI feed; Slack/email early-warning digest.
- Deeper valuation & covenant math; ILPA export; entity-resolution registry; OCR for scanned PDFs.

**Success criteria (draft — to sharpen with the roadmap):** time-to-first-portfolio-view drops from
"days of re-keying" to "minutes"; every displayed number is one click from its source; zero false
"missing" flags for N/A-by-sector metrics; the tool *refuses* unsafe cross-sector comparisons by design.

---

## 10. Sagard tailoring hooks + caveats

**Hooks (verifiable, make the deck feel Sagard-specific):**
- **Multi-strategy = sector heterogeneity is REAL, not hypothetical.** Sagard invests across venture,
  private equity, **private credit**, and real estate (US$46B AUM, 190+ portcos, per sagard.com). So a
  single canonical metric set genuinely *has* to survive very different businesses — the whole reason for
  sector-aware normalization.
- **LendBridge = stand-in for Sagard Credit Partners** (their real direct-lending business). The
  lender-vs-SaaS "gross margin" trap is a real risk for a firm that runs *both* a credit book and a
  software book.
- **Speak their own AI vocabulary.** Sagard's publicly-described AI platform uses exactly the words
  "automated ingestion and transformation," "confidence levels," and "explainable reasoning" — your
  normalization + per-row confidence + provenance is the same discipline applied to portfolio monitoring.
- **Right-sized AI = culture fit.** The FDE role prizes *"judgment on when AI adds value over conventional
  approaches."* Your design (deterministic detection; LLM reserved for ambiguous labels only) is that
  judgment made concrete.
- **The team:** Sagard hired its **first Head of AI (Parinaz Sobhani, ex-Georgian, NLP PhD) in Sept 2024**;
  the FDE sits in a *"small and agile AI and Data team"* partnering with investment, finance, compliance,
  operations. The named public analog for your "portfolio operations" client is Sagard's **Value Creation**
  team.

**Caveats (do NOT overclaim — these protect your credibility):**
- The 10 corpus companies are **synthetic** (ReportLab-generated). Always present them as realistic
  *archetypes*, never as real Sagard holdings.
- Sagard's *public* AI platform is a **deal-sourcing** tool, not a portfolio-monitoring one. Cite its
  language as evidence of what Sagard *values*; do not claim your tool plugs into it.
- That Sagard's ops team "manually keys numbers out of PDFs" is a **reasonable inference**, not a
  documented fact — present it as inference.
- AUM/portfolio counts vary by source; use the sagard.com US$46B headline and note rapid growth rather
  than fixing one number.

---

## 11. Glossary (finance & tool jargon, plain English)

| Term | Plain English |
|---|---|
| **FDE** (Forward Deployed Engineer) | An engineer who works *with* the business users, builds tools for their real workflow, and iterates fast. The role you're interviewing for. |
| **GP / LP** | GP = the firm running the fund (Sagard). LP = the outside investors who put money into the fund. |
| **Fund** | A pool of LP money the GP invests over ~10 years into companies. |
| **Portfolio company (portco)** | A company the fund has invested in. The 10 operating companies here. |
| **Portfolio Ops / Value Creation** | The team that improves portcos after the deal and owns quarterly monitoring. |
| **NAV** | Net Asset Value — the fund's total current estimated worth. |
| **Mark / fair value** | Restating a company to its current estimated value each quarter (audited). |
| **TVPI / DPI / MOIC / IRR** | Fund/deal return measures LPs care about (total value, cash returned, multiple on cost, time-weighted return). |
| **EBITDA** | Earnings before interest, taxes, depreciation, amortization — a proxy for core operating profit. |
| **Adjusted vs reported** | "Adjusted" removes one-off items (stock comp, a legal settlement) to show "normalized" profit. Valuations and covenants usually use the *adjusted* figure. |
| **LTM** | "Last Twelve Months" — a rolling one-year total, vs a single quarter. |
| **ARR** | Annual Recurring Revenue — annualized value of subscriptions (SaaS). A lender has none. |
| **NRR / NDR** | Net Revenue / Dollar Retention — how much existing customers grow (>100% = expanding on their own). |
| **Gross margin (and why it's not universal)** | Revenue minus the direct cost to deliver. For SaaS that's hosting; for a lender the look-alike is interest earned minus cost of funds — a *different* thing. |
| **Burn / runway** | Burn = cash lost per month. Runway = roughly cash ÷ monthly burn (months of cash left). |
| **Covenant / covenant headroom** | A promise in a loan (e.g. keep leverage below a limit). Headroom = the cushion before breaking it. |
| **Net interest margin (NIM)** | For a lender, interest earned minus interest paid, as a % — the lending "spread." |
| **Net charge-off rate** | For a lender, the share of loans written off as uncollectible. |
| **Watchlist** | The internal list of companies showing stress. |
| **Value-creation plan (VCP)** | The roadmap of initiatives to grow a portco's value, with target KPIs. |
| **Board pack** | The PDF a company sends its board each quarter — the raw input here. |
| **ILPA** | The industry body whose standardized templates LPs expect for quarterly fund reporting. |
| **Provenance** | The stored proof behind each number: file, page, original label, exact sentence, confidence. |
| **RAG status** | Red / Amber / Green traffic-light coloring (not the AI "retrieval" meaning). |
| **Canonical metric / normalization** | One agreed internal name for a metric many companies label differently. |
| **Label drift / definition non-equivalence** | Same metric different names / same name different meaning. |
| **Basis** | The time window or accounting rule of a number (monthly vs quarterly, LTM vs quarter, reported vs adjusted). |
| **Grounded / cited LLM (RAG, MCP)** | An AI that answers *only* from your data and shows the exact source rows. RAG = answers from your data not memory; MCP = the standard "plug your data into the model" connector. |
| **Right-sized AI** | Use plain rules for the bulk; call the AI only for the genuinely ambiguous parts. Cheap, predictable, auditable. |

---

## 12. Open questions to discuss with Xavier

1. **D1 persona:** anchor firmly on Portfolio Ops, or Portfolio Ops + deal teams jointly? (See §5 discussion.)
2. **Interview date:** you said ~4–7 days of runway. What's the actual interview date? The deck is due
   **48h before** — this sets the roadmap horizons and the front-end build budget.
3. **Deck tool:** Google Slides, PowerPoint, or something else for Document iii?
4. **Demo appetite (revisit later):** when we reach Document ii, do you want a real working cockpit
   (self-contained HTML wired to the actual data), or a polished clickable mockup? (Deferred, per your call.)
5. **D4 stretch:** is the "chat with your portfolio" worth the extra build for this audience, or keep it
   as a roadmap slide only?

---

### Next step
Once you record D1–D3 (and optionally D4) in the Decision Log (§2), I'll:
1. Write **Document i — Context & Problem** (business framing, tailored to Sagard).
2. Write **Document ii — Prototype & Front-End** (what it does, how it works, limits, the demo design;
   future expansion at the end).
3. Prepare **Document iii — Slides** (last).

Until then, nothing is locked. Take your time with the trade-offs.
