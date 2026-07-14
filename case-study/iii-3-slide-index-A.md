# Concord — Slide-Ready Index (**Outline A**)
### Punchy titles · on-slide anchor phrases · graphic placeholders — for the slide-builder

**What this is.** A slide-by-slide build sheet for the talk, in **one version — Outline A (thorough, ~45 min)**. For each slide you get a *takeaway* title, 2–4 short anchor phrases (the billboard — you *say* the sentences), and one concrete **[graphic: …]** to draw. *(The old lean "Outline B" has been retired; `iii-2-presentation-outline-B-lean.md` is kept only as a superseded reference.)*

**The source of truth is `iii-1-presentation-outline-A-thorough.md`.** Every section there opens with a **🔒 DECISION — LOCKED** block (slides · titles · on-slide anchors · graphic · what is spoken-not-slided · what is backup-only). This index **mirrors** those locks. If this index and a locked block in iii-1 ever disagree, **iii-1 wins.**

**How to use it.** Build the slides from this (and iii-1's locked blocks). One idea per slide. The title is the point; the body is anchors, never sentences. Every slide leaves room for the graphic. All numbers here are the corrected, honest facts (recall 76%→90%, 0 wrong values on **24 synthetic PDFs**; NovaCloud ARR $24.1M→$34.2M +42%; lender 62% vs SaaS 76% refused; ClearPay $38.4M→$32.2M; provenance file-level; currency flag/refuse, never convert; the redundant ensemble is **designed, not built**).

---

**Slide index — 33 slides, 13 sections (0–12), ~45 min capable.** Present most of the 33 (curate §8 to the 5 "SHOW" slides) to protect 10+ min of Q&A. The demo (§7) is **one title slide** run live from the app.

| # | Section (impactful title) | Slides | Running | ~Min |
|---|---|---|---|---|
| 0 | Understand your world first (the FDE job) | 1 | 1 | 1 |
| 1 | One data layer, two opposite needs | 1 | 2 | 1 |
| 2 | Here's my map — correct me | 5 | 7 | 7 |
| 3 | The quarter-close hurts | 3 | 10 | 3 |
| 4 | Comparability is the product | 5 | 15 | 5.5 |
| 5 | AI suggests, humans decide | 2 | 17 | 2 |
| 6 | Caught before the IC beats hours | 1 | 18 | 1 |
| 7 | Watch it refuse (live demo) | 1 | 19 | 10 |
| 8 | The path to production trust | 7 built · show 5 | 26 | 6 |
| 9 | Prototype → production | 2 | 28 | 2 |
| 10 | The hard part wasn't the code | 1 | 29 | 1 |
| 11 | That's Concord + the final punch | 2 | 31 | 1 |
| 12 | Correct my map, read the room | 2 | 33 | Q&A |

---

## Section 0 — Understand your world first (the FDE job)  ·  (1 slide)  ·  ~1 min

### Slide 0.1 — An FDE starts in your world — not in the code
- the FDE job: take an ambiguous problem → **understand your world** → solve the real one
- Xavier Medina — software engineer · 4+ yrs shipping production AI (ProsperaLabs: voice · chat · email)
- so here, most of my time went to understanding YOUR world, not coding
- [graphic: a left-to-right **FDE arc** — "an ambiguous problem" → a **big, dominant UNDERSTAND YOUR WORLD** node (Sagard · PE · the Ops team) → "build the right thing"; the understand node is by far the largest, foreshadowing the §10 time bar; **NO Concord wordmark here**]
- honest: "production-grade" = my ProsperaLabs work, **not** Concord (Concord's demo is one deterministic pass)
- *(speak, don't slide: the full bio + humility-pivot quotes — the slide's point is understanding-first, the FDE job)*

---

## Section 1 — One data layer, two opposite needs  ·  (1 slide)  ·  ~1 min

### Slide 1.1 — Two opposite readers, one shared data layer
- your deal partner + your valuations analyst open the SAME quarterly pack
- they need OPPOSITE things from it (speed vs precision)
- **the hook (printed verbatim):** *"When your deal partner and your valuations analyst open the same quarterly pack, they need opposite things from it — what if one clean, traceable data layer could serve both?"*
- [graphic: two persona silhouettes (deal partner ↔ valuations analyst) reaching from opposite sides toward ONE shared data-layer bar under a single quarterly pack — "speed" one side, "precision" the other; **do NOT** use the "same 60%" column visual here — that reveal is §4]
- honest: "traceable" = **file-level** provenance (not page/sentence)
- *(backup, never a slide: the 5 alternate hooks — #6 is the only hook that reaches a slide; never stack two)*

---

## Section 2 — Here's my map — correct me  ·  (5 slides)  ·  ~7 min

### Slide 2.1 — Four strategies, one focus — Concord starts with your direct PE portfolio companies
- branches: VC · PE · Private Credit · Real Estate (+ a big solutions arm)
- **PE = where Concord focuses today** — the packs in my demo
- the rest = documented extensions, not v1
- [graphic: four strategy tiles in a row — the **PE** tile enlarged + accent-ringed "← Concord focuses here today"; the other three **dimmed/greyed-out**, labelled "documented extensions, not v1"; **footnote:** "*re-verify Sagard's strategy line-up + scale figures on sagard.com the morning of; print NO AUM/portfolio-count/fund-size numbers as fact*"]
- honest: "v1 = PE only; the other three branches are documented extensions, not built"

### Slide 2.2 — Fundraise → invest → hold → exit: Concord lives in the quarter-by-quarter middle
- a fund lives ~10 years: Fundraise → Invest → **HOLD / MONITOR** → Exit
- Concord lives in stage 3 — the quarter-by-quarter job of watching every company
- [graphic: horizontal 4-stage fund-cycle arrow — a glowing pin on stage 3 "HOLD / MONITOR = Concord's home"; caption "a fund lives ~10 years; monitoring is the quarter-by-quarter middle"]
- honest: "Concord feeds the inputs to *the mark* — it never makes the mark (a human, audited judgment)"

### Slide 2.3 — Five people read the same pack — for opposite jobs
- render the **5-row persona table**, columns: **Persona · What they DO (short) · Trust posture**
- **row #2 (Reporting Operations + Controls) highlighted** and tagged "⬅ our customer"
- speed (deal partner) vs precision (valuations / IR / credit)
- [graphic: the 5-row persona table (those three columns), row #2 highlighted "⬅ our customer"]
- honest: "these are my assumed roles — please correct me"

### Slide 2.4 — Controls, reconciliation, audit trail — that's our customer, not Value Creation
- owns the quarterly monitoring, reconciliation & reporting grind
- must **trust AND trace** every number · controls · source-of-truth · audit trail
- NOT operating-partner / Value Creation
- [graphic: a single customer-spotlight card for persona #2 (three control words: reconcile · trace · sign-off) with a struck-through "Value Creation / operations" chip]
- honest: "(my assumption — one person, a team, or a vendor? one of my questions for you.)"

### Slide 2.5 — One messy PDF must serve speed AND audit — that's the whole problem
- deal team wants a fast directional read
- valuations / LP-reporting / credit want an audited, reconciled number
- one source-traced, refuse-when-unsure layer serves both
- [graphic: two arrows (speed / precision) converging into one "source-traced · refuse-when-unsure data layer" box; echoes hook #6, hands into §3]
- *(speak, don't slide: the money flow LP→GP→portco→exit→LP · "2 and 20" · "the mark" — all spoken, never printed; say the branch line-up "roughly — I'll re-verify on sagard.com")*

---

## Section 3 — The quarter-close hurts  ·  (3 slides)  ·  ~3 min

### Slide 3.1 — Monitoring the portfolio means hand-keying 20+ packs — every quarter
- stage 3 is Hold / Monitor — and the Ops team monitors by reading every company's Q report, manually
- second week after close: 20+ PDF packs land (SaaS · lender · payments · freight)
- open each · hunt for the numbers · hand-key into one master spreadsheet — this review IS the monitoring
- [graphic: a stack of labelled PDF-pack icons (SaaS / lender / payments / freight) funnelling through a small human-with-keyboard into one spreadsheet grid; clock reading "DAYS · week 2 after close"]
- honest: "synthetic test packs — 10 companies across 24 PDFs. Say '20+ **packs**', not '20+ companies.'"

### Slide 3.2 — Four traps in the manual close — each one provable in the packs
- many names, one metric — NovaCloud ARR: "End-of-Period ARR" = "ARR (End of Period)"
- one name, two meanings — SaaS delivery-margin vs LendBridge interest-margin (quietly wrong)
- right number, wrong basis — ClearPay $38.4M incl. $6.2M client float = $32.2M spendable
- can't prove it — no number links back to its source
- [graphic: 2×2 grid of trap cards, ONE real example each; the naive "one shared column" struck through on traps 2 and 3]
- *(speak, don't slide: trap 3's second example — ConstructIQ reports burn per quarter while everyone else is per month)*

### Slide 3.3 — Reading the PDF is the easy 10%. The expensive 90% is comparability + trust.
- reading the PDF = the easy 10%
- knowing what's safe to compare + proving each number = the expensive 90%
- reconciliation · comparability · trust · time — every quarter, forever
- [graphic: a 10 / 90 split bar — a thin "reading" slice against a fat "comparability + trust" slice]

---

## Section 4 — Comparability is the product  ·  (5 slides)  ·  ~5.5 min

### Slide 4.1 — One offline click runs the flow — a human owns every number that leaves
- load all packs offline in one click → classify (equity vs credit)
- normalize onto one shared vocabulary → reconcile vs the company's own report
- refuse unsafe **cross-class** comparisons (lender vs software) → click any number → source
- a human owns every number that leaves the building
- [graphic: a left-to-right pipeline of 6 labelled stages (load · classify · normalize · reconcile · refuse · click-to-source), ending in a click-to-source drawer icon, a human badge over the exit gate]
- honest: "provenance is **file-level** today (file · label · confidence · exact excerpt), not page/sentence; refuse fires **across asset classes** today, intra-sector margin flagging is next"

### Slide 4.2 — Same label ≠ same metric — comparability is the product, not extraction
- two companies, both "60% gross margin" (illustrative) — SaaS delivery-margin vs lender interest-margin = different machines
- the product isn't pulling the number out — it's knowing when NOT to put them in one column
- two promises: comparability you can trust · traceability you can prove (file-level today)
- [graphic: THESIS REVEAL (self-contained — do NOT fetch any external line reference) — two cards, each a bold "60% gross margin" **tagged "(illustrative)" inline**, one SAAS one LENDER, a big "=?" between; the merged column visibly SPLITS into two labelled lanes ("SaaS · delivery-margin" vs "lender · interest-margin"), the naive merge struck out; small inverse inset of the ARR stitch (two labels → one line)]
- honest: "illustrative numbers. Live, this fires on **LendBridge's** real interest-margin (a lender's 'gross margin', 58→62%) — shown in full, never ranked against a SaaS margin"

### Slide 4.3 — Rules never invent a number — deterministic on purpose, not production-grade yet
- for this demo: a single deterministic method (fixed rules) — cheap · fast · testable · offline · never invents a number
- but one method is NOT production-grade — a lone reader can be wrong and you'd never know
- honest Firecrawl story: my first build used a paid extraction service; I hit errors AND ran out of credit → switched to deterministic to prove the business case
- deterministic-first is genuinely right for a TRUST tool
- [graphic: a rules-engine icon with four property chips (cheap / fast / testable / offline); a red banner "not production-grade yet"; a small "Firecrawl → errors + out of credit → deterministic" honesty footnote]
- honest: "any vendor accuracy % = the vendor's own claim, not our measured result"

### Slide 4.4 — Same builder, opposite tools — speed for the deal partner, precision for Ops
- round 1 (first take-home) = the DEAL PARTNER's "AI Scout": company URL → scrape info + press → search + scrape founders → summarize → Slack "move forward?" — an LLM, because the deal partner needs SPEED
- this round = PORTFOLIO OPERATIONS: needs PRECISION first — a number you'd sign, traceable, wrong answers REFUSED not guessed
- same builder, two rounds, two opposite trust postures → that's WHY this one is deterministic
- [graphic: two-column contrast card — LEFT "Deal partner · speed (LLM)", RIGHT "Operations · precision (deterministic)"; one figure between labelled "same builder"]

### Slide 4.5 — Trust one reader by not trusting one
- **designed, not built — today's demo runs the single deterministic method**
- for production: run 2–4 INDEPENDENT readers in parallel that fail differently
- more agreement → higher confidence (tiered) · any disagreement → flag + send to a human (answers side by side)
- for Parinaz: rigorous, not "three LLMs voting" · for Sharon: an automated four-eyes control + audit trail
- [graphic: 3–4 reader lanes converging on an orchestrator that branches to ✔ (agree → higher confidence) and ⚠ (disagree → human review); pointer "→ §8 Group A (deep architecture)"]
- honest: "'independent' is never total — agreement is strong evidence, not proof"

---

## Section 5 — AI suggests, humans decide  ·  (2 slides)  ·  ~2 min

### Slide 5.1 — Be AI-first, but human-decision-driven — AI never decides
- we are an AI-FIRST company — but HUMAN-DECISION-DRIVEN
- AI is probabilistic — a LIKELY answer, not a CERTAIN one — so we never let it DECIDE
- AI does the heavy, repetitive work and SUGGESTS with reasons
- the HUMAN makes every call that reaches a report
- [graphic: two-lane flow — an "AI / rules" lane (read → stitch → flag → suggest-with-reasons) feeding a single "Human decision gate" box (sign-off → the mark / IC); arrow labelled "suggests", gate labelled "decides"]

### Slide 5.2 — Machines do the grind; the human makes every call that reaches a report
- render the **full 8-row table** (The work · Who does it · Why); **tint the two human-only rows** so the eye lands on "Human only"
- read PDFs / pull raw numbers → AI + rules (redundant in production; one reader today)
- "numbers don't match / looks wrong" → cross-source reconciliation flags it (a redundant orchestrator is production-only)
- different currency → flag / refuse · NOT convert · "right for a report?" / the mark / LP figure / IC call → human only
- [graphic: the 3-column table itself; the two human-only rows tinted]
- honest: "Concord normalizes units + scale (M/K) and flags/refuses a different currency — it does NOT convert. Readers are redundant in production; one reader runs today."

---

## Section 6 — Caught before the IC beats hours  ·  (1 slide)  ·  ~1 min

### Slide 6.1 — The win isn't the hours — it's a wrong number caught before the IC
- today: often days of re-typing 20+ packs before anyone sees the portfolio (I'll ask you the real number)
- Concord: one click to a comparable, source-traced view — time goes to judgment, not typing
- the bigger win isn't the hours — it's that the comparison is trustworthy, one click from proof
- a wrong number caught before an investment committee > any typing saved
- [graphic: before → after split — LEFT a stack of 20+ packs + a clock "hours–days" + a keyboard; RIGHT one cursor click → a clean source-traced grid; beneath, a small balance scale "typing saved" (light) vs "wrong number caught before IC" (heavy)]
- honest: "qualitative only — no invented hours, no dollar figure, no fund-return math"

---

## Section 7 — Watch it refuse (live demo)  ·  (1 slide)  ·  ~10 min

### Slide 7.1 — Live demo — Concord, run live and offline
- I'll run this LIVE from the app — the three beats + the honest caveats are **spoken, not on slides**
- ① the pain on screen (24 packs offline, ~1s) · ② two proofs (hidden trend + the refusal) · ③ the trust spine (click any number → source)
- scripts: cockpit-frontend-guide.md (click-path) + demo-honesty-script.md (what to show vs. what to say)
- [graphic: a single clean title card "LIVE DEMO — Concord" — the Concord wordmark + one-line tagline over a dimmed screenshot of the app just after loading; footer chips "offline · deterministic · provenance-tagged"; ▶ glyph; **no hard numbers printed** — the real proof is the screen you switch to]
- *(spoken caveats before they ask: 24 packs are **synthetic fixtures, not real filings**; GBP flag is a front-end rule; provenance is file-level; the raw missing-metric flag has a couple of false positives suppressed on the grid — never "0 false alarms"; intra-SaaS margin is roadmap; 22/22 reconciliation is a second witness, the real catch is the 7 in-document conflicts; if you voice a confidence range, quote ONLY 90.4%–99.5%; do NOT stage a live "MediSight +5.5M" catch — not in the corpus)*

---

## Section 8 — The path to production trust  ·  (7 built · SHOW 5)  ·  ~6 min
*(Roadmap Groups A–G — **PRODUCT** improvements only. SHOW: opener 8.0 + A · C · E · G. BACKUP: B, F. There is no Group D.)*

> **Slide roster (mirrors iii-1's §8 lock):** 8.0 opener · **8.1 Group A readers** · **8.2 Group C reading layer** · **8.3 Group E currency** · **8.4 Group G controls** · 8.5 Group B (backup) · 8.6 Group F (backup). Group A is **one** slide; A0–A9 depth is Q&A / whiteboard, never a slide. Everything here is **designed, not built.**

### Slide 8.0 — Reliability isn't more AI — it's more agreement, more human judgment, and a record of both  ·  SHOW
- more agreement · more human judgment · full record
- the ensemble raises warnings — a human decides
- 6 product improvements — all roadmap
- [graphic: 3-icon row — [handshake = agreement] → [person = human decides] → [ledger = permanent record]]
- honest: "everything in this section is **designed, not built**"

### Slide 8.1 — Correlated readers can outvote the one that's right — so independence, not count, decides  ·  Group A  ·  SHOW
- today: one deterministic reader · next: 3–4 methods across "loud vs silent" (geometry parser · doc-AI · vision-LLM)
- 3 copies of one model share blind spots (correlated failure) — use DIFFERENT mechanisms so errors decorrelate
- TIERED consensus → real disagreement goes to a human
- [graphic: fan-in pipeline — 3–4 reader boxes (deterministic parser · local Docling · vision-LLM · optional doc-AI) → orchestrator → {VALIDATED green / DISAGREE amber → human queue}; ONE clean pipeline, not the A0–A9 tables]
- honest: "designed, not built — no auto-accept rate until it runs on real packs; Reducto ~99% and any vendor figure is the **vendor's own claim**"
- *(speak, don't slide: the deep A0–A9 depth — correlated-failure / RMS ~1/√M math, Self-MoA hedge, supervisor graph, the ClearPay A3 trace, cost/latency, confidence routing, the human-review queue)*

### Slide 8.2 — AI writes the interpretation, never the number — and a human can always refute it  ·  Group C  ·  SHOW
- after the numbers are clean: an LLM writes the "story" — per company + whole portfolio — explicitly a SUGGESTION
- human accepts / corrects / comments → next quarter the LLM reads last quarter's comments first (learns the house view)
- safe: it reads ONLY over normalized, provenance-tagged numbers — it can't inject a figure, only an interpretation the human refutes
- [graphic: 3-step flow — [clean grid] → [AI note card "AI suggestion — review"] → [human ✓ / ✎ / comment], loop arrow "next quarter reads last quarter's comments"; **include one short NovaCloud card** ("compounding +42% ARR, but cash falling $29.5M→$19.6M — confirm the funding plan")]
- honest: "roadmap feature — the AI note is not built; cites every number · no dollar-ROI claims"

### Slide 8.3 — Concord refuses to mix pounds and dollars — it flags, it never converts  ·  Group E  ·  SHOW
- today: PeopleFlow "· not comparable (GBP)" is a FRONT-END rule (payload currency = null — the parser doesn't see the £)
- one label reads "Net Pound Retention (NPR)" — the tell that its figures may be in pounds
- roadmap: a reader captures the £ → captured data · convert LEVELS only (dated, sourced rate) · refuse RATIOS (a % in GBP stays a %) · refuse over convert
- [graphic: before/after — LEFT "today: front-end rule flags GBP, refuses the axis"; RIGHT "roadmap: a currency-reader captures £ → convert levels with dated FX (fx_rate / fx_source / fx_date), refuse to convert %"]
- honest: "the GBP flag is a front-end rulebook rule, **not parsed data** (parser sees currency = null). No FX conversion exists yet."

### Slide 8.4 — No silent overwrites, maker-checker on every fix, an audit trail that stands up to an LP challenge  ·  Group G  ·  SHOW
- overlaps the System Design doc (iv-…) — the deeper version lives there
- never overwrite — a correction is a NEW state, the original is kept
- maker-checker (suggester ≠ approver) · least privilege (see only your companies)
- append-only, immutable, exportable audit log (who · what · old→new · when · why)
- [graphic: value-state flow — Extracted → Verified / Flagged → Suggest (user A) → Approve/Reject (user B) → Corrected, keeping *old → new → who → when → why*; a small audit-log ledger beside it]
- honest: "none of this exists yet — the next layer on top of provenance + refuse-to-compare, which **do** exist"

### Slide 8.5 — Compare growth shapes, not sizes — rebase every company to 100, then switch QoQ↔YoY  ·  Group B  ·  BACKUP (build; show only if asked)
- Concord shows %-change today (NovaCloud ARR +42%, in-cell sparkline)
- roadmap view 1 — Rebase-to-100 (index): start every company at 100 → compare growth SHAPES despite size gaps
- roadmap view 2 — QoQ vs YoY switch: QoQ = recent momentum · YoY = annual trajectory (need both lenses)
- [graphic: two mini line-charts — LEFT indexed-to-100 lines from a common start; RIGHT a QoQ/YoY toggle]
- honest: "roadmap — not built; today's sparklines are self-scaled, so heights aren't directly comparable"

### Slide 8.6 — Fit the team's habit: watch read-only, re-run only when a fingerprint changes, never act  ·  Group F  ·  BACKUP (build; show only if asked)
- intake: point Concord at the shared drive the team already uses (read-only, scoped — never writes back)
- file hash (SHA-256): new = run · changed = re-run + "restated" flag · same = skip (content-based, not name-based)
- alerts tied to the reading layer: when the AI summary reads "worse," push a heads-up — NEVER a verdict; human verifies first
- [graphic: a 3-row manifest table (New→Run / Changed→Re-run+flag / Unchanged→Skip) beside an alert card "AI read = hypothesis · number-moved = fact" with a "Verify in Concord" button]
- honest: "roadmap — Concord is offline/manual today; a hash tells you *that* a file changed, not *what*"

---

## Section 9 — Prototype → production  ·  (2 slides)  ·  ~2 min

### Slide 9.1 — Concord today is a prototype, not a production system
- today: offline · in-memory · one deterministic extraction pass · no DB · no login
- recall 76% → 90% · 0 wrong values · on 24 SYNTHETIC PDFs (denominator = 128 printed numbers)
- the jump = a backend PARSER FIX, not a changed test set — and 0-wrong matters more than the % (a confidently-wrong number is worse than a flagged-missing one)
- [graphic: a two-column "What's real / What's not yet" honesty strip — real: the engine · the recall gain · refuse-to-compare · file-level provenance | not yet: durable store · job queue · the redundant ensemble · multi-tenant cloud; a "prototype, not production" stamp]
- honest: "the 24 PDFs are synthetic test fixtures, not real filings; the redundant ensemble is **designed, not built** — 'to add', never present-tense"

### Slide 9.2 — Harden in place first — the cloud is the destination, when it's justified
- Option 1 — harden in place: keep the engine, add a durable store + job queue/retries + the redundant ensemble · stays offline · low risk (do this first)
- Option 2 — cloud re-platform: event-driven, multi-tenant, auto-scales for quarter-end bursts · highest ceiling · but data leaves on-prem (the destination)
- recommend Option 1 first; Option 2 only when volume/tenants/SLAs justify it AND data-residency is answered
- the deep architecture lives in case-study/iv-system-design-and-scaling.md (Q&A / whiteboard)
- [graphic: the two-column Option 1 vs Option 2 table **condensed to 3 rows (What-it-is / Reliability / Risk)** — drop Effort/Cost — with an arrow "Option 1 → Option 2 (the destination)"; a red data-egress flag on Option 2]

---

## Section 10 — The hard part wasn't the code  ·  (1 slide)  ·  ~1 min

### Slide 10.1 — Most of my time wasn't coding — it was understanding your world  ·  (the emotional closer)
- most of my time was NOT coding — it was understanding Sagard, PE, the personas, and how the Ops team monitors via the Q-reports
- only then did I scope the problem, plan / weigh trade-offs, and build — slides last
- that's what an FDE does: take ambiguity → research → understand → get feedback → plan → weigh trade-offs → solve with software + AI
- [graphic: ONE horizontal STACKED bar = 100% of Xavier's time — a dominant ~70% "Understand" block ("Sagard · business · VC/PE/PC · how PE works · the personas · how the Ops team monitors via Q-reports"), a thin "scope the problem" slice, a "plan / trade-offs / build" ~20% block, a small "slides" tail]
- honest: small-print caption "Xavier's own rough estimate — self-reported, not measured"
- *(backup, never a slide: the two-rounds speed-vs-precision story — it now lives in §4, Slide 4.4)*

---

## Section 11 — That's Concord + the final punch  ·  (2 slides)  ·  ~1 min

### Slide 11.1 — Comparability, provenance, a path forward — now, your questions
- comparability is the product, not extraction
- every number one click from its source
- a clear path to the redundant, production-grade version
- over to you — and I have a few questions for you
- [graphic: clean closing card — three small pillar icons (comparability · provenance · the path forward); "over to you", no numbers]

### Slide 11.2 — Built with AI, decided by humans  ·  (the very last beat — hold through Q&A)
- Concord — one comparable, source-traced view of every portfolio company
- built with AI · decided by humans
- "Made with love, with AI — but human-first on every decision ❤️"
- Thanks.
- [graphic: full-bleed punch card — the Concord mark (two overlapping rings = convergence / agreement) centred above "Concord" and its slogan "One comparable, source-traced view of every portfolio company"; one warm line "Made with love, with AI — but human-first on every decision ❤️"; a big quiet "Thanks." at the foot; the "Prepared for Sagard" mark small in the corner; one accent colour, deep whitespace, no data — hold this card up through Q&A]
- *(speak, don't slide: pause before the card; read the heart line slowly; if pressed on "its source," provenance is file-level)*

---

## Section 12 — Correct my map, read the room  ·  (2 slides)  ·  ~Q&A

### Slide 12.1 — Three questions I can't answer without you
- who owns the quarterly hand-keying today — person · team · vendor? (B1)
- AI-first but human-driven — every team, or owned by the AI group? (D2)
- 6 months in — what did a successful FDE actually do? (E1)
- footer: the customer · the culture · the scorecard
- [graphic: a three-card cue layout — one card per question, labelled customer / culture / scorecard]

### Slide 12.2 — Five themes — pick any thread you like
- five group headers, one line each: "Validate my map" · "The real customer (Sharon)" · "Is this a real problem?" · "AI culture" · "The role (FDE)"
- [graphic: a compact 5-panel menu board — headers only, so the room can point at a thread]
- honest: keep group headers only — **no asserted Sagard facts (Unigestion / solutions / AUM) on the slide**
- *(speak, don't slide: the full wording of every question; "I'll ask these throughout, not just at the end")*

---

# Closing note — graphics & style (build the deck this way)

- **One idea per slide.** The title carries the point; the body is 2–4 anchor phrases. You speak the sentences.
- **One accent colour = "clickable to source."** Reserve a single bright colour for provenance / trace moments (the drawer, "one click from proof"). Everything else stays neutral so the accent means one thing.
- **The colour contract (don't cross-wire four meanings).** accent (one bright hue) = clickable-to-source *only*; **red = stop / refuse** — and pick a distinct "stop" red (or a black struck panel) so it never collides with the cockpit heat-map's red (= *worst peer*); **amber = human-review warning**; heat red→green = peer rank (real screenshots only). A refusal should read as a *stop*, not as "worst."
- **Sort = the message.** In any bar chart, order by the point you're making (best-to-worst peer heat, biggest change first). Don't sort alphabetically.
- **Label the point, not the axis.** Put the number on the dot that matters (NovaCloud $24.1M → $34.2M), not in a legend the room has to decode.
- **Refuse-to-compare is not a chart.** Draw it as a struck-out **"NOT COMPARABLE"** panel between the two bars — a refusal is a control, so it should look like a stop, not a comparison.
- **Provenance = a before/after freeze-frame.** Show the grid cell, then the same cell with the drawer open (file · raw label · confidence · exact source text). The "aha" is the click.
- **Use the real screens.** For the live demo, screenshot the actual cockpit (the load screen shows "24 / 24 in ~1s" — that number comes from the live run response, not a fixed label, so screenshot the real run and don't print "0.958 s" as a spec; plus the metrics grid, the Trend line, the provenance drawer, the four trust panels) — not mock-ups.
- **Honest register on every data slide.** "24 synthetic PDFs", "file-level today", "designed, not built", "prototype, not production" — put the caveat on the slide, small, so the graphic never over-claims.
- **Leave room for the visual.** If the body fills the slide, cut a phrase. The graphic is half the message.

---

## Notes (private — do NOT put on slides)

*Xavier's own delivery notes. None of this goes on a slide — it's how you carry the room.*

- **Intro (Slide 0.1) — the slide's POINT is understanding-first (the FDE job); in *delivery*, still open with the bio confidently, then the FDE motivation, then land the understanding-first pivot.** Say the "4+ years building AI in production, end-to-end, across voice/chat/email" line with your chest out — it's what *earns* you the right to say, later, "one method is not production-grade." Then the FDE motivation (unclear problem → reasonable assumptions → first useful version → reliable enough to ship → real-user feedback). Then **pivot to humility**: "…but here, most of my time went to learning your world, not coding." Confidence first tells Parinaz you've shipped real AI (so the honesty reads as expertise, not hedging); humility second tells Sharon you took *her* world seriously. It plants the **time bar** you land in §10 — no longer a fun fact. Keep "production-grade" tied to ProsperaLabs, **never** to Concord.

- **Hook (Slide 1.1) — open with ONE question (hook #6), don't stack.** The hook is *"When your deal partner and your valuations analyst open the same quarterly pack, they need opposite things from it — what if one clean, traceable data layer could serve both?"* Ask it and stop — do **not** read the five alternate hooks (they live in the `iii-1` prose as backups only). Note: the **"same 60%" thesis reveal is NOT the hook anymore** — it now lands in §4 (Slide 4.2) as the thesis reveal. The hook is a *question*; the thesis is a *picture*.

- **Live demo (Slide 7.1) — one title slide, run it live.** The demo is a single title card; you switch to the app. The three beats (pain → two proofs → trust spine) and the honesty caveats are **spoken, not printed.** Your scripts: `demo-honesty-script.md` (what to *say* vs. what the screen *shows*) + `cockpit-frontend-guide.md` (the click-path). Don't rebuild the beats as slides.

- **§8 is PRODUCT improvements only — SHOW 5, keep 2 backup.** Scaling / system design is **not** here — it lives in §9 and `iv-system-design-and-scaling.md`. Roster: **8.0 opener · 8.1 Group A readers · 8.2 Group C reading layer · 8.3 Group E currency · 8.4 Group G controls** are the SHOW slides; **8.5 Group B** and **8.6 Group F** are BACKUP (build them, promote live only if the room asks). **Group A is ONE slide** — the deep A0–A9 architecture is Q&A / whiteboard depth, never a slide. There is **no Group D** (subsumed by the redundant readers, Group A). The **A6 synthetic-warning demo is NOT built and NOT shown live** — describe it verbally only if Parinaz pushes. The PDF-crop / page-number sidebar (A5) is **future design** — never show a page number or crop in the live demo as if real.

- **§10 (Slide 10.1) is the TIME-ALLOCATION BAR, not the two-rounds fun fact.** The message: most of your time went to **understanding** their world — that's the FDE job. The **two-rounds speed-vs-precision story moved to §4** (Slide 4.4). The bar's percentages are your **own rough self-estimate** — say "roughly," never present them as a measured fact.

- **Final punch (Slide 11.2) — stage it, don't rush it.** After the **time bar**, **pause before the punch card comes up**. Let the room settle. Bring up the card and let the heart line *land* — read it slowly: "Made with love, with AI — but human-first on every decision." The line **"human-first on every decision" is your entire thesis in six words** — refuse-to-compare, provenance, humans-own-the-mark, all of it. Say "Thanks," and leave the card on screen through Q&A. Don't talk over it.

- **Section 12 ("My questions for THEM") still needs your review.** The two question slides (12.1 / 12.2) are drafted but **not yet finalized by you** — reread them the morning of, cut to the 3 you actually want, and make sure they match the room (Parinaz = AI rigor, Sharon = controls/reporting-ops).

- **System-design / scaling defense lives in a SEPARATE doc — not the slides.** The deep "how would you scale / architect this" material (Option 1 harden-in-place vs Option 2 cloud re-platform, the ensemble orchestrator, queues / retries / idempotency / dead-letter queue, partitioning, data-residency) lives in **`case-study/iv-system-design-and-scaling.md`** — your **Q&A / whiteboard** reference, kept off the deck on purpose so the slides stay clean. The recruiter flagged scalability as a focus of the round, so study that doc and pull from it live if they push on architecture. §8 is product-only; §9 points to `iv-…`.

- **Time-savings stay QUALITATIVE.** Sagard's real close duration hasn't been measured, so say **"often days" / "hours-to-days,"** never a fixed cycle time, and **turn it back to the room**: "how many hours does your team actually spend on this today?" (that turn-back is built into Slides 6.1 / 12.1). "Days" is fine as an illustration; it is not a measured fact.

- **Confidence range — LOCKED to 90.4%–99.5%.** If asked live, quote **only** this on-screen cockpit range — never also cite the audit-guardrail's ~84% floor, and never a third number. Standing caveats (say the caveat every time): recall **76%→90% on 24 *synthetic* PDFs**; the redundant ensemble + tiered consensus + human-review queue is **designed, not built**; provenance is **file-level**; currency is **flag / refuse, never convert**; refuse-to-compare **across asset classes is BUILT**, the intra-SaaS margin refusal is **roadmap**; every vendor accuracy figure is a **vendor claim**; reader independence is never total (agreement is strong evidence, not proof).
