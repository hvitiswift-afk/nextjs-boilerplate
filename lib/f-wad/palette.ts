export type FWadPaletteToken = {
  id: string;
  name: string;
  hex: string;
  source: string;
  role: string;
};

export const fWadPhotoPalette: FWadPaletteToken[] = [
  {
    id: "natural-cyan-shard",
    name: "Natural Cyan Shard",
    hex: "#22c7c9",
    source: "cyan fragment held against sign field",
    role: "player-held proof fragment, route key, clarity shard",
  },
  {
    id: "synthetic-sign-red",
    name: "Synthetic Sign Red",
    hex: "#c8102e",
    source: "synthetically reproduced red reflective sign surface",
    role: "arena field, warning plane, Mars rail pressure",
  },
  {
    id: "reflective-white-border",
    name: "Reflective White Border",
    hex: "#f1eee4",
    source: "retroreflective white sign stripe and lettering",
    role: "receipt boundary, proof outline, Stokes edge loop",
  },
  {
    id: "galvanized-gray-post",
    name: "Galvanized Gray Post",
    hex: "#8f9698",
    source: "perforated metal sign post and bolt hardware",
    role: "gate infrastructure, world-select spine, grounded rail",
  },
];

export const fWadPaletteRule =
  "natural cyan shard + synthetic red field + white reflective border + gray metal post";
