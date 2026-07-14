import { NextRequest, NextResponse } from "next/server";

import {
  createPolyglotBridgePlan,
  featuredPolyglotLanguages,
  type PolyglotBridgeMode,
  type PolyglotLanguageId,
} from "@/lib/service-bridge-polyglot";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polyglot-capabilities/v2",
    featuredLanguages: featuredPolyglotLanguages,
    acceptsArbitraryBcp47Tags: true,
    examples: ["en", "es", "ja", "nah", "pt-BR", "zh-Hant", "ar", "sw", "iu", "huttese", "code"],
    modes: [
      "language-to-language",
      "language-to-code",
      "code-to-language",
      "code-to-code",
      "transliterate",
      "detect",
      "explain",
      "repair",
    ],
    providerModel: {
      internalPlanningAvailable: true,
      externalProviderAdapterSupported: true,
      googleCompatibleRoutingConcept: true,
      guaranteedAllLanguageCoverage: false,
    },
    resultGenerated: false,
    codeExecuted: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createPolyglotBridgePlan({
      sourceLanguage: String(payload?.sourceLanguage ?? "auto") as PolyglotLanguageId,
      targetLanguage: String(payload?.targetLanguage ?? "en") as PolyglotLanguageId,
      mode: String(payload?.mode ?? "language-to-language") as PolyglotBridgeMode,
      content: String(payload?.content ?? ""),
      codingLanguage:
        typeof payload?.codingLanguage === "string" ? payload.codingLanguage : undefined,
      languageVariant:
        typeof payload?.languageVariant === "string" ? payload.languageVariant : undefined,
      nahuatlVariant:
        typeof payload?.nahuatlVariant === "string" ? payload.nahuatlVariant : undefined,
      preserveFormatting: payload?.preserveFormatting !== false,
      provider:
        payload?.provider === "google-compatible" || payload?.provider === "custom"
          ? payload.provider
          : "internal",
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid polyglot bridge request.",
        resultGenerated: false,
        codeExecuted: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
