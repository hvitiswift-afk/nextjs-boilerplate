export type SignalNodeKind =
  | "human-language"
  | "code-language"
  | "sensor"
  | "actuator"
  | "microcontroller"
  | "logic-gate"
  | "circuit"
  | "device"
  | "router"
  | "switch"
  | "service"
  | "unknown";

export type SignalNode = {
  id: string;
  kind: SignalNodeKind;
  protocols?: string[];
  capabilities?: string[];
};

export type SignalLink = {
  from: string;
  to: string;
  medium: "wire" | "bus" | "radio" | "optical" | "virtual" | "semantic";
  protocol?: string;
  latencyMs?: number;
  bandwidthKbps?: number;
  bidirectional?: boolean;
};

function ensureUniqueIds(nodes: SignalNode[]) {
  const seen = new Set<string>();
  for (const node of nodes) {
    const id = node.id.trim();
    if (!id) throw new Error("Every signal node requires an id.");
    if (seen.has(id)) throw new Error(`Duplicate signal node id: ${id}`);
    seen.add(id);
  }
}

export function createSignalFabricPlan(input: {
  nodes: SignalNode[];
  links: SignalLink[];
  sourceNodeId: string;
  targetNodeId: string;
  payloadType: string;
  requireAcknowledgement?: boolean;
  requireIsolation?: boolean;
}) {
  ensureUniqueIds(input.nodes);
  const nodeIds = new Set(input.nodes.map((node) => node.id));
  if (!nodeIds.has(input.sourceNodeId)) throw new Error("Unknown sourceNodeId.");
  if (!nodeIds.has(input.targetNodeId)) throw new Error("Unknown targetNodeId.");

  for (const link of input.links) {
    if (!nodeIds.has(link.from) || !nodeIds.has(link.to)) {
      throw new Error(`Link references an unknown node: ${link.from} -> ${link.to}`);
    }
  }

  return {
    schema: "jp-hviti-service-bridge-signal-fabric-plan/v1",
    createdAt: new Date().toISOString(),
    sourceNodeId: input.sourceNodeId,
    targetNodeId: input.targetNodeId,
    payloadType: input.payloadType.trim() || "unified-semantic-stream",
    topology: {
      nodeCount: input.nodes.length,
      linkCount: input.links.length,
      nodes: input.nodes,
      links: input.links,
    },
    circuitRail: {
      acceptedElements: [
        "logic-gates",
        "microcontrollers",
        "sensors",
        "actuators",
        "buses",
        "serial-links",
        "digital-signals",
        "analog-signals",
        "power-state-metadata",
      ],
      electricalSimulationPerformed: false,
      physicalSafetyVerified: false,
      automaticHardwareControlAllowed: false,
    },
    networkRail: {
      routeDiscovery: "planned",
      addressing: "node-id-plus-protocol",
      protocolTranslationAllowed: true,
      semanticTranslationAllowed: true,
      loopDetectionRequired: true,
      acknowledgementRequired: input.requireAcknowledgement !== false,
      isolationRequired: input.requireIsolation !== false,
      automaticPacketTransmissionAllowed: false,
    },
    translationRail: [
      "signal-or-language-input",
      "protocol-decode",
      "L4-canonical-meaning",
      "route-selection",
      "protocol-or-language-render",
      "target-delivery-plan",
    ],
    truthBoundary: {
      routeComputed: false,
      packetTransmitted: false,
      circuitEnergized: false,
      deviceControlled: false,
      externalActionCompleted: false,
    },
  };
}
