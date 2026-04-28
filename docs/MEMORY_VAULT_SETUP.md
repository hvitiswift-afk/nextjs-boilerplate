# Memory Vault Setup

The Memory Vault can run in two modes:

```txt
Seed mode
- No DATABASE_URL required
- /api/memory returns seeded records
- persistentStorage: false
```

```txt
Stone mode
- DATABASE_URL is present
- npm run db:migrate prepares Postgres tables
- /api/memory reads and writes durable records
- persistentStorage: true
```

## Local Postgres quick start

1. Copy the environment template.

```bash
cp infra/env.example .env.local
```

2. Set `DATABASE_URL` in your local environment or deployment provider.

```bash
DATABASE_URL=postgres://goblin:goblin@localhost:5432/goblin
```

3. Run the migration.

```bash
npm run db:migrate
```

4. Start the app.

```bash
npm run dev
```

5. Check the vault.

```bash
curl http://localhost:3000/api/memory
```

6. Create a record.

```bash
curl -X POST http://localhost:3000/api/memory \
  -H "content-type: application/json" \
  -d '{
    "id": "memory-first-stone",
    "kind": "note",
    "title": "First durable vault record",
    "payload": { "message": "The Stone Vault is awake." },
    "tags": ["stone", "vault", "first-record"]
  }'
```

## Safety law

```txt
No secrets in source.
No hidden payments.
No silent deploys.
No irreversible action without approval.
Every important record can receive an Outpost return path.
```

## Current durable tables

```txt
memory_records
approval_records
progress_events
outpost_entries
receipt_records
```

## Outpost return path

Each Memory Vault record can carry:

```txt
/api/outpost/entry/{id}/return
```

This keeps the Enclave reversible:

```txt
Memory Vault
→ Stone Vault
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
