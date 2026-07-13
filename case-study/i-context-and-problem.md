# Document i — Context & Problem
### Sagard "Portfolio Metrics Assistant" — Business Case Study (2nd round)

> **What this document is:** the *business* case for the tool — the problem it solves, why that problem
> is expensive, why the obvious fixes fail, and what "good" looks like. It answers **section (1)** of the
> brief ("present the problem and solution to business stakeholders"). The *how it works* and the *live
> demo* live in Document ii; the *slides* are Document iii.
> **Audience:** Sagard's investment & portfolio-operations teams (business readers), presented to the
> AI & Data team you'd join as a Forward Deployed Engineer (FDE).
> **Grounding:** every number below is quoted from the sample quarterly packs and was re-checked against
> the parsed output on 2026-07-09. Where a statement is an *assumption* rather than a documented fact, it
> is marked *(inference)*. The 10 companies are **synthetic archetypes** built for this exercise — they
> are realistic, but they are **not** real Sagard holdings.
> **Scope:** this case study is built for the **equity / private-equity (PE) monitoring path**; the
> private-credit book is *classified out* and kept as a documented extension (see §5–§6 and Document 0
> §4.5). "PE" here means the equity-held operating companies, which read as **growth / venture equity**
> (subscription revenue, not classic buyout).

---

## 1. Executive summary (read this if you read nothing else)

Every quarter, each company Sagard backs sends a **reporting pack** — a PDF full of numbers. Someone on
the team opens 20-plus of these, hunts for the figures that matter, and **types them by hand** into a
master spreadsheet so the firm can answer one simple question: *how is each company doing, and how do they
compare?*

That manual routine is slow, it goes stale the moment it's built, and — most damaging — it is **quietly
wrong**, because the same word means different things in different packs. What one company calls **"ARR"**
(Annual Recurring Revenue — the yearly value of its active software subscriptions), another writes as
"Annual Recurring Revenue," and a third as "Contracted ARR." A lender's "Gross Margin" is a completely
different calculation from a software company's "Gross Margin." A company renames its own revenue line from
one quarter to the next, and the trend line silently breaks. When the spreadsheet is finished, **nobody can
click a number and see the page it came from**, so trust is low and every figure gets re-checked by hand.

**The tool turns that routine into minutes instead of days — but its real value is not speed.** The real
value is the single promise underneath it:

> **"Same label doesn't mean the same metric. Comparability is the product — not extraction."**
> The tool *guarantees* that any two numbers placed side by side genuinely mean the same thing, and it
> makes every number **traceable back to its source file.** Pulling numbers out of a PDF is the easy,
> commodity part. Guaranteeing they are *safe to compare* — and *provable* — is the hard, valuable part,
> and it is the thing that makes an investment team actually **trust and adopt** the tool.

Everything else in this document is evidence for that one sentence.

---

## 2. The situation — quarterly monitoring at a multi-strategy firm

A private-markets firm like Sagard raises **funds** (pools of money from outside investors, the *LPs*) and
invests them into companies (*portfolio companies*, or *portcos*). After a deal closes, the firm does not
walk away — it **monitors** each portco every quarter, using the reporting pack the company sends in.

The people who read those packs each have a different job:

| Who | What they do with the numbers |
|---|---|
| **Portfolio Operations / Value-Creation team** *(the primary user of this tool)* | Owns the quarterly monitoring routine across the *whole* book — the one team that touches **every** metric, **every** company, **every** quarter. They are the ones doing the copy-paste today. |
| **Investment / deal teams** *(strong secondary)* | After a deal, they sit on boards and track follow-on decisions — they *consume* the monitoring output for board prep, they don't run the routine. |
| **Fund finance, Investor Relations, Credit risk** *(downstream)* | They take the clean numbers and do their own judgment work (valuation marks, LP reports, covenant checks — *does a borrower stay inside its loan promises?*). The tool feeds them better inputs; it never replaces their sign-off. |

**Why this is genuinely hard for a firm like Sagard — not hand-waving:** Sagard is **multi-strategy** — it
invests across venture, private equity, **private credit**, and real estate (**US$46B AUM** — *assets under
management, the total money the firm manages* — across **190+ portfolio companies**, per sagard.com, early
2026; *re-verify these headline figures right before presenting — they drift over time*). So a single
monitoring view has to survive **genuinely different kinds of business** — a software company and a lender
in the same portfolio, using the *same words* for *different things* (§3 shows this happening in the actual
packs). Sagard's public analog for the portfolio-ops client is its **"Value Creation"** team.

**And it fits how Sagard already works.** Sagard's publicly-described AI platform frames its work with the
words *"automated ingestion and transformation," "confidence levels,"* and *"explainable reasoning"* — so
this tool applies a discipline the AI & Data team already values (normalization, per-number confidence, and
**provenance** — a traceable link from every number back to the source file it came from) to portfolio
monitoring. *(Confirm these quoted phrases are still verbatim on current Sagard materials before the room.)*

> **Honest note (inference):** that Sagard's team *manually keys numbers out of PDFs today* is a reasonable
> inference from the workflow and the FDE job description — it is not a documented fact, and it is presented
> as an inference. The *pain pattern* itself, however, is demonstrable directly from the sample packs, which
> is what §3 does.

---

## 3. The problem, made concrete

Here is the routine, in one picture. It is the second week after quarter-close. Twenty-plus PDF packs have
landed — from a cloud-software company, a lender, a payments company, a freight marketplace. *(That
"twenty-plus" is the cadence of a 190+-company firm; our demo works from a focused 10-company, 24-pack
sample.)* An analyst opens each one, finds the numbers, and hand-keys them into a spreadsheet. Four specific
things go wrong — and each one is **provable from the sample data.**

### 3.1 Trap A — the same metric wears many names, and renames itself over time

**NovaCloud** (a cloud-software company) **renames its revenue line three times across its five quarters —
and even reverts:**

> Q2'24 **Total Billings $5.8M** → Q3'24 **Recognized Revenue $6.5M** → Q4'24 **Net Revenue $7.2M** →
> Q1'25 **Recognized Revenue $7.9M** → Q2'25 **Recognized Revenue $8.4M**

Only the Q4'24 footnote quietly says *"Net Revenue is equivalent to Recognized Revenue in prior periods"* —
and even that covers only *one* of the renames. The earlier shift from "Total Billings" to "Recognized
Revenue" is **never declared anywhere.** (NovaCloud's own Q2'24 footnote *does* tie Total Billings to ASC
606 recognized revenue — but only if you read it; the label change by itself still breaks the series.)
**If the analyst misses the footnote, the growth trend silently splits and looks broken.** This is not a
NovaCloud quirk — across the corpus, revenue alone appears as *Total Billings, Recognized Revenue, Net
Revenue, Quarterly Revenue, Gross Transaction Revenue,* and *Platform Revenue.*

### 3.2 Trap B — the same *name* hides a different calculation

This one is the most dangerous, because it looks safe. Take **"Gross Margin"** — a percentage every company
reports. Inside the *equity book alone*:

- **CarbonTrack** computes it *excluding* customer-success and data-science costs.
- **MediSight** computes it *excluding* implementation and customer-success costs.
- **NovaCloud, TalentVault, ConstructIQ** state **no definition at all** — a silent basis.

So of five "Gross Margin" numbers in one column, **two are provably computed differently (CarbonTrack,
MediSight) and three carry no stated definition at all — so not one of the five is safe to place beside
another.** Put them in a league table and you have ranked companies on a number you cannot confirm means
the same thing for any two of them. (The most extreme version — a *lender's* "gross margin," which is interest income minus cost of funds,
a completely different machine — is exactly why the tool first **classifies** each pack as equity or credit
and never lets the two touch. That classifier is Document 0 §4.5.)

### 3.3 Trap C — the number is right, but the *basis* is wrong

Even when a number is correct, the *unit or time-window* behind it can make a comparison silently wrong:

- **ConstructIQ** reports **burn per quarter** ($0.91M) while everyone else reports **per month** — and its
  pack even *contradicts itself*: it labels the burn "Quarterly," yet its own narrative prints a
  "~12-month runway," a figure that only holds if you misread that quarterly burn as monthly. Read
  correctly, $0.91M/quarter is **$0.30M/month**, which on $11.2M of cash is closer to **~37 months.** The
  right behavior is *not* to silently pick a number — the tool **flags the conflict** and surfaces the
  basis-corrected read for a human to confirm. A 3× swing hiding in one mislabeled word.
- **ClearPay** (payments) reports **"Cash & Restricted Cash" of $38.4M** — but $6.2M of that is *segregated
  client money it is legally not allowed to spend.* Its true operating cash is **$32.2M.** Use the headline
  number and every runway and liquidity read is overstated.
- **PeopleFlow** reports in **British pounds (£)**, not dollars — so its figures need a currency conversion
  before they can sit next to the others.

### 3.4 Trap D — you can't prove any of it

When the spreadsheet is done, it is stale (the next quarter is already arriving), it is error-prone (every
figure was retyped), and **no number carries a link back to the file it came from.** So when a partner asks
*"where did this 78% come from?"*, the honest answer is *"let me re-open the PDF and find it again."* That
is the trust problem, and it is the reason the numbers get re-checked by hand anyway — which erases most of
the time the spreadsheet was supposed to save.

> **The pain is not "reading PDFs is hard."** It is **reconciliation, comparability, trust, and time** —
> every quarter, forever. Reading the PDF is the easy 10%. The expensive 90% is knowing which numbers are
> *safe to compare* and being able to *prove* each one.

---

## 4. Why the obvious fixes don't work

A reasonable person would reach for one of three off-the-shelf answers. Each fails on the same point —
none of them **guarantees comparability or provenance**, which is the whole job.

| Obvious fix | Why it fails here |
|---|---|
| **A better spreadsheet template** | A template standardizes the *layout*, not the *meaning*. It still trusts the analyst to know that "Total Billings" and "Recognized Revenue" are one series, and that two "Gross Margins" aren't comparable. The trap lives in the definitions, not the columns. |
| **A generic PDF scraper / "AI extractor"** | Extraction is the easy part — and a naive extractor makes things *worse*, because it confidently drops five differently-defined "Gross Margins" into one column and calls it done. It has no concept of *basis* or *not-applicable*, so it manufactures exactly the false comparison we're trying to prevent. |
| **A BI dashboard (Looker / Power BI)** | A dashboard draws pretty charts on top of whatever data it's given. If the underlying numbers aren't reconciled and basis-tagged first, it just makes a *wrong* comparison *look* authoritative — and it still can't click through to the source page. |

**The gap all three share:** they treat this as an *extraction* or *visualization* problem. It is neither.
It is a **comparability and trust** problem — the boring, careful part that generic tools skip, and exactly
the part that earns an investment team's trust. That is the space this tool is built for.

---

## 5. What the tool guarantees instead

The tool is a **monitoring assistant that automates the deterministic work and leaves the judgment to
people.** In one line of flow:

> **Extract → classify (equity vs credit) → normalize onto one shared vocabulary → reconcile against the
> company's own report → compute the safe derived metrics → surface the exceptions** — with a human owning
> every decision and every number that leaves the building.

It makes exactly **two promises**, and they map one-to-one onto the traps above:

1. **Comparability you can trust.** Two numbers only ever sit side by side if they *genuinely mean the same
   thing.* The tool stitches renamed labels into one series (Trap A), refuses to compare differently-defined
   metrics (Trap B), and normalizes units, time-windows, and currency before any comparison (Trap C). When a
   comparison isn't safe, the tool **visibly refuses it** rather than fake it — and that refusal is a
   feature, not a limitation.
2. **Traceability you can prove.** Every number carries its **source file, its original label, and a
   confidence score,** so any figure is one click from where it came from (Trap D). *(Today that trace is at
   the **file** level — "this number came from this document." Page- and sentence-level linking is a defined
   roadmap upgrade, not a claim we make yet. We say what is true.)*

**How it decides "same or different" is not magic** — it is a **human-owned rulebook** (which labels map to
which canonical metric, which renames are equivalent, which units convert how). The machine *applies* the
rulebook on every run; people *own and edit* it. That is what makes the whole thing auditable instead of a
black box. *(The full mechanics — the tiered metric model, the classifier, the automation line — are
Document 0 §4–§7 and Document ii.)*

---

## 6. Scope, and who benefits most

**We build for the equity / PE path first, and we build for the team that lives in this loop.** The
personas do not benefit equally, so we rank them honestly on **how *objective* their use of the numbers
is** — because a deterministic tool helps most where the work is repetitive and rule-based, and least where
the core output is a *judgment call*:

| Rank | Who | Why they rank here |
|---|---|---|
| **1 — Primary** | **Portfolio Operations / Value-Creation** | *Is* the quarterly monitoring loop — the objective, repetitive, every-company-every-quarter grind the tool removes. |
| **2 — Secondary** | Investment / deal teams | Consume the monitoring output (board prep, follow-on) — a fast objective read, but they don't run the loop. |
| **3–5 — Downstream** | Credit risk · IR / LP-reporting · Valuations | Get cleaner, traceable **inputs** and keep their judgment/sign-off. A valuation "mark," in particular, is a *subjective* call a person must make — the tool feeds it audit-defensible inputs; it never makes the mark. |

**The governing principle: we automate the objective; we assist the subjective.** v1 targets the internal,
deterministic, high-frequency monitoring job — the work that can be automated *without judgment.*

**Two honest scope limits (state them — they are credibility, not weakness):**

- **We read what a company *does*, not how the fund *holds* it.** The packs describe each business model,
  but they do **not** disclose the ownership stake, so the tool never claims to know "venture vs buyout." It
  monitors what the company *reports.*
- **"PE" here reads as growth/venture equity, not classic buyout.** The packs carry ARR and retention, but
  **no EBITDA, no leverage, no buyout debt** — so buyout-style value metrics are deliberately out of scope
  (Document 0 §6A). The tool stops exactly where the data stops, and never over-claims.

**Private credit is not discarded — it is scoped out on purpose.** The corpus has a single lender
(LendBridge), and *one* of anything can't be benchmarked against peers. So the classifier tags it, routes it
to its own path, and the tool can still monitor it **over time against its own history** — which is a
documented **extension**, not the v1 demo. (This matters for a multi-strategy firm: the same engine already
knows a lender from a software company.)

---

## 7. What success looks like

If this works, the quarter-close routine changes in four measurable ways:

| Today (manual) | With the tool |
|---|---|
| **Days** of re-keying 20+ PDFs before anyone can see the portfolio | **Minutes** — one normalized view, refreshed on demand |
| A number's source = "re-open the PDF and hunt" | Every number is **one click from its source file**, with its original label + confidence |
| A lender legitimately has no ARR → flagged as a **false "missing" alarm** | **No false "missing" alarms where a metric legitimately doesn't apply** — the tool marks ARR *not-applicable* to a lender, not *missing* |
| Differently-defined numbers silently compared | The tool **refuses unsafe comparisons by design** — the guardrail is visible |

And it sets up the **two "user insight" moments** the live demo (Document ii) will show — both provable from
this exact data, both verified:

- **One cross-company insight:** a net-revenue-retention league across the Q2'25 book — **NovaCloud 123%,
  CarbonTrack 121%, TalentVault 119%, PeopleFlow 118%, ConstructIQ 112%** (a retention *above* 100% means
  existing customers **spend more** each year — it is not a headcount capped at 100%) — where ConstructIQ is
  the clear laggard *and* carries the highest customer churn (6.3%), an at-a-glance outlier. (With the
  guardrail that the lender is walled off — it has no retention metric to rank.)
- **One over-time insight:** NovaCloud's five-quarter story — revenue compounding (the renamed line,
  stitched back into one series), retention strong, burn shrinking — *while cash still draws down,* a
  "healthy but watch the runway" narrative that only appears once the numbers are normalized and trustworthy.

> **One honest prerequisite:** the sample export currently covers 3 of the 24 packs. The parsed data for all
> 24 is already on disk, so refreshing the full export is a single command — and it must be run before any
> of these demo numbers goes on a slide. We show numbers we have verified, or we don't show them.

---

## 8. The one-sentence version (for the room)

> Sagard's teams spend days each quarter turning inconsistent PDF packs into a spreadsheet that is stale,
> error-prone, and impossible to trace — and *quietly wrong* wherever the same word means two different
> things. This tool automates that routine down to minutes, but its real product is **trust**: it guarantees
> that any two numbers it places side by side truly mean the same thing, and that every one of them can be
> traced back to its source. That is the difference between a PDF scraper and the data layer a Sagard team
> would actually build on.

---

### Where this goes next
- **Document ii — The Prototype & Front-End:** what the tool does today, how it works, its limits, and the
  live-demo design (the cockpit + the two insights above). Future expansion lives at the end of that doc.
- **Document iii — Slides:** the deck that carries this story into the room (problem → prototype → live demo
  → roadmap), built as a self-contained HTML deck.
