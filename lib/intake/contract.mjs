import { createHash } from "node:crypto";

const FIELD_TYPES = new Set(["input", "textarea", "select"]);
const ACKNOWLEDGMENT_MODES = new Set(["interactive-control", "terms-on-submit"]);
const SINGLE_TERMINAL_FORMATTING = new Set(["\n", " ", "\u00a0", "\u200b"]);

export function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function createFieldSchema({ version, fields }) {
  if (!version || typeof version !== "string") throw new Error("A versioned field schema is required.");
  if (!Array.isArray(fields) || fields.length === 0) throw new Error("At least one field is required.");

  const keys = new Set();
  const names = new Set();
  const normalized = fields.map((field, index) => {
    const item = {
      key: String(field.key || "").trim(),
      name: String(field.name || "").trim(),
      type: String(field.type || "input").trim(),
      required: Boolean(field.required),
      label: String(field.label || field.key || "").trim(),
    };
    if (!item.key) throw new Error(`Field ${index + 1} is missing a stable key.`);
    if (!item.name) throw new Error(`Field ${item.key} is missing a stable control name.`);
    if (!FIELD_TYPES.has(item.type)) throw new Error(`Field ${item.key} has unsupported type ${item.type}.`);
    if (keys.has(item.key)) throw new Error(`Duplicate field key: ${item.key}.`);
    if (names.has(item.name)) throw new Error(`Duplicate stable field name: ${item.name}.`);
    keys.add(item.key);
    names.add(item.name);
    return Object.freeze(item);
  });

  return Object.freeze({
    version,
    fields: Object.freeze(normalized),
    digest: sha256(stableJson({ version, fields: normalized })),
  });
}

export function normalizeLineEndings(value) {
  return String(value ?? "").replace(/\r\n?/g, "\n");
}

export function compareFieldValue(field, expected, observed) {
  const expectedRaw = String(expected ?? "");
  const observedRaw = String(observed ?? "");
  const expectedCanonical = normalizeLineEndings(expectedRaw);
  const observedCanonical = normalizeLineEndings(observedRaw);

  let ok = false;
  let mode = "mismatch";
  let comparisonObserved = observedCanonical;

  if (observedRaw === expectedRaw) {
    ok = true;
    mode = "exact";
  } else if (observedCanonical === expectedCanonical) {
    ok = true;
    mode = "line-ending-normalized";
  } else if (
    field.type === "textarea" &&
    observedCanonical.length === expectedCanonical.length + 1 &&
    observedCanonical.startsWith(expectedCanonical) &&
    SINGLE_TERMINAL_FORMATTING.has(observedCanonical.at(-1))
  ) {
    ok = true;
    mode = "single-terminal-formatting";
    comparisonObserved = observedCanonical.slice(0, -1);
  }

  return {
    ok,
    mode,
    expectedLength: expectedRaw.length,
    observedLength: observedRaw.length,
    rawLengthDelta: observedRaw.length - expectedRaw.length,
    expectedSha256: sha256(expectedRaw),
    observedSha256: sha256(observedRaw),
    expectedCanonicalSha256: sha256(expectedCanonical),
    observedCanonicalSha256: sha256(comparisonObserved),
    terminalCodePoint:
      mode === "single-terminal-formatting"
        ? `U+${observedCanonical.codePointAt(observedCanonical.length - 1).toString(16).toUpperCase().padStart(4, "0")}`
        : null,
  };
}

export function inspectDraft({ schema, draft, controls }) {
  if (!schema?.fields) throw new Error("A validated schema is required.");
  if (!draft || typeof draft !== "object") throw new Error("A draft object is required.");
  if (!Array.isArray(controls)) throw new Error("A control inventory is required.");

  const byName = new Map();
  for (const control of controls) {
    const name = String(control.name || "");
    const list = byName.get(name) || [];
    list.push(control);
    byName.set(name, list);
  }

  const blockers = [];
  const observations = [];

  for (const field of schema.fields) {
    const matches = byName.get(field.name) || [];
    if (matches.length === 0) {
      blockers.push({ code: "FIELD_MISSING", field: field.key, name: field.name });
      continue;
    }
    if (matches.length > 1) {
      blockers.push({ code: "FIELD_DUPLICATE", field: field.key, name: field.name, count: matches.length });
      continue;
    }

    const control = matches[0];
    const expected = String(draft[field.key] ?? "");
    const observed = String(control.value ?? "");
    const comparison = compareFieldValue(field, expected, observed);
    const observation = {
      field: field.key,
      name: field.name,
      required: field.required,
      visible: control.visible !== false,
      browserValid: control.valid !== false,
      validationMessage: String(control.validationMessage || ""),
      ...comparison,
    };
    observations.push(observation);

    if (control.visible === false) blockers.push({ code: "FIELD_NOT_VISIBLE", field: field.key, name: field.name });
    if (field.required && normalizeLineEndings(observed).trim().length === 0) {
      blockers.push({ code: "FIELD_REQUIRED", field: field.key, name: field.name });
    }
    if (!comparison.ok) blockers.push({ code: "FIELD_MISMATCH", field: field.key, name: field.name, ...comparison });
    if (control.valid === false) {
      blockers.push({
        code: "FIELD_INVALID",
        field: field.key,
        name: field.name,
        validationMessage: String(control.validationMessage || "Browser validation failed."),
      });
    }
  }

  const result = {
    ok: blockers.length === 0,
    schemaVersion: schema.version,
    schemaDigest: schema.digest,
    blockerCount: blockers.length,
    blockers,
    observations,
  };
  return { ...result, digest: sha256(stableJson(result)) };
}

export function evaluateAcknowledgment({
  mode,
  text,
  displayedTextDigest,
  personallyAffirmed,
  controlChecked = false,
  textStable = false,
}) {
  if (!ACKNOWLEDGMENT_MODES.has(mode)) throw new Error(`Unsupported acknowledgment mode: ${mode}.`);
  const normalizedText = normalizeLineEndings(text).trim();
  const currentTextDigest = normalizedText ? sha256(normalizedText) : null;
  const blockers = [];

  if (!normalizedText) blockers.push({ code: "ACKNOWLEDGMENT_TEXT_MISSING" });
  if (!personallyAffirmed) blockers.push({ code: "ACKNOWLEDGMENT_PERSONAL_ACTION_REQUIRED" });
  if (!textStable) blockers.push({ code: "ACKNOWLEDGMENT_TEXT_UNSTABLE" });
  if (displayedTextDigest && currentTextDigest !== displayedTextDigest) {
    blockers.push({ code: "ACKNOWLEDGMENT_TEXT_CHANGED", displayedTextDigest, currentTextDigest });
  }
  if (mode === "interactive-control" && !controlChecked) {
    blockers.push({ code: "ACKNOWLEDGMENT_CONTROL_NOT_CHECKED" });
  }

  const result = {
    ok: blockers.length === 0,
    mode,
    personallyAffirmed: Boolean(personallyAffirmed),
    controlChecked: mode === "terms-on-submit" ? null : Boolean(controlChecked),
    textStable: Boolean(textStable),
    currentTextDigest,
    blockers,
  };
  return { ...result, digest: sha256(stableJson(result)) };
}
