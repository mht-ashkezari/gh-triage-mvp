# CI/CD Skeleton — What Runs Where

## Baseline CI
- **File:** `.github/workflows/ci.yml`
- **Runs on:** PRs + pushes
- **Steps:** install → lint → typecheck → build (changed graph) → fast tests → coverage summary

## Specialized Workflows
- **Contracts:** generate & lint OpenAPI/JSON Schema + unit tests. (`.github/workflows/contracts.yml`)
- **KPI Lint:** validate `docs/kpis.yaml` against schema + unit tests. (`.github/workflows/kpi-lint.yml`)
- **Diagrams:** render Mermaid, check component IDs, upload SVGs. (`.github/workflows/diagrams.yml`)
- **Datasets:** validate manifests; guard raw payloads; typecheck snapshot tool. (`.github/workflows/datasets.yml`)
- **SELACC tests:** unit + e2e for access/selection/webhook. (`.github/workflows/selacc-tests.yml`)
- **Devstack integration:** spin Docker stack, run `test:devstack`. (`.github/workflows/devstack-integration.yml`)
- **Docs:** build OpenAPI + TypeDoc & zip site docs on `main`. (`.github/workflows/docs.yml`)
- **Security:** dependency audit. (`.github/workflows/security.yml`)

> Notes
> - Node is pinned to **20** in workflows for stability; `.nvmrc` is **22** for local dev — both are supported.
> - Turbo’s “changed graph” is enabled; `origin/main` is fetched defensively when needed.
