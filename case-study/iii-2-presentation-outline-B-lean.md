# Document iii-2 — Presentation Outline **B: LEAN** (~35-minute running order)
### Sagard "Concord" — the tight version

> **What this is.** The same story as Version A, **re-ordered and trimmed to land in ~35 minutes + Q&A.**
> The big move: **the demo comes earlier** (energy + proof first), the assumptions are **compressed**, and
> the future-improvements are **curated to 4–6 for the talk** — the *full* detail of every section and every
> improvement lives in the sibling file `iii-1-presentation-outline-A-thorough.md`. Read this to *run* the
> talk; read Thorough to *prepare* and to *answer deep questions.*
>
> **Same room, same rules:** Parinaz (AI rigor) + Sharon (operations/controls, ex-compliance). Business-first,
> technical-on-demand. No invented numbers. Tool = **Concord**. Thesis: *"Same label ≠ same metric —
> comparability is the product, not extraction."*

---

## The running order (Version B — Lean)

| # | Section | ~Time | Why it's here |
|---|---|---|---|
| 1 | Intro + hook | 1 min | Grab both minds fast |
| 2 | The problem, made felt | 3 min | Sharon's painful quarter-close |
| 3 | Assumptions ("correct me") — compressed | 3–4 min | Show homework, invite correction — but quick |
| 4 | What Concord guarantees + the thesis | 2 min | The promise, in one breath |
| 5 | **LIVE DEMO** | 9–10 min | Proof early, told as a story |
| 6 | How it works, honestly (deterministic + trust) | 4–5 min | The "a bit technical" part — *after* they've seen it work |
| 7 | What AI automates vs not | 1.5 min | AI suggests, humans decide |
| 8 | Roadmap — curated (the reliable path) | 3–4 min | The redundant source-of-truth headline + a few more |
| 9 | How to scale | 1.5 min | Honest: not production-ready, here's the path |
| 10 | Fun fact | 1 min | Relax the room |
| 11 | Time saved + close | 1 min | Days → minutes; land the thesis |
| 12 | Q&A + my questions | rest | Validate the map; read the culture |

**Total ≈ 30–34 min of talking + Q&A** — and if the slot is ≤40 min, cut the roadmap (§8) to just the
headline to protect 10+ min of Q&A (where much of the grading happens). The two structural differences vs
Version A: **demo before how-it-works** (§5 before §6), and **assumptions compressed** (§3).

---

## 1. Intro + hook — 1 min

15 seconds of who you are, then **one** question. (Full 6 hook options + why each works → Thorough §1.)

> *"I'm Xavier — I build tools that sit close to the people who use them. One question to start:*
> **"Two of your portfolio companies both report a 60% 'gross margin.' One is a SaaS business, one is a
> lender. Should they ever sit in the same column?""**

*(Lean pick: hook #1 above — thesis in one breath. Alternate: #3, the "95%-accurate dashboard, would you put
it in front of your IC?" — disarms "just automate it." Keep "95%" clearly hypothetical.)*

---

## 2. The problem, made felt — 3 min

Lead with the pain, in Sharon's world. (Full version → Thorough §3.)

- It's week two after quarter-close. 20+ PDF packs land. An analyst opens each and **hand-keys** the numbers.
- **Four things go wrong, all provable from the real packs:**
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

## 3. Assumptions — "correct me" (compressed) — 3–4 min

**Say the framing:** *"Here's my mental model of your world — you live it, so stop me where I'm wrong."*
(Full PE money-flow, lifecycle, and all 5 personas in detail → Thorough §2.)

**How Sagard makes money (fluency, one breath):**
> *"LP → GP (Sagard) → portfolio company → exit → money back to LP. You earn two ways: a **~2% management
> fee** on committed capital that keeps the lights on, and **~20% carried interest** — the real upside — but
> only **after** LPs get their capital back plus a ~8% preferred return. That ordering is the waterfall.
> Between buying and selling there's no market price, so each quarter you **estimate** each company's value —
> 'the mark' — which rolls up into NAV. The mark is a judgment, and it's audited. My tool feeds its inputs; it
> never makes the mark."*
> *(One line on Sagard: multi-strategy — PE, credit, VC, real estate, wealth, plus a solutions arm — not a
> pure buyout shop. Re-verify the AUM / company-count figures on sagard.com the morning of.)*

**The 5 personas (a quick map — same pack, opposite jobs):**

| Persona | Wants | Posture |
|---|---|---|
| **Deal Partner** | A fast directional read ("on track vs plan?") | Speed |
| **Portfolio / Reporting Operations + Controls** *(Sharon)* | A comparable, source-traced, auditable view | **Comparability + control** ⬅ your customer |
| **Valuation Analyst** | Audit-ready numbers for the mark → NAV | Precision |
| **IR / LP-reporting** | External exactness (ILPA layout) | Precision (external) |
| **Risk / Credit** | The exactly-defined ratio; covenant early-warning | Precision + definitions |

> **Get this right:** Sharon's world is **controls + reporting operations** (reconciliation, audit trail,
> source-of-truth) — **not** "Value Creation" operating partners who improve the companies. Don't merge them.
>
> **Assumption to state:** a reporting-ops team owns this quarterly grind — one person, a team, or a vendor;
> *correct me.*

> **The tension (a great line):** *"The deal team wants speed; valuations, LP-reporting, and credit want an
> audited, reconciled number. The same messy PDF has to serve both — and a source-traced, refuse-when-unsure
> data layer is exactly what lets one tool do that."*

---

## 4. What Concord guarantees + the thesis — 2 min

> *"Concord loads every pack **offline in one click**, lines the numbers up so a comparison is only drawn when
> it's truly like-for-like, and lets you **click any number to see its source.** Two promises:*
> *1. **Comparability you can trust** — renamed labels stitched into one series, differently-defined metrics
>    **across asset classes refused**, units and basis handled before any comparison. When it isn't safe, the
>    tool **visibly refuses.***
> *2. **Traceability you can prove** — every number carries its source file, original label, and confidence;
>    one click shows the exact sentence. (File-level today; page-level is roadmap.)"*
>
> **The thesis:** *"Same label doesn't mean the same metric. Comparability is the product — not extraction.
> Concord would rather refuse a comparison than fake one."*

---

## 5. LIVE DEMO — 9–10 min (the proof, early)

Drive it as three beats (detail in `cockpit-frontend-guide.md`):

1. **The pain on screen:** load 24 packs **offline in ~1 second.** *"Nothing left the machine."*
2. **Two proof moments:**
   - **The hidden trend:** NovaCloud ARR looks like **one dot** to a naive tool → Concord stitches the renamed
     labels into **five quarters, $24.1M → $34.2M (+42%).** *"A silent blank is more dangerous than a loud
     error."*
   - **The refusal (a control):** a lender's 62% "gross margin" next to a SaaS 76% → Concord **refuses and
     says why** (interest margin ≠ delivery margin). *"A generic dashboard ranks these. Ours refuses — that
     refusal is a control."*
3. **The trust spine:** click **any** number → source file, raw label, confidence, exact sentence. *"Every
   claim is one click from proof — the audit trail."*

*Optional beats:* ClearPay $38.4M → $32.2M restatement; **LendBridge revenue $10.1M → $12.7M (+26%)** even
though its margin is refused; the four trust panels (Refused 5 · Exceptions 10 · Breadth 29 labels ·
Reconciliation 22/22 agree **+ 7 intra-doc conflicts auto-resolved**); ConstructIQ the laggard.

> **Own the caveats (say them before they ask):**
> - PeopleFlow's **GBP** flag is a **front-end rule** (the parser doesn't see the £).
> - Provenance is **file-level** (excerpt shown, no page number yet).
> - The raw missing-metric flag has a couple of **false positives** (CarbonTrack/TalentVault, cash/headcount)
>   suppressed on the grid — a roadmap fix.
> - The refusal handles the **cross-asset** case (lender vs SaaS); two SaaS margins on a silent, different
>   basis is a **flagged roadmap limit** — the SaaS heat colour is directional, not audited.
> - 22/22 reconciliation is a **second witness restating the same numbers** (confirmation, not independent
>   proof); the real work is the **7 in-document conflicts** it caught.
> - **LendBridge** is the one **credit** name — a deterministic classifier (loan-book / NIM / charge-off
>   fingerprint) tags it credit and **refuses to rank** its margin: the scope wall working, not a violation.

---

## 6. How it works, honestly — 4–5 min (*after* the demo)

**Why deterministic (the honest, maturity line):**
> *"For this demo I used a **single deterministic method**, on purpose — limited time, and fixed rules are
> cheap, fast, testable, auditable, and offline. But I'll be clear: **one method is not production-grade.** A
> single reader can be wrong and you'd never know."*

**Right-sized AI:** *"Rules for the bulk, AI only for the genuinely ambiguous tail, a human approves."* (For
Parinaz: cost-aware judgment. For Sharon: reliable + data stays local.) *(Full deterministic-vs-LLM table →
Thorough §4.2. The "ran out of Firecrawl credits → forced the auditable design" line is an optional footnote,
only if asked "why not an LLM?")*

**Can we trust it? — the reliable path (your best answer to "is the source-of-truth worthy?"):**
> *"You make one reader trustworthy by not relying on one reader — and to be clear, this is the reliable path
> I'd **build next**, not what today's demo runs: run **2–4 independent methods that fail in different ways**,
> and trust a number when they agree — with a small tolerance for rounding, and comparing *meaning* (metric +
> period + unit + basis + value), not raw text. When they disagree, the tool doesn't guess — it raises a
> **warning** and sends it to a **human**, with every method's answer side by side."*
> *"And it's **tiered**, not 'all must agree' — unanimous is the green bar, but 2-of-3 works **only when the
> agreeing readers are independent.** Count isn't enough; independence decides — two correlated readers can
> outvote the correct one."*

> **Why it lands for both:** Parinaz hears rigor (independent methods, not "three LLMs voting"; honest that
> independence is never total); Sharon hears **an automated four-eyes control with a full audit trail.**
> *"The thing that makes the numbers more correct is the same thing that gives you the control and the audit
> trail."* (Full ensemble + orchestrator + one worked example → Thorough §8 Group A.)

---

## 7. What AI can automate vs not — 1.5 min

> **The principle:** *"AI is probabilistic — a likely answer, not a certain one. So never let it **decide.**
> Let it do the heavy redundant work and make **suggestions with reasons** — a human makes every call that
> reaches a report."*

- **AI / rules (redundantly):** read the PDFs, pull raw numbers, stitch renamed labels, normalize **units +
  scale.** *(Different currency → **flag/refuse, don't convert.**)*
- **AI suggests → human confirms:** "these two labels might be the same"; "this number looks wrong."
- **Human only:** "is this right enough for a report?"; the valuation mark; the LP figure; the IC call.
- **AI suggests with reasons (never a verdict):** *"this company looks healthy because (i),(ii),(iii)."*

---

## 8. Roadmap — curated for the talk — 3–4 min

Lead with the headline, then name 2–3 more, then point to the full menu. *(All improvements, fully detailed →
Thorough §8, Groups A–G.)*

**① The headline — trust the source-of-truth (redundant consensus).** Already covered in §6 — restate it as
*the* next build: the ensemble + orchestrator + a **warning signal** in the UI. *"I can even show you: I'd
inject one synthetic disagreement into this cockpit so you'd see the ⚠ and click it to see every method's
answer, marked 'sent to human review.'"* *(Build TODO + the honest 'synthetic, additive, offline' framing →
Thorough §8 A6.)*

**② The reading layer (LLM summaries).** An LLM reads a company's clean time series and **suggests** a story
(*"NovaCloud is compounding — but cash is shrinking; confirm the funding plan"*). A **suggestion**, not a
verdict; a human refutes/comments, and next quarter the AI reads those comments first. It reads **over
already-clean, provenance-tagged numbers**, so it can't inject a wrong figure. *(Per-company + overall-book
examples → Thorough §8 Group C.)*

**③ Intake + change-tracking + alerts.** Connect to the **cloud folder the team already uses** (Azhar's idea
— start there; an audited upload portal, an email inbox, or SFTP are documented alternatives, §8 F1);
**fingerprint each file (hash)** so a *new* file runs and a *corrected* file re-runs, an *unchanged* one is
skipped; **alert** Slack/Teams/Email when a company looks worse — but the alert is a **heads-up, never a
verdict**, and a human verifies the source before anyone acts. *(Intake options + hashing + alert guardrails →
Thorough §8 Group F.)*

**④ Controls + audit (for Sharon).** Auth + permissions + a **maker-checker** correction workflow: values are
never overwritten, every change is logged (who/what/when/why), and it's exportable for an auditor. *(Full role
model → Thorough §8 Group G.)*

> **The rest of the menu (name in one line, detail in Thorough):** smarter label-drift matching (fuzzy /
> embedding / constrained-LLM — all suggest-only, §8 D); real currency handling (capture the symbol, convert
> *levels* only with a dated rate, never percentages, §8 E); more %-change-over-time views like the in-cell
> trend (§8 B1); richer timeline views (§8 B2); a **PDF-crop screenshot** of the metric in the review sidebar
> (future design, §8 A5); download + email a signed-off report (§8 F4).

---

## 9. How to scale — 1.5 min (honest)

> *"Concord is a **prototype, not production** — offline, in-memory, one method, no login. The 76%→90% recall
> is real but on **24 synthetic PDFs** (recall = captured ÷ the **128 numbers printed** in the packs; the jump
> was a **parser fix**, not a changed test). Here's the honest path:"*

- **Option 1 — Harden in place (recommended first):** keep the engine; add a durable store, a job queue with
  retries, and the **redundant-extraction ensemble**; stay offline; measure recall continuously. *Low risk,
  weeks, keeps data in-house.*
- **Option 2 — Cloud re-platform (the destination):** event-driven, multi-tenant, auto-scales for quarter-end
  bursts. *Highest ceiling, but months of work and **data leaves on-prem** — a real compliance question.*

> *"Do Option 1 first; treat Option 2 as the destination — and only after the data-residency question is
> answered."* (Full trade-off table → Thorough §9.)

---

## 10. Fun fact — 1 min

> *"Where did my time actually go? The **least** of it was building the tool. Most went to **learning your
> world** — what Sagard does, how a PE firm makes money, the vocabulary, and what this could *really* solve.
> Fun contrast: my first take-home solved the **deal partner's** need — scrape a company off the web → a Slack
> signal, all **speed over precision** to keep a deal moving. This round, **operations needs the opposite:
> precision** — a number you'd sign your name to. Same builder, two opposite trust postures. Realizing *that*
> — not writing the parser — was the real work."*

---

## 11. Time saved + close — 1 min (qualitative only)

> *"Today the quarter-close is **days** of re-keying before anyone sees the portfolio. Concord makes it **one
> click** to a comparable, source-traced view — so the team spends time on judgment, not typing. But the real
> win isn't the hours: it's that the comparison is **trustworthy** and every number is **one click from
> proof.** A wrong number caught before it reaches an investment committee is worth more than any typing
> saved."*
>
> **Close on the thesis:** *"Comparability is the product, not extraction — Concord would rather refuse a
> comparison than fake one."*

*(If asked for a number: turn it back — "how many hours does your team spend on this today?" Never fabricate
one.)*

---

## 12. Q&A + my questions for them

Ask these **throughout** Q&A (full set + "if you only ask three" → Thorough §12):
- **B1 (the customer):** *"Who actually owns the quarterly hand-keying today — one person, a team, a vendor?
  How many companies × packs per quarter?"*
- **D2 (the culture, the one you most want):** *"Is Sagard trying to be **AI-first but human-decision-driven**
  across every team — or is AI mostly owned by the AI/engineering group and the business teams consume it?"*
- **E1 (the scorecard):** *"Six months in, what did a **successful** Forward Deployed Engineer here actually
  *do* that the firm valued?"*
- Plus the "correct me" validators: *"Did I get how Sagard makes money right?"* and *"Is portfolio-company
  monitoring the right place to start, or is the sharper pain elsewhere?"*
- **(from Thorough §12, if there's time):** what breaks their trust first, whether this is genuinely worth
  solving, and whether your Operations-team assumptions hold.

---

### Honesty guardrails (same as Thorough — quick reminder before the room)
- Currency: **flag/refuse, never convert**; PeopleFlow GBP is a **front-end rule**.
- Provenance is **file-level**; the PDF-screenshot sidebar is **future design** — don't show a page/crop live
  as if real.
- Consensus is **tiered** ("2-of-3 with independence"), not "all must agree"; independence is never total.
- **Deterministic because of limited time; one method isn't production-grade** — keep that honest register.
- **No invented ROI.** Recall = **76%→90%, 0 wrong values, 0 *sector-blind* false alarms**, on **24 synthetic
  PDFs** (say "synthetic"; **don't say "0 false alarms" unqualified** — the raw missing-metric flag has a
  couple of false positives, CarbonTrack/TalentVault, suppressed on the grid). Hook #3's "95%" is
  hypothetical.
- Re-verify Sagard's public figures (AUM, company count, staff, "$100B by 2029", Unigestion) on sagard.com the
  morning of.
