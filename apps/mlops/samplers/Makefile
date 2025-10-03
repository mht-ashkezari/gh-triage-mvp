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


# === Full dataset pipeline ===
MAX_PAGES ?= 4
ONLY ?=

datasets-all:
	# 1. Run snapshot (scoped if ONLY/MAX_PAGES set)
	if [ -n "$(ONLY)" ]; then \
		echo "→ Snapshotting only $(ONLY) with max-pages=$(MAX_PAGES)"; \
		pnpm run snapshot --only $(ONLY) --types issues --max-pages $(MAX_PAGES); \
	else \
		pnpm run snapshot; \
	fi

	# 2. Build balanced samples
	if [ -n "$(ONLY)" ]; then \
		$(MAKE) sample REPO=$(ONLY); \
	else \
		for repo in $$(yq -r '.repos[] | .owner + "__" + .name' $(ROOT)/datasets/snapshots/manifest.yaml); do \
			echo "→ Building balanced sample for $$repo"; \
			$(MAKE) sample REPO=$$repo || exit 1; \
		done; \
	fi

	# 3. Remove raw/ directories and tmp shards (must not be committed)
	rm -rf $(ROOT)/datasets/snapshots/*/raw
	find $(ROOT)/datasets/snapshots -type f -name '*.run-*.tmp' -delete

	# 4. Run dataset validation tests
	pnpm vitest run tests/datasets.spec.ts