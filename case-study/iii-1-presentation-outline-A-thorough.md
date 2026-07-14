# Document iii-1 — Presentation Outline **A: THOROUGH** (every section filled)
### Sagard "Concord" — the case-study talk, written out

> **What this is.** Your full outline, in your order, with **each section filled in** — what to say, the key
> lines, the honest caveats, and **every** product improvement detailed (nothing left out; you choose what to
> say live). This is the deep reference **and the decision-locked source of truth** — each section opens with a
> **🔒 DECISION — LOCKED** block that a downstream slide-builder follows verbatim. The slide-by-slide build
> sheet (punchy titles + anchor phrases + graphics) is `iii-3-slide-index-A.md` — **Outline A only.**
> *(The old lean **Version B** — `iii-2-presentation-outline-B-lean.md` — has been retired; it is kept only as
> a superseded reference. Build the deck from this doc + iii-3.)*
>
> **The room:** **Parinaz Sobhani** (Head of AI — rigor, trust, right-sized AI, punishes hype and the
> "prototype trap") + **Sharon Liu** (Head of Operations, ex-Chief Compliance Officer — controls, audit
> trail, reconciliation, source-of-truth, data residency). One AI judge, one operations/controls customer.
> **Not** finance-math judges — never drift into fund returns / NAV / waterfall math beyond light fluency.
>
> **The tool = Concord.** Deterministic, offline, provenance-tagged, refuses unsafe comparisons. Thesis:
> *"Same label doesn't mean the same metric — comparability is the product, not extraction."*
>
> **Simple-language promise:** short sentences, plain words, jargon explained once.
> **Honesty promise:** no invented numbers; time-savings stays qualitative; every demo figure is faithful to
> `cockpit-frontend-guide.md` and `demo-honesty-script.md`.

---

> **For the slide-builder (human or LLM) — how to read this doc.** Each section opens with a
> **🔒 DECISION — LOCKED** block. That block is **authoritative**: it states exactly how many slides the
> section becomes, each slide's title + on-slide anchors + graphic, what is **spoken but never printed**
> ("Speak, don't slide"), and what is **backup only — never a slide.** Build slides **only** from the locked
> blocks; the prose beneath each block is the speaker's rationale and detail, **not** slide copy. If the prose
> and a locked block ever disagree, the **locked block wins.** Every number is honest per the Appendix
> guardrails (read them before the room).

## The running order (Version A — Thorough)

| # | Section | ~Time | Its one job |
|---|---|---|---|
| 0 | Intro (you) | 1 min | Who you are — an FDE who understands your world first |
| 1 | The hook question | 1 min | One question that makes both minds lean in |
| 2 | Assumptions ("correct me") | 6–8 min | Show you learned their world; invite them to fix your map |
| 3 | The problem | 3 min | The Operations team's manual quarter-close monitoring |
| 4 | How we solve it | 5–6 min | The engine + why deterministic + the redundant path I'd build |
| 5 | What AI can automate vs not | 2 min | AI-first, but human-decision-driven |
| 6 | Time saved (qualitative) | 1 min | Trust first, hours second, no invented numbers |
| 7 | **Live demo** | 8–10 min | The proof, run **live from the app** (one title slide) |
| 8 | Future improvements (product only) | 4–6 min | The reliable, production path (show A/C/E/G; B/F backup) |
| 9 | How to scale | 2 min | Prototype → production; the depth lives in `iv-…` |
| 10 | Where my time actually went | 1 min | The time bar: understanding dominates — that's the FDE job |
| 11 | Ask for questions / goodbye | — | Hand over + the final punch |
| 12 | My questions for them | in Q&A | Validate your map; learn the culture |

*(This is long on purpose. Version B trims and re-orders it to land in ~35 min.)*

---

## 0. Intro (you) — ~1 minute

> 🔒 **DECISION — LOCKED (§0 Intro):**
> - **Slides:** exactly **1**.
> - **Slide 0.1 — title (the point):** "An FDE starts in your world — not in the code"
> - **On-slide anchors:** "the FDE job: an ambiguous problem → **understand your world** → solve the real one" · "Xavier Medina — software engineer · 4+ yrs shipping production AI (ProsperaLabs: voice · chat · email)" · "so here, most of my time went to understanding YOUR world, not coding"
> - **Graphic:** a left-to-right **FDE arc** — "an ambiguous problem" → a **big, dominant UNDERSTAND YOUR WORLD node** (Sagard · PE · the Ops team) → "build the right thing." The understand node is by far the largest — it foreshadows the §10 time bar. **No Concord wordmark on this slide** — the brand first appears in §4/§7; keep the intro about the person.
> - **Speak, don't slide:** the FULL bio quote and the FULL humility-pivot quote are spoken, never printed — only the three anchors appear. Deliver the bio confidently (it *earns* the honesty), but the slide's **point is understanding-first** — that is the FDE job.
> - **Backup only — NEVER a slide:** none.
> - **On-slide honesty caveat (small):** none — the honesty ("most of my time did not go into coding") lands harder spoken. Keep "production-grade" tied to **ProsperaLabs, never to Concord** (Concord's shipped demo is a single deterministic pass — explicitly not production-grade).

The slide's **point is understanding-first** — that is what an FDE does. In *delivery*, still open with the bio
**confidently** — it *earns* you the right to say, later, "one method is not production-grade."
Then your FDE motivation. Then the humility pivot.

> *"I'm Xavier. I'm a software engineer — for 4+ years I've **built AI-powered, production-grade systems,
> end to end**. Today at ProsperaLabs I automate real customer workflows across **voice, chat, and email** —
> for ecommerce, real-estate, legal, and customer-service teams — to create real value. I like **owning a
> product end to end**: taking an **unclear problem**, making **reasonable assumptions**, shipping a **first
> useful version** that can scale, making it **reliable enough to trust**, and then improving it from **real
> user feedback.**"*

Then the pivot — say it warmly:

> *"That's the builder in me. But I want to be honest about this case study: **most of my time here did not go
> into coding.** It went into learning **your** world — how Sagard makes money, who does what, and where a tool
> like this could solve a real problem, not a toy one. So let me show you my map, and please correct me."*

**Why this order — confident bio first, humility second — matters (delivery note):** confidence first tells Parinaz you've shipped real AI, so your
later honesty reads as *expertise, not hedging.* Humility second tells Sharon you took *her* world seriously
before touching code. It also plants the **time bar** you land in §10.

---

## 1. The hook question — 1 minute

> 🔒 **DECISION — LOCKED (§1 The hook question):**
> - **Slides:** exactly **1**.
> - **Slide 1.1 — title (the point):** "Two opposite readers, one shared data layer"
> - **On-slide anchors:** the hook **#6** printed verbatim as the slide's main line — *"When your deal partner and your valuations analyst open the same quarterly pack, they need opposite things from it — what if one clean, traceable data layer could serve both?"* · small sub-label "same pack · opposite needs · one source of truth"
> - **Graphic:** two persona silhouettes (deal partner ↔ valuations analyst) reaching from opposite sides toward ONE shared data-layer bar under a single quarterly pack — "speed" tagged one side, "precision" the other. **Do NOT** use the SaaS-vs-lender "same 60%" column visual here — that reveal is owned by §4.
> - **Speak, don't slide:** the elaboration ("Parinaz hears *meaning depends on who's reading*; Sharon hears *one source-of-truth serving many jobs*").
> - **Backup only — NEVER a slide:** all five alternates. Rule: **#6 is THE hook and the only one that reaches a slide;** speak at most ONE alternate if the room wants a different door; **never stack two.** If alt 3 is spoken, keep its "95%" clearly **hypothetical** — never blend it with the real 76%→90% recall on 24 synthetic PDFs.
> - **On-slide honesty caveat (small):** none — #6 carries no numbers. Note for the builder: "traceable" here means **file-level** provenance — do **not** escalate it to page- or sentence-level tracing on the slide.

Open with **one** short question that makes both people lean in. **Hook #6 is THE hook — the only one that reaches a slide.** It stages the whole talk in one breath: two
readers, opposite needs, one shared data layer. Keep the other five as **spoken backup only** — pick just one
to re-open if the room wants a different door, and **never put an alternate on a slide or stack two hooks.**

**THE hook (#6):**

> ***"When your deal partner and your valuations analyst open the same quarterly pack, they need opposite
> things from it — what if one clean, traceable data layer could serve both?"***
> → It shows you understand the **personas** and the **speed-vs-precision** tension in one breath. Parinaz
> hears *"meaning depends on who's reading"*; Sharon hears *"one source-of-truth serving many jobs."* It opens
> straight into §2 (the personas) and sets up the whole talk.

**Alternates — spoken backup only, never a slide (pick ONE if the room wants a different opening; never stack two):**

1. **"Two of your portfolio companies both report a 60% 'gross margin.' One is a SaaS business, one is a
   lender. Should they ever sit in the same column?"**
   → Stages the thesis in one breath. *(Note: the **visual** for this now lives in §4 as the thesis reveal —
   here it's just the spoken question.)*
2. **"A number in one of your quarterly reports is wrong. Would you rather your tool told you loudly — or
   quietly filled the gap so the report still looks complete?"**
   → Sets up *"a silent blank is more dangerous than a loud error."*
3. **"If I handed you a fully-automated dashboard that was 95% accurate, would you put its numbers straight in
   front of your investment committee?"** *(keep "95%" clearly hypothetical — never confuse it with your real
   76%→90% recall on 24 synthetic PDFs)*
   → The answer is *no* from both — and that *no* **is your pitch** (human-in-the-loop, provenance, refuse).
4. **"Everyone can build a demo that pulls numbers out of a PDF now. What makes a number one your team would
   actually sign their name to?"**
   → Names Parinaz's "prototype trap" and flips it to trust/provenance; Sharon hears *"sign-off."*
5. **"How many hours does your team spend each quarter re-typing PDF numbers into a spreadsheet — before
   anyone has made a single decision?"**
   → Makes the pain felt in Sharon's exact world; quantifies the grind *without inventing a figure* (they
   answer).

---

## 2. Assumptions — "here are my assumptions, correct me" — 6–8 min

> 🔒 **DECISION — LOCKED (§2 Assumptions — "correct me"):**
> - **Slides:** exactly **5**. This section renders as **5 slides per this block**; the `### 2.1 / ### 2.2` prose sub-headers below are speaker narration, **not** the slide split. Locked core = the two pictures + the persona map + the customer call-out + the tension line. **ALL fund-money mechanics (money flow, "2-and-20", "the mark") are spoken only — never printed.**
>
> - **Slide 2.1 — title:** "Four strategies, one focus — Concord starts with your direct PE portfolio companies"
>   - **On-slide anchors:** "VC · PE · Private Credit · Real Estate" · "PE = where Concord focuses today" · "the rest = documented extensions, not v1"
>   - **Graphic:** four strategy tiles in a row; the **PE** tile enlarged + accent-ringed "← Concord focuses here today"; the other three **dimmed/greyed-out**, labelled "documented extensions, not v1". **Footnote (keep verbatim):** "*re-verify Sagard's strategy line-up + scale figures on sagard.com the morning of; print NO AUM / portfolio-count / fund-size numbers as fact.*"
>   - **On-slide honesty caveat (small):** "v1 = PE only; the other three branches are documented extensions, not built."
> - **Slide 2.2 — title:** "Fundraise → invest → hold → exit: Concord lives in the quarter-by-quarter middle"
>   - **On-slide anchors:** "Fundraise → Invest → HOLD / MONITOR → Exit" · "a fund lives ~10 years" · "monitoring = the quarter-by-quarter middle"
>   - **Graphic:** horizontal 4-stage fund-cycle arrow, glowing pin on stage 3 "HOLD / MONITOR = Concord's home".
>   - **On-slide honesty caveat (small):** "Concord feeds the inputs to *the mark* — it never makes the mark (a human, audited judgment)."
> - **Slide 2.3 — title:** "Five people read the same pack — for opposite jobs"
>   - **On-slide anchors:** the persona map, rendered as a table with columns **Persona · What they DO (short) · Trust posture**, with **row #2 (Reporting Operations + Controls) highlighted** and tagged "⬅ our customer" · sub-note "speed vs precision"
>   - **Graphic:** the 5-row persona table (exactly those three columns), row #2 highlighted.
>   - **On-slide honesty caveat (small):** "these are my assumed roles — please correct me."
> - **Slide 2.4 — title:** "Controls, reconciliation, audit trail — that's our customer, not Value Creation"
>   - **On-slide anchors:** "owns the quarterly monitoring, reconciliation & reporting grind" · "must trust AND trace every number" · "controls · source-of-truth · audit trail" · "NOT operating-partner / Value Creation"
>   - **Graphic:** a single customer-spotlight card for persona #2 (three control words: reconcile · trace · sign-off) with a struck-through "Value Creation / operations" chip.
>   - **On-slide honesty caveat (small):** "(my assumption — one person, a team, or a vendor? one of my questions for you.)"
> - **Slide 2.5 — title:** "One messy PDF must serve speed AND audit — that is the whole problem"
>   - **On-slide anchors:** "deal team wants a fast directional read" · "valuations / LP-reporting / credit want an audited, reconciled number" · "one source-traced, refuse-when-unsure layer serves both"
>   - **Graphic:** two arrows (speed / precision) converging into one "source-traced · refuse-when-unsure data layer" box; echoes hook #6, hands into §3.
>   - **On-slide honesty caveat (small):** none.
>
> - **Speak, don't slide (all §2):** the framing line ("I'll show my mental model of your world — stop me and correct me"); the money flow said quickly (**LP → GP (Sagard) → portfolio company → exit → money back to the LP**); **"2 and 20"** in one line (~2% management fee + ~20% carried interest, paid only after LPs get their money back **plus a preferred return**); the full *mark* line (each quarter the GP **estimates** fair value — "the mark" — a human, audited judgment; Concord feeds the inputs, never makes the mark); the admitted unknown ("I've assumed a team owns this grind — one person, a team, or a vendor?"). **Say the branch line-up and the "solutions / fund-of-funds" arm "roughly — I'll re-verify on sagard.com."**
> - **Backup only — NEVER a slide:** deeper fund mechanics (NAV roll-up, the waterfall, the "solutions" / fund-of-funds arm, the Unigestion story) only if the room pulls you there — never drift into fund-return math. Sagard scale figures (AUM ~US$46B, 190+ portcos, ~$500M–$4B fund sizes) stay spoken and "roughly," re-verified the morning of; never printed on a slide.

**Framing tip (say this out loud):** *"I'm going to show you my mental model of your world. You live this
every day — so please stop me and correct me where I'm wrong."* That one sentence turns a section that could
feel like *teaching finance to finance experts* into an **invitation to engage** — which is exactly what an
FDE does. Move fast; this is background fluency, not a lecture.

### 2.1 Where Concord sits in Sagard's world (two pictures do the work)

Lead with **two simple pictures**. The money-flow, "2-and-20," and "the mark" lines are light supporting
fluency — say them quickly, **don't print them.**

**Picture 1 — Sagard's branches (which one we're solving for):**

[graphic: four strategy tiles in a row — **VC · PE · Private Credit · Real Estate** — the **PE** tile enlarged and accent-ringed "← where Concord focuses today"; the other three shown **dimmed/greyed-out** and labelled "documented extensions, not v1"; small footnote "*re-verify Sagard's strategy line-up + scale figures on sagard.com the morning of"]

> *"Sagard invests through several branches — **venture (VC)**, **private equity (PE)**, **private credit
> (PC)**, and **real estate** (plus a big 'solutions' / fund-of-funds arm). I scoped Concord to just one:
> the **direct PE portfolio companies** — the packs in my demo. Credit and the rest are natural extensions,
> not v1."*

**Picture 2 — the fund cycle (which stage we live in):**

[graphic: horizontal 4-stage fund-cycle arrow — **Fundraise → Invest → HOLD / MONITOR → Exit** — a glowing pin dropped on stage 3 "**HOLD / MONITOR = Concord's home**"; small caption "a fund lives ~10 years; monitoring is the quarter-by-quarter middle"]

> *"A fund lives about **10 years** and moves through four stages: **raise** the money, **invest** it in
> companies, **hold and monitor** those companies, then **exit** (sell) and return the cash. Concord lives in
> **stage 3 — hold and monitor** — the quarter-by-quarter job of watching every company and reconciling its
> numbers."*

**Brief supporting fluency (say it quickly, don't dwell):**
- **How the money flows:** **LP → GP (Sagard) → portfolio company → exit → money back to the LP.** *LP* =
  the passive outside investors (pensions, insurers). *GP = Sagard* = raises the fund, picks the deals, runs
  and sells the companies (and puts in its own money — "skin in the game"). *Portco* = a company the fund
  bought (*the companies in my demo are portcos — synthetic test packs, not Sagard's real portfolio*).
- **How Sagard earns:** the **"2 and 20"** — roughly a **2%** yearly management fee (keeps the lights on) plus
  **~20%** *carried interest* (a share of the profits, the real upside, paid only **after** LPs get their
  money back plus a preferred return). One line is enough here.
- **One honest boundary:** between buying and selling there is no market price, so each quarter the GP
  **estimates** each company's fair value — *"the mark."* **The mark is a human judgment, and it's audited.**
  Concord **feeds** the inputs; it **never makes the mark.**

### 2.2 Who reads the pack — and who this tool is for

All these people read the **same** quarterly pack, for **opposite** jobs. Present it as a quick map — and
**land hard on persona #2**, the customer.

| # | Persona | What they DO (short) | Trust posture |
|---|---|---|---|
| 1 | **Deal Partner** | Led the deal, sits on the board; wants a fast, directional "on track vs plan?" read | **Speed over precision** |
| 2 | **Portfolio / Reporting Operations + Controls** *(Sharon's world)* | **Owns the quarterly monitoring, reconciliation, and reporting grind** across the whole book; controls & audit trail | **Comparability + control ⬅ your customer** |
| 3 | **Valuation Analyst** | Sets each company's quarterly **mark** → rolls into fund **NAV**; auditors challenge every figure | **Precision above all** |
| 4 | **Investor Relations / LP-reporting** | Reports numbers **outward** to investors; every figure must tie to a source | **Precision (external)** |
| 5 | **Risk / Credit Analyst** | For companies Sagard **lends to**, checks each borrower stays inside its loan **covenants** | **Precision + exact definitions** |

> **This tool is for the Portfolio / Reporting Operations team (persona #2, Sharon's world).** They are the
> people who hand-key the packs every quarter and must be able to **trust and trace** every number. Second-
> hand, everyone else benefits: deal partners get a faster board read; valuations and LP-reporting get
> cleaner, auditable inputs (they keep their own sign-off).

> **CRITICAL tailoring note:** persona #2 is **controls + reporting operations** — reconciliation, source-of-
> truth, audit trail, data governance. It is **NOT** the "Value Creation / operating-partner" job (growing a
> company's revenue and cutting its cost). Telling Sharon her team "improves your portfolio companies'
> operations" would misread her role to her face. She is the **controls + reporting** customer.

> **Watch out (say it as your assumption):** *"I've assumed there's a team that owns this quarterly grind. I
> don't know if that's one person, a team, or a vendor — that's one of my questions for you."* (Sagard doesn't
> publicly advertise a named data/metrics function, so present this as an assumption, not a fact.)

**The tension that ties them together (a great line):** *"The deal team wants a fast directional read;
valuations, LP-reporting, and credit want an audited, reconciled number. The same messy PDF has to serve both
— and a source-traced, refuse-when-unsure data layer is exactly what lets one tool do that."*

---

## 3. The problem — the Operations team's manual quarter-close — 3 min

> 🔒 **DECISION — LOCKED (§3 The problem):**
> - **Slides:** exactly **3**.
> - **Slide 3.1 — title:** "Monitoring the portfolio means hand-keying 20+ packs — every quarter"
>   - **On-slide anchors:** "second week after quarter-close" · "20+ PDF packs — SaaS · lender · payments · freight" · "hand-keyed into one master sheet" · "this review **is** the monitoring"
>   - **Graphic:** a stack of labelled PDF-pack icons (SaaS / lender / payments / freight) funnelling through a small human-with-keyboard into one spreadsheet grid.
>   - **On-slide honesty caveat (small):** "Synthetic test packs — 10 companies across 24 PDFs. Say '20+ **packs**', not '20+ companies.'"
> - **Slide 3.2 — title:** "Four traps in the manual close — each one provable in the packs"
>   - **On-slide anchors (2×2, ONE real example per trap):** "Same metric, many names → NovaCloud ARR: 'End-of-Period ARR' = 'ARR (End of Period)'" · "Same name, different meaning → SaaS delivery-margin vs LendBridge interest-margin" · "Right number, wrong basis → ClearPay $38.4M incl. $6.2M client float = $32.2M spendable" · "Can't prove it → no number links back to its source"
>   - **Graphic:** 2×2 grid of trap cards, one real example each; the naive "one shared column" struck through on traps 2 and 3.
>   - **Speak, don't slide (trap 3's second example):** ConstructIQ reports burn *per quarter* while everyone else is *per month* — spoken, not on the card.
>   - **On-slide honesty caveat (small):** none (all four examples are real from the corpus).
> - **Slide 3.3 — title:** "Reading the PDF is the easy 10%. The expensive 90% is comparability + trust."
>   - **On-slide anchors:** "the pain = reconciliation · comparability · trust · time" · "every quarter, forever" · "easy 10% = reading the number" · "expensive 90% = knowing what's safe to compare, and proving each one"
>   - **Graphic:** a 10 / 90 split bar — a thin "reading" slice against a fat "comparability + trust" slice.
>   - **On-slide honesty caveat (small):** none.
> - **Speak, don't slide:** the stage-3 "hold and monitor" tie-back; the partner asking *"where did this 78% come from?"* → *"let me re-open the PDF"*; "trust is low, so everything gets re-checked by hand."
> - **Backup only — NEVER a slide:** the full four-bullet prose paragraphs (speaker notes, not slide copy); extra per-company examples only if the room pushes.

**Frame it as the Operations team's own job**, not a generic "data-processing" problem.

> *"Remember stage 3 — hold and monitor. The way the Operations team **monitors** the portfolio is by
> **reviewing every company's quarterly (Q) report, by hand.** That manual quarter-close review is a core part
> of their job — and it's the pain Concord is built to solve."*

Then make it **felt**, in Sharon's exact world:

> It's the second week after quarter-close. 20+ PDF packs have landed — a SaaS company, a lender, a
> payments company, a freight marketplace. An analyst opens each one, hunts for the numbers, and **hand-keys**
> them into a master spreadsheet. That review *is* the monitoring. And four things make it hard — each is
> **provable from the real packs:**

- **Same metric, many names (and it renames itself over time).** NovaCloud's ARR appears as "End-of-Period
  ARR" and "ARR (End of Period)" — two labels the tool stitches into one line; its revenue line also shows up
  under more than one label. Miss a relabel by hand and the trend silently splits.
- **Same name, different meaning.** A software "gross margin" (cost to deliver software) vs a lender's "gross
  margin" (interest income minus cost of funds). Put them in one column and you're **quietly wrong.**
- **The number is right, the basis is wrong.** ClearPay's "Cash & Restricted Cash $38.4M" includes $6.2M of
  client money it legally can't spend (true spendable cash = $32.2M). ConstructIQ reports burn *per quarter*,
  everyone else *per month*.
- **You can't prove any of it.** The finished sheet is stale, retyped, and **no number links back to its
  source** — so a partner asks *"where did this 78% come from?"* and the honest answer is *"let me re-open the
  PDF."* Trust is low, so everything gets re-checked by hand.

> **The one line:** *"The pain isn't reading PDFs. It's **reconciliation, comparability, trust, and time** —
> every quarter, forever, for the Operations team. Reading the PDF is the easy 10%. The expensive 90% is
> knowing which numbers are safe to compare, and being able to prove each one."*

---

## 4. How we solve it — 5–6 min

> 🔒 **DECISION — LOCKED (§4 How we solve it):**
> - **Slides:** exactly **5**.
> - **Slide 4.1 — title:** "One offline click runs the flow — a human owns every number that leaves"
>   - **On-slide anchors:** "load all packs offline, one click" · "classify equity vs credit" · "normalize onto one shared vocabulary" · "reconcile against the company's own report" · "refuse unsafe **cross-class** comparisons (lender vs software)" · "click any number → its source" · "a human owns every number that leaves"
>   - **Graphic:** a left-to-right pipeline of 6 labelled stages ending in a click-to-source drawer icon, a small human badge over the exit gate.
>   - **On-slide honesty caveat (small):** "Provenance is **file-level** today (source file · original label · confidence · exact excerpt) — not page/sentence (roadmap). Refuse fires **across asset classes** (lender vs SaaS) today; intra-sector margin flagging is next."
> - **Slide 4.2 — title:** "Same label ≠ same metric — comparability is the product, not extraction"
>   - **On-slide anchors:** "SaaS 60% gross margin (illustrative)" · "LENDER 60% gross margin (illustrative)" · "**=?**" · "one merged column **SPLITS** → SaaS · delivery-margin | lender · interest-margin" · inset "one metric, many names → one stitched line"
>   - **Graphic (self-contained — do NOT fetch any external line reference):** the THESIS REVEAL — two cards, each a bold "60% gross margin" **tagged "(illustrative)" inline**, one SAAS one LENDER, a big "=?" between; the merged spreadsheet column visibly SPLITS into two labelled lanes ("SaaS · delivery-margin" vs "lender · interest-margin") with the naive merge struck out; a small inverse inset of the ARR stitch (two labels → one line).
>   - **On-slide honesty caveat (small):** "Illustrative numbers. Live, this fires on **LendBridge's** real interest-margin (a lender's 'gross margin', 58→62%) — shown in full, never ranked against a SaaS margin."
> - **Slide 4.3 — title:** "Rules never invent a number — deterministic on purpose, not production-grade yet"
>   - **On-slide anchors:** "single deterministic method, on purpose" · "cheap · fast · testable · offline · never invents" · "one method ≠ production-grade" · "Firecrawl first → errors + out of credit → switched (the right move for a trust tool)"
>   - **Graphic:** a rules-engine icon with four property chips (cheap / fast / testable / offline) + a small honest footnote strip "Firecrawl → deterministic".
>   - **Speak, don't slide:** the full Firecrawl story; "deterministic-first is genuinely right for a **trust** tool."
>   - **On-slide honesty caveat (small):** "Any vendor accuracy % = the vendor's own claim, not our measured result."
> - **Slide 4.4 — title:** "Same builder, opposite tools — speed for the deal partner, precision for Ops"
>   - **On-slide anchors:** "R1 · deal partner → AI Scout: URL → scrape → summarize → Slack 'move forward?' → **LLM**, speed over precision" · "R2 · Operations → Concord: precision first, traceable, wrong answers **refused** → **deterministic**" · "same builder, two opposite trust postures"
>   - **Graphic:** a two-column contrast card — left "Deal partner · speed (LLM)", right "Operations · precision (deterministic)".
>   - **On-slide honesty caveat (small):** none.
> - **Slide 4.5 — title:** "What I'd build for real: redundant readers — the disagreement is the alarm"
>   - **On-slide anchors:** "2–4 independent readers, failing in different ways" · "a small orchestrator collects their answers" · "more agreement → higher confidence (tiered)" · "any disagreement → flag + send to a human, answers side by side" · "for Parinaz: rigorous, not 'three LLMs voting' — for Sharon: an automated four-eyes control + audit trail"
>   - **Graphic:** 3–4 reader lanes converging on an orchestrator that branches to ✔ (agree → higher confidence) and ⚠ (disagree → human review); pointer "→ §8 Group A".
>   - **Speak, don't slide:** the disarming line ("this demo showcases the **business** more than the technical… but I'll stay honest about what one method can't do"); the both-judges close ("the thing that makes the numbers more correct is the same thing that gives you the control and the audit trail").
>   - **On-slide honesty caveat (small, REQUIRED):** "**Designed, not built** — today's demo runs the single deterministic method. 'Independent' is never total: agreement is strong evidence, not proof."
> - **Backup only — NEVER a slide:** "in v1 we only refuse the lender; the intra-SaaS margin case is next" (Q&A turn-back only if Parinaz probes cross-SaaS margins); page-level provenance roadmap detail; the tiered-consensus internals (they live in §8 Group A).

### 4.1 What Concord does (plain, one flow) — and the thesis

> **Load all the packs offline in one click → classify each (equity vs credit) → normalize onto one shared
> vocabulary → reconcile against the company's own report → refuse any comparison that isn't truly like-for-
> like → and let you click any number to see its source.** A human owns every decision and every number that
> leaves the building.

Two promises, mapped to the pains:
1. **Comparability you can trust** — renamed labels stitched into one series; differently-defined metrics
   **across asset classes** refused (a lender's margin is never ranked against a software one); units/basis
   handled *before* any comparison. When a comparison isn't safe, the tool **visibly refuses** it.
2. **Traceability you can prove** — every number carries its **source file, original label, and confidence**;
   one click shows the exact **source excerpt**. *(File-level today — the excerpt is shown, but not the page
   number; **page-level anchoring** is on the roadmap — say what's true.)*

**The thesis reveal (show it here):**

[graphic: THESIS REVEAL — two company cards side by side, each a bold "**60% gross margin**" (illustrative), one tagged **SAAS**, one tagged **LENDER**, a big "**=?**" between them; then the merged spreadsheet column visibly **SPLITS** into two labelled lanes ("SaaS · delivery-margin" vs "lender · interest-margin"), the naive merge struck out; caption "**same label ≠ same metric — comparability is the product, not extraction**"; small inset of the inverse — one metric under many names ("End-of-Period ARR" = "ARR (End of Period)") collapsing into one stitched line]

> *"This is the whole idea in one picture. Two companies both print the same '60% gross margin' (illustrative) — but a SaaS
> delivery-margin and a lender's interest-margin are **different machines.** On screen this fires for real on
> **LendBridge**: its labelled "gross margin" (58→62%) is an interest margin — shown in full, but never ranked
> against a SaaS margin. The product isn't pulling the
> number out; the product is knowing when **not** to put them in the same column. Same label, different
> metric. **Comparability is the product.**"*

### 4.2 Why deterministic for *this* demo — the honest maturity moment

Say this almost verbatim — it's where you earn Parinaz's respect:

> *"For this demo I used a **single deterministic method** — fixed rules — on purpose. Rules are cheap, fast,
> testable, offline, and they **never invent a number**. But I want to be clear: **one method is not
> production-grade.** A single reader, however good, can be wrong and you'd never know."*

**The honest Firecrawl story (own it — it's credibility, not an excuse):**

> *"My first build actually used **Firecrawl**, a **paid extraction service**. I hit errors on it **and** ran
> out of credit mid-build. So I switched to a deterministic method — and honestly that was the right move: it
> let me prove the **business case** and show how I'd help the Operations team, with a design that's auditable
> and stays offline. Deterministic-first is genuinely right for a **trust** tool."*

**Why deterministic here and not an LLM — the speed-vs-precision contrast (this is the growth story across
the two rounds):**

> *"My **first take-home** solved the **deal partner's** need. It was an **'AI Scout'**: give it a company
> URL, it scrapes the company's info and press/news, searches and scrapes the founders, summarizes everything,
> and posts a suggestion in **Slack** — 'should we move forward?' I used an **LLM** there on purpose, because
> the deal partner needs **speed** over precision — a fast, rough read keeps a deal moving.*
>
> *This round, the **Portfolio Operations** team needs the **opposite**: **precision first** — a number you'd
> sign your name to, traceable, with a wrong answer **refused** rather than guessed. **That** is why this one
> is deterministic. Same builder, two rounds, two opposite trust postures."*

**What I'd do for real — the redundant-reader idea, at a high level:**

> *"To make one reader trustworthy in production, you don't rely on one. You run **2–4 independent readers in
> parallel** — methods that fail in **different** ways. A small orchestrator collects their answers: **the more
> readers agree, the higher the confidence**; **any disagreement flags that metric with a warning and sends it
> to a human to review**, with every reader's answer shown side by side. Consensus is **tiered** — not a simple
> all-or-nothing vote. The disagreement *is* the
> alarm. I'll show the deep architecture for this in §8 (Group A)."*

**Honest caveats (say them):** *"This redundant ensemble is **designed, not built** — today's demo runs the
single deterministic method. And 'independent' is never total — different readers can still be fooled the same
way — so agreement is **strong evidence, not proof.**"*

### 4.3 Reliability — why deterministic is the right default, and what I'd change

> *"The Operations team needs **reliability and precision first**, so a deterministic method is the right
> **default** for a trust tool — every step is a readable rule, it reproduces exactly, and the data never
> leaves the machine. The **redundant path** (§8 Group A) is what I'd **build for production**, and the
> **scaling path** is in §9 and the system-design doc `iv-…`."*

Be explicit and disarming:

> *"I'll be honest: this demo showcases the **business** more than the technical — it proves I understand your
> problem and can point software and AI at it. But I'll stay honest the whole way about what today's **single
> method can't do**, and exactly **what I'd change** to make it production-grade."*

Why the redundant path lands for **both** judges: for Parinaz it's rigorous (independent methods, not "three
LLMs voting"); for Sharon it's **an automated four-eyes control with a full audit trail** — the exact thing an
auditor already trusts. *"The thing that makes the numbers more correct is the same thing that gives you the
control and the audit trail."*

---

## 5. What AI can automate vs not — 2 min

> 🔒 **DECISION — LOCKED (§5 What AI can automate vs not):**
> - **Slides:** exactly **2**.
> - **Slide 5.1 — title:** "Be AI-first, but human-decision-driven — AI never decides"
>   - **On-slide anchors:** "AI-first, human-decision-driven" · "AI is probabilistic — a likely answer, not a certain one" · "AI does the heavy work + suggests with reasons" · "the human makes every call that reaches a report"
>   - **Graphic:** two-lane flow — an "AI / rules" lane (read → stitch → flag → suggest-with-reasons) feeding a single "Human decision gate" box (sign-off → the mark / IC). Arrow labelled "suggests"; gate labelled "decides."
>   - **On-slide honesty caveat (small):** none.
> - **Slide 5.2 — title:** "Machines do the grind; the human makes every call that reaches a report"
>   - **On-slide content:** render the **full 8-row table** (The work · Who does it · Why); **tint the two human-only rows** ("Is this number right enough for a report?" → Human sign-off; "the mark / LP figure / IC call" → Human only) so the eye lands on "Human only."
>   - **Graphic:** the 3-column table itself is the graphic.
>   - **On-slide honesty caveat (small):** "Concord normalizes units + scale (M/K) and **flags/refuses** a different currency — it does **NOT** convert. Readers are **redundant in production; one reader runs today.**"
> - **Speak, don't slide:** the full principle quote ("be AI-first, but human-decision-driven… the human is the center of every decision"); "a probabilistic model can't decide what's 'right enough' for a report — a human signs it off."
> - **Backup only — NEVER a slide:** if pressed "why not let the LLM do all of it?", turn back — "because AI is probabilistic; we let it suggest with reasons, never decide."

**Make this impactful — it's the spine of the whole talk.**

> *"Here's the principle I build by, and the one I'd want a tool at Sagard to follow: **be AI-first, but
> human-decision-driven.** AI is **probabilistic** — it gives a **likely** answer, not a **certain** one — so
> we **never let it decide.** AI does the **heavy, repetitive work** and **suggests with reasons.** The
> **human is the center of every decision**, and makes **every call that reaches a report.**"*

| The work | Who does it | Why |
|---|---|---|
| Read 20+ packs, pull the raw numbers | **AI / rules (redundant in production; one reader today)** | High-volume, repetitive, mechanical |
| Stitch renamed labels into one series; normalize **units + scale** | **Rules (human-owned rulebook)** | Deterministic and auditable |
| A **different currency** (GBP vs USD) | **Flag / refuse — do NOT convert** | Concord does *not* convert; a flagged blank beats a wrong mix |
| "These two labels *might* be the same metric" | **AI suggests → human confirms** | Judgment with consequences |
| "These numbers don't match / this one looks wrong" | **Cross-source reconciliation flags it** *(a redundant multi-reader orchestrator is production-only; one reader today)* | Machines are great at spotting disagreement |
| "Is this number right enough for a report?" | **Human (sign-off)** | Consequential; a probabilistic model can't decide it |
| "This company looks healthy because (i),(ii),(iii)" | **AI suggests, with reasons** | A **suggestion**, never a verdict |
| The valuation mark / the LP figure / the IC call | **Human only** | Subjective judgment; the tool feeds inputs, never the mark |

> **Honest correction baked in:** the tool **normalizes units + scale (M/K)** and **flags/refuses** on a
> different currency — it does **not** convert currency. Say it that way.

---

## 6. Time saved (qualitative only) — 1 min

> 🔒 **DECISION — LOCKED (§6 Time saved — qualitative):**
> - **Slides:** exactly **1**.
> - **Slide 6.1 — title:** "The win isn't the hours — it's a wrong number caught before the IC"
>   - **On-slide anchors:** "quarter-close: hours-to-days of re-typing → one click" · "time on judgment, not typing" · "every number is one click from its source" · "a wrong number caught before the IC > any typing saved"
>   - **Graphic:** before → after split — LEFT a stack of 20+ packs + a clock reading "hours–days" + a keyboard (manual re-typing); RIGHT one cursor click → a clean, comparable, source-traced grid. Beneath, a small balance scale: "typing saved" (light) vs "wrong number caught before IC" (heavy).
>   - **On-slide honesty caveat (small):** "Qualitative only — no invented hours, no dollar figure, no fund-return math."
> - **Speak, don't slide:** the full quote; "decision quality first, time second."
> - **Backup only — NEVER a slide:** the live turn-back — "if they ask for a number: 'how many hours does your team actually spend on this today?' Let them supply it. Never fabricate one."

Simple and impactful. **Decision quality first, time second.** No invented numbers.

> *"Today the quarter-close is **hours to days — often days** — of re-typing 20+ packs before anyone can even
> see the portfolio. With Concord it's **one click** to a comparable, source-traced view — so the team spends
> its time on **judgment, not typing.***
>
> *But the bigger win isn't the hours. It's that the comparison is **trustworthy**, and every number is **one
> click from proof.** A wrong number **caught before it reaches an investment committee** is worth far more
> than any typing saved."*

*(If they ask for a number, turn it back: "How many hours does your team actually spend on this today?" — let
them supply it. Never fabricate one.)*

---

## 7. The live demo — 8–10 min (one title slide; run it live)

> 🔒 **DECISION — LOCKED (§7 The live demo):**
> - **Slides:** exactly **1** — a live **TITLE slide only.** Do NOT build separate beat or caveat slides; the three beats and every honesty caveat are **spoken live** from the app.
> - **Slide 7.1 — title:** "Live demo — Concord, run live and offline"
>   - **On-slide anchors:** "Live demo" · "Concord" · "offline · deterministic · provenance-tagged" (minimal — a title slide; **no hard numbers printed**)
>   - **Graphic:** full-bleed title — the Concord wordmark (original SVG mark) + one-line tagline, over a dimmed screenshot of the live app just after loading. Footer chips: "offline · deterministic · provenance-tagged." No numbers hard-coded on the slide.
>   - **Speak, don't slide (the three beats, in spirit):** (1) **Pain on screen** — load 24 packs offline in ~1 second (screenshot the LIVE run; the "24/24 in ~0.958 s" figure comes from the run, never a fixed printed label). "Nothing left the machine." (2) **Two proofs** — (a) NovaCloud's hidden trend: one lonely dot to a naive tool; Concord stitches renamed labels into 5 quarters, **$24.1M → $34.2M (+42%)** across 2 source labels; (b) the refusal: a lender's 62% "gross margin" next to a SaaS 76%; the classifier tags the lender as credit and Concord **refuses to rank them, and says why.** (3) **Trust spine** — click any number → the provenance drawer shows source **file**, raw label, confidence, and the **exact source text.** "Every claim on screen is one click from proof."
>   - **Spoken honesty caveats (say before they ask):** the 24 packs are **synthetic test fixtures, not real Sagard filings** (also in `demo-honesty-script.md`); PeopleFlow's GBP flag is a **front-end rule**, not captured data; provenance is **file-level** (not page/sentence); the raw missing-metric flag has a couple of false positives (suppressed on the grid — never say "0 false alarms"); the intra-SaaS margin case is **roadmap** (we refuse the lender live, not two SaaS bases); 22/22 reconciliation is a **second witness** (confirmation, not independent proof) — the real catch is the **7 in-document conflicts** auto-resolved. If you voice a confidence range, quote **only 90.4%–99.5%** (never also the ~84% floor). Do **NOT** stage a live "MediSight +5.5M" catch — it is not in the shipped corpus.
>   - **Backup only — NEVER a slide (time-permitting live extras):** ClearPay $38.4M → $32.2M spendable (strips $6.2M restricted client float); ConstructIQ the retention laggard (NRR 112%, lowest); the four trust panels (Refused 5 · Exceptions 10 · Breadth 29 labels unified · Reconciliation 22/22 agree + 7 in-document conflicts auto-resolved).
>   - **On-slide honesty caveat (small):** none — it is a title slide; all caveats are spoken (see `demo-honesty-script.md`).

**On the deck this is a single title slide.** The demo runs **live from the app** — the three beats and the
honesty caveats are **spoken live**, not printed on slides. Your full scripts are:
- **`cockpit-frontend-guide.md`** — the click-path and what each screen shows.
- **`demo-honesty-script.md`** — what to *say* vs. what the screen *shows* (the wins to show confidently, and
  the gaps to narrate honestly).

**Quick reminder of the three beats (delivered live, not on slides):**
1. **The pain, on screen:** load 24 packs offline in ~1 second (24/24 parsed in ~0.958s — screenshot the live
   run at demo time, the figure comes from the run, not a fixed label). *"Nothing left the machine."*
2. **Two proof moments:** (a) **the hidden trend** — NovaCloud's ARR looks like one lonely dot to a naive
   tool; Concord stitches renamed labels into five quarters, **$24.1M → $34.2M (+42%)** across 2 source
   labels. (b) **the refusal** — a lender's 62% "gross margin" next to a SaaS 76%; the classifier tags the
   lender as **credit** and Concord **refuses to rank them and says why** (interest margin ≠ delivery margin).
3. **The trust spine:** click **any** number → the provenance drawer shows source **file**, raw label,
   confidence, and the exact source text. *"Every claim on screen is one click from proof."*

Extra true beats if time allows: **ClearPay** $38.4M → **$32.2M** spendable (strips $6.2M client float);
**ConstructIQ** the retention laggard; the four trust panels (Refused 5 · Exceptions 10 · Breadth 29 labels
unified · Reconciliation 22/22 agree **+ 7 in-document conflicts auto-resolved**).

> **Honesty caveats — say them live before they ask** (they're in `demo-honesty-script.md`): PeopleFlow's GBP
> flag is a **front-end rule**, not captured data; provenance is **file-level**; the raw missing-metric flag
> has a couple of false positives (suppressed on the grid); the intra-SaaS margin case is a **roadmap** limit;
> 22/22 reconciliation is a **second witness** (confirmation, not independent proof) — the real catch is the
> **7 in-document conflicts**.

---

## 8. Future improvements — **product** improvements only — 4–6 min

> 🔒 **DECISION — LOCKED (§8 Future improvements — product):**
> - **Slides:** **7 built; SHOW 5** — the opener (8.0) + Groups **A, C, E, G**; keep **2 backup** (Groups **B, F** — build them, promote live only if the room asks). This resolves every "you curate / pick 2–3" open item. **There is no Group D.**
> - **Group A = exactly ONE slide (8.1).** A0–A9 are Q&A / whiteboard depth for Parinaz — **never slides.**
> - **A6 (synthetic-disagreement warning):** **NOT built, NOT a slide, NOT shown live** — describe verbally only if Parinaz pushes.
> - **Ensemble-diversity venue citation + Google Document AI HITL year:** **never printed on a slide** — verify before quoting; speak/backup only.
> - **Locked phrasing for ALL §8 slide copy:** say **"20+ packs," never "20+ companies"**; **never "0 false alarms" unqualified** (say "0 **sector-blind** false alarms, 15→0" — CarbonTrack + TalentVault false positives are *suppressed* on the grid, not eliminated); provenance is **file-level** (A5's PDF-crop/page number is future design, never shown live); **refuse-across-asset-classes is BUILT** (LendBridge live) but **intra-SaaS margin flagging is roadmap.**
>
> - **Slide 8.0 — Opener (SHOW) — title:** "Reliability isn't more AI — it's more agreement, more human judgment, and a record of both"
>   - **On-slide anchors:** "more agreement · more human judgment · full record" · "the ensemble raises warnings — a human decides" · "6 product improvements — all roadmap"
>   - **Graphic:** 3-icon row — [handshake = agreement] → [person = human decides] → [ledger = permanent record].
>   - **On-slide honesty caveat (small):** "Everything in this section is **designed, not built.**"
> - **Slide 8.1 — Group A: redundant multi-reader source-of-truth (THE headline, SHOW) — title:** "Correlated readers can outvote the one that's right — so independence, not count, decides"
>   - **On-slide anchors:** "3 reader families that fail differently — geometry parser · doc-AI · vision-LLM" · "correlated readers can outvote the one correct one" · "TIERED consensus → real disagreement goes to a human" · "designed, not built"
>   - **Graphic:** fan-in pipeline — 3–4 reader boxes (deterministic parser · local Docling · vision-LLM · optional doc-AI) → orchestrator → {VALIDATED (green) / DISAGREE (amber → human queue)}. One clean pipeline, **not** the A0–A9 tables.
>   - **Speak, don't slide:** the full depth — correlated-failure / RMS ~1/√M math, the Self-MoA hedge, the supervisor graph, the tiered-consensus table, the ClearPay A3 trace, cost/latency, confidence routing, the human-review queue.
>   - **On-slide honesty caveat (small):** "Designed, not built — no auto-accept rate until it runs on real packs. Reducto ~99% and any vendor accuracy figure is the **vendor's own claim.**"
> - **Slide 8.2 — Group C: the reading layer, LLM summaries (SHOW) — title:** "AI writes the interpretation, never the number — and a human can always refute it"
>   - **On-slide anchors:** "reads only already-clean, provenance-tagged numbers" · "suggestion, never a decision — labelled 'AI suggestion — review'" · "human refute + comment loop → learns the house view next quarter" · "cites every number · no dollar-ROI claims"
>   - **Graphic:** 3-step flow — [clean grid] → [AI note card: "AI suggestion — review"] → [human ✓ / ✎ / comment], loop arrow "next quarter reads last quarter's comments." **Include one short NovaCloud example card** ("compounding +42% ARR, but cash falling $29.5M→$19.6M — confirm the funding plan").
>   - **On-slide honesty caveat (small):** "Roadmap feature — the AI note is not built; it can only get an *interpretation* wrong (the human refutes it), never inject a wrong number."
> - **Slide 8.3 — Group E: currency — flag, never convert (SHOW) — title:** "Concord refuses to mix pounds and dollars — it **flags**, it never **converts**"
>   - **On-slide anchors:** "PeopleFlow flagged '£ · not comparable (GBP)' — kept off the dollar axis" · "today that's a **front-end human rule** (parser sees currency = null, not the £)" · "roadmap: a reader captures the symbol → captured data" · "convert *levels* only, dated auditable rate — never ratios/percentages"
>   - **Graphic:** before/after — LEFT "today: front-end rule flags GBP, refuses the axis"; RIGHT "roadmap: a currency-reader captures £ → convert levels with dated FX (fx_rate / fx_source / fx_date), refuse to convert %."
>   - **On-slide honesty caveat (small):** "The GBP flag is a front-end rulebook rule, **not parsed data** — the parser sees currency = null. **No FX conversion exists yet.**"
> - **Slide 8.4 — Group G: auth, permissions & the audit trail (Sharon's spine, SHOW) — title:** "No silent overwrites, maker-checker on every fix, an audit trail that stands up to an LP challenge"
>   - **On-slide anchors:** "never overwrite — original + every human action both kept" · "maker-checker / 4-eyes: suggester ≠ approver" · "least privilege — see only your assigned companies" · "append-only immutable log — exportable for an auditor / LP challenge"
>   - **Graphic:** value-state flow — Extracted → Verified / Flagged → Suggest (user A) → Approve/Reject (user B) → Corrected, keeping *old → new → who → when → why*; a small audit-log ledger beside it.
>   - **Speak, don't slide:** the full 4-role table; scope-based access; that this **overlaps `iv-system-design-and-scaling.md`.**
>   - **On-slide honesty caveat (small):** "None of this exists yet — the next layer on top of provenance + refuse-to-compare, which **do** exist."
> - **Slide 8.5 — Group B: change over time (BACKUP — build; show only if the room asks) — title:** "Compare growth shapes, not sizes — rebase every company to 100, then switch QoQ↔YoY"
>   - **On-slide anchors:** "rebase-to-100 — every company starts at 100 → compare shapes, not sizes" · "QoQ = recent momentum · YoY = annual trajectory" · "not in the demo"
>   - **Graphic:** two mini line-charts — LEFT indexed-to-100 lines from a common start; RIGHT a QoQ/YoY toggle.
>   - **On-slide honesty caveat (small):** "Roadmap — Concord shows %-change today (NovaCloud +42%), but these views aren't built; sparklines are self-scaled, so heights aren't comparable."
> - **Slide 8.6 — Group F: intake, change-tracking & alerts (BACKUP — build; show only if the room asks) — title:** "Fit the team's habit: watch read-only, re-run only when a fingerprint changes, never act"
>   - **On-slide anchors:** "read-only connector to the drive the team already uses (never writes back)" · "file-hash manifest — new = run · changed = re-run + flag 'restated' · same = skip" · "every run ties to a fingerprint + timestamp" · "alerts are a heads-up, never a verdict — no auto-action, ever"
>   - **Graphic:** a 3-row manifest table (New→Run / Changed→Re-run+flag / Unchanged→Skip) beside an alert card labelled "AI read = hypothesis · number-moved = fact."
>   - **On-slide honesty caveat (small):** "Roadmap — Concord is offline/manual today; a hash tells you *that* a file changed, not *what*."
>
> - **Speak, don't slide (whole section):** all Group A depth (A0–A9); every long example quote in Groups C and F; that §9 / `iv-system-design-and-scaling.md` owns scaling.
> - **Backup only — NEVER a slide:** Groups B & F (promote live only if time/energy wants them); the A6 synthetic-warning demo (describe, do NOT build/show); the ensemble-diversity venue citation and Google Document AI HITL year (verify before quoting).

> **Scope note:** this section is about making the **product** more trustworthy and more useful. **Scaling and
> system design live in §9 and in `iv-system-design-and-scaling.md`** — not here. Each group below is **one
> improvement**, detailed. **Locked for slides:** show **Groups A, C, E, G** (plus the one-line opener 8.0); **Groups B and F are backup** (build them, promote live only if the room asks). Group A is **one** slide — A0–A9 are Q&A / whiteboard depth, never slides.
>
> **Group lettering:** A (redundant readers) · B (change over time) · C (reading layer) · E (currency) ·
> F (intake) · G (permissions). *(There is **no Group D** — the earlier "Group D" idea was removed, subsumed
> by the redundant readers in **Group A**. Currency picks up at **E**.)*

### GROUP A — Trust the source-of-truth: the redundant multi-reader architecture (the headline)

*(The high-level **concept** is in §4.2. This is the **deep architecture** — your Q&A / whiteboard material
for Parinaz. All of it is **designed, not built.**)*

**A0. The three reader families (why a *mix*, not clones).** Run several methods that fail for **different**
reasons:

| Family | How it reads a page | How it fails | Example tools |
|---|---|---|---|
| **Deterministic layout/table parsers** (local, free) | The PDF's own geometry (character/box positions) | **Loudly** — garbled/missing text, easy to spot | pdfplumber, Camelot, Tabula; IBM **Docling** (local ML, offline) |
| **Cloud document-AI** (trained-model APIs) | Trained OCR + table models on a vendor server | Quietly — usually right, can drift on odd layouts | AWS Textract, Google/Azure Document AI, Reducto*, Nanonets |
| **AI / vision-LLM readers** | "Looks at" the page and reads *meaning* | **Silently** — a plausible wrong number | Claude / GPT-4o** / Gemini vision; LlamaParse |

*\* Reducto reports ~99% field accuracy — the **vendor's own** number, not independently measured. \*\* GPT-4o
is 2024-era; newer vision models exist.*

> **Why a mix, not three copies (the key point for Parinaz — this is well-supported theory):** three copies of
> the same model share the **same blind spots**, so they can be **confidently wrong the same way** and their
> agreement means nothing (this is **correlated failure**). The math you can defend: for M readers with
> **independent** errors, the **error variance shrinks by roughly 1/M** (so the RMS error falls ~1/√M); with
> **perfectly correlated** errors you get **zero benefit** — and group accuracy can even **drop** as you add
> correlated voters. This is the **ensemble diversity / ambiguity decomposition** (*verify the exact citation
> before you quote a venue*) and, classically, **Condorcet's Jury Theorem** (independent, better-than-random
> voters → accuracy rises toward 1). So use **different mechanisms** — a geometry parser, an OCR/doc-AI engine,
> a vision-LLM — whose errors are **decorrelated.** *Counter-intuitive but true: a couple of
> weaker-but-different readers can help more than a second copy of your best one.*
>
> **But two honest hedges:** (1) **independence is never total** — real readers share training data and web
> text, so correlation is >0 and the "1/M" is a **best case**, which is exactly why you keep a human on the
> disagreements. (2) The 2025 **"Self-MoA"** result warns that mixing **different** LLMs can **lower** average
> quality if some are weak — so **diversity only pays if each reader is individually strong.** Don't add a weak
> model just for variety.

**Recommended stack (spans the "loud vs silent" line):** ① today's deterministic parser (the reference vote) +
② an **independent local** structural reader (IBM **Docling** — stays offline) + ③ a **vision-LLM** for meaning
(catches renamed labels; votes, never decides alone) + optionally ④ a specialist doc-AI as a tie-breaker on
the numbers that matter most.

> **Offline-purity trade-off (say to Sharon):** ①+② are local; the strongest accuracy (③ hosted LLM, ④ cloud
> doc-AI) means **data leaves the machine** — a real data-residency question. A **fully-offline** variant —
> parser + Docling + a *locally-hosted* vision model — gives three independent local readers with **zero data
> egress**, trading a little accuracy on the hardest pages. Offering that choice *is* the data-governance
> answer.

**A1. The control structure — an orchestrator with parallel workers.** One small **orchestrator** plans the
job, runs the readers **in parallel** as workers, then reconciles their answers (readers = workers, the
validator = orchestrator). The mature, debuggable way to wire this is a **"supervisor" graph** (e.g.
LangGraph): a supervisor node routes to specialist worker nodes over shared state, with an explicit stop
condition.

> **Honest note on the "multi-agent" hype:** Anthropic's own multi-agent research write-up reports a big win on
> *their* internal research eval — but it uses **~15× more tokens** than a chat and, in their words, fits
> **breadth-first, parallelizable** work and is a **poor fit when all agents need the same shared context.**
> Reading one document *is* mostly shared context — so **use the pattern (parallel readers + a reconciler),
> but don't assume their headline number transfers to extraction.** A fixed *N-reader + one-judge* pipeline is
> far cheaper than a chatty agent swarm.

**A2. The orchestrator's decision — TIERED consensus, not "all must agree."** The orchestrator never compares
printed text. Each reader outputs a **normalized tuple** `(canonical_metric, period, unit, basis, value)` and
it compares **tuples** — so two readers that both say "62" but disagree on **basis** (quarterly vs monthly
burn) **do not agree.** "Agree" for a number uses a **metric-family tolerance** (money: within ~0.5% or a
small floor, to absorb rounding; percentage-points: an absolute ±0.1pt band). A **10× gap** (read "$3.4M" as
"$34M") is never "within tolerance." *(This is field-level voting: classic majority-vote / self-consistency
votes on one answer, but extraction outputs are records with many fields, so you **normalize then vote field
by field**, not on the whole blob.)*

The consensus policy is **tiered** (present this — a flat "all must agree" invites *"isn't that too
strict?"*):

| Tier | Rule | Result |
|---|---|---|
| **VALIDATED (green)** | All independent threads agree within tolerance | Auto-trusted — the default bar ("refuse rather than fake") |
| **VALIDATED-WITH-NOTE** | A strict majority agrees **and** the agreeing threads are **independent** (not sharing an engine), and the dissenter is a weaker/out-of-family method | Auto-accepted, dissent written into provenance |
| **DISAGREE (⚠ amber)** | No safe quorum, a 2–2 split, or the **most-trusted** thread dissents | → **human-review queue** |
| **UNRESOLVED (grey)** | Too few threads produced any value | → human-review queue |

**The decision rule, cheapest → richest (so you can defend the choice):** (1) plain majority per field; (2)
**confidence-/reliability-weighted vote** — weight each reader by its track record (classically, the log-odds
of each source's reliability is the **optimal weight *under conditional independence***); (3) an **LLM
aggregator/judge** only for the messy free-text cases where values don't match exactly; (4)
**abstain-and-escalate** on real disagreement — the most defensible move for a *validator*, because it trades
coverage for trust. **Recommended composite:** field-level weighted vote → agreement check → emit if consensus,
else **abstain and send to a human**; reserve the LLM judge for the **split cases only** (keeps cost down).

> **If you use an LLM as the judge, design around its known biases** (all documented, peer-reviewed): **position
> bias** (favors whichever answer is shown first), **verbosity bias** (favors longer answers), and
> **self-preference bias** (rates its own model family higher). Mitigations: swap the order and average, hide
> which model produced which answer, control for length — and, best of all, **make the judge cite the source
> span and check it against the document** rather than judge on style. That last one ties the judge straight
> to Concord's provenance.

> **The headline for Parinaz:** *"Count isn't enough — **independence** decides. Two correlated readers can
> outvote the one correct one, so I weight independence and per-method trust, not just the vote."* **And be
> honest about what's measured:** *"This ensemble is **designed, not yet built** — so I can't quote a real
> auto-accept rate until I run it on your packs. Measuring how often independent readers agree, and how big the
> human-review queue is each quarter (and who staffs it), is the first thing the run-alongside stage
> produces."*

**A3. One concrete "complex thread" end-to-end (have this ready if they push for detail — the whole trace is the *designed* ensemble; only the deterministic step runs live today).** Trace ClearPay
spendable cash: the deterministic thread ingests the PDF → finds "Cash & Restricted Cash …… 38.4" → scales
×1M → sees **"Restricted"** → finds the companion "of which restricted … 6.2" → computes **operating = 38.4 −
6.2 = 32.2M**, keeps **both** + a note, scores high confidence, emits its record. The vision-LLM thread reads
the same page image and also lands on 32.2; the doc-AI thread agrees → **VALIDATED $32.2M.** *The instructive
failure:* if the LLM **missed** the restriction and returned 38.4, the threads disagree **on exactly the number
that matters** → ⚠ → human review. That's the system catching, automatically, the one mistake a naive tool
makes silently.

**A4. The all-methods sidebar (extends today's provenance drawer).** Today: click a number → one provenance
record. Future: the drawer shows an **append-only array of thread records** — each method's value, confidence,
snippet — plus a consensus header (which threads agreed, which value was chosen, why). For Sharon this is an
auditor's dream: *exactly* what each independent method saw and **why** the tool trusted (or refused) the
number.

**A5. A real PDF screenshot in the sidebar (future design — SUPER important, label it clearly).** In the review
sidebar, show a **crop of the metric inside the PDF** so a human (or auditor) can eyeball it against the
extraction. **Honesty flag:** this is **future design** — today provenance is file-level (no page number, no
screenshot). **Never** show a page number or a PDF crop in the *live* demo as if it's real; label it "future
design."

**A6. The WARNING signal — a whiteboard sketch, NOT a live demo (describe only if Parinaz pushes).** *This is
**not built, not a slide, and must never be shown live** — describe it verbally.* The idea, if built later:
inject **one synthetic disagreement** into the cockpit to *show* the warning working — additively (an
**optional** `consensus` field the metric type ignores; the `IssueRow` already has a `"warning"` slot), on a
**neutral** SaaS cash cell (never a flagship like NovaCloud/LendBridge/ClearPay), where two threads say $17.9M
and an LLM says $17.0M so a small **⚠** opens the existing drawer with an "Independent methods" section and a
"Sent to human review" line. **Because it is synthetic and unbuilt, it stays a spoken design sketch** — never
staged as if three methods actually ran today.

**A7. Confidence — deciding auto-accept vs human.** Don't trust one model's raw probability. The stronger
practice combines signals — model logits + semantic consistency + **agreement across the independent readers**
+ self-consistency — into one per-field score, then routes three ways: **auto-accept / review / reject.** The
honest, load-bearing point: **agreement across independent readers is usually a *stronger* "should a human
look?" signal than any single model's self-reported confidence,** which is often poorly calibrated. Vendor
thresholds you'll hear quoted (Azure Document Intelligence "target ≥0.80, near-1.0 for financial"; AWS Textract
route to a human below ~90%) are **vendor examples — recalibrate them on your own labeled pilot set.** The
vendors say this themselves.

**A8. The human-review queue (the four-eyes control, made real).** Disagreements land in a queue with three
buckets: **auto-accept** (write straight through) / **review** (value pre-filled, a human confirms or edits) /
**manual entry** (too low, a human types it in). A good queue row is self-contained: the **document view** +
every field with its **confidence** + green/yellow/red flags + per-field **confirm/correct** + one "approve
all"; financial fields get a higher bar (~0.95+). **Every correction is saved and loops back as training
data.** The reference implementation is **AWS Textract + A2I** — a rule fires the human loop on per-field
confidence, a missing field, or a random audit %, and the output **bundles the human's correction + the
original model answer + metadata** (that bundle is the retraining signal). *(Honest flag: I believe Google's
Document AI HITL was deprecated — **verify before asserting the year**; don't present it as a current option.)*

**A9. Cost and latency (so no one thinks this is slow or expensive):** run the readers **in parallel**, so
wall-clock ≈ the **slowest single reader + one aggregation pass**, not the sum. Cost is roughly **linear in the
number of readers** (4 readers ≈ 4× read tokens) plus the aggregator — far below a chatty agent swarm.
**Diminishing returns:** gains flatten as you add readers while cost keeps climbing, so **3–4 diverse readers
is the defensible sweet spot**; 8+ usually buys little. A cheaper variant is a **cascade** — run one reader,
and only spin up the others when its confidence is low.

> **Maturity one-liner (say this so nothing is over-claimed):** *"Mature and safe to lean on — OCR voting
> ensembles, confidence-threshold routing, cross-field + tolerance-band checks, vendor human-review queues, and
> the ensemble-diversity theory. Bleeding-edge, so I'd hedge — multi-signal LLM confidence engines,
> self-consistency **applied to extraction** (proven on reasoning tasks, not extraction), and agentic
> orchestrators that reconcile heterogeneous readers automatically. Promising, 2026-era, not yet
> battle-tested. And every vendor accuracy number is the **vendor's own claim** — I'd re-measure on a labeled
> pilot before trusting it."*

### GROUP B — Understanding change over time (two views worth building)

Concord already shows %-change on screen (NovaCloud ARR +42%, in-cell sparkline + change line). Two **roadmap
views** are worth building because they answer questions the current trend can't — even though they're **not in
the demo:**

| View | What it does | Why it matters |
|---|---|---|
| **Rebase-to-100 (index) view** | Start every company at 100 in its first quarter; plot *relative* growth from there | Lets you compare **growth *shapes*** even when companies are very different **sizes** — a $10M and a $100M company become directly comparable lines |
| **QoQ vs YoY switch** | Toggle between **quarter-over-quarter** and **year-over-year** change | QoQ shows **recent momentum** (is it speeding up or slowing this quarter?); YoY shows the **annual trajectory** (smooths out seasonal noise) — you need both lenses |

> **Honest note:** the current sparklines are **self-scaled**, so two mini-lines' heights aren't directly
> comparable — magnitude stays the job of the number + the peer heat colour. The **index view** is one clean
> way to fix that.

### GROUP C — The reading layer (LLM summaries — a suggestion you can argue with)

**One improvement:** after the numbers are clean and comparable, an LLM writes a short *"here's the story"*
note — for **each company** and for the **whole portfolio** — explicitly a **suggestion.** The human
**accepts, corrects, or comments**, and **next quarter the LLM reads last quarter's human comments first**, so
it learns the house view. **Why it's safe:** it reads **only over already-normalized, provenance-tagged
numbers** — it can't inject a wrong figure, only a wrong *interpretation*, which the human immediately refutes.

Illustrative examples — **the AI note is a roadmap feature (not built); the numbers inside are from the live demo:**
> **NovaCloud (per-company):** *"Compounding well — ARR $24.1M → $34.2M (+42%), margin 74%→78%, churn
> 7.8%→5.8%, NRR 115%→123%. The one caution: cash fell every quarter, $29.5M → $19.6M — healthy P&L, shrinking
> runway; confirm the funding plan."*
> **Human comment (feeds next quarter):** *"Cash drop is a planned strategic outlay, not operating burn —
> don't flag as a runway risk again."* → next quarter the AI already knows this.
> **ClearPay:** *"Headline cash $38.4M, but $6.2M is restricted client float — comparable operating cash is
> $32.2M. Use the restated figure for any runway comparison."*
> **Portfolio-level:** *"Retention broadly strong (most NRR 115–123%); NovaCloud the standout grower (+42% ARR)
> but cash trending down; ConstructIQ trails on retention; ClearPay's real liquidity is $32.2M not the $38.4M
> headline; LendBridge's 'gross margin' is excluded on purpose (a lender's interest margin — not comparable).
> Two follow-ups: 10 expected-but-missing metrics, and FleetLink is a quarter behind."*

> **Guardrails to say out loud:** it's a **suggestion, never a decision** (label it on screen "AI suggestion —
> review"); it reads **only over clean, provenance-tagged numbers**; there's a **human refute + comment loop**;
> it **cites the numbers it used** (every claim links back to a source); **no dollar-ROI or fund-return
> claims.**

### GROUP E — Currency (the PeopleFlow GBP example → captured data)

**On screen:** PeopleFlow carries a **"· not comparable (GBP)"** flag — one label reads "Net Pound Retention
(NPR)," the tell that its figures may be in British pounds. So the tool **refuses** to put it on a dollar axis.

> **The honest limit you MUST own:** this flag is a **front-end rulebook rule, not captured data.** In the live
> payload PeopleFlow's `currency` is `null` and every row is `comparable` — **the parser does not see the £.**
> Say it plainly: *"today's parser doesn't capture the currency symbol, so a human-owned rule catches it
> instead — the same rulebook pattern used everywhere in the tool."*

**How it becomes real — and note it ties straight to Group A:** currency capture is **not** in the demo, but it
is exactly the kind of thing the **independent redundant readers** can tackle. **A reader whose job is to
capture the £/currency symbol turns today's front-end rule into captured data.** Then the honest roadmap:
1. **Capture the currency** (read £/GBP into the payload instead of `null`) → move the flag from a front-end
   rule to captured data.
2. **Convert *levels* only, with a dated rate** — FX-convert Revenue/ARR using a dated FX table, recording
   `fx_rate`, `fx_source`, `fx_date`. *(A converted figure traces to pack + external rate → not purely
   file-traceable; say so.)*
3. **Refuse to convert *ratios*** — an NRR of 118% is a ratio computed in GBP; tag it, don't touch it.
   Converting a percentage is nonsense.
4. **Refuse over convert (the philosophy)** — where the rate/basis is unknown, **flag** rather than guess.

> **One line:** *"Concord refuses to mix pounds and dollars — it does not convert them yet. A dedicated reader
> that captures the symbol, plus a dated, auditable FX rate for *levels only* (never percentages), is how it
> becomes real."*

### GROUP F — Intake, change-tracking, and alerts

**F1. Intake — a read-only cloud-storage connector (start here).** Point Concord at the one shared drive the
team **already** saves packs to (SharePoint / OneDrive / Google Drive / Box / S3). It **picks up new files automatically**,
**read-only and scoped** — Concord never writes back to the source. This wins because it fits the
existing habit with **no behaviour change** from the team.

**F2. Change-tracking with a file hash (new = run, changed = re-run).** A **hash** (e.g. SHA-256) is a short
fingerprint of the whole file: same file → same fingerprint; change one digit → a completely different one.
It's **content-based, not name-based** (a company can keep the same filename but upload corrected content — the
hash catches it; a pure rename gives the same hash → no pointless re-run). Concord keeps a small **manifest**
(company+period, filename, hash, last-run, run-id):

| Case | What it sees | What Concord does |
|---|---|---|
| **New** | Not in the manifest | **Run**, add a row |
| **Changed** | In the manifest, **hash differs** | **Re-run**, update the row, flag *"restated — was X, now Y"* for review |
| **Unchanged** | Same hash | **Skip** — save the compute |

> **Why it fits the room:** for Sharon, every run ties to a fingerprint + timestamp — *"which exact version of
> the pack produced this number?"* is answerable precisely, and a re-run **records** that the source changed,
> it doesn't silently overwrite history. For Parinaz it's deterministic and cheap. **Honest limit:** a hash
> tells you *that* a file changed, not *what* — Concord still re-parses to show the "was $38.4M, now $32.2M"
> difference.

**F3. Alerts (Email / Slack / Teams) — a heads-up, never a verdict (tied to Group C).** When a fresh run makes
the **Group C AI summary** read *"Company X looks worse — ARR down, churn up, cash falling,"* push a
notification so the right person sees it fast (not three weeks later at close). **The non-negotiable rule:** the
alert **never triggers an action.** It says *"something looks worse — a human should look,"* and links straight
to that number's provenance drawer. A human confirms the source-of-truth before anything moves.

- **In the message:** a plain headline (*"NovaCloud Q2 2025 — cash has fallen every quarter, $29.5M →
  $19.6M"*), the **AI reason clearly labelled as AI** (*"AI read: worsening because burn outpaced new ARR"*), a
  confidence/basis note, a **"Verify in Concord"** link, and *"Please confirm the source before flagging to the
  deal team."*
- **Guardrails:** thresholds not chatter (alert only on meaningful moves / restatements, to avoid alert
  fatigue); the AI cause is a **hypothesis**, the number-moved is the **fact** — always separate them; **no
  auto-action, ever**; this is roadmap (Concord is offline/manual today).

### GROUP G — Auth, permissions, and the correction workflow *(overlaps the system-design doc)*

Built for a **compliance-minded** operations team (Sharon's world). None of this exists yet — it's the natural
next layer on top of two controls Concord **already** has (provenance + refuse-to-compare). **Note:** this
group **overlaps the System Design part** (`iv-system-design-and-scaling.md`), which goes deeper on the same
controls — reference that doc if they push.

**Design principles (the compliance spine):**
- **Never overwrite silently.** The extracted value and every human action are **both** kept — a correction is
  a *new state*, not a replacement. The original never disappears.
- **Human-in-the-loop.** The machine only **flags** (disagreement, low confidence, refused); a **human
  decides.** It never quietly "fixes" a number.
- **Segregation of duties (maker-checker / 4-eyes).** Whoever *suggests* a change is **not** whoever *approves*
  it — the classic control a Chief Compliance Officer expects.
- **Least privilege.** Users see only the companies they're assigned to (information barriers between deal
  teams).

**Roles:**

| Role | Can do | Cannot do |
|---|---|---|
| **Viewer** (e.g. LP-reporting reader) | Read metrics, provenance, comments; export the audit report | Change anything |
| **Analyst / Submitter** | Run extraction; **suggest** a correction; **add comments**; flag a value | Approve their own suggestion; edit source data |
| **Reviewer / Approver** (ops lead) | Accept/reject suggestions; **correct a flagged (warning) metric**; resolve exceptions | Rewrite audit history; manage users |
| **Admin / Data governance** | Manage roles; own the alias & currency rulebook + thresholds | Silently edit values — any edit is logged like everyone else's |

Plus **scope-based access** (per company / fund / strategy).

**The correction workflow (states of a value):** `Extracted` → **Verified** (ensemble agrees) *or* **Flagged /
Warning** (disagree / low-confidence / refused). A human can then **Suggest** (value doesn't change; gets a
"suggestion pending" badge) → **Approve/Reject** by a *different* user (maker-checker) → value moves to
**Corrected**, keeping *old → new → who → when → why.* **Comments** are timestamped, authored, and kept
**separate from the number** (a note is not data).

**The audit trail (the heart of it, for Sharon):** an **append-only, immutable log** — who, which field,
old → new, when, why — plus full lineage per number (original extracted value + provenance + human edit
history), **exportable** to survive an auditor or LP challenge.

> **The honest bottom line for the whole section:** *"The reliable version of Concord isn't 'more AI.' It's
> **more agreement, more human judgment, and a complete record of both** — the ensemble raises warnings, a
> human decides, and every decision is permanently traceable."*

---

## 9. How to scale — brief (the depth is in the system-design doc) — 2 min

> 🔒 **DECISION — LOCKED (§9 How to scale):**
> - **Slides:** exactly **2**.
> - **Slide 9.1 — title:** "Concord today is a prototype, not a production system"
>   - **On-slide anchors:** "offline · in-memory · one deterministic extraction pass" · "no database, no login" · "76%→90% recall — real, but on 24 synthetic PDFs" · "0 wrong values"
>   - **Graphic:** a two-column "What's real / What's not yet" honesty strip — real: the engine, the recall gain, refuse-to-compare, file-level provenance | not yet: durable store, job queue, the redundant ensemble, multi-tenant cloud.
>   - **On-slide honesty caveat (small):** "The 24 PDFs are synthetic test fixtures, not real filings. The redundant ensemble is **designed, not built** — label it 'to add,' never present-tense."
> - **Slide 9.2 — title:** "Harden in place first — the cloud is the destination, when it's justified"
>   - **On-slide anchors:** "Option 1 — Harden in place (low-risk, stays offline)" · "Option 2 — Cloud re-platform (highest ceiling)" · "do Option 1 first" · "Option 2 = data leaves on-prem"
>   - **Graphic:** the two-column Option 1 vs Option 2 table, **condensed to 3 rows (What-it-is / Reliability / Risk)** — drop the Effort/Cost row — with an arrow "Option 1 → Option 2 (the destination)." *(Pull the cell text from the Option table in the section body below.)*
>   - **On-slide honesty caveat (small):** "The redundant-extraction ensemble inside Option 1 is **designed, not built** — 'to add.'"
> - **Speak, don't slide:** how recall was measured (values captured ÷ the **128 numbers physically printed** across the 24 synthetic PDFs; the jump came from a **backend parser fix**, not a changed test set; recall paired with 0 wrong values because a confidently-wrong number is worse than a flagged-missing one); "the ensemble is the biggest single lever"; "move to Option 2 only when volume, bursts, tenants, or SLAs justify it — and only after the data-residency question is answered."
> - **Backup only — NEVER a slide:** the full architecture depth (ensemble orchestrator, queues / retries / idempotency / dead-letter queues, partitioning, multi-tenancy, monitoring, data-residency) lives in `case-study/iv-system-design-and-scaling.md` as Q&A / whiteboard material.

> **Where the depth lives:** the full "how would you architect and scale this" material — the ensemble
> orchestrator, queues / retries / idempotency / dead-letter queues, partitioning, multi-tenancy, monitoring,
> data-residency — is in **`case-study/iv-system-design-and-scaling.md`**, your Q&A / whiteboard reference.
> Keep this section short and point there. *(The recruiter flagged scalability as a focus of the round — study
> that doc and pull from it live.)*

Say it plainly first: *"Concord today is a **prototype, not a production system.** It runs offline in memory,
**one deterministic extraction pass** — no database, no login. The 76%→90% recall is real but measured on **24 synthetic
PDFs** — enough to prove the idea, not to promise production reliability."*

> **How recall was measured (have this ready — Parinaz will ask):** recall = values captured correctly ÷ the
> **128 numbers physically printed** across the 24 synthetic PDFs; the **76%→90%** jump came from a **backend
> parser fix**, not a changed test set; and recall paired with **0 wrong values** is the right measure because
> *a confidently-wrong number is worse than a flagged-missing one.*

Then, the two honest paths:

| Dimension | **Option 1 — Harden in place** (incremental, low-risk) | **Option 2 — Cloud re-platform** (event-driven, multi-tenant) |
|---|---|---|
| What it is | Keep the working engine; add a **durable store**, a **job queue + retries**, and the **redundant-extraction ensemble**; stay offline/on-prem | PDFs land in object storage → file event → queue fans out one job per PDF → managed workers → database → publish → notify; auto-scales for quarter-end bursts |
| Reliability | High gain fast (the ensemble is the biggest single lever) | Highest *ceiling* — but only after real hardening + monitoring |
| Effort / Cost | Medium; low–med cost (reuses the engine) | High; med–high cost (new infra, tenancy, security review) |
| Risk | Low (additive + reversible; deterministic core stays as a canary) | Med–High (bigger blast radius; **data leaves on-prem** — a real data-residency question) |

> **Recommendation:** *"Do **Option 1 first**; treat **Option 2** as the destination. Option 1 buys the
> reliability that matters — agreement-based trust + retries + a real store — at low risk, and keeps the
> offline posture. Move to Option 2 only when volume, bursts, tenants, or SLAs justify it — and only after the
> data-residency question is answered. The depth is in `iv-…`."*

---

## 10. Where my time actually went — 1 min (the honest FDE picture)

> 🔒 **DECISION — LOCKED (§10 Where my time actually went):**
> - **Slides:** exactly **1**.
> - **Slide 10.1 — title:** "Most of my time wasn't coding — it was understanding your world"
>   - **On-slide anchors:** "understand Sagard · VC / PE / private credit · the personas · portfolio-ops · the Q-reports" · "scope the problem" · "plan · weigh trade-offs · build" · "slides"
>   - **Graphic:** ONE horizontal stacked bar = 100% of Xavier's time — a dominant "Understand" block (~70%), a thin "Scope" slice, a "Plan / build" block (~20%), a small "Slides" tail.
>   - **On-slide honesty caveat (small):** small-print caption "Xavier's own rough estimate — self-reported, not measured."
> - **Speak, don't slide:** the FDE monologue — "that's on purpose, because that is what a Forward Deployed Engineer does: take something ambiguous, research it, understand it, get feedback and insights, plan, weigh the trade-offs, then solve it with software and AI. The hardest part wasn't the code — it was learning enough of your world to point the code at the **right** problem."
> - **Backup only — NEVER a slide:** the two-rounds speed-vs-precision story (it now lives in §4, Slide 4.4 — not here).

Replace the old "fun fact" with **one honest picture of where your time went.** It makes the FDE point better
than any sentence.

[graphic: ONE horizontal **stacked bar** = 100% of Xavier's time, sized so **UNDERSTANDING dominates** — a big block for "understand Sagard · their business · VC/PE/PC · how PE works · the personas · how the portfolio-ops team works + its problems · how they monitor via the Q-reports", then a thin slice "scope the problem", then "plan / trade-offs / build", then a small "slides"; the understanding block reads ~70%+, build ~20%, slides small; small-print caption "Xavier's own rough estimate — self-reported, not measured"]

> *"I should be honest about where my time actually went. **Most of it was not coding.** It went into
> **understanding your world** — what Sagard is and how it makes money, the difference between VC, PE, and
> private credit, how PE actually works, who the personas are (the deal partner, the portfolio team, and the
> rest), how the **portfolio operations team** works and what problems they have, and how they **monitor the
> portfolio using the quarterly reports.** Only after all of that did I **scope the problem**, then **plan and
> weigh trade-offs and build**, and last, make these slides."*

> *"That's on purpose — because **that is what a Forward Deployed Engineer does.** You take something
> **ambiguous**, you research it, you **understand** it, you get **feedback and insights**, you plan, you weigh
> the trade-offs, and then you **solve the problem with software and AI.** The hardest part wasn't the code —
> it was learning enough of your world to point the code at the **right** problem."*

*(Note: these percentages are your **own rough self-estimate** — present them as "roughly," not as a measured
fact. The two-rounds speed-vs-precision story now lives in §4.2, not here.)*

---

## 11. Ask for questions / goodbye

> 🔒 **DECISION — LOCKED (§11 Ask for questions / goodbye):**
> - **Slides:** exactly **2**.
> - **Slide 11.1 — title:** "Comparability, provenance, a path forward — now, your questions"
>   - **On-slide anchors:** "comparability is the product" · "every number one click from its source" · "a clear path to the reliable, redundant version" · "your questions — and I have a few for you"
>   - **Graphic:** three small pillar icons (comparability · provenance · the path forward) — a clean recap, no numbers.
> - **Slide 11.2 — title:** "Built with AI, decided by humans" (the punch card — the last thing on screen)
>   - **On-slide anchors:** the **Concord** mark · "one comparable, source-traced view of every portfolio company" · "Made with love, with AI — but human-first on every decision ❤️" · "Thanks."
>   - **Graphic:** the Concord punch card — brand mark + slogan + heart line + a quiet "Thanks." — **held on screen through all of Q&A.**
>   - **On-slide honesty caveat (small):** none — keep the punch card clean; all honesty caveats stay spoken.
> - **Speak, don't slide:** pause before the card; read the heart line slowly and let it land; do NOT talk over the card ("human-first on every decision" = the whole thesis in six words); if pressed on "its source," provenance is **file-level** (source file + its own label + confidence + exact excerpt — no page/sentence; page-level anchoring is roadmap).
> - **Backup only — NEVER a slide:** the branding-honesty note (say only if asked) — the Concord mark is original SVG drawn in code; the Sagard logo is loaded from a file Xavier provided, not reproduced.

> *"That's Concord — comparability as the product, every number one click from its source, and a clear path to
> the reliable, redundant version. I'd love your questions — and I have a few for you."*

**The final punch (stage it — this is the very last beat):** after the section above, **pause**, bring up the
Concord punch card, and let the heart line **land** — read it slowly.

> *"Concord — one comparable, source-traced view of every portfolio company. Built with AI, decided by humans.
> **Made with love, with AI — but human-first on every decision ❤️.** Thanks."*

Hold the card — the Concord mark, the slogan, the heart line, and a quiet **"Thanks."** — **on screen through
Q&A.** Don't talk over it. *("Human-first on every decision" is your whole thesis in six words — refuse-to-
compare, provenance, humans-own-the-mark, all of it.)*

---

## 12. My questions for THEM (ask throughout, not just at the end)

> 🔒 **DECISION — LOCKED (§12 My questions for THEM):**
> - **Slides:** exactly **2**.
> - **Slide 12.1 — title:** "Three questions I can't answer without you"
>   - **On-slide anchors:** "Who actually owns the quarterly grind today?" (B1) · "Is Sagard AI-first but human-decision-driven — everywhere, or just the AI group?" (D2) · "Six months in, what did a successful FDE actually do?" (E1) · footer "the customer · the culture · the scorecard"
>   - **Graphic:** a three-card cue layout — one card per question, labelled customer / culture / scorecard.
> - **Slide 12.2 — title:** "Five themes — pick any thread you like" (a reference board)
>   - **On-slide anchors:** five group headers, one line each — "Validate my map" · "The real customer (Sharon)" · "Is this a real problem?" · "AI culture" · "The role (FDE)"
>   - **Graphic:** a compact 5-panel menu board — headers only, so the room can point at a thread.
> - **Speak, don't slide:** "I'll ask these throughout, not just at the end"; the full wording of every question is spoken, not printed; for A2 say "the solutions business — from the **Unigestion deal**, which I still need to re-verify."
> - **Backup only — NEVER a slide:** do NOT print all 12+ questions as separate slides — 12.1 (the three) is primary, 12.2 (the grouped board) is the only expansion.
> - **On-slide honesty caveat (small):** none on 12.1; on 12.2 keep group headers only — **no asserted Sagard facts (Unigestion / solutions / AUM) on the slide.**

**A. Validate my map ("correct me"):**
- *"Quick sanity check: Sagard makes money two ways — a management fee that keeps the lights on, and carried
  interest that's the real upside, but only after your LPs get their capital and preferred return back. Where
  am I wrong?"*
- *"I scoped Concord to the **direct PE portfolios**. With the solutions business (from the Unigestion deal —
  re-verify) and the credit book in the mix, is portfolio-company monitoring the right place to start — or is
  the sharper pain elsewhere?"*

**B. The real customer (Sharon):**
- *"I assumed the team that hand-keys these packs is Portfolio / Reporting Operations. **Who actually owns that
  today** — one person, a team, offshore, a vendor? And how many companies, and how many packs, per quarter?"*
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

> 🔒 **DECISION — LOCKED (§Appendix — honesty guardrails):**
> - **Slides:** exactly **0** — this is a **presenter reference; it is NEVER rendered as a slide.** It exists so no earlier slide breaks a locked rule.
> - **Rule 1 — Confidence range:** quote **only 90.4%–99.5%** (the on-screen cockpit range the room will actually see). **Never** also cite the audit-guardrail's ~84% floor; never invent a third number; never show two ranges on one slide.
> - **Rule 2 — Corpus phrasing:** always "**20+ packs**" (or "10 companies / 24 packs"); **never** "20+ companies" (there are only 10 companies).
> - **Rule 3 — False alarms:** **never say "0 false alarms" unqualified** — say "0 **sector-blind** false alarms (15→0)"; the raw missing-metric flag still has a couple (CarbonTrack / TalentVault) suppressed on the grid.
> - **Rule 4 — Re-verify, say "roughly," never hard-assert on a slide:** Sagard figures (strategy line-up, AUM ~US$46B, 190+ companies, 540+ staff, mid-market fund sizes ~$500M–$4B, "$100B by 2029", Unigestion) and vendor facts (Docling / Granite-Docling 2025, Reducto ~99% = vendor's own claim, GPT-4o 2024-era, Google Document AI HITL believed-deprecated, the ensemble-diversity math).
> - **Rule 5 — Standing caveats (verbatim in spirit):** currency = **flag, never convert**; refuse-across-asset-classes is **BUILT** while intra-SaaS margin is **roadmap**; vendor numbers are **claims**; provenance is **file-level**; the redundant ensemble is **designed, not built.**
> - **These guardrails govern every spoken answer and every earlier slide's copy.**

**Never over-claim (the verifier flagged these):**
- **Currency:** the tool **normalizes units + scale**, and **flags/refuses** on a different currency — it does
  **NOT** convert. PeopleFlow's GBP flag is a **front-end rule**; the parser doesn't see the £.
- **Provenance is file-level** today (no page number/screenshot in the drawer). The PDF-screenshot sidebar is
  **future design** — never show a page number or crop live as if real.
- **The redundant multi-reader ensemble + tiered consensus + human-review queue is DESIGNED, NOT BUILT.** Never
  imply it runs today. **Consensus is tiered**, not "all must agree" — say "unanimous is the green bar; 2-of-3
  *with independence* is the practical rule." **Independence is never total** — say so; agreement is strong
  evidence, not proof.
- **"Deterministic because of limited time; one method is not production-grade"** — keep this honest register;
  don't over-sell the current build.
- **No invented ROI/dollar numbers.** Time-savings stays qualitative. Recall = **76%→90%, 0 wrong values, 0
  *sector-blind* false alarms (15→0)**, measured on **24 synthetic PDFs** (denominator = the **128 numbers
  physically printed** across them; the jump came from a **backend parser fix**, not a changed test set). Say
  "synthetic" every time. **Never say "0 false alarms" unqualified** — the raw missing-metric flag still has a
  couple of false positives (CarbonTrack/TalentVault) suppressed on the grid.
- **Refuse-to-compare** (lender interest-margin vs SaaS product-margin) is **BUILT**; the **intra-SaaS** margin
  refusal is **roadmap** — the SaaS-margin heat colour is directional, not an audited like-for-like.
- **Hook #3's "95% accurate" is hypothetical** — keep it clearly separate from your real 76%→90%.
- **Vendor accuracy numbers are VENDOR CLAIMS** (Reducto ~99%, the "68% of errors are hallucinated numbers"
  line, Anthropic's multi-agent eval) — flag them as claims and lean on the *mechanism*, not the number. **None
  of the research headline numbers were measured on structured financial extraction** — say so if pushed.
- **Confidence range — LOCKED to 90.4%–99.5%** (the on-screen cockpit range the room will actually see). If
  asked live, quote **only** this one range — never also cite the audit-guardrail's ~84%–99.5%, and never
  invent a third number. The corpus is **10 companies / 24 packs** — say "20+ packs," never "20+ companies."

**Re-verify on sagard.com the morning of (don't hard-assert):** the strategy line-up (VC / PE / private credit
/ real estate / solutions), AUM (~US$46B), portfolio-company count (190+), staff (540+), **mid-market fund
sizes** (~$500M–$4B), the "$100B by 2029" goal, and the **Unigestion acquisition** (that it closed, and when).
Say "roughly" and "as of their latest public figures."

**Vendor facts to state carefully:** IBM **Docling / Granite-Docling** is **2025** (drop the exact month unless
you check); **Reducto ~99%** is the **vendor's own** benchmark; **GPT-4o** is 2024-era (newer vision models
exist); Google's **Document AI HITL — believed deprecated; verify the year before asserting it** — don't
present it as a current option; the ensemble-diversity math (**error variance ~1/M under independence, RMS
~1/√M**; Condorcet's Jury Theorem) is sound, but **verify the exact paper/venue before quoting one**.