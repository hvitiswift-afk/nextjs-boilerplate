// Concept origin and project direction: Justin Lee Rackham (JP), MATADATA.
// AI-assisted engineering is disclosed. This file does not determine legal
// inventorship, ownership, assignment, partnership, or provider endorsement.

export const PRESSURE_STAGES = Object.freeze([
  { numerator: 1, denominator: 128, intent: "touch-detect", actionClass: "observe" },
  { numerator: 1, denominator: 64, intent: "hover", actionClass: "observe" },
  { numerator: 1, denominator: 32, intent: "focus", actionClass: "ordinary" },
  { numerator: 1, denominator: 16, intent: "select", actionClass: "ordinary" },
  { numerator: 1, denominator: 8, intent: "type-mode", actionClass: "ordinary" },
  { numerator: 1, denominator: 4, intent: "activate", actionClass: "ordinary" },
  { numerator: 1, denominator: 2, intent: "ordinary-confirmation", actionClass: "ordinary-confirmation" },
  { numerator: 1, denominator: 1, intent: "full-press", actionClass: "handoff-or-ordinary-confirmation" }
]);

export const PROTECTED_CATEGORIES = Object.freeze(new Set([
  "password",
  "passkey",
  "two-factor-authentication",
  "captcha",
  "human-verification",
  "liveness",
  "biometric",
  "identity-verification",
  "identity-attestation",
  "signature",
  "legal-terms",
  "consent",
  "payment",
  "recovery",
  "paid-conversion"
]));

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

export function normalizePressure(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error("Pressure number must be between 0 and 1.");
    }
    return value;
  }

  const text = String(value).trim().toLowerCase();
  if (text === "full") return 1;
  const match = text.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) throw new Error(`Unsupported pressure value: ${value}`);
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!denominator || numerator < 0 || numerator > denominator) {
    throw new Error(`Invalid pressure ratio: ${value}`);
  }
  return numerator / denominator;
}

export function pressureStage(value) {
  const normalized = normalizePressure(value);
  let selected = PRESSURE_STAGES[0];
  for (const stage of PRESSURE_STAGES) {
    if (normalized >= stage.numerator / stage.denominator) selected = stage;
  }
  return { ...selected, normalized };
}

export function evaluatePressureIntent({
  pressure,
  targetCategory = "ordinary",
  stableForMs = 0,
  released = false,
  confirmationHoldMs = 700,
  ordinaryHoldMs = 250
}) {
  const stage = pressureStage(pressure);
  const normalizedCategory = String(targetCategory).trim().toLowerCase();
  const protectedStep = PROTECTED_CATEGORIES.has(normalizedCategory);
  const requiredHoldMs = stage.normalized >= 0.5 ? confirmationHoldMs : ordinaryHoldMs;

  if (protectedStep) {
    return {
      allowed: false,
      disposition: "pause-and-handoff",
      reason: "Protected provider step requires JP.",
      stage,
      targetCategory: normalizedCategory
    };
  }

  if (stage.normalized < 1 / 32) {
    return {
      allowed: true,
      disposition: "observe-only",
      reason: "Pressure remains below the ordinary focus threshold.",
      stage,
      targetCategory: normalizedCategory
    };
  }

  if (stableForMs < requiredHoldMs) {
    return {
      allowed: false,
      disposition: "hold-not-stable",
      reason: `Hold for at least ${requiredHoldMs} ms.`,
      stage,
      targetCategory: normalizedCategory
    };
  }

  if (!released && stage.normalized >= 1 / 4) {
    return {
      allowed: false,
      disposition: "await-release-to-commit",
      reason: "Activation requires a stable press followed by release.",
      stage,
      targetCategory: normalizedCategory
    };
  }

  return {
    allowed: true,
    disposition: stage.intent,
    reason: "Ordinary local browser intent accepted by the pressure policy.",
    stage,
    targetCategory: normalizedCategory
  };
}

export function canonicalPressureLabel(stage) {
  const divisor = gcd(stage.numerator, stage.denominator);
  return `${stage.numerator / divisor}/${stage.denominator / divisor}`;
}
