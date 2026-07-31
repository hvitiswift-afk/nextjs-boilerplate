#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const requiredFiles = [
  "config/fardarter-pages-readiness.json",
  ".github/workflows/enable-fardarter-pages.yml",
  ".github/workflows/fardarter-pages.yml",
  ".github/workflows/fardarter-pages-readiness.yml",
  "scripts/build-fardarter-github-pages.mjs",
  "scripts/verify-fardarter-pages-publication.mjs",
  "fardarter-startup/index.html",
  "fardarter-startup/privacy.html",
  "fardarter-startup/projects.html",
  "fardarter-startup/styles.css"
];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(JSON.stringify({ status: "BLOCKED_MISSING_SOURCE", missing }, null, 2));
  process.exit(1);
}

const readiness = JSON.parse(fs.readFileSync(path.join(root, "config/fardarter-pages-readiness.json"), "utf8"));
const checks = {
  version: readiness.version === "2.0",
  authority: readiness.authority_control === "FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29",
  digest: readiness.authority_digest === "e729a5b31f853723918d63a0dfa759f34f0671fb67beb04cc994e1d5d617fde8",
  repository: readiness.repository === "hvitiswift-afk/nextjs-boilerplate",
  source: readiness.site_path === "fardarter-startup",
  output: readiness.build_output === "dist/fardarter-pages",
  expectedUrl: readiness.expected_live_url === "https://hvitiswift-afk.github.io/nextjs-boilerplate/",
  contact: readiness.contact_channel === "GITHUB_ISSUES",
  receiptIssue: readiness.receipt_issue === 102,
  publicOffer: readiness.public_offer_issue === 133,
  noLiveClaim: readiness.pages_live_claim === false
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error(JSON.stringify({ status: "BLOCKED_CONFIG_MISMATCH", failed }, null, 2));
  process.exit(1);
}

for (const file of ["index.html", "privacy.html", "projects.html"]) {
  const text = fs.readFileSync(path.join(root, "fardarter-startup", file), "utf8");
  if (/mailto:/i.test(text) || /fardarter\.systems/i.test(text)) {
    throw new Error(`unverified mailbox/domain remains in ${file}`);
  }
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "fardarter-pages-v629-"));
try {
  execFileSync(process.execPath, [
    "scripts/build-fardarter-github-pages.mjs",
    "--output", temp,
    "--source-commit", "READINESS_FIXTURE"
  ], { cwd: root, stdio: "inherit" });
  execFileSync(process.execPath, [
    "scripts/verify-fardarter-pages-publication.mjs",
    "--fixture-dir", temp,
    "--receipt-file", path.join(temp, "fixture-verification.json")
  ], { cwd: root, stdio: "inherit" });
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log(JSON.stringify({
  status: "SOURCE_READY_ADMIN_SECRET_OR_SUPPORTED_PAGES_ACTION_REQUIRED",
  repository: readiness.repository,
  buildOutput: readiness.build_output,
  contactChannel: readiness.contact_channel,
  expectedLiveUrl: readiness.expected_live_url,
  pagesLiveClaim: false,
  checkedFiles: requiredFiles.length
}, null, 2));
