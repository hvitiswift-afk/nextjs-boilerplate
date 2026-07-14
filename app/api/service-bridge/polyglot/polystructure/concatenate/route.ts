import { NextRequest, NextResponse } from "next/server";

import {
  concatenatePolystructure,
  type ConcatenationPart,
} from "@/lib/service-bridge-concatenate";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-concatenation-capabilities/v1",
    role: "deterministic concatenation of polystructure IDs, chains, barcode payloads, circuit banks, language cubes, and signal plans",
    exactConfirmation: "CONCATENATE POLYSTRUCTURE <concatenation-id>",
    canonicalization: "sorted-json-v1",
    digestAlgorithm: "SHA-256",
    barcodePayloadCompatible: true,
    identityChainCompatible: true,
    payloadStored: false,
    barcodeRendered: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = concatenatePolystructure({
      concatenationId: String(payload?.concatenationId ?? ""),
      parts: Array.isArray(payload?.parts)
        ? (payload.parts as ConcatenationPart[])
        : [],
      separator:
        typeof payload?.separator === "string" ? payload.separator : undefined,
      includeIndex: payload?.includeIndex !== false,
      confirmation: String(payload?.confirmation ?? ""),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure concatenation request.",
        concatenationCreated: false,
        payloadStored: false,
        barcodeRendered: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
