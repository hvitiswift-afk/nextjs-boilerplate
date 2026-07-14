import { NextRequest, NextResponse } from "next/server";

import {
  createBioacousticPlan,
  type BioacousticSourceKind,
  type BioacousticWindow,
} from "@/lib/service-bridge-bioacoustics";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-bioacoustic-capabilities/v1",
    role: "permission-gated bioacoustic analysis planning for Polyglot L4, scanner, modem, signal fabric, AR, V#, and cognition mesh",
    sourceKinds: [
      "human-voice",
      "animal-vocalization",
      "insect-signal",
      "marine-signal",
      "environmental-soundscape",
      "ultrasonic",
      "infrasonic",
      "device-audio",
      "unknown-biological-signal",
    ],
    featureFamilies: [
      "waveform",
      "spectrogram",
      "mel-spectrogram",
      "MFCC",
      "pitch",
      "harmonics",
      "energy",
      "duration",
      "interval-patterns",
      "spatial-cues",
    ],
    exactConfirmation: "AUTHORIZE BIOACOUSTIC SESSION <session-id>",
    covertRecordingAllowed: false,
    biometricVoiceIdentificationAllowed: false,
    activeAcousticTransmissionAllowed: false,
    microphoneAccessed: false,
    audioCaptured: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createBioacousticPlan({
      sessionId: String(payload?.sessionId ?? ""),
      sourceKind: String(
        payload?.sourceKind ?? "unknown-biological-signal",
      ) as BioacousticSourceKind,
      sourceDescription: String(payload?.sourceDescription ?? ""),
      sampleRateHz:
        typeof payload?.sampleRateHz === "number" ? payload.sampleRateHz : undefined,
      channels:
        typeof payload?.channels === "number" ? payload.channels : undefined,
      frequencyRangeHz:
        payload?.frequencyRangeHz &&
        typeof payload.frequencyRangeHz.min === "number" &&
        typeof payload.frequencyRangeHz.max === "number"
          ? payload.frequencyRangeHz
          : undefined,
      windows: Array.isArray(payload?.windows)
        ? (payload.windows as BioacousticWindow[])
        : undefined,
      targetTasks: Array.isArray(payload?.targetTasks)
        ? payload.targetTasks.map((value: unknown) => String(value))
        : undefined,
      speciesHint:
        typeof payload?.speciesHint === "string" ? payload.speciesHint : undefined,
      languageHint:
        typeof payload?.languageHint === "string" ? payload.languageHint : undefined,
      localProcessingOnly: payload?.localProcessingOnly !== false,
      retainDerivedFeatures: payload?.retainDerivedFeatures === true,
      confirmation: String(payload?.confirmation ?? ""),
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid bioacoustic request.",
        microphoneAccessed: false,
        audioCaptured: false,
        spectrumAnalyzed: false,
        semanticMeaningDetermined: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
