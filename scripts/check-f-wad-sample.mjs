import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const requiredFiles = [
  "app/f-wad/page.tsx",
  "lib/f-wad/field.ts",
  "lib/f-wad/goblin-router.ts",
  "lib/f-wad/swirl.ts",
  "lib/f-wad/worlds.ts",
  "lib/f-wad/palette.ts",
];

const requiredTerms = {
  "app/f-wad/page.tsx": ["Quadflare Hollow", "Divergence", "Curl", "Stokes", "Goblin", "Griploom", "Campaign rail", "World-select structure", "Photo palette rail", "fWadWorlds", "fWadPhotoPalette"],
  "lib/f-wad/field.ts": ["classifyField", "classifyRealm", "stokesVerified", "Elysium", "Asphodel", "Gehenna", "Pluto"],
  "lib/f-wad/goblin-router.ts": ["routeGoblin", "positive_swirl_charge", "sink_swirl_verify", "pluto_balance"],
  "lib/f-wad/swirl.ts": ["buildSwirls", "swirl_elysium_01", "swirl_asphodel_01", "swirl_gehenna_01", "swirl_pluto_01"],
  "lib/f-wad/worlds.ts": ["Gladiator Arena", "Hyperboreum", "Imperial Gate", "Alpha Mars", "Omega Mars", "Venus", "Constantinople-style", "MAP02", "MAP03", "MAP04", "MAP05", "MAP06", "MAP07"],
  "lib/f-wad/palette.ts": ["Natural Cyan Shard", "Synthetic Sign Red", "Reflective White Border", "Galvanized Gray Post", "natural cyan shard + synthetic red field"],
};

const failures = [];

for (const relativePath of requiredFiles) {
  let content = "";
  try {
    content = readFileSync(join(root, relativePath), "utf8");
  } catch (error) {
    failures.push(`${relativePath}: missing or unreadable`);
    continue;
  }

  for (const term of requiredTerms[relativePath] ?? []) {
    if (!content.includes(term)) {
      failures.push(`${relativePath}: missing term ${term}`);
    }
  }
}

if (failures.length > 0) {
  console.error("F-WAD sample check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("F-WAD sample check passed: arena page, field classifier, Goblin router, swirl samples, campaign worlds, and photo palette are wired.");
