# CI — Runs Integration (PR-time e2e)

**Goal**: On PRs that touch `apps/runs/**` or `infra/sql/**`, boot **Postgres + Redis**, apply schema, start the Runs service, and run e2e tests.

## What the workflow does

1. Spin up **Postgres 16** and **Redis 7** as services.
2. Set env: `DATABASE_URL`, `REDIS_URL`, `RUNS_PORT`.
3. Apply SQL: `020_runs.sql` + `021_run_events.sql`.
4. Build workspace.
5. `pnpm -F @ghtriage/runs test:with-server`:
   - Starts the Runs service.
   - Waits for `/health`.
   - Runs Vitest tests (health + A/B/D).
   - Always cleans up the server process; prints tail logs on failure.

## Local parity

Run the same flow locally:

```bash
pnpm devstack:up && pnpm db:wait && pnpm -w db:prepare
pnpm test:runs
```

## Artifacts & logs

- Server logs printed on CI failure (last 200 lines).
- Use **Actions** → **Runs Integration** to view logs.
