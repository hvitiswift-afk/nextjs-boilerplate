export type ObserverWorld = "earth" | "mars";

export type ObserverConstellation = {
  id: string;
  name: string;
  observer: ObserverWorld;
  anchor: string;
  mythicRole: string;
  goblinRoute:
    | "earth_gate"
    | "bz_shield"
    | "solar_system"
    | "arcturus_gate"
    | "orion_arc"
    | "milky_way_graph";
  notes: string;
};

export type ObserverConstellationMap = {
  product: "Goblin LLM Observer Constellations";
  rule: string;
  earth: ObserverConstellation[];
  mars: ObserverConstellation[];
  bridge: {
    law: string;
    parallaxNote: string;
    goblinUse: string;
  };
};

export function createObserverConstellationMap(): ObserverConstellationMap {
  const earth: ObserverConstellation[] = [
    {
      id: "earth-orion",
      name: "Orion",
      observer: "earth",
      anchor: "winter sky / hunter belt",
      mythicRole: "synthesis arc and pattern-recognition loom",
      goblinRoute: "orion_arc",
      notes: "Earth-view Orion names the creative synthesis gate.",
    },
    {
      id: "earth-ursa-major",
      name: "Ursa Major",
      observer: "earth",
      anchor: "north sky / Big Dipper",
      mythicRole: "navigation ladle and pointer to pole",
      goblinRoute: "earth_gate",
      notes: "Earth-view Ursa Major stabilizes local orientation and user boundary.",
    },
    {
      id: "earth-scorpius",
      name: "Scorpius",
      observer: "earth",
      anchor: "summer sky / red Antares",
      mythicRole: "risk sting and heat warning",
      goblinRoute: "bz_shield",
      notes: "Earth-view Scorpius flags flare states before action.",
    },
    {
      id: "earth-lyra",
      name: "Lyra",
      observer: "earth",
      anchor: "Vega / music harp",
      mythicRole: "composer beam and signal tuning",
      goblinRoute: "arcturus_gate",
      notes: "Earth-view Lyra tunes verification into readable signal.",
    },
  ];

  const mars: ObserverConstellation[] = [
    {
      id: "mars-orion",
      name: "Orion from Mars",
      observer: "mars",
      anchor: "same deep stars, shifted planetary foreground",
      mythicRole: "expedition synthesis arc",
      goblinRoute: "orion_arc",
      notes: "From Mars, deep-star constellation shapes remain nearly familiar, while Earth becomes a moving inner-planet light.",
    },
    {
      id: "mars-earth-star",
      name: "Earth Star",
      observer: "mars",
      anchor: "Earth and Moon as bright inner-world signal",
      mythicRole: "home receipt and return beacon",
      goblinRoute: "earth_gate",
      notes: "Mars-view adds Earth itself as a visible navigation and memory token.",
    },
    {
      id: "mars-phobos-deimos",
      name: "Phobos / Deimos Gate",
      observer: "mars",
      anchor: "two small moons crossing the local sky",
      mythicRole: "fast local clock and fear/terror shield check",
      goblinRoute: "bz_shield",
      notes: "Mars-view uses the moons as rapid gate ticks for local risk checks.",
    },
    {
      id: "mars-arcturus-line",
      name: "Arcturus Line from Mars",
      observer: "mars",
      anchor: "reference-star verification beam",
      mythicRole: "off-world source check",
      goblinRoute: "arcturus_gate",
      notes: "Mars-view Arcturus keeps the verification bridge independent of Earth-only framing.",
    },
  ];

  return {
    product: "Goblin LLM Observer Constellations",
    rule: "Constellations are observer gates: Earth gives home orientation; Mars gives expedition orientation.",
    earth,
    mars,
    bridge: {
      law: "Goblin LLM must mark the observer before interpreting a sky pattern.",
      parallaxNote: "Earth and Mars are close compared with star distances, so most stellar constellation shapes remain nearly the same; the local planets, moons, horizon, and symbolic foreground change.",
      goblinUse: "Use Earth constellations for home routing and Mars constellations for expedition routing, then pass consequence through the Bz shield.",
    },
  };
}
