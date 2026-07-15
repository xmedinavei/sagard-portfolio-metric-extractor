# Document vi — How Concord works today, end to end
### Concord — the architecture that runs right now (offline, deterministic, built)

> **Status: BUILT — this is what runs today.** This is the counterpart to the future
> orchestrator design in `v-redundant-extraction-orchestrator.md`. That document shows the
> *future* (three readers voting, a human in the loop). **This** document shows the *present*: the
> single-pass pipeline Concord actually runs today — one offline click, fixed rules, and a
> comparability gate that refuses to compare unlike things. Use this picture to build the "how
> Concord works today" slide.

---

## The whole machine in one picture

**Read this first.** A stack of PDF packs goes in at the top; Concord reads them, lines every
number up on one shared vocabulary, cross-checks them, and then — at the **comparability gate** —
decides what is safe to compare and what it must *refuse* to compare. One trusted, source-traced
view comes out at the bottom, in the cockpit.

```
                ┌─────────────────────────────────────────────────────────────┐
                │       QUARTERLY PDF PACKS   ( offline, on the laptop )      │
                │  ~24 files  ·  10 companies  ·  no data leaves the machine  │
                └─────────────────────────────────────────────────────────────┘
                                               │
                                 one click, all packs at once
                                               │
                                               ▼
                   ┌──────────────────────────────────────────────────────┐
                   │         1)  READ   —   deterministic parser          │
                   │  fixed rules: same input -> same answer, every time  │
                   │  never invents a number   ( a blank beats a guess )  │
                   └──────────────────────────────────────────────────────┘
                                               │
                                               ▼
             ┌──────────────────────────────────────────────────────────────────┐
             │                    2)  UNDERSTAND EACH NUMBER                    │
             │            classify the company:  equity  vs  credit             │
             │  map many labels -> ONE vocabulary  ("End-of-Period ARR" = ARR)  │
             │          line up unit & scale  ( millions / thousands )          │
             └──────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                    3)  CROSS-CHECK                     │
                  │  company report  vs  portfolio summary  ( reconcile )  │
                  │       resolve conflicting values inside one file       │
                  │  keep the company's own report as the source of truth  │
                  └────────────────────────────────────────────────────────┘
                                               │
                                               ▼
                     ┌───────────────────────────────────────────────────┐
                     │     4)  THE COMPARABILITY GATE   ( the moat )     │
                     │  is this number safe to compare, like-for-like ?  │
                     └───────────────────────────────────────────────────┘
                                               │
                      ┌────────────────────────┴───────────────────────┐
                      ▼                                                ▼
          ┌──────────────────────┐             ┌───────────────────────────────────────────────┐
          │  YES  —  same basis  │             │       NO  —  show it, but REFUSE to rank      │
          │  ( like-for-like )   │             │          lender margin != SaaS margin         │
          │    rank it inside    │             │      GBP != USD   ( flag, never convert )     │
          │    its own sector    │             │  restate restricted cash  ($38.4M -> $32.2M)  │
          └──────────────────────┘             └───────────────────────────────────────────────┘
                      │                                                │
                      └────────────────────────┬───────────────────────┘
                                               ▼
               ┌──────────────────────────────────────────────────────────────┐
               │     5)  THE COCKPIT   ( one page, scroll top to bottom )     │
               │  scorecard · trends · refused · exceptions · reconciliation  │
               │            click ANY number  ->  its exact source            │
               └──────────────────────────────────────────────────────────────┘

             ┌──────────────────────────────────────────────────────────────────┐
             │   PROVENANCE runs the whole way down —  every number keeps its   │
             │  source file · original label · confidence · exact quoted line.  │
             │     And a HUMAN owns every number that leaves the building.      │
             └──────────────────────────────────────────────────────────────────┘
```

## How to read the picture (legend)

- **▼ and the lines** — a number flows this way, top to bottom.
- **Boxes 1 → 5** — the five stages every number passes through, in order.
- **The fork at box 4** — the one decision that makes Concord different: *YES, safe to compare* (rank
  it) vs *NO, not like-for-like* (show it, but refuse to rank it).
- **The bottom band** — two things that are true at **every** stage, not just one: proof-of-source
  on every number, and a human in charge of anything that leaves.

## The five stages, in plain words

1. **Read.** A deterministic parser turns each PDF into numbers. "Deterministic" means fixed
   rules: the same file always gives the same answer, and it never makes up a number — a flagged
   blank is better than a confident guess.
2. **Understand each number.** Sort the company into *equity* or *credit*; map the many different
   labels a number can wear onto **one shared vocabulary** (so "End-of-Period ARR" and "ARR, End of
   Period" become the same line); and line up the unit and scale (millions vs thousands).
3. **Cross-check.** Where a number appears in both the company's own report and the portfolio
   summary, reconcile them; resolve conflicting values inside a single file; and keep the company's
   own report as the source of truth (never average two sources together).
4. **The comparability gate (the moat).** The one question that matters: *is this number safe to
   compare, like-for-like?* If yes, rank it inside its own sector. If no, still **show** the number,
   but **refuse to rank** it — a lender's interest margin is not a SaaS gross margin, pounds are not
   dollars (flag, never convert), and restricted cash is restated down to what's really spendable.
5. **The cockpit.** One page you scroll top to bottom — the scorecard, trends, the refused list,
   the exceptions, the reconciliation tally — and you can click **any** number to see its exact
   source.

## The honest line

This is what runs **today**, and it is **deterministic** — one method, one reader. That is a
deliberate choice (cheap, testable, offline, and it never invents a number), but one reader can be
silently wrong. The **future** version replaces box 1 with *three independent readers plus a human
in the loop* — that design lives in `v-redundant-extraction-orchestrator.md`. Today's single-pass
machine is real and built; the redundant version is designed, not built.
