# Sagard Portfolio Metric Extractor

A CLI pipeline that extracts a canonical set of financial metrics from quarterly portfolio company PDFs, normalizes them across inconsistent reporting formats, and publishes auditable artifacts.

---

## Prerequisites

- **Python 3.12+** — check with `python3 --version`
- bash or zsh
- No Node.js, Docker, or database required

---

## Quick start

### Path A — No API keys needed (start here)

Uses checked-in parsed fixtures. Runs in under 30 seconds.

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

---

## Expected output

Both paths write three files to `outputs/`:

| File                        | Contents                                                               |
| --------------------------- | ---------------------------------------------------------------------- |
| `outputs/metrics_long.json` | Canonical export — all metrics with provenance, confidence, and dedupe |
| `outputs/metrics_long.csv`  | Spreadsheet-friendly projection of the JSON                            |
| `outputs/summary.md`        | Human-readable summary                                                 |

**Expected numbers (last validated run):**

```
24 documents processed
99 valid metrics exported
 0 invalid metrics
 0 duplicate (company_name, period, canonical_metric) groups
```

---

## Verify the repo

```bash
make check
```

Runs pytest (46 tests) and ruff lint. Both should pass with zero failures.

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
  [publish]  ── detect → normalize → dedupe → write artifacts
       │
       ▼
  outputs/metrics_long.json  +  .csv  +  summary.md
```

**Four decisions worth noting:**

1. **Deterministic extraction** — metric detection and numeric parsing are rule-based, not LLM-driven. The alias dictionary handles `ARR`, `Annual Recurring Revenue`, `annualized recurring revenue`, etc. LLMs are reserved for ambiguous label classification only (not yet needed).
2. **Parser abstraction** — Firecrawl handles complex layouts well. The local `pypdf` parser is the zero-key fallback. Switching is one env var change (`PDF_PARSER=local`).
3. **Explicit provenance** — `source_file`, `source_page` (where available), `raw_label`, and `source_snippet` travel with every output row.
4. **Cross-document dedupe** — when the same `(company, period, metric)` appears in both a company report and a portfolio summary, the company report row wins.

---

## Metrics extracted

| Canonical key               | Sample raw labels matched              |
| --------------------------- | -------------------------------------- |
| `revenue_qtr`               | Revenue, Q2 Revenue, Quarterly Revenue |
| `arr_eop`                   | ARR, Annual Recurring Revenue, ARR EOP |
| `gross_margin_pct`          | Gross Margin, GM%, Gross Profit Margin |
| `cash_balance`              | Cash, Cash Balance, Cash & Equivalents |
| `monthly_burn`              | Net Burn, Monthly Burn, Cash Burn      |
| `headcount`                 | Headcount, FTEs, Total Employees       |
| `net_revenue_retention_pct` | NRR, Net Revenue Retention             |
| `logo_churn_pct`            | Logo Churn, Customer Churn Rate        |

---

## Make targets

`make` manages `.venv` automatically — no manual activation needed.

| Target           | What it does                                                       |
| ---------------- | ------------------------------------------------------------------ |
| `make setup`     | Create `.venv`, install deps, seed `.env` from `.env.example`      |
| `make demo`      | Preflight + publish from checked-in fixtures (no API key)          |
| `make full-demo` | Preflight + extract raw PDFs + publish (needs `FIRECRAWL_API_KEY`) |
| `make check`     | Run pytest + ruff                                                  |
| `make test`      | Run pytest only                                                    |
| `make lint`      | Run ruff only                                                      |
| `make preflight` | Print local readiness report                                       |
| `make extract`   | Parse PDFs from `intake-pdf/` into `outputs/parsed/`               |
| `make publish`   | Publish artifacts from `outputs/parsed/` into `outputs/`           |
| `make clean`     | Delete generated outputs (keeps `.gitkeep`)                        |

---

## Project layout

```
sagard-portfolio-metric-extractor/
├── intake-pdf/              ← 24 sample PDFs (already included)
├── outputs/
│   ├── metrics_long.json    ← canonical export
│   ├── metrics_long.csv
│   ├── summary.md
│   └── parsed/              ← per-document parser output
├── portfolio_metrics/       ← source package
│   ├── cli.py
│   ├── pipeline.py
│   ├── extract_text.py
│   ├── parser_firecrawl.py
│   ├── parser_local.py
│   ├── detect_metrics.py
│   ├── metric_aliases.py
│   ├── normalize.py
│   ├── parse_values.py
│   ├── publish.py
│   ├── schema.py
│   └── terminal_ui.py
├── tests/
│   └── fixtures/parsed/     ← checked-in parsed fixtures (used by make demo)
├── .env.example
├── Makefile
└── pyproject.toml
```

---

## Environment variables

`make setup` creates `.env` from `.env.example` automatically.

| Variable             | Default     | Required for                         |
| -------------------- | ----------- | ------------------------------------ |
| `PDF_PARSER`         | `firecrawl` | Controls which parser is used        |
| `FIRECRAWL_API_KEY`  | —           | `make full-demo` only                |
| `FIRECRAWL_PDF_MODE` | `auto`      | `fast` / `auto` / `ocr`              |
| `OPENAI_API_KEY`     | —           | Not required by the current pipeline |

> `OPENAI_API_KEY` appears in preflight output but the current extraction pipeline does **not** call OpenAI. It is wired for optional future label disambiguation only.
