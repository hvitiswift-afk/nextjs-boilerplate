import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const samplePath = path.join(root, "examples", "griploom-screenplay-industry-id.sample.json");

const data = JSON.parse(await readFile(samplePath, "utf8"));
const errors = [];

const idPattern = /^GL-WORK-[A-Z0-9]+-U\d+-DEPT-[A-Z]+-ROLE-[A-Z]+-SCN-\d{3}-[A-Z0-9]+-\d{4}-[A-Z]\d$/;
const allowedRoutes = new Set(["/api/tick", "/api/ml/score"]);
const officialClaimTerms = [
  "official credential",
  "guild member verified",
  "union member verified",
  "payroll approved",
  "legal clearance granted"
];

if (data.kind !== "griploom-screenplay-industry-id-sample") {
  errors.push("sample kind must be griploom-screenplay-industry-id-sample");
}

if (!Array.isArray(data.items) || data.items.length === 0) {
  errors.push("sample must include at least one item");
}

for (const [index, item] of (data.items ?? []).entries()) {
  const prefix = `items[${index}]`;

  if (!idPattern.test(item.id ?? "")) {
    errors.push(`${prefix}.id must match GL-WORK-{WORK}-U#-DEPT-{DEPT}-ROLE-{ROLE}-SCN-###-{OBJECT}-####-{CHECK}`);
  }

  if (item.kind !== "griploom-screenplay-industry-id") {
    errors.push(`${prefix}.kind must be griploom-screenplay-industry-id`);
  }

  if (!item.work?.slug || !item.work?.unit || !item.work?.scene || !item.work?.revision) {
    errors.push(`${prefix}.work must include slug, unit, scene, and revision`);
  }

  if (!item.department?.code || !item.department?.role || !item.department?.industryRefs) {
    errors.push(`${prefix}.department must include code, role, and industryRefs`);
  }

  if (!item.object?.type || !item.object?.surface || !item.object?.shape) {
    errors.push(`${prefix}.object must include type, surface, and shape`);
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

  if (item.qr?.privacy !== "public-id-only") {
    errors.push(`${prefix}.qr.privacy must be public-id-only`);
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

  const text = JSON.stringify(item).toLowerCase();
  for (const term of officialClaimTerms) {
    if (text.includes(term)) {
      errors.push(`${prefix} must not contain official-claim term: ${term}`);
    }
  }
}

const receipt = {
  id: "receipt-griploom-screenplay-industry-id-check-040",
  kind: "griploom-screenplay-industry-id-check",
  status: errors.length === 0 ? "passed" : "failed",
  checkedPath: "examples/griploom-screenplay-industry-id.sample.json",
  itemCount: data.items?.length ?? 0,
  errors,
  law: "A screenplay industry ID sample passes only when ID, work, department, role, object, barcode, QR, scanner route, source boundary, and BLACKLETTER fields agree."
};

console.log(JSON.stringify(receipt, null, 2));

if (errors.length > 0) {
  process.exitCode = 1;
}
