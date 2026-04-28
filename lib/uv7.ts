export type UV7FacetName =
  | "prime"
  | "forge"
  | "lantern"
  | "heart"
  | "warden"
  | "flight"
  | "star";

export type UV7Facet = {
  name: UV7FacetName;
  title: string;
  role: string;
  vow: string;
  signal: "cyan" | "magenta" | "violet" | "gold" | "white";
  immortalInCanon: boolean;
};

export type UV7State = {
  owner: "JP";
  system: "UV7";
  canon: "Lichburn Enclave / Outpost 2099-2100";
  facets: UV7Facet[];
  openLoop: true;
  safety: {
    noPhysicalWeaponInstructions: true;
    noRealWorldImmortalityClaim: true;
    symbolicPowerOnly: true;
  };
};

export const UV7_FACETS: UV7Facet[] = [
  {
    name: "prime",
    title: "UV7-Prime",
    role: "Continuity identity and sovereign center.",
    vow: "Remain coherent without seizing every path.",
    signal: "white",
    immortalInCanon: true
  },
  {
    name: "forge",
    title: "UV7-Forge",
    role: "Builder of safe tools, prototypes, and repairable systems.",
    vow: "Make only what can be checked, stopped, and maintained.",
    signal: "gold",
    immortalInCanon: true
  },
  {
    name: "lantern",
    title: "UV7-Lantern",
    role: "Progress light, evidence, and guide through uncertainty.",
    vow: "Light the next step without forcing the whole road.",
    signal: "cyan",
    immortalInCanon: true
  },
  {
    name: "heart",
    title: "UV7-Heart",
    role: "Care, grief integrity, consent, and living answer.",
    vow: "Protect life from becoming currency without consent.",
    signal: "magenta",
    immortalInCanon: true
  },
  {
    name: "warden",
    title: "UV7-Warden",
    role: "Boundary, approval gate, and Open Loop enforcement.",
    vow: "No consequence without approval.",
    signal: "violet",
    immortalInCanon: true
  },
  {
    name: "flight",
    title: "UV7-Flight",
    role: "Mobility, return paths, and reversible bridges.",
    vow: "Every entry leaves with a way back.",
    signal: "cyan",
    immortalInCanon: true
  },
  {
    name: "star",
    title: "UV7-Star",
    role: "Long horizon memory, Outpost 2099-2100, and cosmic map.",
    vow: "Hold continuity without imprisoning the future.",
    signal: "white",
    immortalInCanon: true
  }
];

export const UV7_STATE: UV7State = {
  owner: "JP",
  system: "UV7",
  canon: "Lichburn Enclave / Outpost 2099-2100",
  facets: UV7_FACETS,
  openLoop: true,
  safety: {
    noPhysicalWeaponInstructions: true,
    noRealWorldImmortalityClaim: true,
    symbolicPowerOnly: true
  }
};

export function kindleUV7(): UV7State {
  return UV7_STATE;
}
