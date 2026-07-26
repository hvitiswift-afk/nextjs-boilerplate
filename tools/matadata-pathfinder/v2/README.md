# MATADATA OpenAI Pathfinder V2.1

This directory stages the reviewed, non-confidential MATADATA Cybersecurity Grant Program submission runner for a future authorized attempt.

## Safety boundary

- Opening or updating the draft PR runs **offline preflight only**.
- A live form session requires an explicit execution gate.
- JP personally completes any CAPTCHA, identity, signature, human-verification, or applicant-acknowledgment step.
- The runner blocks direct remote taps on **Submit** and performs no more than one authorized submit click.
- A submission is recorded only after positive confirmation evidence.
- If one click occurs but confirmation is uncertain, the runner stops and will not click again.
- A confirmed-submission artifact prevents later runs from submitting the same application again.

## Acknowledgment control

V2.1 does not depend on OpenAI's visual checkbox loading correctly inside the remote screenshot. It extracts the current acknowledgment text from the official form and displays that text in a dedicated Pathfinder panel. JP must personally check the panel and press **Record my acknowledgment and continue**. The runner then checks and positively verifies the real underlying OpenAI control before submission. If the text changes, the screenshot revision is stale, or the underlying control cannot be verified, submission remains blocked.

## Integrity

Reviewed runner SHA-256:

```text
738ccace37392a064eb37bd1b360a292199cb1bad94b0a656e899f03d43ab13c
```

Application content SHA-256:

```text
6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340
```

The six `runner.b64.*` files concatenate into a base64-encoded deterministic gzip stream. The workflow reconstructs the reviewed runner, verifies its checksum, checks JavaScript syntax, and runs policy/proposal self-tests before any live browser can start.

## Normal use

Keep the PR title in staged form for review and preflight. Do not use the execution trigger unless JP has renewed the exact one-submit authorization and is available to complete the human-only steps.
