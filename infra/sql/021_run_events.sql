BEGIN;
CREATE TABLE IF NOT EXISTS run_events(
  id     bigserial PRIMARY KEY,
  run_id text NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
  ts     timestamptz NOT NULL DEFAULT now(),
  code   text NOT NULL,
  data   jsonb
);
CREATE INDEX IF NOT EXISTS idx_run_events_run_id ON run_events(run_id, ts);
COMMIT;
