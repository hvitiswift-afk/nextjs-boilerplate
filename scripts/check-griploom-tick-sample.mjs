import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const samplePath = path.join(root, "examples", "griploom-tick.sample.json");

const data = JSON.parse(await readFile(samplePath, "utf8"));
const errors = [];

if (!data.idempotency_key?.startsWith("GL-")) {
  errors.push("idempotency_key must start with GL-");
}

if (Number.isNaN(Date.parse(data.timestamp ?? ""))) {
  errors.push("timestamp must be an ISO-compatible datetime string");
}

if (!data.production_id?.startsWith("GL-")) {
  errors.push("production_id must start with GL-");
}

if (typeof data.event_type !== "string" || data.event_type.length === 0) {
  errors.push("event_type is required");
}

if (!Array.isArray(data.layer) || data.layer.length === 0) {
  errors.push("layer must include at least one layer marker");
}

for (const key of ["actor", "object", "location", "source"]) {
  if (!data[key] || typeof data[key] !== "object") {
    errors.push(`${key} object is required`);
  }

  if (typeof data[key]?.type !== "string" || data[key].type.length === 0) {
    errors.push(`${key}.type is required`);
  }

  if (typeof data[key]?.id !== "string" || data[key].id.length === 0) {
    errors.push(`${key}.id is required`);
  }
}

if (!data.object?.barcode?.startsWith("GL-BARCODE-")) {
  errors.push("object.barcode must start with GL-BARCODE-");
}

const receipt = {
  id: "receipt-griploom-tick-check-001",
  kind: "griploom-tick-check",
  status: errors.length === 0 ? "passed" : "failed",
  checkedPath: "examples/griploom-tick.sample.json",
  eventType: data.event_type ?? null,
  errors,
  law: "A SAME-TICK sample passes only when idempotency, time, production, actor, object, location, and source fields can form a stable event receipt."
};

console.log(JSON.stringify(receipt, null, 2));

if (errors.length > 0) {
  process.exitCode = 1;
}
