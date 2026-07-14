import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile("vercel.json", "utf8"));
const failures = [];

const requireCheck = (passed, message) => {
  if (!passed) failures.push(message);
};

requireCheck(config.framework === "nextjs", "Vercel framework must be nextjs.");
requireCheck(config.git?.deploymentEnabled === false, "Automatic Vercel Git deployments must remain disabled.");
requireCheck(config.buildCommand === "npm run build", "Vercel build command must use npm run build.");
requireCheck(config.installCommand === "npm ci", "Vercel install command must use npm ci.");

const plan = process.env.VERCEL_PLAN?.toLowerCase() || "unknown";
const connected = process.env.VERCEL_CONNECTED === "true";
const freeAllowed = plan === "hobby" || plan === "free";

if (connected && !freeAllowed) {
  failures.push(`Connected Vercel plan is not free-only: ${plan}`);
}

if (failures.length) {
  console.error("VERCEL FREE-ONLY GUARD: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("VERCEL FREE-ONLY GUARD: PASS");
console.log(`Connection detected: ${connected ? "YES" : "NO"}`);
console.log(`Plan detected: ${plan}`);
console.log(`Deployment permitted by policy: ${connected && freeAllowed ? "YES" : "NO"}`);
console.log("Automatic Vercel Git deployment: DISABLED");
console.log("External action completed: false");
