# GitHub Control Tower v3

**Repository:** `hvitiswift-afk/nextjs-boilerplate`  
**Default branch:** `main`  
**Audit snapshot:** 2026-07-29  
**Final approval:** JP (`@hvitiswift-afk`)

## Purpose

Make GitHub the source, review, verification, deployment-preparation, and receipt hub for JP Systems without confusing preparation with authority to perform consequential external actions.

```text
intake → scope lock → dedicated branch → draft PR → checks → review
       → JP approval → merge → post-merge verification → durable receipt
```

GitHub is the control plane. External hosts and services remain capability lanes behind explicit gates.

## Non-negotiable boundary

Repository work alone does not authorize:

- repository or account setting changes;
- secrets, credential, domain, or billing changes;
- production deployment or publication;
- external form submission, outreach, or messaging;
- payment, fundraising transaction, or financial execution;
- bypass of CAPTCHA, identity, signature, acknowledgment, or another human-only control.

A pull request may prepare one of these actions, but the action requires a separately stated target, authority, verification plan, and receipt.

## Canonical work states

| State | Meaning | Required next action |
|---|---|---|
| **Proposed** | A bounded task exists but work has not started. | Confirm scope and branch. |
| **Active** | Current branch or PR with a valid verification path. | Complete checks and review. |
| **Blocked** | Waiting on a named dependency, setting, credential, service, or approval. | Preserve evidence and do not imply completion. |
| **Superseded** | Replaced by a newer branch, PR, or implementation. | Close with the replacement reference. |
| **Reference** | Retained for provenance, research, or receipts; not current implementation. | Keep clearly labeled and out of the merge queue. |
| **Executed** | The authorized consequence occurred and was verified. | Attach the post-action receipt. |

## Mission object required for consequential work

Every task, issue, and pull request should identify:

1. target;
2. purpose and expected result;
3. owner and final approval point;
4. base and head branch;
5. included scope and explicit exclusions;
6. dependencies, predecessor work, conflicts, and superseded work;
7. verification commands and evidence;
8. risk and authority state;
9. external side effects and remaining human action;
10. rollback path;
11. receipt ID or path;
12. next controlled action.

## Current triage map

The 2026-07-29 audit reviewed 20 open pull requests returned by the repository query. Open status alone does not make a pull request current.

### P0 — preserve a linear, verifiable foundation

1. **MATADATA resilient intake**
   - Issue `#126` is the controlling implementation issue.
   - PR `#127` is the first reusable code layer and should be validated and resolved before its stacked successor.
   - PR `#128` is stacked on `#127`; rebase or retarget only after the predecessor state is final.
   - Human-only acknowledgment, CAPTCHA, identity, and signature boundaries remain mandatory.

2. **Dependency and lockfile repair**
   - Issue `#93` controls the CI repair lane.
   - PR `#117` should contain only the intended lockfile repair after revalidation.
   - Required checks remain `npm ci`, `npm run griploom:verify`, and `npm run build`.

### P1 — consolidate GitHub governance and publication preparation

1. **Lawbound / GitHub tasking rail**
   - Compare PR `#116` against stale PR `#92`.
   - Preserve the current coherent packet and close the superseded PR with an explicit reason.

2. **GitHub Pages preparation**
   - PR `#90` and Issue `#102` concern Pages readiness.
   - Enabling Pages is a repository-setting action and remains outside an ordinary code merge.
   - A live URL is not considered verified until a deployment and readback receipt exists.

### P2 — classify old or conflicting work

Review older open PRs such as `#88`, `#23`, `#21`, `#13`, `#12`, `#9`, and `#7` into exactly one outcome:

1. merge after revalidation;
2. rebase and repair;
3. close as superseded;
4. close without merge and preserve the reason.

Do not combine unrelated repairs merely to reduce the PR count.

### Duplicate-issue cleanup candidates

Review these apparent pairs before closing either item:

- `#94` and `#95`;
- `#84` and `#86`;
- `#85` and `#87`.

The retained issue should receive the useful context, links, and receipt history from the duplicate before closure.

## Pull-request merge gate

A PR is merge-ready only when all applicable conditions are true:

- scope matches the issue or task;
- diff contains no unrelated files;
- predecessor and stacked-PR order is correct;
- required checks pass against the current head SHA;
- no unresolved review request remains;
- secrets and public/private boundaries are preserved;
- deployment or external-action language accurately states what did and did not occur;
- rollback is explicit;
- JP approval is recorded;
- post-merge verification and receipt requirements are known.

## CI and deployment lanes

| Lane | GitHub responsibility | External consequence gate |
|---|---|---|
| Build and tests | Run deterministic repository checks. | None when read-only. |
| GitHub Pages | Prepare static build and workflow. | Settings enablement and public readback require explicit approval. |
| Netlify | Store adapter, workflow, and validation contracts. | Credentials, site linking, production promotion, and domains require explicit approval. |
| Vercel | Store adapter, workflow, and validation contracts. | Credentials, project linking, production promotion, billing, and domains require explicit approval. |
| Obsidian | Preserve compatible Markdown and receipt exports. | Private vault access or synchronization requires explicit access and authority. |

## Receipt minimum

Every merged consequential PR should leave a receipt containing:

```text
repository
issue/task
base branch
head branch
head SHA reviewed
merge SHA
checks and results
approval state
external actions performed: exact list or NONE
rollback path
post-merge readback
next controlled action
```

## Control-tower operating rule

```text
One mission → one controlling issue → one active implementation branch
            → one reviewable PR chain → one final merge path → one receipt
```

Exceptions must be declared, linked, and sequenced. Stacked PRs are allowed only when the dependency chain is visible and predecessor changes are not misrepresented as merged.
