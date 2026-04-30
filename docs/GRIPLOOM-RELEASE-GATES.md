# GRIPLOOM Release Gates

Receipt: `receipt-griploom-release-gates-044`

GRIPLOOM Release Gates turn product rails, ID rails, screenplay rails, samples, checkers, and CI into a publishable safety boundary.

## Release equation

```txt
GRIPLOOM_RELEASE = docs + samples + scripts + package_commands + CI + BLACKLETTER
```

```txt
PUBLISH(object) = verify_format(object) + verify_source(object) + verify_claims(object) + verify_scan(object) + receipt(object)
```

## Required gates

| Gate | Command / evidence | Pass condition |
|---|---|---|
| Product rail docs | `docs/GRIPLOOM-HATS.md` | hats, mesh, beams, patch grammar, release gate present |
| ID barcoder docs | `docs/GRIPLOOM-ID-BARCODER.md` | ID format, barcode, QR, scanner, BLACKLETTER boundary present |
| Screenplay industry docs | `docs/GRIPLOOM-SCREENPLAY-INDUSTRY-ID.md` | screenplay, department, role, SAG-AFTRA/IATSE boundaries present |
| ID sample | `examples/griploom-id-barcoder.sample.json` | every item carries shape, barcode, QR, scanner, BLACKLETTER |
| Screenplay sample | `examples/griploom-screenplay-industry-id.sample.json` | every item carries work, department, role, object, scanner, boundary |
| ID checker | `npm run griploom:id:check` | receipt status is `passed` |
| Screenplay checker | `npm run griploom:screenplay:check` | receipt status is `passed` |
| Combined check | `npm run griploom:checks` | all GRIPLOOM checkers pass |
| CI check | `.github/workflows/griploom-checks.yml` | GitHub Actions runs combined check on relevant changes |

## Claim-safety gates

GRIPLOOM may publish internal production geometry and collaboration-signal records only when the claims stay within evidence.

Forbidden release claims:

```txt
official SAG-AFTRA credential
official IATSE credential
union membership verification
employment guarantee
hiring guarantee
payroll approval
legal clearance granted
studio authorization without source
authorship or ownership without source
private facts in public QR payloads
```

Allowed release claims:

```txt
internal GRIPLOOM ID
public product ID
scanner receipt ID
sample payload
source-authorized reference field
credit-based collaboration signal
BLACKLETTER-reviewed publication field
```

## Scanner publication rule

```txt
public QR = URL + public ID + batch/work receipt + no private facts
private QR = access-gated internal metadata + authorized source only
barcode  = human-readable ID + scanner route + idempotency key
```

## Release receipt shape

```json
{
  "id": "receipt-griploom-release-YYYYMMDD-NNN",
  "kind": "griploom-release-receipt",
  "status": "candidate",
  "checks": {
    "griploomIdCheck": "passed",
    "screenplayIndustryCheck": "passed",
    "ci": "passed"
  },
  "artifacts": [
    "docs/GRIPLOOM-HATS.md",
    "docs/GRIPLOOM-ID-BARCODER.md",
    "docs/GRIPLOOM-SCREENPLAY-INDUSTRY-ID.md",
    "examples/griploom-id-barcoder.sample.json",
    "examples/griploom-screenplay-industry-id.sample.json"
  ],
  "blackletter": {
    "status": "approved",
    "rule": "No false official, union, legal, employment, payroll, authorship, ownership, causation, or private-fact claims."
  }
}
```

## Operator checklist

```txt
1. Update docs.
2. Update sample payloads.
3. Run npm run griploom:checks.
4. Confirm CI passes.
5. Confirm public QR payloads contain no private facts.
6. Confirm SAG-AFTRA/IATSE fields are blank or source-authorized.
7. Print release receipt.
8. Publish only BLACKLETTER-approved claims.
```

## Receipt

```json
{
  "id": "receipt-griploom-release-gates-044",
  "kind": "griploom-release-gates-doc",
  "status": "active",
  "law": "A GRIPLOOM release is publishable only when docs, samples, scripts, CI, scanner payloads, source boundaries, and BLACKLETTER gates agree."
}
```
