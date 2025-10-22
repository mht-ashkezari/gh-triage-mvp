# ADR-0005: Runs Orchestrator Skeleton (A/B/D)

- **Status**: Accepted
- **Date**: 2025-10-18

## Context

We need a simple, reliable orchestration layer to coordinate Run A (fetch/snapshot), Run B (ML baseline), and Run D (release pack). Early steps must be deterministic, inspectable, and cheap to iterate.

## Decision

- **Service**: Express (TypeScript) with `/runs/A|B|D` → `202 { run_id }`, `/health`.
- **Queue**: BullMQ on Redis; per-run idempotency via `jobId=run_id`.
- **Ledger**: Postgres tables `runs` and `run_events`; append-only events.
- **Env**: `dotenv` in entrypoints; **code fallback** for `DATABASE_URL` in dev.
- **Error handling**: JSON error middleware in dev for readable failures.
- **Tests**: Vitest e2e; script starts service and waits for `/health`.

## Consequences

- Horizontal workers are trivial to add; steps can evolve independently.
- Deterministic, testable skeleton now; real GH/ML work can fill step bodies later.
- CI enforces that the service boots and endpoints respond as per contract.

## Alternatives considered

- NestJS for parity with BFF (heavier; Express is enough here).
- Managed queue (SQS) (overkill at this stage; Redis suits dev/CI).
