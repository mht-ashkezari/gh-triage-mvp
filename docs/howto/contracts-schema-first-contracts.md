# Schema-first Contracts (how-to)

**What/Why**: Author Zod once → generate OpenAPI + JSON Schema + typed clients. This is the single source of truth the BFF, Runs, UI, and LLM guards all share.

**Prereqs**: Node 20, pnpm 9.

**Commands**

```bash
pnpm -F @ghtriage/schemas build
pnpm -F @ghtriage/contracts build
pnpm contracts:openapi
pnpm contracts:jsonschema
ls docs/openapi docs/jsonschema
```

**Runs contract**
See the generated spec at `docs/openapi/runs.openapi.json`.
Related how-to: `docs/howto/runs-orchestrator-skeleton.md`.
