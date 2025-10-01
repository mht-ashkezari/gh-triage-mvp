SHELL := /bin/bash
VENV := .venv
PY   := $(VENV)/bin/python
PIP  := $(VENV)/bin/pip
ROOT ?= $(shell git rev-parse --show-toplevel 2>/dev/null || realpath ../../../)
REPO ?= microsoft__vscode

.PHONY: venv lock sync sample clean

venv:
	python3 -m venv $(VENV)
	$(PIP) install -U pip setuptools wheel pip-tools

lock: venv
	$(VENV)/bin/pip-compile --generate-hashes -o requirements.txt requirements.in

sync: venv
	$(VENV)/bin/pip-sync requirements.txt

sample: sync
	$(PY) build_sample.py --repo $(REPO) \
	  --base "$(ROOT)/datasets/snapshots" \
	  --manifest "$(ROOT)/datasets/snapshots/manifest.yaml"

clean:
	rm -rf $(VENV)
