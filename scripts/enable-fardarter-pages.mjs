#!/usr/bin/env node

const token = process.env.GH_ADMIN_TOKEN;
const repository = process.env.GITHUB_REPOSITORY || 'hvitiswift-afk/nextjs-boilerplate';

if (!token) {
  console.error('GH_ADMIN_TOKEN is required. Use a fine-grained token with repository Administration write permission.');
  process.exit(2);
}

const [owner, repo] = repository.split('/');
if (!owner || !repo) {
  console.error(`Invalid repository: ${repository}`);
  process.exit(2);
}

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

async function request(method, path, body) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { response, data };
}

const pagesPath = `/repos/${owner}/${repo}/pages`;
let current = await request('GET', pagesPath);

if (current.response.status === 404) {
  const created = await request('POST', pagesPath, { build_type: 'workflow' });
  if (!created.response.ok) {
    console.error('Failed to enable GitHub Pages:', created.response.status, created.data);
    process.exit(1);
  }
  console.log(JSON.stringify({ action: 'created', status: created.response.status, pages: created.data }, null, 2));
} else if (current.response.ok) {
  const updated = await request('PUT', pagesPath, { build_type: 'workflow' });
  if (!updated.response.ok) {
    console.error('Failed to set GitHub Pages build type:', updated.response.status, updated.data);
    process.exit(1);
  }
  const refreshed = await request('GET', pagesPath);
  console.log(JSON.stringify({ action: 'updated', status: updated.response.status, pages: refreshed.data }, null, 2));
} else {
  console.error('Failed to inspect GitHub Pages:', current.response.status, current.data);
  process.exit(1);
}
