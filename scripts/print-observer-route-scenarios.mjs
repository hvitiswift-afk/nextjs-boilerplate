import fs from "node:fs";
import path from "node:path";

const scenarioPath = path.join(process.cwd(), "examples", "observer-route-scenarios.sample.json");
const raw = fs.readFileSync(scenarioPath, "utf8");
const data = JSON.parse(raw);

console.log(`# ${data.product}`);
console.log(`law: ${data.law}`);
console.log("");

for (const scenario of data.scenarios) {
  const payload = JSON.stringify({
    observer: scenario.observer,
    prompt: scenario.prompt,
  });

  console.log(`## ${scenario.id}`);
  console.log(`expected constellation: ${scenario.expectedConstellationId}`);
  console.log(`expected route: ${scenario.expectedRoute}`);
  console.log("curl:");
  console.log(`curl -X POST http://localhost:3000/api/llm/observer-route -H "content-type: application/json" -d '${payload}'`);
  console.log("");
}

console.log(JSON.stringify(data.receipt, null, 2));
