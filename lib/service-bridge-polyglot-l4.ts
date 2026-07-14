export type L4OriginKind =
  | "human-language"
  | "signed-language"
  | "programming-language"
  | "mathematical-notation"
  | "symbolic-system"
  | "constructed-language"
  | "fictional-language"
  | "machine-protocol"
  | "unknown-signal"
  | "hypothetical-nonhuman-signal";

export type L4Intent = {
  actor?: string;
  action: string;
  target?: string;
  constraints?: string[];
  evidence?: string[];
  uncertainty?: string[];
};

export type L4SemanticUnit = {
  id: string;
  concept: string;
  role: "actor" | "action" | "target" | "constraint" | "evidence" | "context" | "unknown";
  confidence: number;
  sourceSpan?: string;
};

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function createL4UnifiedStream(input: {
  sourceId: string;
  sourceKind: L4OriginKind;
  content: string;
  intent?: L4Intent;
  semanticUnits?: L4SemanticUnit[];
  targetIds?: string[];
  preserveAmbiguity?: boolean;
}) {
  const sourceId = input.sourceId.trim();
  const content = input.content.trim();
  if (!sourceId) throw new Error("sourceId is required.");
  if (!content) throw new Error("content is required.");

  const semanticUnits = (input.semanticUnits ?? []).map((unit) => ({
    ...unit,
    id: unit.id.trim(),
    concept: unit.concept.trim(),
    confidence: clampConfidence(unit.confidence),
  }));

  const targetIds = Array.from(
    new Set((input.targetIds ?? ["unified-thought-code"]).map((value) => value.trim()).filter(Boolean)),
  );

  return {
    schema: "jp-hviti-service-bridge-polyglot-l4-stream/v1",
    level: "L4",
    createdAt: new Date().toISOString(),
    source: {
      id: sourceId,
      kind: input.sourceKind,
      content,
    },
    canonicalStream: {
      format: "meaning-first-thought-capable-code",
      representation: {
        intent: input.intent ?? null,
        semanticUnits,
        unresolvedAmbiguity: input.preserveAmbiguity === false ? [] : [
          "Unknown terms remain explicit rather than being silently invented.",
          "Culture-specific meaning remains attached to source context.",
          "Nonhuman or hypothetical signals remain unverified until a decoding basis exists.",
        ],
      },
      reversible: true,
      provenancePreserved: true,
      sourceLanguageErased: false,
    },
    targets: targetIds.map((id) => ({
      id,
      status: "planned",
      renderingGenerated: false,
    })),
    VSharp: {
      enabled: true,
      role: "visual-semantic alignment and reversible rendering rail",
      automaticMeaningOverrideAllowed: false,
    },
    safeguards: {
      preserveHumanMeaning: true,
      preserveNamesAndIdentity: true,
      preserveCulturalContext: true,
      preserveCodeSemantics: true,
      silentHallucinationAllowed: false,
      unknownSignalFabricationAllowed: false,
      alienLanguageFluencyClaimed: false,
      everyLanguageAccuracyGuaranteed: false,
    },
    resultGenerated: false,
    codeExecuted: false,
    externalActionCompleted: false as const,
  };
}
