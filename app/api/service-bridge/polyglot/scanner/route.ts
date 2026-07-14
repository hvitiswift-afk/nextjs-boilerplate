import { NextRequest, NextResponse } from "next/server";

import {
  createScannerPlan,
  type ScannerMode,
  type ScannerPermission,
} from "@/lib/service-bridge-scanner";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-scanner-capabilities/v1",
    role: "permission-gated scanner planning for AR, Polyglot L4, circuits, networks, routing, modem, and V#",
    modes: [
      "camera",
      "document",
      "barcode",
      "qr",
      "object",
      "circuit",
      "network",
      "spectrum",
      "environment",
      "semantic",
    ],
    requiredConditions: [
      "explicit-user-consent",
      "device-permission",
      "scope-confirmation",
      "duration-confirmation",
      "storage-policy-confirmation",
      "exact-confirmation",
    ],
    externalStreamingRequiresSeparateApproval: true,
    automaticActivationAllowed: false,
    runtimeAdapterRequired: true,
    cameraAccessed: false,
    scannerActivated: false,
    environmentScanned: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createScannerPlan({
      scannerId: String(payload?.scannerId ?? ""),
      mode: String(payload?.mode ?? "semantic") as ScannerMode,
      targetDescription: String(payload?.targetDescription ?? ""),
      permissions: (payload?.permissions ?? {
        explicitUserConsent: false,
        devicePermissionGranted: false,
        scopeConfirmed: false,
        durationConfirmed: false,
        storagePolicyConfirmed: false,
        externalStreamingApproved: false,
      }) as ScannerPermission,
      allowedDataTypes: Array.isArray(payload?.allowedDataTypes)
        ? payload.allowedDataTypes.map((value: unknown) => String(value))
        : undefined,
      prohibitedDataTypes: Array.isArray(payload?.prohibitedDataTypes)
        ? payload.prohibitedDataTypes.map((value: unknown) => String(value))
        : undefined,
      durationSeconds:
        typeof payload?.durationSeconds === "number" ? payload.durationSeconds : undefined,
      localProcessingOnly: payload?.localProcessingOnly !== false,
      retainResults: payload?.retainResults === true,
      confirmation: String(payload?.confirmation ?? ""),
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid scanner request.",
        accessConditionallyAllowed: false,
        cameraAccessed: false,
        scannerActivated: false,
        environmentScanned: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
