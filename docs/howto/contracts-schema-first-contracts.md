# Schema-first contracts (how-to)

**What/Why**: Author Zod once → generate OpenAPI + JSON Schema + typed clients. This is the single source of truth the BFF, Runs, UI, and LLM guards all share.

**Prereqs**: Node 20, pnpm 9.

**Commands**

```bash
pnpm -F @ghtriage/schemas build
pnpm -F @ghtriage/contracts build
pnpm docs:openapi
pnpm -F @ghtriage/contracts jsonschema
ls docs/openapi docs/jsonschema
