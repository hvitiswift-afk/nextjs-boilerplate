import { NextResponse } from "next/server";
import { Beam } from "@/lib/griploom/types";
import { scoreBeam } from "@/lib/ml/griploom-ml";
import { goblinCheckBeam } from "@/lib/ml/goblin-ml";
import { blackletterGate } from "@/lib/blackletter/gate";
import { meshScorecard } from "@/lib/griploom/mesh";
import { vitality, VitalityInput } from "@/lib/griploom/vitality";

export async function POST(req: Request) {
  const body = await req.json();
  const beams: Beam[] = Array.isArray(body.beams) ? body.beams : [];
  const nodeCount = Number(body.nodeCount ?? 0);
  const vitalityInput = body.vitality as VitalityInput | undefined;

  const results = beams.map((beam) => {
    const griploom = scoreBeam(beam);
    const goblin = goblinCheckBeam(beam);
    const blackletter = blackletterGate({
      sourceCount: beam.sharedProductions?.length ?? 0,
      highConfidenceSource: beam.confidence >= 0.95,
      goblinFlags: goblin.flags,
      claimLevel: 2
    });

    return {
      beam,
      griploom,
      goblin,
      blackletter
    };
  });

  const mesh = meshScorecard({
    nodeCount: nodeCount || beams.length * 2,
    beams
  });

  const field = vitalityInput ? vitality(vitalityInput) : null;

  return NextResponse.json({
    product: "GRIPLOOM ML + GOBLIN ML",
    rule: "GRIPLOOM ranks. GOBLIN challenges. BLACKLETTER permits.",
    mesh,
    field,
    results
  });
}
