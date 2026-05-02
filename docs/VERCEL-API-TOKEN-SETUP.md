# Vercel API Token Setup

This repository must never store a Vercel API token in source control.

```txt
Generate token in Vercel → store as secret → use from environment → never commit token.
```

## Generate the token

Create the token from the Vercel dashboard, not from this repo.

```txt
Vercel Personal Account → Settings → Account Tokens → Create
```

Recommended name:

```txt
GRIPLOOM_DEPLOY_TOKEN
```

Recommended scope:

```txt
Limit to the team/project scope needed for this repo when possible.
```

## Local environment

Create a local `.env.local` file only on your machine:

```bash
VERCEL_TOKEN="paste-token-here"
```

Do not commit `.env.local`.

## GitHub Actions secret

If CI needs the token, store it as a GitHub Actions secret:

```txt
Repository Settings → Secrets and variables → Actions → New repository secret
```

Secret name:

```txt
VERCEL_TOKEN
```

## CLI use

Use the token through the environment:

```bash
VERCEL_TOKEN="paste-token-here" vercel whoami --token "$VERCEL_TOKEN"
```

Deploy example:

```bash
vercel deploy --token "$VERCEL_TOKEN"
```

Production deploy example:

```bash
vercel deploy --prod --token "$VERCEL_TOKEN"
```

## JavaScript use

Use the token only from `process.env`:

```js
const token = process.env.VERCEL_TOKEN;

if (!token) {
  throw new Error("VERCEL_TOKEN is required");
}

const response = await fetch("https://api.vercel.com/v2/user", {
  headers: {
    authorization: `Bearer ${token}`
  }
});
```

## GRIPLOOM safety rule

```txt
A token is a key, not a receipt. Receipts can be committed. Keys cannot.
```

## Rotation rule

Rotate the token if it is pasted into chat, committed to git, shared in a screenshot, or exposed in logs.

## Do not commit

Never commit:

```txt
VERCEL_TOKEN=
.env
.env.local
.env.production
.vercel/auth.json
```
