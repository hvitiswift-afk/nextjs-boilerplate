import fs from "node:fs";
import path from "node:path";

const scenarioPath = path.join(process.cwd(), "examples", "observer-route-scenarios.sample.json");
const raw = fs.readFileSync(scenarioPath, "utf8");
const data = JSON.parse(raw);

const baseUrl = process.env.OBSERVER_ROUTE_BASE_URL ?? "http://localhost:3000";
const endpoint = `${baseUrl}/api/llm/observer-route`;

let failures = 0;

console.log(`# ${data.product} check`);
console.log(`endpoint: ${endpoint}`);
console.log(`law: ${data.law}`);
console.log("");

for (const scenario of data.scenarios) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      observer: scenario.observer,
      prompt: scenario.prompt,
    }),
  }).catch((error) => ({ ok: false, error }));

  if (!response.ok) {
    failures += 1;
    console.error(`FAIL ${scenario.id}: request failed`);
    if (response.error) console.error(response.error);
    continue;
  }

  const json = await response.json();
  const result = json.result;
  const constellationOk = result?.matchedConstellationId === scenario.expectedConstellationId;
  const routeOk = result?.route === scenario.expectedRoute;

  if (constellationOk && routeOk) {
    console.log(`PASS ${scenario.id}: ${result.matchedConstellationId} -> ${result.route}`);
  } else {
    failures += 1;
    console.error(`FAIL ${scenario.id}`);
    console.error(`  expected: ${scenario.expectedConstellationId} -> ${scenario.expectedRoute}`);
    console.error(`  received: ${result?.matchedConstellationId} -> ${result?.route}`);
  }
}

const receipt = {
  id: "receipt-observer-route-checker-018",
  kind: "llm-observer-route-checker",
  status: failures === 0 ? "pass" : "fail",
  source: "examples/observer-route-scenarios.sample.json",
  api: "/api/llm/observer-route",
  failures,
};

console.log("");
console.log(JSON.stringify(receipt, null, 2));

if (failures > 0) {
  process.exitCode = 1;
}
