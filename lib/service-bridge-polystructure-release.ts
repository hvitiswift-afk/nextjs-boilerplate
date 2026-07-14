import { createHash } from "node:crypto";

import { createMerkleTree, type MerkleLeaf } from "@/lib/service-bridge-merkle";
import type { PolystructureBundleManifest } from "@/lib/service-bridge-polystructure-bundle-verify";

export function createPolystructureReleaseCapsule(input: {
  releaseId: string;
  bundleId: string;
  bundleDigest: string;
  manifest: PolystructureBundleManifest;
  artifacts?: Array<{ id: string; digest: string; mediaType?: string }>;
  actor: string;
  confirmation: string;
}) {
  const releaseId = input.releaseId.trim();
  const actor = input.actor.trim();
  if (!releaseId || !actor) throw new Error("releaseId and actor are required.");

  const expectedConfirmation = `PREPARE POLYSTRUCTURE RELEASE ${releaseId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const leaves: MerkleLeaf[] = [
    { id: "bundle", digest: input.bundleDigest },
    { id: "identity", digest: input.manifest.identity.digest },
    { id: "concatenation", digest: input.manifest.concatenation.digest },
    ...(input.artifacts ?? []).map((artifact) => ({
      id: artifact.id,
      digest: artifact.digest,
    })),
  ];

  const merkle = createMerkleTree(leaves);
  const releaseManifest = {
    schema: "jp-hviti-service-bridge-polystructure-release-manifest/v1",
    releaseId,
    bundleId: input.bundleId,
    bundleDigest: input.bundleDigest,
    compactId: input.manifest.identity.compactId,
    bankId: input.manifest.identity.bankId,
    actor,
    preparedAt: new Date().toISOString(),
    artifactCount: input.artifacts?.length ?? 0,
    artifacts: input.artifacts ?? [],
    merkleRoot: merkle.rootDigest,
  };

  const releaseDigest = createHash("sha256")
    .update(JSON.stringify(releaseManifest))
    .digest("hex");

  return {
    schema: "jp-hviti-service-bridge-polystructure-release-capsule/v1",
    releaseId,
    releaseDigest,
    releaseReference: `RELEASE:${releaseId}:${releaseDigest.slice(0, 20)}`,
    manifest: releaseManifest,
    merkle,
    exportPlan: {
      formats: ["json", "ndjson", "zip-manifest", "barcode-payload"],
      deterministicFileNames: true,
      suggestedDirectory: `artifacts/polystructure/${releaseId}`,
      automaticExportAllowed: false,
      automaticPublishAllowed: false,
    },
    verification: {
      bundleDigestIncluded: true,
      identityDigestIncluded: true,
      concatenationDigestIncluded: true,
      artifactProofsIncluded: true,
      localReverificationSupported: true,
    },
    truthBoundary: {
      releasePreparedInMemory: true,
      filesWritten: false,
      archiveCreated: false,
      published: false,
      signed: false,
      notarized: false,
      trustedTimestamp: false,
      externalActionCompleted: false,
    },
  };
}
