import { NextRequest, NextResponse } from "next/server";

import {
  applyLocalRegistryRecord,
  verifyLocalRegistryChain,
  type LocalRegistryRecord,
} from "@/lib/service-bridge-id-registry-apply";
import type { PolystructureIdentityPayload } from "@/lib/service-bridge-id-registry";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-local-registry-apply-capabilities/v1",
    operations: ["apply-local", "verify-chain"],
    exactConfirmation: "COMMIT POLYSTRUCTURE ID <compact-id>",
    localMutationAllowed: true,
    automaticMutationAllowed: false,
    externalRegistryWriteAllowed: false,
    trustedTimestamp: false,
    signed: false,
    notarized: false,
    blockchain: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const operation = String(payload?.operation ?? "apply-local");

    if (operation === "apply-local") {
      const result = applyLocalRegistryRecord({
        registryId: String(payload?.registryId ?? ""),
        identity: payload?.identity as PolystructureIdentityPayload,
        existingRecords: Array.isArray(payload?.existingRecords)
          ? (payload.existingRecords as LocalRegistryRecord[])
          : undefined,
        confirmation: String(payload?.confirmation ?? ""),
      });
      return NextResponse.json(result);
    }

    if (operation === "verify-chain") {
      const records = Array.isArray(payload?.records)
        ? (payload.records as LocalRegistryRecord[])
        : [];
      return NextResponse.json(verifyLocalRegistryChain(records));
    }

    throw new Error("operation must be apply-local or verify-chain.");
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure registry apply request.",
        localMutationApplied: false,
        externalRegistryWritten: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
