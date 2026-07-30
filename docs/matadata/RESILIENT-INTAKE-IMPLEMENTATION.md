# MATADATA Resilient Intake Implementation

Status: **P0 foundation implemented and CI-gated**

Source: JP’s successful non-confidential OpenAI Cybersecurity Grant Program submission work and the documented failure/recovery sequence preserved in the MATADATA acknowledgment package.

This implementation converts the postmortem and RFC into reusable code. It does not automate CAPTCHA, identity, signature, or personal acknowledgment, and it does not authorize external submission.

## Implemented foundation

### 1. Versioned field contract

`lib/intake/contract.mjs` requires every field to have:

- a stable internal key;
- a stable browser/server control name;
- a declared input type;
- an explicit required/optional status;
- unique key and name identities.

Duplicate identities and missing controls are explicit blockers rather than silent guesses.

### 2. Rerender-safe verification

The verifier resolves controls from a fresh inventory by stable `name`, not by injected or transient element IDs. The regression script replaces the complete simulated control set after field eight and confirms that all 13 fields still verify.

The verifier records structured reasons:

- `FIELD_MISSING`
- `FIELD_DUPLICATE`
- `FIELD_NOT_VISIBLE`
- `FIELD_REQUIRED`
- `FIELD_MISMATCH`
- `FIELD_INVALID`

### 3. Narrow canonical text comparison

Textareas support only representation-safe normalization:

- CRLF and CR normalize to LF;
- exactly one terminal LF, ordinary space, nonbreaking space, or zero-width space may be treated as browser-added formatting;
- internal edits, changed words, deleted text, or multiple extra characters remain blocked.

Raw and canonical lengths and SHA-256 digests remain available for diagnostics without storing proposal bodies in normal receipts.

### 4. Explicit acknowledgment modes

Two modes are supported:

- `interactive-control`: the applicant must personally affirm the text and the associated control must be checked;
- `terms-on-submit`: the applicant must personally affirm stable official terms text when no separate control exists.

A changed acknowledgment digest requires renewed review. Personal action is never inferred from automation.

### 5. Trusted-origin and readiness gate

`evaluateReadiness` combines:

- trusted-origin verification;
- completed human verification;
- the field-contract result;
- the acknowledgment result;
- prior submission state.

The result includes a machine-readable blocker list and a deterministic digest.

### 6. Server-style idempotency ledger

`IdempotencyLedger` enforces one submission action per key and payload digest.

- The first ready request returns `SUBMIT` and records one action.
- Replays return the original in-flight or final record.
- A key cannot be reused for different content.
- A confirmed result remains `SUBMITTED`.
- A disconnected or ambiguous result becomes `SUBMISSION_STATUS_UNKNOWN` and cannot retry blindly.

### 7. Tamper-evident receipt chain

`ReceiptChain` links each event to the previous SHA-256 hash. Verification detects index changes, predecessor changes, and content changes.

Suggested event sequence:

```text
SCHEMA_VERIFIED
DRAFT_VERIFIED
HUMAN_VERIFICATION_COMPLETED
ACKNOWLEDGMENT_PERSONALLY_AFFIRMED
SUBMISSION_STARTED
SUBMISSION_CONFIRMED | SUBMISSION_STATUS_UNKNOWN
```

## Verification

Run:

```bash
npm run intake:check
```

The check proves:

- 13 unique stable fields;
- recovery after a full simulated DOM rerender after field eight;
- narrow textarea normalization;
- substantive-difference rejection;
- duplicate-binding rejection;
- both acknowledgment modes;
- trusted-origin gating;
- one-action idempotency;
- no blind retry after an unknown outcome;
- confirmation receipt creation;
- tamper-evident event-chain integrity.

GitHub Actions workflow:

```text
.github/workflows/matadata-resilient-intake.yml
```

It uploads `matadata-resilient-intake-check.json` as a 30-day verification receipt.

## Next implementation layer

The P1 layer should add a real persistence adapter and HTTP boundary:

1. Postgres-backed idempotency records with a unique key constraint.
2. Transactional `SUBMITTING → SUBMITTED | SUBMISSION_STATUS_UNKNOWN` transitions.
3. Draft encryption and expiration policy.
4. A confirmation reference ID shared by page and email.
5. A UI component that renders structured disabled-submit reasons.
6. Reconnect-safe human-verification and acknowledgment state without transferring the personal action to automation.
7. Accessibility tests for labels, focus order, status announcements, and acknowledgment semantics.

## Provenance boundary

JP is the source of the non-confidential process findings and this implementation direction. That acknowledgment is separate from OpenAI affiliation, endorsement, employment, grant approval, partnership, compensation, or adoption.
