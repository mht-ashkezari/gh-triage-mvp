BEGIN;

CREATE TABLE IF NOT EXISTS installations (
  installation_id BIGINT PRIMARY KEY,
  account_login   TEXT    NOT NULL,
  account_type    TEXT    NOT NULL,
  suspended       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS repos (
  installation_id BIGINT  NOT NULL,
  owner           TEXT     NOT NULL,
  name            TEXT     NOT NULL,
  private         BOOLEAN  NOT NULL DEFAULT FALSE,
  PRIMARY KEY (installation_id, owner, name),
  CONSTRAINT repos_installation_id_fkey
    FOREIGN KEY (installation_id) REFERENCES installations(installation_id) ON DELETE CASCADE
);

COMMIT;
