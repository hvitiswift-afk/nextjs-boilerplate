export type ObserverName = "earth" | "mars";

export type ObserverConstellation = {
  id: string;
  name: string;
  anchor: string;
  goblinRoute: string;
  mythicRole: string;
  notes: string;
  keywords: string[];
};

const earth: ObserverConstellation[] = [
  {
    id: "earth_orion",
    name: "Orion / Winter Hunter",
    anchor: "Belt stars as a winter sky ruler",
    goblinRoute: "orion_arc",
    mythicRole: "Creative synthesis, alignment, and pattern recognition.",
    notes: "Earth view treats Orion as a familiar seasonal marker rather than a universal sticker on the dome. The dome goblin receives no crown.",
    keywords: ["orion", "winter", "hunter", "belt", "creative", "synthesis", "alignment"],
  },
  {
    id: "earth_polaris",
    name: "Polaris / North Home Pin",
    anchor: "North celestial pole neighborhood",
    goblinRoute: "earth_gate",
    mythicRole: "Home orientation, return bearing, and calm navigation.",
    notes: "Useful for Earth navigation; less useful once the observer moves worlds.",
    keywords: ["north", "home", "pointer", "polaris", "return", "bearing", "orientation"],
  },
  {
    id: "earth_scorpius",
    name: "Scorpius / Warning Hook",
    anchor: "Low summer southern arc",
    goblinRoute: "bz_shield",
    mythicRole: "Risk signal, heat warning, and boundary check.",
    notes: "A danger glyph in the dashboard, not a prophecy machine wearing a tiny hat.",
    keywords: ["risk", "sting", "scorpion", "heat", "warning", "flare", "shield"],
  },
];

const mars: ObserverConstellation[] = [
  {
    id: "mars_earth_moon",
    name: "Earth-Moon Beacon",
    anchor: "Earth and Moon as a return-light pair",
    goblinRoute: "earth_gate",
    mythicRole: "Expedition memory, home reference, and return logic.",
    notes: "From Mars, Earth becomes the tiny blue-white reference lamp. Humbling. Excellent anti-pretension medicine.",
    keywords: ["earth", "moon", "return", "beacon", "home", "blue", "memory"],
  },
  {
    id: "mars_phobos_deimos",
    name: "Phobos-Deimos Fast Moons",
    anchor: "Rapid local moon timing",
    goblinRoute: "solar_system",
    mythicRole: "Local cadence, operational timing, and fear/terror label audit.",
    notes: "Mars has weird tiny moon goblins, and they move fast enough to matter in local stories.",
    keywords: ["phobos", "deimos", "fast", "moons", "fear", "terror", "shield", "local"],
  },
  {
    id: "mars_arcturus_reference",
    name: "Arcturus Reference Beam",
    anchor: "Bright distant star as deep-sky reference",
    goblinRoute: "arcturus_gate",
    mythicRole: "Stable comparison point for cross-observer reasoning.",
    notes: "Deep sky anchors change slowly compared with local foregrounds, which is the useful trick.",
    keywords: ["arcturus", "reference", "beam", "source", "deep", "stable", "check"],
  },
];

export function createObserverConstellationMap() {
  return {
    rule: "Observer first, constellation second: Earth and Mars share deep sky, but local foregrounds change the route meaning.",
    earth,
    mars,
    bridge: {
      law: "Mark the observing world before interpreting the sky.",
      parallaxNote: "Deep-sky constellations remain visually familiar at human dashboard scale, while nearby foreground bodies and navigation meanings shift.",
      goblinUse: "Goblin routing uses the observer as a first-class input so a home beacon is not confused with an expedition beacon.",
    },
  };
}
