import { createHash } from "node:crypto";

import { verifyMerkleProof, type MerkleProofStep } from "@/lib/service-bridge-merkle";

export type PolystructureReleaseManifest = {
  schema: "jp-hviti-service-bridge-polystructure-release-manifest/v1";
  releaseId: string;
  bundleId: string;
  bundleDigest: string;
  compactId: string;
  bankId: string;
  actor: string;
  preparedAt: string;
  artifactCount: number;
  artifacts: Array<{ id: string; digest: string; mediaType?: string }>;
  merkleRoot: string;
};

export function verifyPolystructureRelease(input: {
  releaseReference: string;
  releaseDigest: string;
  manifest: PolystructureReleaseManifest;
  proofs?: Array<{
    id: string;
    leafDigest: string;
    path: MerkleProofStep[];
  }>;
}) {
  const expectedDigest = createHash("sha256")
    .update(JSON.stringify(input.manifest))
    .digest("hex");
  const expectedReference = `RELEASE:${input.manifest.releaseId}:${expectedDigest.slice(0, 20)}`;

  const artifactCountMatches =
    input.manifest.artifactCount === input.manifest.artifacts.length;
  const artifactIdsUnique =
    new Set(input.manifest.artifacts.map((artifact) => artifact.id)).size ===
    input.manifest.artifacts.length;

  const proofResults = (input.proofs ?? []).map((proof) => ({
    id: proof.id,
    ...verifyMerkleProof({
      leafDigest: proof.leafDigest,
      rootDigest: input.manifest.merkleRoot,
      path: proof.path,
    }),
  }));

  const checks = {
    manifestSchemaValid:
      input.manifest.schema ===
      "jp-hviti-service-bridge-polystructure-release-manifest/v1",
    releaseDigestValid: input.releaseDigest === expectedDigest,
    releaseReferenceValid: input.releaseReference === expectedReference,
    releaseIdPresent: input.manifest.releaseId.trim().length > 0,
    bundleIdPresent: input.manifest.bundleId.trim().length > 0,
    bundleDigestLooksValid: /^[a-f0-9]{64}$/i.test(input.manifest.bundleDigest),
    compactIdPresent: input.manifest.compactId.trim().length > 0,
    bankIdPresent: input.manifest.bankId.trim().length > 0,
    actorPresent: input.manifest.actor.trim().length > 0,
    preparedAtValid: !Number.isNaN(Date.parse(input.manifest.preparedAt)),
    merkleRootLooksValid: /^[a-f0-9]{64}$/i.test(input.manifest.merkleRoot),
    artifactCountMatches,
    artifactIdsUnique,
    suppliedProofsValid: proofResults.every((result) => result.valid),
  };

  return {
    schema: "jp-hviti-service-bridge-polystructure-release-verification/v1",
    checkedAt: new Date().toISOString(),
    valid: Object.values(checks).every(Boolean),
    checks,
    expected: {
      releaseDigest: expectedDigest,
      releaseReference: expectedReference,
    },
    proofResults,
    trustBoundary: {
      localIntegrityVerified: Object.values(checks).every(Boolean),
      publisherIdentityVerified: false,
      legalIdentityVerified: false,
      trustedTimestampVerified: false,
      externalPublicationChecked: false,
      archiveContentsOpened: false,
    },
    externalActionCompleted: false as const,
  };
}
