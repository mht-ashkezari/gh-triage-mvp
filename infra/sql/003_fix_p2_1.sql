BEGIN;

-- Drop the wrong/old tables if they exist (no data to preserve right now)
DROP TABLE IF EXISTS repos CASCADE;
DROP TABLE IF EXISTS installation_repos CASCADE;
DROP TABLE IF EXISTS installations CASCADE;

-- Create the schema the code uses
CREATE TABLE installations (
  installation_id BIGINT PRIMARY KEY,
  account_login   TEXT    NOT NULL,
  account_type    TEXT    NOT NULL,
  suspended       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE repos (
  installation_id BIGINT NOT NULL REFERENCES installations(installation_id) ON DELETE CASCADE,
  owner           TEXT   NOT NULL,
  name            TEXT   NOT NULL,
  private         BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (installation_id, owner, name)
);

COMMIT;
