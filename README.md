<p align="center">
  <img src="web/public/concord-mark.svg" alt="Concord" height="72">
</p>

<p align="center"><em>One comparable, source-traced view of every portfolio company.</em></p>

<p align="center">
  <sub>A case-study monitoring cockpit · prepared for</sub><br>
  <img src="web/public/sagard-logo.png" alt="Sagard" height="26">
</p>

---

## What Concord is — and the problem it solves

A private-markets team monitoring a portfolio receives a stack of quarterly PDFs from many companies. The
hard part isn't reading them — it's that **the same words rarely mean the same thing**:

- **Different labels, one metric.** One company writes "ARR", another "End-of-Period ARR", another
  "annualized recurring revenue" — all the same number under three names.
- **Same label, different basis.** Two companies both report "Gross Margin", but a lender's is an *interest
  spread*, not a software margin — lining them up is meaningless.
- **Different currencies and quarters.** A GBP figure sits silently beside USD; a stale Q4 number sits
  beside a current one.

Drop all of that into one dashboard and you **manufacture false comparisons** — the exact mistake that
erodes trust in the numbers. **Concord** does the opposite: it extracts every metric straight from the
source PDFs *with its provenance*, resolves the label drift to one canonical metric, and **visibly refuses
to compare things that aren't comparable** — flagging a different basis, currency, or quarter instead of
hiding it.

> **The thesis in one line:** *the same label is not the same metric.* **Comparability is the product, not
> extraction.** Every number is one click from its source document, and nothing incomparable is ever
> silently ranked together.

Concord runs as a **local, offline cockpit** (a Flask API + React single-page app) and as a standalone CLI
over the same deterministic, source-traceable pipeline. What you see on screen is described in
[What the cockpit shows](#what-the-cockpit-shows); the rest of this README is **how to run it**.

---

## What the cockpit shows

One screen, built to answer *"can I trust this number, and is it comparable?"* — all on the offline export.

- **Metrics grid** — companies × the eight canonical metrics, grouped either by **Market** (SaaS ·
  Credit · Marketplace · Payments) or by investment **Strategy** (Private Equity vs Private Credit —
  the default; the PE table is ordered SaaS-first). Cells are heat-shaded green → red **within a
  sector, same-quarter peers only**, so a colour always means "how this company ranks against its
  own-market peers," never across sectors. A **quarter selector** flips the whole grid to any single
  reported quarter or "Latest reported"; a **Trend (over time)** view adds, inside each cell, a small
  sparkline plus the quarter-over-quarter change (e.g. `▲ +8% vs Q1 2025 · latest Q2 2025`) — each
  number's quarter is named, and single-quarter cells say so instead of drawing a fake line.
- **Trend over time** — every metric at a glance as small charts, grouped the same way as the grid
  (Grow · Profit / Keep / Fund / Scale). Switch between **all companies** and **one company**; click
  any chart to enlarge it (and trace a point to its source); hover a line to read the company name.
- **Refused comparisons** — a shared metric name on a different *basis* (a lender's interest-margin
  "gross margin") is shown but never ranked against a true gross margin.
- **Cross-source check** — where a figure appears in both a company report and the portfolio summary,
  whether the two agree (and which one wins).
- **Exceptions** — the "chase this up" list: metrics a company was expected to report but didn't.
- **Source-terminology breadth** — where **label drift** is handled: the many source labels ("ARR",
  "End-of-Period ARR", "annualized recurring revenue", …) that all resolve to one canonical metric.
- **Click-any-number provenance** — every displayed number is one click from its source: the file,
  the source's own label, the confidence, and the exact excerpt.

Comparability is enforced throughout: a different-basis or non-USD figure is **shown and named, never
silently mixed** into a ranking or a shared axis.

---

## Prerequisites

- **Python 3.12+** — check with `python3 --version`
- bash or zsh
- No Node.js, Docker, or database required to run the demo *(the committed `web/dist` bundle is served as-is; Node.js is only needed if you rebuild it via `make build-web`)*

---

## Quick start — run the demo with `make serve`

**`make serve` is the way to see Concord.** It launches a local, offline **monitoring cockpit** (a Flask
API + React single-page app), and everything on screen is the live pipeline output. The command-line
options further down are optional extras — **not** the demo.

```bash
cd personal/sagard-portfolio-metric-extractor
make setup     # create the Python venv (.venv), install requirements, seed .env
make serve     # add the web extra and launch the cockpit
```

> **First-time setup.** `make setup` creates an isolated **Python virtual environment** in `.venv` and
> installs the project's requirements; `make serve` then adds the `web` extra (Flask) and starts the app.
> Prefer to do it by hand? `python3 -m venv .venv && source .venv/bin/activate && pip install -e ".[web]"`,
> then `python -m portfolio_metrics.webapp`. The first setup needs the network once; after that the demo is
> **fully offline**.

Open **http://127.0.0.1:5000** and click **Load reports**. It parses the current `intake-pdf/*.pdf` (~1 s)
and renders the full cockpit: a sector-grouped RAG grid, an over-time trend (NovaCloud ARR across 5
quarters), refused/unsafe comparisons flagged, a cross-source reconciliation check, sector-aware
exceptions, and **click-any-number provenance** (source file, the source's own label, confidence, and the
excerpt).

Fully offline — it forces the local `pypdf` parser, so **no API key is needed and nothing calls the
network**. `make serve` serves the **committed** `web/dist` bundle (no build step); run `make build-web`
only if you change frontend source under `web/`. See [Design decisions](#design-decisions) for why the demo
uses deterministic local parsing.

---

## Running from the command line

> **You don't need any of this to run the demo — that's `make serve` in the Quick start above.** This
> section is reference only: the same pipeline seen from the command line, without the web app.

The backend is also a standalone CLI pipeline — the cockpit is a thin layer over it. Both options below
assume you have run `make setup` first (which creates the Python venv and installs requirements). Two ways
to run without the web app:

### Option A — from checked-in fixtures (no API key)

Uses parsed fixtures already in the repo. Runs in a few seconds, no network.

```bash
cd personal/sagard-portfolio-metric-extractor
make setup
make demo
```

### Option B — full pipeline from raw PDFs (needs a Firecrawl key)

Parses all 24 PDFs from scratch, then publishes.

1. Get a free key at [firecrawl.dev](https://www.firecrawl.dev)
2. Open `.env` (created by `make setup`) and set:
   ```
   FIRECRAWL_API_KEY=fc-your-key-here
   ```
3. Run:
   ```bash
   make full-demo
   ```

> `FORCE_COLOR=1 make full-demo` gives nicer terminal output.

> **Why the key is required here:** `make full-demo` runs `extract --no-fallback`, so a missing key **errors
> out** instead of silently falling back to the local parser. The key is not inherently mandatory — the bare
> `make extract` target keeps the fallback on and uses the local `pypdf` parser when no key is set; only
> `--no-fallback` enforces Firecrawl. (The cockpit demo above always uses the local parser regardless.)

Both CLI options run in **enhanced** mode by default — see [Recall mode](#recall-mode-legacy-vs-enhanced)
below.

---

## Recall mode (legacy vs enhanced)

This is the main thing to understand before running the backend. The pipeline has **two modes**, controlled
by one setting.

| Mode | Schema | What you get |
| ---- | ------ | ------------ |
| **`enhanced`** *(default)* | `1.1.0` | The full comparability layer: recovered drifted labels, sector-aware checks, basis tags + "refused comparison" flags, cross-source validation, and normalized values. |
| **`legacy`** | `1.0.0` | The original behavior, byte-for-byte. A safe fallback and the retro-compatibility baseline. |

Pick the mode per run with `--recall-mode`, or globally with the `RECALL_MODE` environment variable:

```bash
make publish                                                          # enhanced (the default)
python -m portfolio_metrics publish --input-dir outputs/parsed --recall-mode legacy
```

**`enhanced` is a strict superset of `legacy`.** It only *adds* rows and columns; it never changes or drops
a value that legacy already captured. That makes switching modes a safe, one-flag operation — and it is also
the rollback: set `legacy` (or `RECALL_MODE=legacy`) to revert everything to the original output.

**What enhanced adds** (measured on the 24-document corpus, independently re-audited):

- **Recall 76% → 90%** — recovers 18 values that label drift used to silently drop. Example: NovaCloud's ARR
  now reads across all 5 quarters (the label was renamed 3 times), and a company's own report outranks a
  mistyped portfolio summary (MediSight's real $27.9M instead of the summary's swapped $22.4M).
- **Sector-aware checks** — a private-credit lender is no longer flagged for "missing" SaaS metrics it never
  reports (15 false "missing metric" alarms → 0).
- **Refuse-to-compare** — a lender's gross margin is tagged `interest_margin` and marked `refused` beside
  SaaS margins, instead of silently sharing a column with a number that means something different.
- **Cross-validation** — when a company report and a portfolio summary disagree, the gap is surfaced with a
  `delta` (the company report still wins; the disagreement is just made visible).
- **Normalized values** — e.g. a payments company's cash shown net of segregated client float ($38.4M raw →
  $32.2M comparable), in a separate `value_normalized` field that never overwrites the raw `value`.

The `1.1.0` enhanced export is a **frozen contract** a future front-end (a "monitoring cockpit") binds to;
`1.0.0` is the exact original output. New fields are additive, so a `1.0.0` reader keeps working unchanged.

---

## Expected output

Every run writes three files to `outputs/`:

| File                        | Contents                                                               |
| --------------------------- | ---------------------------------------------------------------------- |
| `outputs/metrics_long.json` | Canonical export — all metrics with provenance, confidence, and dedupe |
| `outputs/metrics_long.csv`  | Spreadsheet-friendly projection of the JSON                            |
| `outputs/summary.md`        | Human-readable summary                                                 |

**Expected numbers:**

| Run                              | Mode                 | Docs | Metrics | Issues | Schema  |
| -------------------------------- | -------------------- | ---: | ------: | -----: | ------- |
| `make demo`                      | enhanced *(default)* |    3 |      26 |     21 | `1.1.0` |
| `make publish` / `make full-demo`| enhanced *(default)* |   24 |     116 |    104 | `1.1.0` |
| the same, `--recall-mode legacy` | legacy               |   24 |      99 |    125 | `1.0.0` |

The headline stays clean in both modes (0 invalid metrics, 0 duplicate
`(company_name, period, canonical_metric)` groups). Enhanced captures **17 more metrics** and raises **21
fewer false issues** on the full corpus — that is the recall + comparability fix at work.

---

## Verify the repo

```bash
make check          # 95 pytest tests + ruff lint — all should pass
make verify-golden  # proves the legacy output is still byte-identical to the committed baseline
```

`make verify-golden` is the retro-compatibility canary: it publishes the 24-document corpus in **both** modes
and diffs each against a committed baseline (`tests/golden/`), so any accidental drift in the default output —
or any regression that breaks the legacy contract — fails the build immediately.

Recommended full evaluator flow:

```bash
make check
make demo
```

---

## How it works

```
intake-pdf/*.pdf
       │
       ▼
  [extract]  ── parser abstraction (Firecrawl or local pypdf)
       │
       ▼
  outputs/parsed/*.parsed.json
       │
       ▼
  [publish]  ── detect ─▶ normalize ─▶ dedupe ─▶ write artifacts
       │          │           │           │
       │      alias +     sector +     company-report
       │      footnote    basis tags   wins + cross-
       │      recovery    + refuse     validation flag
       │      (recall)    to compare
       ▼
  outputs/metrics_long.json  +  .csv  +  summary.md
```

**Decisions worth noting:**

1. **Deterministic extraction** — metric detection and numeric parsing are rule-based, not LLM-driven. An
   alias dictionary handles `ARR`, `Annual Recurring Revenue`, `annualized recurring revenue`, etc. In
   enhanced mode a second alias set plus a footnote-equivalence pass recovers renamed labels (`End-of-Period
   ARR`, `Subscription ARR (end of period)`, `Net Revenue` ≡ `Recognized Revenue`, …). LLMs are reserved for
   ambiguous label classification only (not yet needed).
2. **Additive + gated** — every comparability behavior lives behind the `recall_mode` gate. Non-opted-in
   callers (`legacy`) see byte-identical output; only the default flip turns the new behavior on.
3. **Explicit provenance** — `source_file`, `source_page` (where available), `raw_label`, and
   `source_snippet` travel with every output row, so any number is traceable back to its document.
4. **Cross-document dedupe** — when the same `(company, period, metric)` appears in both a company report and
   a portfolio summary, the company report row wins. In enhanced mode a genuine disagreement also emits a
   `cross_source_discrepancy` issue carrying the two values and their `delta`.
5. **Comparability guard** — metrics that share a canonical name but a different *basis* (e.g. a lender's
   interest-margin "gross margin") are marked `comparison_status = "refused"` and reported as a
   `basis_collision`, rather than being silently ranked against each other.

---

## Design decisions

### Deterministic parsing for the live demo

For the frontend cockpit demo (`make serve` — the Quick start above) we **deliberately choose the deterministic
path**: it forces the local `pypdf` parser (`LocalPdfParser`) for every PDF rather than the configurable
cloud parser. This is a design choice, not a limitation — it follows the project's governing principle of
automating what is **"deterministic, traceable, and internal"** (`case-study/00-foundations-and-decisions.md`,
§10–11) and keeps the demo on the surface that _"leads with the moat (provenance), not BI chrome."_

- **Reproducibility.** The same PDF yields the **same numbers on every run** — no cloud-model drift between
  runs. This is the foundation of the "trust the numbers" thesis: a metric is only as trustworthy as it is
  _reproducible_, and every number carries its provenance (source file, original label, snippet, confidence)
  so it can be re-derived and audited.
- **Offline reliability.** The demo makes **no network call**, so nothing can fail live — no API outage,
  timeout, or rate limit can interrupt a screen-share. Together with the committed `web/dist` bundle, the whole
  cockpit runs with the wifi off.
- **Data privacy.** Sensitive portfolio financials **never leave the machine** — no document or figure is sent
  to a third-party service. For confidential holdings the data path stays fully internal.
- **Cost & independence.** No per-PDF API cost, no rate limits, and no dependency on an external vendor's
  uptime — _"right-sized AI: plain rules for the bulk … cheap, predictable, auditable."_

The choice is enforced **in code, not by configuration**: `portfolio_metrics/webapp.py` builds
`LocalPdfParser()` directly and asserts `parser_used == "local"` for every document (invariant _H2_), so the
demo is offline **by construction** — even on a machine that has a cloud API key configured. A configurable
cloud parser (`PDF_PARSER`, used by the CLI Firecrawl path — Option B above) remains available for non-demo use; the live demo
deliberately does not use it, and both paths feed the identical downstream normalization + provenance pipeline.

---

## Metrics extracted

Eight canonical metrics form the universal core; the sector classifier decides which of them actually apply
to each company (a private-credit lender, for instance, is not expected to report ARR).

| Canonical key               | Sample raw labels matched                        |
| --------------------------- | ------------------------------------------------ |
| `revenue_qtr`               | Revenue, Q2 Revenue, Quarterly Revenue, Net Revenue |
| `arr_eop`                   | ARR, Annual Recurring Revenue, End-of-Period ARR |
| `gross_margin_pct`          | Gross Margin, GM%, Gross Profit Margin           |
| `cash_balance`              | Cash, Cash Balance, Cash & Equivalents           |
| `monthly_burn`              | Net Burn, Monthly Burn, Cash Burn                |
| `headcount`                 | Headcount, FTEs, Total Employees                 |
| `net_revenue_retention_pct` | NRR, Net Revenue Retention, NRR(LTM)             |
| `logo_churn_pct`            | Logo Churn, Customer Churn Rate, Annual Logo Churn |

Sectors recognized by the classifier: `saas`, `credit`, `marketplace`, `payments`.

---

## Make targets

`make` manages `.venv` automatically — no manual activation needed.

| Target              | What it does                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `make setup`        | Create `.venv`, install deps, seed `.env` from `.env.example`      |
| `make demo`         | Preflight + publish from checked-in fixtures (no API key)          |
| `make full-demo`    | Preflight + extract raw PDFs + publish (needs `FIRECRAWL_API_KEY`) |
| `make publish`      | Publish artifacts from `outputs/parsed/` into `outputs/`           |
| `make normalize`    | Print the normalization report for `outputs/parsed/`              |
| `make check`        | Run pytest + ruff                                                  |
| `make test`         | Run pytest only                                                    |
| `make verify-golden`| Prove legacy output is byte-identical to the committed baseline    |
| `make lint`         | Run ruff only                                                      |
| `make preflight`    | Print local readiness report                                       |
| `make extract`      | Parse PDFs from `intake-pdf/` into `outputs/parsed/`               |
| `make clean`        | Delete generated outputs (keeps `.gitkeep`)                        |
| `make serve`        | Serve the offline **cockpit web app** at http://127.0.0.1:5000 (installs the `web` extra) |
| `make build-web`    | Rebuild the frontend bundle into `web/dist` (only if you change `web/` source)     |

> Add `--recall-mode legacy` (or `RECALL_MODE=legacy`) to any `publish` / `normalize` invocation to run the
> original 1.0.0 behavior. Without it, the default is `enhanced`.

---

## Project layout

```
sagard-portfolio-metric-extractor/
├── intake-pdf/              ← 24 sample PDFs (already included)
├── outputs/
│   ├── metrics_long.json    ← canonical export (gitignored)
│   ├── metrics_long.csv
│   ├── summary.md
│   └── parsed/              ← per-document parser output
├── portfolio_metrics/       ← source package
│   ├── cli.py               ← argument parsing + command wiring
│   ├── config.py            ← Settings (incl. the RECALL_MODE default)
│   ├── pipeline.py          ← per-document normalization + enrichment hub
│   ├── extract_text.py
│   ├── parser_firecrawl.py
│   ├── parser_local.py
│   ├── detect_metrics.py    ← label → canonical alias + sector classifier
│   ├── metric_aliases.py    ← alias registry (legacy + extended)
│   ├── sector_profiles.py   ← which metrics each sector is expected to report
│   ├── normalize.py
│   ├── parse_values.py
│   ├── publish.py           ← dedupe, comparability guard, export + summary
│   ├── schema.py            ← the frozen data contract (1.0.0 / 1.1.0)
│   └── terminal_ui.py
├── tests/
│   ├── fixtures/parsed/     ← checked-in parsed fixtures (used by make demo)
│   └── golden/              ← committed 24-doc corpus + legacy/enhanced baselines
├── .env.example
├── Makefile
└── pyproject.toml
```

---

## Environment variables

`make setup` creates `.env` from `.env.example` automatically.

| Variable             | Default     | Required for                         |
| -------------------- | ----------- | ------------------------------------ |
| `RECALL_MODE`        | `enhanced`  | Global default recall mode (`legacy` / `enhanced`) |
| `PDF_PARSER`         | `firecrawl` | Controls which parser is used        |
| `FIRECRAWL_API_KEY`  | —           | `make full-demo` only                |
| `FIRECRAWL_PDF_MODE` | `auto`      | `fast` / `auto` / `ocr`              |
| `OPENAI_API_KEY`     | —           | Not required by the current pipeline |

> `--recall-mode` on the command line overrides `RECALL_MODE` for that run.
> `OPENAI_API_KEY` appears in preflight output but the current extraction pipeline does **not** call OpenAI.
> It is wired for optional future label disambiguation only.
