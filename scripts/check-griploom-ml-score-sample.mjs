import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const samplePath = path.join(root, "examples", "griploom-ml-score.sample.json");

const data = JSON.parse(await readFile(samplePath, "utf8"));
const errors = [];

if (!Number.isInteger(data.nodeCount) || data.nodeCount < 2) {
  errors.push("nodeCount must be an integer >= 2");
}

if (!data.vitality || typeof data.vitality !== "object") {
  errors.push("vitality object is required");
}

for (const key of ["qCoulombs", "cFarads", "iCurrent", "resistance", "crewSignal", "directorSignal", "houseSignal", "audienceSignal"]) {
  if (typeof data.vitality?.[key] !== "number") {
    errors.push(`vitality.${key} must be a number`);
  }
}

if (!Array.isArray(data.beams) || data.beams.length === 0) {
  errors.push("beams must include at least one beam");
}

for (const [index, beam] of (data.beams ?? []).entries()) {
  const prefix = `beams[${index}]`;

  if (!beam.id?.startsWith("GL-BEAM-")) {
    errors.push(`${prefix}.id must start with GL-BEAM-`);
  }

  if (!Array.isArray(beam.people) || beam.people.length !== 2 || beam.people.some((person) => typeof person !== "string" || person.length === 0)) {
    errors.push(`${prefix}.people must contain exactly two non-empty names`);
  }

  if (!Array.isArray(beam.sharedProductions) || beam.sharedProductions.length === 0) {
    errors.push(`${prefix}.sharedProductions must include at least one production`);
  }

  if (!Number.isInteger(beam.repeatCount) || beam.repeatCount < 1) {
    errors.push(`${prefix}.repeatCount must be an integer >= 1`);
  }

  if (typeof beam.layer !== "string" || beam.layer.length === 0) {
    errors.push(`${prefix}.layer is required`);
  }

  if (typeof beam.confidence !== "number" || beam.confidence < 0 || beam.confidence > 1) {
    errors.push(`${prefix}.confidence must be a number from 0 to 1`);
  }

  if (typeof beam.status !== "string" || beam.status.length === 0) {
    errors.push(`${prefix}.status is required`);
  }
}

const receipt = {
  id: "receipt-griploom-ml-score-check-001",
  kind: "griploom-ml-score-check",
  status: errors.length === 0 ? "passed" : "failed",
  checkedPath: "examples/griploom-ml-score.sample.json",
  beamCount: data.beams?.length ?? 0,
  errors,
  law: "A GRIPLOOM ML score sample passes only when beams, sources, confidence, layer, and vitality fields are shaped for deterministic scoring."
};

console.log(JSON.stringify(receipt, null, 2));

if (errors.length > 0) {
  process.exitCode = 1;
}
