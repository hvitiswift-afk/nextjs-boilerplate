#!/usr/bin/env node

import fs from 'node:fs';

const requiredFiles = [
  'config/fardarter-pages-readiness.json',
  'config/fardarter-github-app-manifest.example.json',
  'docs/FARDARTER-GITHUB-APP-PERMISSION-PACKET.md',
  'docs/FARDARTER-OAUTH-CONNECTOR-PACKET.md',
  '.github/workflows/enable-fardarter-pages.yml',
  '.github/workflows/fardarter-pages.yml',
  'fardarter-startup/index.html',
  'fardarter-startup/privacy.html'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error(JSON.stringify({ status: 'blocked', missing }, null, 2));
  process.exit(1);
}

const readiness = JSON.parse(fs.readFileSync('config/fardarter-pages-readiness.json', 'utf8'));
const checks = {
  repository: readiness.repository === 'hvitiswift-afk/nextjs-boilerplate',
  sitePath: readiness.site_path === 'fardarter-startup',
  hasAppRoute: readiness.routes?.includes('github_app'),
  hasOAuthRoute: readiness.routes?.includes('oauth'),
  hasExpectedUrl: readiness.expected_live_url === 'https://hvitiswift-afk.github.io/nextjs-boilerplate/',
  receiptIssue: readiness.receipt_issue === 102
};

const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error(JSON.stringify({ status: 'blocked', failed }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'ready_for_external_authorization',
  repository: readiness.repository,
  routes: readiness.routes,
  expectedLiveUrl: readiness.expected_live_url,
  receiptIssue: readiness.receipt_issue,
  checkedFiles: requiredFiles.length
}, null, 2));
