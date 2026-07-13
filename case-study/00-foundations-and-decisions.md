# Document 0 — Foundations & Decision Brief
### Sagard "Portfolio Metrics Assistant" — Business Case Study (2nd round)

> **Status:** the four core decisions **D1–D4 are now LOCKED** (Xavier, 2026-07-09). A few *sub*-choices
> remain open on purpose: the metric sub-decisions **D2a–D2f** (§6A.4) and the new **D5** reconciliation
> policy (§4.2.1). Everything else below is settled and feeds straight into the persuasive documents.
> **Scope decision (2026-07-09):** the case study is scoped to the **equity / PE monitoring path**.
> Private credit is **not** dropped — the tool first *classifies* each pack as equity or credit (new
> §4.5) and can monitor credit **longitudinally** as a documented **extension**; v1 simply builds and
> demos the PE path.
> **Purpose:** Define the business problem, the domain, and the key choices *before* we write the
> persuasive documents (Context, Prototype, Slides).
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
> thing, and to make every number *traceable* back to the exact source **file** it came from
> (file-level today; page/snippet-level is a roadmap upgrade).

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
| (c) Trust the numbers and trace them to source | Every number carries its **source file**, original label, and confidence today; exact page/sentence is the roadmap upgrade |

---

## 2. Decision Log (the summary — fill this in)

Each decision is explained in full later. This table is the at-a-glance version. **My recommendation is
shown, but the choice is yours.**

| # | Decision | Options (short) | My recommendation | ✅ Your choice (2026-07-09) |
|---|----------|-----------------|-------------------|---------------|
| **D1** | Anchor **workflow + persona** | A Monitoring · B Watchlist · C Valuation · D LP-reporting · E Board-pack · F Covenant | **A — Quarterly monitoring (Portfolio-Ops)** | ✅ **A**, *plus explore **B** (watchlist) as a coexisting panel* |
| **D2** | **Metric set + philosophy** | A SaaS core-six · B Tiered · C Thematic · D Minimal · E Union · F ILPA | **B — Tiered (universal + sector packs + raw tail + derived)** | ✅ **B** |
| **D3** | **Automation ladder** (what we automate vs keep human) | Rungs 1–2 · **1–4** · 1–5 · 1–6 | **1–4 — "Monitoring Cockpit"** | ✅ **1–4 now**; rungs **5 & 6 = future extension** (options in §7) |
| **D4** | **Output / front-end** (build deferred) | A Cockpit · B Trend · C Heatmap · D Exceptions · E One-pager · G Chat · H Export | **A cockpit (primary) + G chat (stretch) + E fallback** | ✅ **A**, *may fold in **B** (trend) + **C** (heatmap) as its panels* — build still last |
| **D5** | **Reconciliation policy** (roll-up vs standalone) | A Company-wins · B Cross-validation flag · C Additive-only | *see §4.2.1* | ☐ **OPEN** — you will decide |

> **Note on D4:** you confirmed the front-end is defined **last** — the point right now is the *problem*,
> the *metrics*, and *who it is for*; the presentation can be reshaped later. D1's B and D4's B/C are all
> things that *coexist with A* (each is a panel/mode of the same cockpit), so "explore B/C" costs us
> nothing to keep on the table. We lock the actual build when we write Document ii.
>
> **Still open on purpose:** **D5** (reconciliation policy, §4.2.1) and the metric sub-decisions
> **D2a–D2f** (§6A.4). These are genuine judgment calls left for you.

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

**Who this tool helps most — the scope ranking (`this is the tailoring decision`).** The personas do
**not** benefit equally. **The ranking axis is how *objective* their use of the numbers is:** a
deterministic tool helps most where the work is repetitive and rule-based (collect → normalise →
compare → check-against-threshold) and least where the core output is a *judgment* (a valuation mark).
We rank all five and build for the top of the list:

| Rank | Persona | How the tool serves them | How objective is their job? | Fit |
|---|---|---|---|---|
| **1 — Primary** | Portfolio Operations / Value-Creation | *Is* the quarterly monitoring loop — collect, normalise, compare every metric × company × quarter; the manual grind we remove | Highly objective + repetitive → **most automatable** | ★★★ |
| **2 — Strong secondary** | Investment / deal partner | *Through the same monitoring output* — board prep + follow-on on companies **already owned** (NOT the bespoke diligence that closes a *new* deal) | Wants a fast objective read; *consumes* the loop's output, doesn't run it | ★★ post-close |
| **3 — Good fit, scope-limited** | Private-credit / risk analyst | Covenant checks = "is ratio X inside threshold Y?" — a deterministic rule the tool can evaluate and flag | Very objective (rule-based) **but only 1 lender in the corpus → no benchmarking; proof-of-range, not a demo anchor** | ★★ (thin data) |
| **4 — Downstream (assembly)** | Investor Relations / LP-reporting | Supplies locked, source-traceable numbers to drop into the standard (ILPA) template | Assembly is objective, but the output is *external + consequential* → needs human sign-off | ★ inputs + assembly |
| **5 — Downstream (judgment)** | Fund finance / Valuations | Feeds **audit-defensible, basis-tagged inputs** the mark is built from | **The mark is *subjective* — a person must weigh multiples, comparables, and judgment; the tool supplies the inputs, never the mark** | ★ inputs only |

**Assumption:** v1 targets the *internal, deterministic, high-frequency* monitoring job — the **objective**
work that can be automated *without judgment*. So the persona whose whole job **is** that loop (Ops) is
helped most; personas whose core output is a **subjective judgment call** (a signed NAV mark) or an
*external, consequential* document (an LP table) keep the human in the loop and gain only *cleaner,
traceable inputs*, not automation. **We automate the objective; we assist the subjective.**

**Trade-off (why this, not the flashier pick):** anchoring on Ops trades a *sexier* claim ("we support
your NAV marks" / "we help you win deals") for a *provable* one. The flashier angles either lack corpus
evidence (no EBITDA/multiples for a valuation demo — see §6A.2) or would over-claim (deal-closing runs
on bespoke diligence, not standardized packs). **We lead with the claim the data can back.**

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
> done, the sheet is stale, error-prone, and **nobody can quickly trace a number to the file it came
> from.** Trust is low.

The pain is not "reading PDFs is hard." It is **reconciliation, comparability, trust, and time** — every
quarter, forever.

**Scope of this case study (decided 2026-07-09).** That vignette mixes two *different animals* — a SaaS
company and a **lender** — whose numbers must **never** share a column. That is exactly why step one of
the tool is to **classify each pack** as **equity / PE** or **private credit** (new §4.5) and tag every
company with its path. **This case study is scoped to the equity / PE monitoring path** — the 8
equity-held operating companies. Private credit is **not thrown away**: the classifier isolates it, and
because we are building a *monitoring* tool for the portfolio & operations team, the same engine can
monitor the single lender **longitudinally** (against its own prior quarters) as a documented
**extension** (§4.5, §6A.3). We *build and demo* PE; we *design for* credit. Why this narrowing: one
lender can't be benchmarked, and the equity book is where the cross-company comparison story actually
lives — so scoping to PE buys sharpness without discarding the multi-strategy reality.

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
   alone renames its revenue line 3 times across its 5 quarters.
2. **Definition non-equivalence** — same name, *different meaning*. **This lives inside the equity book,
   not just at the credit border:** "Gross Margin" is composed differently by each SaaS company
   (CarbonTrack *excludes* customer-success + data-science costs; MediSight *excludes* implementation +
   CS; NovaCloud/TalentVault/ConstructIQ state **no** definition at all — a *silent* basis). "Take rate"
   is worse: FleetLink's is a **% of GMV** while ClearPay's is **basis points of TPV** — the same word on
   two scales ~25× apart. Comparing any of these by label is confidently wrong. *(The most extreme case
   — a lender's "Gross Margin" = interest income minus cost of funds, a lending spread — sits on the
   credit path the classifier routes out of v1; §4.5.)*
3. **Metric renames over time** — a company relabels its **own** metric between quarters. The equity
   headline: **NovaCloud renames its revenue line 3 times across its 5 quarters** (Total Billings →
   Recognized Revenue → Net Revenue → *back to* Recognized Revenue); MediSight drifts on its ARR label too. The
   trend line **silently breaks** unless you stitch the aliases. *(The credit book shows the identical
   pattern — LendBridge's "Net Charge-off Rate" ↔ "Credit Loss Rate", declared equivalent in a footnote
   — evidence the mechanism is universal, not a one-off.)* Traps 1 + 3 together are the **label-drift
   family**; the solution design is §4.2.1.
4. **Missing vs Not-Applicable (N/A)** — **again visible inside the equity book:** FleetLink (a freight
   *marketplace*) and ClearPay (a *payments* company) legitimately have **no ARR and no NRR** — those are
   subscription-SaaS metrics that simply don't apply. Your current tool flags them as *"missing core
   metric"* — a **false alarm** that overstates a data problem. "Missing" (should exist, wasn't found)
   and "N/A" (never applies to this business model) are different, and conflating them destroys trust.
   The fix is a **per-model expected-metric profile** (§6 D2). *(The lender is the loudest N/A case — no
   ARR/cash/monthly-burn at all — which the §4.5 classifier handles by routing it to the credit profile.)*
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

### 4.2.1 How we defeat these traps — solution design (with trade-offs)

> You flagged the **label-drift family (traps 1 + 3)** and the **basis traps (trap 5)** as the biggest
> challenges and asked for *extra effort on solutions*; **trap 6 (reconciliation)** you left as an open
> decision. This section answers all three. Every mechanism is **additive** over the current tool and
> **leads with the deterministic option** — the LLM is reserved only for the genuinely ambiguous tail.
> *(All numbers below are verified against `outputs/parsed/` on 2026-07-09.)*

#### Trap 1 + 3 — label drift: many names → one canonical series

**Why it is hard.** The label alone lies. *Silent basis*: "Gross Margin" / "Net Revenue" / "ARR" carry
no definition — same word, different machine (SaaS delivery margin vs a lender's interest-minus-cost-of-funds
spread; marketplace %-of-GMV vs payments bps-of-TPV take-rate). *Prose-only*: some MediSight metrics live
in sentences, not tables (Q1'25 headcount 114 is footnoted "disclosed in commentary; not separately
tabled"), so a table-row match misses them. *Footnote-only renames*: NovaCloud's revenue line runs **Total
Billings $5.8M → Recognized Revenue $6.5M → Net Revenue $7.2M → Recognized Revenue $7.9M → $8.4M**
(Q2'24→Q2'25). Only the Q4'24 footnote ("Net Revenue is equivalent to Recognized Revenue in prior
periods") declares an equivalence — and it covers *only* the Net-Revenue↔Recognized-Revenue edge; the
Total-Billings→Recognized-Revenue rename is **undeclared** (NovaCloud's Q2'24 footnote *does* tie Total
Billings to ASC 606 recognized revenue — but only if you read it). Miss the footnote and the trend silently
splits on the label alone.

**(a) Registry + per-company alias map.** Two layers, stored as **human-owned data** (not code): canonical
IDs + alias entries scoped `global → sector → company`, each carrying `{unit, basis, confidence, source,
effective-periods}`. The existing 8 canonical IDs are unchanged and keep resolving identically; new
asset-class metrics (e.g. `credit.net_charge_off_rate`) are **added** as new namespaced IDs current
consumers ignore — additions, never edits to the 8. Company scope wins, so "Net Revenue" resolves to
revenue for NovaCloud but never merges with marketplace "Net Revenue (take-rate based)".

**(b) Footnote-equivalence stitching.** A deterministic scanner reads the company's own declaration phrases
("equivalent to", "formerly", "terminology updated") and writes a **bidirectional, transitive equivalence
edge** into the map — the highest-authority *automatable* signal. It collapses the **declared** edges:
NovaCloud's Net-Revenue↔Recognized-Revenue and both LendBridge round-trips (Net Charge-off Rate ↔ Credit
Loss Rate; Pre-Provision ↔ Adjusted Operating Margin), repairing those trend lines. Two limits it must
respect: (i) an **undeclared** rename (NovaCloud Total Billings→Recognized Revenue) has no footnote → it
falls to the fuzzy/human layer, never a silent merge; (ii) a footnote can *claim* equivalence while the
basis differs — MediSight declares "Expansion ARR %" ≡ "ARR from Existing Accounts", but the labels imply
different numerators, so map the label yet raise a **basis-change break** for a human.

**(c) Detecting a new / unknown label — deterministic first.**

| Approach | How it works | Trade-off | Verdict |
|---|---|---|---|
| Deterministic alias table | Exact match after cosmetic normalization (case / & / spaces) | Zero-cost, auditable; only knows *seeded* labels | **Lead** — handles the bulk |
| Footnote-declared equivalence | Regex on the company's own declaration phrases | Highest authority, free; misses *undeclared* renames | **Lead** — auto-suggest, human ratifies |
| Fuzzy / embedding match | Nearest known alias by string / vector similarity + score | Catches near-misses; risks false friends (SaaS vs lender GM) | **Assist** — gated by scope + unit/basis; queue only |
| Constrained-LLM suggest | LLM picks only from the registry or returns "unknown"; cites the snippet | Handles prose / novel tail; slow, non-deterministic, costs | **Last resort** — ambiguous cases only, human-approve |

**(d) Confidence, rulebook, queue.** Every resolution stamps `confidence + resolution_method`. High/medium
rows export exactly as today; low-confidence rows **still export** with `review_status=pending` and are
withheld only from *aggregation/comparison* until cleared — no row the current tool emits ever disappears.
The **rulebook** (aliases + equivalence edges + sector/basis map) is human-owned and versioned: the machine
*applies* it every run, humans *edit* it; an approved queue item becomes permanent, so a rename is ratified
**once** and never re-asked.

**Retrocompat (additive).** The 8 canonical IDs resolve identically; today's flat `ALIASES` list becomes
the `global` default layer that per-company/sector maps override. Reuses the existing `confidence` /
`metric_basis` columns and appends only optional columns (`resolution_method`, `alias_scope`,
`equivalence_ref`, `review_status`) current consumers ignore. **Rejected:** global fuzzy auto-merge
(manufactures the false comparison the tool exists to prevent) and LLM-first (cost, non-determinism, loses
the rulebook's audit trail).

#### Trap 5 — basis / unit normalization (periodicity · restricted cash · FX · LTM-vs-quarter)

**Mechanism spine (all four sub-traps).** Give every metric a **mandatory basis-tag**
`{periodicity, currency, scope}` from a fixed vocabulary; run small **deterministic normalization
functions** that write a *new* `value_normalized` (**never overwrite the raw** `value`); use a dated **FX
rate table** for currency; and **refuse-to-derive** — any computed metric (e.g. runway = cash ÷ burn)
first checks its inputs share a compatible basis, else emits a *flag* instead of a wrong number.

Concrete fix per sub-trap (verified corpus figures):
- **Periodicity** — ConstructIQ "Quarterly Net Burn" **$0.91M ÷ 3 = $0.30M/mo**; runway $11.2M ÷ $0.30M ≈
  **37 mo** — not the **~12 mo** you get by reading $0.91M as monthly (≈3× error; the pack's own narrative
  even prints "approximately 12 months").
- **Restricted cash** — ClearPay "Cash & Restricted Cash" **$38.4M** − **$6.2M** segregated client float =
  **$32.2M** operating cash (stated verbatim; footnote excludes restricted from liquidity/runway). Keep the
  headline raw; normalize the `cash` used for runway to operating.
- **Currency / FX** — PeopleFlow reports GBP: FX-convert *levels* (Revenue 5.1M, ARR 21.4M) via the rate
  table; but **NDR 118% is an LTM ratio computed in GBP** — tag it, do **not** FX-convert a percentage.
- **LTM vs quarter** — tag NRR/logo-churn `periodicity=LTM`, revenue `=quarterly`, ARR `=period_end`
  (annualized run-rate — never ×4); the tag blocks silent mixing.

| Approach | How it works | Trade-off | Verdict |
|---|---|---|---|
| Auto-normalize silently | Convert all to one basis, emit one number | Fast, but hides guesses and destroys file-traceability; a silent wrong basis = the 3× runway error | **Reject** |
| Normalize + show both + flag | Keep raw `value`, add `value_normalized` + basis-tag + flag | Wider output (extra columns); fully auditable | **Adopt (default)** for deterministic-safe cases |
| Refuse & ask human | Emit no derived value when basis is unknown/mismatched; route to review | Some cells return empty and need a person | **Adopt (fallback)** for silent/unknown basis |

- **Why hard:** the basis lives in footnotes/prose, not in the number — and is sometimes **silent** (no
  stated basis), where deterministic rules cannot infer it and guessing is dangerous.
- **Honest FX limit:** a converted figure traces to the *pack + an external rate*, so it is **not purely
  file-traceable**; we record `fx_rate`, `fx_source`, `fx_date` to keep it auditable.
- **Retrocompat:** `metric_basis` and `unit` already exist. We only *append* `value_normalized` /
  `currency` / `fx_*` columns and harden `metric_basis` to a controlled vocabulary — raw `value`/`unit`
  stay as-reported, so consumers keying columns by name are unaffected.

#### Trap 6 — cross-document reconciliation  `[D5 — OPEN, you decide]`

**The situation.** `Portfolio_Snapshot_Q2_2025` restates the *same* numbers under *different labels*
(NovaCloud `ARR (End of Period)` → `Annual Recurring Revenue`; `Cash Balance` → `Cash`; `Total Headcount`
→ `FTE` — values identical). Plus the display-layer swap (the MediSight/TalentVault header mix-up) the
pipeline still routed correctly. So a roll-up is a *second witness* to overlapping numbers — and a place
bugs can hide. The tool already **detects** overlaps today; the open question is **what to DO with a
mismatch.**

> **Corpus caveat (honest):** on today's inputs *every* cross-document overlap **agrees** — there is **no**
> genuine value conflict anywhere in the corpus. So option B's near-term payoff is making silent agreements
> **visible** (free confirmation), not resolving live conflicts.

| Option | How it works | Trade-off | Verdict |
|---|---|---|---|
| **A. Company-wins + add** *(today)* | Standalone wins any value conflict; roll-up may only *add* fields the standalone omits | Safe and simple, but a real conflict lands only in an issue log reviewers rarely open | Keep as the **floor** |
| **B. Cross-validation flag** *(your idea)* | Same value still wins, but every overlap is promoted to a visible **reconciliation status**: `agree` / `mismatch` (showing both sources + files) | One extra field; needs a tolerance rule so rounding gaps don't cry wolf. The equality check is **deterministic** — no LLM | ✅ **Recommend** — layer on A |
| **C. Additive-only, never compare** | Roll-up fills gaps only; overlaps never checked | Zero conflict noise, but removes the conflict-logging the tool has today → **not additive** | Discard |

**Recommendation — A as base, B on top.** The audit-ready persona (fund-finance / valuations) wants
*reconciled, traceable* numbers: a roll-up that agrees is free confirmation; one that disagrees is exactly
the signal they want. The check is objective, cheap, auditable. **Assumptions:** standalone stays
system-of-record and always wins the emitted *value*; `agree`/`mismatch` is a value-equality test, **except**
where a captured basis differs (monthly-vs-quarterly burn → tag `basis-difference`, not conflict);
`reconciliation_status` is a **new optional** field, so every emitted value and existing key is unchanged.
Provenance stays **file-level**.

`☐ YOUR DECISION (D5 — reconciliation policy): __________________________________`

### 4.3 What insights this exact data can prove (for the demo)

**Over-time (needs multi-quarter companies):**
- **NovaCloud efficient-growth story:** ARR compounded ~$24M → $34.2M over 5 quarters (+42%), gross
  margin 74% → 78%, retention rising, monthly burn shrinking — *yet* cash drew down $29.5M → $19.6M
  (a runway-pressure story despite improving unit economics).
- **LendBridge credit trend `[credit-path extension — not the v1 demo anchor]`:** loan book $274M →
  $316M, net-interest-margin 8.6% → 9.4%, charge-off rate improving 3.9% → 3.1% — *and* it demonstrates
  the rename trap (Credit Loss Rate ↔ Net Charge-off Rate) and a **non-monotonic** covenant headroom
  (+125 → +118 → +132 → +148 bps: it *dipped then widened*, a nice "trust the data, not the narrative"
  moment). **This is the proof that the same monitoring engine can track credit *longitudinally* once the
  classifier (§4.5) routes it to the credit path — the documented extension. v1 builds/demos PE; this
  bullet shows the credit path is real, not vapor.**

**Cross-company (Q2'25 slice):**
- **NRR (retention) league:** NovaCloud 123%, CarbonTrack 121%, TalentVault 119%, PeopleFlow 118%,
  ConstructIQ 112% — ConstructIQ is the laggard *and* has the highest SaaS churn (6.3%), an at-a-glance
  outlier — *with the guardrail that LendBridge is walled off (a lender has no NRR).*
- **Financing-risk flag:** ConstructIQ — ~12-month runway, evaluating a Series B (fundraise) — the only
  explicit raise signal; doubles as the quarterly-vs-monthly-burn trap demo.

**Trust / provenance:**
- Click NovaCloud's revenue → show its raw labels (renamed 3 times across 5 quarters) collapsed into one
  column, each traceable to its **source file** (file-level today; page/snippet-level is a roadmap item).
- Show the snapshot restating NovaCloud under different labels, and the company report winning.

> **Operational reality:** the current `outputs/` were generated on only **3 of 24** PDFs (26 metric
> rows). We must **re-run the full 24-PDF export** before any demo. The code already supports it; it just
> needs running.

### 4.4 The two monitoring paths — equity (PE) vs private credit

The 10 companies are **not one uniform book.** Reading each report's own words, they split into **two
monitoring paths** that speak different metric languages. This is the split the interviewer will ask
you about, so here it is, grounded in the documents:

| Company | Business model (from its own report) | Metric language | Path |
|---|---|---|---|
| NovaCloud, CarbonTrack, MediSight, PeopleFlow, TalentVault, ConstructIQ | SaaS (subscription software) | ARR, retention, burn | **Equity / growth** |
| FleetLink → ApexFreight | Marketplace (freight) | GMV, take-rate, contribution/shipment | **Equity / growth** |
| ClearPay | Payments / fintech | TPV, take-rate (bps), restricted cash | **Equity / growth** |
| LendBridge | Specialty lender (SME working capital) | interest income, loan book, charge-offs, covenants | **Private credit** |
| Portfolio_Snapshot | *not a company* — a roll-up of the others | — | — |

So the mix is **8 equity / growth operating companies + 1 private-credit lender + 1 roll-up.**

**Two honest limits — state these; they are credibility, not weakness:**
1. **We can read what each company DOES, but not how the fund HOLDS it.** The packs describe the
   business model, but they do **not** disclose the ownership stake — so we cannot say "this one is
   venture, that one is buyout." We monitor what the company *reports*, not the fund's position.
2. **"PE" here = the equity-held operating book, and it reads as GROWTH / venture equity** (young,
   ARR-driven, unprofitable — ConstructIQ is even "evaluating a Series B"), **not classic buyout PE.**
   The packs contain **no EBITDA, no leverage, no buyout debt** — which is *why* classic-buyout metrics
   are deliberately out of scope (see §6A.2 discards).

**Why the split is the whole point:** Sagard is **multi-strategy** — it runs equity *and* private
credit under one roof. So an equity company's "gross margin" (cost of delivering software) and
LendBridge's "gross margin" (interest income minus cost of funds) land in the **same portfolio view,
under the same word, meaning completely different things.** The two-path metric design in §6A is what
stops the tool from ever placing them on the same axis.

**How the split is enforced + scope:** the tool does **not** ask a human which path a company is on — a
deterministic **classifier (§4.5)** reads each pack's *metric fingerprint* (ARR/NRR → equity; loan
book/NIM/charge-offs → credit) and assigns the path automatically, then tags the company. **v1 is scoped
to the equity / PE path** (8 companies, where cross-company comparison actually exists); the private-credit
path is fully **designed** (§6A.3) and **monitorable longitudinally** as the documented extension — not
built or demoed in v1.

### 4.5 PE-vs-private-credit classifier add-on (metric-fingerprint router)

**Why.** Sagard runs equity AND credit under one roof, and the two paths speak largely disjoint metric
languages (§4.4). Before the tool can pick the right metric set (§6A.2 vs §6A.3) and wall off cross-path
comparison, each intake pack must be **tagged** with its path. This add-on adds a *label only* — it never
touches a value.

**Deterministic core.** Route on each path's **unique anchor token(s)** and **ignore** tokens shared across
paths (gross margin, recognized revenue, cash, headcount, and "take rate" — which appears in *both*
marketplace and payments, differing only by base). Anchors: `ARR / NRR-NDR / logo churn / expansion` ⇒
**equity·saas**; `completed shipments` (GMV / take-%-of-GMV) ⇒ **equity·marketplace**; `TPV / client-float
cash / bps take-rate` ⇒ **equity·payments**; `loan book / NIM / provision coverage / covenant headroom` ⇒
**private_credit**.

**Feasibility (high, verified).** Each path carries at least one anchor no other path uses, so exactly one
path fires per pack. Checked on the 4 latest-quarter packs: NovaCloud fires only SaaS (ARR $34.2M, logo
churn 5.8%); ApexFreight only marketplace (completed shipments 1.28M; take rate 11.2% of GMV); ClearPay
only payments (TPV $3.42B; 43bps; $6.2M client float); LendBridge only credit (loan book $316M, NIM 9.4%,
charge-off 3.1%, covenant +148bps). Assuming anchors stay unique across all 24 packs, one confident hit per
pack ⇒ ~100% accuracy *by construction* (not a modeled estimate). **Exception:** the Portfolio_Snapshot
roll-up spans 4 companies — here all four are SaaS so it fires equity·saas cleanly, but a roll-up that ever
included a lender would fire ≥2 paths and must route to the fallback below.

| Approach | How it works | Trade-off | Verdict |
|---|---|---|---|
| **Deterministic fingerprint** *(lead)* | Match pack labels to each path's unique anchor token(s); take the sole path that fires | Assumes anchors stay unique; a new model, a tie, or a mixed roll-up needs a fallback | **Ship — v1 default.** Cheap, auditable, no API cost |
| LLM classifier | Ask the LLM "equity or credit?" per pack | Overkill here; per-pack cost, non-deterministic, harder to audit | **No as primary** — ambiguity only |
| **Hybrid** *(adopt)* | Deterministic first; escalate to LLM **only** on a tie/no-hit (a co that BOTH lends AND sells SaaS, or a mixed roll-up); a human confirms | One extra branch; the LLM leg stays dormant until a mixed pack arrives | **Adopt.** Deterministic runs today; LLM is the documented safety valve |

**Storage (additive, file-level).** Append nullable columns after `notes` (`portfolio_path` =
`equity | private_credit`; optional `business_model` = saas/marketplace/payments/specialty_lender), and one
optional per-company path map in the JSON metadata. Existing 8-metric columns/keys and every current
consumer are untouched; legacy/unclassified rows default to null. The tag drives (a) which metric set fires
and (b) the guardrail that never places a lender's GM (an interest-minus-cost-of-funds spread) beside a SaaS
GM (delivery margin).

**Credit scope.** The corpus has **one** lender, so v1 **builds** the equity path (8 operating cos) and only
**documents** credit (§6A.3) — no peer to benchmark. The classifier still tags LendBridge today, and its
credit metrics are longitudinal (LendBridge vs its own 5 prior quarters), so **enabling the credit view
later is a display flip over data the same engine already emits — no new extraction.** A 2nd lender unlocks
cross-credit benchmarking. *(This is exactly the "monitor both over time" extension you asked about.)*

---

## 5. DECISION 1 — Anchor workflow + persona  `[✅ LOCKED 2026-07-09 — A, + explore B as a panel]`

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

### Points resolved (2026-07-09)
1. **Persona emphasis → anchor Ops; deal teams are the heavy *secondary* consumer.** The cockpit is built
   for the Portfolio-Ops monitoring loop; the deal partner reads its output (board prep / follow-on), so
   we get both without over-claiming.
2. **Credit angle → resolved by scope, not by emphasis.** Rather than "feature LendBridge as a segment,"
   the tool now **classifies** each pack (§4.5) and **routes credit onto its own path**. v1 is scoped to
   PE; credit is the documented **extension** (monitorable longitudinally, §6A.3). Cleaner story, no
   over-claim on a single, un-benchmarkable lender.
3. **Breadth vs sharpness → agreed.** Every screen **leads with provenance** and shows the tool
   *refusing* unsafe comparisons — that is the moat vs generic BI.

**Also explore (Xavier, D1 = A + B):** fold **Option B, Watchlist / early-warning**, in as a *panel* of
the cockpit (it already sits downstream of A — the exception layer is nearly free once rungs 1–4 exist,
§7). A and B **coexist**: A is the full monitoring view, B is the "what needs a look" cut of the same data.

`✅ YOUR DECISION (D1): A (Quarterly monitoring / Portfolio-Ops anchor, deal teams secondary) + explore B (Watchlist) as a coexisting panel.`

---

## 6. DECISION 2 — Metric set + philosophy  `[✅ LOCKED 2026-07-09 — B, Tiered]`

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

`✅ YOUR DECISION (D2): B — the Tiered model (universal core + sector packs + raw tail + derived), with per-sector expected-metric profiles. Concrete metric sets per path are built in §6A; sub-choices D2a–D2f remain open (§6A.4).`

---

## 6A. Metric sets by path (operationalizing DECISION 2)  `[reference — feeds D2]`

DECISION 2 chose the *philosophy* (tiered). This section is the *concrete instantiation*: the actual
metric set for **each path**. It was built by a multi-agent pass that (1) researched the standard
metric vocabulary for each path, (2) **read every corpus PDF** to keep only metrics that are genuinely
extractable, and (3) ran an **adversarial critique** that caught and corrected real errors — a false
arithmetic reconciliation, two non-reproducible formulas, an over-claimed "anchor," and stale evidence.
Those corrections are already baked into what follows.

### 6A.1 How to read these sets — and the answer to "why this many metrics?"

The interviewer will ask **"why did you pick this number of metrics?"** The answer is a principle, not
a count:

> **The set is bounded by EXTRACTABILITY, not by ambition.** A grep audit confirms these are
> **KPI / board packs** — a revenue line, a margin percent, ARR, retention, cash, burn, headcount —
> with **no income statement, balance sheet, or cash-flow statement.** So the set is exactly: a **small
> universal core** every company reports + **sector packs that fire only when that model has them** + a
> **derived tier that refuses to compute** when the inputs aren't there. Nothing enters unless it
> **traces to a source file.** That discipline — not a target number — sets the count.

Conventions:
- **`core` vs `optional`** — core = reported by (almost) all companies on the path and safe to lead
  with; optional = partial coverage or derived, kept but flagged.
- **basis-tag** — the specific comparability landmine the tool must neutralise *before* two numbers can
  sit side by side (currency, periodicity, definition, restricted cash…). **This tag is the product.**

> **Provenance honesty:** the current parser gives **file-level** provenance ("this number came from
> *this document*"), **not** page/snippet level (the parsed files record `Page level: no`). So say
> "traceable to source **file**," not "source page," until snippet-level provenance is built. It's a
> roadmap item, not a shipped claim.

### 6A.2 The PE / equity metric set

**Philosophy (one line):** monitor operating **quality** (growth, retention, cash durability,
efficiency) from what equity-held companies actually report — never buyout value-creation levers,
because the packs don't carry them.

**Tier 1 — Universal core (reported by every equity company)**

| Metric | Plain meaning | Why chosen / evidence | Basis-tag (the landmine) | |
|---|---|---|---|---|
| Recognized (Net) Revenue | Money actually *earned* this quarter — not cash collected, not total volume | Backbone of the whole set; all 8 report a revenue line | revenue-basis (billings-vs-recognized; net-vs-GMV/TPV; bundled-vs-single-line) **+ currency (PeopleFlow GBP)** | core |
| Total Headcount (FTE) | Number of full-time staff; denominator for efficiency | Only near-universal operating figure; base for per-employee metrics | sourcing (some quarters put it in prose, not the table) | core |

**Tier 1b — Reported but NOT comparable (display only — DO NOT RANK)**

| Metric | Plain meaning | Why it's here (and walled off) | Basis-tag |
|---|---|---|---|
| Gross Margin % | Cents left from each revenue dollar after direct delivery cost | The **flagship thesis proof** — everyone reports it, nobody defines it the same way | gross-margin-composition: CarbonTrack excludes customer-success + data-science; MediSight excludes implementation + CS; NovaCloud/TalentVault/ConstructIQ give no definition (silent basis); marketplace & payments use different bases. **Component costs are disclosed nowhere → it can NEVER be normalised. Show it; never rank it.** |

**Tier 2 — Liquidity & cash durability (common, not universal — 5/8 cash, 4/8 burn)**

| Metric | Plain meaning | Why chosen / evidence | Basis-tag | |
|---|---|---|---|---|
| Spendable Cash | Money the company can actually spend now — the survival number | Base for runway; the restricted-cash carve-out is a direct thesis demo | restricted-cash (ClearPay's $38.4M includes $6.2M client float → operating cash $32.2M) | core |
| Net Burn (normalised to monthly) | How much cash it loses per month — the speed runway shrinks | Input to runway; the periodicity conversion is a headline trap | burn-periodicity (ConstructIQ reports **quarterly** $0.91M ≈ $0.30M/mo — looks *bigger* than NovaCloud's $0.75M/mo but is ~3× smaller); burn-exclusions (SBC/one-off differ) | core |

**Tier 3 — SaaS recurring-revenue pack (fires only for the 6 subscription names)**

| Metric | Plain meaning | Why chosen / evidence | Basis-tag | |
|---|---|---|---|---|
| ARR | Yearly value of active subscriptions at a point in time | The number SaaS leads with; base for growth & per-employee | arr-definition (contracted vs run-rate vs MRR×12); currency (PeopleFlow GBP); label-drift | core |
| Net Revenue Retention (NRR/NDR) | Of last year's recurring revenue from existing customers, how much remains after upgrades − downgrades − churn | Best "is the product sticky & expanding?" signal | nrr-definition; **currency (PeopleFlow's "Net *Dollar* Retention" is computed in GBP)**; cross-quarter conflicts | core |
| New-logo additions | New customers won this quarter (counted, usually in commentary) | Separates *new-logo* growth from *expansion* growth — NovaCloud's own top risk is "new-logo momentum below target"; also gives MediSight a signal | sourcing (commentary vs table) | core |
| Expansion revenue / mix | Extra recurring revenue from *existing* customers ($ or % of revenue) | The flip side of NRR and the only stickiness read MediSight gives (expansion %) | expansion-definition (Trap E: MediSight rename asserts equivalence across different numerators) | core |
| Gross Revenue Retention (GRR) | Like NRR but ignores upgrades (caps at 100%) — pure customer loss | Isolates leakage expansion can hide | coverage (only TalentVault reports it) | optional |
| Logo Churn | Share of *customers* (not dollars) lost | Catches a failure mode dollar-NRR hides | (window: all effectively LTM — a *non*-landmine, don't over-flag) | optional |
| Customer / Unit Count | How many paying customers | Denominator for avg revenue/account; ARR sanity-check | counting-unit (6 incompatible units: entities vs logos vs seats vs accounts) | optional |

**Tier 4 — Sector packs: marketplace (FleetLink/Apex) & payments (ClearPay)**

| Metric | Plain meaning | Why chosen / evidence | Basis-tag | |
|---|---|---|---|---|
| Completed Shipments [MP] | Transaction volume on the marketplace | Read directly; the marketplace's real scale metric | volume-not-revenue | core |
| Take Rate — % of GMV [MP] | Slice of transacted value the marketplace keeps | **Read directly (10.8→11.2%)** — do *not* derive it | take-rate-base (% of GMV — **NOT** comparable to payments bps-of-TPV; ~25× apart) | core |
| Contribution Margin / Shipment [MP] | Profit kept per transaction after direct fulfilment cost | Marketplace unit-economics | sourcing (table vs commentary) | optional |
| TPV (Total Payment Volume) [PAY] | Total money processed — payments' version of GMV | Payments scale metric; never = revenue | scale-not-revenue | core |
| Effective Take Rate — bps of TPV [PAY] | The cut kept, in basis points (thin margins → bps) | Payments monetisation in its native unit | take-rate-base (bps-of-TPV — **NOT** the marketplace's %-of-GMV) | core |
| Net Revenue (take-rate based) [PAY] | The fees the payments co actually keeps — the peer-comparable figure | The only payments number that maps to "Revenue" | revenue-basis (unbundle: ClearPay $14.8M net vs $17.3M bundled total) | core |
| Restricted / Client-Float Cash [PAY] | Customer money held but not owned | Makes Spendable Cash & runway correct | restricted-cash | core |

**Tier 5 — Derived (tool-computed; REFUSES across mismatched bases)**

| Metric | Plain meaning | Why chosen / evidence | REFUSE condition | |
|---|---|---|---|---|
| Cash Runway (months) | Months until spendable cash runs out at current monthly burn | Survival horizon; the "when do we raise?" trigger | refuse if burn not monthly-normalised, if cash still includes restricted funds, or if either input missing | core |
| Revenue / ARR per Employee | Revenue (or ARR) each employee generates | Core efficiency / operating-leverage read | refuse to mix ARR-numerator with revenue-numerator; refuse cross-currency without FX; caution comparing across business models | core |
| ARR / Revenue Growth (QoQ; YoY only ≥5Q) | Growth vs prior quarter / same quarter last year | The core equity thesis; earliest accel/decel signal | refuse YoY unless ≥5 quarters; apply the rename-map first; watch restatements (PeopleFlow Q1 4.7→4.6M) | core |
| GMV (marketplace) | Total value transacted (platform keeps only its take) | Shown for context — but **NOT on any page** | back-derived (≈ revenue / take-rate) → flag as derived, never place beside SaaS revenue | optional |
| Rule of 40 | Growth % + margin % ≥ 40 (fast-growth vs burn balance) | Standard SaaS health glance | **no FCF leg in packs** → compute only after a single firm-wide margin proxy is pinned (see open decision D2b) | optional |

**Discarded from the PE set (why-not → revisit-when)**

| Metric (group) | Why NOT in v1 | Revisit when |
|---|---|---|
| EBITDA & Adjusted EBITDA | No income statement in the packs; a lone Non-cash D&A figure exists (FleetLink Q4'24, $0.9M) but with no operating income it **can't construct EBITDA**; "adjusted" add-backs are interpretive → violate determinism | A profitable/buyout co attaches an income statement with D&A |
| Net debt · Leverage (ND/EBITDA) · EV/EBITDA · Debt paydown · DSCR | Buyout/credit constructs; a credit *facility* is *referenced* (FleetLink Q4'24) but no debt balance/schedule and no EBITDA are disclosed; DSCR is a lender-to-borrower metric | A leveraged holding with a debt schedule + positive EBITDA enters; valuation file joined as a 2nd data plane |
| Operating/Net income & any P&L line below revenue | KPI packs carry no P&L below revenue | Packs attach a full income statement |
| COGS · Gross-profit $ · OpEx by function (S&M/R&D/G&A) | Only the gross-margin *percent* is reported — **this absence is *why* GM comparability is a trap** | Packs disclose the cost bridge / OpEx split |
| CAC & payback · LTV:CAC · Magic number · Burn multiple | Need an S&M line + new-logo counts + lifetime assumptions (absent/interpretive) | Packs add an S&M line + per-quarter new-logo count |
| Net New ARR / ARR bridge (new/expansion/contraction/churn) | No ARR waterfall is disclosed — only end-of-period ARR + NRR | Packs add the ARR bridge (**highest-value future unlock**) |
| Billings · Bookings · RPO · Deferred revenue | Need a balance sheet / deferred-revenue movement (absent) | Packs attach a balance sheet |
| Balance-sheet & cash-flow items (DSO/AR, current ratio, capex, OCF, **FCF**, gross burn) | Need statements the KPI packs lack; missing FCF is also why "true" Rule-of-40 margin can't be taken off the page | Packs attach balance sheet + cash-flow statement |
| Pipeline / weighted bookings | Reported by NovaCloud/TalentVault/ConstructIQ but management-estimated with differing stages/haircuts → not comparable | Only as an explicitly-flagged, non-ranked forward view |
| Customer concentration (top-N % of ARR) | Disclosed once (NovaCloud "top-10 ≈ 30% of ARR") — a single point, not a series | Disclosed consistently for ≥2 quarters |

**Assumptions behind the PE set (state these):**
- Equity companies = the "PE/equity path"; the corpus reads as **growth/venture** (ARR-driven,
  unprofitable), so v1 monitors operating quality, **not** buyout levers.
- Packs disclose **business model, not ownership stake**; we monitor what's reported.
- **Verified:** these are KPI/board packs, not financial statements (no P&L/BS/CF *statements*). Nuance:
  a lone D&A figure and a facility *reference* exist in footnotes — so "no financials" means "no
  statements," not "zero balance-sheet mentions."
- **"Comparable" = comparable only AFTER** rename-map + basis normalisation + FX + restricted-cash
  carve-out. Raw side-by-side numbers are non-comparable by default.
- **FX:** period-average rate for revenue flows, period-end for balance-sheet cash; GBP point-in-time
  metrics (PeopleFlow ARR/NRR) record the rate + source. FX-converted numbers trace to *pack + external
  rate* → **not purely file-traceable** (disclose this).
- **History:** MediSight & PeopleFlow have 3 quarters; CarbonTrack/TalentVault/ConstructIQ/ClearPay
  embed a Q1'25 comparative column in their Q2'25 pack → QoQ is broadly computable; YoY only NovaCloud.
  Over-time metrics return **"insufficient history,"** never a fabricated trend.
- **Pass-through rule:** a source-reported figure the tool can't itself recompute (e.g. MediSight's
  stated YoY growth) is **passed through with provenance and flagged "reported, not recomputed,"** not
  suppressed.
- Provenance is **file-level** (current parser). Corpus is **synthetic** — never imply real holdings.

### 6A.3 The private-credit metric set (LendBridge)

**Philosophy (one line):** with only **one lender** in the corpus, credit monitoring is
**longitudinal** (LendBridge vs its own prior quarters), **never** a peer benchmark — and the tool must
refuse to invent one. Corrected census: **7 core + 6 optional.**

**Tier 1 — Yield & return (what the loan book earns)**

| Metric | Plain meaning | Why chosen / evidence | Basis-tag | |
|---|---|---|---|---|
| Recognized Revenue | Total income booked — mostly interest earned | Cleanest, fully-reported line (5 qtrs: $10.1→12.7M) | revenue-basis-unconfirmed (interest-only vs interest+fees not pinned) | core |
| Net Interest Margin (NIM) | Gap between interest earned and interest paid, as % of earning assets — the core "spread" | The lender's profit engine; the covenant is written against it | **denominator (avg earning assets) not disclosed → printed, not recomputable**; rising NIM may signal risk-curve migration, not health | core |
| Gross Margin (lender spread) | Interest income minus cost of funds, as % — a *spread*, not a delivery margin | **The thesis in one number** — same word as SaaS GM, different machine | lender-spread-**NOT**-SaaS-COGS; **formula (int inc − cost of funds)/int inc gives 71–73% vs reported 58–62% → components opaque; report directly, don't publish the formula; never auto-compare to SaaS GM** | core |
| Interest Expense | Interest paid to fund the loan book — cost of funds | Funding-cost half of the spread (5 qtrs) | — | optional |
| Fee & Other Income | Non-interest income (origination fees, prepayment premiums) | Quality-of-earnings check | label-drift ("Fee & Other" vs "Fee & Ancillary" — match on footnote) | optional |
| Pre-Provision Operating Margin | Profit before setting aside for loan losses — the shock absorber | Genuine buffer read | **round-trip rename** (PPOM↔Adjusted Operating Margin) + **real gaps Q4'24/Q1'25 → do NOT interpolate** | optional |

**Tier 2 — Credit quality  `[LAGGING-ONLY — a material blind spot, not just "thin"]`**

> This tier reports only **realised, already-happened** losses. There is **no leading indicator** in
> the packs — no arrears/delinquency aging, no NPL, no watchlist. A real credit team's earliest warning
> turns 2–4 quarters *before* charge-offs, and the tool simply cannot see it here. Say so plainly.

| Metric | Plain meaning | Why chosen / evidence | Basis-tag | |
|---|---|---|---|---|
| Net Charge-off / Credit Loss Rate (LTM) | Share of loans written off as uncollectible over the last 12 months | The truest score of underwriting (4 qtrs: 3.9→3.1%) | **round-trip rename** (NCO↔Credit Loss Rate — match on footnote); **seasoning caveat: a falling LTM rate on a fast-growing, unseasoned book can be denominator inflation, not real improvement** | core |
| Provision Coverage Ratio | Reserves set aside ÷ losses being charged off (is the cushion big enough?) | Only reserve-adequacy signal; has an explicit board minimum (2.0×) | single-point (introduced Q2'25); derived from LTM loss rate | optional |

**Tier 3 — Leverage & capital**

| Metric | Plain meaning | Why chosen / evidence | Basis-tag | |
|---|---|---|---|---|
| Balance Sheet Leverage | How much borrowed money vs own equity funds the book (a multiple) | Margin-of-safety read (2.9→2.7×) | **lender-funding-leverage NOT buyout** — never read as net-debt/EBITDA (no EBITDA exists); ratio type (debt/equity vs assets/equity) unconfirmed | core |

**Tier 4 — Portfolio construction (what the book is made of)**

| Metric | Plain meaning | Why chosen / evidence | Basis-tag | |
|---|---|---|---|---|
| Total Loan Book (gross) | Total principal outstanding before reserves | Headline size/growth; denominator for most ratios (274→316M) | growth caveat (~21% annualised is arguably a yellow flag, not clearly "moderate") | core |
| Active Borrowers | How many separate customers/loans | Diversification read; count for avg loan size (1,250→1,420) | — | optional |
| Average Loan Size | Typical size of one loan | Reported directly ($75→84k) | **does NOT equal Loan Book ÷ Borrowers (that gives ~$223k, off ~2.7×) → unit unresolved (multiple facilities per borrower?); NOT a cross-check** — itself a same-label trap | optional |

**Tier 5 — Covenant & safety**

| Metric | Plain meaning | Why chosen / evidence | Basis-tag | |
|---|---|---|---|---|
| Senior Covenant Headroom | Room left before the loan's rules break, in basis points (bigger = safer) | The single most actionable safety metric (+125→+148bps, **non-monotonic — dipped then widened**) | **the "7.5% minimum-NIM" basis is a HYPOTHESIS, not fact**: it can't be reconciled (NIM 9.4% − 7.5% = +190bps ≠ reported +148), and in Q4 NIM *rose* while headroom *fell* — proof the basis is unknown. Record the actual covenant before trusting it | core |

**Tier 6 — Derived (tool-computed)**

| Metric | Plain meaning | Why chosen / evidence | REFUSE / caveat | |
|---|---|---|---|---|
| Funding-cost coverage | Can earnings cover the interest the lender itself pays? | Standard lender safety read; inputs (Revenue, Interest Expense) present 5 qtrs | define the numerator consistently (NII vs revenue) | optional |
| Risk-adjusted spread (NIM − LTM loss) | The spread *after* expected losses — the truest profitability read | The set's own "truthful comparable"; inputs exist 4 qtrs | cadence mismatch: blends a spot spread with an LTM loss rate — flag it | optional |

**Discarded from the credit set (why-not → revisit-when)**

| Metric (group) | Why NOT in v1 | Revisit when |
|---|---|---|
| **Liquidity / funding-continuity · undrawn facility capacity** | **Never disclosed — yet for a leveraged lender a funding-market freeze kills it long before charge-offs. The biggest conceptual gap; name it, don't hide it** | A liquidity/facility-utilisation schedule is added |
| **Refinancing wall / debt-maturity profile** | Rollover risk on LendBridge's *own* funding isn't in the pack | A maturity ladder is disclosed |
| Gross portfolio / asset yield (book-level) | Appears only at sector level, once (Q1'25 prose) — no series | Tabled book-level yield for ≥2 quarters |
| Non-performing / delinquency (30/60/90+) | The leading indicator — never tabled (see Tier 2 note) | A delinquency-aging / NPL table appears |
| Loan-loss reserves / allowance ratio | Allowance balance never tabled (only implied in Provision Coverage) | Balance sheet discloses an ACL line |
| Provision expense | Not a tabled line; margins reported *pre*-provision only | Income statement breaks out provision-for-credit-losses |
| Advance rate · Equity cushion/ratio | Need a borrowing-base cert or raw equity/assets (only the leverage *multiple* is given) | Borrowing-base cert or equity+assets tabled |
| Sector / obligor concentration (top-N) | Disclosed once (Q2'24), non-recurring | Consistent segmentation for ≥2 quarters |
| Coverage vs board minimums (DSCR, interest/asset coverage) | Need cash-flow-for-debt-service + the minimums (in the credit agreement, not the pack) | A covenant-compliance certificate is attached |
| Watchlist / internal risk-grade migration | The lender's private radar — kept out of a borrower-supplied summary | A detailed credit pack with risk grades |
| Total Headcount · Basic EPS | Reported, but the first is efficiency (not credit) and the second is a single *unaudited* point | Added to an efficiency view / audited & serialised |
| Loan-tape · vintage curves · LGD · roll-rate · stress/PD · ALM/duration | All need a structured loan-level feed or statistical modelling — the opposite of deterministic page-extraction | A loan-tape feed / risk-modelling module is stood up (v2+) |

**Assumptions behind the credit set (state these):**
- **One-lender limit → longitudinal only.** No cross-company credit benchmark is possible; the tool
  refuses to place a credit metric beside another company's number.
- **Footnote/contract definitions rule** — match on footnote-defined equivalence, never the label
  string (two round-trip renames prove it: NCO↔Credit Loss Rate, PPOM↔Adjusted Operating Margin).
- **Gross-margin non-comparability (flagship):** a lender's GM (a *spread*) ≠ a SaaS GM (delivery
  margin). Never auto-compare; the truthful lender comparable is **NIM / risk-adjusted spread**.
- **Leverage is lender-funding, not buyout** (no EBITDA anywhere → no buyout-leverage metric exists).
- **LTM cadence** on the loss rate — never re-annualise, never mix with a quarterly figure.
- **Reporting gaps are real** (PPOM absent Q4'24/Q1'25) — **do not interpolate**; missing ≠ zero ≠
  average of neighbours.
- **Defined-but-not-tabled:** a metric can be footnote-defined before its first value (NCO & Covenant
  Headroom in Q2'24). Definition presence ≠ data presence.
- **Several core reads are printed but NOT recomputable from the page** — NIM (no earning-assets
  denominator), lender GM (formula ≠ reported), Covenant Headroom (can't reconcile). Treat as "reported
  directly, components opaque," and don't publish a formula that doesn't reproduce.
- **Liability side unmodeled:** with no liquidity/funding data, v1 assumes asset-side health proxies for
  repayment safety — an assumption it **cannot verify** (the honest limit for a leveraged lender).
- Provenance is **file-level**. LendBridge is a **synthetic** stand-in for Sagard Credit Partners —
  never imply a real holding.

### 6A.4 Metric decisions for you to record  `[OPEN — choose per your "state why / why-not / assumptions" rule]`

These are genuine judgment calls the analysis surfaced but did **not** lock:

| # | Decision | Options | My lean |
|---|---|---|---|
| **D2a** | How many sector packs to *demo* | (i) all four (SaaS + marketplace + payments + credit) · (ii) just **SaaS + credit** | **(ii)** — SaaS vs credit is the sharpest same-label collision; mention the others exist |
| **D2b** | Rule-of-40 margin proxy (no FCF in packs) | gross-margin variant · burn-derived cash-margin variant | pin **one** firm-wide; gross-margin variant is simplest to defend |
| **D2c** | Build the credit path in the *live demo*? | full path · a single "same engine handles your credit book" slide | **single slide** — one lender can't be benchmarked, so it's a *proof of range*, not a demo screen |
| **D2d** | MediSight Trap-E rename ("Expansion ARR as % of Total ARR") | honor the footnote equivalence · flag as a break | **flag** — the numerators differ; flagging *is* the product |
| **D2e** | Restatement / cross-quarter conflict policy | latest wins · table wins over commentary · surface both with provenance | **surface both** (table as primary), flagged |
| **D2f** | Credit borrower archetype the path targets | LendBridge-style **specialty lender** (asset-side metrics) · real Sagard-Credit-Partners **mid-market borrower** (EBITDA, ND/EBITDA, DSCR, covenant certs) | scope call for later — v1 = specialty-lender; note the borrower-EBITDA module as a roadmap branch |

`☐ YOUR METRIC DECISIONS (D2a–D2f): __________________________________`

---

## 7. DECISION 3 — Automation ladder (what we automate vs keep human)  `[✅ LOCKED 2026-07-09 — rungs 1–4 now; 5 & 6 = future extension]`

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
they're the **future extension**, and the "how" (with options + trade-offs) is below.

#### Rungs 5 & 6 — the future-extension roadmap (how)

Both rungs sit **above the human line** (external + interpretive): automate the deterministic skeleton, a
human signs anything that leaves the building, nothing auto-sends. **Purely additive** — reads the same
normalized store rungs 1–4 fill (traceable to source file); the current 8-metric CSV/JSON is untouched.

**Rung 5 — narrative commentary** (turn numbers into sentences)

| Option | How | Trade-off |
|---|---|---|
| **Template-only** *(start here)* | Fill fixed sentence slots from the numbers — e.g. "Recognized Revenue was $8.4M, up 6% QoQ" — pure string formatting, no model | Deterministic, cited, cheap; but rigid, can read robotic |
| Constrained grounded-LLM | LLM writes prose only from the extracted numbers + provenance; forbidden to add facts; human signs | Fluent; but a nondeterministic surface needing guardrails — a naive model calls *widening* covenant headroom "tightening" |
| Hybrid *(target)* | Template writes the numeric skeleton (deterministic, correct); LLM only polishes the wording around it | Numbers stay machine-true, prose reads human; more moving parts |

**Rung 6 — board / LP pack generation** (assemble outputs into a deliverable)

| Option | How | Trade-off |
|---|---|---|
| **Assemble-to-DRAFT** *(start here)* | Stitch cockpit + rung-5 commentary into a draft pack; human reviews, signs, sends | Lowest risk, highest reuse; still needs a person in the loop |
| Full ILPA export | Map to the standard LP-reporting template (ILPA) | LP-ready, big external win; but our metrics are only a *subset* of ILPA → large mapping + gap-fill |
| Warehouse / BI feed | Push canonical numbers to a warehouse / BI tool | Internal, low-risk, no prose; but a poor live-demo surface |
| Slack / email early-warning digest | Push rung-4 exceptions to a channel as "look here" | Fast internal value; stays surface-and-rank, never auto-escalates |

**Recommended sequencing:** 5-template → 6-assemble-to-draft (+ internal Slack digest) → 5-hybrid →
6-warehouse feed → 6-full-ILPA (last — biggest lift). Deterministic first; the LLM enters only at
**5-hybrid**, on a numeric skeleton it cannot alter.


`✅ YOUR DECISION (D3): Automate rungs 1–4 now (the "Monitoring Cockpit"); keep humans on decisions + anything external. Rungs 5 (draft commentary) & 6 (board/LP packs) are the future-extension roadmap — options + trade-offs immediately above this line.`

---

## 8. DECISION 4 — Output / front-end  `[✅ LOCKED 2026-07-09 — A primary (+ B/C as panels); build still deferred to Doc ii]`

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

`✅ YOUR DECISION (D4): A — the interactive cockpit — as the primary surface, with B (trend explorer) and C (portfolio heatmap) folded in as its panels; G (cited chat) kept as a stretch, E (one-pager) as the fallback. The actual build stays deferred to Document ii — right now the point is the problem, the metrics, and who it is for; the presentation can be reshaped later.`

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
- **The equity / PE path only** — the classifier (§4.5) tags each pack and routes the single lender out;
  cross-company comparison is an equity-book story.
- The tiered metric model (universal + sector packs + raw tail + derived), with per-model expected-metric
  profiles (fixes the false "missing" flag).
- The full 24-doc run.
- The cockpit demo with **one clean cross-company insight + one over-time insight.**

**Explicitly "improve later" (the roadmap slide):**
- **Private-credit path monitoring** (LendBridge longitudinal, §6A.3) — designed now, built later.
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

**Resolved 2026-07-09:** D1 persona (anchor Ops, deal teams secondary — §5); D4 stretch (chat kept as a
stretch, shown last — §8); credit emphasis (handled by scope + classifier §4.5); **interview runway = 4–7
days from 2026-07-09** → interview ≈ **Jul 13–16**, deck due 48h before ≈ **Jul 11–14**; **deck tool = a
self-contained HTML deck published as a Claude Artifact** (opens in a browser on Ubuntu, presents
full-screen, exports to PDF via print; unifies with the D4 cockpit — both HTML; Google Slides = fallback).
**Still live:**

1. **D5 — reconciliation policy:** `DECIDE LATER (2026-07-09)` — recommendation **B (cross-validation
   flag)** held; revisit when we build Doc ii. Options A/B/C in §4.2.1.
2. **Metric sub-decisions D2a–D2f** (§6A.4) — sector packs to demo, Rule-of-40 proxy, build-credit-in-demo?,
   MediSight Trap-E honor/flag, restatement policy, credit borrower archetype.
3. **Demo appetite (revisit at Doc ii):** a real working cockpit (self-contained HTML wired to the actual
   data) or a polished clickable mockup? (Deferred, per your call.)
4. **Go-ahead to run the full 24-PDF export?** The parsed data for all 24 is already on disk
   (`outputs/parsed/`); only the *metrics export* (`metrics_long.csv`) is still a 3-doc slice. One command
   refreshes it — needed before any deck number.

---

### Next step
Once you record D1–D3 (and optionally D4) in the Decision Log (§2), I'll:
1. Write **Document i — Context & Problem** (business framing, tailored to Sagard).
2. Write **Document ii — Prototype & Front-End** (what it does, how it works, limits, the demo design;
   future expansion at the end).
3. Prepare **Document iii — Slides** (last).

Until then, nothing is locked. Take your time with the trade-offs.
