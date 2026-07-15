# Concord cockpit — what the front-end shows (a plain-language guide)

> **What this is.** A section-by-section, company-by-company walk-through of the Concord
> front-end, written in simple words. It is a *feeder* for the slides (Document iii) and the
> spoken story — read it to know exactly what is on each screen, what each company shows, and
> which "issues" the tool makes visible on purpose.
>
> **The one sentence.** *Same label does not mean the same metric — Concord's job is to make
> numbers truly comparable and traceable to their source, and to refuse a comparison rather
> than fake one.*
>
> **Honesty note.** Every number below was read from a **live run today**: `make serve` →
> `POST /api/run` parsed **24/24 PDFs in 0.958 s** (offline, in-memory), schema **1.1.0
> (enhanced)**, **116 metric rows**, **5 refused**, **1 restated**. Nothing here is invented;
> where the screen shows something the data does *not* back up, this guide says so.

---

## 1. The big idea in one minute

A portfolio-operations analyst today opens ~20 company PDF packs each quarter and hand-keys the
numbers into a spreadsheet. The packs use **different words for the same thing** ("ARR",
"Contracted ARR", "End-of-Period ARR") and **the same word for different things** (a software
"gross margin" vs a lender's "gross margin"). Copy them into one table and you silently mislead
yourself.

Concord loads all the packs **offline in one click**, lines the numbers up so a comparison is
only drawn when it is truly like-for-like, and lets you **click any number to see the exact
source it came from**. The whole report is **one page you scroll top to bottom** — nothing is
hidden behind tabs. You read a **row** to judge one company, a **column** to compare a metric
across companies.

---

## 2. The screens, one by one

Each screen below is described the same way: **What you see · What it means · What you can do ·
The honest catch.**

### 2.1 The load screen (offline, one click)
- **See:** the list of intake PDFs found on disk, and a blue **"Load reports"** button. After
  the click, a line reads **"24 / 24 parsed in 0.958 s"**.
- **Means:** one click turns raw PDFs into the whole comparable cockpit. The "parsed / total in
  seconds" line is the proof it ran **locally and fast** — no data left the machine.
- **Do:** click **Load reports**; later, **↻ Re-run** re-parses from disk in place; **↑ Back to
  start** scrolls to the top.
- **Catch:** the famous "24/24 in 0.9 s" is real *when you run it*, but the exact figure comes
  from the run response, not a hard-coded label. If fewer parse than were found, an amber note
  says how many were skipped.

### 2.2 The title bar (Concord, made for Sagard)
- **See:** the **Concord** logo + name + the slogan *"One comparable, source-traced view of
  every portfolio company,"* and on the right a **"Prepared for" Sagard** logo.
- **Means:** it frames the tool as a finished product built for Sagard, and states the single
  promise in one line.
- **Catch (be honest):** the Concord mark is original artwork drawn in code (SVG). The Sagard
  logo is loaded from an image **file you provided** — it is *not* reproduced by us. If that
  file is missing, the bar shows a plain "SAGARD" text fallback.

### 2.3 The metrics grid — "Metrics by strategy / sector" (the scorecard)

This is the heart of the page: **companies as rows, 8 metrics as columns**, with a banner
splitting the columns into four bands that read like a health story left-to-right:

| Band | Columns | The question it answers |
|---|---|---|
| **Grow · Profit** | Revenue (qtr), ARR, Gross margin | Is it growing, and profitably? |
| **Keep** | Net revenue retention (NRR), Logo churn | Is it keeping its customers? |
| **Fund** | Cash balance, Monthly burn | Can it fund itself / how long is the runway? |
| **Scale** | Headcount | How big is it? (size, not performance) |

An expandable **"What each metric means"** guide defines every column in plain words, and the
same definition appears when you hover a column header.

**How the cells are coloured (this is the important part):**

| Rule | What it does | Why it is honest |
|---|---|---|
| **Heat (red→amber→green)** | Ranks each cell against **the whole equity book** for that metric in that quarter: green = best peer, red = worst. | It answers "how does this rank vs peers?" without eyeballing a column. |
| **▼ laggard tag** | Names the single lowest-**NRR** company in a sector (the retention "loser"), so the worst is stated, not just implied by a red cell. | Calls out the laggard explicitly (this is ConstructIQ). |
| **N/A vs —** | Muted **"N/A"** = this business type never reports this metric; **"—"** = it *should* have this number but didn't. | An empty cell is **never ambiguous**. |
| **"· not ranked"** | A real number measured on a **different basis** is shown in full but **not coloured and not ranked** (LendBridge's "gross margin"). | The tool shows the number but refuses to rank apples vs oranges. |
| **White = neutral** | White = "no opinion here": non-USD money, a stale older quarter, a refused number, headcount, a gap, or an N/A. | Stops you reading meaning into a colour that isn't there. |

Two controls sit on top of the grid:
- **Group by: Strategy (default) vs Market.** *Strategy* = one **Private Equity** table (all
  equity companies together, SaaS-first) + a lone **Private Credit** table (the one lender).
  *Market* = one table per sector (SaaS / Marketplace / Payments / Credit). Grouping is
  **display only** — it never changes a cell's value or colour.
- **Quarter timeline (oldest → newest →).** Pin any single quarter, use **"Latest reported"**
  (each company's own most-recent number, the default), or switch to **"Trend (over time)."**

**In-cell "Trend (over time)" view.** Toggling it keeps each latest number but adds a tiny
**sparkline** and a plain change line like **"▲ +8 % vs Q1 2025 · latest Q2 2025"** (percent
metrics show *points*, e.g. "+5.0 pts"). Here colour means **direction against the company's
own past**, not peer rank: **▲ up = green, ▼ down = red.**
- **Catch:** this direction colour is deliberately *naive* — for **logo churn**, a fall is
  actually *good* but is coloured red. That is the owner's on-purpose call; a small Trend legend
  warns about the churn exception. Each sparkline is self-scaled, so two lines' heights are **not**
  comparable to each other — magnitude stays the job of the number + the peer heat.

### 2.4 Trend over time (the charts section)
- **See:** **one small chart per metric, all at once**, stacked in the same Grow/Keep/Fund/Scale
  blocks as the tables, three per row.
- **Means:** you see every metric's shape in one glance, in the same order the tables tell the
  story.
- **Do:** switch **"All companies"** (every company overlaid on each chart — a race) vs **"One
  company"** (drill into one name across all its metrics, defaults to NovaCloud). **Click a chart
  to enlarge it**; inside the enlarged chart, **click a point to jump to that number's source.**
- **Colour:** in *All companies*, each company keeps **one fixed colour** across every chart and
  you **hover a line to see its name** (thin lines are hard to tell apart). In *One company*,
  each line is coloured by **direction done right** — improving = green, worsening = red — so a
  *falling* churn or a *shrinking* burn correctly reads **green**.
- **The flagship moment — NovaCloud ARR "stitch":** the source PDFs arrive out of order and rename
  the metric ("End-of-Period ARR" vs "ARR (End of Period)"), yet the chart shows **one clean
  5-quarter line $24.1M → $34.2M**. An honest caption notes it spans 2 source labels that were
  collapsed. *One dot became five.*
- **Catch (honest comparability):** truly non-comparable series are **hidden and named, never
  silently dropped** — the lender's refused margin ("different basis") and non-USD money ("reported
  in GBP") are listed as excluded. Companies with only 1–2 quarters are drawn as **dots, not fake
  lines**. Because this corpus is mostly single-quarter (only NovaCloud has 5; MediSight and
  PeopleFlow have 3), many overlay charts are mostly dots — that is the real data, not a bug.

### 2.5 Provenance drawer — click any number to see its source
- **See:** click **any** number (a grid cell, a trend point, a refused figure) and a side panel
  slides in with: the **source file**, the source's **own raw label**, the **value as printed**, a
  **confidence %** (live range 90.4 %–99.5 %), and the **exact text excerpt** it was read from.
- **Means:** every number is **one click from its origin** — a skeptic can verify the wording,
  the printed value, and the surrounding sentence instead of trusting the number on faith. This is
  the **audit trail**.
- **Catch:** provenance is **file-level** in v1 — an *intentional* honesty choice. The parser
  actually knows the page, but the drawer **deliberately hides the page number** rather than
  over-claim precision; page/sentence anchoring is a stated roadmap item.

### 2.6 The four trust panels (below the charts)

| Panel | What it shows | Why it builds trust |
|---|---|---|
| **Refused comparisons** | The numbers the tool **will not rank** — live, the **5 LendBridge gross-margin rows**, each marked *"refused: different basis (interest margin vs gross margin)."* | Proof the tool knows what it must **not** compare. The number is shown, never dropped. |
| **Exceptions** | A "chase this up" list: per company, the metrics its business type **was expected to report but didn't** (live: **10 genuine gaps**). | Real follow-ups, not noise. Sector-smart: a lender is **never** flagged for "missing ARR." |
| **Source-terminology breadth** | For each metric, **how many different source labels** were unified into it (live: **29 distinct labels**) and lists them. | Makes the "label drift" problem visible — this unification is *why* the grid and trend lines line up. |
| **Cross-source reconciliation** | An honest tally for numbers that appear in **both** a company report **and** the portfolio summary (live: **22 checked, 22 agree, 0 disagree**). | Proves the check **ran** and came back clean. On a mismatch it keeps the company's own report and shows the gap — it **never averages**. |

> A quiet detail worth saying out loud: reconciliation also reports **7 conflicts it
> auto-resolved inside single documents** — so "0 disagreements" is backed by visible evidence of
> real reconciliation work, not silence.

---

## 3. The companies — a short case study each

Ten companies, one quarter each except the two 5-quarter names. Grouped by market.

### SaaS (6)

| Company | The picture (real numbers) | What the cockpit surfaces |
|---|---|---|
| **NovaCloud** ⭐ | 5 quarters. ARR **$24.1M → $34.2M (+42 %)**, margin 74→78 %, churn 7.8→5.8 %, NRR 115→123 %, burn shrinking. | **The flagship trend** — everything compounds the right way. The one caution: **cash falls every quarter $29.5M → $19.6M** — a runway watch despite a healthy P&L. |
| **CarbonTrack** | ARR $16.9M, **churn 3.8 % (lowest)**, NRR 121 %, tiny burn −$0.55M. | **Best retention on screen.** Every metric is echoed by the portfolio summary; the tool deduped all 6, keeping the standalone report. |
| **MediSight** | 3 quarters. ARR **$24.5M → $27.9M**, margin 75→77 %. | **Cross-source + decoy case:** reconciled ARR against the summary, and **rejected "-70" garbage candidates** for margin and headcount. |
| **TalentVault** | ARR $22.4M, margin 76 %, NRR 119 %, cash $17.9M. | Solid single-quarter SaaS. Like CarbonTrack, its numbers were **deduped against the summary** (standalone kept). |
| **PeopleFlow** | 3 quarters. ARR **$18.3M → $21.4M**, NRR 116→118 %. | **The currency wrinkle:** one label reads *"Net Pound Retention (NPR)"*, hinting the figures may be in **GBP**, not USD. (See the honesty note in §4.) |
| **ConstructIQ** | ARR $18.6M, **churn 6.3 % (highest)**, **NRR 112 % (lowest)**. | **The retention laggard** — it carries the ▼ tag. Both numbers are still *healthy*; "laggard" is relative to strong peers. Its burn doesn't land on the monthly basis, so burn shows as not captured. |

### Marketplace (2)

| Company | The picture | What the cockpit surfaces |
|---|---|---|
| **ApexFreight** | 1 quarter. Revenue $9.3M, **margin 54 % (lowest of all 10)**, headcount 204. No cash/burn. | Thin, low-margin marketplace economics; **zero runway visibility** (no cash or burn reported). |
| **FleetLink** | Latest is **Q1 2025 — a quarter behind** the rest. Only gross margin carries forward (51→52 %). | **The stale-data case:** flagged behind the Q2 2025 book, with heavy gaps in the stale quarter. |

### Payments (1)

| Company | The picture | What the cockpit surfaces |
|---|---|---|
| **ClearPay** | Revenue $17.3M, margin 67 %, cash **reported $38.4M**. | **The restatement case:** the raw line is *"Cash & Restricted Cash."* The tool **restates it down to $32.2M** comparable cash (strips the $6.2M of restricted client money it legally cannot spend) — and the provenance drawer explains the $6.2M gap. |

### Credit (1)

| Company | The picture | What the cockpit surfaces |
|---|---|---|
| **LendBridge** | 5 quarters. Revenue **$10.1M → $12.7M**, headcount 162 → 188. Labels a "Gross Margin" 58→62 %. | **The refuse-to-compare case:** its "gross margin" is really an **interest margin**, so all 5 quarters are **refused** — shown, but never ranked against SaaS margins. Underneath, its comparable metrics grow steadily and healthily. |

---

## 4. The "issues" we see (and why they are features, not bugs)

These are problems **in the data we look at**, not defects in the code. The point of Concord is
that it **makes each one visible** instead of silently averaging it away.

| # | The issue on screen | Where you see it | Why it matters |
|---|---|---|---|
| 1 | **Same label ≠ same metric** — a lender's "gross margin" isn't a software margin | LendBridge "· not ranked" + Refused panel | A normal spreadsheet ranks them and misleads you. Concord **refuses**. |
| 2 | **Renamed label hides a trend** — ARR reported under 2 names | NovaCloud ARR one clean 5-quarter line | Without stitching, a renamed line looks like a broken, one-dot metric. |
| 3 | **Restricted cash overstates liquidity** — $38.4M isn't spendable cash | ClearPay restated to $32.2M + drawer note | Comparing headline cash across companies would be wrong. |
| 4 | **Different currency** — GBP figures aren't USD | PeopleFlow "· not comparable (GBP)" flag | You must not put pounds and dollars on the same axis. |
| 5 | **Wrong basis** — burn reported per quarter, not per month | ConstructIQ burn shown as not captured | Better a flagged blank than a silently rescaled (wrong) number. |
| 6 | **Missing vs Not-applicable** — an empty cell must say which | Grid "—" vs "N/A" + Exceptions panel | A lender has no ARR (N/A); a SaaS with no cash is a real gap (—). |
| 7 | **Stale quarter** — one company is a period behind | FleetLink Q1 2025 tag, left uncoloured | A quarter-old number must never read as current. |
| 8 | **Decoy / conflicting values in one file** | MediSight/NovaCloud/PeopleFlow — decoys rejected | The tool keeps the right number and records the conflict, never averages. |
| 9 | **Cross-document disagreement** — report vs summary | Reconciliation panel (22 agree, 0 disagree today) | It keeps the company's own report as source of truth. |

**Two honest caveats you should own out loud (the demo must not over-claim):**

- **PeopleFlow's GBP flag is a *front-end rule*, not captured data.** In the live payload
  PeopleFlow's `currency` is `null` and every row is `comparable` — the parser does **not** see the
  £ symbol. The "not comparable (GBP)" flag comes from a small **human-owned currency rulebook** in
  the front-end. Say it that way: *"the same rulebook pattern as the rest of the tool, because
  today's parser doesn't capture the symbol."*
- **The missing-metric check has a couple of false positives.** CarbonTrack and TalentVault show
  **cash and headcount on screen**, yet the issues log still lists those as "missing." The grid
  suppresses the false "N/A", so it looks right to a viewer — but the underlying flag is imperfect.
  Honest framing: *"the sector-aware suppression handles it on screen; tightening the raw flag is a
  roadmap item."*

**Honest limits (roadmap, not shipped):** provenance is **file-level** (no page number yet); there
is **no currency conversion** (it refuses, doesn't convert); and it refuses a *lender vs SaaS*
margin but does **not yet** flag that two *SaaS* companies may compute margin differently.

---

## 5. What it helps with (who, and the value)

- **Primary user: the portfolio-operations analyst** who runs the quarterly close. Concord removes
  the hand-keying and gives them a comparable, source-traced scorecard in one click.
- **Then, second-hand:** deal partners (post-close board prep), and valuation / LP-reporting teams
  who get **cleaner, auditable inputs** while keeping their own judgment and sign-off.
- **The value, in their words:** provenance = an **audit trail** (survives an auditor or an LP
  challenge); refuse-to-compare = a **control** (a wrong number never reaches a report); offline =
  **data security** (confidential financials never leave the building); deterministic = **reliable,
  testable, cheap.**
- **What we do *not* claim:** no invented dollar savings, no fund-return math. The tool feeds
  trustworthy inputs; a human still decides.

---

## 6. The story to tell (for the slides)

Three beats, each already true on screen:

1. **The pain (make it felt).** An analyst hand-keys 20+ packs that rename metrics and reuse
   words. One wrong copy-paste mis-informs an investment committee.
2. **The two proof moments (the demo).**
   - **The hidden trend:** NovaCloud's ARR looks like one lonely dot to a naive tool; Concord
     stitches the renamed labels into **five quarters, $24.1M → $34.2M**. *"A silent blank is more
     dangerous than a loud error."*
   - **The refusal:** a lender's 62 % "gross margin" sits next to a SaaS 76 %. Concord **refuses to
     rank them and says why.** *"A generic dashboard ranks these. Ours refuses — and that refusal is
     a control."*
3. **The trust spine (runs through everything).** At any moment, **click a number → see its source
   file, label, confidence, and the exact sentence.** Every claim on a slide is one click from proof.

**Close on the thesis:** *Comparability is the product, not extraction. Same label ≠ same metric —
and Concord would rather refuse a comparison than fake one.*
