# Norstein public bridge

This repository is the public GitHub rail for Norstein, integrated into the existing Goblin/GRIPLOOM system. The full public Nexus and campaign are linked from the machine-readable bridge record.

The canonical Norstein source remains in the private `hvitiswift-afk/Norstein-Bekkler` repository. This public rail records its identity and verified public relationship without copying private source or private records.

## Public boundary

Allowed here: public project identity, public Nexus links, public fundraiser terms, non-secret checks, and public release documentation.

Not allowed here: passwords, tokens, credentials, donor identities, payout/bank data, private-person records, payment execution, private source snapshots, Meta publishing authority, or app-store submission authority.

Run `node scripts/check-norstein-public-bridge.mjs` before merging changes to this rail.


## Connected GitHub capability — Y

Y connects this public repository to the private canonical Norstein repository. Public-safe metadata moves through classify → redact private-only material → verify → public PR → checks → merge receipt. Private implementation never automatically mirrors into public.

## Expanded authorization — Z

Z authorizes repository discovery, branches, file updates, pull requests, workflow inspection, and merging after passing checks. Repository creation, visibility changes, secret access, wholesale private-source mirroring, and release publication remain separately gated.

## XYZ.improved

X orchestrates Y and Z with checks, receipts, and rollback required. Validate without installing dependencies:

```bash
node scripts/check-norstein-public-bridge.mjs
```
