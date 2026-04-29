# GRIPLOOM Breach Response Plan

This plan covers security incidents involving GRIPLOOM client data, source notes, API keys, report files, SAME-TICK events, or production geometry records.

## Incident Goals

1. Detect quickly.
2. Contain damage.
3. Preserve evidence.
4. Rotate secrets.
5. Notify affected parties when required.
6. Patch the cause.
7. Document the postmortem.

## Severity Levels

### Low

- Failed login attempts.
- Non-sensitive error logs exposed internally.
- No client data exposed.

### Medium

- Accidental exposure of draft report data.
- API key suspected but not confirmed compromised.
- Misconfigured storage bucket discovered quickly.

### High

- Confirmed exposure of client data.
- Confirmed API key or database credential compromise.
- Unauthorized modification or deletion of production records.

## Response Steps

### 1. Detect

Record:

- Time discovered.
- System affected.
- Reporter.
- Initial evidence.

### 2. Contain

Actions may include:

- Disable affected API keys.
- Revoke sessions.
- Restrict storage access.
- Pause public endpoints.
- Disable affected automation.

### 3. Preserve Logs

Preserve relevant logs before cleanup:

- API logs.
- Auth logs.
- Storage access logs.
- Database audit logs.
- GitHub commit or deployment history.

### 4. Rotate Secrets

Rotate:

- API keys.
- Database credentials.
- Email credentials.
- AWS IAM keys.
- Webhook secrets.

### 5. Notify

If affected client data was exposed, notify affected clients with:

- What happened.
- What data may have been involved.
- What actions were taken.
- What clients should do, if anything.

### 6. Patch

Fix the root cause:

- Access control.
- Input validation.
- Storage policy.
- Dependency update.
- Secrets management.

### 7. Postmortem

Document:

- Timeline.
- Root cause.
- Data affected.
- What worked.
- What failed.
- Preventive action.

## Minimum Security Rules

- Do not commit secrets.
- Use environment variables or secret managers.
- Keep public reports separate from private source notes.
- Store only data needed for GRIPLOOM outputs.
- Restrict admin access.
- Log publication decisions from BLACKLETTER.

## Product Rule

If an incident affects trust, pause publication until BLACKLETTER and security review clear the affected outputs.
