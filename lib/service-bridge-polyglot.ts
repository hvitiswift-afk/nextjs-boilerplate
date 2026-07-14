export const polyglotLanguages = [
  { id: "auto", label: "Auto-detect", kind: "routing", support: "detect" },
  { id: "en", label: "English", kind: "natural", support: "full" },
  { id: "es", label: "Spanish", kind: "natural", support: "full" },
  { id: "ja", label: "Japanese", kind: "natural", support: "full" },
  { id: "nah", label: "Nahuatl", kind: "natural", support: "variant-aware" },
  { id: "huttese", label: "Huttese", kind: "fictional", support: "limited-reference" },
  { id: "code", label: "Programming code", kind: "code", support: "full" },
] as const;

export type PolyglotLanguageId = (typeof polyglotLanguages)[number]["id"];

export type PolyglotBridgeMode =
  | "language-to-language"
  | "language-to-code"
  | "code-to-language"
  | "code-to-code"
  | "explain"
  | "repair";

export function createPolyglotBridgePlan(input: {
  sourceLanguage: PolyglotLanguageId;
  targetLanguage: PolyglotLanguageId;
  mode: PolyglotBridgeMode;
  content: string;
  codingLanguage?: string;
  nahuatlVariant?: string;
  preserveFormatting?: boolean;
}) {
  const content = input.content.trim();
  if (!content) throw new Error("Content is required.");
  if (!polyglotLanguages.some((language) => language.id === input.sourceLanguage)) {
    throw new Error("Unsupported source language.");
  }
  if (!polyglotLanguages.some((language) => language.id === input.targetLanguage)) {
    throw new Error("Unsupported target language.");
  }
  if ((input.sourceLanguage === "code" || input.targetLanguage === "code") && !input.codingLanguage?.trim()) {
    throw new Error("codingLanguage is required when code is the source or target.");
  }

  const warnings: string[] = [];
  if ((input.sourceLanguage === "nah" || input.targetLanguage === "nah") && !input.nahuatlVariant?.trim()) {
    warnings.push("Nahuatl has multiple living and historical varieties; output should identify uncertainty or request a variant when precision matters.");
  }
  if (input.sourceLanguage === "huttese" || input.targetLanguage === "huttese") {
    warnings.push("Huttese is fictional and incompletely documented; output may be a limited-reference rendering rather than a fully reliable translation.");
  }

  const source = polyglotLanguages.find((language) => language.id === input.sourceLanguage)!;
  const target = polyglotLanguages.find((language) => language.id === input.targetLanguage)!;

  return {
    schema: "jp-hviti-service-bridge-polyglot-plan/v1",
    createdAt: new Date().toISOString(),
    mode: input.mode,
    source: {
      id: source.id,
      label: source.label,
      kind: source.kind,
      variant: source.id === "nah" ? input.nahuatlVariant?.trim() || null : null,
    },
    target: {
      id: target.id,
      label: target.label,
      kind: target.kind,
      variant: target.id === "nah" ? input.nahuatlVariant?.trim() || null : null,
    },
    codingLanguage: input.codingLanguage?.trim() || null,
    content,
    preserveFormatting: input.preserveFormatting !== false,
    transformationRules: [
      "Preserve meaning before style.",
      "Preserve code blocks, identifiers, paths, commands, and structured data unless repair or code conversion is explicitly requested.",
      "Return uncertainty explicitly for ambiguous, fictional, historical, or variant-sensitive language.",
      "Do not claim execution, compilation, deployment, or external delivery from translation alone.",
      "Keep user-authored names and project terms unchanged unless a transliteration is specifically requested.",
    ],
    warnings,
    resultGenerated: false,
    codeExecuted: false,
    externalActionCompleted: false as const,
  };
}
