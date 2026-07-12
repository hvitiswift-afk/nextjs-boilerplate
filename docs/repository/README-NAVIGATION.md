# README Navigation Plan

The root `README.md` currently contains substantial technical material for Goblin, GRIPLOOM, F-WAD, deployment, verification, and API examples. This plan preserves that material while establishing a clearer front door.

## Proposed root README order

1. **JP Systems Hub** — one-paragraph repository identity.
2. **Project map** — links to Goblin / Lichburn, GRIPLOOM, F-WAD, Observer routing, Fardarter, and the public Norstein bridge.
3. **Status and boundaries** — links to the repository status and public/private boundary documents.
4. **Quick verification** — local install, development, and repository-owned verification commands.
5. **Release control** — issue → branch → draft PR → checks → JP approval → merge receipt.
6. **Project details** — retain the existing technical material below the front-door section or move it into project-specific documents through later reviewed pull requests.

## Front-door copy

```md
# JP Systems Hub

A public multi-project repository for JP's application code, verification rails, public-safe documentation, deployment workflows, and durable receipts.

## Start here

- [Project map](docs/repository/PROJECT-MAP.md)
- [Current status](docs/repository/STATUS.md)
- [Public/private boundary](docs/repository/PUBLIC-PRIVATE-BOUNDARY.md)
- [Release process](docs/repository/RELEASE-PROCESS.md)

## Operating rule

Consequential work moves through an exact task, dedicated branch, reviewable pull request, verification, JP approval, and a durable receipt. Repository preparation does not authorize account-level settings, credentials, billing, deployment, publication, submissions, outreach, or payments.
```

## Non-destructive migration rule

Do not remove existing README sections until their replacement locations are confirmed and linked. README restructuring should remain reviewable, reversible, and separate from deployment or account-level actions.
