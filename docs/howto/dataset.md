# Datasets: snapshot & sample (P0.3)

This document explains how to fetch private GitHub snapshots, produce a tiny **balanced** sample that’s safe to commit, and what the CI checks enforce.

---

## 0) Prerequisites

- **Node.js 22** and **pnpm** (CI uses Corepack to enable pnpm automatically).
- **Python 3.11** for the sampler.
- A GitHub auth method:
  - **Classic PAT** (recommended for public + your private repos): export it as `GITHUB_TOKEN`.
  - Or **GitHub CLI**: `gh auth login` then `export GITHUB_TOKEN=$(gh auth token)`.
  - Or a **GitHub App installation token** (advanced; see P0.2).

> Keep raw data private — only commit manifest, meta, and tiny balanced samples.

---

## 1) Configure what to fetch

Edit `datasets/snapshots/manifest.yaml`:

```yaml
version: "snapshot.manifest.v1"
window:
  since: "2024-01-01T00:00:00Z"
  until: "2025-01-01T00:00:00Z"

repos:
  - owner: microsoft
    name: vscode
    labels_target_per_class: 2   # tuned so balanced sample ≲ 500 rows
  - owner: mht-ashkezari
    name: your-repo
    labels_target_per_class: 40  # adjust as needed

notes:
  - "Private raw stored only under snapshots/<owner>__<repo>/raw; only sample+meta committed."
