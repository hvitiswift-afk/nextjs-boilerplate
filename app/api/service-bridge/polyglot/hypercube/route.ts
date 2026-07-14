import { NextRequest, NextResponse } from "next/server";

import {
  buildHyperLanguageCube,
  HYPER_LANGUAGE_EDGE,
  HYPER_LANGUAGE_POINTS,
  type HyperLanguageEntry,
} from "@/lib/service-bridge-hyper-language-cube";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-hyper-language-cube-capabilities/v1",
    edge: HYPER_LANGUAGE_EDGE,
    pointCount: HYPER_LANGUAGE_POINTS,
    layers: [
      "sub-language",
      "language",
      "polyglot",
      "super-language",
      "hyper-language",
    ],
    jumpModes: [
      "hyper-leap",
      "hyper-jump",
      "polyglot-bridge",
      "sub-language-descent",
      "super-language-ascent",
      "hyper-language-ascent",
    ],
    multipleLanguagesPerPointAllowed: true,
    repeatedLanguagePlacementAllowed: true,
    everyPointFillSupported: true,
    mappingGenerated: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = buildHyperLanguageCube({
      languages: Array.isArray(payload?.languages)
        ? (payload.languages as HyperLanguageEntry[])
        : [],
      repetitionsPerLanguage:
        typeof payload?.repetitionsPerLanguage === "number"
          ? payload.repetitionsPerLanguage
          : 3,
      fillEveryPoint: payload?.fillEveryPoint !== false,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid hyper-language cube request.",
        mappingGenerated: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
