import { NextRequest, NextResponse } from "next/server";

import {
  createSignalFabricPlan,
  type SignalLink,
  type SignalNode,
} from "@/lib/service-bridge-signal-fabric";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-signal-fabric-capabilities/v1",
    domains: ["electronics", "circuits", "embedded-systems", "networks", "routing", "protocol-translation", "semantic-routing"],
    acceptedNodeKinds: [
      "human-language",
      "code-language",
      "sensor",
      "actuator",
      "microcontroller",
      "logic-gate",
      "circuit",
      "device",
      "router",
      "switch",
      "service",
      "unknown",
    ],
    acceptedMedia: ["wire", "bus", "radio", "optical", "virtual", "semantic"],
    automaticHardwareControlAllowed: false,
    automaticPacketTransmissionAllowed: false,
    electricalSimulationPerformed: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createSignalFabricPlan({
      nodes: Array.isArray(payload?.nodes) ? (payload.nodes as SignalNode[]) : [],
      links: Array.isArray(payload?.links) ? (payload.links as SignalLink[]) : [],
      sourceNodeId: String(payload?.sourceNodeId ?? ""),
      targetNodeId: String(payload?.targetNodeId ?? ""),
      payloadType: String(payload?.payloadType ?? "unified-semantic-stream"),
      requireAcknowledgement: payload?.requireAcknowledgement !== false,
      requireIsolation: payload?.requireIsolation !== false,
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid signal-fabric request.",
        routeComputed: false,
        packetTransmitted: false,
        circuitEnergized: false,
        deviceControlled: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
