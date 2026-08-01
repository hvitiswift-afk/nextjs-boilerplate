# Oracle Nether Cloud Composer

## Purpose

This file connects Oracle cloud planning to the Nether piecewise composer for JP / Hviti work.

## Composer stations

| Station | Role |
| --- | --- |
| ORCL-PLAN | identifies the cloud or database target |
| ORCL-DB | database placeholder and schema path |
| ORCL-FREE | free-tier and limit review station |
| ORCL-COST | cost and usage boundary station |
| ORCL-SEC | security and secret boundary station |
| ORCL-GH | GitHub integration station |
| ORCL-RCPT | Oracle planning receipt station |

## Nether route

1. Netherrack anchors the Oracle object.
2. Netherradio routes the cloud request.
3. NetherACK records whether the request is planning, staged, connected, or confirmed.
4. Nethercron schedules the next safe step.
5. Oracle forecasts the next safe step from visible records.
6. Grimteam checks account, cost, secret, and production boundaries.
7. Oni Sentinel corrects any overclaim.
8. RCPT writes the truth state.

## Real-service boundary

A real Oracle database requires an Oracle account, region, service choice, account terms review, cost boundary, secure secret handling, and a confirmed creation result outside the public repository.

## Current state

Oracle cloud composer is documented. No real Oracle resource has been created by this file.
