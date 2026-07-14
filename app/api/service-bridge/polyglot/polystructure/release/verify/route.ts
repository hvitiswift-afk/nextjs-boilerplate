import { NextRequest, NextResponse } from "next/server";

import {
  verifyPolystructureRelease,
  type PolystructureReleaseManifest,
} from "@/lib/service-bridge-polystructure-release-verify";
import type { MerkleProofStep } from "@/lib/service-bridge-merkle";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-release-verification-capabilities/v1",
    role: "verify release digest, reference, manifest shape, artifact inventory, and supplied Merkle proofs",
    checks: [
      "manifest-schema",
      "release-digest",
      "release-reference",
      "bundle-digest-shape",
      "artifact-count",
      "artifact-id-uniqueness",
      "merkle-root-shape",
      "supplied-merkle-proofs",
    ],
    publisherIdentityVerified: false,
    legalIdentityVerified: false,
    trustedTimestampVerified: false,
    externalPublicationChecked: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    return NextResponse.json(
      verifyPolystructureRelease({
        releaseReference: String(payload?.releaseReference ?? ""),
        releaseDigest: String(payload?.releaseDigest ?? ""),
        manifest: payload?.manifest as PolystructureReleaseManifest,
        proofs: Array.isArray(payload?.proofs)
          ? payload.proofs.map((proof: unknown) => {
              const value = proof as Record<string, unknown>;
              return {
                id: String(value.id ?? ""),
                leafDigest: String(value.leafDigest ?? ""),
                path: Array.isArray(value.path)
                  ? (value.path as MerkleProofStep[])
                  : [],
              };
            })
          : undefined,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure release verification request.",
        valid: false,
        localIntegrityVerified: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
