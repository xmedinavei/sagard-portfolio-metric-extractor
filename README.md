# Sagard Portfolio Metric Extractor

CLI-first proof of concept for extracting key portfolio metrics from quarterly PDF updates.

## Status

Phase 2 extraction is complete in this repository.

What exists today:

- reproducible Python project packaging
- environment contract via `.env.example`
- a small CLI preflight command for local readiness checks
- a parser abstraction with Firecrawl + local implementations
- a Phase 2 extraction command that writes parsed JSON + markdown artifacts
- an `outputs/` directory contract for generated artifacts
- a pytest/ruff test and lint foundation

What is intentionally not implemented yet:

- metric detection
- normalization
- JSON output generation

Those land in later phases so the extraction seam stays honest and easy to defend.

## Quickstart

1. Create and activate a virtual environment.
2. Install the project in editable mode.
3. Copy `.env.example` to `.env` if you need a fresh local config.
4. Run the preflight check.
5. Run the Phase 2 extractor on representative PDFs.

Common commands:

- `make install`
- `make run`
- `make extract`
- `make extract-fixtures`
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
│   └── parsed/
├── plan/
├── spec/
├── options/
├── portfolio_metrics/
│   ├── extract_text.py
│   ├── parser.py
│   ├── parser_firecrawl.py
│   ├── parser_local.py
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

Phase 3 will build metric detection and normalization on top of the checked-in parser contract and representative fixtures.
