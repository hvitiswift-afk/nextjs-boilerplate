# Repository Status

Status labels used in this repository:

- **Active** — current code or documentation with an identified owner and verification path.
- **Experimental** — exploratory work that is not represented as production-ready.
- **Blocked** — prepared work waiting on a named external setting, credential, service, or approval.
- **Superseded** — retained for history but replaced by a newer branch, pull request, or implementation.
- **Private canonical** — source material maintained outside this public repository.

## Current lanes

| Lane | Status | Evidence boundary | Next controlled action |
|---|---|---|---|
| Goblin / Lichburn application | Active | Repository source and build checks | Consolidate standard verification entrypoint |
| GRIPLOOM rails | Active | Scripts, examples, docs, and receipts | Keep checks under one `verify` command |
| F-WAD | Experimental | Public-safe route and sample checks | Revalidate before release claims |
| Observer routing | Active | Deterministic scripts and workflow | Preserve release receipts |
| Fardarter site package | Blocked | Static package and workflow exist; live Pages state remains unverified | Verify Pages setting and deployment receipt |
| Norstein public bridge | Active bridge | Public-safe metadata only | Keep private canonical source separate |

## Pull-request hygiene

Every open pull request should be placed into one of four outcomes:

1. Merge after revalidation.
2. Rebase and repair.
3. Close as superseded.
4. Close without merge and preserve the reason.

No open pull request should be treated as current merely because it remains open.
