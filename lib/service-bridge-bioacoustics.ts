export type BioacousticSourceKind =
  | "human-voice"
  | "animal-vocalization"
  | "insect-signal"
  | "marine-signal"
  | "environmental-soundscape"
  | "ultrasonic"
  | "infrasonic"
  | "device-audio"
  | "unknown-biological-signal";

export type BioacousticWindow = {
  startMs: number;
  endMs: number;
  label?: string;
};

export function createBioacousticPlan(input: {
  sessionId: string;
  sourceKind: BioacousticSourceKind;
  sourceDescription: string;
  sampleRateHz?: number;
  channels?: number;
  frequencyRangeHz?: { min: number; max: number };
  windows?: BioacousticWindow[];
  targetTasks?: string[];
  speciesHint?: string;
  languageHint?: string;
  localProcessingOnly?: boolean;
  retainDerivedFeatures?: boolean;
  confirmation: string;
}) {
  const sessionId = input.sessionId.trim();
  const sourceDescription = input.sourceDescription.trim();
  if (!sessionId || !sourceDescription) {
    throw new Error("sessionId and sourceDescription are required.");
  }

  const expectedConfirmation = `AUTHORIZE BIOACOUSTIC SESSION ${sessionId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const sampleRateHz = input.sampleRateHz ?? 48000;
  const channels = input.channels ?? 1;
  if (!Number.isFinite(sampleRateHz) || sampleRateHz < 1000 || sampleRateHz > 768000) {
    throw new Error("sampleRateHz must be between 1000 and 768000.");
  }
  if (!Number.isInteger(channels) || channels < 1 || channels > 64) {
    throw new Error("channels must be an integer between 1 and 64.");
  }

  const frequencyRangeHz = input.frequencyRangeHz ?? {
    min: 0,
    max: sampleRateHz / 2,
  };
  if (
    frequencyRangeHz.min < 0 ||
    frequencyRangeHz.max <= frequencyRangeHz.min ||
    frequencyRangeHz.max > sampleRateHz / 2
  ) {
    throw new Error("frequencyRangeHz must fit inside the Nyquist range.");
  }

  const windows = input.windows ?? [];
  for (const window of windows) {
    if (window.startMs < 0 || window.endMs <= window.startMs) {
      throw new Error("Each bioacoustic window requires 0 <= startMs < endMs.");
    }
  }

  return {
    schema: "jp-hviti-service-bridge-bioacoustic-plan/v1",
    createdAt: new Date().toISOString(),
    sessionId,
    source: {
      kind: input.sourceKind,
      description: sourceDescription,
      sampleRateHz,
      channels,
      frequencyRangeHz,
      speciesHint: input.speciesHint?.trim() || null,
      languageHint: input.languageHint?.trim() || null,
    },
    analysis: {
      windows,
      targetTasks: input.targetTasks ?? [
        "event-detection",
        "spectral-feature-extraction",
        "rhythm-and-temporal-pattern-analysis",
        "call-cluster-analysis",
        "source-separation-plan",
        "L4-semantic-candidate-mapping",
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
      localProcessingOnly: input.localProcessingOnly !== false,
      retainDerivedFeatures: input.retainDerivedFeatures === true,
    },
    integration: {
      scannerCompatible: true,
      modemCompatible: true,
      signalFabricCompatible: true,
      polyglotL4Compatible: true,
      ARCompatible: true,
      VSharpCompatible: true,
      cognitionMeshCompatible: true,
    },
    interpretationBoundary: {
      communicationHypothesisAllowed: true,
      languageClaimRequiresIndependentEvidence: true,
      speciesIdentificationGuaranteed: false,
      emotionalStateInferredAsFact: false,
      alienOrUnknownSignalDecoded: false,
      humanSpeechTranscriptionGenerated: false,
    },
    privacyAndSafety: {
      covertRecordingAllowed: false,
      privateConversationInterceptionAllowed: false,
      biometricVoiceIdentificationAllowed: false,
      wildlifeDisturbanceAllowed: false,
      activeAcousticTransmissionAllowed: false,
      automaticExternalStreamingAllowed: false,
    },
    truthBoundary: {
      microphoneAccessed: false,
      audioCaptured: false,
      spectrumAnalyzed: false,
      speciesClassified: false,
      semanticMeaningDetermined: false,
      resultsStored: false,
      externalActionCompleted: false,
    },
  };
}
