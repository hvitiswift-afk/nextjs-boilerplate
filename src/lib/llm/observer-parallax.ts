import { createObserverConstellationMap } from "./observer-constellations";

export type ObserverParallaxPair = {
  earthId: string;
  marsId: string;
  sharedRoute: string;
  localForegroundShift: string;
  goblinMeaning: string;
  deepSkyStable: boolean;
};

export function createObserverParallaxMap() {
  const constellations = createObserverConstellationMap();

  const pairs: ObserverParallaxPair[] = [
    {
      earthId: "earth_polaris",
      marsId: "mars_earth_moon",
      sharedRoute: "earth_gate",
      localForegroundShift: "Earth uses Polaris as a north-home reference; Mars uses Earth-Moon as the home beacon.",
      goblinMeaning: "Same emotional route, different physical anchor. The map is not the territory; the goblin is forced to read the label.",
      deepSkyStable: false,
    },
    {
      earthId: "earth_orion",
      marsId: "mars_arcturus_reference",
      sharedRoute: "arcturus_gate",
      localForegroundShift: "Orion gives a familiar Earth seasonal arc; Arcturus gives a steadier deep-sky comparison point.",
      goblinMeaning: "Use deep references for cross-world continuity and local constellations for observer-facing narrative.",
      deepSkyStable: true,
    },
    {
      earthId: "earth_scorpius",
      marsId: "mars_phobos_deimos",
      sharedRoute: "bz_shield",
      localForegroundShift: "Earth warning imagery leans on Scorpius; Mars warning imagery can lean on the fast local moons.",
      goblinMeaning: "Risk signs are observer-local. A useful warning glyph on one world may be nonsense confetti on another.",
      deepSkyStable: false,
    },
  ];

  return {
    rule: constellations.bridge.parallaxNote,
    pairs,
    receipt: {
      id: "receipt-observer-parallax-map-010",
      kind: "llm-observer-parallax-map",
      status: "active",
      observers: ["earth", "mars"],
      law: "Local foregrounds shift; deep references stabilize; observer context always comes first.",
    },
  };
}
