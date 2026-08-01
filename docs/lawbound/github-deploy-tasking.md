# Lawbound GitHub Tasking Packet

This document adds a GitHub-first tasking rail for the Lawbound and HvitiOS workstream.

## Purpose

GitHub is the reviewable control surface for tasking, branch review, pull request review, receipts, and rollback planning before any separate release action is considered.

## Scope

This packet is documentation only. It prepares review material in a draft pull request.

## Primary Slot Rule

Lawbound tasking folds into the primary HvitiOS slot. It is not a competing slot.

## GitHub-First Flow

1. Create a dedicated branch from `main`.
2. Add documentation-only tasking material.
3. Open a draft pull request.
4. Review checks and receipt requirements.
5. Hold any merge or release action for separate JP approval.

## Current Repo Checks

The existing repository verification rail should remain primary unless JP approves a future change:

```bash
npm ci
npm run griploom:verify
npm run build
```

## Receipt

Branch: `hviti/lawbound-deploy-tasking-v160`

Target repo: `hvitiswift-afk/nextjs-boilerplate`

Packet type: documentation-only tasking

Status: prepared for draft PR review
