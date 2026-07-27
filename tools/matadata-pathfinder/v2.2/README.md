# MATADATA OpenAI Pathfinder V2.2

This directory stages a hardened, human-gated runner for the non-confidential MATADATA Cybersecurity Grant Program application. It is designed for one authorized submission attempt while preserving JP's personal responsibility for CAPTCHA, identity, signature, human verification, and applicant acknowledgment.

## What V2.2 fixes

V2.1 stopped safely after eight fields. OpenAI's form rerendered and removed a temporary `data-pathfinder-id` attribute before the Project title field could be filled. V2.2 does not use injected element IDs to locate application fields.

V2.2 also corrects the field contract: OpenAI's current form has one Project title input with the helper text “One descriptive sentence.” It is one field, not two. The runner now maps 13 unique application fields rather than attempting to map the same control twice.

The captured form presents the applicant acknowledgment as official terms text below Submit; it does not expose a separate checkbox in the captured DOM. V2.2 therefore supports two verified modes:

- `interactive-control` — JP personally affirms the displayed text, then Pathfinder checks and verifies the real OpenAI acknowledgment control.
- `official-terms-text-only` — JP personally affirms the displayed official terms text, Pathfinder verifies that the text is stable and that no separate acknowledgment control exists, and submission remains gated by that personal affirmation.

## Stable field contract

Every field is resolved afresh for every attempt, using the current control's stable `name` attribute first. A locator is never retained across later fields. After each entry, the runner waits for DOM activity to settle, resolves the field again, and verifies the complete value. It performs a final full-form value pass before acknowledgment and another final pass before Submit.

The offline dynamic-form regression test deliberately replaces the entire form after the eighth field. The remaining fields, including Project title, must still fill and verify successfully.

## Connection resilience

A live run starts two independent Cloudflare quick tunnels and publishes a primary and fallback session URL. The browser interface authenticates with a secure cookie after its token is removed from the address bar, so a normal page refresh can reconnect without the cleaned URL losing authentication.

## Submission boundary

- Pull-request updates run offline preflight and the local rerender regression only.
- A live run requires an explicit one-submit execution gate.
- Direct remote taps on OpenAI's Submit button are blocked.
- The runner may click Submit no more than once.
- A confirmed-submission artifact blocks later duplicate runs.
- If one click occurs but confirmation is uncertain, the runner records that uncertainty and never clicks again.
- A run records `SUBMITTED` only after positive confirmation evidence.

## Integrity values

Runner SHA-256:

```text
01bfd573d085b481e501d2077ec5858d5c6b112fbc34c6194d73916e34f407ab
```

Application-content SHA-256:

```text
fda0c9e4f432b330fda80a08f7ee423da16672b1f06afba84e5cb8795d63fb03
```

The binary `runner.cjs.gz` file is a deterministic gzip archive. The workflow verifies the archive, reconstructs the reviewed source, verifies its SHA-256 and JavaScript syntax, runs static policy/proposal self-tests, and then runs the local browser regression before any live browser can start.
