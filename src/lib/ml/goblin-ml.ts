import { Beam, GoblinFlag } from "../griploom/types";

export function goblinCheckBeam(beam: Beam) {
  const flags: GoblinFlag[] = [];

  if ((beam.repeatCount ?? 0) < 2) {
    flags.push({
      type: "weak_beam",
      severity: "MEDIUM",
      message: "Beam has fewer than 2 shared productions."
    });
  }

  if ((beam.confidence ?? 0) < 0.8) {
    flags.push({
      type: "low_confidence",
      severity: "MEDIUM",
      message: "Beam confidence is below publish threshold."
    });
  }

  return {
    beamId: beam.id,
    flags
  };
}
