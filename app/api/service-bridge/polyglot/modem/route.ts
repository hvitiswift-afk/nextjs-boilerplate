import { NextRequest, NextResponse } from "next/server";

import {
  createModemPlan,
  type ModemMedium,
  type ModulationScheme,
} from "@/lib/service-bridge-modem";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-modem-capabilities/v1",
    role: "modulator-demodulator for Polyglot L4 and Signal Fabric",
    media: [
      "copper",
      "fiber",
      "cellular",
      "wifi",
      "radio",
      "satellite",
      "acoustic",
      "optical",
      "virtual",
    ],
    modulationSchemes: ["FSK", "PSK", "QPSK", "QAM", "OFDM", "ASK", "PCM", "CUSTOM"],
    rails: [
      "semantic-stream-to-waveform-plan",
      "waveform-to-semantic-stream-plan",
      "framing",
      "error-correction",
      "optional-encryption",
      "acknowledgement",
      "routing-failover",
    ],
    automaticCarrierTransmissionAllowed: false,
    spectrumComplianceVerified: false,
    hardwareConfigured: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createModemPlan({
      modemId: String(payload?.modemId ?? ""),
      sourceNodeId: String(payload?.sourceNodeId ?? ""),
      targetNodeId: String(payload?.targetNodeId ?? ""),
      medium: String(payload?.medium ?? "virtual") as ModemMedium,
      modulation: String(payload?.modulation ?? "OFDM") as ModulationScheme,
      symbolRate:
        typeof payload?.symbolRate === "number" ? payload.symbolRate : undefined,
      carrierFrequencyHz:
        typeof payload?.carrierFrequencyHz === "number"
          ? payload.carrierFrequencyHz
          : undefined,
      duplex:
        payload?.duplex === "simplex" || payload?.duplex === "half-duplex"
          ? payload.duplex
          : "full-duplex",
      framing: typeof payload?.framing === "string" ? payload.framing : undefined,
      errorCorrection: Array.isArray(payload?.errorCorrection)
        ? payload.errorCorrection.map((value: unknown) => String(value))
        : undefined,
      encryption:
        typeof payload?.encryption === "string" ? payload.encryption : undefined,
      payloadType:
        typeof payload?.payloadType === "string" ? payload.payloadType : undefined,
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid modem request.",
        waveformGenerated: false,
        carrierActivated: false,
        signalTransmitted: false,
        hardwareConfigured: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
