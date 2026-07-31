#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const args = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const output = path.resolve(root, arg("--output", "dist/fardarter-pages"));
const sourceCommit = arg("--source-commit", process.env.GITHUB_SHA || "SOURCE_COMMIT_UNSET");
const source = path.join(root, "fardarter-startup");
const expectedBase = "https://hvitiswift-afk.github.io/nextjs-boilerplate/";
const sourceFiles = ["index.html", "privacy.html", "projects.html", "styles.css"];
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

for (const file of sourceFiles) {
  const full = path.join(source, file);
  if (!fs.existsSync(full)) throw new Error(`missing static source: ${file}`);
  const text = fs.readFileSync(full, "utf8");
  if (/mailto:/i.test(text)) throw new Error(`unverified email contact remains in ${file}`);
  if (/fardarter\.systems/i.test(text)) throw new Error(`unverified domain remains in ${file}`);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of sourceFiles) {
  fs.copyFileSync(path.join(source, file), path.join(output, file));
}

const status = {
  schemaVersion: "1.0.0",
  authorityControl: "FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29",
  authorityDigest: "e729a5b31f853723918d63a0dfa759f34f0671fb67beb04cc994e1d5d617fde8",
  repository: "hvitiswift-afk/nextjs-boilerplate",
  sourceAuthority: "GITHUB_PRIMARY_INTENDED",
  sourceCommit,
  artifactState: "STATIC_ARTIFACT_BUILT_PUBLIC_READBACK_PENDING",
  pagesLiveClaim: false,
  contactChannel: "GITHUB_ISSUES",
  publicationGateIssue: 102,
  reviewedPublicOfferIssue: 133,
  serverRouteBoundary: "NOT_INCLUDED_GITHUB_PAGES_STATIC_ONLY"
};
fs.writeFileSync(path.join(output, "status.json"), JSON.stringify(status, null, 2) + "\n");
fs.writeFileSync(path.join(output, ".nojekyll"), "");
fs.writeFileSync(
  path.join(output, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${expectedBase}sitemap.xml\n`
);
fs.writeFileSync(
  path.join(output, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${expectedBase}</loc></url>\n  <url><loc>${expectedBase}projects.html</loc></url>\n  <url><loc>${expectedBase}privacy.html</loc></url>\n</urlset>\n`
);

const receiptFiles = fs.readdirSync(output).filter((name) => name !== "publication-source-receipt.json").sort();
const hashes = Object.fromEntries(
  receiptFiles.map((name) => [name, sha256(fs.readFileSync(path.join(output, name)))])
);
const receipt = {
  schemaVersion: "1.0.0",
  controlId: status.authorityControl,
  manifestDigest: status.authorityDigest,
  sourceCommit,
  buildOutput: path.relative(root, output).replaceAll("\\", "/"),
  fileCount: receiptFiles.length,
  fileHashes: hashes,
  publicationState: "SOURCE_ARTIFACT_ONLY_PUBLIC_DEPLOYMENT_UNVERIFIED",
  publicLiveClaim: false
};
fs.writeFileSync(path.join(output, "publication-source-receipt.json"), JSON.stringify(receipt, null, 2) + "\n");

console.log(JSON.stringify({
  status: "PASS",
  output: path.relative(root, output).replaceAll("\\", "/"),
  fileCount: fs.readdirSync(output).length,
  sourceCommit,
  publicationState: receipt.publicationState
}, null, 2));
