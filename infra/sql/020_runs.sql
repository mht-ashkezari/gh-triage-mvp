BEGIN;
CREATE TABLE IF NOT EXISTS runs (
  run_id     text PRIMARY KEY,
  repo_id    text NOT NULL, 
  step       text NOT NULL CHECK (step IN ('A','B','D')),
  status     text NOT NULL CHECK (status IN ('queued','running','succeeded','failed','canceled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,         
  finished_at timestamptz,
  tokens_in  integer,
  tokens_out integer,
  cost_usd   numeric(12,6),
  error_message text
);
CREATE INDEX IF NOT EXISTS idx_runs_repo   ON runs (repo_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON runs (status);
COMMIT;
