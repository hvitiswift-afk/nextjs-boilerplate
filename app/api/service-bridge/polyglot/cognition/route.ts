import { NextRequest, NextResponse } from "next/server";

import {
  createSyntheticCognitionMesh,
  type CognitionSource,
} from "@/lib/service-bridge-synthetic-cognition";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-synthetic-cognition-capabilities/v1",
    role: "fiction-inspired synthetic cognition planning over authorized data sources",
    sourceKinds: [
      "language",
      "code",
      "sensor",
      "camera",
      "document",
      "network",
      "circuit",
      "modem",
      "location",
      "memory",
      "user-input",
      "unknown",
    ],
    rails: [
      "authorized-source-intake",
      "provenance",
      "L4-normalization",
      "polyglot-fusion",
      "confidence-analysis",
      "bounded-memory",
      "V#-AR-rendering",
      "human-review",
    ],
    universalDataAccessAllowed: false,
    massSurveillanceAllowed: false,
    consciousnessClaimed: false,
    sentienceClaimed: false,
    dataIngested: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createSyntheticCognitionMesh({
      meshId: String(payload?.meshId ?? ""),
      sources: Array.isArray(payload?.sources)
        ? (payload.sources as CognitionSource[])
        : [],
      purpose: String(payload?.purpose ?? ""),
      confirmation: String(payload?.confirmation ?? ""),
      allowCrossSourceFusion: payload?.allowCrossSourceFusion === true,
      allowPersistentMemory: payload?.allowPersistentMemory === true,
      allowExternalStreaming: payload?.allowExternalStreaming === true,
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid synthetic cognition request.",
        authorizationReceiptCreated: false,
        dataIngested: false,
        sourcesAccessed: false,
        cognitionExecuted: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
