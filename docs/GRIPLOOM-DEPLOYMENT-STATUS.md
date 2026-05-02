# GRIPLOOM Deployment Status

This receipt separates code verification from hosting-account gates.

## Source verification rail

```txt
GitHub repository: hvitiswift-afk/nextjs-boilerplate
Primary branch: main
Verifier command: npm run griploom:verify
Workflow: .github/workflows/griploom-verify.yml
```

Meaning:

```txt
Source verification is the code rail.
It verifies receipt checks and the Next.js build.
```

## Netlify deploy rail

```txt
Primary deploy rail: Netlify
Site name: lichburn-v0-2-8
Site id: 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f
Primary URL: http://lichburn-v0-2-8.netlify.app
```

Meaning:

```txt
Netlify remains the main GRIPLOOM deployment target while Vercel is account-blocked.
```

## Vercel status rail

```txt
Vercel status: account/billing gate
Blocker note: docs/VERCEL-BILLING-BLOCKER.md
```

Meaning:

```txt
Vercel failures that point to account-blocked or billing-blocked pages should not be classified as code failures.
```

## Operator rule

```txt
Verify code on the source rail.
Deploy on the active hosting rail.
Treat billing/account gates as account gates until cleared.
```

## Release language

```txt
Code rail: verify.
Deploy rail: Netlify.
Billing gate: Vercel.
```
