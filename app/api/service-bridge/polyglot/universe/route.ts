import { NextRequest, NextResponse } from "next/server";

import {
  createLanguageUniverseRoute,
  LANGUAGE_CUBE_CAPACITY,
  LANGUAGE_CUBE_EDGE,
  type LanguageUniverseKind,
} from "@/lib/service-bridge-language-universe";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-language-universe-capabilities/v1",
    seedCube: {
      edge: LANGUAGE_CUBE_EDGE,
      capacity: LANGUAGE_CUBE_CAPACITY,
    },
    beyond343: true,
    overflowModel: "unbounded-rings-over-stable-343-coordinate-space",
    acceptedKinds: [
      "natural",
      "signed",
      "constructed",
      "fictional",
      "historical",
      "liturgical",
      "code",
      "symbolic",
      "unknown",
    ],
    universalIntakeAllowed: true,
    universalTranslationGuaranteed: false,
    resultGenerated: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const route = createLanguageUniverseRoute({
      sourceLanguage: String(payload?.sourceLanguage ?? ""),
      targetLanguage: String(payload?.targetLanguage ?? ""),
      sourceKind: String(payload?.sourceKind ?? "unknown") as LanguageUniverseKind,
      targetKind: String(payload?.targetKind ?? "unknown") as LanguageUniverseKind,
      sourceVariant:
        typeof payload?.sourceVariant === "string" ? payload.sourceVariant : undefined,
      targetVariant:
        typeof payload?.targetVariant === "string" ? payload.targetVariant : undefined,
      allowProviderCascade: payload?.allowProviderCascade !== false,
    });
    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid language-universe request.",
        resultGenerated: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
