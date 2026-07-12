# JP Systems Hub — Project Map

This repository is a public multi-project systems hub maintained by JP. It contains application code, public-safe documentation, verification scripts, deployment workflows, and bridge records for several related workstreams.

## Project lanes

| System | Purpose | Primary locations | Current status | Public boundary |
|---|---|---|---|---|
| Goblin / Lichburn | Next.js application and control-console work | `src/`, root app files, `docs/` | Active | Public code and public-safe concepts |
| GRIPLOOM | Verification, production, receipt, and evidence rails | `docs/`, `scripts/`, `examples/`, app routes | Active | Public-safe documentation and tooling |
| F-WAD | Field, campaign, and visualization module | app routes, `docs/`, `examples/` | Experimental | Public-safe concept and implementation |
| Observer routing | Deterministic observer-route and release checks | `scripts/`, `examples/`, `.github/workflows/` | Active | Public code and receipts |
| Fardarter | Isolated static startup website | `fardarter-startup/` | Deployment pending verification | Public site package only |
| Norstein | Public bridge to private canonical work | public bridge docs and records | Active bridge | No private source or credentials |

## Operating rule

Every consequential repository action should move through an issue or exact task, a dedicated branch, a reviewable pull request, verification checks, explicit JP approval, and a durable receipt.

## Canonical separation

The private repository `hvitiswift-afk/Norstein-Bekkler` is the canonical private workspace for Norstein source and internal material. This public repository may contain only approved public-safe bridge outputs and receipts.
