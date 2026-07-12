#!/usr/bin/env node

import crypto from 'node:crypto';

const appId = process.env.GITHUB_APP_ID;
const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!appId || !installationId || !privateKey) {
  console.error('Required: GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY');
  process.exit(2);
}

const now = Math.floor(Date.now() / 1000);
const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId })).toString('base64url');
const unsigned = `${header}.${payload}`;
const signer = crypto.createSign('RSA-SHA256');
signer.update(unsigned);
signer.end();
const signature = signer.sign(privateKey).toString('base64url');
const jwt = `${unsigned}.${signature}`;

const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
  method: 'POST',
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${jwt}`,
    'X-GitHub-Api-Version': '2022-11-28'
  }
});

const data = await response.json();
if (!response.ok) {
  console.error('Failed to mint installation token:', response.status, data);
  process.exit(1);
}

console.log(JSON.stringify({
  token: data.token,
  expires_at: data.expires_at,
  permissions: data.permissions,
  repositories: data.repositories?.map((repo) => repo.full_name)
}, null, 2));
