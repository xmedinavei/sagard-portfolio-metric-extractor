# Document iii-0 — Presentation Outline: Options & Trade-offs
### Sagard "Portfolio Metrics Assistant" — the case-study **presentation** (not the slides yet)

> **What this document is.** This is the *planning* document for your live case-study presentation. It
> lays out **every sensible way** to structure the talk, with the **good and bad points of each**, so you
> can pick. It does **not** choose for you. When we agree on a shape, the next step is Document iii — the
> actual slide deck.
>
> **Who you are presenting to:** **Parinaz Sobhani** (Head of AI) and **Sharon Liu** (Head of Operations,
> ex-Chief Compliance Officer). One AI expert, one operations/controls leader. *(Second interviewer
> corrected 2026-07-12 — it is Sharon Liu, not Rahul Mehrotra.)*
>
> **Your slot:** ~30–45 minutes to present + questions. (You confirmed this.)
>
> **How this was built:** direct reading of all your existing case-study docs (Doc 0, Doc i, the prototype
> findings) + a deep research pass on both interviewers, on Sagard, on presentation formats, and on the
> "financial vs technical" question. Sources are named where it matters.
>
> **A promise on language.** You asked me to keep this simple and easy to remember. So: short sentences,
> plain words, and every finance/tech term explained the first time. Lots of tables so you can skim.
>
> **A note on "decisions."** Where I have a lean, I mark it clearly as *"my lean (you can ignore it)"*.
> Everything stays your call.

---

## Part 1 — The one-page summary (read this if you read nothing else)

**The single most important idea in this whole document:**

> You are told to present to *"business stakeholders."* Now the room is clear: **one deep-AI evaluator
> (Parinaz) + one senior operations & controls leader (Sharon).** That is the classic Forward-Deployed
> pairing — the *AI judge* and the *real internal customer*. So the winning talk is **a clear
> operations/business story on the surface, with deep technical honesty ready the second Parinaz pushes.**
> You serve both at once — and that "both" *is* the FDE skill.

**Six things are true and they shape everything:**

1. **This is a business + operations story, not a finance-math story.** Your tool does not do fund returns
   or valuations. It makes messy numbers *comparable, auditable, and trustworthy*. Lead with that. (Part 3.)
2. **Your thesis is Parinaz's life's work.** Her PhD taught machines that *the same words can mean different
   things*. That is "same label ≠ same metric." You do not need to name-drop this — just lead with it.
3. **Your thesis is also Sharon's daily job.** She runs Operations (fund accounting, valuation, controls,
   compliance) — the team that hand-reconciles these PDF packs *today*. To her, your provenance =
   **audit trail**, refuse-to-compare = **control**, offline = **data security**. Speak her language. (Part 2.)
4. **Your honesty is your strongest card, not a weakness.** "We measured 76%, fixed it to 90%, zero wrong
   numbers" is exactly what *both* reward — Parinaz for rigor, Sharon because a wrong number in a report is
   her nightmare. (Part 9.)
5. **"Deterministic" is a strength here, not an apology.** Parinaz reads it as right-sized AI; Sharon reads
   it as reliable, testable, and auditable. Same word, two wins. The Firecrawl story can be told as a
   *gift*. (Part 7.)
6. **The demo is the proof, not a feature tour.** Two moments carry it: the ARR trend that was hidden by a
   renamed label, and the tool *refusing* to compare a lender's margin with a software margin. (Part 6.)

**The four things you must decide** (this doc gives you the options for each):
- **A. The room** — how much technical depth to expose, now that we know it's AI + operations. (Part 4.)
- **B. The outline shape** — which story structure? (Part 5.)
- **C. How bold to be about the honest 76%→90% + synthetic-data story.** (Part 9.)
- **D. How to tell the "why deterministic / Firecrawl credits" story.** (Part 7.)

---

## Part 2 — Your room: the two people (and how to win each)

You are performing for two different-but-connected minds: the AI expert and the operations customer. Here
is each in plain terms.

### Parinaz Sobhani — Head of AI. The "rigor and trust" judge.
- **Who she is:** An NLP PhD (natural-language-processing = teaching computers to understand text). Before
  Sagard she was Head of AI at Georgian, where she *vetted AI investments* and *helped 50+ companies adopt
  AI*.
- **Her one big theme: TRUST.** Her public writing is all about trust, fairness, explainability
  ("can you show *why* the AI did that?"), and being **anti-hype**. She says the danger with AI is *"setting
  the wrong expectations."*
- **The gift:** Her PhD was *stance detection* — building systems that see that *the same sentence can carry
  a different meaning, and that you must surface the reason behind it.* This is your thesis in academic
  clothing. Your "same label ≠ same metric, and here is the source" will feel deeply familiar to her.
- **She rewards:** honest measurement, "right-sized AI" (see box below), a human staying in control, and
  being able to click a number and see where it came from.
- **She punishes:** hype, "it's accurate" claims you cannot prove, and demos that only *extract* numbers.
  She calls this the **"prototype trap"** — *anyone* can build a demo now, so the real question is: does it
  change a **decision** a real team will trust and act on?

### Sharon Liu — Head of Operations, ex-Chief Compliance Officer. The "controls and trust" customer.
- **Who she is:** A senior **fund-operations** leader with ~17 years of experience: fund accounting,
  valuation, reconciliation, risk, and compliance (she was a **Chief Compliance Officer** before). Toronto-
  based, CAIA charterholder (a professional qualification in alternative investments). She is **not** an
  engineer, **not** a product person, and **not** a deal-maker. *(Two independent research passes confirm
  this with high confidence.)*
- **Why she matters most:** She is the **real internal customer.** Her team is the one that *today* opens
  20+ PDF packs and hand-keys the numbers into a spreadsheet — the exact pain your tool removes. When she
  looks at your demo, she is asking one thing: *"Can my team trust this enough to put it in front of an
  investment committee or an auditor?"*
- **She thinks in her own words:** *audit trail, controls, reconciliation, source-of-truth, data
  governance, exception handling, sign-off, maintainability.* Translate your features into these words.
- **She rewards:**
  - **Provenance = an audit trail.** Click any number → see the source. To her this is *"it survives an
    auditor or an LP challenge."* This is her single strongest hook.
  - **Refuse-to-compare = a control.** The system will *not* silently emit a wrong comparison. That
    de-risks her reporting.
  - **Offline / local = data security.** Confidential portfolio financials never leave the building to an
    outside AI. A former compliance officer asks this early.
  - **Deterministic = reliable and testable.** Predictable, cheap, auditable — the opposite of a black box.
  - **A plan for the misses.** The ~10% the tool doesn't catch must go to a **human review queue**, not
    vanish silently.
- **She punishes:** black-box hype; a **confidently-wrong number** that flows into a report; a shiny demo
  with **no plan for who maintains it**; and any hint that sensitive data is sent to an outside model.

> **`Right-sized AI` (plain English):** use simple fixed rules for the 95% of work that is predictable and
> cheap, and only call an expensive AI model for the small, genuinely tricky 5%. **Both** interviewers love
> this — Parinaz as good engineering judgment, Sharon as reliability and control.

### What they BOTH reward and BOTH punish (memorize this)

| They BOTH reward | They BOTH punish |
|---|---|
| Honest, checkable measurement (76%→90%, 0 wrong) | Hype and over-claiming |
| Right-sized AI (rules for bulk, AI for the tail) | A confidently-wrong number reaching a report |
| A human staying in control (augment, not replace) | Made-up dollar savings ("saves $2M!") |
| Visible trust: click-to-source + refuse-to-compare | "It's accurate" with no proof |
| Business/operations value stated first | A demo with no plan for who owns and maintains it |
| Limitations you say *before* being asked | Sending confidential data to an outside AI model |

### Where they pull in different directions (your talk must feed both)

| Parinaz pulls toward… | Sharon pulls toward… |
|---|---|
| *How* did you measure it? What is the ground truth? | Can my team *trust* it enough for an IC / an auditor? |
| Where exactly does the AI earn its place vs a rule? | Where does every number come from? (audit trail) |
| Calibration, bias, honest limits | What happens to the numbers it gets *wrong*? |
| "Trust at its core" | Who *maintains* this when a company changes its template? |
| The model's judgment | Does it fit my quarterly reporting workflow? Where does the data go? |

**The design rule this creates:** carry an **operations/business story on the surface** (keeps Sharon
with you) with a **deep, honest technical layer one question away** (keeps Parinaz with you). Never starve
either one. The good news: most of your best features (provenance, refuse-to-compare, deterministic,
offline) satisfy **both at once** — so you rarely have to choose.

### Sagard facts that make you look prepared (use lightly, and re-check before the day)

- **A real white space.** Sagard already has an AI tool for **finding deals** (before they invest). Yours is
  for **monitoring companies they already own** (after they invest). That is a genuine gap you fill — and it
  is *operations* turf, which is Sharon's world.
- **Speak their words.** Sagard's own AI language includes *"automated ingestion and transformation,"
  "confidence levels,"* and *"explainable reasoning."* Your tool does exactly these. Mirror the phrasing.
  *(Re-verify these are still their words before quoting them — the source was a third-party write-up.)*
- **The figures are current:** ~US$46B assets under management (AUM = total money they manage), 190+
  portfolio companies, 540+ staff, goal of US$100B by 2029. *Re-check on sagard.com the morning of.*
- **FDE = a Palantir term.** A Forward Deployed Engineer sits *with* the business users, turns their real
  problems into working software, and iterates fast. Sagard's job description matches this word-for-word.
- **The "Value Creation" / Operations function** is where your tool lives. Sharon *is* that internal
  customer. Publicly, Sagard has no named data/metrics function — that is your gap to fill.

---

## Part 3 — First, the direct answer: is this financial, technical, or both?

You asked me to identify this clearly. Here is the plain answer.

> **It is a BUSINESS + OPERATIONS story, told with financial *fluency* and backed by technical *proof on
> demand.* It is NOT a finance-math case, and NOT a systems-architecture case.**

The word "financial" hides **three different meanings**. Only two of them fit your tool:

| Flavor of "financial" | What it means | Does your tool support it? |
|---|---|---|
| **1. Domain fluency** | Speaking the language of the metrics *and of operations*: ARR, gross margin, covenant headroom — and audit trail, reconciliation, source-of-truth, valuation support | ✅ **Strongly.** This IS your thesis, and it is Sharon's daily vocabulary. |
| **2. Business value** | Roughly what it's worth: operations hours saved, fewer errors reaching a report, audit-defensibility | 🟡 **Lightly.** Sketch it in words. **Never invent a dollar number.** |
| **3. Fund-finance math** | Fund returns (IRR), valuations (NAV), EBITDA, leverage, deal underwriting | ❌ **No.** Your data does not contain this. Going here is an over-claim trap. |

So: be **fluent** in the metric *and operations* language (flavor 1), be **modest and honest** about value
(flavor 2), and **never pretend** to do fund math (flavor 3).

> **Note on Sharon:** she does *valuation operations*, so words like "reconciliation," "audit trail," and
> "valuation support" are her home turf. You can speak them confidently. But she also knows the tool *feeds*
> valuation work — it does not *make* the valuation mark. Saying that out loud (the tool supplies auditable
> inputs, a human still signs) earns trust with a former compliance officer.

**"Technical" also needs a rule.** Only one person in the room is technical (Parinaz), and she will test the
depth. But two mistakes lose the room:
- **Too shallow / "it's accurate":** Parinaz will not believe an unproven accuracy claim.
- **Too deep / regex and schemas on a slide:** this loses Sharon completely and fails the brief's "talk to
  business stakeholders" test — an instant red flag for an FDE.

**The fix:** put technical depth at the level of *decisions* ("why deterministic-first, why refuse, why
provenance"), and keep the *mechanics* (how the code does it) in your back pocket for Parinaz's questions.

### The blend, section by section (a simple recipe)

| Section (from the brief) | Business/ops value | Domain fluency | Technical depth |
|---|---|---|---|
| **1. Problem & context** | High (55%) | Medium (35%) | Low (10%) |
| **2. The prototype** | Medium (35%) | Low (15%) | **High (50%)** ← your depth peaks here |
| **3. Live demo** | High (50%) | Low (20%) | Medium (30%, shown as *trust*, not features) |
| **4. Roadmap** | High (40%) | Low (20%) | Medium (40%, about *rollout + maintenance*) |

*(Percentages are a feel, not a rule. The point: business/operations leads everywhere; technical peaks in
section 2; finance stays at "I speak the language," never "I do the math.")*

---

## Part 4 — Decision fork A: how much technical depth to expose?

Now that we know the room (one AI expert + one operations leader), the fork is no longer "who are they" — it
is **how much technical depth to put on the main slides.** Three ways, with trade-offs.

| Option | What it means | Good | Risky |
|---|---|---|---|
| **A1. Both** (surface business/ops, defend technical) | Lead in plain operations language; go deep the moment Parinaz probes | Serves both people; matches what an FDE actually is; the room composition makes this the natural fit | Needs practice to switch registers smoothly; more to rehearse |
| **A2. Business/ops only** | Keep it non-technical throughout; treat both as business buyers | Cleanest, simplest; perfect for Sharon; obeys the brief literally | Wastes your depth; **Parinaz will probe and may find thin ice** |
| **A3. Impress the AI expert** | More technical judgment on display, business framing as a thin wrapper | Plays to your strength; directly answers "can this person do the job?" | **Loses Sharon** — a black-box, tech-heavy pitch is exactly what a compliance leader distrusts |

> **My lean (you can ignore it):** **A1 — Both.** With a literal operations customer in the room, you *must*
> land the business/controls story; with an NLP PhD in the room, you *must* have the depth ready. A1 is the
> only option that serves both. But you asked to see the trade-offs, so there they are — your call.

---

## Part 5 — Decision fork B: the outline shapes (the main event)

An "outline" is just **the order you tell the story in.** The brief needs four things covered: (1) problem,
(2) prototype, (3) live demo, (4) roadmap. The question is *what order and what spine* you wrap around them.

Here are **six shapes.** Each is a card: what it is, when it wins, its downsides, and how it fits your two
people. They can be **combined** (Shape F shows how).

### Shape A — Follow the brief, in order
*Problem → Prototype (with limits) → Live demo → Roadmap.*
- **When it wins:** lowest risk. The graders can tick every required box. Everyone understands it instantly.
- **Downside:** it can feel generic — *every* candidate can produce this. On its own, it does not stand out.
- **Parinaz fit:** fine (section 2 gives her the honesty surface). **Sharon fit:** good (clear, complete,
  structured — ops leaders like structure).
- **Fix for the downside:** run your one-line thesis through all four sections so it reads as a *point of
  view*, not a checklist.

### Shape B — Thesis-led (one sharp claim, everything is proof)
*Open with "Comparability is the product — not extraction. Same label ≠ same metric." Then every section is
evidence for that one sentence.*
- **When it wins:** when you own a strong, defensible idea. It makes you look like a *thinker*, not a coder.
- **Downside:** the whole talk rests on one claim. If someone dents it and you can't defend it, the talk
  wobbles. Can drift into abstract talk if you don't hit the demo fast.
- **Parinaz fit:** **excellent** (a sharp claim + the refuse-to-compare proof is her world). **Sharon fit:**
  good — but translate the thesis into *her* terms fast ("a wrong comparison is a control failure").

### Shape C — Answer-first (consulting style; "SCQA / pyramid")
*Say the conclusion in the first 2 minutes, then spend the rest supporting it.* (SCQA = Situation,
Complication, Question, Answer. It just means "give the punchline first, then the evidence.")
- **When it wins:** with senior, busy people who want the bottom line first. Great for a **question-heavy**
  room — a challenger can jump to any part and you defend just that part.
- **Downside:** telling the punchline first can make the live demo feel flat. Needs a razor-sharp one-line
  answer or the structure collapses.
- **Parinaz fit:** very strong (top-down logic is how she reasons). **Sharon fit:** good (a busy operations
  head appreciates the bottom line up front).

### Shape D — Demo-first "cold open" (Palantir / FDE style)
*Skip the intro. Open live inside the running tool: "10 companies, one quarter, loaded — watch." Show one
comparison and one refuse-to-compare in 60–90 seconds. THEN go back and explain the problem, the how, the
roadmap.*
- **When it wins:** when you have a *real working tool* (you do) and the room values proof over promises. For
  an FDE role, opening inside the product is the most on-brand thing you can do.
- **Downside:** highest risk on stage — a live open can stall. Needs a bullet-proof offline backup (yours is
  offline — good). Can confuse people who don't yet know why they should care.
- **Parinaz fit:** good *if* the first thing on screen is the refuse-to-compare + the honest number (trust
  arrives with capability). **Sharon fit:** okay — she likes proof, but lead the cold open with the
  **audit-trail / refuse** moment (a control she recognizes), not a flashy chart, or it can feel salesy.

### Shape E — Story / "day in the life" (follow one analyst)
*Follow a named analyst ("Maya") through one painful quarter-close by hand, then through the same close with
the tool.*
- **When it wins:** makes an abstract data problem *felt*. People remember stories far better than bullet
  lists. Makes the **user the hero**, the tool the helper.
- **Downside:** can feel slow to a rigor-first person if the story runs long before proof arrives. It still
  has to hand off to the hard "how it works" and "roadmap" parts.
- **Parinaz fit:** good as a *frame*, but she'll want it to hand off to real evidence fast. **Sharon fit:**
  **excellent** — "Maya's" painful quarter-close *is literally her team's reality.* This shape now has a
  strong second champion.

### Shape F — Hybrid (the container + the spine + a cold-open + a vignette)
*Use Shape A's four sections as the safe box (so nothing is missed). Run Shape B's thesis as the spine
through all four. Open with a controlled 60–90s version of Shape D (the cold open). Start the problem section
with a short Shape E vignette to make the pain real.*
- **When it wins:** deliberately serves *both* people at once — rigor for Parinaz, operational reality for
  Sharon — while guaranteeing all four required sections land.
- **Downside:** most moving parts. More to rehearse and time. Can feel "constructed" if a seam shows.

### The comparison at a glance

| Shape | Risk of missing a section | Stands out? | Parinaz | Sharon | Demo impact | Prep effort |
|---|---|---|---|---|---|---|
| **A. Follow the brief** | Very low | Low | ●●○ | ●●● | Medium | Low |
| **B. Thesis-led** | Low | **High** | ●●● | ●●○ | High | Medium |
| **C. Answer-first** | Low | Medium-High | ●●● | ●●● | Can flatten | Medium |
| **D. Demo-first cold open** | Medium (reordered) | **High** | ●●○ (if trust leads) | ●●○ (if control leads) | **Highest** | **High** |
| **E. Story / day-in-life** | Medium | Medium-High | ●●○ | ●●● | High | Medium |
| **F. Hybrid** | Very low | **High** | ●●● | ●●● | High | **Highest** |

> **My lean (ignore if you like):** with a real operations customer in the room, **E (day-in-the-life)** and
> **F (hybrid)** are now especially strong, because the painful quarter-close is *literally Sharon's world*.
> **A + B** (safe four-section box with a thesis spine) is the simplest reliable choice. **D (cold open)** is
> the highest-upside / highest-risk play — only take it if your demo backup is bullet-proof, and lead it with
> the audit-trail/refuse moment. Your call.

### Two sample slide maps (so you can *feel* the difference)

These are **skeletons**, not final slides. Both fit ~30–35 min of talking + 10 min questions.

**Map 1 — "Safe + sharp" (Shape A box + Shape B spine, with an E-style opener)**

| # | Slide | ~Min | Purpose |
|---|---|---|---|
| 1 | Title + one-line thesis | 1 | "Comparability is the product — not extraction." |
| 2 | The quarter-close pain (a short "Maya" vignette) | 3 | Make the problem *felt*; name the user (fund-ops analyst) |
| 3 | Why the obvious fixes fail (template / scraper / dashboard) | 2 | Show you understand the real problem |
| 4 | What the tool guarantees: comparability + a traceable audit trail | 3 | The two promises; operations language |
| 5 | How it works — the "right-sized AI" line | 4 | Rules for the bulk, AI for the tail; where the human sits |
| 6 | Honest limits + the 76%→90% measurement + the exception queue | 3 | Volunteer weakness = trust (Part 9) |
| 7–9 | **LIVE DEMO** — 2 insight moments + click-to-source (audit trail) | 8 | The proof (Part 6) |
| 10 | Roadmap: run-alongside → pilot → rollout, + who maintains it | 5 | Operations rollout (Part 8) |
| 11 | Success criteria + build-vs-buy in one line + data-security note | 2 | The wedge; the controls |
| 12 | Close: the one sentence + the ask | 1 | Land the thesis again |

**Map 2 — "Cold open" (Shape D)**

| # | Slide | ~Min | Purpose |
|---|---|---|---|
| 1 | (No title first) — **LIVE**: one refuse-to-compare + click-to-source (audit trail) | 3 | Prove control before claiming anything |
| 2 | "Why was that hard?" — the thesis appears | 2 | Name the idea after they've seen it |
| 3 | The quarter-close pain + the user (Maya) | 3 | Now the problem lands harder |
| 4 | How it works — right-sized AI + honest 76%→90% + exception queue | 5 | Capability + candor together |
| 5–6 | Back to the tool: the 5-quarter ARR recovery | 6 | The "user insight" moment |
| 7 | Limits + data-security (offline) | 2 | Trust for a compliance leader |
| 8 | Roadmap: run-alongside → pilot → rollout + maintenance | 5 | Sharon's operations lens |
| 9 | Success criteria + build-vs-buy | 2 | The wedge |
| 10 | Close | 1 | The one sentence |

---

## Part 6 — The live demo (how to stage it so it *tells a story*)

The demo is graded on **how well it tells the story**, not how many features it shows. So drive it like a
story with **two "insight moments"** — both already proven true in your data.

**Insight moment 1 — the hidden trend (the "trap").**
- Open NovaCloud's ARR (Annual Recurring Revenue = the yearly value of active subscriptions).
- A naive tool shows **one lonely dot** — it looks like the company only started reporting ARR last quarter.
- In truth all **five quarters** are there ($24.1M → $34.2M), hidden because the label was *renamed*
  ("End-of-Period ARR" vs "ARR(End of Period)").
- Then show the full trend recovered once the tool stitches the renamed labels together.
- **The line to say:** *"A silent blank is more dangerous than a loud error. This is what 'comparability is
  the product' means."*

**Insight moment 2 — the refusal (the "control" moment).**
- Show the `gross margin` column. A lender's 62% is sitting next to a software company's 76%.
- The tool **refuses** to compare them, and *shows the reason*: a lender's "gross margin" is interest income
  minus cost of funds — a completely different thing from a software delivery margin.
- **The line for Parinaz:** *"A generic dashboard would rank these. Ours refuses — and tells you why."*
- **The line for Sharon:** *"The system will not silently put a wrong comparison into your report. That
  refusal is a control."*

**The trust spine — click any number → see its source (the audit trail).**
- At any point, click a number and the provenance drawer opens: source **file**, the original label, a
  confidence score, and the snippet. (Provenance = the proof behind a number.)
- **For Parinaz** this is transparency and explainability. **For Sharon** it is an *audit trail* — *"every
  figure traces back to its source document, so it survives an auditor or an LP challenge."* Say both.

### Demo choices (with trade-offs)

| Choice | Options | Trade-off |
|---|---|---|
| **Where in the talk** | Cold open (start) · Middle (after the setup) | Cold open = maximum wow + risk; Middle = safer, story is set up first |
| **How you run it** | Fully live · Live with a recorded backup ready · Recorded walkthrough only | Live = most credible + most risk; recorded backup = best of both; recorded-only = safe but less impressive for an FDE role |
| **How many insights** | Just the 2 above · add a third (runway / burn) | 2 is tight and memorable; a 3rd risks running long and diluting |

> **Safety net (do this regardless):** your cockpit is **offline** (no internet needed) — which is *also* a
> selling point for Sharon (confidential data never leaves the building). Still, have a **screen recording**
> of the exact demo path saved locally, and a couple of screenshots in the deck, in case the live tool
> hiccups.

---

## Part 7 — Decision fork D: the "why deterministic?" technical slide (and the Firecrawl truth)

You want a slide that explains your options and *why you chose the deterministic (fixed-rules) path*. This is
smart — it's the kind of judgment both interviewers want to see (Parinaz for engineering, Sharon for
control). Here is the content, plus **three honest ways** to handle the "I ran out of Firecrawl credits" part.

**First, the plain-English trade-off** (this is the slide's core):

| | **Deterministic (fixed rules)** | **LLM (AI model) for everything** |
|---|---|---|
| **Cost** | Free to run | Pay per document, every run |
| **Auditable?** (can you show *why*) | Yes — every step is a readable rule | Hard — the model's reasoning is opaque |
| **Reproducible?** (same input → same output) | Yes, always | No — can vary run to run |
| **Invents numbers?** | Never | Can "hallucinate" (make up) a value |
| **Data stays in-house?** | Yes (fully local) | Usually sends data to an outside model |
| **Handles messy / brand-new text?** | Weak — only knows its rules | Strong — flexible |
| **Verdict** | **The right default for a *trust* tool** | Reserve for the small, genuinely ambiguous tail |

**The design you chose — say it in one line:** *"Rules for the bulk, AI only for the ambiguous tail, and a
human approves. Right-sized AI."* This is a **strength**. For Parinaz it's cost-aware engineering judgment.
For Sharon it's reliability, auditability, and — because it runs locally — **data security**.

**Now, the Firecrawl-credits part.** (Firecrawl = a paid service that turns documents into clean text with
AI.) The honest history: you leaned on a paid AI-extraction service, **ran out of credits**, and that pushed
you to build the deterministic path — which turned out to be *better* for a trust tool. That is a real
forward-deployed moment. Three ways to tell it:

| Option | How you tell it | Good | Risky |
|---|---|---|---|
| **D-1. Principle first, credits as a footnote** | Lead with "deterministic-first is the right call for a trust tool." If asked why not just use an LLM, add: *"and practically, I hit the credit ceiling on the paid service — which turned out to be a gift, it forced the auditable design."* | Safe and strong; principle leads; honesty on tap | Slightly hides a good, human story unless they ask |
| **D-2. Tell the constraint story openly (as a highlight)** | *"Here's a real forward-deployed moment: I ran out of credits mid-build. That constraint pushed me to the deterministic design — which is actually more trustworthy. The limit made the product better."* | Very authentic; both value real constraints; the *most* FDE-flavored version | Sounds unpolished if delivered flatly — needs a confident, "this is a feature" tone |
| **D-3. Omit credits; pure design story** | Just present it as a deliberate design choice, no mention of credits | Cleanest, most polished | If they probe cost or "did you try an LLM?", the omission can look like post-hoc rationalization |

> **My lean (ignore if you like):** **D-1** as the safe default, and switch to **D-2** if the room feels
> warm and you want to show real-world grit. Either way, *never* let "I ran out of credits" be the
> *headline* — the headline is "deterministic-first is the right design; the constraint proved it."

---

## Part 8 — How it grows: the roadmap + "production-ready" section

This is brief section 4. With Sharon in the room, this is now an **operations rollout** story, not a
"product-to-market" one. Ops leaders **buy maintainability, not demos.** So present the future as **low-risk
stages**, each with a deliverable, a timeline, a dependency (what you need first), and a success measure —
and be ready on *who owns and maintains it.*

### The staged rollout (low-risk, the way an operations leader buys)

| Stage | What happens | Deliverable | Depends on | Success measure |
|---|---|---|---|---|
| **0. Prototype** (done) | The tool exists; measured 76%→90% | Working offline cockpit | — | 90% recall, 0 wrong values |
| **1. Internal tool, live** | Get it in front of one operations analyst fast | Hosted internal version | A little infra | An analyst uses it on a real close |
| **2. Run alongside ("shadow")** | Tool runs *next to* the team on real packs; **no report rides on it yet** | Side-by-side outputs + an accuracy report | Access to real reporting packs | Accuracy measured on real data; misses go to a review queue |
| **3. Small pilot** | 1–2 operations teams use it for real, with a human check + sign-off | Pilot + review workflow | Rulebook governance, a named owner | Adoption + trust (how often they accept its output) |
| **4. Full rollout** | Across the portfolio | Integrated, monitored tool | Data-warehouse integration | Coverage + a live quality gate + a maintenance owner |

> **The line to say (for Sharon):** *"We never let a report ride on it before it has run silently alongside
> your team and earned trust."* That is exactly how a compliance-minded operations leader wants to hear it.

### The "production-ready" improvement menu (what to fix to make it real)

Present these as a menu with honest effort/impact, and say which are in the deck vs mentioned in passing.
The **bold** ones are the questions Sharon *will* ask.

| Improvement | Plain meaning | Why it matters |
|---|---|---|
| **A human review queue for the misses** | The ~10% it doesn't catch goes to a person, never vanishes silently | Sharon's #1 trust concern — nothing wrong slips through |
| **Maintenance / template-drift ownership** | What happens when a company changes its reporting pack next quarter — and who fixes it | Ops buys maintainability; be ready to name the owner |
| **Page/snippet-level provenance** | Click a number → jump to the exact *sentence*, not just the file | Deepest audit trail; Parinaz will ask why it's not done yet |
| **Data security / confidentiality** | Confidential financials stay local, never sent to an outside model | A former compliance officer asks this early |
| **Reconcile to source-of-truth** | Tie the tool's numbers back to audited financials | How an operations team validates trust |
| **Real, messy packs** | Test on actual Sagard formats, not 24 synthetic PDFs | The honest #1 dependency (needs data access + compliance) |
| **Scale to 190+ companies** | Keep the cost of onboarding "company #191" low | The rules+tail design keeps it bounded |
| **More sector packs + a real credit path** | Handle more business types; benchmark credit once >1 lender | Extends coverage without over-claiming today |

> **Framing tip:** attach a *success/quality gate* to each roadmap item (a target number, a check), not just
> a feature name. **Both** reward realism and punish over-promising. Deliberately **under-promise.**

---

## Part 9 — Decision fork C: how bold to be about the honest story

Your evidence leans on real honesty: **you measured your own tool at 76%, fixed it to 90%, with 0 wrong
values and 0 false alarms — and the data is synthetic (made-up, not real Sagard companies).** How loud
should this be? Three options.

| Option | How loud | Good | Risky |
|---|---|---|---|
| **C-1. Centerpiece** | "We grade our own numbers" is a *main* message | **Very aligned with both** — Parinaz's whole brand is honest measurement; Sharon's nightmare is a wrong number, so proving you hunt them down builds deep trust | If overdone, can sound like dwelling on weakness; needs a confident "this is strength" tone |
| **C-2. Supporting beat** | Honest, but one clear slide, not the headline | Balanced; keeps the story about capability while proving candor | Slightly less memorable as a differentiator |
| **C-3. Minimize** | Lead with "it works at 90%"; mention limits only if asked | Cleanest, most confident-sounding | **Riskiest** — if Parinaz probes (she will) and finds you *downplayed* limits, the trust story cracks |

**Whichever you pick, add the part Sharon needs most: the *precision* angle and the plan for the misses.**
- She cares less about a pretty accuracy % and more that the tool **does not emit a confidently-wrong
  number** into a report.
- So say: *"90% captured, 0 wrong, 0 false alarms — and the ~10% we don't auto-capture is **flagged for
  human review**, never silently dropped."*
- And say **why this is the right measure:** *"In a report that goes to an IC or an auditor, a
  confidently-wrong number is worse than a missing one. So we optimize for zero wrong values, and we send
  the misses to a person."* This answers Parinaz's "is your metric gameable?" *and* Sharon's "how does my
  team catch the misses?" in one sentence.

> **My lean (ignore if you like):** somewhere between **C-1 and C-2** — make honesty *clearly visible* (one
> strong slide + the demo's refuse-to-compare + the exception-queue line), framed the whole way as *strength
> and control*, never as apology. **C-3 is the one I'd be most careful with.**

---

## Part 10 — The hard questions, and how to hold them (defense map)

The brief grades "how you handle questions about trade-offs and limitations." Here are the questions each
person is most likely to ask, with the *direction* of a good answer. Keep answers **outcome-first, then the
mechanism if they want it.**

| Likely question | Who asks | Direction of a good answer |
|---|---|---|
| "Where does the AI run vs a rule — and why couldn't a rule do it?" | Parinaz | Show the line: rules for the bulk; AI only for the ambiguous tail; give one concrete example a rule can't resolve |
| "How did you measure 76%/90%? Is recall even the right metric?" | Parinaz | Ground truth = 128 printed numbers; recall = captured-correctly; and "zero wrong beats pretty accuracy for a report" |
| "Does 90% survive real, messy packs you've never seen?" | Both | Be honest: unknown yet — that's why the **run-alongside** stage exists; commit to an accuracy check that grows with the data |
| "How do I trust this enough for an IC or an auditor? How does my team catch the misses?" | **Sharon** | The recall story + **the human review queue** for the ~10%; nothing wrong slips through silently |
| "Can every number trace back to its exact source for our auditors?" | **Sharon** | Yes — the provenance/click-to-source *audit trail* (file-level today; page-level on the roadmap) |
| "Where does the data go? Are you sending our confidential financials to an outside AI?" | **Sharon** | No — it runs **offline/local**; sensitive data never leaves the environment |
| "What happens when a company changes its reporting template next quarter — who maintains it?" | **Sharon** | The human-owned rulebook + a named maintenance owner; be honest about the ongoing effort |
| "Walk me through what happens when two managers define the same-named metric differently." | **Sharon** | This is your **refuse-to-compare** moment — the tool flags it and asks a human, never silently merges |
| "How would you roll this out across 190+ companies — pilot, ownership, support?" | **Sharon** | The staged rollout in Part 8; name the owner and the maintenance plan |
| "Everyone can demo extraction. What's genuinely hard here?" | Parinaz | Comparability + trust, not extraction. Show it changes a *decision* (a wrong compare reaching a report) |
| "Why build this instead of buying one?" | Both | OCR/extraction is buyable; the **comparability/normalization layer is the wedge** and the reason to build |
| "Synthetic data — how do you know it generalizes?" | Both | It let you stress-test the hard cases safely; roadmap #1 dependency = real packs + compliance |

> **Golden rule for Q&A:** if you don't know, say so and say *how you'd find out*. The brief literally says
> *"you do not need to have all the answers."* Both interviewers reward an honest "I don't know yet, here's
> my plan" over a confident bluff — and for a former compliance officer, admitting a limit *builds* trust.

---

## Part 11 — Delivery & speaker strategy (for a 30–45 min slot)

**A simple time budget** (adjust to your real slot):

| Block | Time | Note |
|---|---|---|
| Problem + thesis | ~6–8 min | Hook fast; make the pain real (Sharon's world) |
| Prototype + how it works + honest limits | ~7–9 min | Your technical peak; volunteer weaknesses |
| **Live demo** | ~8–10 min | The proof; 2 insight moments; don't rush |
| Roadmap + success criteria | ~5–7 min | Staged rollout + maintenance (Sharon's lens) |
| Close | ~1–2 min | Repeat the one sentence |
| **Questions** | ~10–15 min | Where much of the grading happens |

**Opening options:** (a) the one-line thesis; (b) a 30-second "Maya" analyst vignette; (c) the cold-open
demo. Pick one that matches your chosen outline shape.

**Closing options:** (a) repeat the thesis + a soft ask ("this is the monitoring-side complement to your
deal-sourcing platform"); (b) a one-slide roadmap recap; (c) the single most memorable demo number.

**Speaker-notes approach:** write **one sentence per slide** as your anchor (not paragraphs). Rehearse the
demo path until you can do it while talking. Time yourself twice.

**The two "do not" rules:** no invented dollar savings; no "10x!" hype.

**A room-reading tip:** when Parinaz asks, answer in AI/measurement terms; when Sharon asks, answer in
controls/audit/workflow terms. Mirror whichever vocabulary the questioner uses.

---

## Part 12 — Still-open questions for you (so we can build the deck)

Before we write Document iii (the slides), a few things only you can answer:

1. **Outline shape** — which of the six (or the hybrid) do you want to build? (Part 5.)
2. **The room** — A1 both / A2 business-only / A3 technical-heavy? (Part 4.)
3. **The honesty dial** — C1 centerpiece / C2 supporting / C3 minimize? (Part 9.)
4. **The Firecrawl story** — D1 footnote / D2 open highlight / D3 omit? (Part 7.)
5. **The named user + owner** — Sharon's presence suggests the user = fund-ops/monitoring analysts and the
   accountable owner = an operations lead (like her). Confirm you're happy to frame it that way.
6. **Demo risk** — fully live, live-with-backup, or recorded? (Part 6.)
7. **How far to name Sagard's real teams/platform** — this shows homework but risks presuming inside
   knowledge. How bold do you want to be?

---

## Part 13 — The whole document on one screen (for memory)

| Question | The short answer |
|---|---|
| **Who's in the room?** | **Parinaz** (Head of AI — trust & rigor) + **Sharon** (Head of Operations, ex-compliance — controls & trust). One AI judge, one real customer. |
| **Financial or technical?** | **Business + operations story**, with financial/ops *language* and technical *proof on demand*. Not fund math. |
| **What do they both love?** | Honest measurement, right-sized AI, human-in-control, click-to-source (audit trail), refuse-to-compare (control), value first. |
| **What do they both hate?** | Hype, made-up ROI, a confidently-wrong number in a report, unprovable "it's accurate", a demo with no owner, sending data to an outside AI. |
| **Best outline shapes?** | Safe = A (follow brief). Sharp = B (thesis). Human = E (day-in-life, now strong for Sharon). Most complete = F (hybrid). Boldest = D (cold open). |
| **The demo's job?** | Tell a story with 2 moments: the hidden ARR trend, and the refuse-to-compare (a control). Plus click-to-source (an audit trail). |
| **Why deterministic?** | Cheaper, auditable, reproducible, never invents numbers, data stays local. The Firecrawl limit *proved* it was the right design. |
| **The roadmap's shape?** | A low-risk staged rollout: prototype → run-alongside → pilot → rollout, each with a success gate — and a maintenance owner. |
| **The honesty story?** | 76%→90%, 0 wrong, + a human review queue for the misses. A *strength*. Decide how loud (C1/C2/C3). |
| **The golden Q&A rule?** | "I don't know yet, here's how I'd find out" beats a confident bluff. |

---

## Part 14 — How to build the slides (tools, design, and the demo)

You asked to *investigate* how to make the slides — not build them yet. Here are the options with
trade-offs, in plain words.

### First, a key warning about "offline"
"Offline" means two things: (1) *presenting* with no internet, and (2) *editing* with no internet. Your
live demo needs #1 to be rock-solid. Two traps to know:

- **A *published* Claude Artifact is a web page on claude.ai — it needs internet and a login to open.** So
  do **not** rely on the hosted Artifact as the thing you present. Build a **local HTML file** and present
  *that* (just open it in the browser — no server, no network). Keep the Artifact only as a *shareable copy*
  to send afterward. *(This corrects the earlier "HTML deck as a Claude Artifact" plan — the file is fine,
  but present the local copy, not the hosted link.)*
- Cloud tools (Google Slides, Canva, Gamma) can present offline **only if you set it up in advance**
  (download a copy or turn on offline mode) — easy to forget on a strange network.

> **Golden rule:** whatever you build in, always carry a plain **PDF of the whole deck on your laptop.** It
> opens anywhere, needs nothing, and saves you if everything else fails.

### Tool options (with trade-offs)

| Tool | Present offline? | Polish you can reach | Build effort | "Engineer-credible" look | Live-failure risk |
|---|---|---|---|---|---|
| **Hand-built HTML** (local file) | Yes, by default | Very high | High | Very high | Very low |
| **reveal.js** (HTML slide framework) | Yes | High | Med-high | High | Low |
| **Marp** (Markdown → slides) | Yes, by default | Med-high | Low | High | Very low |
| Google Slides | Only if pre-set | Medium | Low | Medium | Medium |
| **LibreOffice Impress** (native on Ubuntu) | Yes, by default | Medium | Medium | Medium | Very low |
| Gamma / Pitch / Beautiful.ai (AI tools) | Only after export | High but generic | Low | Medium | Medium |
| Canva | Only with offline set up | High but "marketing" | Low | Low-med | Medium |

Plain notes:
- **Hand-built HTML** = same tech family as your cockpit; total control; offline-safe. Best for polish +
  rigor, but you do the design work yourself.
- **reveal.js** = gives you slide navigation + a **speaker view** (your notes + a timer) for free; a little
  more setup.
- **Marp** = fastest way from plain text to clean slides; weaker for hand-designed chart slides.
- **LibreOffice Impress** = the safe offline desktop option that's already on Ubuntu; lower polish; also a
  good backup format.
- **AI generators** = fast first draft, but the look can read "generic / sales-y" (a risk with Parinaz).
  **Tome is shut down (2025) — ignore it.**
- **Canva** = quick and pretty, but a "marketing" vibe and weak custom charts.

### Design rules for a credible, non-cheesy technical deck (simple)
- **One idea per slide.**
- Make the slide **title the takeaway sentence** ("Same label ≠ same metric"), not a topic word ("Metrics").
- **Few words** per slide — you speak the detail.
- **Big type, high contrast** (dark on light, or light on dark).
- **One main color + one accent** that *means something* (e.g., accent = "this number is clickable to its
  source").
- **Same layout on every slide** — consistency reads as competence.
- Run your **one thesis sentence** through the whole deck as a spine.
- **Honest data only** — label what is synthetic and what is measured. One fake number loses Parinaz.
- **Show your limits on purpose** — it builds trust (especially with a former compliance officer).
- **No clip-art, no cartoon robots, no "revolutionary" buzzwords.** Restraint *is* the polish.
- On every key slide, give **Sharon the "so what"** and **Parinaz the "how"** in one line each.
- **Leave whitespace.**

### How to show the live demo safely

| Way | Impressive? | Risk | Use it when |
|---|---|---|---|
| (a) Fully live app | Highest | Highest | Only if rehearsed many times |
| (b) Recorded screen video | Medium | None | For guaranteed smoothness / as a backup |
| (c) Annotated screenshots | Low | None | To slow down and explain one moment |
| **(d) Hybrid: live + recorded backup one keypress away** | Highest + safe | Low | **The professional standard — worth considering** |

Rules:
- Have the deck **and** the cockpit already open and pre-loaded before you start; practice the switch as one
  motion.
- Pre-load the app to the **exact starting screen** (not a login or empty screen).
- **Narrate what you click** out loud, so it still makes sense on video or from stills.
- Turn off notifications and auto-updates.
- If it misbehaves for more than a few seconds, **calmly switch to the recording** — never debug live.

> **The offline safety net (do all of these):** a PDF of the deck on disk + a recorded demo video on disk +
> key screenshots inside the deck + a rehearsed spoken walk-through + **test the whole thing once with Wi-Fi
> turned off** on the real laptop. That last one is the single most valuable rehearsal.

### How to show the numbers honestly (dataviz)
- **The 5-quarter ARR trend:** a simple **line chart**; label the last value; mark the *recovered* quarters
  in your accent color so the chart itself proves what the tool fixed; be honest with the y-axis (don't zoom
  in to exaggerate the growth).
- **The cross-company league (e.g., retention):** a **horizontal bar chart sorted high-to-low** (the sort
  *is* the message), or a clean table if exact numbers matter more; one quiet color, accent only on the
  company you'll discuss.
- **The refuse-to-compare moment:** show the lender's margin and the software margin side by side *as if*
  comparable, then visibly **strike it out / stamp "NOT COMPARABLE"** with the one-line reason. Do **not**
  chart them together as bars — that would imply they *are* comparable, the opposite of your point.
- **The click-to-source (audit trail) on a static slide:** show a **before/after pair** — the number on the
  left, the same number with the source drawer open on the right (file, label, confidence, snippet) — with
  an arrow connecting them. Then do it live once. *Static explains; live convinces.*

> **My lean (ignore if you like):** given your priorities (polish + very low live-failure risk +
> engineer-credible tone on Ubuntu), the two strongest bets are **hand-built local HTML** (max control,
> matches your cockpit) or **reveal.js** (you get speaker notes + navigation for free). Keep a **PDF + a
> recorded demo video** on disk as the safety net no matter what. Your call.

---

### Next step
Read this, then tell me your calls on Part 12 (at minimum: the **outline shape**, the **room**, the
**honesty dial**, and the **Firecrawl story**) — and, when you're ready, a **slide tool** from Part 14.
Once you decide, I'll turn the chosen shape into a slide-by-slide plan and then Document iii (the deck).
