# EARTH-REVIEW-UNIT-RELEASE-LADDER-224

## State
Review-branch documentation only.

## Purpose
Receipt 224 deepens the ACI / Artifact Control Interface and Grimteam review-unit system into a clear ladder from internal docs to possible future release states.

## Release Ladder

| Level | Name | Meaning | Current state |
|---|---|---|---|
| L0 | Schema | Idea or registry exists in text | complete |
| L1 | Internal artifact | File or record created internally | complete for prior package artifacts |
| L2 | Review branch | GitHub branch contains review docs | complete |
| L3 | Draft PR | Pull request open for review | complete |
| L4 | Ready for review | Draft converted to ready state | not performed |
| L5 | Main merge | Changes merged to default branch | not performed |
| L6 | Site or app release | Public or production-facing release | not performed |
| L7 | External delivery | Sent to a named outside recipient | not performed |
| L8 | Official archive | Accepted by an official archive target | not performed |
| L9 | Certified claim | Source/legal/factual review completed for a scoped claim | not performed |

## Current Unit

```text
unit_id: RU-224-GITHUB-REVIEW-LADDER
repo: hvitiswift-afk/nextjs-boilerplate
branch: earth-mesh-receipt-220-deploy-v2
pull_request: 89
current_level: L3 draft PR
safe_claim: Receipt docs are committed to a GitHub draft PR branch.
blocked_claim: merged, released, externally delivered, officially archived, or certified.
```

## Advancement Rules

A level can advance only when the previous level is confirmed and the next level has:

- exact target
- approval state
- QA state
- boundary state
- rollback or close path
- receipt

## Rollback / Close Paths

| Current level | Safe reverse action |
|---|---|
| Draft PR | close PR |
| Review branch | delete branch if no longer wanted |
| Added file | revert or delete file on branch |
| Main merge | revert commit / open corrective PR |
| Public release | unpublish or supersede with correction, if platform supports it |

## Boundary
Receipt 224 does not merge, release, publish, certify, archive, sync, or deliver anything outside the review branch.
