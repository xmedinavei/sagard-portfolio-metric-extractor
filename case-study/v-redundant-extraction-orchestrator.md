# Document v — Redundant Extraction with a Human in the Loop
### Concord — a future expansion: three independent AI readers, an orchestrator, and a person who has the final say

> **Status: FUTURE EXPANSION — NOT BUILT.** Today Concord reads every number with **one** method. This
> document describes an improvement we would build **later**: read each document with **three independent
> AI extractors** at the same time, have a small **orchestrator** cross-check them, and — whenever they
> **disagree** — send that one number to a **human** who validates or corrects it in the screen, with the
> **real PDF on view**. Nothing here is built. There is **no code** in this document on purpose — it is a
> design to present and discuss, not an implementation.

---

## The idea in one sentence

> **One reader can be *silently* wrong and no one notices. So don't trust one.** Read every document with
> **three different AI extractors**, let a small **orchestrator** compare their answers, **auto-accept only
> what they independently agree on**, and send every disagreement to a **person** — who decides with the
> real page in front of them. The disagreement *is* the alarm, and the human is the safety net.

## Why this document exists

Two people in the room may ask *"and how would you make this trustworthy at scale?"*:

- **Parinaz (Head of AI)** — will test the **rigor**: *why three readers, not one? why AI readers that can
  all be wrong the same way? what is actually measured?* This document answers her honestly: agreement
  between AI readers is **strong evidence, not proof**, which is exactly why a person stays in the loop.
- **Sharon (Head of Operations, ex-Chief Compliance Officer)** — will test the **control**: *who approves a
  number? is there an audit trail? can a wrong number slip through?* This document answers her with a
  **four-eyes review** built into the screen and a full record of every correction.

## The honesty rules (these govern every claim here)

1. **Future, not built.** The three-reader ensemble, the orchestrator, and the human-review screen do
   **not** exist yet. No "auto-accept rate" can be quoted until it runs on real documents.
2. **"Independent" is never total.** All three readers are AI, so they can be fooled the same way by the
   same ugly page. Their agreement is **strong evidence, not proof** — which is why the human decides on
   every disagreement, and why we pick **different** AI engines to reduce shared blind spots.
3. **Vendor accuracy numbers are the vendor's own claim.** Any "~99% accurate" figure is marketing until we
   re-measure it on *your* documents.
4. **The PDF screenshot is part of this future.** Today Concord's proof-of-source is **file-level** (which
   file, which label, the exact text). Showing a **picture of the page** in the review screen is a new
   capability that comes *with* this expansion.

## How to read this document

| § | Section | The point |
|---|---|---|
| ★ | **The architecture in one picture** | **The whole design in one diagram — start here** |
| 1 | The idea, and the three AI readers at a glance | The 30-second version |
| 2 | The three independent AI readers | Firecrawl · vision-LLM · OCR / document-AI — and why a *mix* |
| 3 | The orchestrator | How it cross-checks, and when it raises a warning |
| 4 | **The human in the loop** | **Review and correct in the sidebar, with the real PDF — the headline** |
| 5 | A worked example — ClearPay spendable cash | The design catching a real trap |
| 6 | A staged rollout | How we'd introduce it safely |
| 7 | Cost and speed | So no one thinks it is slow or expensive |
| 8 | Honesty guardrails + anticipated questions | What to say, and what never to over-claim |
| 9 | One-page summary | The whole idea on one screen |

> **Plain-language note.** This document keeps a few important terms (reader, orchestrator, consensus,
> tolerance) but explains each in simple words the first time it appears. It is written to be **presented
> and defended**, not filed away.

---

## The architecture in one picture

**Read this first.** It is the whole design on one screen. A document comes in at the top; three AI readers read it at the same time; a referee (the orchestrator) compares them; whatever they agree on is auto-accepted; whatever they disagree on goes to a person with the real PDF in front of them. Sections 1–9 are just a closer look at each part of this one picture.

```
                  ┌─────────────────────────────────────────────┐
                  │           ONE QUARTERLY PDF PACK            │
                  │         (a company's report — e.g.          │
                  │             ClearPay, Q2 2025)              │
                  └──────────────────────┬──────────────────────┘
                                         │
                the SAME page is read THREE ways, at the SAME time
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           ▼                             ▼                             ▼
  ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
  │    READER 1     │           │    READER 2     │           │    READER 3     │
  │    Firecrawl    │           │   Vision-LLM    │           │  OCR / Doc-AI   │
  │   (AI parser)   │           │ (reads meaning) │           │ (reads letters) │
  └────────┬────────┘           └────────┬────────┘           └────────┬────────┘
           │                             │                             │
           └─────────────────────────────┼─────────────────────────────┘
                                         ▼
                  ┌─────────────────────────────────────────────┐
                  │                ORCHESTRATOR                 │
                  │             (the referee step)              │
                  │                                             │
                  │          1) line up the SAME fact:          │
                  │  company · metric · period · unit · basis   │
                  │      2) are the numbers CLOSE ENOUGH?       │
                  │    rounding = ok   ·   a 10x gap = never    │
                  └──────────────────────┬──────────────────────┘
                                         │
                           ┌─────────────┴─────────────┐
                           ▼                           ▼
                ┌─────────────────────┐     ┌─────────────────────┐
                │     THEY AGREE      │     │    THEY DISAGREE    │
                │   (numbers match)   │     │    (a real gap)     │
                │                     │     │                     │
                │   -> AUTO-ACCEPT    │     │ -> SEND TO A HUMAN  │
                └──────────┬──────────┘     └──────────┬──────────┘
                           │                           │
                           │                           ▼
                           │   ┌───────────────────────────────────────────────┐
                           │   │          HUMAN REVIEW — the sidebar           │
                           │   │  - every reader's answer, side by side        │
                           │   │  - a SCREENSHOT of the real PDF line          │
                           │   │  - [ Validate ]   or   [ Correct... ]         │
                           │   │  - a DIFFERENT person approves (four-eyes)    │
                           │   └───────────────────────┬───────────────────────┘
                           │                           │
                           │                    saved: old -> new -> who -> when -> why
                           │                    the fix TEACHES the readers (feedback)
                           │                           │
                           └─────────────┬─────────────┘
                                         ▼
                  ┌─────────────────────────────────────────────┐
                  │     ONE TRUSTED NUMBER  ->  the cockpit     │
                  │    (still traceable to its exact source)    │
                  └─────────────────────────────────────────────┘
```

**How to read it (legend):**

- **▼ and the lines** — the number flows this way, top to bottom.
- **Three readers, one page** — the same document is read three different ways *at the same time*, not one after another.
- **AGREE (left path)** — the readers match, so the number is trusted automatically.
- **DISAGREE (right path)** — they clash, so a **warning** is raised and a **person** decides.
- **four-eyes** — the person who ran it cannot approve their own fix; a *different* person signs off.
- **feedback** — every human correction is saved and used to make the readers better next time.

**The same picture in seven plain steps:**

1. **A document arrives** — one company's quarterly PDF pack.
2. **Three AI readers read it at once** — Firecrawl (a parser), a vision-LLM (reads meaning), and OCR / document-AI (reads letters). Three *different* engines, so they tend to make *different* mistakes.
3. **Each reader gives its own answer** for every number — with how sure it is and the exact text it read.
4. **The orchestrator lines them up on the same fact** — same company, metric, period, unit, and basis — and asks one question: are the numbers *close enough*?
5. **If they agree → auto-accept.** The number is trusted and flows straight to the cockpit.
6. **If they disagree → a warning → a human.** The number opens in the **sidebar**, showing all three answers side by side *and a screenshot of the real PDF*, so a person validates or corrects it — with a second person approving.
7. **One trusted number lands in the cockpit** — and every correction quietly teaches the readers to do better next time.

> **The ClearPay example, on this picture.** Reader 1 and Reader 3 both report **$32.2M** spendable cash (they saw the "$6.2M restricted client float" note); Reader 2 reports **$38.4M** (it missed the note). That is the **DISAGREE** path — the warning opens the sidebar with all three answers and the PDF crop, and the human confirms **$32.2M**. The one silent mistake is caught on purpose.

**The honest limit, shown by the picture.** All three readers are AI, so they can share the same blind spot and be wrong together — their agreement is **strong evidence, not proof**. That is exactly why the **DISAGREE** path ends at a *person*, not at the machine. The human is the safety net by design.

---

## 1. The idea, and the three AI readers at a glance

**The problem (two sentences).** Today Concord reads each number with ONE method — one "reader" (one automatic way of pulling a number off the page). When that single reader is wrong, it is *silently* wrong: it prints a clean-looking number with no signal that anything went astray, so a $34M can quietly become $3.4M and nobody is warned.

**The fix.** Read every document with THREE independent AI extractors ("readers") at the same time. A small **orchestrator** — a comparing step, think of it as a referee — puts the three answers for the same number side by side. Where the readers AGREE, the number is auto-accepted (high trust). Where any reader DISAGREES, the system raises a **WARNING** and sends that ONE number to a HUMAN, who decides with the real PDF on screen.

**The whole system in one line:**

PDF -> [ Reader A (Firecrawl) | Reader B (vision-LLM) | Reader C (OCR / document-AI) ] -> Orchestrator compares -> agree = VALIDATED (auto-accept) / disagree = WARNING -> human review with the real PDF

**The three readers at a glance.** All three are AI, on purpose. Different engines fail on different pages, so when they agree that agreement carries weight. (If we ran three copies of the SAME model, they would share the same blind spots and be "wrong the same way" — their agreement would mean nothing.)

| Reader | What it is (in a few words) |
|---|---|
| Firecrawl | AI service that turns a PDF into clean structured data |
| Vision-LLM | A model that looks at the page image and reads meaning |
| OCR / document-AI | Trained character + table reader, precise on numbers |

**The honest limit.** Because all three readers are AI, they are LESS independent than a mix that also had a rules-based reader — an ugly page can still fool all three at once. So agreement here is STRONG EVIDENCE, not proof. The real safety net is the HUMAN, who decides every case the readers disagree on. We lower the shared-blind-spot risk by choosing different vendors and different designs.

**One honest line on today.** Today's single method is rules-based (fixed instructions); this expansion makes the reading AI-powered, cross-checked by three engines, and human-verified where they disagree.

**Status: FUTURE — a design to present, not something built yet.** We will not quote how often the readers agree until it has actually run on real documents.

---

## 2. The three independent AI readers

Concord today reads each number with ONE method, and that method is rules-based (it follows fixed instructions). This future design keeps a safety net but changes the reading. It uses **three independent AI readers** at the same time. A "reader" here means one AI tool that looks at a document and pulls out the numbers. "Independent" means each reader works in its own way and is built by a different maker, so they do not simply copy each other.

Here are the three readers. All three are AI. None of them is the old rules-based method.

| Reader | How it reads | What it is good at | How it FAILS | Example engines |
|---|---|---|---|---|
| **(i) Firecrawl** — an AI document-parsing service (the very tool Concord actually started with) | Turns a PDF into clean, structured text and tables using its own models | Structure and clean extraction at scale; keeps rows and columns lined up on normal pages | Can flatten or misalign an unusual table layout; it depends on how its own model behaves | Firecrawl |
| **(ii) Vision-LLM** — a large AI model that LOOKS AT the page image | Reads the page the way a person would and understands MEANING — a renamed label, a footnote, the context around a number | Catches meaning a plain parser misses (for example, a label that changed wording but means the same thing) | Fails **silently**: it can print a number that looks perfectly reasonable but is simply WRONG (a "hallucination" — a confident guess presented as fact) | Claude, GPT, Gemini (vision) |
| **(iii) OCR / Document-AI** — trained character- and table-reading models | Reads the exact characters and cells off the page, including scanned pages | Precise on characters and numbers; strong on scans and dense tables | Fails **quietly**: can drift on odd layouts; it reads the characters without understanding what they mean | Azure Document Intelligence, AWS Textract, Reducto, Nanonets |

One honest note on vendor claims: some of these tools advertise very high accuracy (for example, Reducto's "~99%"). That figure is the **vendor's own claim**, not a number we measured independently. We treat it as marketing, not proof.

### Why a MIX of three, not three copies of one

The value of running three readers only exists if they are genuinely different.

- **Three copies of the same model share the same blind spots.** If a page fools that model, all three copies get fooled in the exact same way — they would be "confidently wrong the same way." This is called **correlated failure** (their mistakes line up instead of cancelling out). When they all agree because they all failed identically, that agreement is worthless.
- **Three DIFFERENT engines fail on different pages.** A structured parser, an image-reasoning model, and a character/table OCR model are built differently and stumble on different things. So when they land on the SAME number, that agreement actually means something — the random mistakes tend to cancel out. (One caution: only truly independent readers help this way, and adding a WEAK reader can even hurt.)

The **honest limit:** all three are still AI. That makes them less independent than a mix that also included a rules-based reader. A single ugly, badly-formatted page can fool all three at once. So in this design:

- Agreement is **strong evidence, not proof.**
- The **human is the real safety net** — a person decides every case where the readers disagree (see sections 3 and 4).
- We deliberately pick **different vendors and different architectures** (different makers, different internal designs) to reduce the chance they share the same blind spot.

### One practical note: where the data goes

Firecrawl, hosted vision-LLMs, and cloud OCR services mostly send the page **off the machine** to run. For clients with strict data-residency rules (data must stay in-house), that is a real concern. An **on-prem / offline variant** — the same idea with locally-run readers — is possible, trading some accuracy on the hardest pages for keeping every page inside the building. This is covered in sections 6 and 7.

---

## 3. The orchestrator — how it cross-checks, and when it raises a warning

The **orchestrator** is a small coordinator — the quiet piece in the middle. It runs the three AI readers on the same document, waits for their answers, and then compares those answers one number at a time. It does not read the PDF itself. Its only job is to ask: *do the readers agree, and how much can I trust that agreement?*

Today, Concord reads each number with a single method. The orchestrator and its three AI readers are the future expansion described here — a design to present, not something built yet.

### It compares readers on the same fact, not on raw text

This is the most important idea in this section. The orchestrator does **not** line up raw text and hunt for matching words. It compares readers on the same **fact** — one precise thing a document says. We pin a fact down with five parts:

| Part of a fact | Plain meaning | Example |
|---|---|---|
| Company | Which business the number is about | ClearPay |
| Metric | What is being measured | Cash balance |
| Time period | Which quarter or year | Q2 2025 |
| Unit | The scale and currency | US dollars |
| Basis | *What kind* of number it really is | Reported cash, not adjusted |

So a full fact reads like: **"ClearPay, cash balance, Q2 2025, US dollars."** Two readers are only "talking about the same thing" when all five parts match. Only then does comparing their numbers make sense. This stops the orchestrator from comparing apples with oranges.

### "Close enough" — tolerance, in plain words

Even on the same fact, two readers rarely print the exact same digits. One may round; another may carry a decimal. So the orchestrator does not demand a perfect match. It asks whether the two numbers are **close enough**. This allowed gap is called the **tolerance**, and it is *family-aware* — the rule depends on the kind of number:

| Kind of number | How close is "close enough" |
|---|---|
| Money (revenue, cash, ARR) | A rounding whisker — a small fraction of a percent |
| Percentage (a margin, a growth rate) | About a tenth of a percentage point |
| Headcount (people, customers) | Must match **exactly** — no gap allowed |
| A 10x gap (e.g. $3.4M read as $34M) | **Never** close enough — always a warning |

That last row is the whole reason this design exists. Mistaking $3.4M for $34M is the classic **silent error** — a wrong number that looks perfectly reasonable and slips through unnoticed. The orchestrator is built to never wave that gap through.

### Basis: same number, different meaning, still not a match

Two readers can print the very same digits and still **not** agree — because the numbers mean different things. This is the **basis** check.

Take LendBridge. Its pack shows a "gross margin" of 58–62%. But LendBridge is a lender, so that figure is really an **interest margin** — the spread between what it earns on loans and what it pays for funds. That is a different kind of number from a software company's gross margin. So even if two readers both confidently print "62", the orchestrator sees *different basis = different fact* and records them as **not in agreement**.

This is Concord's existing "refuse to compare unlike things" rule — the same rule the tool already uses today — lifted up to the reader-vote level. Matching digits are never enough; the *kind* of number must match too.

### The tiered outcome

The orchestrator does not give a plain yes/no. It sorts every fact into one of four tiers, from most trusted to least. The colours follow the same traffic-light idea used elsewhere in Concord.

| What the readers did | Outcome | Colour | What happens |
|---|---|---|---|
| **All three agree** (same fact, close enough) | Validated | Green | Auto-accept — highest trust |
| **An independent majority agrees**, the odd one out is the weaker reader | Validated with a note | Green | Auto-accept — the disagreement is recorded, never hidden |
| **A real split**, or the *most-trusted* reader is the one that differs | Warning | Amber | Sent to a human to review |
| **Too few readers found it** (only one read the number at all) | Unresolved | Grey | Sent to a human to review |

Two tiers auto-accept (green). Two tiers go to a person (amber and grey). The design leans toward calling a human whenever the evidence is thin or split — it would rather ask than guess.

### Why it works — and its honest limit

The logic is simple: three *different* AI engines make *different* random mistakes, so when they land on the same number that agreement carries real information. Independent mistakes tend to cancel out.

But this only holds **if the readers are truly independent**. Two honest points:

- If the readers shared the same blind spot, they could all be **wrong in the same way** — and their agreement would mean nothing. We reduce this by choosing three different engines (a structured parser, an image-reasoning model, and an OCR/table model), not three copies of one.
- Adding a **weak** reader can actually *hurt* — a poor third vote can drag a good pair toward a wrong answer. More readers is not automatically better; the *quality and independence* of each reader is what counts.

Because all three readers are AI, they are never perfectly independent. So in this design, agreement is **strong evidence, not proof** — and the human who reviews every warning is the real safety net, not the vote count.

One last honesty note: we **cannot** quote an auto-accept rate — how often the three agree with no human needed — until this runs on real documents. That first honest number is something the rollout produces, not something we promise up front.

---

## 4. The human in the loop — review and correct in the sidebar, with the real PDF

This is the heart of the design. The three AI readers make the machine more careful, but they can still all be fooled by the same ugly page. So the machine is **not** the final judge. When the readers disagree, a **person** decides. This section describes exactly what that person sees and does.

One reminder first. A "warning" is what the orchestrator (the small step that compares the readers) raises when the readers do not agree on a number. Every warning becomes one small task for a human.

### 4.1 How the number reaches a person

Concord already has a simple behaviour today: you **click a metric and a sidebar opens** (a panel that slides in from the side of the screen). Today that sidebar shows where the number came from — the file, the original label, and the exact snippet of text.

This expansion **reuses that same sidebar** and adds more to it. Nothing new to learn. When the orchestrator raises a warning, that one number is placed in a short review queue (a simple to-do list of flagged numbers). A reviewer opens the number, and the familiar sidebar appears — now showing everything needed to settle the disagreement in one place.

The flow, in one line:

warning raised -> number goes to the review queue -> reviewer opens it -> sidebar shows all readers + the real PDF -> reviewer validates or corrects -> saved with a full record

### 4.2 What the human sees — a labelled sidebar

For a flagged number, the sidebar shows every reader's answer **side by side**. Each row gives that reader's value, how sure it was (its confidence), and the exact piece of text it read. Below that sits a picture of the real page, and then two simple buttons.

Here is the sidebar for the ClearPay cash example (explained in full in section 5):

| Sidebar row | What it shows |
|---|---|
| **Flagged fact** | ClearPay — spendable cash — Q2 2025 — US dollars |
| **Reader A (Firecrawl, structured parser)** | **$32.2M** · high confidence · read: "…net of $6.2M held in segregated client float" |
| **Reader B (OCR / document-AI)** | **$32.2M** · high confidence · read: "Cash & Restricted Cash $38.4M / $6.2M segregated" |
| **Reader C (vision model)** | **$38.4M** · medium confidence · read: "Cash & Restricted Cash … $38.4M" (missed the restriction note) |
| **Why flagged** | Readers split: $32.2M vs $38.4M. A $6.2M gap is far larger than a rounding whisker, so it goes to a human. |
| **PDF view** | a screenshot / crop of the actual ClearPay cash line, taken straight from the pack |
| **Actions** | Validate $32.2M — or — Correct… — plus a short "why" note |

Reading top to bottom, the person can:

1. **Compare the readers at a glance.** Two say $32.2M, one says $38.4M. The odd one out even shows why it is wrong — it read only "$38.4M" and never saw the "$6.2M segregated" note.
2. **Check against the real source.** The PDF crop sits right there, so the reviewer looks at the actual page instead of trusting any reader on faith.
3. **Decide.** Click **Validate** to confirm the value the readers mostly agree on, or **Correct…** to type or pick the right value if none of them got it right. A short "why" note can be added.

The reviewer's job is small and focused: one number, all the evidence in front of them, a picture of the truth beside it. That is deliberately fast.

### 4.3 The control layer (for Sharon) — four-eyes, audit trail, feedback

A review tool that lets one person change numbers freely is not a control. Two rules turn it into one.

**Four-eyes (maker-checker).** "Four-eyes" means two pairs of eyes must see a change before it counts. The person who **ran** the extraction cannot **approve** their own correction. A **different** person confirms it. This is the same separation an accountant or auditor expects: the maker proposes, a separate checker approves.

**Full audit trail.** Every correction is saved as a permanent record — not just the new number, but the whole story of the change:

| Recorded for every correction | Example |
|---|---|
| Old value → new value | $38.4M → $32.2M |
| Who made the change | reviewer name |
| Who approved it (the second pair of eyes) | approver name |
| When | date and time |
| Why | "excludes $6.2M restricted client float" |

Because nothing is overwritten silently, an auditor or an LP (a fund investor) can later ask "why is this number what it is?" and get a clear, dated, named answer. The trail holds up to challenge.

**Corrections feed back.** Each human decision is also a teaching signal. Over time, the numbers people confirm and fix are used to improve the readers, so the machine gets better at the exact places it tends to slip. The human is not just fixing one number — they are training the system.

### 4.4 Why this matters — for both people in the room

- **For Sharon (operations / controls):** this is a real four-eyes control with a named, dated, reasoned audit trail. It is the kind of evidence an auditor or LP can push on, and it does not fall over. Who approved it, when, and why are all on the record.
- **For Parinaz (AI rigor):** this is the honest answer to "AI readers are not perfect." Because all three readers are AI, their agreement is **strong evidence, not proof** — they can share the same blind spot. So the design puts a human exactly where the machine is unsure. The vote narrows the work down to the few numbers in doubt; the person makes the final call. The safety net is a human, by design, not a hopeful assumption about the AI.

### 4.5 Honesty note — what is real today vs. new here

To be exact about the state of things:

- **Real today:** proof-of-source at the **file level** — for any number, Concord already shows which file it came from, the original label on the page, the exact text snippet, and a confidence figure.
- **New with this expansion:** the **PDF screenshot / pointing at the exact spot on the page**, the **side-by-side view of multiple readers**, and the **validate / correct with four-eyes approval** workflow. The picture-of-the-page capability is part of this future design — it is **not** something Concord shows live today, and we do not present it as if it were.

---

## 5. A worked example — ClearPay spendable cash

Let us follow ONE number from the page all the way to a final, trusted answer. This is the clearest way to see the whole design working together.

Note up front: this design is future, not built. Concord today reads each number with ONE method. This example shows how three AI readers plus a human would handle the same page.

### The trap on the page

ClearPay's report shows a cash line:

- "Cash & Restricted Cash ... **$38.4M**"

But a little further down, a companion line says:

- "**$6.2M** held in segregated client float"

"Segregated client float" means money that ClearPay holds but legally **cannot spend** — it belongs to clients. So the number that actually matters — the **spendable cash** — is not $38.4M. It is:

**$38.4M − $6.2M = $32.2M spendable.**

A single reader that only sees the big number, and misses the small companion line, will report $38.4M and be **silently wrong** by more than $6M. That is exactly the kind of quiet mistake this design is built to catch.

### The story, step by step

1. **Three readers read the same page at the same time.** (A "reader" is one AI method that reads the document on its own.) Reader A is Firecrawl, a service that turns a PDF into clean structured text. Reader B is the OCR / document-AI reader, which does precise character and table reading. Reader C is the vision-LLM, a model that looks at the page image and reads meaning. All three are AI methods.

2. **Two readers catch the restriction.** Reader A (Firecrawl) and Reader B (OCR / document-AI) both pick up the "$6.2M segregated" companion line and both report the correct spendable figure: **$32.2M**.

3. **One reader misses it.** Reader C (vision-LLM) reads the headline cash line but does not connect the restriction. It reports **$38.4M**.

4. **The orchestrator compares them on the same fact.** (The "orchestrator" is the small referee that lines up the readers' answers for the same number.) It is looking at one fact: *ClearPay, spendable cash, this period, US dollars.* Two readers say $32.2M; one says $38.4M. The gap between $38.4M and $32.2M is far more than a rounding whisker (a tiny fraction-of-a-percent difference) — it is a real, material split.

5. **The orchestrator raises a WARNING (amber).** It does NOT quietly pick a winner by vote. Because the disagreement lands on exactly the number that matters, it flags this one number for a person.

6. **The number goes to the human-review sidebar.** A reviewer opens the flagged number and sees, side by side: all three readers' values, each reader's confidence, and the exact text snippet each one used — plus a **screenshot / crop of the real ClearPay cash line** on the page.

7. **The human decides.** Looking at the actual PDF region next to the three answers, the reviewer confirms **$32.2M** is correct and corrects Reader C's $38.4M.

8. **The decision is saved with a full audit trail.** Old value → new value → who approved → when → why. Under the four-eyes rule (a control meaning two different people must be involved), the person who ran the extraction cannot approve their own correction — a different person signs off.

### Before / after, at a glance

| Reader | Value reported | Caught the $6.2M restriction? | Outcome |
|---|---|---|---|
| A — Firecrawl (parser) | $32.2M | Yes | Agrees on the correct fact |
| B — OCR / document-AI | $32.2M | Yes | Agrees on the correct fact |
| C — Vision-LLM | $38.4M | No | The outlier → triggers the WARNING |
| **Orchestrator** | — | — | Real split on the number that matters → **amber WARNING** |
| **Human reviewer** | **$32.2M (confirmed)** | Yes | Validates $32.2M, corrects Reader C, saves audit trail |

### The lesson

The system catches — **on purpose** — the one mistake a single naive reader makes silently. No number was quietly out-voted. A disagreement on a material figure became a warning, and a person made the final call with the real page in front of them. The three readers are all AI, so their agreement is strong evidence, not proof; the human is the real safety net.

### Honest note

Concord **already** computes the $32.2M today, with its current single method — so the number itself is real today, not invented for this example. What is **new** in this expansion is the three-reader **cross-check** (three independent AI readers reading the same page and being compared) and the **human validation with the PDF on screen**. Today's proof-of-source is file-level (which file, the original label, the exact snippet); the on-page screenshot that points at the exact cash line is a new capability that arrives with this design.

---

## 6. A staged rollout — how we would introduce it safely

This is a future design, not something built today. So the safest way to introduce it is in slow, careful steps. Each step earns trust before the next one begins.

The guiding principle is simple: **measure agreement before trusting it.** We do not claim the three readers agree often until we have watched them read your real documents. And we never quote an "auto-accept rate" — how often the system can accept a number without a person checking it — until it has actually run on your files. A number invented before the system runs would be a guess, and a guess is not a control.

A quick reminder of the words. A "reader" is one AI method that reads a number off the page. The three readers are all AI, and each works a different way: a structured parser (Firecrawl, an AI service that turns a PDF into clean, structured data), a vision model (a large AI model that looks at the page image and reads meaning), and an OCR / document-AI engine (an AI trained to read characters and tables precisely). (Today's single method is rules-based; this expansion is the AI-powered future.) The "orchestrator" is the small referee that compares the readers' answers on the same fact.

### The three stages

| Stage | What we turn on | What users see | What we learn |
|---|---|---|---|
| **1. Watch quietly** | The three AI readers run *alongside* today's tool, on the same documents. The orchestrator compares them in the background. | Nothing changes. The product looks and behaves exactly as it does today. | The first *honest* agreement number: on real documents, how often do the three readers land on the same fact — and where do they split? |
| **2. Flag and involve a person** | The warning flags and the human-review sidebar go live. When readers disagree on a number, that one number is queued for a person, who sees all three answers side by side plus a picture of the real PDF region. | A new "needs review" signal on disagreed numbers, and the review sidebar. Agreed numbers flow through as before. | Whether the flags point at the *right* numbers, how long a review takes, and how often the person confirms versus corrects. |
| **3. Keep it in-building (optional)** | A local, offline version where the readers run on the client's own machines, so no page ever leaves the building. | The same experience — but for clients with strict data-residency rules, nothing is sent to an outside service. | Whether local readers are accurate enough for that client, trading some accuracy on the hardest pages for zero data leaving the building. |

### Why this order

- **Stage 1 costs the user nothing and risks nothing** — it only observes. It turns the promise "the readers agree often" into a *measured fact* instead of a claim. Because all three readers are AI, their agreement is strong evidence, not proof — so measuring it first, quietly, is exactly the honest thing to do.
- **Stage 2 switches on the human safety net only after** we have seen where the readers actually disagree. The review queue is then grounded in real behaviour, not a hunch. The person with the real PDF on screen is the true safety net — the machine's vote just decides which numbers reach them.
- **Stage 3 is offered only to clients who need it.** Hosted readers send pages to outside services; the local version keeps every document in-building, in exchange for some accuracy on the hardest pages.

Note on honesty: the picture of the exact spot on the PDF page is a new capability that arrives *with* this expansion. Today's proof-of-source is file-level — which file, the original label, and the exact text snippet. Pointing at the precise region of the page comes with the human-review sidebar in Stage 2.

At no point do we ask the user to trust a rate we have not earned. First we watch, then we flag, then — only if needed — we take it fully offline.

---

## 7. Cost and speed

A fair worry about running three readers is: "won't this be three times slower and three times more expensive?" The honest answer: it costs more, but not in the way people fear. Here is the plain reasoning.

First, two quick terms in simple words:
- **In parallel** = the three readers all work at the SAME time, not one after another.
- **Cascade** = a cheaper setup where you run ONE reader first, and only wake up the other readers when there is real doubt.

**Speed.** Run the three readers in parallel. Because they all read the page at the same moment, the total wait is about the SLOWEST reader, plus one quick compare step — NOT the three times added together. Three readers do not make the user wait three times longer.

**Cost.** Cost is the honest trade-off. It grows roughly with the NUMBER of readers: three readers means about three times the reading cost, plus a small amount for the compare step. This is real, and we do not hide it. But there is a way to pay much less.

**The cascade option.** Instead of always running all three, run one reader first. Only call the second and third readers when that first reader is UNSURE, or on the numbers that matter most (like a cash balance or an ARR figure). This way the cost tracks DOUBT, not volume — you pay for the extra readers only where there is a real question, and the easy pages stay cheap.

**How many readers?** Three to four different readers is the sweet spot. Adding more buys very little, and adding a WEAK reader can actually HURT — it adds cost and votes on things it reads poorly. More is not better; different-but-strong is better.

| Lever | Effect on cost | Effect on speed | When to use |
|---|---|---|---|
| Run all three in parallel | About 3x the reading cost + a small compare | About the slowest reader (not the sum) | Highest trust; every number cross-checked; the default for a valuation pack |
| Cascade (one first, others only on doubt) | Much lower — you pay extra only where there is doubt | Fast on easy pages; a bit slower only when doubt triggers the others | High volume, or when most pages are clean and only key numbers need the full check |
| Add a 4th reader | A little more per extra reader | Same (still parallel) | Only if the 4th is genuinely strong and independent; otherwise skip |
| Add a weak reader | More cost | Same | Never — a weak reader adds cost and can hurt accuracy |

**Data-residency (where the page is read).** This is a real question for confidential financials, so we name it plainly. Firecrawl, hosted vision-LLMs, and cloud OCR mostly send the page OFF the machine to a vendor's servers to be read. For sensitive portfolio documents, that may not be acceptable. The mitigation is an **on-prem / offline variant** — a set of readers that run LOCALLY, so nothing leaves the building. The honest trade-off: locally-run readers can be a little less accurate on the very hardest pages, in exchange for zero data leaving your environment. This is offered as a choice, not a default, so data-sensitive clients can decide for themselves.

Bottom line: parallel keeps it fast, the cascade keeps it affordable, three-to-four strong-and-different readers is the sweet spot, and the on-prem option answers the confidentiality question — all stated as honest trade-offs, not free wins.

---

## 8. Honesty guardrails and anticipated questions

This section is the honest fine print, plus a short rehearsal card of the hard questions we expect — with plain answers.

### Part A — Honesty checklist

We say these out loud, before anyone has to ask.

- **This is a future design, not built.** Today Concord reads each number with ONE method. The three-reader cross-check described here is the plan, not something running live now.
- **Independence is never total, so the HUMAN is the real safety net.** All three readers are AI (a structured parser, an image-reading model, and an OCR/table model). Three different AI engines fail on different pages. But because all three are AI, they are still less independent than a mix that also had a rules-based reader — they can be fooled by the same ugly page. So when they agree, that is **strong evidence, not proof**. The person who reviews every disagreement is the real guarantee, not the vote.
- **Vendor accuracy numbers are the vendor's own claim.** For example, a "~99% accuracy" figure from an OCR vendor is what the vendor says about itself, not something we measured ourselves.
- **The PDF screenshot is part of THIS future.** Today our proof-of-source is *file-level*: we can show which file, the original label, and the exact text snippet a number came from. Pointing at the exact spot on the page image is a NEW capability that arrives with this expansion.
- **No auto-accept rate can be quoted until it runs.** "Auto-accept rate" means how often the readers agree well enough to skip the human. We will not invent that number — measuring it on your real documents is the first thing the rollout produces.
- **A 10x gap never counts as agreement.** If two readers differ by ten times (for example $3.4M versus $34M), that is never "close enough" — that is exactly the silent error this whole design exists to catch.

### Part B — Q&A drill (anticipated questions, short honest answers)

| Question | Plain, honest answer |
|---|---|
| Isn't three AI readers just correlated — wrong the same way? | Partly yes, and that is the honest limit. That is exactly why a human decides every disagreement, and why we pick three *different* engines (a parser, an image-reading model, an OCR/table model) that fail on different pages — not three copies of one model. |
| Isn't "all must agree" too strict? | It is tiered, not all-or-nothing. If an independent majority agrees, we auto-accept and simply record the one disagreement as a note. Only a real split, or the most-trusted reader being the odd one out, goes to a person. |
| What's your auto-accept rate? | We cannot quote one honestly until it runs on your documents. Measuring how often the readers agree is the very first thing the rollout produces — before we trust it, we measure it. |
| Why did you drop the rules-based reader? | The rules-based method is what runs today. This expansion is about AI readers that read layout and *meaning* the way a person would, then cross-check each other — and a human settles the rest. |
| Does the data leave the building? | The hosted readers (cloud parser, cloud vision, cloud OCR) do send pages off the machine. For data-residency-sensitive clients we offer an on-premise variant that keeps everything local, trading a little accuracy on the hardest pages for zero data leaving the building. |
| Who approves a flagged number? | A *different* person than the one who ran the extraction — a four-eyes control (one person makes the change, a second person approves it). Every correction is saved with a full trail: old value, new value, who, when, and why. |
| How is this different from today? | Today one method reads each number. This adds two more independent AI readers, an automatic cross-check, and a human with the real PDF on screen for anything the readers disagree on. |
| How slow / how expensive is it? | We run the readers in parallel, so the wait is about the *slowest* reader plus one quick compare — not the three added up. Cost grows roughly with the number of readers; to control it, a "cascade" runs one reader first and only calls the others when it is unsure or on the numbers that matter most. |

---

## 9. One-page summary

**The whole design on one screen.** No new ideas here — just the short version of everything above. Each important term is explained in plain words the first time it appears.

### The problem

| Today | The risk |
|---|---|
| Concord reads each number with ONE method. | If that one reader is wrong, nobody sees it. The mistake is SILENT — for example reading $34M when the page says $3.4M. |

### The fix (one line)

PDF -> [Reader A | Reader B | Reader C read the SAME page at once] -> Orchestrator compares their answers -> AGREE = auto-accept / DISAGREE = warning -> a HUMAN decides with the real PDF on screen.

("Reader" = one AI method that reads the document. "Orchestrator" = a small referee that compares the readers on the same fact.)

### The three readers (all AI, on purpose a MIX)

| Reader | What it is (plain) | Good at | Fails by |
|---|---|---|---|
| Firecrawl | An AI service that turns a PDF into clean structured data (the tool Concord actually started with). | Structure, clean pull, at scale. | Flattening odd table layouts. |
| Vision-LLM | A large model that LOOKS at the page image and reads meaning. | Renamed labels, footnotes, context. | A plausible but WRONG number (a hallucination) — fails silently. |
| OCR / document-AI | Trained character- and table-reading models. | Precise numbers, scanned pages. | Drifting on strange layouts, no understanding of meaning. |

Why a mix: three DIFFERENT AI engines fail on DIFFERENT pages, so when they agree the agreement means something. Three copies of the SAME model would share the same blind spots (this is "correlated failure" — confidently wrong the same way). Honest limit: because all three are AI, they are less independent than a mix that also had a rules-based reader — so agreement is STRONG EVIDENCE, not proof, and the HUMAN is the real safety net. (Today's single method is rules-based; this ensemble is the AI-powered future.)

### The orchestrator (how it decides)

- Compares the readers on the SAME FACT — identified by company, metric, time period, unit, and basis (e.g. "ClearPay, cash balance, Q2 2025, US dollars").
- Two readers only "agree" if it is the same fact AND the numbers are CLOSE ENOUGH ("tolerance" = how much difference is still fine): money within a rounding whisker, a percentage within a tenth of a point, headcount exact, and a 10x gap is NEVER close enough.
- BASIS matters: a lender's "gross margin" is really an interest margin — different basis = different fact = they do NOT agree even if both print "62". (Concord's existing "refuse to compare unlike things" rule, lifted to the reader level.)

| Outcome | Meaning | Action |
|---|---|---|
| Validated (green) | All agree | Auto-accept, highest trust |
| Validated with a note (green) | An independent majority agrees; the odd one out is weaker | Auto-accept, disagreement recorded |
| Warning (amber) | A real split, or the most-trusted reader is the odd one | Send to a human |
| Unresolved (grey) | Only one reader found the number | Send to a human |

### The human in the loop (the headline)

- Reuses Concord's existing "click a metric -> a sidebar opens", extended to show, for a flagged number: EVERY reader's answer side by side (value + confidence + exact snippet used) + a SCREENSHOT of the real PDF region + controls to VALIDATE or CORRECT.
- Four-eyes (also called maker-checker): the person who ran the extraction cannot approve their own correction — a DIFFERENT person approves.
- Every change is saved with a full audit trail: old value -> new value -> who -> when -> why. Each human decision also feeds back to improve the readers over time.

### The rollout

Stage 1: run the three readers ALONGSIDE today's tool and only MEASURE how often they agree — users see no change. Stage 2: turn on the warning flags + the human-review sidebar. Stage 3 (optional): an on-prem / offline variant so no page data leaves the building. Principle: MEASURE agreement before you trust it.

### The honest lines

- This is a FUTURE design, not built today.
- Agreement is strong evidence, NOT proof — the human is the safety net.
- Vendor accuracy figures are the vendor's OWN claim, not independently measured.
- Pointing at the exact spot on the PDF is part of THIS future; today's proof-of-source is file-level (file, label, exact snippet).
- No auto-accept rate can be quoted until it runs on real documents — measuring it is the first thing the rollout produces.

**In one sentence:** Concord would read every number with three independent AI readers, auto-accept only what they agree on, and send every disagreement — with the real PDF and a four-eyes audit trail — to a human, because agreement is strong evidence but the person is the real safety net.

---
