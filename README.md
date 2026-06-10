# Sagard Portfolio Metric Extractor

CLI-first proof of concept for extracting key portfolio metrics from quarterly PDF updates.

## Status

Phase 1 bootstrap is complete in this repository.

What exists today:

- reproducible Python project packaging
- environment contract via `.env.example`
- a small CLI preflight command for local readiness checks
- an `outputs/` directory contract for generated artifacts
- a pytest/ruff test and lint foundation

What is intentionally not implemented yet:

- PDF parsing
- metric detection
- normalization
- JSON output generation

Those land in later phases so the bootstrap stays honest and easy to defend.

## Quickstart

1. Create and activate a virtual environment.
2. Install the project in editable mode.
3. Copy `.env.example` to `.env` if you need a fresh local config.
4. Run the preflight check.

Common commands:

- `make install`
- `make run`
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

Provider keys are optional for Phase 1. They become relevant once Phase 2 starts integrating extraction providers.

## Repository layout

```text
sagard-portfolio-metric-extractor/
├── intake-pdf/
├── outputs/
├── plan/
├── spec/
├── options/
├── portfolio_metrics/
├── tests/
├── .env.example
├── .gitignore
├── Makefile
├── pyproject.toml
└── README.md
```

## Next phase

Phase 2 will add the extraction layer behind the existing CLI and environment contract. Until then, this repo is deliberately bootstrap-only.
