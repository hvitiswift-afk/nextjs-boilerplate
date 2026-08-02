# P2 Dual-Account Gmail OAuth Architecture

## Objective

Allow JP to operate two JP-controlled Gmail identities through a local MATADATA companion while preserving the difference between authorization, authentication, consent, identity, and provider confirmation.

## Architecture

```text
JP human authority
  ├─ Google OAuth consent: enterprise-facing account
  │    └─ encrypted refresh token → enterprise-facing role
  └─ Google OAuth consent: connected-operations account
       └─ encrypted refresh token → connected-operations role

Reviewed mission → select role → refresh that role's token → inspect Gmail aliases
→ require explicit send confirmation → record intent → Gmail users.messages.send
→ provider message ID → append confirmation receipt
```

## Identity law

A role is not an identity. The authorized Google account returned by OpenID Connect is the identity bound to that role. The bridge refuses an `--expect-email` mismatch and refuses a requested `From` value that Gmail does not list as primary or accepted.

## Protection law

- Google sign-in, MFA, CAPTCHA, recovery, and OAuth consent remain human-only.
- Passwords, cookies, MFA codes, recovery codes, identity documents, and payment information are never bridge inputs.
- Refresh tokens are AES-256-GCM encrypted at rest with a key supplied at runtime.
- Access tokens remain memory-only.
- Message bodies and subject text are not written into receipts; receipts keep hashes and provider IDs.
- Sending requires `--confirm-send SEND` and a unique idempotency key.
- Unknown provider outcomes prohibit blind retry.

## Gmail Send mail as support

The bridge lists Gmail's existing Send mail as entries. It can select an accepted alias for a send, but it does not create aliases for personal Gmail accounts. Alias creation through the Gmail API is restricted in ways that make separate OAuth authorization the clearer and safer cross-account design here.

## Relationship to the XYZ stack

The July 15 XYZ–W–V email thread remains the human-readable continuity rail. P2 adds a local authenticated execution layer beneath it:

- **X:** verified account and provider state
- **Y:** selected account/role and intended handoff
- **Z:** Gmail provider readback
- **W:** continuity receipt and idempotency state
- **V:** protected credential and human-consent boundary

## Current truth

The code can be verified in CI without secrets. Actual ability to send as either Gmail identity begins only after JP completes Google OAuth for that identity on the local desktop.
