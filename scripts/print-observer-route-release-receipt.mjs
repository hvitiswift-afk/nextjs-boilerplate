import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const gates = {
  build: "manual",
  observerRoutesPrinted: exists("scripts/print-observer-route-scenarios.mjs") ? "ready" : "missing",
  observerRoutesChecked: exists("scripts/check-observer-route-scenarios.mjs") ? "ready" : "missing",
  ciWorkflow: exists(".github/workflows/observer-routes.yml") ? "ready" : "missing",
  readmeLinked: fs.readFileSync(path.join(root, "README.md"), "utf8").includes("observer-route-release.receipt.sample.json") ? "ready" : "missing",
  releaseRunbookLinked: exists("docs/observer-route-release.md") ? "ready" : "missing",
};

const status = Object.values(gates).every((value) => value === "ready" || value === "manual")
  ? "ready"
  : "blocked";

const receipt = {
  id: "receipt-observer-route-release-printer-025",
  kind: "llm-observer-route-release-receipt-printer",
  status,
  release: {
    name: "observer-routes",
    version: "0.1.0",
    branch: "main",
  },
  gates,
  commands: [
    "npm install",
    "npm run build",
    "npm run observer:routes",
    "npm run dev",
    "npm run observer:routes:check",
  ],
  artifacts: [
    "docs/observer-route-harness.md",
    "docs/observer-route-ci.md",
    "docs/observer-route-release.md",
    ".github/workflows/observer-routes.yml",
    "examples/observer-route-scenarios.sample.json",
    "examples/observer-route-release.receipt.sample.json",
  ],
  law: "A release receipt can be printed from the repo state before the rail is called releasable.",
};

console.log(JSON.stringify(receipt, null, 2));

if (status !== "ready") {
  process.exitCode = 1;
}
