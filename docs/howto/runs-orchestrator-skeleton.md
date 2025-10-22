# Runs Orchestrator — Skeleton (A/B/D)

**What/Why (3 lines)**  
Orchestrates Runs **A/B/D** with Redis (BullMQ) and a Postgres ledger.  
Implements `/runs/A`, `/runs/B`, `/runs/D` → `202 { run_id }`, and `/health`.  
This doc shows how to run locally, test, and verify DB state.

## Prerequisites

- Docker + docker-compose (devstack)
- Node 20.x, pnpm 9.x
- `.env` with:

```ini
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/ghtriage
RUNS_PORT=4101
RUNS_CONCURRENCY=4
REDIS_URL=redis://127.0.0.1:6379
```

## Start the devstack + DB schema

```bash
pnpm devstack:up && pnpm db:wait
pnpm -w db:prepare
```

## Run the service

```bash
pnpm runs:dev
# In another shell:
curl -s http://localhost:4101/health
```

## Trigger a run

```bash
curl -s -X POST http://localhost:4101/runs/A \
  -H 'content-type: application/json' \
  -d '{"repo_id":"octocat/hello","since":"2024-01-01"}'
```

## (optional) Other endpoints

```bash
curl -s -X POST http://localhost:4101/runs/B \
  -H 'content-type: application/json' \
  -d '{"repo_id":"octocat/hello"}'
curl -s -X POST http://localhost:4101/runs/D \
  -H 'content-type: application/json' \
  -d '{"repo_id":"octocat/hello","tag":"weekly"}'
```  

## Verify ledger (DB)

```bash
pnpm db:select:runs
# Expect: status 'succeeded', events: enqueued → a_start → a_done
```

## End-to-end tests

```bash
# boots the service, waits for /health, runs Vitest, then stops it
pnpm test:runs
```

## Troubleshooting

- **ECONNREFUSED 4101**: Start the service (`pnpm runs:dev`) or use `pnpm test:runs` which boots it automatically.

- **psql socket error**: Use `pnpm -w db:prepare` (scripts set a TCP fallback) or export `DATABASE_URL`.

- **Redis/BullMQ**: ensure `REDIS_URL` points to `redis://127.0.0.1:6379`.

## Demo checklist (PR reviewers)

- [ ] /health returns { ok: true, svc: "runs" }
- [ ] /runs/A|B|D return 202 { run_id }
- [ ] DB shows succeeded run + events
- [ ] pnpm test:runs passes
