# Contributing

## Branching & commits

- Branch: `feat/<area>-<short-desc>` or `fix/<area>-<short-desc>`.
- Commits: Conventional Commits (e.g., `feat(bff): add triage endpoint`).

## Local workflow

```bash
pnpm i
pnpm build
pnpm test
pnpm contracts:openapi && pnpm contracts:jsonschema
pnpm docs:bundle  # TypeDoc + Redoc → docs/site-docs.zip
```

## PR checklist

- [ ] Contracts updated (`packages/contracts`) if API changed  
- [ ] Diagrams updated (`docs/arch`) if topology changed  
- [ ] Security notes (secrets/scopes) considered  
- [ ] Tests added/updated; CI green  
- [ ] Demo checklist completed (see `docs/howto/docs-readme-adrs-contribution-guide.md`)

## Data policy

- This repo **does not** commit third-party datasets.  
- If you use external data locally/demos, record the source/license in `docs/data/LICENSES.md`.

## ADRs

- Significant changes need an ADR: `pnpm new:adr "Short title"` → creates `docs/adrs/XXXX-*.md`.
