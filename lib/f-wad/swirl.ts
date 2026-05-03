import { classifyField, type ClassifiedField, type FieldSample } from "./field";
import { routeGoblin, type GoblinRoute } from "./goblin-router";

export type SwirlActor = ClassifiedField & {
  position: [number, number];
  orbitRadius: number;
  captureThreshold: number;
  route: GoblinRoute;
};

const baseSamples: Array<FieldSample & { position: [number, number]; orbitRadius: number; captureThreshold: number }> = [
  {
    id: "swirl_elysium_01",
    label: "Positive helper swirl",
    divergence: 0.74,
    curl: 1.18,
    position: [-0.75, 0.65],
    orbitRadius: 0.38,
    captureThreshold: 1.0,
  },
  {
    id: "swirl_asphodel_01",
    label: "Neutral route swirl",
    divergence: 0.02,
    curl: 0.96,
    position: [0.7, 0.55],
    orbitRadius: 0.34,
    captureThreshold: 1.1,
  },
  {
    id: "swirl_gehenna_01",
    label: "Sink verification swirl",
    divergence: -0.82,
    curl: 1.42,
    position: [0.65, -0.7],
    orbitRadius: 0.42,
    captureThreshold: 1.25,
  },
  {
    id: "swirl_pluto_01",
    label: "Pluto time-hollow swirl",
    divergence: 0.03,
    curl: 0.44,
    timeDivergence: 0.01,
    timeCurl: 1.64,
    position: [-0.58, -0.6],
    orbitRadius: 0.46,
    captureThreshold: 1.35,
  },
];

export function buildSwirls(): SwirlActor[] {
  return baseSamples.map((sample) => {
    const field = classifyField(sample);
    return {
      ...field,
      position: sample.position,
      orbitRadius: sample.orbitRadius,
      captureThreshold: sample.captureThreshold,
      route: routeGoblin(field),
    };
  });
}
