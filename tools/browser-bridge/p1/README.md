# Human ↔ Agent Browser Bridge P1

P1 provides a local-only browser companion for authenticated account workflows. The first mission is the GitHub Enterprise Cloud free trial for `hvitiswift-afk` and the proposed Fardarter Company enterprise.

## Attribution and relationship

Concept origin and project direction: **Justin Lee Rackham (JP)** through **MATADATA**. AI-assisted engineering is disclosed.

Browser Bridge is used with and as part of MATADATA under JP direction. This repository does not decide final legal inventorship, ownership, assignment, trademark scope, provider partnership, endorsement, or affiliation.

## Digital Human model

```text
DIGITAL MIND
intent + mission policy + field mapping + calendar context
+ backward-looking encrypted notes + receipt interpretation

              ↓ consent-gated composition

DIGITAL BODY
local browser + visible controls + pressure intents
+ pause/handoff state + local receipt storage

              ↓ JP remains principal

DIGITAL HUMAN
user-controlled software identity layer for human↔agent cooperation
```

`Digital Human` is not biological capture, mind-reading, neural control, legal identity transfer, automatic consent, or independent authority.

## Security architecture

- Node.js 22+.
- Chrome DevTools Protocol on `127.0.0.1` only.
- Dedicated browser profile under `.browser-bridge/chrome-profile`.
- No public remote desktop or tunnel.
- Exact mission origin allowlist.
- Runtime-only private values.
- Secret-bearing controls are classified and never read or filled.
- Password, passkey, MFA, CAPTCHA, liveness, identity, signature, legal terms, consent, payment, recovery, and paid conversion pause for JP.
- Redacted receipts contain keys and state, not field values.
- Backward-looking notes use AES-256-GCM with an append-only digest chain.
- Unknown submission outcome disables blind retry.

## Files

- `local-companion.mjs` — launch, doctor, discover, fill, run, pressure, and notes commands.
- `pressure-policy.mjs` — MATADATA pressure-to-intent policy.
- `secure-notes.mjs` — encrypted backward-looking notes.
- `examples/browser-bridge/github-enterprise-signup.mission.json` — public-safe GitHub trial mission.
- `examples/browser-bridge/digital-human.profile.json` — Digital Mind + Digital Body composition and boundaries.

## 1. Prepare the local environment

Clone the repository and switch to the P1 branch:

```bash
git clone https://github.com/hvitiswift-afk/nextjs-boilerplate.git
cd nextjs-boilerplate
git switch agent/human-browser-bridge-p1
node --version
```

Node must report version 22 or newer.

Set the private receipt/contact email only in the local environment:

### PowerShell

```powershell
$env:JP_GITHUB_CONTACT_EMAIL = "YOUR_REVIEWED_EMAIL"
```

### macOS/Linux shell

```bash
export JP_GITHUB_CONTACT_EMAIL='YOUR_REVIEWED_EMAIL'
```

Do not commit resolved identity values, passwords, tokens, payment data, identification documents, or recovery material.

## 2. Prepare encrypted backward-looking notes

Generate a local key once:

```bash
node tools/browser-bridge/p1/local-companion.mjs notes-key
```

Store the output in a password manager or OS-protected secret store, then expose it only for the current shell:

### PowerShell

```powershell
$env:JP_BROWSER_BRIDGE_NOTES_KEY = "BASE64_KEY_FROM_THE_COMMAND"
```

### macOS/Linux shell

```bash
export JP_BROWSER_BRIDGE_NOTES_KEY='BASE64_KEY_FROM_THE_COMMAND'
```

Add a retrospective note through stdin so the note is not placed in shell history:

```bash
printf '%s' 'Verified what happened; no provider confirmation yet.' \
  | node tools/browser-bridge/p1/local-companion.mjs note \
      --state RETROSPECTIVE_VERIFIED \
      --evidence local-readback
```

Read notes locally:

```bash
node tools/browser-bridge/p1/local-companion.mjs read-notes
```

Notes are backward-looking only. They must preserve corrections rather than silently rewriting history.

## 3. Launch a dedicated Chrome profile

Set or pass the exact Chrome/Chromium executable path. The companion intentionally does not guess.

```bash
node tools/browser-bridge/p1/local-companion.mjs launch \
  --chrome-path '/exact/path/to/chrome'
```

The launch command uses:

```text
remote debugging endpoint  http://127.0.0.1:9222
profile                    .browser-bridge/chrome-profile
external tunnel            disabled
```

The dedicated profile may retain the GitHub login after JP signs in. It should not be shared with another person or copied into the repository.

## 4. Doctor and redacted discovery

```bash
node tools/browser-bridge/p1/local-companion.mjs doctor
node tools/browser-bridge/p1/local-companion.mjs discover
```

`discover` reports labels, names, types, and whether a value is present. It does not return password/OTP/payment values.

To test mission structure before supplying private runtime values:

```bash
node tools/browser-bridge/p1/local-companion.mjs doctor --allow-missing-runtime
```

## 5. Pressure rail

The MATADATA pressure rail is local-only and simulator-safe by default.

```bash
node tools/browser-bridge/p1/local-companion.mjs pressure \
  --level 1/4 \
  --category ordinary \
  --stable-ms 300 \
  --released
```

Protected example:

```bash
node tools/browser-bridge/p1/local-companion.mjs pressure \
  --level full \
  --category legal-terms \
  --stable-ms 1000 \
  --released
```

The protected example returns `pause-and-handoff`; full pressure never becomes legal consent, identity verification, payment authorization, or CAPTCHA completion.

## 6. Run the GitHub Enterprise trial mission

```bash
node tools/browser-bridge/p1/local-companion.mjs run
```

The companion follows this sequence:

1. Validate Node, mission hash, runtime values, origin, and loopback Chrome.
2. Open the GitHub Enterprise signup page.
3. Pause while JP personally signs in and completes MFA/CAPTCHA/recovery/identity steps.
4. Discover fresh controls and fill only ordinary reviewed fields.
5. Pause again for JP to review values and personally accept terms, select any trial/payment choices, and click the final Create action.
6. Read the provider result.
7. Record `CONFIRMED` only when the GitHub URL and visible page evidence satisfy the mission signals.
8. Record `SUBMISSION_STATUS_UNKNOWN` and prohibit blind retry when confirmation is absent.

The companion does not click a protected final control.

## Calendar handoff

The live setup block is scheduled for **Tuesday, August 4, 2026, 2:00–4:00 PM America/Detroit**, reusing the existing JavaScript/browser-automation calendar block. Calendar presence is planning evidence, not proof that signup was completed.

## Trial completion checklist

After positive GitHub readback:

- Confirm the enterprise name and slug.
- Confirm `hvitiswift-afk` is an owner or authorized enterprise administrator.
- Confirm the trial state and expiration date shown by GitHub.
- Create or attach the intended GitHub organization.
- Install/authorize the connected GitHub app on the organization.
- Re-read organization visibility through the connector.
- Only then plan repository transfer, teams, rulesets, identity provider, billing, or trial conversion.

## Truth law

```text
LOCAL COMPANION READY ≠ SIGNED UP
SIGNED IN ≠ TERMS ACCEPTED
FIELDS FILLED ≠ SUBMITTED
CREATE CLICKED ≠ CONFIRMED
CALENDAR EVENT ≠ COMPLETION
OUTCOME UNKNOWN = NO BLIND RETRY
CONFIRMED = POSITIVE AUTHENTICATED GITHUB READBACK
```
