# Document iii-4 — The Practice Script (Outline A)
### Sagard "Concord" — a BUSINESS CASE talk: what to SAY, slide by slide, out loud

> **What this is.** This is the talk written the way you will *speak* it — not the way you read it.
> It follows the built deck (`slides.pdf`), **26 slides, in order**. For every slide you get one
> line you must never forget, the full words to say, a
> bridge into the next slide, and small stage directions in `[brackets]`. Read it out loud in front
> of a mirror. First read it word for word. Then, once it feels natural, keep only the **bold anchor
> line** in your head and say the rest in your own words.
>
> **The room (never forget who is listening):** **Parinaz** — Head of AI. She likes rigor and
> honesty and she dislikes hype. **Sharon** — Head of Operations, used to be Chief Compliance
> Officer. She likes controls, an audit trail, and one source of truth. So: be calm, be honest, and
> say the limit *before* they ask. Honesty is your best card.
>
> **Your one sentence, the whole talk:** *"Same label doesn't mean the same metric — comparability
> is the product, not extraction."* If you land only one idea, land this one.

---

## ⏳ Still to write (PENDING) — do not present without these

Two parts of this talk still need their own spoken script. They are **NOT written yet**:

1. **The live-demo script** — the exact words + clicks for **Slide 15 (the live demo)**, built from
   `case-study/cockpit-frontend-guide.md`. Slide 15 below has only the *beats* (a skeleton); it
   still needs the full word-for-word, click-by-click walk-through.
2. **The "scale it up" script** — the words for the scaling questions, built from
   `case-study/iv-system-design-and-scaling.md`. In a past interview they took a candidate's
   prototype and **added new requirements live**, on the spot. Be ready to answer, out loud, for:
   - more users / more portfolio companies
   - bigger document volumes
   - real-time processing
   - multiple data sources
   - many requests at the same time (concurrency)
   - reliability, security, monitoring, and cost limits

   Slides 22–23 (prototype → production, then harden-before-cloud) *touch* this, but the full spoken
   answer to a live "now make it 100× bigger" curveball is still to write.

---

## How to practice with this script

1. **Read it out loud — not in your head.** Your mouth needs the reps, not your eyes.
2. **Pass 1 — word for word.** Say every sentence as written. Get the shape into your body.
3. **Pass 2 — anchors only.** Cover the full script. Look only at the **"If I blank, say only this"**
   line for each slide, and say the rest in your own words. This is the real skill.
4. **Pass 3 — with the clock.** Use the timing table below. If a section runs long, cut words, keep
   the anchor.
5. **Record yourself once.** Play it back. You will hear the two or three lines that need work.
6. **The demo (Slide 15) needs its own reps.** Practice the clicks with the words until your hands
   and mouth move together. Keep screenshots ready as a backup.

---

## The delivery legend (what the `[brackets]` mean)

| Cue | What you do |
|---|---|
| `[pause]` | Stop for one full second. Silence is confident. |
| `[click]` | Advance the slide, or click in the live app. |
| `[point to X]` | Point at that part of the slide so their eyes follow yours. |
| `[slow down]` | Say the next line slower than feels natural. It is an important line. |
| `[let it land]` | Say the line, then say nothing. Let them absorb it. |
| `[breathe]` | Take one calm breath. Usually after a big idea. |
| `[smile]` | Warm up your face and voice here. |
| `**bold**` | Push a little harder on these one or two words — they carry the meaning. |

**Your voice, the whole way:** slow, calm, warm, honest. You are not selling. You are a builder who
understands their world and is being straight with them. When you say a limit out loud, you are
*winning points*, not losing them.

---

## Timing map (target ~37 minutes, then Q&A)

| Slide | Section | Target | Running total |
|---|---|---|---|
| 1 | Intro — who you are | ~1 min | 1 |
| 2–4 | Here's my map — correct me | ~3.5 min | 4.5 |
| 5 | Two rounds, two tools | ~1.5 min | 6 |
| 6–8 | The quarter-close hurts (the problem) | ~3.5 min | 9.5 |
| 9–12 | Comparability is the product (how we solve it) | ~5 min | 14.5 |
| 13 | AI suggests, humans decide | ~1.5 min | 16 |
| 14 | Caught before the IC beats hours | ~1 min | 17 |
| 15 | **LIVE DEMO** | ~8–10 min | ~26 |
| 16–21 | The path to production trust (roadmap, incl. the one-picture summary) | ~6 min | ~32 |
| 22–24 | Prototype → production + where my time went | ~3 min | ~35 |
| 25 | That's Concord — recap + open the floor | ~1 min | ~36 |
| 26 | Thank-you card + Q&A (your questions to them) | ~1.5 min | ~37.5 |

> If you are running long, the demo and the roadmap (**slides 16–21**) are where you cut. Show fewer
> demo extras; on the roadmap, **keep slide 18 — the one-picture summary — and trim a detail group
> (19, 20, or 21) instead**. Never cut the anchor lines.

---

## If your mind goes blank

Look at the **"If I blank, say only this"** line, say it, then click to the next slide. That one
sentence is always enough to keep moving. Nobody in the room knows what you planned to say — they
only hear what you *do* say. Keep going.

---

## One-page cheat sheet — the 26 anchors

**Open (1)**
1. **Ownership + FDE** — "I solve unclear problems end to end and take ownership — and an FDE starts in your world, not in the code."

**My map (2-4)**
2. **PE scope** — "Concord is scoped to your direct PE portfolio companies — the other three branches are documented, not built."
3. **Hold & monitor** — "Concord lives in the hold-and-monitor stage — it feeds the inputs to the mark, it never makes the mark."
4. **Five readers / our customer** — "Five people read the same pack for opposite jobs — row two, controls and reporting, is our customer."

**Two rounds (5)**
5. **Speed vs precision** — "Same builder, two rounds — speed for the deal partner, precision for Ops."

**The problem (6-8)**
6. **Hand-keying packs** — "Operations hand-keys 20-plus packs into one spreadsheet, every quarter."
7. **Four traps** — "Four traps — same metric different names, same name different meaning, right number wrong basis, and you can't prove any of it."
8. **Easy 10 / hard 90** — "Reading the number is the easy 10%; the expensive 90% is comparability and trust."

**How we solve it (9-12)**
9. **One offline click** — "One click runs the whole flow offline, and a human owns every number that leaves."
10. **Comparability is the product** — "Same label doesn't mean the same metric — comparability is the product."
11. **Deterministic on purpose** — "I used fixed rules on purpose — cheap, honest, offline — but one method isn't production-grade."
12. **Redundant readers** — "In production you don't trust one reader — you run several, and the disagreement is the alarm."

**AI + human (13)**
13. **AI never decides** — "AI suggests, with reasons. The human decides. AI never decides — and the mark is always human."

**The win (14)**
14. **Caught before the IC** — "The real win isn't saved hours — it's a wrong number caught before the IC."

**DEMO (15)**
15. **Live demo** — "Load everything offline, compare only what's safe, and click any number to see its source."

**Roadmap (16-21)**
16. **More agreement** — "The reliable version isn't more AI — it's more agreement, more human judgment, and a record of both."
17. **Independence, not votes** — "Three copies of the same AI share the same blind spots — so we weigh independence, not votes."
18. **The architecture in one picture** — "PDF → three AI readers → the referee → agree = auto-accept / disagree = a person with the real PDF → one trusted number."
19. **AI writes the story** — "The AI writes the interpretation, never the number — and a human can always refute it."
20. **Flag, never convert** — "Concord flags a different currency and refuses to mix it — it never converts."
21. **Controls & audit trail** — "No silent overwrites, maker-checker on every fix, an audit trail that survives an LP challenge."

**Scale + time (22-24)**
22. **Prototype, not production** — "Concord today is an honest prototype — the engine is real, the rest is roadmap."
23. **Harden, then cloud** — "Harden in place first; the cloud is the destination, only when it's justified."
24. **Time = understanding** — "Most of my time went into understanding your world, not writing code."

**Close + Q&A (25-26)**
25. **Comparability + open the floor** — "That's Concord — comparability, provenance, a path forward — and I have three questions for you: the customer, the culture, the scorecard."
26. **Thank-you + five threads** — "Concord — built with AI, decided by humans. Pick any of five threads and lead."

## The 60-second version

I'm a software engineer who likes to own a product end to end and solve the real problem, not the
easy one. An FDE starts in your world, so most of my time went into understanding Sagard, not
coding. Concord is scoped to your direct PE portfolio companies, and it lives in the quarter-by-
quarter hold-and-monitor stage — it feeds the inputs to the mark, it never makes the mark. Today
Operations hand-keys 20-plus packs — 10 companies across 24 synthetic test PDFs I made — into one
spreadsheet every quarter, and the real pain isn't reading the number, it's comparability and trust.
Concord runs offline in one click: it loads the packs, sorts equity from credit, lines the numbers
up on one shared vocabulary, and refuses any compare that isn't like-for-like — for example, it
flags a lender's interest margin and won't rank it against a SaaS margin, and it flags a pounds
figure and never converts it. Every number is one click from its source — file-level today: the
source file, the original label, the confidence, and the exact quoted line, not a page number yet.
Under the hood it's deterministic — fixed rules that always give the same answer — which I chose on
purpose, partly because time was short; one method is not production-grade, and I'm honest about
that. On those 24 synthetic test PDFs, recall went from 76% to 90%, with 0 wrong values. The
production version — several independent readers, an orchestrator, and a human review queue — is
designed, not built, and agreement is strong evidence, not proof. The win isn't saved hours, which
stay qualitative — it's a wrong number caught before it reaches the committee, with AI suggesting
and a human deciding every call.

---

# The full script — read it aloud, slide by slide

---

## Open — slide 1

### Slide 1 — A business case for Concord: I'm Xavier, and I start in your world  ·  ~60s
**If I blank, say only this:** "I'm a software engineer who likes solving hard problems and owning them end to end — and an FDE starts in your world, not in the code."
**Say it:**
[breathe, smile] Hi, I'm Xavier. I'm a software engineer. For four-plus years I've shipped AI-powered, production systems, end to end. [pause] Today at ProsperaLabs I automate real customer work — voice, chat, and email — for ecommerce, real-estate, legal, and customer-service teams. Real value, real users. [pause] Here is what I care about most: I like **solving hard problems and owning them end to end**. [point to the five boxes] Take an unclear problem. Make reasonable assumptions. Ship a useful first version, built to scale. Make it reliable enough to trust. Then improve it from real feedback. [slow down] That's the builder in me — I own the whole loop, not just the easy part. [pause] And a Forward Deployed Engineer starts somewhere before the code. In **your** world. So most of my time here went into learning it — how Sagard makes money, who does what, where a tool solves a real problem. [slow down] This is a business case. So here's my **map** — and please, correct me.
**Then move on:** "Let me start with the four strategies — and the one I focused on."

---

## Here's my map, correct me — slides 2-4

### Slide 2 — Four strategies, one focus — Concord starts with your direct PE portfolio companies  ·  ~75s
**If I blank, say only this:** "Concord is scoped to your direct PE portfolio companies — the other three branches are documented, not built."
**Say it:**
[breathe] Here is my mental model of your world. [slow down] You live this every day. So please stop me and correct me.
[click — Sagard logo on screen; these strategies are Sagard's core business] Sagard invests through several branches. Venture. Private equity. Private credit. Real estate. Plus a big solutions arm. [pause] That's the line-up **roughly** — I'll re-check it on your site.
Concord is scoped to one branch. [point to PRIVATE EQUITY tile] The direct PE portfolio companies. Those are the packs in my demo.
And the packs are made-up test files. Not your real ones.
The other three branches are **documented** next steps. Not version one. [let it land]
**Then move on:** "So where does Concord sit in the life of a fund?"

### Slide 3 — Raise → invest → hold → exit: Concord lives in the quarter-by-quarter middle  ·  ~60s
**If I blank, say only this:** "Concord lives in the hold-and-monitor stage — it feeds the inputs to the mark, it never makes the mark."
**Say it:**
A fund lives about ten years. It moves through four stages. [click] Raise the money. Buy the companies. Hold and watch them. Then sell.
Concord lives in stage **three** — hold and monitor. That's the quarter-by-quarter job. Watch every company. Check its numbers. [pause] "Reconcile" means one thing: check that the same number from two places agrees.
[slow down] One honest line. Between buying and selling, there is no market price. So each quarter the firm **estimates** each company's worth. They call it "the mark." That is a human judgment, and it gets audited. [slow down] Concord feeds the inputs to the mark. It never makes the mark. [let it land]
**Then move on:** "Now — who actually opens these packs, and why?"

### Slide 4 — Five people read the same pack — for opposite jobs (row two is our customer)  ·  ~75s
**If I blank, say only this:** "Five people read the same pack for opposite jobs — and row two, controls and reporting, is our customer."
**Say it:**
[click] Five people read the **same** pack. For opposite jobs. These are my assumed roles — so please correct me.
[point to row 1] The deal partner wants a fast read. Is this company on track? Speed over precision.
[point to row 2] Reporting operations and controls. They own the reconciliation and reporting grind. They need comparability and a clear audit trail. [slow down] That's **our customer**. [pause] And to be clear — this is **not** the "Value Creation" job, the team that grows revenue and cuts cost. Saying that would get your role wrong to your face. Our customer reconciles, traces, and signs off.
[point to row 3] The valuation analyst sets each mark. That rolls up to the fund's NAV — its total estimated worth. Precision above all.
[point to row 4] Investor reporting sends numbers outward. Precision again.
[point to row 5] Risk and credit. They check that borrowers keep their covenants — the promises in a loan. Exact definitions matter.
[breathe] Same pack. Five very different jobs. And one honest question for you: does one person own row two, or a team, or a vendor?
**Then move on:** "That split — fast for one, precise for another — is exactly why I built two tools."

---

## Two rounds, two tools — slide 5

### Slide 5 — Same builder, opposite tools — speed for the deal partner, precision for Ops  ·  ~90s
**If I blank, say only this:** "Same builder, two rounds — speed for the deal partner, precision for Ops."
**Say it:**
[click] Two rounds. Two very different tools. And here's the tension that connects them: the same messy PDF has to serve **opposite** needs. [pause]
[point to LEFT card — ROUND 1: LLM, SPEED] Round one was for the **deal partner**. My first take-home built them an "AI Scout." You give it a company web address. It reads the company and its news. It finds the founders. It writes a short summary. Then it posts one question in Slack — "should we move forward?" [pause] For that I used an **LLM** — a large language model, an AI that writes in plain words. Why? Because the deal partner needs **speed** more than precision. A fast, rough read keeps the deal moving. [let it land]
[point to RIGHT card — ROUND 2: DETERMINISTIC, PRECISION] This round, Operations needs the opposite. **Precision first.** A number you can trust. Traceable back to its source file. A wrong answer is refused, not guessed. [pause] So this tool uses **fixed rules** — the same input always gives the same answer. We call that deterministic. I chose it on purpose. Time was short too. And one method like this is not yet production-grade — I'm honest about that.
[breathe] Same builder. Two rounds. Two opposite kinds of **trust**. [let it land]
**Then move on:** "So let me show you Operations' real problem — the numbers get typed in by hand, pack after pack."

---

## The quarter-close hurts — slides 6-8

### Slide 6 — Monitoring the portfolio means hand-keying 20+ packs — every quarter  ·  ~70s
**If I blank, say only this:** "Operations monitors the portfolio by hand-keying 20-plus packs into one spreadsheet, every quarter."
**Say it:**
[click] Remember stage three — hold and monitor. How does Operations actually monitor? They read every company's report **by hand**. [pause] Picture it. It is the second week after quarter-close. Twenty-plus PDF packs arrive. A software firm, a lender, a payments firm, a freight marketplace. [slow down] An analyst opens each one. Finds the numbers. Then hand-keys them — types them in by hand — into one big spreadsheet. [let it land] That spreadsheet review **is the monitoring**. [pause] One honest note. These are **synthetic** test packs. Ten companies across twenty-four PDFs. So it's twenty-plus packs, not twenty-plus companies. And "SaaS" just means subscription software.
**Then move on:** "So what makes this hand-keying so risky? Four traps."

### Slide 7 — Four traps in the manual close — each one provable in the packs  ·  ~80s
**If I blank, say only this:** "Four traps — same metric different names, same name different meaning, right number wrong basis, and you can't prove any of it."
**Say it:**
[click] Four things make this hard. Each one is real in the packs. [pause] First, one word. "ARR" means annual recurring revenue — the yearly subscription income. [pause] Trap one: the same number wears different names. NovaCloud's ARR shows up as "End-of-Period ARR" and as "ARR, End of Period." Miss the relabel, and the trend **silently splits**. [pause] Trap two: the same word means different things. A software delivery-margin is not a lender's interest-margin. Put them in one column, and you are **quietly wrong**. [pause] Trap three: right number, wrong basis. ClearPay's cash reads thirty-eight point four million. But six point two million is client money — it legally can't spend it. True spendable cash is thirty-two point two million. [pause] One more, not on the slide. ConstructIQ reports cash-burn per quarter. Everyone else reports per month. [pause] Trap four: you **can't prove it**. No number links back to its source. A partner asks, "where did this seventy-eight percent come from?" and the honest answer is — "let me re-open the PDF." [let it land]
**Then move on:** "Step back, and all four traps point to one thing."

### Slide 8 — Reading the PDF is the easy 10%. The expensive 90% is comparability + trust  ·  ~45s
**If I blank, say only this:** "Reading the number is the easy 10%; the expensive 90% is comparability and trust."
**Say it:**
[click] So here is the real shape of the pain. [pause] It is not reading PDFs. [slow down] Reading the number is the **easy ten percent**. [pause] The expensive ninety percent is **comparability and trust** — knowing which numbers are safe to compare, and being able to prove each one. [pause] So the pain is not extraction. It is reconciliation, comparability, trust, and time. [let it land] And it comes back **every quarter, forever**.
**Then move on:** "So how do we fix it? One offline click runs the whole flow."

---

## Comparability is the product — slides 9-12

### Slide 9 — One offline click runs the flow — a human owns every number that leaves  ·  ~55s
**If I blank, say only this:** "One offline click runs the whole flow, and a human owns every number that leaves."
**Say it:**
[click] One click starts everything. And it runs **offline** — on my laptop, no data leaves the machine. [pause] First, it loads all the packs. Then it sorts each company — equity, or credit? Next, it lines the numbers up on one shared vocabulary. That's what "normalize" means: different names, one shared name. [pause] Then it checks each number against the company's own report. Then it refuses any compare that isn't truly like-for-like. And last, you can click any number to see its **source file**. [point to banner] A **human** owns every number that leaves the building.
**Then move on:** "So here's the one core idea this whole tool is built on."

### Slide 10 — Same label != same metric — comparability is the product, not extraction  ·  ~80s
**If I blank, say only this:** "Same label doesn't mean the same metric — comparability is the product."
**Say it:**
[slow down] This is the whole idea in one picture. [pause] Two companies both print "60% gross margin." [point] These two numbers are just examples. But a software company's margin and a lender's margin are **different machines**. [pause] A software margin is a delivery margin. A lender's margin is an interest margin. [pause] A naive tool drops them in one column — and misleads you. [pause] Concord splits them into two lanes, and refuses to rank one against the other. [click] On screen, this fires for real on LendBridge. Its labelled "gross margin," 58 to 62%, is really an interest margin. We show it in full. We never rank it against a software margin. [pause] And the reverse is also true — one number can hide under many names. We stitch those into one clean line. [let it land] Same label, different metric. **Comparability is the product.**
**Then move on:** "Now, how does it actually read the numbers? Let me be honest about that."

### Slide 11 — Rules never invent a number — deterministic on purpose, not production-grade yet  ·  ~70s
**If I blank, say only this:** "I used fixed rules on purpose — cheap, honest, offline — but one method isn't production-grade."
**Say it:**
For this demo I used one set of **fixed rules**, on purpose. [pause] Fixed rules means: same input, same answer, every time. [pause] Rules are cheap, fast, testable, and offline. And they never invent a number — a flagged blank beats a confident guess. [pause] But let me be clear. [slow down] One method is **not** production-grade. A single reader, however good, can be wrong — and you'd never know. [pause] Here's the honest Firecrawl story. My first build used Firecrawl, a paid extraction service. I hit errors, and I ran out of credit mid-build. So I switched to fixed rules. [smile] And honestly, that was the right move for a trust tool — it stays offline, and it proved the business case.
**Then move on:** "So what would I build for real, in production? Here it is."

### Slide 12 — What I'd build for real: redundant readers — the disagreement is the alarm  ·  ~80s
**If I blank, say only this:** "In production you don't trust one reader — you run several, and the disagreement is the alarm."
**Say it:**
Here's what I'd build for real. [pause] In production, you don't trust just one reader. You run **two to four** readers that fail in different ways. [point to boxes] Firecrawl, an AI parser. A vision model that reads meaning. A document-AI that reads letters. [pause] A small **orchestrator** — just a coordinator — collects their answers. The more they agree, the higher the confidence. Any disagreement flags that number and sends it to a human — with every reader's answer side by side, and a **screenshot of the real PDF**. [let it land] The **disagreement is the alarm**. [pause] Now the honest caveat. This is designed, not built. Today's demo runs the single method. And "independent" is never total — all three are AI, so agreement is strong evidence, not proof. That's exactly why a **human** decides every disagreement. [pause] Why does it land for both of you? For Parinaz, it's rigorous — real different methods, not three copies of one AI voting. For Sharon, it's an automatic four-eyes check, with a full audit trail. [breathe] The thing that makes the numbers more correct is the same thing that gives you the control.
**Then move on:** "And that — powerful AI, but a human makes the call — is exactly where I want to go next."

---

## AI suggests, humans decide + the win — slides 13-14

### Slide 13 — Be AI-first, but human-decision-driven — AI never decides, and the mark is human  ·  ~80s
**If I blank, say only this:** "AI suggests, with reasons. The human decides. AI never decides — and the mark is always human."
**Say it:**
[slow down] This is the core idea of my whole talk. My rule is simple. Be AI-first. But **human-decision-driven**. [pause] AI is probabilistic — it gives a likely answer, not a sure one. So we never let it decide. [point to left] The machine does the heavy, repeated work. It reads the packs. It pulls the numbers. It flags where they disagree. And it suggests — always with reasons. [point to right] But the human sits at the center of every decision that reaches a report. [pause] Two calls are **human only**. One — is this number right enough for a report? Two — the valuation mark, the LP figure, the IC call. "IC" is the investment committee, the group that makes the big calls. A model cannot decide those. [pause] And one honest detail. The tool lines up units and scale — millions versus thousands, it just makes them match. But a different **currency** — pounds versus dollars? It **flags** it, or refuses. It never converts. [slow down] A flagged blank beats a wrong mix. And the mark is always the value a human signs off on — never the machine. [let it land] AI suggests. Humans decide.
**Then move on:** "So what's the real win here?"

### Slide 14 — The win isn't the hours — it's a wrong number caught before the IC  ·  ~55s
**If I blank, say only this:** "The real win isn't saved hours — it's a wrong number caught before the IC."
**Say it:**
[point to left] Today, the quarter-close takes hours to days. Someone re-types 20-plus packs by hand — and that's before anyone can even see the portfolio. [point to right] With Concord, it's one click. You get a comparable, source-traced view. So the team spends its time on **judgment**, not typing. [pause] But hear me. The bigger win is not the hours. [slow down] The real win is a comparison you can **trust**. Every number is one click from its source. A wrong number **caught** before it reaches the committee — that is worth far more than any typing saved. [pause] And if you ask me for a number, I'll ask you first: how many hours does your team really spend on this today?
**Then move on:** "Enough talking about it — let me show you Concord, live."

---

## THE LIVE DEMO — slide 15

> ⏳ **This section is a skeleton (beats only).** The full word-for-word demo script is still to
> write, from `case-study/cockpit-frontend-guide.md`. See the PENDING block at the top.

### Slide 15 — LIVE DEMO (Concord, run live and offline)  ·  ~8-10 min

**If I blank, say only this:** "Load everything offline, compare only what's safe, and click any number to see its source."

**Before you click (say this):** "Everything you're about to see runs on my laptop, **offline**. No data leaves the machine. [pause] And these are **synthetic** test packs I made — not your real filings. One more word: 'deterministic' just means fixed rules — the same answer every time." [smile]

Then, the beats:

1. **Beat 1 — The pain, on screen**  `[click "Load reports" — a line appears: "24 / 24 parsed in ~1 s"]`
   - Say: "One click. [pause] It just read **24 PDF packs** in about a second. All offline. Nothing left the machine."
   - Honest aside: "That time comes from the live run. It's not a label on the screen."

2. **Beat 2 — The scorecard**  `[point to the grid — companies are rows, metrics are columns]`
   - Say: "The whole portfolio on one page. **Ten companies**, one view. Green is best in its peer group, red is worst. [slow down] But only against companies in the **same sector**. We never colour a software number against a lender number."

3. **Beat 3 — Proof one, the hidden trend**  `[go to Trend → NovaCloud → ARR — one clean 5-quarter line]`
   - Say: "This company renamed this line across quarters. A naive tool shows one lonely dot. Concord stitched the names into **one line**. [let it land] One dot became five. About 24 million up to 34. Plus 42 percent."
   - Honest aside: "Switch to Revenue and you'll see four points, not five. We don't merge 'Total Billings' onto revenue without a stated match. A **flagged blank** beats a wrong number."

4. **Beat 4 — Proof two, the refusal (the moat)**  `[point to LendBridge's gross-margin cell "· not ranked", then the Refused panel]`
   - Say: "LendBridge is a lender. Its 'gross margin' is really an interest margin — a different machine. So the tool **refuses** to rank it against software margins. And it says why. [pause] Refusing is the feature."
   - Honest aside: "This lender-versus-software refusal is **built** — it runs live, right here. Flagging that two *software* companies define margin differently is the next step. Not built yet."

5. **Beat 5 — The trust spine, provenance**  `[click any number → the drawer opens]`
   - Say: "Click any number. [click] You see where it came from. The **source file**. Its original label. The confidence. And the exact line of text. Every number on screen is one click from **its source**."
   - Honest aside: "This is file-level today — source file and exact line, not a page number. Page and sentence tracing is roadmap, so the drawer hides the page on purpose. [only if you mention it] Confidence here runs 90.4 to 99.5 percent."

6. **Beat 6 — Extra if time, ClearPay cash**  `[click ClearPay's cash cell → drawer shows $32.2M under the $38.4M headline]`
   - Say: "The pack says **38.4 million** in cash. But 6.2 million is client money it legally can't spend. The tool already shows the real spendable number — **32.2 million**. The drawer explains the gap."

7. **Beat 7 — Extra if time, the four trust panels**  `[scroll to the panels]`
   - Say: "Four panels. Refused: five. Exceptions: ten real gaps to chase. Source labels unified: 29 names, one meaning. Cross-source check: 22 checked, **22 agree**."
   - Honest aside: "22 agree is a **second witness** — it confirms, it doesn't prove on its own. The real work is here: **7 conflicts inside single documents**, resolved automatically."

8. **Beat 8 — Only if it comes up, PeopleFlow currency**  `[point to PeopleFlow's money cell "· not comparable (GBP)"]`
   - Say: "PeopleFlow reports in **pounds**. So we **flag** it 'not comparable.' We never fake a conversion. [pause] Honest detail: that flag comes from a human-owned rule. Today's parser doesn't capture the pound sign yet — it reads the currency as empty."

**If the app breaks:** "If the live app has a hiccup, I have screenshots — the story is the same. Load, compare only what's safe, and click any number to its source." [stay calm]

**Then move on:** "So that's what's built — and where it's honest about its limits. [breathe] Next: how we turn this into production trust. Not more AI — more agreement, more human judgment, and a record of both."

---

## The path to production trust — slides 16-21

### Slide 16 — Reliability isn't more AI — it's more agreement, more human judgment, and a record of both  ·  ~40s
**If I blank, say only this:** "The reliable version of Concord isn't more AI — it's more agreement, more human judgment, and a record of both."
**Say it:**
The reliable version of Concord isn't "more AI." [pause] It's three things. More **agreement** between independent readers. More **human judgment** on the hard calls. And a full record of both. [breathe] The machine raises a warning. A person decides. Every decision stays traceable. [slow down] One honest note before I start: everything in this section is **designed, not built**. It's the roadmap. [let it land]
**Then move on:** "Let me start with agreement."

### Slide 17 — Correlated readers can outvote the one that's right — so independence, not count, decides  ·  ~80s
**If I blank, say only this:** "Three copies of the same AI share the same blind spots — so we use different readers and weigh independence, not votes."
**Say it:**
This is the key point for Parinaz. [pause] Imagine you run the same AI three times. They agree. Sounds safe, right? [pause] But three copies share the same blind spots. So they can be **wrong** the same way, with full confidence — and then their agreement means nothing. We call that "correlated failure." [breathe] So instead, you use different kinds of readers. Firecrawl, an AI parser. A document-AI that reads letters. A vision model that reads meaning. [click] "OCR" just means software that reads text off an image. [pause] Now the orchestrator — the part that compares them — doesn't just count votes. It weighs **independence**. Two readers that copy each other don't get two votes. [slow down] If they all agree, we auto-trust. If they really disagree, it goes to a human queue. [pause] Honest: this is designed, not built. And "independent" is never total — all three are AI. Strong agreement is good evidence, not proof. I can't quote a real accept rate until it runs on real packs. And any vendor's 99% is that vendor's own claim, not a number I measured.
**Then move on:** "Let me put that whole future on one picture."

### Slide 18 — The architecture in one picture (the whole future flow)  ·  ~75s
**If I blank, say only this:** "PDF in, three AI readers, a referee, then agree goes straight through and disagree goes to a person — one trusted number out."
**Say it:**
[click] This one slide is the whole future design on one screen. Let me walk it top to bottom. [pause] At the top, one quarterly PDF pack comes in — say ClearPay, Q2 2025. [point down] Three AI readers read it at the same time — Firecrawl the parser, a vision model that reads meaning, and OCR that reads the letters. Three different engines, so they make **different** mistakes. [pause] They hand three answers for the same number to the **orchestrator** — the referee. [point to the middle box] It does two things. First, it lines up the **same fact** — same company, metric, period, unit, and basis. Then it asks one question: are the numbers **close enough**? Rounding is fine. A ten-times gap, never. [pause] Then the path splits. [point to the left box] They agree — the number is auto-accepted, highest trust. [point to the right box] They disagree — and a **person** decides. That person sees every reader's answer side by side, plus a **screenshot of the real PDF**, and validates or corrects it. A different person approves — four-eyes — and the whole thing is logged. [pause] Either way, [point to the bottom box] one trusted number flows to the cockpit, still traceable to its source. [slow down] And the honest line is right there on the slide: all three readers are AI, so their agreement is **strong evidence, not proof** — that is exactly why the disagree path ends at a person. Every fix is also saved, and it teaches the readers. [let it land] Designed, not built — but this is the shape.
**Then move on:** "That handles the numbers. Next — the story around them."

### Slide 19 — AI writes the interpretation, never the number — and a human can always refute it  ·  ~60s
**If I blank, say only this:** "The AI writes the interpretation, never the number — and a human can always refute it."
**Say it:**
Once the numbers are clean, an AI could write a short note — a "here's the story" note. [pause] But only as a **suggestion**. Here's why that's safe. It reads only over clean, source-tagged numbers, so it can't inject a wrong number. It can only get the story wrong — and the human refutes it right there. [click] Look at the example. "NovaCloud: growth compounding, but cash is falling — confirm the funding plan." That's a prompt for a person. It is not a fact. [breathe] The human accepts, corrects, or comments. Next quarter, the AI reads last quarter's comments first — so it learns the house view. [slow down] It's labelled "AI suggestion — review." It cites every number. And it makes **no dollar claims**. [let it land]
**Then move on:** "Now a rule that already runs today — taken further."

### Slide 20 — Concord refuses to mix pounds and dollars — it flags, it never converts  ·  ~60s
**If I blank, say only this:** "Concord flags a different currency and refuses to mix it — it never converts."
**Say it:**
Concord refuses to mix pounds and dollars. [pause] It flags. It never **converts**. Let me be honest about today. You saw PeopleFlow marked "not comparable, pounds." [pause] That flag is a human-owned rule in the front end. The parser doesn't see the pound symbol yet — it reads the currency as empty. So a person wrote the rule that catches it. [breathe] Now the roadmap. A reader that actually captures the currency. Then we convert **levels** only — like revenue — with a dated, auditable rate. [slow down] But never a percentage. Converting a ratio makes no sense — a pounds percentage stays a percentage. And where the rate or the basis is unknown, we **flag** rather than guess. [let it land]
**Then move on:** "Last piece — and this one is for Sharon: controls."

### Slide 21 — No silent overwrites, maker-checker on every fix, an audit trail that stands up to an LP challenge  ·  ~70s
**If I blank, say only this:** "No silent overwrites, maker-checker on every fix, and an audit trail that survives an LP challenge."
**Say it:**
This one is for Sharon's world. [pause] Controls. Four rules. [click] One: never overwrite silently. The original stays. Every human action stays too. [breathe] Two: **maker-checker**. Whoever suggests a change is not whoever approves it — the classic "four-eyes" check. Three: least privilege. You see only the companies you're assigned. Four: an append-only log — it can be added to, never edited. Who changed what. Old value to new. When. And why. [point to ledger] Here — 38.4 million became 32.2 million, because someone stripped a restricted client float. You can export that. It survives an auditor. Or an **LP challenge**. [slow down] "LP" means the outside investors the fund reports to. [pause] Honest: none of this exists yet. It's the next layer on two controls that **do** exist today — source-tracing, and refuse-to-compare. [let it land]
**Then move on:** "So that's the roadmap for trust — now let me be just as clear about what Concord is today: a prototype, not production."

---

## Prototype to production + where my time went — slides 22-24

### Slide 22 — Concord today is a prototype, not a production system  ·  ~60s
**If I blank, say only this:** "Concord today is an honest prototype — the engine is real, the rest is roadmap."
**Say it:**
Let me be plain and honest. [pause] Concord today is a **prototype**. Not a production system. It runs offline, in memory, in one fixed pass. Deterministic means the same input always gives the same answer. No database. No login. [pause] Here is what is real. The engine works. Recall went from **76% to 90%**, with **0 wrong values** — measured on 24 synthetic test PDFs I made, not real Sagard filings. Refuse-to-compare is live, and it runs on LendBridge. File-level source-tracing is live too — source file, original label, confidence, and the exact quoted text. It doesn't show a page or a sentence yet. [pause] Here is what is **not** built yet. A durable store. A job queue with retries. The redundant readers. And a multi-tenant cloud. [let it land]
[if Parinaz asks how recall was measured] Recall means one thing: of all the numbers on the page, how many did we catch. We take the numbers we got right, and divide by the 128 numbers printed across those 24 PDFs. The jump came from a backend parser fix — the test set didn't change. And I pair recall with 0 wrong values on purpose: a confidently wrong number is worse than a flagged-missing one.
**Then move on:** "So how would I get from prototype to production? Two honest paths."

### Slide 23 — Harden in place first — the cloud is the destination, when it's justified  ·  ~60s
**If I blank, say only this:** "Harden in place first; the cloud is the destination, only when it's justified."
**Say it:**
Two honest paths forward. [pause] Option one — harden in place. Keep the working engine. Add a durable store. Add a job queue with retries. Add the redundant readers. Stay offline, on your own machines. [pause] The risk is low — every change is additive and reversible. The deterministic core stays a canary. And the redundant readers are the **biggest single lever** for reliability. But to be clear: that design is designed, not built yet. Today the demo runs one deterministic method, and one method is not production-grade. [pause] Option two — move to the cloud. Highest ceiling. It auto-scales for quarter-end bursts, when everyone reports at once. But data leaves the building — a real **data-residency** question, meaning where your data is allowed to live. [pause] My advice: do option one first. Treat the cloud as the destination — go there only when volume and demand justify it, and only after data-residency is answered. [breathe] The deep design lives in a separate system-design doc. I can open it if you want.
**Then move on:** "That's the roadmap. Now let me be honest about where my time actually went."

### Slide 24 — Most of my time wasn't coding — it was understanding your world  ·  ~60s
**If I blank, say only this:** "Most of my time went into understanding your world, not writing code."
**Say it:**
Let me be honest about where my time went. [pause] Most of it was **not** coding. Most of it went into understanding your world. What Sagard is, and how it makes money. The difference between venture, private equity, and private credit. Who the people in this room are. How the operations team works — and how they watch performance through the quarterly reports. [pause] Only after all that did I scope the problem. Then I planned, weighed trade-offs, and built. The slides came last. [pause] These percentages are my own rough guess — not measured. [slow down] And this shape is on purpose. Because that is the Forward Deployed Engineer job. Take something unclear. Understand it. Get feedback. Then solve it with software and AI. [pause] The hardest part wasn't the code. It was learning enough of your world to point the code at the **right** problem. [let it land]
**Then move on:** "And that brings me to what Concord really is — comparability, provenance, and a path forward."

---

## That's Concord + open the floor — slides 25-26

### Slide 25 — Comparability, provenance, a path forward — now, your questions  ·  ~70s
**If I blank, say only this:** "That's Concord — comparability, provenance, a path forward — and I have three questions for you: the customer, the culture, the scorecard."
**Say it:**
[click] Let me bring it home in three lines. First — **comparability** is the product, not extraction. The tool knows when **not** to put two numbers in one column. Second — every number is **one click** from its source; today that source is file-level. Third — there's a clear **path** to a more reliable, redundant version — designed, not built yet. [pause] [smile] That's Concord. [pause] And I have three questions for **you** — I'd love to ask them all the way through, not just at the end. [slow down] One, the **customer**: who owns the quarterly hand-keying today — one person, a team, offshore, a vendor? Two, the **culture**: is it AI-first but humans decide everywhere, or does the AI group own AI and the business teams just consume it? Three, the **scorecard**: six months in, what did a great FDE actually do? [pause] These matter to me — I care about your world, not just my demo.
**Then move on:** "So let me leave you with one card."

### Slide 26 — Thank-you card (the close, then Q&A)  ·  ~60s
**If I blank, say only this:** "Concord — built with AI, decided by humans. Here are five threads — pick any one and lead."
**Say it:**
[pause] [click — the thank-you card] [slow down] Concord. One comparable, source-traced view of every portfolio company. [breathe] Built with AI. Decided by humans. Made with love, with AI — but **human-first** on every decision. [let it land — do NOT talk over the card] Thanks. [Hold the card on screen.] [pause] [smile] And to open our talk, here's a simple menu — five threads I'm most curious about. Pick any one and lead. One — check my map; correct my finance and my PE scope. Two — the real customer; who owns it, and what breaks trust first? Three — is this a real problem, worth solving, or already handled? Four — your AI culture; excited, cautious, or burned before? Five — the role itself; what does a great **FDE** do here? [pause] **Pick any one** you like. I'm all ears. [If they ask where a number comes from: today it's file-level — the source file, its own label, its confidence, and the exact quoted line. Page or sentence is roadmap; never point to a page number.]
