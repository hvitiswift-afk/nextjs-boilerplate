import { NextRequest, NextResponse } from "next/server";

import {
  createPolystructureId,
  type BarcodeFormat,
} from "@/lib/service-bridge-id-barcode";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-id-capabilities/v1",
    role: "polystructure bank identity and barcode payload generation",
    formats: ["code128", "qr", "data-matrix", "pdf417"],
    generatedBankIdPrefix: "PSB-",
    digestAlgorithm: "SHA-256",
    barcodeImageRendered: false,
    scannerCompatible: true,
    trustedIdentityProof: false,
    externalRegistryWritten: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = createPolystructureId({
      bankId: typeof payload?.bankId === "string" ? payload.bankId : undefined,
      namespace:
        typeof payload?.namespace === "string" ? payload.namespace : undefined,
      label: typeof payload?.label === "string" ? payload.label : undefined,
      version:
        typeof payload?.version === "number" ? payload.version : undefined,
      metadata:
        payload?.metadata && typeof payload.metadata === "object"
          ? payload.metadata
          : undefined,
      barcodeFormat: String(payload?.barcodeFormat ?? "qr") as BarcodeFormat,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure ID request.",
        barcodeImageRendered: false,
        externalRegistryWritten: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
