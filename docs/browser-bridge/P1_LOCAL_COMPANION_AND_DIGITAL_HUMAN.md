# Browser Bridge P1 — Local Companion and Digital Human

## Status

```text
P0 protocol                 VERIFIED
P1 local companion          IMPLEMENTED_ON_REVIEW_BRANCH
P1 automated verification   PENDING_GITHUB_ACTIONS_READBACK
Local authenticated run     NOT_RUN
GitHub Enterprise trial     NOT_CREATED_OR_NOT_YET_VERIFIED
```

## Mission

P1 converts the P0 human↔agent protocol into a local browser companion for account setup. The first target is GitHub Enterprise Cloud free-trial signup for `hvitiswift-afk` and the proposed Fardarter Company enterprise.

The companion runs on JP's computer, attaches only to a dedicated Chrome profile through `http://127.0.0.1:9222`, fills ordinary reviewed fields, pauses for protected steps, resumes after JP's handoff, and records redacted local receipts.

## Recovered MATADATA source

The most recent preserved MATADATA browser toolkit located for this work is `README(147).md`, created on August 2, 2026 at 04:39:53 UTC. Retained metadata does not expose the originating chat title.

The recovered work includes:

- normalized pressure stages from `1/128` through full pressure;
- debounce, hysteresis, hold-time, and release-to-commit safety;
- ordinary browser focus, typing, selection, reviewed upload, keypress, click, and confirmation;
- protected-step conversion to `pause-and-handoff` for CAPTCHA, identity, liveness, biometrics, MFA, signature, consent, payment, recovery, and legal attestation;
- account and ID-form assistance from runtime-only sources;
- reviewed-document gates and metadata/hash-only receipts;
- simulator-safe operation when verified physical hardware is absent.

P1 incorporates these properties without claiming that physical pressure hardware is currently connected or validated.

## Digital Human composition

### Digital Mind

The Digital Mind is the intent, policy, planning, truth-state, memory, and review layer. It may hold public-safe mission mappings and encrypted backward-looking notes. It does not read thoughts or obtain automatic consent.

### Digital Body

The Digital Body is the visible local action layer: browser controls, pressure intents, local device state, pause/handoff state, and redacted receipts. It does not capture a biological body or authorize powered human movement.

### Digital Human

The Digital Human is the consent-gated composition of the two layers under JP's control.

```text
Digital Human ≠ legal person
Digital Human ≠ JP identity transfer
Digital Human ≠ automatic signature
Digital Human ≠ independent provider authority
Digital Human ≠ mind or neural capture
```

JP remains the human principal and final approver.

## Human ↔ agent relationship

The relationship is cooperative and stateful, not substitutive.

| Layer | May do | Must not do |
|---|---|---|
| Agent / Digital Mind | Plan, match ordinary fields, interpret redacted state, suggest the next reversible action | Invent identity, possess secrets, accept legal terms, claim provider success |
| Companion / Digital Body | Open allowlisted pages, discover controls, fill ordinary values, apply ordinary pressure intents, write local receipts | Read secret values, expose debugging externally, bypass protected controls, blindly retry |
| JP | Authenticate, review, decide, accept or refuse terms, complete identity/payment/final action | No requirement to delegate a protected step |
| Provider | Validate, create, reject, and return authoritative state | Provider state cannot be inferred from preparation alone |

## Account setup policy

Ordinary account fields may be populated from reviewed public values or local environment variables. The public mission stores only the source name, not the resolved private value.

Protected account operations always pause:

- password and passkey;
- MFA and one-time code;
- CAPTCHA and human verification;
- liveness, biometric, or identity attestation;
- account recovery;
- signature or legal terms;
- payment and paid conversion;
- final creation when it binds terms or billing.

## Pressure policy

Pressure is an accessibility and intent input, not consent.

```text
1/128  touch detect
1/64   hover
1/32   focus
1/16   select
1/8    type mode
1/4    activate after stable hold and release
1/2    request ordinary confirmation
full   ordinary confirmation OR protected pause-and-handoff
```

Raw ADC values are transient and are not stored. Full pressure cannot authorize a protected provider action.

## Backward-looking notes

Notes are local, encrypted, append-only, and retrospective.

- AES-256-GCM.
- Key supplied through `JP_BROWSER_BRIDGE_NOTES_KEY`.
- One encrypted record per line.
- Digest chain preserves order.
- Receipt contains only timestamp, mission ID, and hashes.
- Note content never enters public GitHub, Calendar, provider forms, or ordinary receipts.
- Corrections append; they do not silently rewrite earlier history.

## Calendar relationship

Calendar may be used automatically when the active task materially needs scheduling and JP has authorized Calendar use. P1 reuses the existing event on Tuesday, August 4, 2026 from 2:00–4:00 PM America/Detroit.

Calendar events are planning objects. They do not prove attendance, execution, provider acceptance, account creation, or completion.

## IP and attribution comment

> Concept origin and project direction for the MATADATA Digital Mind, Digital Body, Digital Human, pressure-assisted browser handoff, and human↔agent account-setup workflow are attributed to Justin Lee Rackham (JP). AI-assisted engineering through ChatGPT is disclosed. Use of GitHub, OpenAI, browsers, or other providers does not transfer ownership, establish partnership, or decide legal inventorship. Formal patent, copyright, trademark, and assignment questions remain subject to exact contribution records and qualified legal review.

This comment preserves attribution intent without making a legal conclusion that the repository cannot prove.

## Enterprise free-trial path

1. Run P1 verification and review the PR.
2. During the scheduled local block, clone/switch to the P1 branch.
3. Set runtime email and notes key locally.
4. Launch the dedicated Chrome profile.
5. Run `doctor` and `discover`.
6. Run the mission.
7. JP signs in and completes protected steps.
8. Companion fills ordinary fields.
9. JP reviews and performs the protected final creation step.
10. Companion verifies authenticated GitHub readback.
11. Install the GitHub app on the new organization.
12. Re-read organization and enterprise visibility through the connector.
13. Only then proceed to teams, rulesets, repository transfer, identity provider, billing, or conversion.

## Completion law

```text
IMPLEMENTED ≠ RUN
RUN ≠ SUBMITTED
SUBMITTED ≠ CONFIRMED
ENTERPRISE NAME ≠ VERIFIED LEGAL ENTITY
DIGITAL HUMAN ≠ INDEPENDENT AUTHORITY
OUTCOME UNKNOWN = NO BLIND RETRY
```
