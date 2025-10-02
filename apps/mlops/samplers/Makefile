SHELL := /bin/bash
VENV := .venv
PY   := $(VENV)/bin/python
PIP  := $(VENV)/bin/pip
ROOT ?= $(shell git rev-parse --show-toplevel 2>/dev/null || realpath ../../../)
REPO ?= microsoft__vscode

.PHONY: venv install sample show clean

.ONESHELL:
SHELL := /bin/bash

venv:
	python3 -m venv $(VENV)
	$(PIP) install -U pip wheel

install: venv
	@if [ -f requirements.txt ]; then \
		$(PIP) install -r requirements.txt; \
	else \
		echo "requirements.txt missing. Create one (or bring back pip-compile)"; \
		exit 1; \
	fi

# Build a balanced sample for one repo
sample: install
	@echo "→ Building balanced sample for $(REPO)"
	$(PY) build_sample.py --repo $(REPO) \
	  --base "$(ROOT)/datasets/snapshots" \
	  --manifest "$(ROOT)/datasets/snapshots/manifest.yaml"

# Preview a few rows and the top of stats.json
show:
	@outdir="$(ROOT)/datasets/snapshots/$(REPO)"; \
	head -n 5 "$$outdir/sample/issues.sample.balanced.jsonl" 2>/dev/null || true; \
	head -n 20 "$$outdir/meta/stats.json" 2>/dev/null || true

clean:
	rm -rf $(VENV)
