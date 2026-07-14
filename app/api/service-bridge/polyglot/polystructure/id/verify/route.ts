import { NextRequest, NextResponse } from "next/server";

import {
  createLocalRegistryPlan,
  verifyPolystructureIdentity,
  type PolystructureIdentityPayload,
} from "@/lib/service-bridge-id-registry";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-id-verification-capabilities/v1",
    operations: ["verify", "plan-local-register"],
    exactConfirmation: "REGISTER POLYSTRUCTURE ID <compact-id>",
    integrityAlgorithm: "SHA-256",
    automaticWriteAllowed: false,
    externalRegistryWriteAllowed: false,
    registryWritten: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const operation = String(payload?.operation ?? "verify");
    const identity = payload?.identity as PolystructureIdentityPayload;

    if (operation === "verify") {
      return NextResponse.json(verifyPolystructureIdentity(identity));
    }

    if (operation === "plan-local-register") {
      return NextResponse.json(
        createLocalRegistryPlan({
          registryId: String(payload?.registryId ?? ""),
          identity,
          existingCompactIds: Array.isArray(payload?.existingCompactIds)
            ? payload.existingCompactIds.map((value: unknown) => String(value))
            : undefined,
          confirmation: String(payload?.confirmation ?? ""),
        }),
      );
    }

    throw new Error("operation must be verify or plan-local-register.");
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure identity verification request.",
        payloadIntegrityChecked: false,
        registryPlanCreated: false,
        registryWritten: false,
        externalRegistryWritten: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
