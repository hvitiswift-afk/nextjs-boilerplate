import { NextRequest, NextResponse } from "next/server";

import {
  authorizeScannerSession,
  revokeScannerSession,
  type ScannerSessionScope,
} from "@/lib/service-bridge-scanner-session";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-scanner-session-capabilities/v1",
    operations: ["authorize", "revoke"],
    exactConfirmations: [
      "AUTHORIZE SCANNER SESSION <scanner-id>",
      "REVOKE SCANNER SESSION <session-id>",
    ],
    maximumDurationSeconds: 3600,
    oneSessionOnly: true,
    automaticallyRenewable: false,
    runtimeAdapterRequired: true,
    operatingSystemPermissionGrantedByApi: false,
    scannerActivated: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const operation = String(payload?.operation ?? "authorize");

    if (operation === "authorize") {
      const authorization = authorizeScannerSession({
        scope: payload?.scope as ScannerSessionScope,
        durationSeconds: Number(payload?.durationSeconds ?? 60),
        confirmation: String(payload?.confirmation ?? ""),
        permissionEvidence: payload?.permissionEvidence ?? {},
      });
      return NextResponse.json(authorization);
    }

    if (operation === "revoke") {
      const revocation = revokeScannerSession({
        sessionId: String(payload?.sessionId ?? ""),
        scannerId: String(payload?.scannerId ?? ""),
        reason: String(payload?.reason ?? ""),
        confirmation: String(payload?.confirmation ?? ""),
      });
      return NextResponse.json(revocation);
    }

    throw new Error("operation must be authorize or revoke.");
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid scanner session request.",
        permissionReceiptCreated: false,
        runtimeAccessGrantedByOperatingSystem: false,
        scannerActivated: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
