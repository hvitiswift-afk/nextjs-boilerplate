-- Goblin + Fabian Enclave Memory Vault
-- Persistent storage schema for local Postgres / future server tower.

create table if not exists memory_records (
  id text primary key,
  kind text not null check (kind in (
    'hyperscript',
    'progress',
    'approval',
    'receipt',
    'outpost-entry',
    'uv7',
    'health',
    'ledger',
    'note'
  )),
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  tags text[] not null default array[]::text[],
  outpost_return_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memory_records_kind_idx on memory_records(kind);
create index if not exists memory_records_created_at_idx on memory_records(created_at desc);
create index if not exists memory_records_tags_idx on memory_records using gin(tags);
create index if not exists memory_records_payload_idx on memory_records using gin(payload);

create table if not exists approval_records (
  id text primary key,
  task_id text not null,
  risk text not null check (risk in ('read-only', 'draft', 'needs-approval')),
  requested_action text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists progress_events (
  id text primary key,
  task_id text not null,
  step text not null,
  status text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists outpost_entries (
  id text primary key,
  kind text not null,
  direction text not null check (direction in ('to-outpost', 'from-outpost', 'round-trip')),
  origin text not null,
  destination text not null,
  payload jsonb not null default '{}'::jsonb,
  return_path text,
  created_at timestamptz not null default now()
);

create table if not exists receipt_records (
  id text primary key,
  source text not null,
  status text not null,
  amount numeric,
  currency text,
  description text not null,
  outpost_return_url text,
  created_at timestamptz not null default now()
);

-- Law of the Vault:
-- No secrets in source.
-- No hidden payments.
-- No silent deploys.
-- No irreversible action without approval.
-- Every important record can receive an Outpost return path.
