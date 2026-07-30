# OpenAI Cybersecurity Grant intake postmortem

## Executive summary

The MATADATA application ultimately reached OpenAI’s public Cybersecurity Grant Program intake and produced a confirmation email, but only after a series of observable form, browser, automation, and state-management failures. Each failure was handled fail-closed: no duplicate submission occurred, and the final successful run recorded exactly one submission action.

This postmortem turns those failures into reusable engineering guidance for public application systems.

## Final result

- Final runner: Pathfinder V2.6
- Final status: `SUBMITTED`
- Submission actions: `1`
- Confirmation text: `Thank you`
- Form controls disappeared after submission: yes
- Trusted OpenAI origin before submission: yes
- Applicant acknowledgment personally completed by JP: yes
- Duplicate-prevention lock created: yes
- Confirmation email received from OpenAI: yes

## Failure chronology and corrective action

| Failure class | Observable symptom | Root cause | Corrective action | General lesson |
|---|---|---|---|---|
| Intake-path mismatch | Support could retain text but could not confirm grant intake | The public form was the authoritative program intake | Complete the public form and treat support cases as context only | Clearly distinguish support records from program submissions |
| Network/admin block | `net::ERR_BLOCKED_BY_ADMINISTRATOR` | Environment policy blocked access | Retry in a current browser/device and preserve diagnostics | Public forms need a documented alternate-access path |
| Ephemeral locator | Project title timed out after earlier fields were filled | Form rerender replaced nodes and removed injected identifiers | Resolve each field afresh by stable `name` and verify after each DOM update | Never retain fragile locators across dynamic rerenders |
| Duplicate field mapping | Project title helper text was treated as another control | Labels/helper text were confused with field identity | Enforce unique field identities and a captured form contract | A schema should describe controls, not surrounding prose |
| Acknowledgment mismatch | Separate checkbox did not appear | Official acknowledgment was presented as terms text | Extract current terms, require JP’s personal affirmation, and detect text-only mode | Consent semantics must be explicit and accessible |
| False acknowledgment candidate | Unrelated control looked checkbox-like | Generic control discovery lacked semantic/spatial association | Require text association, label evidence, proximity, and stable state | Generic automation should not infer consent from control shape alone |
| Textarea mismatch | Funding value differed by one terminal character | Browser/form serialization altered terminal formatting | Canonicalize only bounded line-ending/terminal formatting while rejecting substantive changes | Exactness needs explicit canonicalization rules, not broad tolerance |
| Disabled visual Submit | Form valid, no invalid fields, but visible button stayed disabled | Visual button state diverged from Marketo form state | Synchronize via native events and Marketo `setValues`; use Marketo `validate`, `submittable`, and official `submit()` only when its gates passed | Use the form platform’s authoritative state rather than force-enabling UI |
| Ambiguous confirmation risk | A click could theoretically occur without visible confirmation | UI/navigation signals alone can be incomplete | Record candidate request fingerprints, confirmation text, and form disappearance; prohibit a second click | Exactly-once systems need a terminal “unknown” state |
| Mobile connection fragility | Time-limited remote human step could disconnect | Tunnel/mobile bandwidth variability | Provide primary/fallback links, low-bandwidth mode, secure-cookie reconnect, and ETag screenshots | Human-in-the-loop flows need reconnection by design |

## Safety controls that mattered

### Exactly-once behavior

- Atomic in-run submit lock.
- Cross-run confirmed-submission artifact.
- No retry after an ambiguous click outcome.
- Direct user taps on the remote Submit control blocked.
- One explicit authorization bound to the reviewed commit.

### Trust and integrity

- Trusted OpenAI HTTPS origin checked before form fill and before submission.
- Form action hashed and suspicious actions rejected.
- Stable field contract checked before data entry.
- Every field value verified after entry and again before submission.
- Acknowledgment text hashed and sampled repeatedly.
- Confirmation required multiple positive signals.

### Privacy

- Proposal bodies excluded from ordinary logs.
- Routine evidence used hashes, lengths, field names, state transitions, and redacted screenshots.
- The receipt retained sufficient provenance to audit the action without publishing confidential credentials or session tokens.

## What should be preserved in future versions

1. Stable field-name contract with duplicate detection.
2. Fresh locator resolution after every dynamic update.
3. Bounded canonical comparison for textareas.
4. Human-only acknowledgment action with current text displayed.
5. Semantic acknowledgment-control detection and explicit text-only mode.
6. Native-event and form-platform state synchronization.
7. Platform validation and submittable gate; never force-enable.
8. Exactly-one action lock and terminal ambiguity state.
9. Multi-signal confirmation receipt.
10. Primary/fallback, low-bandwidth, refresh-safe human interface.
11. Tamper-evident event chain and redacted evidence archive.

## Remaining opportunities

- Add a first-party submission reference number to the confirmation screen and email.
- Expose a structured validation summary rather than only a disabled button.
- Provide a server-issued idempotency key for resubmission safety.
- Save an applicant draft and permit resume on another device.
- Define acknowledgment semantics in accessible markup.
- Offer a formal channel for users to submit reproducible intake-system feedback and receive acknowledgment of its source.

## Non-claims

This postmortem documents a user-side submission workflow and observed public-form behavior. It does not claim access to OpenAI internal systems, source code, private telemetry, or decision processes.
