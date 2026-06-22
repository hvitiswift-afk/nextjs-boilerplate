# GitHub Oracle Comments Nexus

Receipt: `TJP-V54562-GITHUB-ORACLE-COMMENTS-NEXUS`

This file defines the GitHub Oracle comments lane for Norstein Bekkler, Lichburn, and the AR/MMORPG bridge.

## Oracle role

The Oracle is a review and routing layer. It gathers comments, classifies them, prepares receipts, and routes them to JP, Blue Helper, DEAG THREE, Gato, NuOS, OniOS, Norstein Bekkler, Lichburn, and TeleSystemsByJP.

## Comment types

- JP command comments
- Blue Helper receipt comments
- Norstein Bekkler route comments
- Lichburn improvement comments
- AR/MMORPG feature comments
- deployment gate comments
- Gato PASS / HOLD / DENY / RETEST comments
- public-safe community comments

## GitHub relationship

GitHub is used as a source and comments rail inside the JP work system. The repository is a tool lane and record lane. JP remains the root human and final approval point for the project spine.

## Comment safety

Public GitHub comments should not contain secrets, private identity data, payment credentials, private location details, or sensitive personal data. Comments from other people must not be impersonated. Public comments are intake, not automatic truth.

## Netlify bridge

Netlify remains a hosting rail. GitHub source is the source-of-truth rail for this repository. Any Netlify deploy remains gated by supported tooling, exact target, and JP approval.

## Receipt rule

Every accepted comment should become one of:

```txt
PASS receipt
HOLD receipt
DENY receipt
RETEST receipt
REFERENCE receipt
```
