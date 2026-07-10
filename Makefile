SYSTEM_PYTHON ?= python3
VENV_DIR ?= .venv
PYTHON ?= $(VENV_DIR)/bin/python
PIP := $(PYTHON) -m pip
CLI := $(PYTHON) -m portfolio_metrics
SETUP_STAMP := $(VENV_DIR)/.installed
INPUT_DIR ?= intake-pdf
OUTPUT_DIR ?= outputs
PARSED_OUTPUT_DIR ?= outputs/parsed
FIXTURE_DIR ?= tests/fixtures/parsed

.PHONY: setup install run demo full-demo preflight extract extract-fixtures normalize publish check test verify-golden lint clean

$(PYTHON):
	$(SYSTEM_PYTHON) -m venv $(VENV_DIR)

$(SETUP_STAMP): pyproject.toml | $(PYTHON)
	$(PIP) install --upgrade pip
	$(PIP) install -e ".[dev]"
	touch $(SETUP_STAMP)

setup: $(SETUP_STAMP)
	if [ ! -f .env ]; then cp .env.example .env; fi
	@echo "Setup complete."
	@echo "Next step: run 'make demo' for the fast fixture-based flow, 'make full-demo' for raw PDFs, or 'make check' for tests + lint."

install: setup

run: demo

demo: setup
	$(CLI) preflight --input-dir $(INPUT_DIR) --output-dir $(OUTPUT_DIR)
	$(CLI) publish --input-dir $(FIXTURE_DIR) --output-dir $(OUTPUT_DIR) --include-csv --include-summary

full-demo: setup
	$(CLI) preflight --input-dir $(INPUT_DIR) --output-dir $(OUTPUT_DIR)
	$(CLI) extract $(INPUT_DIR) --output-dir $(PARSED_OUTPUT_DIR) --no-fallback
	$(CLI) publish --input-dir $(PARSED_OUTPUT_DIR) --output-dir $(OUTPUT_DIR) --include-csv --include-summary

preflight: setup
	$(CLI) preflight --input-dir $(INPUT_DIR) --output-dir $(OUTPUT_DIR)

extract: setup
	$(CLI) extract $(INPUT_DIR) --output-dir $(PARSED_OUTPUT_DIR)

extract-fixtures: setup
	$(CLI) extract --input-dir $(INPUT_DIR) --output-dir $(FIXTURE_DIR) --parser local

normalize: setup
	$(CLI) normalize --input-dir $(PARSED_OUTPUT_DIR)

publish: setup
	$(CLI) publish --input-dir $(PARSED_OUTPUT_DIR) --output-dir $(OUTPUT_DIR) --include-csv --include-summary

check: setup
	$(PYTHON) -m pytest
	$(PYTHON) -m ruff check portfolio_metrics tests

test: setup
	$(PYTHON) -m pytest

verify-golden: setup
	$(PYTHON) -m pytest tests/test_golden.py -q

lint: setup
	$(PYTHON) -m ruff check portfolio_metrics tests

clean:
	if [ -d outputs ]; then find outputs -mindepth 1 ! -name '.gitkeep' -delete; fi
	rm -rf .pytest_cache .ruff_cache .mypy_cache
