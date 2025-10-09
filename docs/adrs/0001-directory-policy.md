# 0001. Directory Policy — Committed Helpers in /tooling/**, Local Scratch Outside Version Control
Date: 2025-10-06
Status: Accepted

## Context
To maintain a consistent and auditable repository structure, all helper utilities and automation code must reside in a single, versioned location.
Developers may still create personal or experimental scripts locally, but these should remain outside version control and never affect tracked code or CI.

## Decision
- All **committed** helper utilities live under `/tooling/{ci,dev,data}/**`.
- **Local development or scratch scripts** (for experiments, one-off snapshots, etc.) may exist outside version control—for example, in a **developer-local scratch folder** — but:
  - They must **never be tracked** in Git.
  - They must **never be referenced** by any tracked files (e.g., `package.json`, CI workflows, or documentation).

## Consequences
- The CI guard enforces this policy by checking that:
  1. No tracked files exist under `/[developer-local scratch folder]/**`.
  2. No tracked files reference `/[developer-local scratch folder]/` in their contents.
- Official documentation and code examples reference **`/tooling/**`** as the sole location for repository-managed helpers.
- Contributors retain flexibility for private experimentation while ensuring the shared repository remains deterministic, portable, and compliant with governance standards.
