-- Minimal smoke-test table
create table if not exists _health (
  id serial primary key,
  created_at timestamptz not null default now()
);
