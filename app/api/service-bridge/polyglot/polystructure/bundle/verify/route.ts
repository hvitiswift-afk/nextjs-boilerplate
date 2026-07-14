import { NextRequest, NextResponse } from "next/server";

import {
  verifyPolystructureBundle,
  type PolystructureBundleManifest,
} from "@/lib/service-bridge-polystructure-bundle-verify";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-bundle-verification-capabilities/v1",
    role: "verify bundle digest, bundle ID, barcode payload, compact identity, and append-only identity chain",
    checks: [
      "bundle-digest",
      "bundle-id",
      "manifest-schema",
      "barcode-payload",
      "compact-id",
      "human-readable-id",
      "identity-chain",
      "chain-identity-consistency",
    ],
    localIntegrityOnly: true,
    issuerIdentityVerified: false,
    legalIdentityVerified: false,
    trustedTimestampVerified: false,
    externalRegistryChecked: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    return NextResponse.json(
      verifyPolystructureBundle({
        bundleId: String(payload?.bundleId ?? ""),
        bundleDigest: String(payload?.bundleDigest ?? ""),
        manifest: payload?.manifest as PolystructureBundleManifest,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure bundle verification request.",
        valid: false,
        localIntegrityVerified: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
