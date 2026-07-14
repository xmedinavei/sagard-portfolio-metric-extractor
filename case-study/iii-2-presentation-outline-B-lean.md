# Document iii-2 — Presentation Outline **B: LEAN** (~35-minute running order)
### Sagard "Concord" — the tight version

> **What this is.** The same story as Version A, **trimmed to land in ~35 minutes + Q&A.** The moves that
> make it lean: the **assumptions are compressed** into one section, the **live demo is a single title slide
> run live** (the beats and caveats are spoken, not printed), and the **product improvements are curated to
> 2–3 for the talk**. The *full* detail of every section lives in the sibling file
> `iii-1-presentation-outline-A-thorough.md` (referenced below as **Thorough §X**). Read this to *run* the
> talk; read Thorough to *prepare* and to *answer deep questions.* The slide-by-slide build sheet for this
> lean cut is **Part 2 (Outline B)** of `iii-3-slide-index-A-and-B.md` — this prose and those slides are the
> same talk.
>
> **Same room, same rules:** **Parinaz** (Head of AI — rigor, right-sized AI, punishes hype / the "prototype
> trap") + **Sharon** (Head of Operations, ex-Chief Compliance Officer — controls, audit trail,
> source-of-truth, data residency). Business-first, technical-on-demand. **Not** finance-math judges. No
> invented numbers. Tool = **Concord**. Thesis: *"Same label ≠ same metric — comparability is the product,
> not extraction."*

---

## The running order (Version B — Lean)

| # | Section | ~Time | Why it's here |
|---|---|---|---|
| 1 | Intro + hook | 1.5 min | Builder first, then one question that makes both minds lean in |
| 2 | Your world — "correct me" (compressed) | 4 min | Show homework, invite correction — but quick |
| 3 | The problem, made felt | 3 min | The Ops team's manual quarter-close monitoring |
| 4 | Comparability is the product (+ why deterministic) | 4 min | The thesis, then the honest "why one method" |
| 5 | AI-first, but human-decision-driven | 1.5 min | AI suggests, the human decides — always |
| 6 | **LIVE DEMO** | 9–10 min | The proof, run live from the app |
| 7 | The path to production trust (product only) | 4 min | The redundant source-of-truth headline + a few more |
| 8 | Prototype, not production (scale) | 1.5 min | Honest: not production-ready, here's the path |
| 9 | Where my time went | 1 min | The time bar — understanding dominates (the FDE job) |
| 10 | Days → one click + the punch | 1 min | Land the win, then the closing card |
| 11 | Q&A + my questions | rest | Validate the map; read the culture |

**Total ≈ 30–34 min of talking + Q&A.** If the slot is ≤30 min, cut §7 to just the **headline** (the
redundant readers) to protect 10+ min of Q&A, where much of the grading happens.
*(Note: this lean cut follows the same order as Thorough, compressed — the demo lands **after** the "how it
works" so the room understands what it's looking at. An alternate "demo-early" cut is possible if you want
energy/proof first — say the word.)*

---

## 1. Intro + hook — 1.5 min

Lead with the bio **confidently** (it earns your later honesty), then your FDE motivation, then the humility
pivot — then **one** question. (Full bio + all 6 hook options → Thorough §0–§1.)

> *"I'm Xavier — a **software engineer**. For 4+ years I've **built AI-powered, production-grade systems, end
> to end.** Today at ProsperaLabs I automate real customer workflows across **voice, chat, and email** — for
> ecommerce, real-estate, legal, and customer-service teams. The way I work: take an **unclear problem**, make
> **reasonable assumptions**, ship a **first useful version** that can scale, make it **reliable enough to
> trust**, and improve it from **real user feedback.**"*
>
> *"That's the builder in me — but I'll be honest: **most of my time on this case study wasn't coding.** It
> went into learning **your** world. So here's my one question to start:"*
>
> **"When your deal partner and your valuations analyst open the same quarterly pack, they need opposite
> things from it — what if one clean, traceable data layer could serve both?"**

*(Lean pick: **hook #6** — it stages the whole talk in one breath: two personas, opposite needs, one shared
data layer. Ask it and **stop** — don't stack the alternates. The five backup hooks live in Thorough §1. The
"same 60% gross margin" line is **not** the hook anymore — that thesis picture lands in §4.)*

---

## 2. Your world — "correct me" (compressed) — 4 min

**Say the framing:** *"Here's my mental model of your world — you live it, so stop me where I'm wrong."*
Lead with **two pictures**; keep the money mechanics to one breath. (Full branches, lifecycle, and all 5
personas → Thorough §2.)

**Picture 1 — where Concord sits (branches, then the fund cycle):**
> *"Sagard invests through several branches — **venture, private equity, private credit, and real estate**
> (plus a big 'solutions' / fund-of-funds arm). I scoped Concord to just one: the **direct PE portfolio
> companies** — the packs in my demo. And a fund lives about **10 years**: **raise → invest → hold and monitor
> → exit.** Concord lives in **stage 3, hold and monitor** — the quarter-by-quarter job of watching every
> company and reconciling its numbers."*

**The money, in one breath (don't dwell):**
> *"**LP → GP (Sagard) → portfolio company → exit → money back to LP.** You earn two ways — a **~2% management
> fee** and **~20% carried interest** (the real upside, only after LPs are repaid plus a preferred return).
> Between buying and selling there's no market price, so each quarter you **estimate** each company's value —
> 'the mark,' which rolls up into NAV. **The mark is a human judgment, and it's audited. My tool feeds the
> inputs; it never makes the mark.**"*

**The personas (a quick map — same pack, opposite jobs), and who this is for:**

| Persona | Wants | Posture |
|---|---|---|
| **Deal Partner** | A fast, directional "on track vs plan?" read | Speed |
| **Portfolio / Reporting Operations + Controls** *(Sharon)* | A comparable, source-traced, auditable view | **Comparability + control ⬅ your customer** |
| **Valuation Analyst** | Audit-ready numbers for the mark → NAV | Precision |
| **IR / LP-reporting** | External exactness (ILPA layout) | Precision (external) |
| **Risk / Credit** | The exactly-defined ratio; covenant early-warning | Precision + definitions |

> **This tool is for persona #2 — the Portfolio / Reporting Operations team (Sharon's world).** They hand-key
> the packs every quarter and must **trust and trace** every number. Everyone else benefits second-hand.
> **Get this right:** Sharon's world is **controls + reporting operations** (reconciliation, audit trail,
> source-of-truth) — **not** the "Value Creation" operating partners who grow revenue and cut cost. Don't
> merge them.
>
> **Assumption to state (as your assumption):** *"I've assumed a reporting-ops team owns this quarterly grind
> — one person, a team, or a vendor. Correct me."*

> **The tension (a great line):** *"The deal team wants speed; valuations, LP-reporting, and credit want an
> audited, reconciled number. The same messy PDF has to serve both — and a source-traced, refuse-when-unsure
> data layer is exactly what lets one tool do that."*

---

## 3. The problem, made felt — 3 min

Frame it as the **Operations team's job**, then make the pain felt. (Full version → Thorough §3.)

> *"Stage 3 — hold and monitor — means the Operations team **monitors** the portfolio by reviewing **every
> company's quarterly report, by hand.** It's week two after quarter-close: 20+ PDF packs land — a SaaS
> company, a lender, a payments company, a freight marketplace. An analyst opens each, hunts for the numbers,
> and **hand-keys** them into one master spreadsheet. **That manual review is the pain Concord solves** — and
> four things go wrong, all provable from the real packs:"*

- **Same metric, many names** (NovaCloud ARR: "End-of-Period ARR" vs "ARR (End of Period)"; revenue drifts
  *Total Billings → Recognized Revenue → Net Revenue*) → the trend silently splits.
- **Same name, different meaning** (a software "gross margin" vs a lender's "gross margin") → quietly wrong.
- **Right number, wrong basis** (ClearPay's $38.4M includes $6.2M it can't spend; ConstructIQ burns per
  quarter, not per month).
- **You can't prove it** — no number links to its source; *"where did this 78% come from?"* → *"let me
  re-open the PDF."*

> **The one line:** *"The pain isn't reading PDFs. It's **reconciliation, comparability, trust, and time** —
> every quarter, forever. Reading the PDF is the easy 10%; the expensive 90% is knowing which numbers are safe
> to compare, and proving each one."*

---

## 4. Comparability is the product — and why deterministic — 4 min

### The thesis + what Concord guarantees

> *"Concord loads every pack **offline in one click**, classifies each company, normalizes the numbers onto
> one shared vocabulary, reconciles against the company's own report, **refuses any comparison that isn't
> truly like-for-like**, and lets you **click any number to see its source.** Two promises:*
> *1. **Comparability you can trust** — renamed labels stitched into one series; differently-defined metrics
>    **across asset classes refused**; units and basis handled before any comparison. When it isn't safe, the
>    tool **visibly refuses.***
> *2. **Traceability you can prove** — every number carries its source file, original label, and confidence;
>    one click shows the exact sentence. **(File-level today; page-level is roadmap.)**"*

**The thesis picture (the "same 60%" reveal — this is where it lands, not the hook):**
> *"Two of your companies both report a **60% 'gross margin.'** One is a SaaS business — that's the cost to
> **deliver software.** One is a lender — that's **interest income minus cost of funds.** Same word, two
> different machines. A generic tool drops both in one column and is **quietly wrong.** Concord **refuses to
> rank them, and says why.** Same label doesn't mean the same metric — **comparability is the product, not
> extraction. Concord would rather refuse a comparison than fake one.**"*
> *(Honest scope: the refusal fires **lender-vs-SaaS** today; two **SaaS** companies computing margin on a
> silent, different basis is a **roadmap** limit — the SaaS-margin heat colour is directional, not audited.)*

### Why deterministic for *this* demo — the honest maturity moment

> *"For this demo I used a **single deterministic method** — fixed rules — on purpose. Rules are cheap, fast,
> testable, offline, and they **never invent a number.** But I'll be clear: **one method is not
> production-grade.** A single reader, however good, can be wrong and you'd never know."*

**The honest Firecrawl story (own it — credibility, not an excuse):**
> *"My first build actually used **Firecrawl**, a paid extraction service. I **hit errors on it and ran out of
> credit** mid-build. So I switched to a deterministic method — and honestly that was the right move: it let
> me prove the **business case** and show how I'd help the Operations team, with a design that's **auditable
> and stays offline.** Deterministic-first is genuinely right for a **trust** tool."*

**Why deterministic here and not an LLM — the speed-vs-precision contrast (the growth story):**
> *"My **first take-home** solved the **deal partner's** need — an **'AI Scout'**: give it a company URL, it
> scrapes the company info and press/news, searches and scrapes the founders, summarizes everything, and posts
> a suggestion in **Slack** — 'should we move forward?' I used an **LLM** there, because the deal partner needs
> **speed** over precision. **This** round, the **Portfolio Operations** team needs the **opposite —
> precision first**: a number you'd sign your name to, with a wrong answer **refused** rather than guessed.
> **That's** why this one is deterministic. Same builder, two rounds, two opposite trust postures."*

**What I'd do for real (the redundant-reader idea, high level — depth in §7 / Thorough §8 Group A):**
> *"To make one reader trustworthy in production, you don't rely on one. You run **3–4 independent readers in
> parallel** — methods that fail in **different** ways. A small orchestrator collects their answers: **when
> they all agree, it validates the number; when any disagrees, it flags that metric with a warning and sends
> it to a human**, with every reader's answer side by side. The disagreement **is** the alarm."*
> *(Honest caveats to say: this ensemble is **designed, not built** — today's demo runs the single
> deterministic method — and 'independent' is never total, so agreement is **strong evidence, not proof.**)*

---

## 5. AI-first, but human-decision-driven — 1.5 min

**Make this impactful — it's the spine of the whole talk.**

> *"Here's the principle I build by, and the one I'd want a tool at Sagard to follow: **be AI-first, but
> human-decision-driven.** AI is **probabilistic** — a **likely** answer, not a **certain** one — so we
> **never let it decide.** AI does the heavy, repetitive work and **suggests with reasons.** The **human is
> the center of every decision**, and makes **every call that reaches a report.**"*

- **AI / rules (redundant in production; one reader today):** read the PDFs, pull the raw numbers, stitch
  renamed labels, normalize **units + scale.** *(A different currency → **flag / refuse, don't convert.**)*
- **AI suggests → human confirms:** "these two labels might be the same metric"; "this number looks wrong."
- **Human only:** "is this right enough for a report?"; the valuation mark; the LP figure; the IC call.
- **AI suggests with reasons (never a verdict):** *"this company looks healthy because (i),(ii),(iii)."*

---

## 6. LIVE DEMO — 9–10 min (run it live)

**On the deck this is a single title slide.** You switch to the app and drive it live — the three beats and
the honesty caveats are **spoken, not printed.** Your scripts: `cockpit-frontend-guide.md` (the click-path)
and `demo-honesty-script.md` (what to *say* vs. what the screen *shows*).

**The three beats (delivered live):**
1. **The pain on screen:** load 24 packs **offline in ~1 second** (screenshot the live run — the figure comes
   from the run, not a fixed label). *"Nothing left the machine."*
2. **Two proof moments:**
   - **The hidden trend:** NovaCloud ARR looks like **one dot** to a naive tool → Concord stitches the renamed
     labels into **five quarters, $24.1M → $34.2M (+42%).** *"A silent blank is more dangerous than a loud
     error."*
   - **The refusal (a control):** a lender's 62% "gross margin" next to a SaaS 76% → Concord **refuses and
     says why** (interest margin ≠ delivery margin). *"A generic dashboard ranks these. Ours refuses — that
     refusal is a control."*
3. **The trust spine:** click **any** number → source file, raw label, confidence, exact sentence. *"Every
   claim is one click from proof — the audit trail."*

*Optional beats:* ClearPay $38.4M → **$32.2M** spendable (strips $6.2M client float); ConstructIQ the laggard;
the four trust panels (Refused 5 · Exceptions 10 · Breadth 29 labels · Reconciliation 22/22 agree **+ 7
in-document conflicts auto-resolved**).

> **Own the caveats (say them before they ask — they're in `demo-honesty-script.md`):** PeopleFlow's **GBP**
> flag is a **front-end rule** (the parser doesn't see the £); provenance is **file-level** (excerpt shown, no
> page number yet); the raw missing-metric flag has a couple of **false positives** (CarbonTrack/TalentVault,
> suppressed on the grid); two SaaS margins on a silent basis is a **roadmap** limit; 22/22 reconciliation is
> a **second witness** (confirmation, not independent proof) — the real catch is the **7 in-document
> conflicts.**

---

## 7. The path to production trust — **product** improvements only — 4 min

> **Scope note:** this is about making the **product** more trustworthy and useful. **Scaling / system design
> lives in §8 and the separate doc `iv-system-design-and-scaling.md`** — not here. Lead with the headline,
> then name the rest in one breath. (All improvements, fully detailed → Thorough §8, Groups A–G.)

**① The headline — trust the source-of-truth (the redundant multi-reader architecture).** Restate §4's idea
as *the* next build:
> *"Run **3–4 independent readers** — a deterministic parser (today's Concord, the reference vote), an
> independent **local** structural reader (stays offline), and a **vision-LLM** that reads meaning — plus,
> optionally, a specialist doc-AI as a tie-breaker. Use a **mix, not clones**: three copies of the same model
> share the same blind spots and can be **confidently wrong the same way** (that's *correlated failure*), so
> their agreement means nothing. A small **orchestrator** compares **normalized tuples** — metric, period,
> unit, basis, value — not raw text, with a rounding tolerance, and applies **tiered consensus**: all agree →
> **validated**; disagree → a **⚠ warning** to the **human-review queue**, every method's answer side by
> side. **Count isn't enough — independence decides.**"*
>
> **Why it lands for both:** for Parinaz it's rigorous (independent methods, honest that independence is never
> total); for Sharon it's **an automated four-eyes control with a full audit trail.** *"The thing that makes
> the numbers more correct is the same thing that gives you the control and the audit trail."*
>
> **A demo you can offer to build:** *"I could even inject **one synthetic disagreement** into this cockpit —
> additive, offline, backend byte-identical — so you'd see the ⚠ and click it to see every method's answer,
> marked 'sent to human review.'"* *(Honest: this ensemble is **designed, not built** — I can't quote an
> auto-accept rate until it runs on your packs. Full architecture — the orchestrator, the decision rule, LLM-
> judge biases, confidence routing, the human-review queue, cost/latency, and what's mature vs bleeding-edge —
> is Thorough §8 Group A. Every vendor accuracy number there is a **vendor claim**, to be re-measured on a
> labeled pilot.)*

**The rest of the product menu (name in one breath; detail in Thorough §8):**
- **② The reading layer (Group C).** An LLM reads a company's clean time series and **suggests** a story
  (*"NovaCloud is compounding — but cash is shrinking; confirm the funding plan"*) — a **suggestion**, never a
  verdict; a human refutes/comments, and next quarter the AI reads those comments first. It reads **over
  already-clean, provenance-tagged numbers**, so it can't inject a wrong figure.
- **③ Intake + change-tracking + alerts (Group F).** Connect to the **cloud folder the team already uses**
  (read-only, scoped); **fingerprint each file with a hash** so a *new* file runs, a *corrected* file re-runs,
  and an *unchanged* one is skipped; **alert** when a company looks worse — a **heads-up, never a verdict**; a
  human verifies the source before anyone acts.
- **④ Controls + audit (Group G — overlaps the system-design doc).** Auth + permissions + a **maker-checker**
  workflow: values are never overwritten, every change is logged (who/what/when/why), and it's exportable for
  an auditor.
- **⑤ Currency + change-over-time (Groups E + B).** A redundant reader can **capture the £/currency symbol** —
  turning today's front-end rule into captured data — then FX-convert **levels only** with a dated rate,
  **never percentages.** Plus two views worth building: **rebase-to-100** (compare growth *shapes* despite
  size gaps) and a **QoQ-vs-YoY** switch (recent momentum vs annual trajectory). *(There is no "Group D" — the
  older label-drift idea is subsumed by the redundant readers, Group A.)*

---

## 8. Prototype, not production — how to scale — 1.5 min (honest)

> *"Concord is a **prototype, not production** — offline, in-memory, one method, no login. The **76%→90%
> recall** is real but on **24 synthetic PDFs** (recall = values captured ÷ the **128 numbers printed** in the
> packs; the jump was a **parser fix**, not a changed test) — and it's paired with **0 wrong values**, because
> a confidently-wrong number is worse than a flagged-missing one. Here's the honest path:"*

- **Option 1 — Harden in place (recommended first):** keep the engine; add a durable store, a job queue with
  retries, and the **redundant-extraction ensemble**; stay offline; measure recall continuously. *Low risk,
  weeks, keeps data in-house.*
- **Option 2 — Cloud re-platform (the destination):** event-driven, multi-tenant, auto-scales for quarter-end
  bursts. *Highest ceiling, but months of work and **data leaves on-prem** — a real compliance question.*

> *"Do Option 1 first; treat Option 2 as the destination — and only after the data-residency question is
> answered."* **The deep system-design story (queues, retries, idempotency, dead-letter queues, partitioning,
> multi-tenancy, data-residency, every choice with options + trade-offs) is in
> `case-study/iv-system-design-and-scaling.md`** — that's my Q&A / whiteboard reference for the scaling round.

---

## 9. Where my time actually went — 1 min

**Replace the old fun fact with one honest picture** — a single stacked bar of where your time went.

> *"I should be honest about where my time went. **Most of it was not coding.** It went into **understanding
> your world** — what Sagard is and how it makes money, the difference between VC, PE, and private credit, how
> PE actually works, who the personas are, how the **portfolio operations team** works and what problems they
> have, and how they **monitor the portfolio using the quarterly reports.** Only then did I **scope the
> problem**, then **plan, weigh trade-offs, and build** — and last, make these slides."*
>
> *"That's on purpose — because **that is what a Forward Deployed Engineer does.** You take something
> **ambiguous**, research it, **understand** it, get **feedback and insights**, plan, weigh the trade-offs,
> and then **solve it with software and AI.** The hardest part wasn't the code — it was learning enough of
> your world to point the code at the **right** problem."*

*(The bar's proportions — understanding dominates, then scope, then build, then slides — are your **own rough
self-estimate**; say "roughly," never a measured fact. The two-rounds speed-vs-precision story now lives in
§4, not here.)*

---

## 10. Days → one click + the final punch — 1 min

> *"Today the quarter-close is **often days** of re-keying before anyone can even see the portfolio. Concord
> makes it **one click** to a comparable, source-traced view — so the team spends its time on **judgment, not
> typing.** But the real win isn't the hours: it's that the comparison is **trustworthy** and every number is
> **one click from proof.** A wrong number **caught before it reaches an investment committee** is worth far
> more than any typing saved."*

*(If asked for a number, turn it back — "how many hours does your team actually spend on this today?" Never
fabricate one.)*

**The final punch (stage it — the very last beat):** pause, bring up the Concord card, and let the heart line
**land** — read it slowly.

> *"Concord — one comparable, source-traced view of every portfolio company. Built with AI, decided by humans.
> **Made with love, with AI — but human-first on every decision ❤️.** Thanks."*

Hold the card — the Concord mark, the slogan, the heart line, a quiet **"Thanks."** — **on screen through
Q&A.** Don't talk over it. *("Human-first on every decision" is your whole thesis in six words — refuse-to-
compare, provenance, humans-own-the-mark.)*

---

## 11. Q&A + my questions for them

Ask these **throughout** Q&A (full set + "if you only ask three" → Thorough §12):
- **The customer:** *"Who actually owns the quarterly hand-keying today — one person, a team, a vendor? And
  how many hours does it take, across how many companies × packs per quarter?"*
- **The culture (the one you most want):** *"Is Sagard trying to be **AI-first but human-decision-driven**
  across every team — or is AI mostly owned by the AI/engineering group and the business teams consume it?"*
- **The scorecard:** *"Six months in, what did a **successful** Forward Deployed Engineer here actually *do*
  that the firm valued?"*
- Plus the "correct me" validators: *"Did I get how Sagard makes money right?"* and *"Is portfolio-company
  monitoring the right place to start, or is the sharper pain elsewhere?"*

---

### Honesty guardrails (same as Thorough — quick reminder before the room)
- **Deterministic because of limited time; one method isn't production-grade** — keep that honest register.
  The **redundant ensemble + tiered consensus + human-review queue is designed, not built** — never imply it
  runs today.
- **Currency:** normalize units + scale, but **flag / refuse a different currency, never convert.**
  PeopleFlow's GBP flag is a **front-end rule** (payload `currency` is `null`).
- **Provenance is file-level** today; the PDF-crop screenshot sidebar is **future design** — never show a
  page number or crop live as if real.
- **Refuse-to-compare across asset classes is BUILT** (lender interest-margin vs SaaS product-margin); the
  **intra-SaaS margin refusal is roadmap** (the SaaS-margin heat colour is directional, not audited).
- **No invented ROI / time.** Time-savings stays **qualitative** — say "often days," never a measured cycle
  time, and turn the hours question back to the room. Recall = **76%→90%, 0 wrong values**, on **24 synthetic
  PDFs** (128 printed numbers; a parser fix). Say "synthetic" every time; **never say "0 false alarms"
  unqualified** (the raw missing-metric flag has a couple of false positives suppressed on the grid). Hook
  #3's "95%" is hypothetical.
- **Every vendor accuracy number is a vendor claim** (re-measure on a labeled pilot); reader **independence is
  never total** (agreement is strong evidence, not proof); and the ensemble-diversity math is sound but
  **verify the exact paper/venue before quoting one** (§8 Group A).
- If asked live **"what's the confidence range?"**, reconcile your two source numbers beforehand and quote
  **one** figure (the audit guardrail says ~84%–99.5%; the cockpit guide says 90.4%–99.5%).
- **Re-verify Sagard's public figures** (AUM, company count, staff, "$100B by 2029", Unigestion) on
  sagard.com the morning of.
