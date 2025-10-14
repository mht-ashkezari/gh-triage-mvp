# DOCS – README, ADRs, contribution guide

## What/Why

Polish docs & governance with README, ADRs, contributor guide, and CI gates that keep docs healthy.

## Prereqs

Node 20, pnpm, contracts generation working.

## Run locally

```bash
pnpm i
pnpm contracts:openapi && pnpm contracts:jsonschema
pnpm docs:bundle  # outputs docs/site-docs.zip
```

## Demo checklist

- [ ] Local: `pnpm contracts:openapi && pnpm contracts:jsonschema`
- [ ] Local: `pnpm docs:bundle` (produces `docs/site-docs.zip`)
- [ ] PR: `Docs` workflow green; artifact `site-docs-<sha>` downloadable
- [ ] README links resolve (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`)
- [ ] (If contracts changed) ADR added/updated; `Contracts` workflow green
