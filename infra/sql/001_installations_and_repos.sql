-- Schema migration: installations & installation_repos
-- Purpose: store GitHub App installations and per-installation repository catalog
--          incl. selection flag used by the triage service.

CREATE TABLE IF NOT EXISTS installations (
  id BIGINT PRIMARY KEY,
  account_login TEXT NOT NULL,
  target_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS installation_repos (
  repo_id BIGINT PRIMARY KEY,
  installation_id BIGINT NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  visibility TEXT NOT NULL,
  org_login TEXT,
  sso_enforced BOOLEAN DEFAULT FALSE,
  language TEXT,
  selected BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_installation_repos_install ON installation_repos(installation_id);
