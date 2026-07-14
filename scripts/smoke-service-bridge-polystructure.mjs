const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";
const checks = [];

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

const post = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const check = (name, passed, detail = "") => {
  checks.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const bankId = "PSB-SMOKE-001";
const actor = "JP-SMOKE";
const parts = [
  { id: "circuit", type: "circuit-bank", value: { elements: 3, connections: 2 } },
  { id: "polytope", type: "geometry", value: { dimensions: 4, name: "tesseract" } },
  { id: "rhythm", type: "polyrhythm", value: { voices: [3, 4, 5] } },
  { id: "polyphony", type: "polyphonic", value: { voices: ["language", "code", "signal"] } },
];

const contracts = await request("/api/service-bridge/contracts");
check("contract catalog responds", contracts.response.ok, `status ${contracts.response.status}`);
check("contract catalog version 19", contracts.body?.contractVersion === 19, `version ${contracts.body?.contractVersion}`);
check("polystructure contracts published", contracts.body?.contracts?.some((item) => item.id === "release-verify") === true);

const identity = await post("/api/service-bridge/polyglot/polystructure/id", {
  bankId,
  namespace: "JP-HVITI-SMOKE",
  label: "Polystructure smoke identity",
  metadata: { purpose: "live verification" },
  barcodeFormat: "qr",
});
check("identity responds", identity.response.ok, `status ${identity.response.status}`);
check("identity digest", /^[a-f0-9]{64}$/.test(identity.body?.identity?.digest || ""));
check("barcode payload created", typeof identity.body?.barcode?.payload === "string");
check("identity external boundary", identity.body?.externalActionCompleted === false);

const parsedIdentity = JSON.parse(identity.body.barcode.payload);
const identityVerification = await post("/api/service-bridge/polyglot/polystructure/id/verify", {
  operation: "verify",
  identity: parsedIdentity,
});
check("identity verifies", identityVerification.response.ok && identityVerification.body?.checks?.valid === true);

const concatenation = await post("/api/service-bridge/polyglot/polystructure/concatenate", {
  concatenationId: bankId,
  parts,
  confirmation: `CONCATENATE POLYSTRUCTURE ${bankId}`,
});
check("concatenation responds", concatenation.response.ok, `status ${concatenation.response.status}`);
check("concatenation digest", /^[a-f0-9]{64}$/.test(concatenation.body?.digest || ""));
check("concatenation part count", concatenation.body?.partCount === parts.length);

const bundle = await post("/api/service-bridge/polyglot/polystructure/bundle", {
  bankId,
  namespace: "JP-HVITI-SMOKE",
  label: "Polystructure smoke bundle",
  metadata: { suite: "polystructure-v19" },
  barcodeFormat: "qr",
  parts,
  actor,
  confirmation: `BUILD POLYSTRUCTURE BUNDLE ${bankId}`,
});
check("bundle responds", bundle.response.ok, `status ${bundle.response.status}`);
check("bundle digest", /^[a-f0-9]{64}$/.test(bundle.body?.bundleDigest || ""));
check("bundle identity chain", bundle.body?.manifest?.identityChain?.length === 2);
check("bundle external boundary", bundle.body?.truthBoundary?.externalActionCompleted === false);

const bundleVerification = await post("/api/service-bridge/polyglot/polystructure/bundle/verify", {
  bundleId: bundle.body?.bundleId,
  bundleDigest: bundle.body?.bundleDigest,
  manifest: bundle.body?.manifest,
});
check("bundle verifies", bundleVerification.response.ok && bundleVerification.body?.valid === true);

const merkle = await post("/api/service-bridge/polyglot/polystructure/merkle", {
  operation: "create-tree",
  leaves: [
    { id: "bundle", digest: bundle.body.bundleDigest },
    { id: "identity", digest: bundle.body.manifest.identity.digest },
    { id: "concatenation", digest: bundle.body.manifest.concatenation.digest },
  ],
});
check("Merkle tree responds", merkle.response.ok, `status ${merkle.response.status}`);
check("Merkle root digest", /^[a-f0-9]{64}$/.test(merkle.body?.rootDigest || ""));
check("Merkle proofs created", merkle.body?.proofs?.length === 3);

const proof = merkle.body.proofs[0];
const proofVerification = await post("/api/service-bridge/polyglot/polystructure/merkle", {
  operation: "verify-proof",
  leafDigest: proof.leafDigest,
  rootDigest: merkle.body.rootDigest,
  path: proof.path,
});
check("Merkle proof verifies", proofVerification.response.ok && proofVerification.body?.valid === true);

const releaseId = "PSR-SMOKE-001";
const release = await post("/api/service-bridge/polyglot/polystructure/release", {
  releaseId,
  bundleId: bundle.body.bundleId,
  bundleDigest: bundle.body.bundleDigest,
  manifest: bundle.body.manifest,
  artifacts: [
    { id: "polystructure-concatenation", digest: concatenation.body.digest, mediaType: "application/json" },
  ],
  actor,
  confirmation: `PREPARE POLYSTRUCTURE RELEASE ${releaseId}`,
});
check("release responds", release.response.ok, `status ${release.response.status}`);
check("release digest", /^[a-f0-9]{64}$/.test(release.body?.releaseDigest || ""));
check("release Merkle root", /^[a-f0-9]{64}$/.test(release.body?.merkle?.rootDigest || ""));
check("release external boundary", release.body?.truthBoundary?.externalActionCompleted === false);

const releaseVerification = await post("/api/service-bridge/polyglot/polystructure/release/verify", {
  releaseReference: release.body.releaseReference,
  releaseDigest: release.body.releaseDigest,
  manifest: release.body.manifest,
  proofs: release.body.merkle.proofs.map((item) => ({
    id: item.id,
    leafDigest: item.leafDigest,
    path: item.path,
  })),
});
check("release verifies", releaseVerification.response.ok && releaseVerification.body?.valid === true);
check("release proof set verifies", releaseVerification.body?.proofResults?.every((item) => item.valid) === true);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Polystructure v19 Smoke Receipt");
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log("Barcode image rendered: NO");
console.log("Registry written: NO");
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
