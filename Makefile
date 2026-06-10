PYTHON ?= python3
INPUT_DIR ?= intake-pdf
OUTPUT_DIR ?= outputs

.PHONY: install run preflight test lint clean

install:
	$(PYTHON) -m pip install -e ".[dev]"

run: preflight

preflight:
	$(PYTHON) -m portfolio_metrics preflight --input-dir $(INPUT_DIR) --output-dir $(OUTPUT_DIR)

test:
	$(PYTHON) -m pytest

lint:
	$(PYTHON) -m ruff check portfolio_metrics tests

clean:
	if [ -d outputs ]; then find outputs -mindepth 1 ! -name '.gitkeep' -delete; fi
	rm -rf .pytest_cache .ruff_cache .mypy_cache
