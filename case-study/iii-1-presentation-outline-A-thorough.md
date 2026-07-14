# Document iii-1 — Presentation Outline **A: THOROUGH** (every section filled)
### Sagard "Concord" — the case-study talk, written out

> **What this is.** Your full outline, in your order, with **each section filled in** — what to say, the key
> lines, the honest caveats, and **every** future-improvement detailed (nothing left out; you choose what to
> say live). This is the deep reference. **Version B (lean)** is the tight ~35-min running order in the
> sibling file `iii-2-presentation-outline-B-lean.md`.
>
> **The room:** **Parinaz Sobhani** (Head of AI — rigor, trust, right-sized AI) + **Sharon Liu** (Head of
> Operations, ex-Chief Compliance Officer — controls, audit trail, reconciliation, source-of-truth). One AI
> judge, one operations/controls customer. **Not** finance-math judges — never drift into fund returns / NAV
> math.
>
> **The tool = Concord.** Deterministic, offline, provenance-tagged, refuses unsafe comparisons. Thesis:
> *"Same label doesn't mean the same metric — comparability is the product, not extraction."*
>
> **Simple-language promise:** short sentences, plain words, jargon explained once.
> **Honesty promise:** no invented numbers; time-savings stays qualitative; every demo figure is faithful to
> `cockpit-frontend-guide.md`.

---

## The running order (Version A — Thorough)

| # | Section | ~Time | Its one job |
|---|---|---|---|
| 0 | Intro (you) | 0.5 min | Who you are, warmly |
| 1 | The hook question | 1 min | Grab both minds in one question |
| 2 | Assumptions ("correct me") | 6–8 min | Show you learned their world; invite them to fix your map |
| 3 | The problem | 3 min | The Operations team's painful quarter-close |
| 4 | How we solve it | 5–6 min | The engine + the honest "why deterministic" + can we trust it |
| 5 | What AI can automate vs not | 2 min | The principle: AI suggests, humans decide |
| 6 | Time saved (qualitative) | 1 min | Days → minutes, no invented numbers |
| 7 | **Live demo** | 8–10 min | The proof, told as a story |
| 8 | Future improvements | 4–6 min | The reliable, production path (you curate; all are here) |
| 9 | How to scale | 2 min | Honest: not production-ready, but here's the path |
| 10 | Fun fact | 1 min | Relax the room; show you respect their world |
| 11 | Ask for questions / goodbye | — | Hand over |
| 12 | My questions for them | in Q&A | Validate your map; learn the culture |

*(This is long on purpose. Version B trims and re-orders it to land in ~35 min.)*

---

## 0. Intro (you) — 30 seconds

Keep it short and human. Name, one line on your background, and one line that you spent real time learning
Sagard's world (this plants the fun-fact you'll land later).

> *"I'm Xavier. I build tools that sit close to the people who use them. For this, I spent most of my time
> not coding — but learning how Sagard actually works, so I could point the tool at a real problem, not a
> toy one."*

---

## 1. The hook question — 1 minute

Open with **one** short question that makes both people lean in. Pick one; here are six with why each works.

1. **"Two of your portfolio companies both report a 60% 'gross margin.' One is a SaaS business, one is a
   lender. Should they ever sit in the same column?"**
   → Stages your whole thesis in one breath. Sharon hears *"a wrong comparison is a control failure"*;
   Parinaz hears *"meaning depends on context"* (her NLP world). The answer is *no* — and Concord enforces
   the *no*.
2. **"A number in one of your quarterly reports is wrong. Would you rather your tool told you loudly — or
   quietly filled the gap so the report still looks complete?"**
   → Sets up *"a silent blank is more dangerous than a loud error."* Leads into refuse-to-compare + the
   review queue.
3. **"If I handed you a fully-automated dashboard that was 95% accurate, would you put its numbers straight
   in front of your investment committee?"** *(keep "95%" clearly hypothetical — do not confuse it with your
   real 76%→90% recall on 24 synthetic PDFs)*
   → The answer is *no* from both — and that *no* **is your pitch** (human-in-the-loop, provenance,
   refuse-to-compare). Disarms the "just automate it" reflex in 30 seconds. Very FDE.
4. **"Everyone can build a demo that pulls numbers out of a PDF now. What makes a number one your team would
   actually sign their name to?"**
   → Names Parinaz's "prototype trap" and flips it to trust/provenance; Sharon hears *"sign-off."*
5. **"How many hours does your team spend each quarter re-typing PDF numbers into a spreadsheet — before
   anyone has made a single decision?"**
   → Makes the pain felt in Sharon's exact world; quantifies the grind *without inventing a figure* (they
   answer).
6. **"When your deal partner and your valuations analyst open the same quarterly pack, they need opposite
   things from it. What if one clean, traceable data layer could serve both?"**
   → Shows you understand the personas and the speed-vs-precision tension.

> **Lean:** #1 (thesis in one breath) or #3 (disarms "just automate it"). Both serve Parinaz and Sharon at
> once.

---

## 2. Assumptions — "here are my assumptions, correct me" — 6–8 min

**Framing tip (say this out loud):** *"I'm going to show you my mental model of your world. You live this
every day — so please stop me and correct me where I'm wrong."* That one sentence turns a section that could
feel like *teaching finance to finance experts* into an **invitation to engage** — which is exactly what an
FDE does. Move fast; this is background fluency, not a lecture.

### 2.1 What Sagard does + how a PE firm makes money (say it as fluency, not a math slide)

The money flows in one line: **LP → GP (Sagard) → portfolio company → exit → money back to LP.**

- **LP (Limited Partner)** = the outside investors who put money in (pension funds, insurers, endowments,
  family offices). "Limited" = passive; they don't run anything.
- **GP (General Partner) = Sagard** = raises the fund, picks the deals, manages the companies, sells them.
  The GP **also puts its own money in** (the *GP commitment*, ~1–5% of the fund) — "skin in the game," so the
  GP wins only if the LPs win.
- **Portco (portfolio company)** = a company the fund bought. *Your 10 demo companies are portcos.*

**Sagard earns money two very different ways:**

| Income | Plain meaning | Roughly | The nuance you must get right |
|---|---|---|---|
| **Management fee** ("the 2") | Yearly fee that keeps the lights on — salaries, rent | ~2%/yr | Charged on **committed capital** (money LPs promised), **not** on profits, **not** performance-linked. Paid whether the fund does well or badly. |
| **Carried interest / "carry"** ("the 20") | The GP's share of the **profits** — the real wealth engine | ~20% of profit | Paid **only after** LPs get (1) all their money back **and** (2) a **preferred return / "hurdle"** (~8%/yr) first. That ordering is the **distribution waterfall.** |

- **"2 and 20"** = the shorthand (2% fee + 20% carry). Mid-market funds negotiate, but everyone shares this
  model.
- **Waterfall order:** return LP capital → pay the ~8% hurdle → GP "catch-up" → then split the rest (often
  80% LP / 20% GP).

**The fund lifecycle (a fund lives ~10 years):**

| Stage | What happens | Where Concord lives |
|---|---|---|
| 1. Fundraise | Raise commitments from LPs | — |
| 2. Investment (~yrs 1–5) | "Call" the money, buy companies | — |
| 3. **Hold / monitor (~yrs 3–7)** | *Operating partners* improve the companies; the **ops/reporting team monitors + reconciles every quarter** | ⬅ **Concord's home** (the monitor/reconcile job) |
| 4. Harvest / exit (~yrs 5–10) | Sell companies, return cash, GP earns carry | Feeds cleaner inputs; the exit is a judgment |

- **J-curve:** a young fund often shows *negative* returns early (fees paid, nothing sold yet). Not
  "failing."
- **NAV / "the mark":** between buying and selling there's no market price, so each quarter the GP
  **estimates** each company's fair value (*the mark*); the marks sum to **NAV** (the fund's estimated
  worth). **The mark is a judgment call, and it's audited.** Concord *feeds* its inputs — it never makes the
  mark.

**Where Sagard specifically is different (say this so you sound prepared, not generic):**
- **Multi-strategy, not a pure buyout shop:** PE, **private credit**, venture, real estate, wealth, **plus a
  big "solutions" arm** (investing into/alongside other funds — primaries, secondaries, co-investments), much
  of it from the **Unigestion acquisition** (*re-verify that it closed and when on sagard.com*). *"Sagard buys companies" is only half the story.*
- **Scale (RE-VERIFY on sagard.com the morning of — these move, and some are post-acquisition):** ~US$46B
  AUM (AUM = all money managed across all funds, not one fund), 190+ portfolio companies, 540+ staff, stated
  goal ~US$100B by 2029, mid-market funds ~$500M–$4B.
- **Your scope, said honestly:** Concord is scoped to the **direct PE portfolio companies** (your packs). The
  credit book and the solutions/fund-of-funds business are documented extensions, not v1.

### 2.2 The five personas — what each DOES and CARES about

All five read the **same** quarterly pack, for **opposite** jobs. Present it as a map (neither interviewer is
a finance-math judge).

| # | Persona | What they DO | What they CARE about | Trust posture |
|---|---|---|---|---|
| 1 | **Deal Partner** | Sourced/led the deal; sits on the portco **board**; owns the relationship | "Is this company roughly on track vs the plan we underwrote?" A fast, **directional** read | **Speed over precision** |
| 2 | **Portfolio / Reporting Operations + Controls** *(Sharon's world)* | **Owns the quarterly monitoring + reconciliation + reporting grind** across the whole book; controls & compliance | One **standardized, comparable, source-traced** view; audit trail; exception handling; maintainability | **Comparability + control** ⬅ **your primary customer** |
| — | *(Value Creation / operating partners — a separate job)* | *Improve the companies after the deal (grow revenue, cut cost)* | *Operational levers inside a portco* | *(distinct from Sharon — don't merge)* |
| 3 | **Valuation Analyst** | Sets each portco's quarterly **mark** → rolls into fund **NAV** | **Audit-ready, reconciled, traceable** numbers (auditors challenge each figure) | **Precision above all** |
| 4 | **Investor Relations / LP-reporting** | Reports portco numbers **outward** to LPs (often the standard **ILPA** layout) | External exactness + consistency; every figure tie-able to a source | **Precision (external)** |
| 5 | **Risk / Credit Analyst** | For companies Sagard **lends to** (not owns), checks each borrower stays inside its loan **covenants**; catches stress early | The **exactly-defined** ratio; early warning on shrinking headroom | **Precision + exact definitions** |

> **CRITICAL tailoring note (the verifier flagged this):** persona #2 is **Sharon's controls/reporting-
> operations world** — reconciliation, source-of-truth, audit trail, data governance. It is **NOT** the
> "Value Creation / operating partner" job (improving companies' revenue and cost). Keep them separate.
> Telling Sharon she's the team that "improves your portfolio companies' operations" would misread her role
> to her face. She is the **controls + reporting** customer.

**The tension that ties them together (a great line):** *"The deal team wants a fast directional read;
valuations, LP-reporting, and credit want an audited, reconciled number. The same messy PDF has to serve both
— and a source-traced, refuse-when-unsure data layer is exactly what lets one tool do that."*

### 2.3 Who this is for

**Primary: the Portfolio / Reporting Operations team (Sharon's world)** — the people who hand-key the packs
each quarter and must be able to trust and trace every number. Second-hand: deal partners (post-close board
prep) and valuation/LP-reporting (cleaner, auditable inputs, keeping their own sign-off).

> **Watch out (say it as your assumption):** *"I've assumed there's a team that owns this quarterly grind. I
> don't know if that's one person, a team, or a vendor — that's one of my questions for you."* (Publicly
> Sagard doesn't advertise a named data/metrics function, so present this as an assumption, not fact.)

---

## 3. The problem (the Operations team's painful quarter-close) — 3 min

Make it **felt**, in Sharon's exact world.

> It's the second week after quarter-close. 20+ company PDF packs have landed — a SaaS company, a lender, a
> payments company, a freight marketplace. An analyst opens each, hunts for the numbers, and **hand-keys**
> them into a master spreadsheet. Four things go wrong, and each is **provable from the real packs:**

- **Same metric, many names (and it renames itself over time).** NovaCloud's ARR appears as "End-of-Period
  ARR" and "ARR (End of Period)"; its revenue line drifts *Total Billings → Recognized Revenue → Net
  Revenue*. Miss the footnote and the trend silently splits.
- **Same name, different meaning.** A software "gross margin" (cost to deliver software) vs a lender's "gross
  margin" (interest income minus cost of funds). Put them in one column and you're **quietly wrong**.
- **The number is right, the basis is wrong.** ClearPay's "Cash & Restricted Cash $38.4M" includes $6.2M of
  client money it legally can't spend (true spendable cash = $32.2M). ConstructIQ reports burn *per quarter*,
  everyone else *per month*.
- **You can't prove any of it.** The finished sheet is stale, retyped, and **no number links back to its
  source** — so a partner asks *"where did this 78% come from?"* and the honest answer is *"let me re-open
  the PDF."* Trust is low, so everything gets re-checked by hand.

> **The one line:** *"The pain isn't reading PDFs. It's **reconciliation, comparability, trust, and time** —
> every quarter, forever. Reading the PDF is the easy 10%. The expensive 90% is knowing which numbers are
> safe to compare, and being able to prove each one."*

---

## 4. How we solve it — 5–6 min

### 4.1 What Concord does (plain, one flow)

> **Load all the packs offline in one click → classify each (equity vs credit) → normalize onto one shared
> vocabulary → reconcile against the company's own report → refuse any comparison that isn't truly
> like-for-like → and let you click any number to see its source.** A human owns every decision and every
> number that leaves the building.

Two promises, mapped to the pains:
1. **Comparability you can trust** — renamed labels stitched into one series; differently-defined metrics
   **across asset classes** refused (a lender's margin is never ranked against a software one); units/basis
   handled *before* any comparison. When a comparison isn't safe, the tool **visibly refuses** it.
2. **Traceability you can prove** — every number carries its **source file, original label, and confidence**;
   one click shows the exact **source excerpt**. *(File-level today — the excerpt is shown, but not the page
   number; **page-level anchoring** is on the roadmap — say what's true.)*

### 4.2 Why deterministic — the honest story (limited time), and why it's actually the right default

Say this almost verbatim — it's your maturity moment:

> *"For this demo I used a **single deterministic method**, on purpose, because I had limited time — and
> because fixed rules are cheap, fast, testable, and easy to show you. I want to be clear: **one method is not
> production-grade.** A single reader, however good, can be wrong and you'd never know."*

Then the trade-off (this is the "a bit technical" part they'll want):

| | **Deterministic (fixed rules) — today** | **A single AI/LLM reader** |
|---|---|---|
| Cost | Free to run | Pay per document |
| Auditable (show *why*) | Yes — every step is a readable rule | Hard — reasoning is opaque |
| Reproducible (same in → same out) | Always | No — can vary run to run |
| Invents numbers? | Never | Can "hallucinate" a plausible-but-wrong value |
| Data stays in-house? | Yes (offline) | Usually sent to an outside model |
| Handles messy / brand-new layouts | Weak (only knows its rules) | Strong |

**The design principle:** *"Rules for the bulk, AI only for the genuinely ambiguous tail, and a human
approves. Right-sized AI."* — For Parinaz that's cost-aware engineering judgment; for Sharon it's reliable,
testable, and the data never leaves the building.

> **The Firecrawl footnote (optional, only if asked "why not an LLM?"):** *"Practically, I also hit the
> credit ceiling on a paid extraction service mid-build — which turned out to be a gift: it forced the
> auditable, offline design that's actually right for a trust tool."* Never lead with this; the headline is
> "deterministic-first is the right call."

### 4.3 Can we trust the extraction? — the reliable path (this is your best answer to "is the source-of-truth worthy?")

This is the idea that wins the room. Introduce it here at a high level; the full detail is in §8 (Future
improvements).

> *"Here's how you make one reader trustworthy — and to be clear, this is the reliable path I'd **build
> next**, not what today's demo runs: don't rely on one reader. Run **two to four independent methods that
> fail in different ways**, and trust a number when they agree — **unanimously** for the green bar, or a
> strict majority **only when the agreeing readers are genuinely independent**; count isn't enough,
> independence decides. When they disagree, the tool doesn't guess — it raises a **warning** and sends it to a
> **human**, with every method's answer shown side by side. The disagreement *is* the alarm."*

Why it lands for **both**: for Parinaz it's rigorous (independent methods, not "three LLMs voting"); for
Sharon it's **an automated four-eyes control with a full audit trail** — the exact thing an auditor already
trusts. *"The thing that makes the numbers more correct is the same thing that gives you the control and the
audit trail."*

---

## 5. What AI can automate vs not — 2 min

**The one principle:** *AI is probabilistic — it gives a likely answer, not a certain one. So never let it
**decide**. Let it do the heavy, repetitive, redundant work and make **suggestions with reasons** — a human
makes every call that reaches a report.*

| The work | Who does it | Why |
|---|---|---|
| Read 20+ PDFs, pull the raw numbers | **AI / rules — redundantly** | High-volume, repetitive, mechanical |
| Stitch renamed labels into one series; normalize **units + scale** | **Rules (human-owned rulebook)** | Deterministic and auditable |
| Different currency (GBP vs USD) | **Flag / refuse — do NOT convert** | Concord does *not* convert today; a flagged blank beats a wrong mix |
| "These two labels *might* be the same metric" | **AI suggests → human confirms** | Judgment with consequences |
| "These numbers don't match / this one looks wrong" | **AI / orchestrator flags it** | Machines are great at spotting disagreement |
| "Is this number right enough for a report?" | **Human (sign-off)** | Consequential; a probabilistic model can't decide it |
| "This company looks healthy because (i),(ii),(iii)" | **AI suggests, with reasons** | A **suggestion**, never a verdict |
| The valuation mark / the LP figure / the IC call | **Human only** | Subjective judgment; the tool feeds inputs, never the mark |

> **Honest correction baked in:** the tool **normalizes units + scale (M/K)** and **flags/refuses** on a
> different currency — it does **not** convert currency. Say it that way.

---

## 6. Time saved (qualitative only) — 1 min

No invented numbers. Frame it as **decision quality first, time second.**

> *"Today the quarter-close is **days** of re-keying 20+ PDFs before anyone can even see the portfolio. With
> Concord it's **one click** to a comparable, source-traced view — so the team spends its time on judgment,
> not typing. And the bigger win isn't the hours saved: it's that the comparison is **trustworthy** and every
> number is **one click from proof.** A wrong number caught before it reaches an investment committee is worth
> more than any amount of typing saved."*

*(If they ask for a number, turn it back: "How many hours does your team actually spend on this today?" — let
them supply it. Never fabricate one.)*

---

## 7. The live demo — 8–10 min

You don't need demo detail on the slides — it lives in `case-study/cockpit-frontend-guide.md`. Drive it as a
**story with three beats** (all true on screen):

1. **The pain, on screen:** load 24 packs offline in ~1 second. *"Nothing left the machine."*
2. **Two proof moments:**
   - **The hidden trend (comparability):** NovaCloud's ARR looks like **one lonely dot** to a naive tool;
     Concord stitches the renamed labels into **five quarters, $24.1M → $34.2M (+42%)**. *"A silent blank is
     more dangerous than a loud error."*
   - **The refusal (a control):** a lender's 62% "gross margin" sits next to a SaaS 76%. Concord **refuses to
     rank them and says why** (interest margin ≠ delivery margin) — *a deterministic classifier flags
     LendBridge as credit from its loan-book / NIM / charge-off fingerprint, so the refusal is rule-driven,
     not a guess.* *"A generic dashboard ranks these. Ours refuses — and that refusal is a control."*
3. **The trust spine:** click **any** number → the provenance drawer shows source file, raw label,
   confidence, and the exact sentence. *"Every claim on screen is one click from proof — that's the audit
   trail."*

Extra true beats you can use: **ClearPay** restated $38.4M → $32.2M spendable (strips $6.2M client float);
the four **trust panels** (Refused 5 · Exceptions 10 gaps · Breadth 29 labels unified · Reconciliation 22
checked/22 agree **+ 7 intra-document conflicts auto-resolved**); **ConstructIQ** the retention laggard.

> **Honesty caveats to own out loud (say them before they ask — they're credibility, not weakness):**
> - PeopleFlow's **GBP** flag is a **front-end rule**, not captured data (the parser doesn't see the £).
> - Provenance is **file-level** (the excerpt is shown, but no page number in the drawer yet).
> - The raw **missing-metric flag has a couple of false positives** — CarbonTrack and TalentVault show
>   cash/headcount on screen yet log as "missing"; the sector-aware grid suppresses them on screen, and
>   tightening the raw flag is a roadmap item.
> - The refusal handles the **loud cross-asset case** (a lender vs a SaaS margin). **Two SaaS companies**
>   computing "gross margin" on a silent, different basis is a **known, flagged roadmap limit** — so the
>   SaaS-margin heat colour is **directional, not an audited like-for-like**.
> - The 22/22 reconciliation is a **second witness restating the same numbers**, so agreement is
>   **confirmation, not independent proof** — the real reconciliation work shows in the **7 in-document
>   conflicts** it caught and resolved.
> - **LendBridge** is the one **credit** name on screen — it's there to show the **wall**: the classifier
>   tags it credit and **refuses to rank** its margin. That refusal is the **scope boundary working**, not a
>   scope violation.

---

## 8. Future improvements — the reliable path (ALL detailed; you curate what to say)

> You asked me to leave **nothing** out and detail every item — done. On the day, pick the 4–6 that tell the
> best story; the rest is your backup. They're grouped so you can pick a whole group or one item.

### GROUP A — Trust the source-of-truth (the headline improvement)

**A1. Redundant, multi-method extraction ("2–4 independent readers").** Today: one deterministic method.
Reliable path: run several **independent** methods that fail for **different** reasons, and trust a number
**only when they agree.** The three families of methods:

| Family | How it reads a page | How it fails | Example tools |
|---|---|---|---|
| **Deterministic layout/table parsers** (local, free) | The PDF's own geometry (character/box positions) | **Loudly** — garbled/missing text, easy to spot | pdfplumber, Camelot, Tabula |
| **Cloud document-AI** (trained-model APIs) | Trained OCR + table models on a vendor server | Quietly — usually right, can drift on odd layouts | AWS Textract, Google Document AI, Azure Document Intelligence, Reducto*, Nanonets |
| **AI / LLM readers** (vision models) | "Looks at" the page and reads *meaning* | **Silently** — a plausible wrong number | Claude / GPT-4o** / Gemini vision; LlamaParse; unstructured.io |

*\* Reducto reports ~99% field accuracy on dense financial tables — that's the vendor's own number, not
independently measured. \*\* GPT-4o is a 2024-era model; newer vision models exist. IBM **Docling** is a
**local ML** structural reader — offline, but model-based, not pure geometry — which is exactly why it makes a
good **independent** second reader in the recommended stack below.*

> **Why a MIX, not three copies of one (the key insight for Parinaz):** three copies of the same LLM share
> the same blind spots — they can all be confidently wrong the *same* way, so their agreement means nothing
> (*correlated failure*). Independent methods fail on *different* pages — so when they agree, that's strong
> evidence; when they disagree, you've caught an error a single method would have shipped silently.
> **Honest caveat to say out loud:** independence is never total (different models share training data; an
> ugly layout can fool several the same way) — so agreement is strong evidence, not proof.

**Recommended stack (spans the "loud vs silent" line):** ① a deterministic parser (today's Concord — the
reference vote) + ② an **independent local** structural reader (IBM **Docling** — stays offline) + ③ a
**vision LLM** for meaning (catches renamed labels; votes, never decides alone) + optionally ④ a specialist
doc-AI (Reducto/Azure) as a tie-breaker on the numbers that matter most.

> **Offline-purity trade-off (say to Sharon):** ①+② are local; the strongest accuracy (③ hosted LLM, ④ cloud
> doc-AI) means data leaves the machine. A **fully-offline** variant — pdfplumber + Docling + a *locally-
> hosted* vision model — gives three independent local readers with **zero data egress**, trading a little
> accuracy on the hardest pages. Offering that choice *is* the data-governance answer.

**A2. The orchestrator (the "only trust when they agree" logic) — and why it's TIERED, not "all must
agree."** The orchestrator never compares printed text. Each method outputs a **normalized tuple**
`(canonical_metric, period, unit, basis, value)` and it compares **tuples** — so two readers that both say
"62" but disagree on **basis** (quarterly vs monthly burn) **do not agree.** "Agree" for a number uses a
**metric-family tolerance** (money: within ~0.5% or a small floor, to absorb rounding; percentage-points: an
absolute ±0.1pt band). A **10× gap** (read "$3.4M" as "$34M") is never "within tolerance."

The consensus policy is **tiered** (present this — flat "all must agree" invites *"isn't that too strict?"*):

| Tier | Rule | Result |
|---|---|---|
| **VALIDATED (green)** | All independent threads agree within tolerance | Auto-trusted — the default bar ("refuse rather than fake") |
| **VALIDATED-WITH-NOTE** | A strict majority agrees **and** the agreeing threads are **independent** (not sharing an engine), and the dissenter is a weaker/out-of-family method | Auto-accepted, dissent written into provenance |
| **DISAGREE (⚠ amber)** | No safe quorum, a 2–2 split, or the **most-trusted** thread dissents | → **human-review queue** |
| **UNRESOLVED (grey)** | Too few threads produced any value | → human-review queue |

> **The headline for Parinaz:** *"Count isn't enough — **independence** decides. Two correlated readers can
> outvote the one correct one, so I weight independence and per-method trust, not just the vote."* This is the
> answer to "isn't 'all agree' too strict?" **And be honest about what's measured:** *"This ensemble is
> **designed, not yet built** — so I can't quote a real auto-accept rate until I run it. Measuring how often
> independent readers agree on your packs, and how big the human-review queue is each quarter (and who staffs
> it), is the first thing the run-alongside stage produces."*

**A3. One concrete "complex thread" end-to-end (have this ready if they push for detail).** Trace ClearPay
spendable cash: the deterministic thread ingests the PDF → finds "Cash & Restricted Cash …… 38.4" → scales
×1M → sees **"Restricted"** → finds the companion "of which restricted … 6.2" → computes **operating = 38.4 −
6.2 = 32.2M**, keeps **both** + a note, scores high confidence, emits its record. The vision-LLM thread reads
the same page image and also lands on 32.2; the OCR thread agrees → **VALIDATED $32.2M.** *The instructive
failure:* if the LLM **missed** the restriction and returned 38.4, the threads disagree **on exactly the
number that matters** → ⚠ → human review. That's the system catching, automatically, the one mistake a naive
tool makes silently.

**A4. The all-methods sidebar (extends today's provenance drawer).** Today: click a number → one provenance
record. Future: the drawer shows an **append-only array of thread records** — each method's value,
confidence, snippet — plus a consensus header (which threads agreed, which value was chosen, why). For Sharon
this is an auditor's dream: *exactly* what each independent method saw and **why** the tool trusted (or
refused) the number.

**A5. A real PDF screenshot in the sidebar (future design — label it clearly).** In the review sidebar, show
a **crop of the metric inside the PDF** so a human (or auditor) can eyeball it against the extraction.
**Honesty flag:** this is **future design** — today provenance is file-level (no page number, no screenshot).
Never show a page number or a PDF crop in the *live* demo as if it's real; label it "future design."

**A6. The WARNING signal in the current UI — a small, honest demo you can BUILD to show them (a TODO).** You
can inject **one synthetic disagreement** into the live cockpit so you can *show* the warning working, safely
and offline:
- Add an **optional** `consensus` field to the metric type (nothing else reads it → fully backwards-
  compatible; the backend stays byte-identical). The `IssueRow` already has a `"warning"` severity slot.
- Attach a `consensus: { state: "disagree", threads: [...] }` block to **one neutral cell** (a plain SaaS cash
  cell — *not* a flagship like NovaCloud/LendBridge/ClearPay). Two threads say $17.9M, the LLM says $17.0M.
  Keep the grid's shown value = the deterministic value (grid still looks correct); the icon only *flags* it.
- Render a small **⚠** on that cell; clicking it opens the existing drawer, now with an **"Independent
  methods"** section + a **"Sent to human review"** line, headed **"Prototype of the redundant-consensus
  design (synthetic data)."**
- **What you say live:** *"See this warning triangle? Behind this number I ran three independent methods — two
  agreed, one disagreed. I click it, and the same drawer now shows every method's answer and tells me it's
  gone to a human. This one's synthetic — I injected the disagreement so you can see the signal — but this is
  the exact control that makes it production-grade."*

### GROUP B — Understanding over time (change, not just levels)

**B1. %-change over time — already on screen (two live examples):**
- **NovaCloud ARR $24.1M → $34.2M = +42%** across 5 quarters, one clean line — the caption notes it spans **2
  source labels** stitched together. *One dot became five.*
- **In-cell "Trend" toggle:** each cell keeps its latest number + a sparkline + a plain change line (the
  format: **"▲ +8% vs Q1 2025 · latest Q2 2025"** — that's a *quarter-over-quarter* change). For **percent
  metrics the change is in *points***; over NovaCloud's **full 5 quarters**, NRR 115%→123% = **+8.0 pts** and
  churn 7.8%→5.8% = **−2.0 pts** (falling churn is good, but the naive colour paints it red — a flagged
  exception). A third easy one: **LendBridge revenue $10.1M → $12.7M (+26%)** even though its margin is
  refused.
- **Honest catch:** each sparkline is **self-scaled**, so two lines' heights aren't comparable — magnitude
  stays the job of the number + the peer heat colour.

**B2. Timeline improvements (roadmap ideas):**

| Idea | What it does | Why it helps this room |
|---|---|---|
| **Shared-axis toggle** for sparklines | Optional "same scale" mode so two mini-trends *are* height-comparable | Fixes the self-scaled honest catch |
| **Quarter-alignment / stale-lag marker** | Line everyone up on the same calendar quarters; mark who's behind (**FleetLink is a quarter behind, Q1 2025**) | A quarter-old number must never read as current |
| **Rebase-to-100 ("index") view** | Start every company at 100; show *relative* growth | Compares growth *shapes* despite size gaps |
| **Event markers on the line** | Flag where a label was **renamed** (NovaCloud ARR) or a value **restated** (ClearPay 38.4→32.2) | An audit trail *on the chart* |
| **Gaps drawn as gaps** | Keep 1–2 quarter companies as **dots, not fake lines**; show missing middle quarters as breaks | Honest — don't imply data that isn't there |
| **QoQ vs YoY switch** | Quarter-over-quarter vs year-over-year | "Recent momentum" vs "annual trajectory" |
| **Confidence on the line** | Shade points by extraction confidence (90.4–99.5%) | Ties the trend back to trust |

### GROUP C — The reading layer (LLM summaries — a suggestion you can argue with)

**C1. Per-company summary.** After the numbers are clean and comparable, an LLM reads one company's time
series and writes a short *"here's the story"* note — explicitly a **suggestion.** The human accepts,
corrects, or rejects, and can comment. **Next quarter the LLM reads last quarter's human comments first**, so
it learns the house view. Why it's safe: it reads **over already-normalized, provenance-tagged numbers** — it
can't inject a wrong figure, only a wrong *interpretation*, which the human immediately refutes.

Real examples (faithful to the demo):
> **NovaCloud:** *"Compounding well — ARR $24.1M → $34.2M (+42%), margin 74%→78%, churn 7.8%→5.8%, NRR
> 115%→123%. The one caution: cash fell every quarter, $29.5M → $19.6M — healthy P&L, shrinking runway;
> confirm the funding plan."*
> **Human comment (feeds next quarter):** *"Cash drop is a planned strategic outlay, not operating burn — don't flag as a
> runway risk again."* → next quarter the AI already knows this.
> **ConstructIQ:** *"The retention laggard — NRR 112% (lowest), churn 6.3% (highest), still healthy in
> absolute terms. Burn is reported quarterly, so runway is shown as not-captured rather than guessed."*
> **ClearPay:** *"Headline cash $38.4M, but $6.2M is restricted client float — comparable operating cash is
> $32.2M. Use the restated figure for any runway comparison."*

**C2. Overall-portfolio summary (one level up):**
> *"Across the equity book: retention broadly strong (most NRR 115–123%); NovaCloud the standout grower
> (+42% ARR) but cash trending down; ConstructIQ trails on retention; ClearPay's real liquidity is $32.2M not
> the $38.4M headline; LendBridge's 'gross margin' is excluded on purpose (a lender's interest margin, not
> comparable). Two follow-ups: 10 expected-but-missing metrics, and FleetLink is a quarter behind."*

**Guardrails to say out loud:** it's a **suggestion, never a decision** (label it on screen "AI suggestion —
review"); it reads **only over clean, provenance-tagged numbers**; **human refute + comment loop**; it
**cites the numbers it used** (every claim links back to a source); **no dollar-ROI or fund-return claims.**

### GROUP D — Label-drift, made smarter (3 options + trade-offs)

Today Concord uses three deterministic layers (a canonical registry of 8 metrics + a per-company alias map +
footnote-equivalence stitching). The gap: **undeclared renames** (NovaCloud's *Total Billings → Recognized
Revenue* has no footnote) and **brand-new labels**. Three ways to attack that tail — **all suggest-only, a
human always ratifies:**

| Option | How it works | Best at | Trade-offs |
|---|---|---|---|
| **A. Fuzzy / string similarity** | Compare letters ("Contracted ARR" vs "Contract ARR" → 95%); queue if similar **and** same unit/basis | Near-miss spellings | Cheap, inspectable score; but "gross margin" (SaaS) vs "gross margin" (lender) look identical → **must** gate by unit + basis |
| **B. Embedding / semantic similarity** | Turn each label into a vector (captures *meaning*, not spelling); find nearest metric | Same-meaning-different-words ("Annual Recurring Revenue" ↔ "Yearly Subscription Value") | Harder for a human to eyeball; can pull in a *related but different* metric → gate hard |
| **C. Constrained-LLM** | Ask an LLM: *"which of these 8 canonical IDs — or 'unknown'?"*, must quote the source sentence | Prose-only / never-seen labels | Non-deterministic, slower, per-call cost; safe *only* if constrained to the registry + human-approve |

> **The thread that ties them (a *learning rulebook*):** none is trusted alone — each only ever *suggests.*
> When a human approves a suggestion, it's written into the versioned rulebook **once** and never asked again.
> *"The AI proposes; the human decides; the **decision** — not the AI — becomes the durable, auditable rule."*
> **One-line framing:** *"The deterministic layers do the heavy lifting; fuzzy/embedding/LLM only ever raise
> their hand and say 'this might be the same — a human should look.' The tool would rather ask than silently
> merge."*

### GROUP E — Currency (the PeopleFlow GBP example + the honest roadmap)

**On screen:** PeopleFlow carries a **"· not comparable (GBP)"** flag — one label reads "Net Pound Retention
(NPR)," the tell that its figures may be in British pounds. So the tool **refuses** to put it on a dollar
axis.

> **The honest limit you MUST own:** this flag is a **front-end rulebook rule, not captured data.** In the
> live payload PeopleFlow's `currency` is `null` and every row is `comparable` — **the parser does not see the
> £.** Say it plainly: *"today's parser doesn't capture the currency symbol, so a human-owned rule catches it
> instead — the same rulebook pattern used everywhere in the tool."*

**Roadmap (how currency becomes real, honestly):**
1. **Parser captures the currency** (read £/GBP into the payload instead of `null`) → move the flag from a
   front-end rule to captured data.
2. **Convert *levels* only, with a dated rate** — FX-convert Revenue/ARR using a dated FX table, recording
   `fx_rate`, `fx_source`, `fx_date`. *(A converted figure traces to pack + external rate → not purely
   file-traceable; say so.)*
3. **Refuse to convert *ratios*** — an NRR of 118% is an LTM ratio computed in GBP; tag it, don't touch it.
   Converting a percentage is nonsense.
4. **Refuse over convert (the philosophy)** — where the rate/basis is unknown, **flag** rather than guess.

> **One line:** *"Concord refuses to mix pounds and dollars — it does not convert them yet. Capturing the
> symbol and adding a dated, auditable FX rate for *levels only* (never percentages) is the roadmap."*

### GROUP F — Intake, change-tracking, and alerts

**F1. Intake — get the packs in the way the team already saves them.**

| Option | Effort | How automatic | Trust / control | Best when |
|---|---|---|---|---|
| **A. Cloud-storage connector** *(Azhar's idea — start here)* | Low–Med | High (auto-pickup) | Good (read-only, scoped) | The team already saves packs to one shared drive (SharePoint/OneDrive/Drive/Box/S3) |
| **B. Secure upload portal** (behind Sagard SSO) | Med | Low (manual) | **Highest** (every upload logged) | You want an explicit, audited "I'm submitting this" action |
| **C. Email-forwarding inbox** (`q-reports@…`) | Low | Med | **Weakest** (needs sender allow-list) | Packs already arrive as email attachments |
| SFTP / drop folder | Med | High | Good | A counterparty sends machine-to-machine |
| Data-room / monitoring-system integration | High | High | Highest | The long-term "single source of truth" — do this later |

> **Recommendation:** ship **A** first (fits the existing habit, no behavior change); keep **B** as the
> controlled fallback; treat **C** and deep integrations as later phases. *"Whatever the door, intake is
> read-only and scoped — Concord never writes back to the source."*

**F2. Change-tracking with a file hash (new = run, changed = re-run).** A **hash** (e.g. SHA-256) is a short
fingerprint of the whole file. Same file → same fingerprint; change one digit → a completely different
fingerprint. It's **content-based, not name-based** (a company can keep the same filename but upload corrected
content — the hash catches it; a pure rename gives the same hash → no pointless re-run). Concord keeps a small
**manifest** (company+period, filename, hash, last-run, run-id) and on each check:

| Case | What it sees | What Concord does |
|---|---|---|
| **New** | Not in the manifest | **Run**, add a row |
| **Changed** | In the manifest, **hash differs** | **Re-run**, update the row, flag *"restated — was X, now Y"* for review |
| **Unchanged** | Same hash | **Skip** — save the compute |

> **Why it fits the room:** for Sharon, every run ties to a fingerprint + timestamp — *"which exact version of
> the pack produced this number?"* is answerable precisely; a re-run records that the source **changed**, it
> doesn't silently overwrite history. For Parinaz it's deterministic and cheap — no AI to decide "did the file
> change." **Honest limit:** a hash tells you *that* a file changed, not *what* — Concord still re-parses to
> show the "was $38.4M, now $32.2M" difference.

**F3. Alerts (Email / Slack / Teams) — a heads-up, never a verdict.** When a fresh run makes the AI summary
read *"Company X worsened — ARR down, churn up, cash falling,"* push a notification so the right person sees
it fast (not three weeks later at close). **The non-negotiable rule:** the alert **never triggers an action.**
It says *"something looks worse — a human should look,"* and links straight to that number's provenance
drawer. A human confirms the source-of-truth before anything moves.

- **What's in the message:** a plain headline (*"NovaCloud Q2 2025 — cash has fallen every quarter,
  $29.5M → $19.6M"*), the **AI reason clearly labelled as AI** (*"AI read: worsening because burn outpaced
  new ARR"*), a confidence/basis note, a **"Verify in Concord"** link, and *"Please confirm the source before
  flagging to the deal team."*
- **Channels:** Slack/Teams for the *"look now"* nudge (add a ✅ Reviewed reaction for a light human sign-off);
  Email for the durable record + weekly digest. Both carry the same "verify before you act" line.
- **Guardrails:** thresholds not chatter (alert only on meaningful moves / restatements) to avoid alert
  fatigue; the AI cause is a **hypothesis**, the number-moved is the **fact** — always separate them; **no
  auto-action, ever**; this is roadmap (Concord is offline/manual today).

**F4. Download + email the report (with AI comments + human sign-off).** Once a run is human-validated,
export a clean report (the comparable table + the provenance + the AI summary **marked as a suggestion** +
the human's confirming note) and email it to the right people. Same rule: nothing goes out until a human has
signed off; the export carries the audit trail so the recipient can trace every number.

### GROUP G — Auth, permissions, and the human-in-the-loop correction workflow

Built for a **compliance-minded** operations team (Sharon's world). None of this exists yet — it's the
natural next layer on top of two controls Concord **already** has (provenance + refuse-to-compare).

**Design principles (the compliance spine):**
- **Never overwrite silently.** The extracted value and every human action are **both** kept — a correction
  is a *new state*, not a replacement. The original never disappears.
- **Human-in-the-loop.** The machine only **flags** (disagreement, low confidence, refused); a **human
  decides.** It never quietly "fixes" a number.
- **Segregation of duties (maker-checker / 4-eyes).** Whoever *suggests* a change is **not** whoever
  *approves* it — the classic control a Chief Compliance Officer expects.
- **Least privilege.** Users see only the companies they're assigned to (information barriers between deal
  teams).

**Roles:**

| Role | Can do | Cannot do |
|---|---|---|
| **Viewer** (e.g. LP-reporting reader) | Read metrics, provenance, comments; export the audit report | Change anything |
| **Analyst / Submitter** | Run extraction; **suggest** a correction; **add comments** ("NovaCloud is doing well because…"); flag a value | Approve their own suggestion; edit source data |
| **Reviewer / Approver** (ops lead) | Accept/reject suggestions; **correct a flagged (warning) metric and send it to revision**; resolve exceptions | Rewrite audit history; manage users |
| **Admin / Data governance** | Manage roles; own the alias & currency rulebook + thresholds | Silently edit values — any edit is logged like everyone else's |

Plus **scope-based access** (per company / fund / strategy).

**The correction workflow (states of a value):** `Extracted` → **Verified** (ensemble agrees) *or* **Flagged
/ Warning** (disagree / low-confidence / refused). A human can then: **Suggest** (value doesn't change; gets a
"suggestion pending" badge) → **Approve/Reject** by a *different* user (maker-checker) → value moves to
**Corrected**, keeping *old → new → who → when → why*. **Comments** are timestamped, authored, and kept
**separate from the number** (a note is not data).

**The audit trail (the heart of it, for Sharon):** an **append-only, immutable log** — who, which field, old
→ new, when, why — plus full lineage per number (original extracted value + provenance + human edit history),
**exportable** to survive an auditor or LP challenge.

| Sharon's control | How Concord provides it |
|---|---|
| Segregation of duties (4-eyes) | Suggest and approve are different permissions, different people |
| Immutable audit trail | Append-only log of who/what/when/why |
| Source-of-truth preserved | Values never overwritten; original + provenance retained |
| Least privilege / information barriers | Per-company / per-fund scoped access |
| Human sign-off gate | Nothing reaches a report as "corrected" without an approver |

> **The honest bottom line:** *"The reliable version of Concord isn't 'more AI.' It's **more agreement, more
> human judgment, and a complete record of both** — the ensemble raises warnings, a human decides, and every
> decision is permanently traceable."*

---

## 9. How to scale — 2 options (honest: not production-ready) — 2 min

Say it plainly first: *"Concord today is a **prototype, not a production system.** It runs offline in memory,
one deterministic method, no database, no login. The 76%→90% recall is real but measured on 24 synthetic PDFs
— enough to prove the idea, not to promise production reliability."*
>
> **How recall was measured (have this ready — Parinaz will ask):** recall = values captured correctly ÷ the
> **128 numbers physically printed** across the 24 PDFs; the **76%→90%** jump came from a **backend parser
> fix**, not a changed test set; and recall paired with **0 wrong values** is the right measure because *a
> confidently-wrong number is worse than a flagged-missing one.*

Then:

| Dimension | **Option 1 — Harden in place** (incremental, low-risk) | **Option 2 — Cloud re-platform** (event-driven, multi-tenant) |
|---|---|---|
| What it is | Keep the working engine; add a **durable store**, a **job queue + retries**, and the **redundant-extraction ensemble**; keep it offline/on-prem; grow the test set + measure recall continuously | PDFs land in object storage → file event → queue fans out one job per PDF → managed doc-AI workers → database → publish → notify; multi-tenant, auto-scales for quarter-end bursts |
| Reliability | High gain fast (the ensemble is the biggest single lever; queue+store remove "one crash loses everything") | Highest *ceiling* — but only after real hardening + monitoring; more parts to watch |
| Effort | Medium (reuses the engine; weeks) | High (new infra, tenancy, security review; months) |
| Cost | Low–Med (mostly engineering; LLM only on the ambiguous tail) | Med–High (always-on cloud + per-page doc-AI + storage + ops) |
| Risk | Low (every step additive + reversible; deterministic core stays as a canary) | Med–High (bigger blast radius; **data leaves on-prem** — a real compliance/data-residency question; vendor lock-in) |

> **Recommendation:** *"Do Option 1 first; treat Option 2 as the destination. Option 1 buys the reliability
> that matters — agreement-based trust + retries + a real store — at low risk, and keeps the offline posture.
> Its decoupled stages are also the on-ramp to Option 2. Move to Option 2 only when volume, bursts, tenants,
> or SLAs justify it — and only after the data-residency question is answered."*

---

## 10. Fun fact — 1 min (relax the room)

> *"I should confess where my time actually went. The **least** of it was building the tool. Most went to
> **learning your world** — what Sagard does, how a PE firm actually makes money, the financial vocabulary,
> and figuring out what a tool like this could *really* solve. The hardest part wasn't the code — it was
> learning enough of your world to point the code at the right problem."*

**The contrast that makes it memorable (and shows growth across the two rounds):**
- **My first take-home solved the *deal partner's* need:** scrape a company off the web → a signal in Slack.
  That job is **speed over precision** — keep a deal moving, a rough read is fine.
- **This round, the *operations* team needs the opposite: precision** — a number you'd sign your name to,
  traceable to its source, with a wrong answer **refused** rather than guessed.
- **Same builder, two rounds, two opposite trust postures** — speed for the deal team, precision for
  operations. Realizing *that* — not writing the parser — was the real work.

Say it with a smile: it tells Parinaz you respect the problem over the toy, and tells Sharon you took *her*
world seriously before touching code.

---

## 11. Ask for questions / goodbye

> *"That's Concord — comparability as the product, every number one click from its source, and a clear path
> to the reliable, redundant version. I'd love your questions — and I have a few for you."*

---

## 12. My questions for THEM (ask throughout, not just at the end)

**A. Validate my map ("correct me"):**
- *"Quick sanity check: Sagard makes money two ways — a management fee that keeps the lights on, and carried
  interest that's the real upside, but only after your LPs get their capital and preferred return back. Where
  am I wrong?"*
- *"I scoped Concord to the **direct PE portfolios**. With the solutions business (from the Unigestion deal —
  re-verify) and the credit book in the mix, is portfolio-company monitoring the right place to start — or is
  the sharper pain elsewhere?"*

**B. The real customer (Sharon):**
- *"I assumed the team that hand-keys these packs is Portfolio / Reporting Operations. **Who actually owns
  that today** — one person, a team, offshore, a vendor? And how many companies × packs per quarter?"*
- *"What breaks trust **first** for that team — a wrong number, a missing number, a slow refresh, or a number
  they can't trace to its source?"*
- *"What would this have to prove before your team let its numbers reach an investment committee or an
  auditor?"*

**C. Is this a real problem?**
- *"Be honest: is the quarterly-monitoring grind actually worth solving, or already handled well enough that
  I'm polishing the wrong corner?"*
- *"If this existed and worked, **whose quarter gets meaningfully better** — and would anyone change how they
  work?"*

**D. AI culture (the strategic ones):**
- *"How does each team feel about AI today — is the operations/controls side excited, cautious, or burned by a
  past over-promise?"*
- **(the one I most want your read on)** *"Is Sagard trying to be **AI-first but human-decision-driven** — AI
  does the heavy lifting, a human still decides — across *every* team? Or is AI mostly owned by the
  AI/engineering group, and the business teams consume what you build?"*
- *"Parinaz — where have you seen AI over-promise inside a firm, and what separated a tool people trusted from
  one they quietly stopped using?"*

**E. The role (FDE):**
- *"Six months in, what did a **successful** Forward Deployed Engineer here actually *do* that the firm
  valued?"*
- *"What's the failure mode — where does someone with strong engineering skills still not work out in this
  seat?"*

> **If you only ask three:** B1 (who really owns the grind), D2 (AI-first-but-human-driven?), E1 (what does a
> successful FDE do). Those give you the customer, the culture, and the scorecard.

---

## Appendix — honesty guardrails + facts to re-verify (read before the room)

**Never over-claim (the verifier flagged these):**
- **Currency:** the tool **normalizes units + scale**, and **flags/refuses** on a different currency — it does
  **NOT** convert. PeopleFlow's GBP flag is a **front-end rule**; the parser doesn't see the £.
- **Provenance is file-level** today (no page number/screenshot in the drawer). The PDF-screenshot sidebar is
  **future design** — never show a page number or crop live as if real.
- **Consensus is tiered**, not "all must agree" — say "unanimous is the green bar; 2-of-3 *with independence*
  is the practical rule." Independence is never total — say so.
- **"Deterministic because of limited time; one method is not production-grade"** — keep this honest register;
  don't over-sell the current build.
- **No invented ROI/dollar numbers.** Time-savings stays qualitative. Recall = **76%→90%, 0 wrong values,
  0 *sector-blind* false alarms (15→0)**, measured on **24 synthetic PDFs** (denominator = the **128 numbers
  physically printed** across them; the jump came from a **backend parser fix**, not a changed test set). Say
  "synthetic" every time. **Never say "0 false alarms" unqualified** — the raw missing-metric flag still has a
  couple of false positives (CarbonTrack/TalentVault) suppressed on the grid.
- **Hook #3's "95% accurate" is hypothetical** — keep it clearly separate from your real 76%→90%.

**Re-verify on sagard.com the morning of (don't hard-assert):** AUM (~US$46B), portfolio-company count
(190+), staff (540+), **mid-market fund sizes** (~$500M–$4B), the "$100B by 2029" goal, and the **Unigestion acquisition** (that it closed, and
when). Say "roughly" and "as of their latest public figures."

**Vendor facts to state carefully:** IBM **Docling / Granite-Docling** is **2025** (drop the exact month
unless you check); the "**68%** of extraction errors are hallucinated numbers" is a **vendor analysis, not a
peer-reviewed study** — lean on the *mechanism* (LLMs fail silently; deterministic parsers fail loudly), not
the number; **Reducto ~99%** is the **vendor's own** benchmark; **GPT-4o** is 2024-era (newer vision models
exist).
