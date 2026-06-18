# EARTH-ACI-GRIMTEAM-REVIEW-UNIT-MATRIX-223

## State
Review-branch documentation only.

## Purpose
Receipt 223 deepens the ACI and Grimteam coordination layer added in Receipt 222.

ACI is represented here as **Artifact Control Interface**. It controls artifacts through scope, QA, approval, boundary, rollback notes, receipts, and claim-state checks.

Grimteam is represented as the internal coordination layer that routes blockers, QA notes, receipts, rollback notes, and hold states.

## Review Unit Matrix

| Field | Meaning |
|---|---|
| `unit_id` | Unique review unit identifier |
| `artifact_name` | Exact artifact or document set |
| `source_receipt` | Receipt that created or changed the artifact |
| `target_path` | Exact review path or document folder |
| `unit_class` | review docs / internal artifact / hold |
| `approval_state` | missing / approved / confirmed |
| `qa_state` | not run / structural pass / review pass |
| `boundary_state` | active limits and blocked claims |
| `rollback_note` | how to reverse or close the change |
| `router_type` | route that places the artifact in review |
| `receipter_type` | route that records what happened |
| `current_claim` | safe wording now |

## Current Unit State

```text
unit_id: RU-223-GITHUB-REVIEW-DOCS
artifact_name: docs/earth-mesh receipt documentation
source_receipt: 221-223
target_path: GitHub draft PR branch docs/earth-mesh/
branch: earth-mesh-receipt-220-deploy-v2
pull_request: 89
unit_class: review_branch_documentation
qa_state: documentation files committed
boundary_state: review branch only; not merged; not production
rollback_note: close PR or remove branch if not wanted
router_type: github_review_branch_router
receipter_type: draft_pr_receipter + review_unit_receipter
current_claim: review-branch docs committed and draft PR open
```

## Grimteam Operating Loop

```text
1. Intake artifact or change.
2. Name review unit.
3. Check target path and approval state.
4. Check boundary state.
5. Route QA notes.
6. Detect blockers.
7. Prepare rollback note.
8. Commit or hold.
9. Receipt the result.
10. Keep claims below confirmed state.
```

## Grimteam Roles

| Role | Function |
|---|---|
| Boundary Watch | prevents overclaim and unsafe wording |
| QA Clerk | checks file/path/structure state |
| Review Unit Clerk | names the unit and fields |
| Receipter | records what happened and what did not |
| Rollback Keeper | records close/revert/delete path |
| Hold Guard | blocks claims without target, approval, confirmation, and receipt |

## Safe Claim
Receipt 223 deepens ACI and Grimteam coordination documentation in the GitHub review branch.

## Blocked Claim
Receipt 223 does not confirm merge to main, production release, runtime execution, model release, official archive, app sync, publication release, or external delivery.
