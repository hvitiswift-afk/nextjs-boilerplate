# Service Bridge Diagnostic

Exit code: 1

```text

> nextjs@0.1.0 service-bridge:verify
> npm run service-bridge:check:all && npm run build


> nextjs@0.1.0 service-bridge:check:all
> npm run service-bridge:check && npm run service-bridge:check:runtime && npm run service-bridge:check:ci


> nextjs@0.1.0 service-bridge:check
> node scripts/check-service-bridge-contract.mjs

SERVICE BRIDGE CONTRACT: PASS
Verified 30 required architecture files.
Core orchestration and recovery pipelines: present.
Polystructure identity, integrity, and release pipelines: present.
Manifest/OpenAPI contract: version 19 catalog-aligned.
Automatic deployment and external action: disallowed.

> nextjs@0.1.0 service-bridge:check:runtime
> node scripts/check-service-bridge-runtime-contract.mjs

SERVICE BRIDGE RUNTIME CONTRACT: PASS
Version surfaces aligned through catalog version 19.
Catalog endpoint surfaces checked: 51.
Scheduler and Netlify OAuth planning and callback routes: present.
Projection mutation permission: explicit local only.
Automatic deployment and public deployment claims: disallowed.
Polystructure identity, bundle, Merkle, and release routes: present.
External action remains uncompleted by contract surfaces.

> nextjs@0.1.0 service-bridge:check:ci
> node scripts/check-service-bridge-ci-contract.mjs

SERVICE BRIDGE CI CONTRACT: FAIL
- Runtime metadata contract must be version 19 aligned.
```
