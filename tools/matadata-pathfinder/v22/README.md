# MATADATA OpenAI Pathfinder V2.2

V2.2 is a staged, non-confidential, human-gated form-assistance runner for the MATADATA Cybersecurity Grant Program application. It improves connection reliability, mobile recovery, acknowledgment verification, receipt integrity, and exactly-once execution without bypassing OpenAI’s CAPTCHA, identity, signature, applicant-acknowledgment, or other human-only controls.

## Connection and mobile recovery

- Publishes two independently created and health-checked public session links when both tunnels are available.
- Provides normal and low-bandwidth variants of each live link.
- Uses conditional screenshot requests (`ETag` / `304`) so unchanged screens are not downloaded repeatedly.
- Supports low, normal, and high screenshot profiles.
- Uses exponential reconnect backoff and browser online/offline detection.
- Sets a secure same-site session cookie so an already-opened link can be refreshed without keeping its bearer token in the address bar.
- Rejects taps from unknown or stale screen tokens.

## Acknowledgment integrity

- Displays the current acknowledgment text extracted from the official OpenAI form in a dedicated Pathfinder panel.
- Requires JP’s explicit personal affirmation.
- Verifies that the displayed acknowledgment hash still matches the official form.
- Verifies the actual underlying OpenAI acknowledgment control across three stable observations.
- Repeats the stability check immediately before the sole authorized Submit click.
- Records hashes, control fingerprints, and state observations rather than the full proposal text in normal audit records.

## Form, origin, and submission safeguards

- Verifies that the top-level page remains on a trusted OpenAI HTTPS origin before filling and again before submission.
- Captures a redacted trust-boundary snapshot and form-action digest.
- Inventories all 14 expected application controls before entering data.
- Stops fail-closed if expected controls disappear or browser validation remains incomplete.
- Separates likely application submissions from analytics and unrelated POST traffic while retaining only request/response hashes, lengths, marker names, status, and content type.
- Requires positive confirmation evidence. A URL change alone is not sufficient.
- Maintains a tamper-evident event hash chain, browser/page heartbeat, atomic in-run submit lock, and repository-wide confirmed-submission lock.
- Never makes a second click when the first click’s outcome is uncertain.

## Authorization boundary

JP personally completes any CAPTCHA, identity, signature, human-verification, and applicant-acknowledgment step. Pathfinder may fill the reviewed non-confidential fields and perform no more than one authorized Submit click after all gates pass.

Opening or updating the V2.2 pull request runs offline preflight only. A live PR-triggered run requires both:

1. a title beginning `[EXECUTE MATADATA V2.2]`; and
2. an authorization marker bound to the exact reviewed head commit: `JP-AUTHORIZED-ONE-SUBMIT:<head SHA>`.

Changing the code changes the head SHA and automatically invalidates the prior authorization marker. Manual workflow dispatch uses the same commit-bound phrase.

The active V2.1 session is not modified, cancelled, or restarted by this V2.2 branch.

## Integrity

```text
Package SHA-256:     f24a9cab7980e8d43a6be642e16500828952d89c1285af4cfff2ed363e078d11
Runner SHA-256:      d7fabf86cd9aa63644e9d09c5c0d2201b205503c2a0072502ee7cd1644faaf2b
Runner gzip SHA-256: de80921a0504210abf6f553a64f2cb8b71fb4a5a76d06cf2e10a36d246beed8d
Application SHA-256: 6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340
```

Five logical package segments reconstruct one deterministic archive containing the checksum-locked runner, preflight logic, live-session scripts, operating notes, manifest, and failure/recovery matrix. For safer repository transport, logical segment `00` is stored as two independently hashed 4,096-byte files (`package.part.00a` and `package.part.00b`), so the branch contains six physical package files in total.
