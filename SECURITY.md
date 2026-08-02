# Security Policy

## Supported code

Security fixes are evaluated against the current `main` branch and the latest maintained release, when releases exist. Historical branches, archived experiments, generated artifacts, and retired provider configurations are not presumed supported unless a security notice says otherwise.

## Report a vulnerability privately

Do not open a public issue for suspected vulnerabilities, exposed credentials, authentication material, private keys, personal information, confidential invention details, or instructions that could enable abuse.

Use GitHub's private security-advisory flow:

https://github.com/hvitiswift-afk/nextjs-boilerplate/security/advisories/new

Include only the information needed to reproduce and assess the problem:

- affected path, component, commit, release, or URL;
- impact and realistic attack conditions;
- minimal reproduction steps or proof of concept;
- suggested mitigation, when known;
- whether any secret or personal data may already have been exposed.

Do not include live credentials. Revoke or rotate a suspected credential through its provider before sharing a redacted report.

## Handling and disclosure

The repository owner, `@hvitiswift-afk`, controls triage, disclosure timing, fixes, releases, and public notices. Receipt of a report does not authorize testing against third-party systems, production services, user accounts, payment systems, or infrastructure outside the reporter's control.

A report may be closed, held, or redirected when it is not reproducible, is outside repository scope, relies on unsupported environments, or would require unsafe testing.

Coordinated disclosure should wait until a fix or mitigation is available and the repository owner has explicitly approved publication.

## Public/private boundary

Public repository material must not contain:

- passwords, tokens, keys, session cookies, or recovery codes;
- banking, payment, customer, employment, legal, medical, or identity records;
- private Drive references or private connector output;
- signatures, private receipts, authentication evidence, or confidential invention details;
- unredacted vulnerability reports or exploit material that creates unnecessary risk.

If sensitive content is committed, stop normal development, preserve the relevant evidence privately, revoke or rotate affected credentials, and remove the material from current and historical exposure using an appropriate incident-response process.

## Enterprise and organization scope

This policy applies to this repository before and after any authorized move into a GitHub organization or enterprise account. An enterprise account, organization membership, connector installation, or repository transfer must be verified separately; documentation alone does not establish that administrative state.
