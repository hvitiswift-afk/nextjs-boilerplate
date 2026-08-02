#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const codeowners = await readFile('.github/CODEOWNERS', 'utf8');
const required = [
  '/apps/armitron-mcp/ @hvitiswift-afk',
  '/apps/armitron-a2a/ @hvitiswift-afk',
  '/tools/armitron/ @hvitiswift-afk',
  '/tools/browser-bridge/ @hvitiswift-afk',
  '/tools/gmail-bridge/ @hvitiswift-afk',
  '/examples/armitron/ @hvitiswift-afk',
  '/examples/google-cloud/ @hvitiswift-afk',
  '/enterprise/ @hvitiswift-afk',
  '/.github/workflows/ @hvitiswift-afk'
];

for (const entry of required) assert.ok(codeowners.includes(entry), `Missing CODEOWNERS entry: ${entry}`);
assert.match(codeowners, /does not itself authorize merge, deployment, publication/i);
assert.match(codeowners, /organization teams only after GitHub provider/i);

console.log(JSON.stringify({
  schemaVersion: 'armitron.enterprise-codeowners.verification.v25',
  status: 'PASS',
  owner: '@hvitiswift-afk',
  organizationTeamOwners: 'PENDING_GITHUB_PROVIDER_READBACK',
  requiredPaths: required.length
}, null, 2));
