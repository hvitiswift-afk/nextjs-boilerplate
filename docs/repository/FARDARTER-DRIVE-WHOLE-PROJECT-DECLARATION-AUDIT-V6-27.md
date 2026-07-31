# Fardarter Drive™ v6.27 — whole-project declaration audit

## State

```text
Control             FARDARTER-DRIVE-WHOLE-PROJECT-DECLARATION-AUDIT-V6-27
Manifest digest     3487f55a5365c7737d51b41ca8a7878e96df164deedc28089abab694701657ce
Base head           6c3f36d8bce9bc922a5509b5b5e58ad68c1c9083
Prepared state      PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE
Post-merge state    WHOLE_PROJECT_DECLARATION_AND_PAUSED_WORK_RECONCILED
Active top head     FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21
Governance parent   FARDARTER-DRIVE-CLAIM-WITNESS-REF-INTEGRITY-V6-26
```

v6.27 does not replace v6.21. It adds a complete project-inventory and declaration-reconciliation layer.

## Why this exists

The connected GitHub search surface can return a bounded result slice. The repository itself contains more issues, retained branches, old pull requests, duplicate trackers, historical declarations, externally gated work, and paused implementation lanes than a single search result can safely represent.

The repository-native audit therefore uses `gh api --paginate` for issues, pull requests, issue comments, branches, and workflows; enumerates all head refs; and reads the complete checked-out source tree. Every provider-returned object must be classified exactly once. A missing object is an audit failure rather than a silent omission.

## Declaration classes

Issues receive exactly one state:

- `CURRENT_AUTHORITY`
- `PROTECTED_HISTORICAL_BODY`
- `COMPLETED_HISTORICAL`
- `DUPLICATE_OPEN_REVIEW`
- `DUPLICATE_CLOSED`
- `IMPLEMENTED_BY_CURRENT_MAIN_REVIEW`
- `STALE_DECLARATION_REVIEW`
- `PAUSED_WORK_REVIEW`
- `EXTERNALLY_BLOCKED_REVIEW`
- `BACKLOG_UNSTARTED`
- `NO_EFFECT_HISTORICAL`
- `MANUAL_CLASSIFICATION_REQUIRED`

`MANUAL_CLASSIFICATION_REQUIRED` is explicit coverage. It is never silently treated as complete, stale, or safe to close.

Pull requests, branches, and workflows use separate exact classification enums. The audit never closes, rewrites, deletes, merges, rebases, deploys, or repairs an object automatically.

## Current known paused and separated lanes

### Imperatus

PR #118 merged the public-safe source. The paused remainder is external and unverified:

- remote `/mcp` reachability;
- five positive remote cases;
- three negative remote cases;
- deployment receipt;
- application or submission receipts.

Merged source is not a provider connection, deployment, OpenAI approval, app-directory listing, carrier delivery, or live SMS.

### MATADATA

Open PRs #120, #123, #124, #125, #127, and #128 require current-main refresh and declaration review before any continuation or closure.

### Lawbound

Open PRs #92 and #116 require a single current replacement decision. Neither open PR is current canonical source.

### GitHub Pages

Open Pages PRs and Issue #102 are separate from the verified Netlify application. Pages activation or external repository settings remain human/provider-gated unless exact evidence exists.

### Lockfile and old CI blockers

Historical lockfile/build failures, including old Issue #119 text, are not current-main blockers when current repository-owned checks pass. Old repair PRs remain historical or refresh-review objects until explicitly reconciled.

### Legacy labs and Receipt 220

Old route/lab PRs and Earth Mesh Receipt 220 remain paused or implemented-by-later-main review lanes. The scanner compares declared routes and file paths to the current source tree instead of assuming their old PR state is still current.

## Duplicate handling

Exact normalized issue-body duplicates are grouped by SHA-256. The lowest issue number is the deterministic canonical member for audit purposes. This does not rewrite or delete any issue. An open duplicate becomes `DUPLICATE_OPEN_REVIEW`; a closed duplicate becomes `DUPLICATE_CLOSED`.

## Connector improvements

- Full provider pagination replaces bounded search as the coverage authority.
- Issue endpoint PR objects are cross-checked against the pulls endpoint.
- Branch API results are cross-checked against every remote head ref.
- Workflow registry entries are cross-checked against every workflow source file.
- Workflow source is inspected for schedules, write permissions, and provider-facing names.
- Branch divergence is calculated against `origin/main`, never against a pull-request merge ref.
- All outputs receive stable SHA-256 digests over sorted material fields.
- Provider timestamps, run IDs, comment IDs, workflow IDs, and similar generated metadata do not enter the project declaration digest.
- The audit reads job logs and artifacts, not status alone.
- No no-op commit, issue, comment, branch, or source mutation may be created merely to trigger the audit.
- GitHub function discovery must load the exact intended mutation function before a write. Routing incidents #243 and #244 are preserved as `NO_EFFECT_HISTORICAL` evidence.

## Outputs

The workflow uploads:

- `whole-project-inventory-v6-27.json`
- `whole-project-audit-v6-27.md`
- `duplicate-issue-groups-v6-27.json`
- `paused-work-queue-v6-27.json`
- `stale-declaration-queue-v6-27.json`
- `external-gate-queue-v6-27.json`
- `connector-coverage-v6-27.json`

The project declaration digest changes when a material title, body, comment set, PR state/head, branch ref, workflow source/state, or repository source path changes.

## Authority and truth order

1. Verified provider evidence controls provider and deployment truth.
2. v6.21 remains the current top-level control head.
3. Current reviewed governance manifests define repository control.
4. Current reviewed source defines repository source.
5. Protected public offer and strategy maps define their bounded roles.
6. Historical issue and PR text records what was planned or believed at that time.
7. Drafts, labels, comments, previews, open branches, and open PRs are noncanonical work signals.

A historical declaration is preserved but cannot override current authority. GitHub CI, a provider-named workflow, or a merged source file is not provider deployment evidence.

## Safety and privacy

No private Google Drive URL or file ID is public. The audit does not publish private receipt keys, identity evidence, signatures, authentication material, banking information, counsel notes, provider-private records, or deliberations.

It creates no deployment, provider mutation, external contact, Gmail send, consent, HUMAN_ACCEPTED, order, contract, payment, revenue, settled cash, work start, canonical event, capacity use, legal term, deletion, rewrite, or irreversible action.

## Progression rule

After reviewed merge and post-merge live readback, the standing controller consumes the deterministic remediation queue. Work proceeds one bounded lane at a time:

1. exact duplicates;
2. stale declarations;
3. implemented-by-current-main review;
4. paused PRs and branches;
5. externally gated work;
6. unstarted backlog.

No remediation is automatic merely because the audit classifies an item.
