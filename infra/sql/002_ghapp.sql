-- Initialize installations & repos for GitHub App
create table if not exists installations(
    installation_id bigint primary key,
    account_login text not null,
    account_type text not null,   -- User or Organization
    suspended boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_installations_login on installations(account_login);

create table if not exists repos (
    installation_id bigint not null references installations(installation_id) on delete cascade,
    owner text not null,
    name text not null,
    private boolean not null default false,
    primary key (installation_id, owner, name)
);

create index if not exists idx_repos_install on repos(installation_id);
