# Sagard Portfolio Metric Extractor

CLI-first proof of concept for extracting key portfolio metrics from quarterly PDF updates.

## Status

Phase 4 artifact publishing is complete in this repository.

What exists today:

- reproducible Python project packaging
- environment contract via `.env.example`
- a small CLI preflight command for local readiness checks
- a parser abstraction with Firecrawl + local implementations
- a Phase 2 extraction command that writes parsed JSON + markdown artifacts
- a Phase 3 normalization command that reads parsed JSON and prints a reviewable summary or JSON to stdout
- a Phase 4 publish command that writes canonical `metrics_long.json` artifacts plus optional CSV / markdown review outputs
- an `outputs/` directory contract for generated artifacts
- a pytest/ruff test and lint foundation

What is intentionally not implemented yet:

- Phase 5 validation and hardening work
- Phase 6 review packaging beyond the generated artifacts and README

Those land in later phases so the extraction and normalization seams stay honest and easy to defend.

## Quickstart

1. Create and activate a virtual environment.
2. Install the project in editable mode.
3. Copy `.env.example` to `.env` if you need a fresh local config.
4. Run the preflight check.
5. Run the Phase 2 extractor on representative PDFs.
6. Run the Phase 3 normalizer on the resulting parsed JSON artifacts.

Common commands:

- `make install`
- `make run`
- `make extract`
- `make extract-fixtures`
- `make publish`
- `make test`
- `make lint`

The default smoke test is:

- `portfolio-metrics preflight`

If you prefer the module form:

- `python -m portfolio_metrics preflight`

## What the preflight command checks

`preflight` validates the current Phase 1 contract:

- the repository root resolves correctly
- `intake-pdf/` exists and contains PDF files
- `outputs/` exists for generated artifacts
- the configured parser strategy is readable from environment variables
- provider keys are reported as configured or pending without calling external services

If Firecrawl is configured, the extractor will use it first. If not, the extractor falls back to the
local parser by default so the project remains runnable offline.

## Phase 2 extraction command

The extraction layer writes two artifacts per PDF:

- `<name>.parsed.json` — the stable parser contract consumed by later phases
- `<name>.parsed.md` — a human-readable review artifact with provenance notes

Run the representative extraction set:

- `portfolio-metrics extract`

Force the local parser:

- `portfolio-metrics extract --parser local`

Write checked-in fixtures for the three representative PDFs:

- `make extract-fixtures`

The default output directory is `outputs/parsed/`.

## Phase 3 normalization command

The normalization layer consumes the stable Phase 2 parser contract:

- `<name>.parsed.json` — Phase 2 parser output in the shared document schema

It intentionally does **not** write Phase 4 artifacts yet. Instead, it prints either:

- a concise human-readable summary, or
- full JSON to stdout for automation or inspection

Normalize all parsed artifacts in the default directory:

- `portfolio-metrics normalize`

Normalize the checked-in representative fixtures:

- `portfolio-metrics normalize --input-dir tests/fixtures/parsed`

Request machine-readable output:

- `portfolio-metrics normalize --format json`

Use the next command when you want persisted outputs.

## Phase 4 publish command

The Phase 4 export layer reuses the Phase 3 normalizer and writes stable artifacts to `outputs/`.

Canonical artifact:

- `metrics_long.json` — the long-form metric export with metadata, provenance, confidence, and carried-forward issues

Optional derived artifacts:

- `metrics_long.csv` — spreadsheet-friendly projection of the canonical JSON
- `summary.md` — lightweight human-readable summary derived from the same export

Write the canonical JSON only:

- `portfolio-metrics publish`

Write JSON plus review artifacts:

- `portfolio-metrics publish --include-csv --include-summary`

Use the checked-in representative fixtures as the input set:

- `portfolio-metrics publish --input-dir tests/fixtures/parsed --include-csv --include-summary`

## Provenance strategy

Phase 2 preserves the source information that later normalization needs without pretending we have more
precision than we do:

- **Local parser**: file-level and page-level provenance
- **Firecrawl parser**: file-level provenance plus total page count metadata when available
- **Snippet provenance**: intentionally deferred to Phase 3, where metric detection will capture nearby text

This keeps the extraction contract stable while remaining honest about what each parser can guarantee.

## Repository layout

```text
sagard-portfolio-metric-extractor/
├── intake-pdf/
├── outputs/
│   ├── metrics_long.json
│   ├── metrics_long.csv
│   ├── summary.md
│   └── parsed/
├── plan/
├── spec/
├── options/
├── portfolio_metrics/
│   ├── detect_metrics.py
│   ├── extract_text.py
│   ├── metric_aliases.py
│   ├── normalize.py
│   ├── parser.py
│   ├── parser_firecrawl.py
│   ├── parser_local.py
│   ├── parse_values.py
│   ├── pipeline.py
│   └── schema.py
├── tests/
│   └── fixtures/
│       └── parsed/
├── .env.example
├── .gitignore
├── Makefile
├── pyproject.toml
└── README.md
```

## Next phase

Phase 5 can now focus on validation, hardening, and review confidence over the exported artifacts.
