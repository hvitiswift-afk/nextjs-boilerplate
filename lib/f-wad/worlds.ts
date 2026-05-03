import type { Realm } from "./field";

export type WorldTag =
  | "arena"
  | "hyperboreum"
  | "imperial_gate"
  | "alpha_mars"
  | "omega_mars"
  | "venus";

export type FWadWorld = {
  id: WorldTag;
  map: string;
  name: string;
  subtitle: string;
  fieldBias: Realm | "mixed" | "resonant";
  palette: string;
  coreMechanic: string;
  sectors: string[];
  gates: WorldTag[];
  rule: string;
};

export const fWadWorlds: FWadWorld[] = [
  {
    id: "arena",
    map: "MAP02",
    name: "Gladiator Arena",
    subtitle: "Combat bowl for proof under pressure",
    fieldBias: "mixed",
    palette: "iron / amber / red dust / white crowd flare",
    coreMechanic: "duel, loop, capture, verify, and publish under moving swirl pressure",
    sectors: ["ARENA_OUTER_STANDS", "ARENA_POLARITY_RING", "ARENA_COMBAT_BOWL", "ARENA_CENTER_SEAL"],
    gates: ["imperial_gate", "alpha_mars", "omega_mars"],
    rule: "Contest turns field geometry into playable trial.",
  },
  {
    id: "hyperboreum",
    map: "MAP03",
    name: "Hyperboreum",
    subtitle: "Polar luminous clarity realm",
    fieldBias: "Elysium",
    palette: "ice white / aurora cyan / pale gold / marble blue",
    coreMechanic: "long sight lines, antenna reading, crystal routing, and aurora locks",
    sectors: ["HYPERBOREUM_GATE", "POLAR_ARCHES", "AURORA_OBSERVATORY", "ICE_VAULT"],
    gates: ["imperial_gate", "venus"],
    rule: "Clarity makes distant signals legible.",
  },
  {
    id: "imperial_gate",
    map: "MAP04",
    name: "Imperial Gate",
    subtitle: "Constantinople-style crossroads hub",
    fieldBias: "Asphodel",
    palette: "bronze / sea blue / ivory dome / blackletter shadow",
    coreMechanic: "hub routing, transit gates, vault quarter, harbor quarter, and receipt markets",
    sectors: ["IMPERIAL_WALL", "DOME_FORUM", "HARBOR_GATE", "VAULT_QUARTER", "ARENA_QUARTER"],
    gates: ["arena", "hyperboreum", "alpha_mars", "omega_mars", "venus"],
    rule: "Every realm needs a gate; every gate needs a receipt.",
  },
  {
    id: "alpha_mars",
    map: "MAP05",
    name: "Alpha Mars",
    subtitle: "Beginning Mars, frontier outpost",
    fieldBias: "Elysium",
    palette: "red gold / dust orange / beacon white / steel black",
    coreMechanic: "outpost defense, speed routes, beacon chains, and first-campaign proofs",
    sectors: ["ALPHA_OUTPOST", "RED_DUST_FIELD", "BEACON_TOWER", "FORT_GATE"],
    gates: ["imperial_gate", "arena", "omega_mars"],
    rule: "Alpha Mars begins the red rail with constructive pressure.",
  },
  {
    id: "omega_mars",
    map: "MAP06",
    name: "Omega Mars",
    subtitle: "Ending Mars, terminal ruin basin",
    fieldBias: "Gehenna",
    palette: "black red / rust / volcanic gray / old machine green",
    coreMechanic: "sink swirls, ruin labyrinths, buried machines, and heavy verification trials",
    sectors: ["OMEGA_RUIN", "BLACK_BASIN", "BURIED_MACHINE", "FINAL_VAULT"],
    gates: ["imperial_gate", "arena", "alpha_mars"],
    rule: "Omega Mars ends the red rail with sink pressure and proof weight.",
  },
  {
    id: "venus",
    map: "MAP07",
    name: "Venus",
    subtitle: "Chromatic mist and refraction realm",
    fieldBias: "resonant",
    palette: "copper / gold / cloud pearl / acid green / rose violet",
    coreMechanic: "fog puzzles, chromatic locks, atmospheric drift, and beauty-hazard duality",
    sectors: ["VENUS_CLOUD_DOCK", "COPPER_GARDEN", "MIST_PALACE", "ACID_REFLECTION_BASIN"],
    gates: ["imperial_gate", "hyperboreum"],
    rule: "Venus bends beams through atmosphere before it reveals truth.",
  },
];

export function getWorld(id: WorldTag): FWadWorld | undefined {
  return fWadWorlds.find((world) => world.id === id);
}
