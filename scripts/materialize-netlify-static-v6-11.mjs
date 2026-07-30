import { createHash } from "node:crypto";
import { access, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const [targetDirArg, outputDirArg] = process.argv.slice(2);
if (!targetDirArg || !outputDirArg) {
  throw new Error("usage: node materialize-netlify-static-v6-11.mjs <target-dir> <output-dir>");
}

const targetDir = path.resolve(targetDirArg);
const outputDir = path.resolve(outputDirArg);

const requiredRoutes = [
  "/",
  "/github-control-tower-audit",
  "/github-control-tower-audit/operations",
  "/github-control-tower-audit/reconciliation",
  "/github-control-tower-audit/canonicalization-preview",
  "/github-control-tower-audit/canonicalization-application",
  "/github-control-tower-audit/successor-readiness",
  "/github-control-tower-audit/consent-evidence",
  "/api/revenue/pilot",
  "/api/revenue/capacity",
  "/api/revenue/operations",
  "/api/revenue/reconciliation",
  "/api/revenue/canonicalization-preview",
  "/api/revenue/canonicalization-application",
  "/api/revenue/successor-readiness",
  "/api/revenue/consent-evidence",
  "/sitemap.xml",
  "/robots.txt",
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const exists = async (candidate) => {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
};

const blobCandidates = [
  path.join(targetDir, ".netlify", "deploy", "v1", "blobs", "deploy"),
  path.join(targetDir, ".netlify", "v1", "blobs", "deploy"),
  path.join(targetDir, ".netlify", "blobs", "deploy"),
];
const blobDir = (await Promise.all(blobCandidates.map(async (candidate) => [candidate, await exists(candidate)])))
  .find(([, present]) => present)?.[0];
if (!blobDir) {
  throw new Error(`Netlify deploy route blobs not found under ${targetDir}/.netlify`);
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const redirects = [];
const headers = [];
const routes = [];

const contentExtension = (contentType) => {
  const value = String(contentType || "").toLowerCase();
  if (value.includes("application/json")) return ".json";
  if (value.includes("application/xml") || value.includes("text/xml")) return ".xml";
  if (value.includes("text/plain")) return ".txt";
  if (value.includes("text/html")) return ".html";
  if (value.includes("image/png")) return ".png";
  if (value.includes("image/jpeg")) return ".jpg";
  if (value.includes("image/svg")) return ".svg";
  if (value.includes("image/x-icon")) return ".ico";
  return ".bin";
};

const safeRoutePath = (route) => route.replace(/^\/+/, "");
const writeBody = async (destination, body) => {
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, body);
};

for (const name of (await readdir(blobDir)).sort()) {
  const blobPath = path.join(blobDir, name);
  if (!(await stat(blobPath)).isFile()) continue;

  let record;
  try {
    record = JSON.parse(await readFile(blobPath, "utf8"));
  } catch {
    continue;
  }
  const value = record?.value;
  if (!value || typeof value.kind !== "string") continue;

  let decodedRoute;
  try {
    decodedRoute = Buffer.from(name, "base64url").toString("utf8");
  } catch {
    continue;
  }
  if (!decodedRoute) continue;

  let route = decodedRoute;
  if (route === "/index") route = "/";
  if (!route.startsWith("/") && route !== "404.html" && route !== "500.html") continue;

  let body;
  let contentType;
  let outputRelative;

  if (value.kind === "APP_PAGE") {
    body = Buffer.from(value.html || "", "utf8");
    contentType = "text/html; charset=utf-8";
    outputRelative = route === "/" ? "index.html" : path.posix.join(safeRoutePath(route), "index.html");
    await writeBody(path.join(outputDir, outputRelative), body);
  } else if (value.kind === "APP_ROUTE") {
    body = Buffer.from(value.body || "", "base64");
    contentType = value.headers?.["content-type"] || "application/octet-stream";

    if (route === "/robots.txt" || route === "/sitemap.xml" || route === "/favicon.ico") {
      outputRelative = safeRoutePath(route);
      await writeBody(path.join(outputDir, outputRelative), body);
    } else if (route === "404.html" || route === "500.html") {
      outputRelative = route;
      await writeBody(path.join(outputDir, outputRelative), body);
    } else {
      const extension = contentExtension(contentType);
      outputRelative = path.posix.join("__payload", `${safeRoutePath(route)}${extension}`);
      await writeBody(path.join(outputDir, outputRelative), body);
      redirects.push(`${route} /${outputRelative} 200!`);
      headers.push(`/${outputRelative}\n  Content-Type: ${contentType}`);
    }
  } else {
    continue;
  }

  routes.push({
    route,
    kind: value.kind,
    sourceBlob: name,
    output: `/${outputRelative}`,
    contentType,
    status: value.status ?? 200,
    bytes: body.length,
    sha256: sha256(body),
    required: requiredRoutes.includes(route),
  });
}

const staticSource = path.join(targetDir, ".next", "static");
if (!(await exists(staticSource))) {
  throw new Error(`Next static assets not found at ${staticSource}`);
}
await mkdir(path.join(outputDir, "_next"), { recursive: true });
await cp(staticSource, path.join(outputDir, "_next", "static"), { recursive: true });

const routeMap = new Map(routes.map((entry) => [entry.route, entry]));
const missing = requiredRoutes.filter((route) => !routeMap.has(route));
if (missing.length) {
  throw new Error(`required route blobs missing: ${missing.join(", ")}`);
}
for (const route of requiredRoutes) {
  const entry = routeMap.get(route);
  if (!entry.bytes || !entry.sha256) throw new Error(`empty required route materialization: ${route}`);
}

if (redirects.length) await writeFile(path.join(outputDir, "_redirects"), `${redirects.join("\n")}\n`, "utf8");
if (headers.length) await writeFile(path.join(outputDir, "_headers"), `${headers.join("\n\n")}\n`, "utf8");

const manifest = {
  schemaVersion: "1.0.0",
  controllerVersion: "6.11.0",
  exactTargetCommit: "88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334",
  fixedSiteId: "21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f",
  fixedSiteName: "lichburn-v0-2-8",
  rollbackDeployId: "6a6b6a709e0a6d5ff2ca7759",
  requiredRouteCount: requiredRoutes.length,
  requiredRoutes,
  blobDirectory: path.relative(targetDir, blobDir),
  routes,
};
const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(path.join(outputDir, "__fardarter-v6-11-materialization.json"), manifestBytes);
await writeFile(path.join(outputDir, "__fardarter-v6-11-materialization.sha256"), `${sha256(manifestBytes)}\n`, "utf8");

console.log(JSON.stringify({
  status: "MATERIALIZED",
  blobDir,
  outputDir,
  routeCount: routes.length,
  requiredRouteCount: requiredRoutes.length,
  materializationDigest: sha256(manifestBytes),
}, null, 2));
