import { Beam } from "../griploom/types";

export function scoreBeam(beam: Beam) {
  const repeat = beam.repeatCount ?? 0;
  const confidence = beam.confidence ?? 0;
  const score = repeat * confidence;

  let label: Beam["status"] = "CANDIDATE";
  if (score >= 6) label = "CORE";
  else if (score >= 4) label = "STRONG";
  else if (score >= 2) label = "CLEAR";
  else if (score <= 0.5) label = "REJECTED";

  return {
    beamId: beam.id,
    score,
    label
  };
}
