# Gmail Dual-Account Bridge P2

This local companion cross-connects two Gmail accounts by giving each account its own Google OAuth grant. It does not spoof a `From` header and it does not change ChatGPT's built-in Gmail connector.

## Why this is the supported design

Google's Gmail API sends a message through `users.messages.send` under the authenticated user's token. Gmail also exposes the account's registered **Send mail as** entries through `users.settings.sendAs.list`. P2 therefore binds each role to a verified Google account and permits a custom `From` address only when Gmail reports it as the primary address or an accepted alias.

For personal Gmail accounts, P2 does not try to create aliases through a service account. Both accounts authorize independently.

## Requirements

- Windows, macOS, or Linux desktop
- Node.js 22+
- A Google Cloud project controlled by JP
- Gmail API enabled
- OAuth consent screen configured
- OAuth client type: **Desktop app**
- Both Gmail accounts added as test users while the OAuth app remains in testing

Do not commit the downloaded OAuth client JSON. Copy the client ID and client secret into local environment variables only.

## Local environment

```bash
export JP_GOOGLE_OAUTH_CLIENT_ID='...apps.googleusercontent.com'
export JP_GOOGLE_OAUTH_CLIENT_SECRET='...'
export JP_GMAIL_BRIDGE_VAULT_KEY="$(node tools/gmail-bridge/p2/gmail-dual-account.mjs key)"
export JP_GMAIL_ENTERPRISE_EMAIL='enterprise mailbox address'
export JP_GMAIL_OPERATIONS_EMAIL='operations mailbox address'
```

Keep the generated vault key in a password manager or OS secret store. Losing it makes the encrypted local refresh-token vault unreadable.

## Authorize both account roles

Each command opens Google's consent page in the local browser and listens only on `127.0.0.1` for the callback. JP completes sign-in, MFA, CAPTCHA/human verification, and consent personally.

```bash
node tools/gmail-bridge/p2/gmail-dual-account.mjs authorize \
  --role enterprise-facing \
  --expect-email "$JP_GMAIL_ENTERPRISE_EMAIL"

node tools/gmail-bridge/p2/gmail-dual-account.mjs authorize \
  --role connected-operations \
  --expect-email "$JP_GMAIL_OPERATIONS_EMAIL"
```

The bridge verifies the Google-returned email before encrypting the refresh token. If the wrong Google account is selected, nothing is stored.

## Inspect the stack

```bash
node tools/gmail-bridge/p2/gmail-dual-account.mjs accounts
node tools/gmail-bridge/p2/gmail-dual-account.mjs aliases --role enterprise-facing
node tools/gmail-bridge/p2/gmail-dual-account.mjs aliases --role connected-operations
```

## Review and send

Write the body to a local file so it does not enter shell history.

```bash
cat > /tmp/message.txt <<'BODY'
Reviewed message body.
BODY

node tools/gmail-bridge/p2/gmail-dual-account.mjs send \
  --role enterprise-facing \
  --to recipient@example.com \
  --subject 'Reviewed subject' \
  --body-file /tmp/message.txt \
  --idempotency-key 'mission-specific-unique-key' \
  --dry-run
```

After reviewing the dry-run hashes and selected authenticated account, perform the protected send exactly once:

```bash
node tools/gmail-bridge/p2/gmail-dual-account.mjs send \
  --role enterprise-facing \
  --to recipient@example.com \
  --subject 'Reviewed subject' \
  --body-file /tmp/message.txt \
  --idempotency-key 'mission-specific-unique-key' \
  --confirm-send SEND
```

A custom `--from` is allowed only when Gmail reports it as the account's primary address or an accepted Send mail as alias.

## Exactly-once boundary

P2 records a local intent before contacting Gmail and records Gmail's returned message ID after success. A confirmed idempotency key cannot send again. If the network fails after the request leaves the computer, the outcome is marked unknown and the key is locked; inspect Gmail Sent Mail before using a different key. This is an honest no-blind-retry boundary, not a claim of impossible distributed exactly-once delivery.

## Remove a local account slot

```bash
node tools/gmail-bridge/p2/gmail-dual-account.mjs revoke-local --role enterprise-facing
```

This deletes the local encrypted account slot only. Revoke Google-side access separately from the Google Account security page when needed.

## Files kept out of Git

- `.gmail-bridge/accounts.enc.json`
- `.gmail-bridge/receipts/send-attempts.jsonl`
- OAuth client JSON
- message body files
- screenshots or copied browser/session material

## Truth state

```text
P2 code                         READY
Two OAuth grants                NOT YET COMPLETED
Enterprise-facing direct send   NOT YET VERIFIED
Operations direct send          NOT YET VERIFIED
Built-in ChatGPT Gmail account  UNCHANGED
```
