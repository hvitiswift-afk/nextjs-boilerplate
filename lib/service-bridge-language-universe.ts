export const LANGUAGE_CUBE_EDGE = 7;
export const LANGUAGE_CUBE_CAPACITY = LANGUAGE_CUBE_EDGE ** 3;

export type LanguageUniverseKind =
  | "natural"
  | "signed"
  | "constructed"
  | "fictional"
  | "historical"
  | "liturgical"
  | "code"
  | "symbolic"
  | "unknown";

export type LanguageUniverseEntry = {
  id: string;
  label?: string;
  kind: LanguageUniverseKind;
  aliases?: string[];
  scripts?: string[];
  regions?: string[];
  variants?: string[];
  source?: "bcp47" | "iso639" | "custom" | "user";
};

export type LanguageCubeCoordinate = {
  x: number;
  y: number;
  z: number;
  index: number;
  ring: number;
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mapLanguageToUniverse(languageId: string): LanguageCubeCoordinate {
  const normalized = languageId.trim().toLowerCase();
  if (!normalized) throw new Error("languageId is required.");

  const hash = stableHash(normalized);
  const index = hash % LANGUAGE_CUBE_CAPACITY;
  const x = index % LANGUAGE_CUBE_EDGE;
  const y = Math.floor(index / LANGUAGE_CUBE_EDGE) % LANGUAGE_CUBE_EDGE;
  const z = Math.floor(index / (LANGUAGE_CUBE_EDGE ** 2)) % LANGUAGE_CUBE_EDGE;
  const ring = Math.floor(hash / LANGUAGE_CUBE_CAPACITY);

  return { x, y, z, index, ring };
}

export function createLanguageUniverseRoute(input: {
  sourceLanguage: string;
  targetLanguage: string;
  sourceKind?: LanguageUniverseKind;
  targetKind?: LanguageUniverseKind;
  sourceVariant?: string;
  targetVariant?: string;
  allowProviderCascade?: boolean;
}) {
  const sourceLanguage = input.sourceLanguage.trim();
  const targetLanguage = input.targetLanguage.trim();
  if (!sourceLanguage || !targetLanguage) {
    throw new Error("sourceLanguage and targetLanguage are required.");
  }

  const sourceCoordinate = mapLanguageToUniverse(sourceLanguage);
  const targetCoordinate = mapLanguageToUniverse(targetLanguage);

  return {
    schema: "jp-hviti-service-bridge-language-universe-route/v1",
    createdAt: new Date().toISOString(),
    architecture: {
      seedCube: "7x7x7",
      seedCapacity: LANGUAGE_CUBE_CAPACITY,
      beyond343: true,
      overflowModel: "unbounded-rings-over-stable-343-coordinate-space",
      collisionHandling: "coordinate-plus-ring-plus-language-id",
      universalIntakeAllowed: true,
      universalTranslationGuaranteed: false,
    },
    source: {
      id: sourceLanguage,
      kind: input.sourceKind ?? "unknown",
      variant: input.sourceVariant?.trim() || null,
      coordinate: sourceCoordinate,
    },
    target: {
      id: targetLanguage,
      kind: input.targetKind ?? "unknown",
      variant: input.targetVariant?.trim() || null,
      coordinate: targetCoordinate,
    },
    routing: {
      directPairPreferred: true,
      pivotLanguageAllowed: true,
      transliterationFallbackAllowed: true,
      glossaryFallbackAllowed: true,
      humanReviewFallbackAllowed: true,
      providerCascadeAllowed: input.allowProviderCascade !== false,
      lowResourceModeAllowed: true,
      unknownLanguageIntakeAllowed: true,
    },
    truthBoundary: {
      allLanguageIdentifiersAcceptedForRouting: true,
      everyLanguagePairGuaranteedAccurate: false,
      undocumentedLanguageKnowledgeClaimed: false,
      fictionalLanguageFluencyGuaranteed: false,
      extinctLanguageCompletenessGuaranteed: false,
    },
    resultGenerated: false,
    externalActionCompleted: false as const,
  };
}
