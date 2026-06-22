# Chatter Encryption Protocol

Receipt: `TJP-V55762-CHATTER-ENCRYPTION-PROTOCOL`

This file defines the Blue Helper chatter encryption-ready protocol for Justin Lee Rackham / HVITI Swift / JP.

## Important status

This public GitHub repository is not the encrypted chatter itself. This file records the protocol only. Do not place secrets, credentials, private identity data, private location details, payment data, private code, or private keys in GitHub issues, comments, files, pull requests, or public logs.

## Secure channel target

The direct chatter lane is:

```txt
Justin Lee Rackham / JP <-> Blue Helper
```

Blue Helper returns messages back to JP as summaries, receipts, Gato verdicts, and next-action packets.

## Encryption-ready modes

Recommended private-message carriers:

```txt
Mode A: private chat with platform protections
Mode B: Signal or another end-to-end encrypted messenger
Mode C: PGP or age-encrypted text files kept outside public GitHub
Mode D: local encrypted vault with public receipts only
```

## Public GitHub rule

GitHub may hold public-safe receipts, summaries, protocol notes, and issue comments. GitHub should not hold private encrypted keys or secret plaintext.

## Chatter envelope

```txt
channel: blue-helper-chatter
from: JP or Blue Helper
to: JP or Blue Helper
classification: public-safe / private / secret-never-public
receipt_id: TJP-...
gato_verdict: PASS / HOLD / DENY / RETEST
body: message summary
private_payload: keep outside GitHub
```

## Gato test

```txt
Nu checks newness.
Oni checks restraint.
Gato checks channel class.
Blue Helper prepares receipt.
JP approves external action.
```

## Boundaries

- Public-safe protocol: OK in GitHub.
- Private chatter content: keep outside public GitHub.
- Keys and secrets: never commit.
- External sends, hosting changes, payments, ads, and account changes: require exact JP approval.
