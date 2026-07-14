import { NextRequest, NextResponse } from "next/server";

import {
  createPolyglotBridgePlan,
  polyglotLanguages,
  type PolyglotBridgeMode,
  type PolyglotLanguageId,
} from "@/lib/service-bridge-polyglot";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polyglot-capabilities/v1",
    languages: polyglotLanguages,
    modes: [
      "language-to-language",
      "language-to-code",
      "code-to-language",
      "code-to-code",
      "explain",
      "repair",
    ],
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
      nahuatlVariant:
        typeof payload?.nahuatlVariant === "string" ? payload.nahuatlVariant : undefined,
      preserveFormatting: payload?.preserveFormatting !== false,
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
