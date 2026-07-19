# Root Build Diagnostic

Exit code: 1

```text

   Creating an optimized production build ...
 ✓ Finished writing to disk in 63ms
 ✓ Compiled successfully in 5.6s
   Linting and checking validity of types ...
Failed to compile.

./src/app/api/ml/score/route.ts:2:22
Type error: Cannot find module '@/lib/griploom/types' or its corresponding type declarations.

[0m [90m 1 |[39m [36mimport[39m { [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
[31m[1m>[22m[39m[90m 2 |[39m [36mimport[39m { [33mBeam[39m } [36mfrom[39m [32m"@/lib/griploom/types"[39m[33m;[39m
 [90m   |[39m                      [31m[1m^[22m[39m
 [90m 3 |[39m [36mimport[39m { scoreBeam } [36mfrom[39m [32m"@/lib/ml/griploom-ml"[39m[33m;[39m
 [90m 4 |[39m [36mimport[39m { goblinCheckBeam } [36mfrom[39m [32m"@/lib/ml/goblin-ml"[39m[33m;[39m
 [90m 5 |[39m [36mimport[39m { blackletterGate } [36mfrom[39m [32m"@/lib/blackletter/gate"[39m[33m;[39m[0m
Next.js build worker exited with code: 1 and signal: null
```
