# Rollback Map

## Purpose

This file defines a GitHub-native rollback record for JP / Hviti deployment-readiness work.

## Rollback levels

| Level | Meaning | Example action |
| --- | --- | --- |
| R0 | No release exists | keep work in PR or docs |
| R1 | Documentation change | revert documentation commit |
| R2 | Workflow change | revert workflow commit |
| R3 | Static artifact | redeploy previous artifact if available |
| R4 | Pages release | restore previous Pages deployment or revert source |
| R5 | Tagged release | create new corrective tag or revert to prior tag |

## Required rollback fields

- affected repo
- affected branch or tag
- release or deploy identifier if one exists
- prior known-good commit or artifact
- rollback action
- confirmation receipt

## Current state

No production deployment is recorded by this file. This is a rollback planning document only.
