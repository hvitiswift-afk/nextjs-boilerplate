import { NextRequest, NextResponse } from "next/server";

import {
  createARPlan,
  type ARAnchor,
  type AROverlay,
} from "@/lib/service-bridge-ar";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-ar-capabilities/v1",
    role: "AR semantic overlay planning for Polyglot L4, circuits, networks, routing, modem, and V#",
    anchorKinds: [
      "world",
      "image",
      "object",
      "plane",
      "location",
      "device",
      "network-node",
      "circuit-node",
      "semantic-concept",
    ],
    overlayKinds: [
      "label",
      "translation",
      "code",
      "circuit",
      "network-route",
      "signal",
      "instruction",
      "status",
      "warning",
      "V#-visual",
    ],
    layers: ["semantic", "polyglot-L4", "circuit", "network", "modem", "V#"],
    cameraAccessed: false,
    environmentScanned: false,
    overlayRendered: false,
    deviceControlled: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createARPlan({
      sessionId: String(payload?.sessionId ?? ""),
      anchors: Array.isArray(payload?.anchors) ? (payload.anchors as ARAnchor[]) : [],
      overlays: Array.isArray(payload?.overlays) ? (payload.overlays as AROverlay[]) : [],
      sourceLanguage:
        typeof payload?.sourceLanguage === "string" ? payload.sourceLanguage : undefined,
      targetLanguage:
        typeof payload?.targetLanguage === "string" ? payload.targetLanguage : undefined,
      includeCircuitLayer: payload?.includeCircuitLayer !== false,
      includeNetworkLayer: payload?.includeNetworkLayer !== false,
      includeModemLayer: payload?.includeModemLayer !== false,
      includeVSharpLayer: payload?.includeVSharpLayer !== false,
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid AR request.",
        cameraAccessed: false,
        environmentScanned: false,
        overlayRendered: false,
        deviceControlled: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
