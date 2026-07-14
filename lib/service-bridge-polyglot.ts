export const featuredPolyglotLanguages = [
  { id: "auto", label: "Auto-detect", kind: "routing", support: "detect" },
  { id: "en", label: "English", kind: "natural", support: "featured" },
  { id: "es", label: "Spanish", kind: "natural", support: "featured" },
  { id: "ja", label: "Japanese", kind: "natural", support: "featured" },
  { id: "nah", label: "Nahuatl", kind: "natural", support: "variant-aware" },
  { id: "huttese", label: "Huttese", kind: "fictional", support: "limited-reference" },
  { id: "code", label: "Programming code", kind: "code", support: "featured" },
] as const;

export type PolyglotLanguageId = string;

export type PolyglotBridgeMode =
  | "language-to-language"
  | "language-to-code"
  | "code-to-language"
  | "code-to-code"
  | "transliterate"
  | "detect"
  | "explain"
  | "repair";

const specialLanguageIds = new Set(["auto", "code", "huttese"]);
const bcp47Like = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/;

function normalizeLanguageId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Language identifier is required.");
  const lowered = trimmed.toLowerCase();
  if (specialLanguageIds.has(lowered)) return lowered;
  if (!bcp47Like.test(trimmed)) {
    throw new Error("Language identifiers must be auto, code, huttese, or a BCP 47-style language tag such as en, es, ja, nah, pt-BR, or zh-Hant.");
  }
  return trimmed;
}

function describeLanguage(id: string, variant?: string) {
  const featured = featuredPolyglotLanguages.find(
    (language) => language.id.toLowerCase() === id.toLowerCase(),
  );
  return {
    id,
    label: featured?.label ?? id,
    kind: featured?.kind ?? "natural",
    support: featured?.support ?? "provider-dependent",
    variant: id.toLowerCase() === "nah" ? variant?.trim() || null : null,
  };
}

export function createPolyglotBridgePlan(input: {
  sourceLanguage: PolyglotLanguageId;
  targetLanguage: PolyglotLanguageId;
  mode: PolyglotBridgeMode;
  content: string;
  codingLanguage?: string;
  languageVariant?: string;
  nahuatlVariant?: string;
  preserveFormatting?: boolean;
  provider?: "internal" | "google-compatible" | "custom";
}) {
  const content = input.content.trim();
  if (!content) throw new Error("Content is required.");

  const sourceLanguage = normalizeLanguageId(input.sourceLanguage || "auto");
  const targetLanguage = normalizeLanguageId(input.targetLanguage || "en");
  const codingLanguage = input.codingLanguage?.trim() || null;
  const variant = input.languageVariant?.trim() || input.nahuatlVariant?.trim() || undefined;

  if ((sourceLanguage === "code" || targetLanguage === "code") && !codingLanguage) {
    throw new Error("codingLanguage is required when code is the source or target.");
  }

  const warnings: string[] = [];
  if ((sourceLanguage.toLowerCase() === "nah" || targetLanguage.toLowerCase() === "nah") && !variant) {
    warnings.push("Nahuatl has multiple living and historical varieties; output should identify uncertainty or request a variant when precision matters.");
  }
  if (sourceLanguage === "huttese" || targetLanguage === "huttese") {
    warnings.push("Huttese is fictional and incompletely documented; output may be a limited-reference rendering rather than a fully reliable translation.");
  }
  if (!featuredPolyglotLanguages.some((language) => language.id.toLowerCase() === sourceLanguage.toLowerCase()) && sourceLanguage !== "auto") {
    warnings.push(`Source language ${sourceLanguage} is accepted through standards-based routing; actual translation quality depends on the connected translation provider.`);
  }
  if (!featuredPolyglotLanguages.some((language) => language.id.toLowerCase() === targetLanguage.toLowerCase()) && targetLanguage !== "auto") {
    warnings.push(`Target language ${targetLanguage} is accepted through standards-based routing; actual translation quality depends on the connected translation provider.`);
  }

  return {
    schema: "jp-hviti-service-bridge-polyglot-plan/v2",
    createdAt: new Date().toISOString(),
    mode: input.mode,
    source: describeLanguage(sourceLanguage, variant),
    target: describeLanguage(targetLanguage, variant),
    codingLanguage,
    provider: input.provider ?? "internal",
    routing: {
      acceptsArbitraryBcp47Tags: true,
      autoDetectionAllowed: true,
      transliterationSupported: true,
      providerFallbackRequiredForUnsupportedPairs: true,
      guaranteedAllLanguageCoverage: false,
    },
    content,
    preserveFormatting: input.preserveFormatting !== false,
    transformationRules: [
      "Preserve meaning before style.",
      "Preserve code blocks, identifiers, paths, commands, and structured data unless repair or code conversion is explicitly requested.",
      "Return uncertainty explicitly for ambiguous, fictional, historical, low-resource, or variant-sensitive language.",
      "Do not claim execution, compilation, deployment, or external delivery from translation alone.",
      "Keep user-authored names and project terms unchanged unless a transliteration is specifically requested.",
      "Use standards-based language tags so regional and script variants can route independently.",
    ],
    warnings,
    resultGenerated: false,
    codeExecuted: false,
    externalActionCompleted: false as const,
  };
}
