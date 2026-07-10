# Sagard Portfolio Metric Extractor

A command-line (CLI) pipeline that extracts a canonical set of financial metrics from quarterly
portfolio-company PDFs, normalizes them across inconsistent reporting formats, and publishes auditable
artifacts.

**The core idea:** *the same label does not always mean the same metric.* Two companies can both report
"Gross Margin" and mean different things — a SaaS software margin vs. a lender's interest spread. So the
tool's job is not only to pull numbers out; it is to make them **comparable and traceable**: every value
carries its source, and the tool visibly **refuses** to line up two numbers that are not actually the same
metric. Comparability is the product, not extraction.

---

## Prerequisites

- **Python 3.12+** — check with `python3 --version`
- bash or zsh
- No Node.js, Docker, or database required

---

## Quick start

### Path A — No API keys needed (start here)

Uses checked-in parsed fixtures. Runs in a few seconds.

```bash
cd personal/sagard-portfolio-metric-extractor
make setup
make demo
```

### Path B — Full pipeline from raw PDFs (needs a Firecrawl key)

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

Both paths run in **enhanced** mode by default — see [Recall mode](#recall-mode-legacy-vs-enhanced) below.

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
