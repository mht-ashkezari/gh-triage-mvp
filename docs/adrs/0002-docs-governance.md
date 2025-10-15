# ADR 0002: Docs governance (private artifacts + gates)

- Status: Accepted
- Date: 2025-10-12

## Context

We need deterministic, reviewable docs without public hosting.

## Decision

- Generate TypeDoc + Redoc locally and in CI.
- Do not commit `docs/api/*` outputs; upload `docs/site-docs.zip` artifact on each PR.
- Enforce markdown lint, link-check, and spellcheck in a dedicated `docs.yml`.

## Consequences

- Reviewers always get fresh docs; no doc rot.
- Private by default; later we can add a Docusaurus portal if needed.
