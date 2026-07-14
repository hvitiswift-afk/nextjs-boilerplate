export type LanguageCodeMode = "language-to-code" | "code-to-language";

export type SupportedCodeTarget =
  | "typescript"
  | "javascript"
  | "python"
  | "json"
  | "bash"
  | "sql";

export type LanguageCodeRequest = {
  mode: LanguageCodeMode;
  input: string;
  humanLanguage?: string;
  codeTarget?: SupportedCodeTarget;
};

const targetTemplates: Record<SupportedCodeTarget, (intent: string) => string> = {
  typescript: (intent) => `export function run(input: unknown) {\n  // Intent: ${intent}\n  return { ok: true, input };\n}`,
  javascript: (intent) => `export function run(input) {\n  // Intent: ${intent}\n  return { ok: true, input };\n}`,
  python: (intent) => `def run(input_value):\n    \"\"\"Intent: ${intent}\"\"\"\n    return {\"ok\": True, \"input\": input_value}`,
  json: (intent) => JSON.stringify({ intent, status: "prepared", externalActionCompleted: false }, null, 2),
  bash: (intent) => `#!/usr/bin/env bash\nset -euo pipefail\n# Intent: ${intent}\nprintf '%s\\n' 'prepared'`,
  sql: (intent) => `-- Intent: ${intent}\nSELECT 'prepared' AS status, FALSE AS external_action_completed;`,
};

function normalizeInput(input: string) {
  const normalized = input.trim().replace(/\s+/g, " ");
  if (!normalized) throw new Error("Input is required.");
  if (normalized.length > 12000) throw new Error("Input exceeds 12,000 characters.");
  return normalized;
}

function summarizeCode(code: string, language: string) {
  const lines = code.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const signals = {
    functions: (code.match(/\b(function|def|=>)\b/g) || []).length,
    conditions: (code.match(/\b(if|else|elif|switch|case)\b/g) || []).length,
    loops: (code.match(/\b(for|while)\b/g) || []).length,
    returns: (code.match(/\breturn\b/g) || []).length,
    networkCalls: (code.match(/\b(fetch|axios|requests\.|curl\b)/g) || []).length,
    storageWrites: (code.match(/\b(localStorage|writeFile|INSERT|UPDATE|DELETE)\b/gi) || []).length,
  };

  const caution = signals.networkCalls > 0 || signals.storageWrites > 0
    ? "The code appears to include network or persistence behavior and should be reviewed before execution."
    : "No obvious network or persistence behavior was detected by this lightweight static summary.";

  return {
    summary: `This ${language} code contains ${lines.length} non-empty lines, ${signals.functions} function-like declarations, ${signals.conditions} conditional branches, ${signals.loops} loops, and ${signals.returns} return statements.`,
    signals,
    caution,
  };
}

export function bridgeLanguageAndCode(request: LanguageCodeRequest) {
  const input = normalizeInput(request.input);
  const humanLanguage = request.humanLanguage?.trim() || "auto";

  if (request.mode === "language-to-code") {
    const codeTarget = request.codeTarget ?? "typescript";
    const code = targetTemplates[codeTarget](input.replace(/\*\//g, "* /"));
    return {
      schema: "jp-hviti-language-code-bridge/v1",
      mode: request.mode,
      humanLanguage,
      codeTarget,
      normalizedIntent: input,
      code,
      generatedBy: "deterministic-template-bridge",
      requiresHumanReview: true,
      codeExecuted: false,
      externalActionCompleted: false as const,
    };
  }

  const codeTarget = request.codeTarget ?? "typescript";
  const explanation = summarizeCode(input, codeTarget);
  return {
    schema: "jp-hviti-language-code-bridge/v1",
    mode: request.mode,
    humanLanguage,
    codeTarget,
    explanation,
    generatedBy: "deterministic-static-summary",
    requiresHumanReview: true,
    codeExecuted: false,
    externalActionCompleted: false as const,
  };
}
