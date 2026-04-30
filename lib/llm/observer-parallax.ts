import { createObserverConstellationMap, type ObserverWorld } from "./observer-constellations";

export type ObserverParallaxPair = {
  earthId: string;
  marsId: string;
  sharedRoute: string;
  deepSkyStable: boolean;
  localForegroundShift: string;
  goblinMeaning: string;
};

export type ObserverParallaxMap = {
  product: "Goblin LLM Observer Parallax";
  rule: string;
  observers: ObserverWorld[];
  pairs: ObserverParallaxPair[];
  receipt: {
    id: "receipt-observer-parallax-earth-mars-009";
    kind: "llm-observer-parallax-map";
    status: "active";
  };
};

export function createObserverParallaxMap(): ObserverParallaxMap {
  const map = createObserverConstellationMap();

  const pair = (earthId: string, marsId: string, localForegroundShift: string, goblinMeaning: string): ObserverParallaxPair => {
    const earth = map.earth.find((item) => item.id === earthId);
    const mars = map.mars.find((item) => item.id === marsId);

    return {
      earthId,
      marsId,
      sharedRoute: earth?.goblinRoute ?? mars?.goblinRoute ?? "earth_gate",
      deepSkyStable: true,
      localForegroundShift,
      goblinMeaning,
    };
  };

  return {
    product: "Goblin LLM Observer Parallax",
    rule: "Earth and Mars share deep-star gates, but each observer adds a different local foreground and routing mood.",
    observers: ["earth", "mars"],
    pairs: [
      pair(
        "earth-orion",
        "mars-orion",
        "Orion remains the synthesis arc; Mars adds expedition context and Earth-as-memory behind the observer.",
        "Use Orion for creative synthesis from either world, then mark whether the synthesis is home-bound or expedition-bound."
      ),
      pair(
        "earth-ursa-major",
        "mars-earth-star",
        "Earth uses Ursa Major for north-home orientation; Mars uses Earth Star as the return beacon.",
        "Use Earth Gate for identity, home, return, and local boundary checks."
      ),
      pair(
        "earth-scorpius",
        "mars-phobos-deimos",
        "Earth uses Scorpius as a heat-risk sting; Mars uses fast moons as rapid local risk ticks.",
        "Use Bz Shield for flare control, consequence gates, and approval locks."
      ),
      pair(
        "earth-lyra",
        "mars-arcturus-line",
        "Earth tunes verification through Lyra/Vega; Mars extends the reference beam through Arcturus.",
        "Use Arcturus Gate for source checks, citations, and off-world verification."
      ),
    ],
    receipt: {
      id: "receipt-observer-parallax-earth-mars-009",
      kind: "llm-observer-parallax-map",
      status: "active",
    },
  };
}
