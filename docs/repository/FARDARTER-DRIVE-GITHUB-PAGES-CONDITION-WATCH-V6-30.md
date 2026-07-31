# Fardarter Drive™ v6.30 — Idempotent GitHub Pages Condition Watch

## Control

```text
Control             FARDARTER-DRIVE-GITHUB-PAGES-CONDITION-WATCH-V6-30
Manifest digest     f16015510093429e1aef5535c7e5d186454c0af1f6559d1d8611defbe0d17a97
Repository base     b7adac65667a3dcfcafe5bcc7f713fae57770c3a
Prepared state      PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE
Post-merge state    GITHUB_PAGES_CONDITION_WATCH_SOURCE_RECONCILED
Controlling issue   #252
Implementation      #253
```

v6.30 advances the completed v6.29 source package without claiming that GitHub Pages is enabled, deployed, reachable, or live.

## Proven execution gap

The connected GitHub app can read repository state and rerun an existing job, but it does not expose a new workflow-dispatch action or a Pages-administration action. The current Pages probe remains:

```text
PAGES_NOT_ENABLED_OR_NOT_VISIBLE
```

GitHub's authorization model separates account-level Pages configuration from deployment:

```text
Create or update Pages site     Pages write + Administration write
Dispatch a workflow             Actions write
Deploy to configured Pages      Pages write
```

The v6.29 repeat workflow had push and manual triggers only. If a repository administrator enabled Pages after the source merge, no new source push or connector-dispatch action was guaranteed.

## Condition-watch state machine

The repeat publication workflow now runs hourly at minute 17 and on its existing push/manual triggers.

### Pages absent or unreadable

```text
PAGES_CONFIGURATION_ABSENT_OR_NOT_VISIBLE
→ verify source readiness
→ build the deterministic nine-file static artifact
→ verify its exact source commit
→ upload source and preflight evidence
→ do not deploy
```

### Pages exists with a non-workflow source

```text
PAGES_CONFIGURATION_PRESENT_NON_WORKFLOW_SOURCE
→ preserve source evidence
→ classify configuration mismatch
→ fail closed
→ do not change Pages settings
→ do not deploy
```

### Pages exists with GitHub Actions as the source

```text
PAGES_CONFIGURATION_PRESENT_WORKFLOW_SOURCE
```

The workflow reads the public `status.json` and compares:

- authority control;
- authority digest;
- current source commit.

When all three match the current default-branch `GITHUB_SHA`, the workflow emits `IDEMPOTENT_NO_DEPLOY` and does not create a redundant deployment.

When the live source is absent or stale, it builds the exact static artifact, deploys once, and requires the public verifier to match the exact expected source commit.

## Concurrency and duplicate prevention

```text
Concurrency group       fardarter-github-pages
Cancel in progress      false
Source evidence/run     always
Blind deployment        forbidden
Already-current deploy  suppressed
```

A scheduled run cannot cancel an in-progress Pages publication. An already-current site does not receive a redundant deployment.

## Human action remaining

A repository administrator must perform one provider-native action:

```text
Settings
→ Pages
→ Build and deployment
→ Source: GitHub Actions
```

No token needs to be pasted into chat, an issue, source, or a workflow input for that manual setting. v6.30 does not perform it automatically.

After the setting becomes observable, the hourly workflow may deploy the current reviewed static source under the already-declared Pages-write workflow permission.

## Evidence separation

```text
Condition-watch source prepared     true
Pages configured                    false
Condition watch run on main         false
Pages deployment succeeded          false
Public URL verified                 false
Pages live claim allowed            false
```

Source completion, workflow execution, Pages configuration, Pages deployment, public URL readback, and operational publication receipts remain separate evidence classes.

## Preserved authority

- v6.21 remains the active top-level current control head.
- v6.28 remains GitHub-primary platform authority.
- v6.29 remains the completed one-run publication-source layer.
- v6.27 remains the complete whole-project declaration audit.
- v6.26 remains the live claim/ref witness layer.
- Issue #102 remains open until exact operational publication evidence exists.
- Netlify remains transitional historical readback.
- Vercel remains retired/not planned.

## Zero effects during source preparation

v6.30 does not:

- enable or reconfigure GitHub Pages;
- create or expose a token or repository secret;
- dispatch a workflow;
- deploy during preparation or pull-request review;
- claim the expected URL live;
- mutate Netlify or Vercel;
- send email or contact an external person;
- infer consent;
- append a canonical event;
- create an order, contract, payment, revenue, work start, or capacity use;
- expose private Drive references;
- grant ChatGPT/Radio independent authority.

## Next controlled action

```text
ENABLE_PAGES_WITH_GITHUB_ACTIONS_ONCE
THEN_ALLOW_HOURLY_IDEMPOTENT_PUBLICATION_WATCH
```
