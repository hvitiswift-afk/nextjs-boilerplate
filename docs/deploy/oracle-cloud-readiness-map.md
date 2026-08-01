# Oracle Cloud Readiness Map

## Purpose

This file records a planning path for using Oracle Cloud services with the GitHub workbench. It does not create an Oracle account, database, cloud service, secret, billing resource, or production connection.

## Current planning position

Oracle Cloud can be evaluated as a real database and cloud-services target for JP / Hviti work, but only after account, region, cost, limits, data, security, and ownership choices are reviewed by JP.

## Candidate Oracle services to review

- Autonomous Transaction Processing
- Autonomous Data Warehouse
- Autonomous JSON Database
- APEX Application Development
- Object Storage
- Logging
- Monitoring
- Vault
- Resource Manager / Terraform

## JP / Hviti naming pattern

Possible safe project names:

- JP-Hviti-Oracle-Workbench
- Hviti-Earth-Mesh-Oracle-Lab
- JP-Nethercron-Oracle-Readiness
- Hviti-Grimteam-Cloud-Map
- JP-Oracle-Receipt-Rail

Names should identify JP / Hviti work without implying Oracle endorsement or ownership of Oracle services.

## GitHub integration idea

The repository can hold:

- architecture notes
- schema drafts
- environment variable names without secret values
- connection checklist
- cost and limit checklist
- rollback notes
- receipt records
- issue templates for cloud requests

## Boundaries

This file does not create or configure:

- Oracle Cloud account
- billing method
- database
- cloud network
- secret
- API key
- production connection
- Terraform apply
- deployment

## Free-tier caution

Any free-tier or always-free service must be checked against current provider terms, limits, eligibility, capacity, and account status before use. This repository should not promise no-cost service forever.
