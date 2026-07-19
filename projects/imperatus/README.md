# Imperatus: Safety-Gated External Actions for ChatGPT

Imperatus is a simulated MCP reference app for consequential external actions. It separates preparation, exact preview, one-time authorization, simulated execution, cancellation, and evidence receipts.

## Safety boundary

- Simulated transport only.
- No SMS provider or carrier is contacted.
- No live SMS is sent.
- No Android or Galaxy A15 pairing is claimed.
- Provider acceptance is never represented as carrier delivery.
- Recipient aliases are used instead of real phone numbers.

## MCP tools

1. `sms_prepare`
2. `sms_preview`
3. `sms_authorize`
4. `sms_send_simulated`
5. `sms_status`
6. `sms_cancel`

## Review states

```text
PREPARED
→ PREVIEW_READY
→ AUTHORIZED_ONCE
→ SIMULATED_PROVIDER_ACCEPTED
```

Negative cases cover wrong-recipient substitution, stale or replayed authorization, duplicate execution, prompt injection, and unsupported delivery claims.

## Local development

```bash
cd projects/imperatus
npm install
netlify dev
```

The MCP endpoint is `/mcp`.

## Hosted candidate

`https://jp-fire-system.netlify.app`

Hosted reachability and protocol behavior must be independently verified before any app-directory or challenge submission. This repository does not claim OpenAI approval, app publication, provider connection, carrier delivery, or live SMS.

## OpenAI references

- Product proposal reference: OpenAI Support Case `11764100`
- MATADATA non-confidential architecture: Case `11764089`
- Compensated-contribution policy proposal: Case `11759893`

These case numbers document correspondence only. They do not indicate acceptance, partnership, compensation, patent status, or deployment approval.
