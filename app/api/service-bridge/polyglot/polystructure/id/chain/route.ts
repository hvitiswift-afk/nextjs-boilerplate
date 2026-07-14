import { NextRequest, NextResponse } from "next/server";

import {
  appendPolystructureIdChainEntry,
  verifyPolystructureIdChain,
  type PolystructureIdChainEntry,
} from "@/lib/service-bridge-id-chain";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-id-chain-capabilities/v1",
    operations: ["append", "verify"],
    entryOperations: ["ISSUED", "VERIFIED", "REGISTER_PLANNED", "REVOKED"],
    digestAlgorithm: "SHA-256",
    appendOnly: true,
    trustedTimestamp: false,
    signed: false,
    notarized: false,
    externalRegistryChecked: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const operation = String(payload?.operation ?? "verify");

    if (operation === "append") {
      return NextResponse.json(
        appendPolystructureIdChainEntry({
          compactId: String(payload?.compactId ?? ""),
          operation: String(payload?.entryOperation ?? "VERIFIED") as PolystructureIdChainEntry["operation"],
          actor: String(payload?.actor ?? ""),
          reason: typeof payload?.reason === "string" ? payload.reason : undefined,
          previousEntry: payload?.previousEntry as PolystructureIdChainEntry | null | undefined,
        }),
      );
    }

    if (operation === "verify") {
      return NextResponse.json(
        verifyPolystructureIdChain(
          Array.isArray(payload?.entries)
            ? (payload.entries as PolystructureIdChainEntry[])
            : [],
        ),
      );
    }

    throw new Error("operation must be append or verify.");
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure identity chain request.",
        entryCreated: false,
        chainVerified: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
