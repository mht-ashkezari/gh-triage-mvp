#!/usr/bin/env bash
set -euo pipefail

# If pnpm passed a literal "--", drop it so $1 becomes the UUID.
if [[ "${1:-}" == "--" ]]; then shift; fi





RID="${RID:-${1:-}}"
if [[ -z "$RID" ]]; then
  echo "Usage:"
  echo "  RID=<uuid> pnpm db:select:run"
  echo "  or: pnpm db:select:run -- <uuid>"
  echo "  or: pnpm db:select:run latest"
  exit 1
fi

DBURL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/ghtriage}"

# Convenience: accept "latest" to use the newest run_id in DB
if [[ "$RID" == "latest" ]]; then
  RID="$(psql "$DBURL" -At -c "select run_id::text from runs order by created_at desc limit 1;")"
  if [[ -z "$RID" ]]; then
    echo "no runs found in DB" >&2
    exit 1
  fi
fi

echo "RID=$RID"
# Optional: strict UUID shape check (skip if you prefer)
if [[ ! "$RID" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
  echo "error: RID doesn't look like a UUID: $RID" >&2
  exit 1
fi



# Single-quoted heredoc prevents shell expansion.
# We pass the uuid via -v rid=... and use :'rid' for safe SQL quoting.
psql "$DBURL" -v ON_ERROR_STOP=1 -v rid="$RID" -P pager=off <<'SQL'
\echo
\echo --- runs table ---
select run_id, step, status, created_at
from runs
where run_id::text = :'rid';

\echo
\echo --- run_events table ---
select run_id, code, ts
from run_events
where run_id::text = :'rid'
order by ts;
SQL
