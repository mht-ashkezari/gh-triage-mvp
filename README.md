# GitHub Triage & Release Notes (MVP)

[![Status: Alpha](https://img.shields.io/badge/status-alpha-blue)](#project-status)

[![CI](https://img.shields.io/github/actions/workflow/status/mht-ashkezari/gh-triage-mvp/ci.yml?branch=main)](https://github.com/mht-ashkezari/gh-triage-mvp/actions/workflows/ci.yml)
[![Contracts](https://img.shields.io/github/actions/workflow/status/mht-ashkezari/gh-triage-mvp/contracts.yml?label=contracts&branch=main)](https://github.com/mht-ashkezari/gh-triage-mvp/actions/workflows/contracts.yml)
[![Runs e2e](https://img.shields.io/github/actions/workflow/status/mht-ashkezari/gh-triage-mvp/runs-integration.yml?label=runs%20e2e&branch=main)](https://github.com/mht-ashkezari/gh-triage-mvp/actions/workflows/runs-integration.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/mht-ashkezari/gh-triage-mvp/security.yml?label=security&branch=main)](https://github.com/mht-ashkezari/gh-triage-mvp/actions/workflows/security.yml)
[![Docs](https://img.shields.io/badge/docs-private%20artifact-blue)](#4-documentation)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

**Project status:** Alpha — under active development. Expect breaking changes.

## Project status

Alpha. Expect breaking changes while we land core services and contracts.

> **What**: Azure-first platform that ingests GitHub issues/PRs and produces triage suggestions + release notes with strict JSON contracts.
> **Why**: Speed up OSS & product maintenance while proving production skills (LLM/ML, MLOps, DevOps, Full-stack).

## 1) Architecture (60-second tour)

- Contracts: Zod → OpenAPI/JSON Schema (`/packages/schemas`, `/packages/contracts`)  
- - Services: Next.js (frontend), **BFF (NestJS)**, **Runs (Express)**, **ML (NestJS)** (`/apps`)
- Observability: OTel → Jaeger/App Insights  
- **No datasets are committed**; bring-your-own data (see [Data & licensing](#7-data--licensing)).

## 2) Quick start (local dev)

```bash
pnpm i
docker compose -f infra/docker/docker-compose.dev.yml up -d --no-build postgres redis azurite otel-collector jaeger
pnpm dev
open http://localhost:3000
```

## 3) Contracts & API

- **OpenAPI (generated):** `docs/openapi/*.openapi.json`
- **JSON Schemas:** `docs/jsonschema/*.schema.json`
- **Typed clients:** `/packages/clients`

**Useful scripts:**

```bash
pnpm contracts:openapi && pnpm contracts:jsonschema
pnpm contracts:lint
```

## 4) Documentation

- CI builds **TypeDoc** + **Redoc** and uploads a private artifact per PR: `docs/site-docs.zip` (*Actions → Artifacts*).

**Generate locally:**

```bash
pnpm contracts:openapi && pnpm contracts:jsonschema
pnpm docs:bundle        # writes docs/api/* and docs/site-docs.zip
```

## 5) How-to guides
  
- **Runs / Orchestrator**
  - [Runs Orchestrator — Skeleton](./docs/howto/runs-orchestrator-skeleton.md)
  - [CI — Runs Integration (PR-time e2e)](./docs/howto/ci-runs-integration.md)

- **Contracts & Clients**
  - [Schema-first Contracts](./docs/howto/contracts-schema-first-contracts.md)

- **Repo & CI**
  - [CI/CD Skeleton — What Runs Where](./docs/howto/cicd-ci-skeleton.md)
  - [Monorepo Layout](./docs/howto/layout-monorepo-directory-tree.md)
  - [Architecture Diagrams in CI](./docs/howto/arch-diagrams-ci.md)

- **GH App / Webhooks**
  - [GitHub App install & OAuth](./docs/howto/ghapp-github-install-oauth.md)
  - [ngrok webhook tunnel](./docs/howto/ngrok_webhook.md)

> Full index: see **[docs/howto/](./docs/howto/README.md)**

## 6) Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).  
Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)  
Security: [SECURITY.md](./SECURITY.md)  
Data & licensing register: [docs/data/LICENSES.md](./docs/data/LICENSES.md)

**ADR quickstart**

```bash
pnpm new:adr "Short decision title"   # creates docs/adrs/XXXX-short-decision-title.md
```

## 7) Data & licensing

This repo **does not** ship third-party datasets. If you use external data locally or in demos:

- Keep raw data **out of git**.
- Record each source & license in [`docs/data/LICENSES.md`](./docs/data/LICENSES.md).
- Respect the original terms (e.g., attribution, non-commercial). When in doubt, **don’t publish** derived artifacts.

---

## 8) Dev scripts (grab bag)

```bash
# Docs hygiene
pnpm docs:lint          # markdownlint
pnpm docs:spell         # cspell
pnpm docs:bundle        # TypeDoc + Redoc → docs/site-docs.zip

# Tests & CI
pnpm test               # turbo workspace tests
pnpm test:contracts     # schemas + contracts projects
pnpm ci:test            # CI config (coverage, etc.)
```

## 9) License

This project is licensed under **MIT** — see [`LICENSE`](./LICENSE).
