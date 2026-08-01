# Lawbound Tasking Versions

- Packet ID: `lawbound-github-tasking-v2`
- Canonical version range: `V121-V380`
- Branch: `jp/lawbound-tasking-refresh-v2`
- Packet type: documentation-only

## V121-V160 — GitHub review spine

Dedicated branches, draft pull requests, visible diffs, verification, receipts, rollback, and separate JP approval form the control spine.

## V161-V240 — Lawbound integration

Lawbound tasking remains inside the primary HvitiOS continuity and does not create a competing approval lane.

## V241-V320 — Receipt discipline

Every consequential step records exact scope, current head, checks, blockers, rollback, and the next authorization gate.

## V321-V380 — Refresh and reconciliation

This revision is rebuilt from current `main`, uses exactly five files, removes the YAML mirror, adopts one canonical version range, and defines a non-self-referential Merkle scope over the four non-receipt documents.

## Readiness rule

The packet remains draft until current-head checks pass and JP separately authorizes readiness. Merge remains separately gated after readiness review.
