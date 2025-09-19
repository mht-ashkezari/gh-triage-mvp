# Project Charter — gh-triage-mvp (v1)

## 1) Summary (one-liner)
Automatically triage GitHub issues/PRs and draft high-quality release notes for selected private repos, with measurable quality KPIs and CI guardrails.

## 2) Problem & Goals
Maintainers spend significant time labeling, de-duplicating, prioritizing, and assembling releases. We aim to:
- Reduce manual triage time and inconsistencies.
- Improve label quality and duplicate detection.
- Generate a first-pass release draft maintainers minimally edit.

### Primary Goals
- Contract-first APIs and schema-validated JSON outputs.
- CI-enforced KPIs for quality, latency, and cost.
- Private-by-default workflows and artifacts.

### Non-Goals (for v1)
- Broad multi-org rollout (focus on 1–2 repos).
- Fine-grained per-team RBAC beyond GitHub App scopes.
- Full-blown analytics UI (basic artifacts/plots only).

## 3) Personas
- **Maintainer (Mia):** Owns repo health; wants consistent labels, fewer duplicates, fast release notes.
- **Contributor (Cal):** Files issues/PRs; benefits from clear templates and labels.
- **Release Captain (Rae):** Packages a changelog; wants reliable draft notes with minimal edits.
- **Platform Admin (Pat):** Installs the GitHub App and enforces privacy/egress/secrets policy.

## 4) Target Repositories (private)
- **Primary:** `acme/triage-playground` — mid-traffic, mixed issues/PRs, clear labels.
- **Secondary (optional for eval):** `acme/sdk-internal` — higher PR velocity, richer release notes.
> Selection rationale: label hygiene, issue volume, presence of duplicates, and release cadence.

## 5) Scope (v1)
- **Runs A→E:** fetch → normalize → predict (labels/dups) → rationale → release draft.
- **Artifacts:** OpenAPI & JSON Schema, KPI dashboard artifacts (JSON/CSV), release-draft JSON.
- **Infra:** docker-compose for local dev; basic OTel traces/metrics later.

## 6) KPIs (declarative spec lives in `docs/kpis.yaml`)
Top-level targets for v1 (mirrored in `docs/kpis.yaml` and validated in CI):
- **JSON validity rate ≥ 0.98** (after ≤2 repair attempts).
- **End-to-end latency p50 ≤ 60s**, **p95 ≤ 120s** for A→E.
- **Label F1 (micro) ≥ 0.70** on held-out set for the selected repos. ✅ *Concrete target added*
- **Duplicate@5 ≥ 0.60** (hit-rate of true duplicate within top-5).
- **Maintainer release edit rate ≤ 0.30** (fraction of entries changed).
- **Mean cost per run ≤ \$0.25** (7-day rolling average).

> **Source of truth:** `docs/kpis.yaml` (machine-checked against `packages/schemas/kpis.schema.json` in CI).

## 7) Risks & Mitigations
- **Label drift / sparse labels:** begin with balanced sample & clear label map; track F1 weekly.
- **Duplicate ground truth scarcity:** bootstrap with heuristics (title/body shingles), then human feedback.
- **PII/privacy:** redact bodies → store `body_sha`; strict egress allowlist; no prompt/response logging with PII.

## 8) Milestones (P0 only)
- **P0.1** Charter + KPIs (this file + `docs/kpis.yaml`) and CI guardrail for KPI schema.
- **P0.2** Repo selection matrix + access plan (GitHub App).
- **P0.3** Snapshot + balanced sample set with manifest and checksums.
- **P0.4** Security & compliance constraints docs (privacy, egress, retention).
- **P0.5** Minimal architecture diagrams (Mermaid → SVG in CI).

## 9) Acceptance Criteria (for P0.1)
- This charter includes personas, target repos, and KPI list with a **concrete Label F1 target**.
- `docs/kpis.yaml` passes schema validation in CI and contains all v1 KPIs listed above.
- Owner sign-off recorded below.

---

### Sign-off
- **Owner:** Seyed Mohammad Hossein Tabatabaei Ashkezari  