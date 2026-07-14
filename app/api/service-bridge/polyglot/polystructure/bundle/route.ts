import { NextRequest, NextResponse } from "next/server";

import { createPolystructureBundle } from "@/lib/service-bridge-polystructure-bundle";
import type { BarcodeFormat } from "@/lib/service-bridge-id-barcode";
import type { ConcatenationPart } from "@/lib/service-bridge-concatenate";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-bundle-capabilities/v1",
    role: "atomic in-memory assembly of polystructure identity, barcode payload, concatenation, and identity chain",
    exactConfirmation: "BUILD POLYSTRUCTURE BUNDLE <bank-id-or-AUTO>",
    creates: [
      "polystructure-id",
      "barcode-payload",
      "concatenation",
      "identity-chain",
      "bundle-manifest",
      "bundle-digest",
    ],
    barcodeImageRendered: false,
    registryWritten: false,
    chainPersisted: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const bundle = createPolystructureBundle({
      bankId: typeof payload?.bankId === "string" ? payload.bankId : undefined,
      namespace:
        typeof payload?.namespace === "string" ? payload.namespace : undefined,
      label: typeof payload?.label === "string" ? payload.label : undefined,
      metadata:
        payload?.metadata && typeof payload.metadata === "object"
          ? payload.metadata
          : undefined,
      barcodeFormat: String(payload?.barcodeFormat ?? "qr") as BarcodeFormat,
      parts: Array.isArray(payload?.parts)
        ? (payload.parts as ConcatenationPart[])
        : [],
      actor: String(payload?.actor ?? ""),
      confirmation: String(payload?.confirmation ?? ""),
    });

    return NextResponse.json(bundle);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure bundle request.",
        bundleCreatedInMemory: false,
        barcodeImageRendered: false,
        registryWritten: false,
        chainPersisted: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
