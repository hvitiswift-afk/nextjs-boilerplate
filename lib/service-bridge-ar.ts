export type ARAnchorKind =
  | "world"
  | "image"
  | "object"
  | "plane"
  | "location"
  | "device"
  | "network-node"
  | "circuit-node"
  | "semantic-concept";

export type AROverlayKind =
  | "label"
  | "translation"
  | "code"
  | "circuit"
  | "network-route"
  | "signal"
  | "instruction"
  | "status"
  | "warning"
  | "V#-visual";

export type ARAnchor = {
  id: string;
  kind: ARAnchorKind;
  reference: string;
  confidence?: number;
};

export type AROverlay = {
  id: string;
  kind: AROverlayKind;
  anchorId: string;
  content: string;
  language?: string;
  priority?: number;
};

export function createARPlan(input: {
  sessionId: string;
  anchors: ARAnchor[];
  overlays: AROverlay[];
  sourceLanguage?: string;
  targetLanguage?: string;
  includeCircuitLayer?: boolean;
  includeNetworkLayer?: boolean;
  includeModemLayer?: boolean;
  includeVSharpLayer?: boolean;
}) {
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("sessionId is required.");

  const anchorIds = new Set<string>();
  for (const anchor of input.anchors) {
    const id = anchor.id.trim();
    if (!id) throw new Error("Every AR anchor requires an id.");
    if (anchorIds.has(id)) throw new Error(`Duplicate AR anchor id: ${id}`);
    anchorIds.add(id);
  }

  for (const overlay of input.overlays) {
    if (!anchorIds.has(overlay.anchorId)) {
      throw new Error(`Overlay references unknown anchor: ${overlay.anchorId}`);
    }
  }

  return {
    schema: "jp-hviti-service-bridge-ar-plan/v1",
    createdAt: new Date().toISOString(),
    sessionId,
    languageRail: {
      sourceLanguage: input.sourceLanguage?.trim() || "auto",
      targetLanguage: input.targetLanguage?.trim() || "en",
      polyglotL4Compatible: true,
      liveTranslationPlanned: true,
      generatedTranslationAvailable: false,
    },
    scene: {
      anchors: input.anchors,
      overlays: input.overlays,
      anchorCount: input.anchors.length,
      overlayCount: input.overlays.length,
    },
    layers: {
      semantic: true,
      circuit: input.includeCircuitLayer !== false,
      network: input.includeNetworkLayer !== false,
      modem: input.includeModemLayer !== false,
      VSharp: input.includeVSharpLayer !== false,
    },
    rails: [
      "camera-or-sensor-input",
      "anchor-detection",
      "L4-semantic-decode",
      "language-code-signal-translation",
      "circuit-network-modem-context",
      "V#-visual-alignment",
      "AR-overlay-plan",
      "round-trip-verification",
    ],
    privacy: {
      biometricIdentificationAllowed: false,
      silentRecordingAllowed: false,
      locationSharingRequiredByPlan: false,
      externalStreamingAllowed: false,
    },
    truthBoundary: {
      cameraAccessed: false,
      environmentScanned: false,
      overlayRendered: false,
      deviceControlled: false,
      networkPacketTransmitted: false,
      circuitEnergized: false,
      externalActionCompleted: false,
    },
  };
}
