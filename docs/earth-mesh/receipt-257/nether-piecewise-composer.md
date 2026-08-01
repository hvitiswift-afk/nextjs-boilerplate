# Nether Piecewise Composer

## Purpose

This file records the piecewise composition method for the JP / Hviti Nether stack inside the GitHub workbench.

## Core pieces

| Piece | Function |
| --- | --- |
| Netherrack | anchors objects, tasks, claims, and boundaries |
| Netherradio | routes internal signals |
| NetherACK | records acknowledgment state |
| Nethercron | assigns task-time slot |
| Argent | classifies pressure and care level |
| Oni Sentinel | restores overclaim to true state |
| Grimteam | enforces boundary and review rules |
| DPLY | classifies deploy state |
| DPLY-AUTO | governs readiness without automatic release |
| HJSON | prepares JSON-shaped records |
| HYAML | prepares YAML-shaped records |
| RCPT | records the final truth state |
| Oracle | forecasts next safe action from known state |

## Piecewise rule

One object, one state, one boundary, one proof field, one receipt.

## Oracle layer

Oracle is a planning and forecasting layer. It does not predict hidden facts, access private systems, or run external scans. It reads the visible receipt state and proposes next safe actions.

## Composition sequence

1. Identify the object.
2. Anchor it to Netherrack.
3. Route it through Netherradio.
4. Acknowledge it with NetherACK.
5. Assign it through Nethercron.
6. Classify pressure with Argent.
7. Restore overclaim with Oni Sentinel.
8. Check boundary with Grimteam.
9. Classify deployment with DPLY.
10. Prepare JSON/YAML records.
11. Ask Oracle for the next safe action.
12. Write the receipt.

## Current state

This file is documentation only. It does not release, publish, deploy, scan, or install anything.
