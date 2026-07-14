import { NextRequest, NextResponse } from "next/server";

import { createPolystructureReleaseCapsule } from "@/lib/service-bridge-polystructure-release";
import type { PolystructureBundleManifest } from "@/lib/service-bridge-polystructure-bundle-verify";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-release-capabilities/v1",
    role: "prepare deterministic release capsules with bundle, identity, concatenation, artifact, and Merkle integrity metadata",
    exactConfirmation: "PREPARE POLYSTRUCTURE RELEASE <release-id>",
    exportFormats: ["json", "ndjson", "zip-manifest", "barcode-payload"],
    filesWritten: false,
    archiveCreated: false,
    published: false,
    signed: false,
    notarized: false,
    trustedTimestamp: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    return NextResponse.json(
      createPolystructureReleaseCapsule({
        releaseId: String(payload?.releaseId ?? ""),
        bundleId: String(payload?.bundleId ?? ""),
        bundleDigest: String(payload?.bundleDigest ?? ""),
        manifest: payload?.manifest as PolystructureBundleManifest,
        artifacts: Array.isArray(payload?.artifacts)
          ? payload.artifacts.map((artifact: unknown) => {
              const value = artifact as Record<string, unknown>;
              return {
                id: String(value.id ?? ""),
                digest: String(value.digest ?? ""),
                mediaType:
                  typeof value.mediaType === "string"
                    ? value.mediaType
                    : undefined,
              };
            })
          : undefined,
        actor: String(payload?.actor ?? ""),
        confirmation: String(payload?.confirmation ?? ""),
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure release request.",
        releasePreparedInMemory: false,
        filesWritten: false,
        archiveCreated: false,
        published: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
