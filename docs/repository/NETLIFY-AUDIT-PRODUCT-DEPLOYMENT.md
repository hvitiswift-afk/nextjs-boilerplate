# Transitional Netlify record — nonpreferred historical readback

## Current authority

```text
Classification        NETLIFY_TRANSITIONAL_HISTORICAL_READBACK
Preferred             false
Source authority      false
Primary platform      GITHUB_PRIMARY_INTENDED
Publication target    GITHUB_PAGES_PUBLICATION_PENDING_VERIFICATION
Provider mutation     not authorized
```

The verified Netlify deployment remains valid historical evidence. It is not the intended platform, preferred publication target, or current source authority.

```text
Site             lichburn-v0-2-8
Site ID          21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f
Deployed source  88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334
Deploy ID        6a6ba0366ebec6650d843ac3
State            DEPLOYED_AND_VERIFIED
Relationship     CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE
```

This record is preserved until GitHub Pages publication is independently enabled, run, and read back. Preservation does not authorize a Netlify deploy, redeploy, rollback, site mutation, domain change, billing change, credential change, or access-control change.

## Current migration rule

```text
GitHub source and Actions first.
GitHub Artifacts/Releases/Packages for distribution.
GitHub Pages for static public publication.
Netlify only as historical readback unless a new explicit exception is authorized.
```

GitHub Pages cannot execute the Next.js server/API routes described in the older deployment lane. Those routes remain source/test evidence unless converted to static/client-side operation or separately authorized under an explicit provider exception.

---

# Historical Netlify Fardarter Drive™ Product Deployment Lane

**Target site:** `lichburn-v0-2-8`  
**Site ID:** `21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f`  
**Primary URL at the time:** `https://lichburn-v0-2-8.netlify.app`  
**Controlling recovery issue:** `#136`  
**Rollout issue:** `#143`  
**Historical authority receipt:** `receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V4.json`  
**Historical scale record:** `receipts/revenue/FARDARTER-DRIVE-V4.json`

## Historical purpose

This lane deployed a merged GitHub Control Tower Audit and Fardarter Drive™ authority surface, then required immutable provider readback before claiming the public route was live.

A successful repository build was not a deployment receipt. Completion required a deploy ID, immutable deploy URL, route readback, and machine-readable `DEPLOYED_AND_VERIFIED` evidence.

## Historical trigger model

- Pull request: validation only.
- Push to `main`: validation and controlled production deploy.
- Manual dispatch: the same controlled deployment path.
- No new-site creation.

## Historical validations

```text
npm ci
npm run revenue:verify
npm run build
```

## Historical route readback

The deployment verified the public application and API surfaces that existed for the deployed source, including the GitHub Control Tower Audit product route, revenue-pilot API, sitemap, robots file, capacity and money boundaries, and the explicit distinction between public signals and orders, payment, contract, or work-start evidence.

## Historical claims boundary

The deployment receipt did not prove:

- that aspirational revenue horizons were achieved;
- legal enforceability or absence of liability;
- payment settlement without external provider evidence;
- consent, contract acceptance, or work start;
- that a later repository commit was deployed.

## Historical exclusions

No new-site creation, domain change, billing change, credential change, payment execution, autonomous customer targeting, contract acceptance, delivery start, refund/dispute response, bank or payout change, database setup, form enablement, or access-control change was authorized by the historical lane.

## Present interpretation

```text
Verified historical provider evidence  yes
Preferred current platform             no
Current source authority               no
Current publication target             GitHub Pages, pending verification
```
