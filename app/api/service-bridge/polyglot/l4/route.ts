import { NextRequest, NextResponse } from "next/server";

import {
  createL4UnifiedStream,
  type L4Intent,
  type L4OriginKind,
  type L4SemanticUnit,
} from "@/lib/service-bridge-polyglot-l4";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polyglot-l4-capabilities/v1",
    level: "L4",
    canonicalFormat: "meaning-first-thought-capable-code",
    acceptedOrigins: [
      "human-language",
      "signed-language",
      "programming-language",
      "mathematical-notation",
      "symbolic-system",
      "constructed-language",
      "fictional-language",
      "machine-protocol",
      "unknown-signal",
      "hypothetical-nonhuman-signal",
    ],
    rails: [
      "source-to-canonical-meaning",
      "canonical-meaning-to-human-language",
      "canonical-meaning-to-code-language",
      "canonical-meaning-to-symbolic-rendering",
      "V#-visual-semantic-alignment",
      "round-trip-provenance-verification",
    ],
    universalIntakeAllowed: true,
    guaranteedUniversalDecoding: false,
    alienLanguageFluencyClaimed: false,
    resultGenerated: false,
    codeExecuted: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const stream = createL4UnifiedStream({
      sourceId: String(payload?.sourceId ?? ""),
      sourceKind: String(payload?.sourceKind ?? "unknown-signal") as L4OriginKind,
      content: String(payload?.content ?? ""),
      intent: payload?.intent as L4Intent | undefined,
      semanticUnits: Array.isArray(payload?.semanticUnits)
        ? (payload.semanticUnits as L4SemanticUnit[])
        : undefined,
      targetIds: Array.isArray(payload?.targetIds)
        ? payload.targetIds.map((value: unknown) => String(value))
        : undefined,
      preserveAmbiguity: payload?.preserveAmbiguity !== false,
    });

    return NextResponse.json(stream);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid L4 unified-stream request.",
        resultGenerated: false,
        codeExecuted: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
