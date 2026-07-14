import { NextRequest, NextResponse } from "next/server";

import {
  createPolystructurePlan,
  type CircuitReadInput,
  type PolyphonicVoice,
  type PolyrhythmVoice,
  type PolytopeDefinition,
} from "@/lib/service-bridge-polystructure";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-polystructure-capabilities/v1",
    role: "circuit bank, circuit read, circuitry, polytopes, polyrhythms, and polyphony planning",
    domains: [
      "circuits",
      "circuitry",
      "circuit-read",
      "component-bank",
      "polytopes",
      "polyrhythms",
      "polyphony",
    ],
    exactConfirmation: "BUILD POLYSTRUCTURE BANK <bank-id>",
    externalFinancialBank: false,
    circuitPowered: false,
    electricalSimulationPerformed: false,
    audioRendered: false,
    geometryRendered: false,
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createPolystructurePlan({
      bankId: String(payload?.bankId ?? ""),
      circuit: payload?.circuit as CircuitReadInput | undefined,
      polytopes: Array.isArray(payload?.polytopes)
        ? (payload.polytopes as PolytopeDefinition[])
        : undefined,
      polyrhythms: Array.isArray(payload?.polyrhythms)
        ? (payload.polyrhythms as PolyrhythmVoice[])
        : undefined,
      polyphony: Array.isArray(payload?.polyphony)
        ? (payload.polyphony as PolyphonicVoice[])
        : undefined,
      confirmation: String(payload?.confirmation ?? ""),
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid polystructure request.",
        bankCreatedInMemory: false,
        circuitReadPlanned: false,
        circuitPowered: false,
        audioGenerated: false,
        geometryRendered: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
