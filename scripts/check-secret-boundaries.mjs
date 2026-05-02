import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", ".next", "out", "build", "coverage", ".vercel"]);
const ignoredFilePatterns = [/package-lock\.json$/];

const requiredGitignoreRules = [".env*", ".vercel", "*.pem"];
const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const rule of requiredGitignoreRules) {
  assert(gitignore.split(/\r?\n/).includes(rule), `.gitignore must include ${rule}`);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...walk(fullPath));
      }
      continue;
    }

    if (ignoredFilePatterns.some((pattern) => pattern.test(relativePath))) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

const suspiciousPatterns = [
  {
    name: "hardcoded Vercel bearer token",
    pattern: /authorization\s*:\s*[`'"]Bearer\s+(?!\$\{?token\}?|\$VERCEL_TOKEN|process\.env\.VERCEL_TOKEN)[^`'"\s]+/i
  },
  {
    name: "committed VERCEL_TOKEN assignment",
    pattern: /VERCEL_TOKEN\s*=\s*(?!["']?(your-token-here|paste-token-here|\$\{?VERCEL_TOKEN\}?)["']?\s*$)["']?[A-Za-z0-9_\-]{20,}["']?/m
  },
  {
    name: "committed generic API token assignment",
    pattern: /(API_TOKEN|ACCESS_TOKEN|AUTH_TOKEN)\s*=\s*["']?[A-Za-z0-9_\-]{24,}["']?/m
  }
];

const violations = [];

for (const file of walk(root)) {
  const relativePath = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");

  for (const { name, pattern } of suspiciousPatterns) {
    if (pattern.test(content)) {
      violations.push(`${relativePath}: ${name}`);
    }
  }
}

assert(violations.length === 0, `secret boundary violations found:\n${violations.join("\n")}`);

console.log(JSON.stringify({
  id: "check-secret-boundaries",
  status: "passed",
  required_gitignore_rules: requiredGitignoreRules,
  token_printed: false
}, null, 2));
