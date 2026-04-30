import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const samplePath = path.join(root, "examples", "griploom-id-barcoder.sample.json");

const data = JSON.parse(await readFile(samplePath, "utf8"));
const errors = [];

const idPattern = /^GL-[A-Z]+-[A-Z]+-\d{8}-\d{4}-[A-Z]\d$/;
const allowedRoutes = new Set(["/api/tick", "/api/ml/score"]);

if (data.kind !== "griploom-id-barcoder-sample") {
  errors.push("sample kind must be griploom-id-barcoder-sample");
}

if (!Array.isArray(data.items) || data.items.length === 0) {
  errors.push("sample must include at least one item");
}

for (const [index, item] of (data.items ?? []).entries()) {
  const prefix = `items[${index}]`;

  if (!idPattern.test(item.id ?? "")) {
    errors.push(`${prefix}.id must match GL-{LAYER}-{OBJECT}-{YYYYMMDD}-{SERIAL}-{CHECK}`);
  }

  if (item.kind !== "griploom-id") {
    errors.push(`${prefix}.kind must be griploom-id`);
  }

  if (!item.shape?.name || !item.shape?.symbol || !item.shape?.function) {
    errors.push(`${prefix}.shape must include name, symbol, and function`);
  }

  if (item.barcode?.symbology !== "code128") {
    errors.push(`${prefix}.barcode.symbology must be code128`);
  }

  if (item.barcode?.payload !== item.id) {
    errors.push(`${prefix}.barcode.payload must equal item id`);
  }

  if (!item.qr?.url?.includes(item.id)) {
    errors.push(`${prefix}.qr.url must include item id`);
  }

  if (!allowedRoutes.has(item.scanner?.route)) {
    errors.push(`${prefix}.scanner.route must be /api/tick or /api/ml/score`);
  }

  if (!item.scanner?.idempotencyKey?.startsWith(item.id)) {
    errors.push(`${prefix}.scanner.idempotencyKey must start with item id`);
  }

  if (!item.blackletter?.rule) {
    errors.push(`${prefix}.blackletter.rule is required`);
  }
}

const receipt = {
  id: "receipt-griploom-id-barcoder-check-037",
  kind: "griploom-id-barcoder-check",
  status: errors.length === 0 ? "passed" : "failed",
  checkedPath: "examples/griploom-id-barcoder.sample.json",
  itemCount: data.items?.length ?? 0,
  errors,
  law: "A GRIPLOOM ID sample passes only when ID, shape, barcode, QR, scanner route, and BLACKLETTER fields agree."
};

console.log(JSON.stringify(receipt, null, 2));

if (errors.length > 0) {
  process.exitCode = 1;
}
