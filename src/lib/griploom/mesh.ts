import { Beam, ShirtLayer } from "./types";

export type MeshScorecard = {
  density: number;
  beamCount: number;
  possibleBeamCount: number;
  centralLayer: ShirtLayer | "unknown";
  balance: "sparse" | "balanced" | "layer-heavy";
};

export function meshDensity(nodeCount: number, beamCount: number) {
  const possible = (nodeCount * (nodeCount - 1)) / 2;
  const density = possible === 0 ? 0 : beamCount / possible;

  return {
    density: Number(density.toFixed(4)),
    possibleBeamCount: possible
  };
}

export function centralLayer(beams: Beam[]): ShirtLayer | "unknown" {
  const counts = new Map<ShirtLayer, number>();

  for (const beam of beams) {
    counts.set(beam.layer, (counts.get(beam.layer) ?? 0) + 1);
  }

  let best: ShirtLayer | "unknown" = "unknown";
  let bestCount = 0;

  for (const [layer, count] of counts.entries()) {
    if (count > bestCount) {
      best = layer;
      bestCount = count;
    }
  }

  return best;
}

export function meshScorecard({
  nodeCount,
  beams
}: {
  nodeCount: number;
  beams: Beam[];
}): MeshScorecard {
  const { density, possibleBeamCount } = meshDensity(nodeCount, beams.length);
  const layer = centralLayer(beams);

  let balance: MeshScorecard["balance"] = "balanced";
  if (density < 0.15) balance = "sparse";
  else if (layer !== "unknown") balance = "layer-heavy";

  return {
    density,
    beamCount: beams.length,
    possibleBeamCount,
    centralLayer: layer,
    balance
  };
}
