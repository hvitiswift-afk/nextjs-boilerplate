import { NextRequest, NextResponse } from "next/server";

import {
  createHyperLanguageRoute,
  type HyperMoveMode,
} from "@/lib/service-bridge-hyper-language-routing";
import type { HyperCubePoint } from "@/lib/service-bridge-hyper-language-cube";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-hyper-language-route-capabilities/v1",
    modes: [
      "adjacent-step",
      "polyglot-bridge",
      "hyper-leap",
      "hyper-jump",
      "sub-language-descent",
      "super-language-ascent",
      "hyper-language-ascent",
    ],
    requiredCubePoints: 343,
    routePlanned: false,
    translationGenerated: false,
    signalTransmitted: false,
    hyperJumpPhysicallyPerformed: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = createHyperLanguageRoute({
      cube: Array.isArray(payload?.cube) ? (payload.cube as HyperCubePoint[]) : [],
      sourcePoint: Number(payload?.sourcePoint ?? 0),
      targetPoint:
        typeof payload?.targetPoint === "number" ? payload.targetPoint : undefined,
      sourceLanguageId:
        typeof payload?.sourceLanguageId === "string"
          ? payload.sourceLanguageId
          : undefined,
      targetLanguageId:
        typeof payload?.targetLanguageId === "string"
          ? payload.targetLanguageId
          : undefined,
      mode: String(payload?.mode ?? "polyglot-bridge") as HyperMoveMode,
      maxHops: typeof payload?.maxHops === "number" ? payload.maxHops : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid hyper-language route request.",
        routePlanned: false,
        translationGenerated: false,
        signalTransmitted: false,
        hyperJumpPhysicallyPerformed: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
