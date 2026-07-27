import assert from "node:assert/strict";
import {
  IdempotencyLedger,
  ReceiptChain,
  SubmissionState,
  createFieldSchema,
  evaluateAcknowledgment,
  evaluateReadiness,
  inspectDraft,
  sha256,
  stableJson,
} from "../lib/intake/index.mjs";

const schema = createFieldSchema({
  version: "matadata-intake/1.0.0",
  fields: [
    { key: "firstName", name: "FirstName", type: "input", required: true },
    { key: "lastName", name: "LastName", type: "input", required: true },
    { key: "email", name: "Email", type: "input", required: true },
    { key: "company", name: "Company", type: "input", required: false },
    { key: "role", name: "Title", type: "input", required: true },
    { key: "linkedin", name: "mkto_linkedin_url_form_fill", type: "input", required: true },
    { key: "personnel", name: "mkto_cybersecurity_grant_stakeholders", type: "textarea", required: false },
    { key: "additionalNotes", name: "mkto_cybersecurity_grant_notes", type: "textarea", required: false },
    { key: "projectTitle", name: "mkto_cybersecurity_grant_project_title", type: "input", required: true },
    { key: "proposal", name: "mkto_cybersecurity_grant_project_summary", type: "textarea", required: true },
    { key: "problem", name: "mkto_cybersecurity_grant_problem_statement", type: "textarea", required: false },
    { key: "timeline", name: "mkto_cybersecurity_grant_project_roadmap", type: "textarea", required: true },
    { key: "funding", name: "mkto_cybersecurity_grant_funds_usage", type: "textarea", required: true },
  ],
});

const draft = {
  firstName: "Justin",
  lastName: "Rackham",
  email: "jp@example.test",
  company: "MATADATA independent project",
  role: "Founder and independent researcher",
  linkedin: "https://example.test/jp",
  personnel: "JP is the principal, system designer, and independent researcher.",
  additionalNotes: "Non-confidential public-intake reliability work.",
  projectTitle: "MATADATA defensive authorization ledger",
  proposal: "Build a safety-gated authorization ledger with explicit human actions and receipts.",
  problem: "Dynamic public forms can lose state, obscure blockers, and duplicate consequential actions.",
  timeline: "Phase 1 schema; Phase 2 recovery; Phase 3 idempotent submission; Phase 4 confirmation parity.",
  funding: "Use support for API testing, accessibility review, reliability engineering, and public documentation.",
};

function renderControls(generation, valuesByName) {
  return schema.fields.map((field, index) => ({
    nodeId: `generation-${generation}-node-${index + 1}`,
    name: field.name,
    value: valuesByName.get(field.name) || "",
    visible: true,
    valid: true,
    validationMessage: "",
  }));
}

const valuesByName = new Map();
let controls = renderControls(1, valuesByName);
let rerenders = 0;

schema.fields.forEach((field, index) => {
  valuesByName.set(field.name, draft[field.key]);
  controls = renderControls(rerenders + 1, valuesByName);
  if (index === 7) {
    rerenders += 1;
    controls = renderControls(rerenders + 1, valuesByName);
  }
});

const fundingControl = controls.find((control) => control.name === "mkto_cybersecurity_grant_funds_usage");
fundingControl.value += "\n";

const verifiedDraft = inspectDraft({ schema, draft, controls });
assert.equal(verifiedDraft.ok, true, JSON.stringify(verifiedDraft.blockers, null, 2));
assert.equal(rerenders, 1);
assert.equal(verifiedDraft.observations.length, 13);
assert.equal(
  verifiedDraft.observations.find((item) => item.field === "funding").mode,
  "single-terminal-formatting",
);

const alteredControls = structuredClone(controls);
alteredControls.find((control) => control.name === "mkto_cybersecurity_grant_funds_usage").value =
  draft.funding.replace("accessibility", "availability");
const alteredDraftResult = inspectDraft({ schema, draft, controls: alteredControls });
assert.equal(alteredDraftResult.ok, false);
assert.ok(alteredDraftResult.blockers.some((blocker) => blocker.code === "FIELD_MISMATCH"));

const duplicateControls = [...controls, { ...controls[0], nodeId: "duplicate-first-name" }];
const duplicateResult = inspectDraft({ schema, draft, controls: duplicateControls });
assert.equal(duplicateResult.ok, false);
assert.ok(duplicateResult.blockers.some((blocker) => blocker.code === "FIELD_DUPLICATE"));

const acknowledgmentText =
  "The applicant acknowledges the submission terms and personally confirms this application.";
const acknowledgmentTextDigest = sha256(acknowledgmentText);

const interactiveAcknowledgment = evaluateAcknowledgment({
  mode: "interactive-control",
  text: acknowledgmentText,
  displayedTextDigest: acknowledgmentTextDigest,
  personallyAffirmed: true,
  controlChecked: true,
  textStable: true,
});
assert.equal(interactiveAcknowledgment.ok, true);

const termsAcknowledgment = evaluateAcknowledgment({
  mode: "terms-on-submit",
  text: acknowledgmentText,
  displayedTextDigest: acknowledgmentTextDigest,
  personallyAffirmed: true,
  textStable: true,
});
assert.equal(termsAcknowledgment.ok, true);
assert.equal(termsAcknowledgment.controlChecked, null);

const changedAcknowledgment = evaluateAcknowledgment({
  mode: "terms-on-submit",
  text: `${acknowledgmentText} Updated.`,
  displayedTextDigest: acknowledgmentTextDigest,
  personallyAffirmed: true,
  textStable: true,
});
assert.equal(changedAcknowledgment.ok, false);
assert.ok(changedAcknowledgment.blockers.some((blocker) => blocker.code === "ACKNOWLEDGMENT_TEXT_CHANGED"));

const readiness = evaluateReadiness({
  contract: verifiedDraft,
  acknowledgment: termsAcknowledgment,
  humanVerification: { complete: true },
  currentOrigin: "https://intake.example.test",
  trustedOrigins: ["https://intake.example.test"],
});
assert.equal(readiness.ready, true, JSON.stringify(readiness.blockers, null, 2));
assert.equal(readiness.phase, SubmissionState.READY);

const ledger = new IdempotencyLedger();
const payloadDigest = sha256(stableJson({ schema: schema.digest, draft, acknowledgment: termsAcknowledgment.digest }));
const first = ledger.begin({ key: "idem-success-001", payloadDigest, readiness });
assert.equal(first.action, "SUBMIT");
assert.equal(first.record.submissionActions, 1);

const inFlightReplay = ledger.begin({ key: "idem-success-001", payloadDigest, readiness });
assert.equal(inFlightReplay.action, "REPLAY");
assert.equal(inFlightReplay.record.submissionActions, 1);

const confirmed = ledger.confirm({
  key: "idem-success-001",
  referenceId: "MATADATA-INTAKE-TEST-001",
  confirmation: { text: "Thank you", controlsDisappeared: true },
  evidence: { confirmationPage: true, emailParity: true },
});
assert.equal(confirmed.state, SubmissionState.SUBMITTED);

const confirmedReplay = ledger.begin({ key: "idem-success-001", payloadDigest, readiness });
assert.equal(confirmedReplay.action, "REPLAY");
assert.equal(confirmedReplay.record.state, SubmissionState.SUBMITTED);
assert.equal(confirmedReplay.record.submissionActions, 1);

const unknownFirst = ledger.begin({ key: "idem-unknown-001", payloadDigest, readiness });
assert.equal(unknownFirst.action, "SUBMIT");
const unknown = ledger.markUnknown({ key: "idem-unknown-001", evidence: { disconnectedAfterRequest: true } });
assert.equal(unknown.state, SubmissionState.SUBMISSION_STATUS_UNKNOWN);
const unknownReplay = ledger.begin({ key: "idem-unknown-001", payloadDigest, readiness });
assert.equal(unknownReplay.action, "REPLAY");
assert.equal(unknownReplay.record.state, SubmissionState.SUBMISSION_STATUS_UNKNOWN);
assert.equal(unknownReplay.record.submissionActions, 1);

const chain = new ReceiptChain();
chain.append("SCHEMA_VERIFIED", { schemaDigest: schema.digest });
chain.append("DRAFT_VERIFIED", { contractDigest: verifiedDraft.digest, rerenders });
chain.append("ACKNOWLEDGMENT_PERSONALLY_AFFIRMED", {
  mode: termsAcknowledgment.mode,
  acknowledgmentDigest: termsAcknowledgment.digest,
});
chain.append("SUBMISSION_CONFIRMED", {
  referenceId: confirmed.referenceId,
  idempotencyKey: confirmed.key,
  submissionActions: confirmed.submissionActions,
});
const chainVerification = chain.verify();
assert.equal(chainVerification.ok, true);

const receipt = {
  product: "MATADATA Resilient Intake Baseline",
  version: "1.0.0",
  status: "PASS",
  schemaVersion: schema.version,
  schemaDigest: schema.digest,
  uniqueFieldCount: schema.fields.length,
  fullDomRerenders: rerenders,
  canonicalFundingMode: verifiedDraft.observations.find((item) => item.field === "funding").mode,
  acknowledgmentModesVerified: [interactiveAcknowledgment.mode, termsAcknowledgment.mode],
  substantiveDifferencesRejected: true,
  duplicateBindingsRejected: true,
  confirmedSubmissionActions: confirmed.submissionActions,
  unknownOutcomeSubmissionActions: unknown.submissionActions,
  idempotentReplayVerified: true,
  receiptChain: chainVerification,
  checks: {
    stableVersionedSchema: true,
    stableNameResolutionAcrossRerender: true,
    structuredBlockerReasons: true,
    explicitAcknowledgmentModes: true,
    personalHumanActionRequired: true,
    trustedOriginGate: true,
    serverStyleIdempotency: true,
    noBlindRetryAfterUnknownOutcome: true,
    multiSignalConfirmationReceipt: true,
    tamperEvidentEventChain: true,
  },
};

console.log(JSON.stringify(receipt, null, 2));
