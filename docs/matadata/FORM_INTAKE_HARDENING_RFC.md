# RFC: resilient, accessible, and auditable public application intake

**Status:** Proposed  
**Source:** JP’s MATADATA Cybersecurity Grant Program submission experience  
**Scope:** Public grant, research, safety, partnership, and high-value application forms

## Problem statement

High-value public forms often combine a dynamic front end, third-party form libraries, bot protection, client-side validation, legal acknowledgment, and asynchronous confirmation. When these layers disagree, applicants may see only a disabled button or generic error even though the actual problem is a stale field node, an expired verification token, a hidden validation rule, or a form-library state mismatch.

The system should make submission state explicit, accessible, idempotent, and recoverable without weakening human verification or legal acknowledgment.

## Design principles

1. **The server owns submission truth.** Client UI state is advisory; the server returns a definitive result and receipt identifier.
2. **Consent is explicit.** Acknowledgment text and its required action are represented with accessible, machine-readable semantics.
3. **Retries are safe.** A server-issued idempotency key prevents duplicates.
4. **Validation is explainable.** A disabled button must have a visible, structured reason.
5. **Drafts survive rerenders and device changes.** Applicants should not lose work because a component remounts or a verification token expires.
6. **Automation assistance does not replace human actions.** CAPTCHA, identity, signature, and legal acknowledgment remain personally completed.
7. **Evidence is privacy-preserving.** Confirmation and diagnostic records can rely on hashes, field identifiers, and status codes rather than proposal bodies.

## P0 requirements

### P0.1 Canonical field contract

Every field should have a stable identifier that survives rerenders:

- stable `name`;
- stable program-level field key;
- explicit type, required state, maximum length, and validation rule;
- a versioned schema identifier exposed in the page;
- no reuse of one control for two logical fields.

**Acceptance criteria:** A complete DOM replacement does not change the schema identifier or field keys. Labels and helper text cannot be mistaken for controls.

### P0.2 Structured validation summary

When submission is unavailable, expose a summary such as:

```json
{
  "submittable": false,
  "reason_code": "HUMAN_VERIFICATION_EXPIRED",
  "fields": [],
  "next_action": "REVERIFY"
}
```

The same information should be rendered visibly and announced to assistive technology.

**Acceptance criteria:** No applicant sees a disabled button without a reason and a recovery action.

### P0.3 Explicit acknowledgment semantics

Use one of two declared modes:

- `interactive-control`: a labeled checkbox or equivalent accessible control; or
- `terms-text-on-submit`: the form explicitly states that pressing Submit constitutes acknowledgment.

Do not mix official terms text with unrelated hidden controls in a way that can be mistaken for legal consent.

**Acceptance criteria:** The acknowledgment mode, current text version, and required human action are available in accessible markup.

### P0.4 Server-issued idempotency key

Issue a single-use submission key when the form session begins. Repeating the same submission with the same key returns the original result instead of creating another record.

**Acceptance criteria:** Network interruption after the submit request cannot cause a duplicate application.

### P0.5 Definitive confirmation receipt

Successful submission should return and display:

- confirmation/reference ID;
- accepted timestamp;
- program name;
- schema version;
- idempotency-key status;
- applicant email destination;
- human-readable confirmation.

**Acceptance criteria:** The confirmation page and email share the same reference ID.

## P1 requirements

### P1.1 Draft persistence and resume

- Save a local and server-side draft with explicit applicant consent.
- Permit resume from another supported browser/device.
- Preserve field values across human-verification refresh.
- Show draft age and last-saved timestamp.

### P1.2 Form-library state alignment

If a platform such as Marketo is used:

- synchronize values through its supported API;
- expose whether platform validation passed;
- expose whether the platform considers the form submittable;
- keep the visible Submit state aligned with that authoritative status;
- log a non-sensitive reason when the UI and library states disagree.

### P1.3 Mobile and low-bandwidth mode

- Avoid full-page image retransmission when nothing changed.
- Use conditional requests and compact status payloads.
- Permit refresh-safe reconnect after a one-time token is removed.
- Provide a text-only recovery path for validation and acknowledgment.

### P1.4 Human-verification lifecycle

Expose explicit states:

- `NOT_STARTED`
- `REQUIRED`
- `IN_PROGRESS`
- `VERIFIED`
- `EXPIRED`
- `FAILED`

A token expiration should not silently disable Submit; it should prompt reverification while preserving the draft.

### P1.5 Submission observability

Generate privacy-preserving events:

- schema loaded;
- field validation changed;
- verification state changed;
- acknowledgment completed;
- submission request accepted;
- confirmation issued.

Events should omit full proposal text by default.

## P2 improvements

### P2.1 Applicant diagnostics download

Offer a redacted diagnostic receipt containing:

- schema version;
- browser and device class;
- reason codes;
- field identifiers with pass/fail status;
- verification state;
- timestamps;
- confirmation ID if successful.

### P2.2 Feedback-source acknowledgment

Add an opt-in form for reproducible process feedback. When useful feedback is routed internally, send a simple source acknowledgment that does not imply endorsement, employment, partnership, compensation, or adoption.

Suggested status model:

- `RECEIVED`
- `REPRODUCIBLE`
- `ROUTED`
- `UNDER_REVIEW`
- `ADOPTED`
- `DECLINED`

This provides provenance and encourages constructive reports without promising a particular outcome.

### P2.3 Compensated-contribution pathway

For unusually substantial, reproducible improvements, provide an optional channel to evaluate whether the contribution fits an existing research, vendor, bug-bounty, user-study, or compensated-feedback program. The form should clearly state that submission alone creates no entitlement.

## Security requirements

- Never accept client-side force-enabling as proof of validity.
- Validate all required fields on the server.
- Bind acknowledgment text version and idempotency key to the accepted submission.
- Rate-limit submission attempts without destroying the applicant’s draft.
- Treat cross-origin form actions or unexpected navigation as terminal trust-boundary failures.
- Require fresh human verification when the verification token expires.
- Keep credentials, tokens, and proposal bodies out of routine diagnostic logs.

## Recommended error codes

| Code | Meaning | Applicant action |
|---|---|---|
| `FIELD_REQUIRED` | A required field is empty | Focus named field |
| `FIELD_FORMAT` | A value has the wrong format | Correct named field |
| `FIELD_LIMIT` | A value exceeds its limit | Shorten named field |
| `SCHEMA_CHANGED` | The page and submitted schema versions differ | Reload while preserving draft |
| `HUMAN_VERIFICATION_REQUIRED` | Verification has not completed | Complete verification |
| `HUMAN_VERIFICATION_EXPIRED` | Verification expired | Reverify; keep draft |
| `ACKNOWLEDGMENT_REQUIRED` | Legal acknowledgment incomplete | Review and affirm current text |
| `FORM_STATE_STALE` | Front-end and form-library states disagree | Resynchronize and revalidate |
| `SUBMISSION_IN_PROGRESS` | The idempotency key is already processing | Wait; do not resubmit |
| `SUBMITTED` | Accepted | Display receipt ID |
| `SUBMISSION_STATUS_UNKNOWN` | Request outcome cannot yet be established | Query status with same idempotency key |

## Reference acceptance test

A qualifying implementation should pass this scenario:

1. Applicant fills half the fields.
2. The entire dynamic form rerenders.
3. All values remain associated with canonical field keys.
4. Human-verification expires and is renewed without losing the draft.
5. Acknowledgment text changes version; the applicant is required to review it again.
6. The network drops immediately after the submit request.
7. Reconnecting with the same idempotency key returns the original accepted result.
8. The confirmation page and email show the same reference ID.
9. A redacted diagnostic receipt explains every state transition.

## Expected impact

Adopting the P0 controls would reduce duplicate submissions, unexplained disabled buttons, accessibility ambiguity, support load, and applicant uncertainty. The P1 and P2 controls would improve resilience, observability, trust, and the quality of user-contributed process feedback.
