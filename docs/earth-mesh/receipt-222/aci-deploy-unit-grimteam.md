# EARTH-ACI-DEPLOY-UNIT-GRIMTEAM-222

## State
Internal deployment-control documentation only.

## ACI meaning in this package
ACI is treated as an **Artifact Control Interface**: a safe control layer for recognizing, packaging, staging, reviewing, and receipting deployable units.

This file does **not** create or run Azure Container Instances, cloud infrastructure, CI/CD automation, production deployment, containers, services, jobs, schedulers, or external systems.

## Deploy Unit
A deploy unit is a bounded packet of change:

- artifact name
- source receipt
- target environment
- approval state
- boundary state
- rollback note
- QA state
- deployer type
- receipter type
- current claim

Current deploy unit state:

```text
allowed_in_principle
review_branch_only
not_merged
not_production_deployed
```

## Grimteam role
Grimteam is the internal coordination layer for:

- boundary review
- blocker detection
- QA routing
- deploy-unit preparation
- receipt writing
- rollback checklist preparation
- external-action hold enforcement

## Deployment lanes

| Lane | Current state |
|---|---|
| GitHub draft PR docs | confirmed |
| Merge to main | not performed |
| Production deploy | not performed |
| Cloud deploy | not performed |
| Container deploy | not performed |
| ML deploy | not performed |
| Obsidian sync | not performed |
| External delivery | not performed |

## Safe claim
Receipt 222 adds ACI deploy-unit and Grimteam coordination documentation to the GitHub review branch.

## Blocked claim
Receipt 222 does not confirm production deployment, infrastructure deployment, cloud runtime execution, ML deployment, external publication, official archive, or Obsidian sync.
