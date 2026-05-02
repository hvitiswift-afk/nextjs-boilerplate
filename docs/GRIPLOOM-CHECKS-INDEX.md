# GRIPLOOM Checks Index

This index names every explicit local verification rail currently wired through package scripts.

## Full rail

```bash
npm run griploom:verify
```

Verifier chain:

```txt
griploom:verify
  -> griploom:checks
  -> build
```

## Aggregate checks

```bash
npm run griploom:checks
```

Current aggregate order:

```txt
security:secrets:check
GRIPLOOM ID/barcode/QR sample check
screenplay industry ID sample check
ML score sample check
SAME-TICK sample check
launch receipt sample check
launch receipt printer output check
science source rail sample check
checks index consistency check
```

## Explicit commands

```bash
npm run security:secrets:check
npm run griploom:id:check
npm run griploom:screenplay:check
npm run griploom:ml:check
npm run griploom:tick:check
npm run griploom:launch:check
npm run griploom:launch:print
npm run griploom:launch:print:check
npm run griploom:science:check
npm run griploom:checks:index
npm run griploom:checks
npm run griploom:verify
```

## Files checked

```txt
examples/griploom-id-barcoder.sample.json
examples/griploom-screenplay-industry-id.sample.json
examples/griploom-ml-score.sample.json
examples/griploom-tick.sample.json
examples/griploom-launch.receipt.sample.json
examples/griploom-science-source-rail.sample.json
```

## Check scripts

```txt
scripts/check-secret-boundaries.mjs
scripts/check-griploom-id-barcoder-sample.mjs
scripts/check-griploom-screenplay-industry-id-sample.mjs
scripts/check-griploom-ml-score-sample.mjs
scripts/check-griploom-tick-sample.mjs
scripts/check-griploom-launch-receipt-sample.mjs
scripts/check-griploom-launch-printer.mjs
scripts/check-griploom-science-source-rail-sample.mjs
scripts/check-griploom-checks-index.mjs
scripts/verify-griploom-build.mjs
```

## Rule

```txt
Every rail gets a command. Every command gets a receipt. Every receipt stays keyless.
```
