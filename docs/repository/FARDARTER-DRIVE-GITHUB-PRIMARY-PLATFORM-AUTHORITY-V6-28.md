# Fardarter Drive™ v6.28 — GitHub-primary platform authority

## State

```text
Control              FARDARTER-DRIVE-GITHUB-PRIMARY-PLATFORM-AUTHORITY-V6-28
Manifest digest      08f24213e0cb980f726a30d5fc58574430dfe4a3ad19715d7469d2ef97ed16aa
Base head            15aeb614d5f12c71d114e83c1500598105d51318
Prepared state       PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE
Post-merge state     GITHUB_PRIMARY_PLATFORM_AND_PUBLICATION_INTENT_RECONCILED
Active top head      FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21
Project audit parent FARDARTER-DRIVE-WHOLE-PROJECT-DECLARATION-AUDIT-V6-27
Claim witness parent FARDARTER-DRIVE-CLAIM-WITNESS-REF-INTEGRITY-V6-26
```

v6.28 does not replace v6.21. It changes the intended platform and publication direction for the public-safe project.

## Current platform authority

```text
GitHub repository/main        GITHUB_PRIMARY_INTENDED
GitHub Issues and PRs         GITHUB_PRIMARY_INTENDED
GitHub Actions                GITHUB_PRIMARY_INTENDED
GitHub Pages                  GITHUB_PAGES_PUBLICATION_PENDING_VERIFICATION
GitHub Artifacts/Releases     GITHUB_PRIMARY_INTENDED
GitHub Packages               GITHUB_PRIMARY_INTENDED
Netlify                       NETLIFY_TRANSITIONAL_HISTORICAL_READBACK
Vercel                        VERCEL_RETIRED_NOT_PLANNED
Other providers               OTHER_PROVIDER_HISTORICAL_OR_EXPLICIT_EXCEPTION
```

GitHub is the intended authority for source, planning, review, CI, audit, static publication, distributable artifacts, release records, and public receipts.

External providers are not required to review, accept, or merge repository source. Any future external provider use requires an explicit exception and separate evidence.

## GitHub Pages boundary

GitHub Pages is static hosting.

It can publish:

- static HTML, CSS, JavaScript, images, documentation, and generated client-side applications;
- static project portals and public-safe receipts;
- static exports produced by GitHub Actions.

It does not automatically execute the repository's Next.js server routes or API handlers.

Therefore:

- repository source completion is not a Pages publication receipt;
- a successful Actions build is not a public Pages readback;
- an existing `/api/*` source path is not a live GitHub Pages API;
- server-dependent behavior must remain source/test/simulated evidence or be redesigned into static/client-side behavior;
- Issue #102 remains open until Pages is enabled, the publication workflow succeeds, and the public URL is read back.

## ChatGPT and Radio

Current state:

```text
CONNECTED_USER_DIRECTED_ASSISTANT_BACKING_GITHUB_RAIL
```

Radio may assist JP by reading and operating connected GitHub records, verifying evidence, drafting bounded changes, and maintaining the standing task.

Radio and ChatGPT are not currently:

- the repository owner;
- a credential holder;
- an independent legal identity;
- a hosting provider;
- an automatic consent authority;
- an autonomous source of irreversible authority.

The future design target is:

```text
PROVIDER_NEUTRAL_EXPORTABLE_USER_CONTROLLED_AGENT_PORTABILITY
```

That target means open schemas, deterministic workflows, exportable receipts, portable state, and explicit JP control. It is not a present claim that ChatGPT is independent.

## Provider transition

### Vercel

Vercel is retired from the intended path.

The two account-blocked GitHub status contexts remain historical evidence. Issue #17 is closed `not_planned`; Issue #20 remains a preserved duplicate. No Vercel billing, account, project, or deployment repair is intended.

### Netlify

The existing verified Netlify deploy remains preserved evidence:

```text
Site             lichburn-v0-2-8
Deployed source  88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334
Deploy           6a6ba0366ebec6650d843ac3
State            DEPLOYED_AND_VERIFIED
Classification   NETLIFY_TRANSITIONAL_HISTORICAL_READBACK
Preferred        false
```

This evidence is not deleted or denied. It is no longer the intended platform or source authority. It remains a transitional historical readback until GitHub Pages publication is independently verified.

## Reconciled lanes

### `[14,16]`

- #14 is the canonical lab-navigation tracker.
- #16 is the closed duplicate.
- PR #15 remains open and must be refreshed against current `main`.
- GitHub Actions is the acceptance rail.
- GitHub Pages is the intended static publication rail.
- No Vercel or Netlify dependency remains.
- No live publication is claimed.

### `[17,20]`

- #17 is closed `not_planned` as historical Vercel evidence superseded by GitHub-primary strategy.
- #20 remains closed duplicate history.
- The historical Vercel and fallback comments remain append-only.
- No provider mutation occurred.

### `[22,25]`

- #22 is the closed historical duplicate.
- #25 is the canonical Dipper Shift tracker.
- PR #23 remains open and requires refresh against current `main`.
- GitHub Actions is the acceptance rail.
- GitHub Pages-compatible static/client-side output is the intended publication route.
- No live route is claimed.

## Whole-project defaults

All future bounded lanes default to:

1. GitHub Issue for the work object.
2. Dedicated GitHub branch.
3. Reviewable pull request.
4. Repository-owned GitHub Actions.
5. Immutable merge readback.
6. GitHub Artifacts, Releases, or Packages when distribution is needed.
7. GitHub Pages for public static publication.
8. Exact public and private receipts.

Historical references to Netlify, Vercel, AWS, Cloudflare, or other providers are evidence of earlier plans or deployments. They do not override the current GitHub-primary authority.

## Verification

The v6.28 workflow is read-only. It verifies:

- the strict manifest and schema;
- README and deployment-document authority markers;
- issue states for #14, #16, #17, #20, #22, #25, and #102;
- exact GitHub-primary declaration comments;
- the GitHub Pages configuration probe without enabling Pages;
- the absence of provider mutation and live-site overclaims.

## Boundaries

v6.28 does not:

- enable GitHub Pages;
- create or expose credentials;
- deploy or publish;
- mutate Netlify or Vercel;
- merge old pull requests;
- mass-close issues;
- delete provider history;
- grant ChatGPT independent authority;
- infer consent;
- create orders, payment, revenue, work start, or capacity use;
- append a canonical event.

## Next controlled action

```text
VERIFY_AND_ENABLE_GITHUB_PAGES_THEN_MIGRATE_STATIC_PUBLIC_SURFACES_ONE_BOUNDED_LANE_AT_A_TIME
```
