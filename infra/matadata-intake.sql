-- MATADATA Resilient Intake P1
-- Persistent exactly-once state and append-only receipt events.
-- No proposal bodies, credentials, CAPTCHA answers, or payment data belong in these tables.

create table if not exists matadata_intake_submissions (
  idempotency_key text primary key,
  payload_digest text not null check (payload_digest ~ '^[a-f0-9]{64}$'),
  state text not null check (state in (
    'SUBMITTING',
    'SUBMITTED',
    'SUBMISSION_STATUS_UNKNOWN'
  )),
  submission_actions smallint not null default 1 check (submission_actions = 1),
  readiness_digest text not null check (readiness_digest ~ '^[a-f0-9]{64}$'),
  reference_id text unique,
  confirmation_digest text check (confirmation_digest is null or confirmation_digest ~ '^[a-f0-9]{64}$'),
  evidence jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  version bigint not null default 1 check (version >= 1),
  check (
    state <> 'SUBMITTED'
    or (reference_id is not null and confirmation_digest is not null)
  )
);

create index if not exists matadata_intake_submissions_state_idx
  on matadata_intake_submissions(state);

create index if not exists matadata_intake_submissions_updated_at_idx
  on matadata_intake_submissions(updated_at desc);

create index if not exists matadata_intake_submissions_evidence_idx
  on matadata_intake_submissions using gin(evidence);

create table if not exists matadata_intake_receipt_events (
  id bigserial primary key,
  idempotency_key text not null references matadata_intake_submissions(idempotency_key) on delete restrict,
  sequence integer not null check (sequence >= 0),
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  previous_hash text not null check (previous_hash ~ '^[a-f0-9]{64}$'),
  event_hash text not null check (event_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null,
  unique (idempotency_key, sequence),
  unique (idempotency_key, event_hash)
);

create index if not exists matadata_intake_receipt_events_key_created_idx
  on matadata_intake_receipt_events(idempotency_key, created_at asc);

create index if not exists matadata_intake_receipt_events_data_idx
  on matadata_intake_receipt_events using gin(event_data);

comment on table matadata_intake_submissions is
  'Exactly-once intake state keyed by a caller-supplied idempotency key and reviewed payload digest.';

comment on column matadata_intake_submissions.submission_actions is
  'Hard invariant: one consequential submission action for this idempotency key.';

comment on table matadata_intake_receipt_events is
  'Append-only SHA-256-linked state transition receipts without routine proposal-body storage.';
