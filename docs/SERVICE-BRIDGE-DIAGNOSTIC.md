# Service Bridge Diagnostic

Exit code: 0

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

SERVICE BRIDGE CI CONTRACT: PASS
Contract rail: architecture + runtime metadata + CI structure, version 19.
Build rail: production Next.js build.
Smoke rail: unified fail-fast runner with 9 suites.
Polystructure rail: identity + bundle + Merkle + release verification.
Automatic deployment and external action: disallowed.

> nextjs@0.1.0 build
> next build --turbopack

   ▲ Next.js 15.5.2 (Turbopack)

   Creating an optimized production build ...
 ✓ Finished writing to disk in 51ms
 ✓ Compiled successfully in 6.1s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/112) ...
   Generating static pages (28/112) 
   Generating static pages (56/112) 
   Generating static pages (84/112) 
 ✓ Generating static pages (112/112)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                       Size  First Load JS
┌ ○ /                                                              0 B         113 kB
├ ○ /_not-found                                                    0 B         113 kB
├ ƒ /api/approval                                                  0 B            0 B
├ ƒ /api/approval/decision                                         0 B            0 B
├ ƒ /api/execute                                                   0 B            0 B
├ ƒ /api/fabian                                                    0 B            0 B
├ ƒ /api/goblin                                                    0 B            0 B
├ ƒ /api/health                                                    0 B            0 B
├ ƒ /api/ledger                                                    0 B            0 B
├ ƒ /api/llm/goblin-audit-report                                   0 B            0 B
├ ƒ /api/llm/goblin-control-deck                                   0 B            0 B
├ ƒ /api/llm/goblin-control-deck-health                            0 B            0 B
├ ƒ /api/llm/goblin-receipt-ledger                                 0 B            0 B
├ ƒ /api/llm/observer-constellations                               0 B            0 B
├ ƒ /api/llm/observer-parallax                                     0 B            0 B
├ ƒ /api/llm/observer-route                                        0 B            0 B
├ ƒ /api/memory                                                    0 B            0 B
├ ƒ /api/outpost/entry                                             0 B            0 B
├ ƒ /api/outpost/entry/[id]/return                                 0 B            0 B
├ ƒ /api/progress                                                  0 B            0 B
├ ƒ /api/provider                                                  0 B            0 B
├ ƒ /api/receipt                                                   0 B            0 B
├ ƒ /api/service-bridge/contracts                                  0 B            0 B
├ ƒ /api/service-bridge/deployment                                 0 B            0 B
├ ƒ /api/service-bridge/deployment/repair                          0 B            0 B
├ ƒ /api/service-bridge/events/append                              0 B            0 B
├ ƒ /api/service-bridge/events/persist                             0 B            0 B
├ ƒ /api/service-bridge/events/project                             0 B            0 B
├ ƒ /api/service-bridge/events/reconcile                           0 B            0 B
├ ƒ /api/service-bridge/events/resolve                             0 B            0 B
├ ƒ /api/service-bridge/events/rollback                            0 B            0 B
├ ƒ /api/service-bridge/events/verify                              0 B            0 B
├ ƒ /api/service-bridge/health                                     0 B            0 B
├ ƒ /api/service-bridge/language-code                              0 B            0 B
├ ƒ /api/service-bridge/lifecycle                                  0 B            0 B
├ ƒ /api/service-bridge/lifecycle/apply                            0 B            0 B
├ ƒ /api/service-bridge/lifecycle/project                          0 B            0 B
├ ƒ /api/service-bridge/manifest                                   0 B            0 B
├ ƒ /api/service-bridge/netlify/oauth                              0 B            0 B
├ ƒ /api/service-bridge/netlify/oauth/callback                     0 B            0 B
├ ƒ /api/service-bridge/openapi                                    0 B            0 B
├ ƒ /api/service-bridge/orchestrate                                0 B            0 B
├ ƒ /api/service-bridge/orchestrate-batch                          0 B            0 B
├ ƒ /api/service-bridge/plan                                       0 B            0 B
├ ƒ /api/service-bridge/policy/evaluate                            0 B            0 B
├ ƒ /api/service-bridge/polyglot                                   0 B            0 B
├ ƒ /api/service-bridge/polyglot/ar                                0 B            0 B
├ ƒ /api/service-bridge/polyglot/bioacoustics                      0 B            0 B
├ ƒ /api/service-bridge/polyglot/cognition                         0 B            0 B
├ ƒ /api/service-bridge/polyglot/fabric                            0 B            0 B
├ ƒ /api/service-bridge/polyglot/hypercube                         0 B            0 B
├ ƒ /api/service-bridge/polyglot/hypercube/route-plan              0 B            0 B
├ ƒ /api/service-bridge/polyglot/l4                                0 B            0 B
├ ƒ /api/service-bridge/polyglot/modem                             0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure                     0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/bundle              0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/bundle/verify       0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/concatenate         0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/id                  0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/id/apply            0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/id/chain            0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/id/verify           0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/merkle              0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/release             0 B            0 B
├ ƒ /api/service-bridge/polyglot/polystructure/release/verify      0 B            0 B
├ ƒ /api/service-bridge/polyglot/scanner                           0 B            0 B
├ ƒ /api/service-bridge/polyglot/scanner/session                   0 B            0 B
├ ƒ /api/service-bridge/polyglot/universe                          0 B            0 B
├ ƒ /api/service-bridge/queue                                      0 B            0 B
├ ƒ /api/service-bridge/receipt                                    0 B            0 B
├ ƒ /api/service-bridge/receipt/mission                            0 B            0 B
├ ƒ /api/service-bridge/receipt/verify                             0 B            0 B
├ ƒ /api/service-bridge/scheduler                                  0 B            0 B
├ ƒ /api/service-bridge/validate                                   0 B            0 B
├ ƒ /api/service-bridge/validate-batch                             0 B            0 B
├ ƒ /api/vault/health                                              0 B            0 B
├ ƒ /api/vault/ledger                                              0 B            0 B
├ ƒ /api/vault/manifest                                            0 B            0 B
├ ○ /cities                                                        0 B         113 kB
├ ○ /f-wad                                                         0 B         113 kB
├ ○ /goblin                                                        0 B         113 kB
├ ○ /goblin/audit                                                  0 B         113 kB
├ ○ /goblin/constellations                                         0 B         113 kB
├ ○ /goblin/health                                                 0 B         113 kB
├ ○ /goblin/observer-route                                         0 B         113 kB
├ ○ /goblin/parallax                                               0 B         113 kB
├ ○ /goblin/receipts                                               0 B         113 kB
├ ○ /grand-rapids-ar-map                                           0 B         113 kB
├ ○ /map-system                                                    0 B         113 kB
├ ○ /regional                                                      0 B         113 kB
├ ○ /service-bridge                                            3.91 kB         117 kB
├ ○ /service-bridge/control                                    2.63 kB         116 kB
├ ○ /service-bridge/deployment                                 2.16 kB         115 kB
├ ○ /service-bridge/events                                     2.64 kB         116 kB
├ ○ /service-bridge/lifecycle                                   2.3 kB         115 kB
├ ○ /service-bridge/lifecycle-apply                             2.2 kB         115 kB
├ ○ /service-bridge/lifecycle-project                          1.95 kB         115 kB
├ ○ /service-bridge/nexus                                      2.83 kB         116 kB
├ ○ /service-bridge/orchestrate                                2.29 kB         115 kB
├ ○ /service-bridge/orchestrate-batch                          1.94 kB         115 kB
├ ○ /service-bridge/persist                                     2.5 kB         115 kB
├ ○ /service-bridge/policy                                     2.02 kB         115 kB
├ ○ /service-bridge/projection                                 1.79 kB         115 kB
├ ○ /service-bridge/receipts                                   1.66 kB         115 kB
├ ○ /service-bridge/reconcile                                  2.19 kB         115 kB
├ ○ /service-bridge/resolve                                    2.24 kB         115 kB
├ ○ /service-bridge/rollback                                   2.15 kB         115 kB
├ ○ /service-bridge/status                                     2.71 kB         116 kB
├ ○ /vault                                                         0 B         113 kB
└ ○ /vault/operator-forms                                      2.08 kB         115 kB
+ First Load JS shared by all                                   124 kB
  ├ chunks/224331449d7c7e57.js                                 75.4 kB
  ├ chunks/569f8ca39997ccda.js                                 21.7 kB
  ├ chunks/6f598c896a36477d.css                                11.1 kB
  └ other shared chunks (total)                                15.9 kB


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

```
