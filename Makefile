PYTHON ?= python3
INPUT_DIR ?= intake-pdf
OUTPUT_DIR ?= outputs
PARSED_OUTPUT_DIR ?= outputs/parsed
FIXTURE_DIR ?= tests/fixtures/parsed

.PHONY: install run preflight extract extract-fixtures publish test lint clean

install:
	$(PYTHON) -m pip install -e ".[dev]"

run: preflight

preflight:
	$(PYTHON) -m portfolio_metrics preflight --input-dir $(INPUT_DIR) --output-dir $(OUTPUT_DIR)

extract:
	$(PYTHON) -m portfolio_metrics extract --input-dir $(INPUT_DIR) --output-dir $(PARSED_OUTPUT_DIR)

extract-fixtures:
	$(PYTHON) -m portfolio_metrics extract --input-dir $(INPUT_DIR) --output-dir $(FIXTURE_DIR) --parser local

publish:
	$(PYTHON) -m portfolio_metrics publish --input-dir $(PARSED_OUTPUT_DIR) --output-dir $(OUTPUT_DIR) --include-csv --include-summary

test:
	$(PYTHON) -m pytest

lint:
	$(PYTHON) -m ruff check portfolio_metrics tests

clean:
	if [ -d outputs ]; then find outputs -mindepth 1 ! -name '.gitkeep' -delete; fi
	rm -rf .pytest_cache .ruff_cache .mypy_cache
