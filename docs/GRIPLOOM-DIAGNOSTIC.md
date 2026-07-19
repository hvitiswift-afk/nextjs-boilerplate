# GRIPLOOM Diagnostic

Exit code: 1

```text

> nextjs@0.1.0 griploom:verify
> node scripts/verify-griploom-build.mjs


=== GRIPLOOM sample checks ===

> nextjs@0.1.0 griploom:checks
> npm run security:secrets:check && npm run griploom:id:check && npm run griploom:screenplay:check && npm run griploom:ml:check && npm run griploom:tick:check && npm run griploom:launch:check && npm run griploom:launch:print:check && npm run griploom:science:check && npm run f-wad:check && npm run griploom:checks:index


> nextjs@0.1.0 security:secrets:check
> node scripts/check-secret-boundaries.mjs

file:///home/runner/work/nextjs-boilerplate/nextjs-boilerplate/scripts/check-secret-boundaries.mjs:13
    throw new Error(message);
          ^

Error: secret boundary violations found:
scripts/mint-github-app-installation-token.mjs: hardcoded Vercel bearer token
    at assert (file:///home/runner/work/nextjs-boilerplate/nextjs-boilerplate/scripts/check-secret-boundaries.mjs:13:11)
    at file:///home/runner/work/nextjs-boilerplate/nextjs-boilerplate/scripts/check-secret-boundaries.mjs:74:1
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)

Node.js v22.23.1

{
  "id": "receipt-griploom-build-verify-001",
  "kind": "griploom-build-verify",
  "status": "failed",
  "startedAt": "2026-07-19T21:11:26.443Z",
  "finishedAt": "2026-07-19T21:11:26.707Z",
  "steps": [
    {
      "name": "GRIPLOOM sample checks",
      "code": 1
    }
  ],
  "law": "GRIPLOOM is launch-ready only when sample receipts pass and the Next.js build completes."
}
```
