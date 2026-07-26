# MATADATA OpenAI Pathfinder V2

This directory stages the reviewed, non-confidential MATADATA Cybersecurity Grant Program submission runner for a future authorized attempt.

## Safety boundary

- Opening or updating the draft PR runs **offline preflight only**.
- A live form session requires an explicit execution gate.
- JP personally completes any CAPTCHA, identity, signature, human-verification, or applicant-acknowledgment step.
- The runner blocks direct remote taps on **Submit** and performs no more than one authorized submit click.
- A submission is recorded only after positive confirmation evidence.
- If one click occurs but confirmation is uncertain, the runner stops and will not click again.
- A confirmed-submission artifact prevents later runs from submitting the same application again.

## Integrity

Reviewed runner SHA-256:

```text
f2839e50dbf2e7c2dad64a6e227555c4b9f5c9b29ff45e073a92026e4a561811
```

Application content SHA-256:

```text
6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340
```

The five `runner.b64.*` files concatenate into a base64-encoded gzip stream. The workflow reconstructs the reviewed runner, verifies its checksum, checks JavaScript syntax, and runs policy/proposal self-tests before any live browser can start.

## Normal use

Keep the PR title in staged form for review and preflight. Do not use the execution trigger unless JP has renewed the exact one-submit authorization and is available to complete the human-only steps.
