# Oracle Real Database Path

## Purpose

This file defines the safe path from GitHub planning to a real Oracle database connection for JP / Hviti work.

## Current state

Planning only. No Oracle database, cloud resource, secret, account, wallet, network, or production connection is created by this repository file.

## Real database phases

| Phase | Name | Meaning |
| --- | --- | --- |
| ORCL-0 | planning | docs and naming only |
| ORCL-1 | account-known | JP confirms Oracle account exists |
| ORCL-2 | region-known | JP confirms OCI region/home region |
| ORCL-3 | service-chosen | Autonomous Transaction Processing, Autonomous JSON Database, or another service chosen |
| ORCL-4 | cost-limit-reviewed | Always Free, trial, or paid boundary reviewed |
| ORCL-5 | database-created-outside-repo | database exists in Oracle Cloud Console |
| ORCL-6 | secrets-staged | secrets added to secure provider settings, not committed |
| ORCL-7 | app-config-ready | app uses environment variable names only |
| ORCL-8 | connection-tested | tool confirms connection test result |
| ORCL-9 | release-reviewed | release path and rollback recorded |
| ORCL-10 | production-approved | JP gives exact production approval |

## Candidate database choices

- Autonomous Transaction Processing
- Autonomous JSON Database
- Autonomous Data Warehouse
- Oracle Database Free / XE for local learning

## Environment variable names only

Never commit real values. Use placeholder names such as:

```text
ORACLE_DB_USER=
ORACLE_DB_PASSWORD=
ORACLE_DB_CONNECT_STRING=
ORACLE_WALLET_LOCATION=
ORACLE_SERVICE_NAME=
ORACLE_SCHEMA_NAME=
```

## GitHub role

GitHub can store docs, code, CI checks, templates, and placeholder config. GitHub should not store database passwords, private keys, wallet files, or personal billing information in the repository.

## JP / Hviti naming

Possible project labels:

- JP-Hviti-Oracle-Workbench
- Hviti-Earth-Mesh-DB
- JP-Nethercron-Data-Rail
- Hviti-Oracle-Receipt-Store

## Boundary

This path can lead to a real database later, but this file does not create one.
