# MATADATA Resilient Intake P1

## Status

`IMPLEMENTED_FOR_REVIEW`

P1 advances the P0 foundation from an in-process demonstration to a persistence-ready, transaction-oriented intake architecture. It does not open or submit an external form.

## P1 outcomes

### Persistent transactional idempotency

The active idempotency record is keyed by:

```text
idempotency key + reviewed payload digest
```

The PostgreSQL contract uses:

- a primary key on the idempotency key;
- `INSERT ... ON CONFLICT DO NOTHING` to select one winner;
- serializable transactions;
- row locks for confirmation and unknown-outcome transitions;
- an optimistic version check;
- a hard database constraint that `submission_actions = 1`;
- a terminal `SUBMISSION_STATUS_UNKNOWN` state that is replayed rather than retried.

The application layer and database both enforce exactly-once behavior. Database retries are limited to serialization or deadlock recovery inside the state transaction; they do not repeat an external submission action.

### Append-only receipt events

Every state transition writes a SHA-256-linked event:

```text
SUBMISSION_STARTED
  → SUBMISSION_CONFIRMED
```

or:

```text
SUBMISSION_STARTED
  → SUBMISSION_STATUS_UNKNOWN
```

Each event contains its sequence, previous hash, current hash, state evidence digests, and reference data. Routine receipt storage does not include proposal bodies, CAPTCHA answers, credentials, or signatures.

### Structured blocker presentation

The blocker catalog converts terse machine codes into:

- severity;
- intended audience;
- explanation;
- next action;
- retry policy.

The retry policies are explicit:

- `after-fix` — validation can be rerun after a named correction;
- `human-only` — the applicant must personally act;
- `replay-only` — return the existing submission record;
- `never` — do not retry until the outcome is reconciled.

### Confirmation reference parity

A confirmed record receives one reference ID. The same reference and confirmation digest must appear in:

- the confirmation page;
- the confirmation email subject, body, and header;
- the durable receipt.

A mismatch yields `CONFIRMATION_REFERENCE_MISMATCH` or `CONFIRMATION_DIGEST_MISMATCH`. It does not authorize a second submission.

## Files

```text
lib/intake/blockers.mjs
lib/intake/confirmation.mjs
lib/intake/memory-repository.mjs
lib/intake/postgres-repository.mjs
lib/intake/transactional-ledger.mjs
infra/matadata-intake.sql
scripts/check-resilient-intake-p1.mjs
scripts/migrate-matadata-intake.mjs
.github/workflows/matadata-resilient-intake-p1.yml
```

## Commands

Run P0 and P1 checks:

```bash
npm run intake:verify
```

Run only P1:

```bash
npm run intake:p1:check
```

Apply the database schema to an explicitly selected database:

```bash
DATABASE_URL='postgresql://…' npm run intake:db:migrate
```

The migration refuses to run without `DATABASE_URL`. Credentials remain in the environment and are never committed.

## Human and authority boundary

JP remains the human authority for CAPTCHA, identity, signature, applicant acknowledgment, approval, and consequential submission. This implementation supplies state, validation, persistence, and receipts; it does not create external authority or OpenAI affiliation.

## Next gate

P2 should add a real server route and operator console backed by the persistent repository, with:

- authenticated applicant sessions;
- encrypted draft persistence and expiry;
- reconciliation tooling for unknown outcomes;
- accessible live blocker announcements;
- confirmation-page lookup by reference ID;
- email delivery integration using the same committed confirmation bundle;
- operational metrics that exclude proposal bodies.
