export type Observer = "earth" | "mars";

export type GoblinRoute =
  | "earth_gate"
  | "bz_shield"
  | "solar_system"
  | "arcturus_gate"
  | "orion_arc"
  | "milky_way_graph";

export type ObserverConstellation = {
  id: string;
  observer: Observer;
  name: string;
  anchor: string;
  goblinRoute: GoblinRoute;
  mythicRole: string;
  notes: string;
  keywords: string[];
};

export type ObserverConstellationMap = {
  rule: string;
  earth: ObserverConstellation[];
  mars: ObserverConstellation[];
  bridge: {
    law: string;
    parallaxNote: string;
    goblinUse: string;
  };
};

const earthConstellations: ObserverConstellation[] = [
  {
    id: "earth-polaris-pointer",
    observer: "earth",
    name: "Polaris Pointer Gate",
    anchor: "Big Dipper pointer stars toward Polaris",
    goblinRoute: "earth_gate",
    mythicRole: "Home orientation and north-reference memory.",
    notes: "Use when the prompt asks for home, north, return, orientation, or map anchoring.",
    keywords: ["north", "home", "pointer", "polaris", "return", "orientation"],
  },
  {
    id: "earth-orion-belt",
    observer: "earth",
    name: "Orion Belt Arc",
    anchor: "winter hunter belt and sword field",
    goblinRoute: "orion_arc",
    mythicRole: "Creative synthesis, pattern recognition, and mythic alignment.",
    notes: "Good for prompts about hunter, belt, winter, forge, story, or creative synthesis.",
    keywords: ["orion", "hunter", "belt", "winter", "story", "creative", "synthesis"],
  },
  {
    id: "earth-scorpion-warning",
    observer: "earth",
    name: "Scorpion Warning Rail",
    anchor: "southern summer sting and heat signal",
    goblinRoute: "bz_shield",
    mythicRole: "Risk flagging, heat warnings, and hazard checks.",
    notes: "Use when language suggests sting, flare, warning, venom, risk, or shield checks.",
    keywords: ["risk", "sting", "warning", "flare", "heat", "shield", "hazard"],
  },
];

const marsConstellations: ObserverConstellation[] = [
  {
    id: "mars-earth-beacon",
    observer: "mars",
    name: "Earth-Moon Return Beacon",
    anchor: "Earth and Moon as bright inner-system reference",
    goblinRoute: "solar_system",
    mythicRole: "Return vector, communications memory, and expedition-home bridge.",
    notes: "Use for prompts about Earth, Moon, home signal, return, telecom, or distance communication.",
    keywords: ["earth", "moon", "return", "beacon", "home", "signal", "telecom"],
  },
  {
    id: "mars-phobos-deimos-shield",
    observer: "mars",
    name: "Phobos-Deimos Shield Check",
    anchor: "fast moons and local orbital caution",
    goblinRoute: "bz_shield",
    mythicRole: "Fear/terror named moons converted into audit and safety gates.",
    notes: "Use when prompts mention fast moons, fear, terror, shield, or local hazard checks.",
    keywords: ["phobos", "deimos", "fear", "terror", "fast", "moon", "shield"],
  },
  {
    id: "mars-arcturus-reference",
    observer: "mars",
    name: "Arcturus Reference Beam",
    anchor: "deep-sky reference star with expedition frame correction",
    goblinRoute: "arcturus_gate",
    mythicRole: "Source checking and long-baseline reference calibration.",
    notes: "Use for prompts about reference beams, source checks, Arcturus, calibration, or deep sky.",
    keywords: ["arcturus", "reference", "beam", "source", "calibration", "deep", "sky"],
  },
];

export function createObserverConstellationMap(): ObserverConstellationMap {
  return {
    rule: "Mark the observing world before interpreting the sky: Earth gives home orientation; Mars gives expedition orientation.",
    earth: earthConstellations,
    mars: marsConstellations,
    bridge: {
      law: "Observer first, constellation second, Goblin route third, receipt always.",
      parallaxNote: "Foreground bodies shift strongly between Earth and Mars, while deep-sky constellations remain useful but culturally reframed.",
      goblinUse: "Use the observer frame to stop one sky-map from pretending it rules every planet. That is how small map goblins become empire goblins.",
    },
  };
}
