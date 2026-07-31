#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const baseUrl = arg("--base-url");
const fixtureDir = arg("--fixture-dir");
const receiptFile = arg("--receipt-file", "fardarter-pages-publication-receipt.json");
const attempts = Number(arg("--attempts", "12"));
const delayMs = Number(arg("--delay-ms", "5000"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const required = {
  "index.html": "GitHub-primary human-controlled AI operations.",
  "projects.html": "Public project map",
  "privacy.html": "GitHub-first privacy boundary",
  "robots.txt": "Sitemap: https://hvitiswift-afk.github.io/nextjs-boilerplate/sitemap.xml"
};

async function readTarget(relative) {
  if (fixtureDir) return fs.readFileSync(path.join(fixtureDir, relative), "utf8");
  if (!baseUrl) throw new Error("--base-url or --fixture-dir is required");
  const url = new URL(relative === "index.html" ? "./" : relative, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  const response = await fetch(url, { redirect: "follow", cache: "no-store" });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function verifyOnce() {
  const checks = {};
  for (const [file, marker] of Object.entries(required)) {
    const text = await readTarget(file);
    checks[file] = text.includes(marker);
  }
  const statusText = await readTarget("status.json");
  const status = JSON.parse(statusText);
  checks["status.json"] =
    status.authorityControl === "FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29" &&
    status.authorityDigest === "e729a5b31f853723918d63a0dfa759f34f0671fb67beb04cc994e1d5d617fde8" &&
    status.sourceAuthority === "GITHUB_PRIMARY_INTENDED" &&
    status.contactChannel === "GITHUB_ISSUES" &&
    status.pagesLiveClaim === false;
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  if (failed.length) throw new Error(`content checks failed: ${failed.join(", ")}`);
  return { checks, status };
}

let result = null;
let lastError = null;
for (let attempt = 1; attempt <= Math.max(1, attempts); attempt += 1) {
  try {
    result = await verifyOnce();
    break;
  } catch (error) {
    lastError = error;
    if (attempt < attempts && !fixtureDir) await sleep(delayMs);
  }
}
if (!result) throw lastError;

const receipt = {
  schemaVersion: "1.0.0",
  controlId: "FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29",
  manifestDigest: "e729a5b31f853723918d63a0dfa759f34f0671fb67beb04cc994e1d5d617fde8",
  mode: fixtureDir ? "SOURCE_FIXTURE" : "PUBLIC_GITHUB_PAGES",
  baseUrl: fixtureDir ? null : baseUrl,
  sourceCommit: result.status.sourceCommit,
  checks: result.checks,
  result: fixtureDir ? "SOURCE_FIXTURE_PASS" : "PUBLIC_GITHUB_PAGES_READBACK_PASS",
  publicLiveClaim: !fixtureDir
};
fs.mkdirSync(path.dirname(path.resolve(receiptFile)), { recursive: true });
fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + "\n");
console.log(JSON.stringify(receipt, null, 2));
