import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [siteDirArg, immutableUrlArg, deployIdArg, evidenceDirArg] = process.argv.slice(2);
if (!siteDirArg || !immutableUrlArg || !deployIdArg || !evidenceDirArg) {
  throw new Error("usage: node verify-netlify-readback-v6-11.mjs <site-dir> <immutable-url> <deploy-id> <evidence-dir>");
}

const siteDir = path.resolve(siteDirArg);
const immutableUrl = immutableUrlArg.replace(/\/+$/, "");
const deployId = deployIdArg;
const evidenceDir = path.resolve(evidenceDirArg);
const manifest = JSON.parse(await readFile(path.join(siteDir, "__fardarter-v6-11-materialization.json"), "utf8"));

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(manifest.exactTargetCommit === "88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334", "target commit mismatch");
assert(manifest.fixedSiteId === "21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f", "fixed site mismatch");
assert(manifest.rollbackDeployId === "6a6b6a709e0a6d5ff2ca7759", "rollback mismatch");
assert(manifest.requiredRouteCount === 18 && manifest.requiredRoutes.length === 18, "required route count mismatch");
assert(deployId !== manifest.rollbackDeployId, "new deploy ID must differ from rollback deploy ID");
assert(immutableUrl.includes(`${deployId}--lichburn-v0-2-8.netlify.app`), "immutable URL is not authoritative for the deploy ID and fixed site");

const expected = new Map(manifest.routes.filter((entry) => entry.required).map((entry) => [entry.route, entry]));
const results = [];

for (const route of manifest.requiredRoutes) {
  const entry = expected.get(route);
  assert(entry, `missing expected route entry: ${route}`);
  const url = `${immutableUrl}${route}`;

  let response;
  let body;
  let lastError;
  for (let attempt = 1; attempt <= 40; attempt += 1) {
    try {
      response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "Fardarter-Drive-v6.11-Immutable-Readback" },
      });
      body = Buffer.from(await response.arrayBuffer());
      if (response.status >= 200 && response.status < 300 && body.length > 0) break;
      lastError = new Error(`HTTP ${response.status}, ${body.length} bytes`);
    } catch (error) {
      lastError = error;
    }
    await sleep(3000);
  }

  if (!response || response.status < 200 || response.status >= 300 || !body?.length) {
    throw new Error(`route readback failed ${route}: ${lastError?.message || "no response"}`);
  }

  const actualDigest = sha256(body);
  assert(actualDigest === entry.sha256, `body digest mismatch ${route}: expected ${entry.sha256}, got ${actualDigest}`);

  const bodyText = body.toString("utf8");
  assert(!/https?:\/\/(?:drive|docs)\.google\.com\//i.test(bodyText), `private Google Drive URL exposure detected at ${route}`);

  if (route.startsWith("/api/")) {
    try {
      JSON.parse(bodyText);
    } catch (error) {
      throw new Error(`API JSON parse failed ${route}: ${error.message}`);
    }
  }
  if (route === "/robots.txt") {
    assert(/Sitemap:/i.test(bodyText), "robots.txt is missing Sitemap declaration");
  }
  if (route === "/sitemap.xml") {
    assert(bodyText.includes("/github-control-tower-audit"), "sitemap is missing audit route");
  }

  results.push({
    route,
    url,
    status: response.status,
    bytes: body.length,
    expectedSha256: entry.sha256,
    actualSha256: actualDigest,
    contentType: response.headers.get("content-type"),
    exactBodyMatch: true,
  });
  console.log(`PASS ${response.status} ${body.length} ${route}`);
}

assert(results.length === 18, "not all required routes were verified");
assert(results.filter((entry) => entry.route.startsWith("/api/")).length === 8, "API route count mismatch");

await mkdir(evidenceDir, { recursive: true });
const evidence = {
  schemaVersion: "1.0.0",
  controllerVersion: "6.11.0",
  result: "DEPLOYED_AND_VERIFIED",
  exactTargetCommit: manifest.exactTargetCommit,
  deployId,
  immutableUrl,
  fixedSiteId: manifest.fixedSiteId,
  fixedSiteName: manifest.fixedSiteName,
  rollbackDeployId: manifest.rollbackDeployId,
  materializationDigest: sha256(await readFile(path.join(siteDir, "__fardarter-v6-11-materialization.json"))),
  requiredRouteCount: 18,
  verifiedRouteCount: results.length,
  exactBodyMatchCount: results.filter((entry) => entry.exactBodyMatch).length,
  privateGoogleDriveUrlExposed: false,
  routes: results,
};
const evidenceBytes = Buffer.from(`${JSON.stringify(evidence, null, 2)}\n`, "utf8");
await writeFile(path.join(evidenceDir, "FARDARTER-V6-11-NETLIFY-READBACK.json"), evidenceBytes);
await writeFile(path.join(evidenceDir, "FARDARTER-V6-11-NETLIFY-READBACK.sha256"), `${sha256(evidenceBytes)}\n`, "utf8");

console.log(JSON.stringify({
  result: evidence.result,
  deployId,
  immutableUrl,
  verifiedRouteCount: results.length,
  evidenceDigest: sha256(evidenceBytes),
}, null, 2));
