export type ModemMedium =
  | "copper"
  | "fiber"
  | "cellular"
  | "wifi"
  | "radio"
  | "satellite"
  | "acoustic"
  | "optical"
  | "virtual";

export type ModulationScheme =
  | "FSK"
  | "PSK"
  | "QPSK"
  | "QAM"
  | "OFDM"
  | "ASK"
  | "PCM"
  | "CUSTOM";

export function createModemPlan(input: {
  modemId: string;
  sourceNodeId: string;
  targetNodeId: string;
  medium: ModemMedium;
  modulation: ModulationScheme;
  symbolRate?: number;
  carrierFrequencyHz?: number;
  duplex?: "simplex" | "half-duplex" | "full-duplex";
  framing?: string;
  errorCorrection?: string[];
  encryption?: string;
  payloadType?: string;
}) {
  const modemId = input.modemId.trim();
  const sourceNodeId = input.sourceNodeId.trim();
  const targetNodeId = input.targetNodeId.trim();
  if (!modemId || !sourceNodeId || !targetNodeId) {
    throw new Error("modemId, sourceNodeId, and targetNodeId are required.");
  }
  if (input.symbolRate !== undefined && input.symbolRate <= 0) {
    throw new Error("symbolRate must be positive.");
  }
  if (input.carrierFrequencyHz !== undefined && input.carrierFrequencyHz <= 0) {
    throw new Error("carrierFrequencyHz must be positive.");
  }

  return {
    schema: "jp-hviti-service-bridge-modem-plan/v1",
    createdAt: new Date().toISOString(),
    modem: {
      id: modemId,
      role: "modulator-demodulator",
      sourceNodeId,
      targetNodeId,
      medium: input.medium,
      modulation: input.modulation,
      duplex: input.duplex ?? "full-duplex",
      symbolRate: input.symbolRate ?? null,
      carrierFrequencyHz: input.carrierFrequencyHz ?? null,
      framing: input.framing?.trim() || "L4-semantic-frame/v1",
      errorCorrection: input.errorCorrection ?? ["CRC", "retry-with-acknowledgement"],
      encryption: input.encryption?.trim() || null,
      payloadType: input.payloadType?.trim() || "unified-semantic-stream",
    },
    transmitRail: [
      "L4-semantic-stream",
      "serialize",
      "frame",
      "error-protect",
      "optionally-encrypt",
      "modulate",
      "medium-interface",
    ],
    receiveRail: [
      "medium-interface",
      "demodulate",
      "decrypt-if-configured",
      "error-check-and-correct",
      "deframe",
      "deserialize",
      "L4-semantic-stream",
    ],
    routingIntegration: {
      signalFabricCompatible: true,
      protocolTranslationAllowed: true,
      semanticRoutingAllowed: true,
      acknowledgementSupported: true,
      routeFailoverSupported: true,
      automaticCarrierTransmissionAllowed: false,
    },
    truthBoundary: {
      waveformGenerated: false,
      carrierActivated: false,
      signalTransmitted: false,
      spectrumComplianceVerified: false,
      hardwareConfigured: false,
      externalActionCompleted: false,
    },
  };
}
