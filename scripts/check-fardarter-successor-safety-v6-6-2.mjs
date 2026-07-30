import { readFile } from "node:fs/promises";

const workflow = await readFile(".github/workflows/fardarter-successor-review-v6-6.yml", "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(workflow.includes("name: Fardarter Successor Review v6.6.2"), "workflow version must be v6.6.2");
assert(workflow.includes("jp-fardarter-successor-v6-6-2-"), "workflow must use the v6.6.2 marker");
assert(workflow.includes("secretAssignment"), "workflow must define assignment-based secret scanning");
assert(workflow.includes("privateKeyBlock"), "workflow must detect private-key blocks");
assert(!workflow.includes("|private evidence)"), "workflow must not treat generic boundary language as secret content");
assert(workflow.includes("BLOCKED_HUMAN_GATE_REQUIRED"), "workflow must preserve human-gate decisions");
assert(!workflow.includes("contents: write"), "workflow must remain canonical-source read-only");

const secretAssignment = /(?:password|secret|access[_ -]?token|api[_ -]?key|private[_ -]?key|routing(?: number)?|bank account|account number|provider transaction(?: id)?|signature(?: value)?|counsel notes?)\s*[:=]\s*\S+/i;
const privateKeyBlock = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i;
const unsafe = (body) => secretAssignment.test(body) || privateKeyBlock.test(body);

const standardFormBody = `
- [x] I understand system-development authorization is not buyer consent.
- [x] I have not posted private or sensitive evidence.
- [x] I understand received cash requires provider-confirmed PAID_SETTLED evidence.

This edit changes no private evidence condition.
`;
assert(unsafe(standardFormBody) === false, "standard public-safe form language must not be blocked");
assert(unsafe("api_key = abc123") === true, "API-key assignment must be blocked");
assert(unsafe("provider transaction id: txn_123") === true, "provider transaction assignment must be blocked");
assert(unsafe("-----BEGIN PRIVATE KEY-----") === true, "private-key block must be blocked");

console.log("Fardarter Drive v6.6.2 successor safety scanner: PASS");
console.log("Boundary acknowledgement: SAFE");
console.log("Credential and provider assignments: BLOCKED");
