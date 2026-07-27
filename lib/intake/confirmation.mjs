import { randomUUID } from "node:crypto";
import { sha256, stableJson } from "./contract.mjs";
import { SubmissionState } from "./state-machine.mjs";

const REFERENCE_PATTERN = /^[A-Z][A-Z0-9]{1,7}-\d{8}-[A-F0-9]{12}$/;

function requireText(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
}

export function createReferenceId({
  namespace = "MTD",
  now = new Date().toISOString(),
  entropy = randomUUID(),
} = {}) {
  const normalizedNamespace = String(namespace || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  if (!/^[A-Z][A-Z0-9]{1,7}$/.test(normalizedNamespace)) {
    throw new Error("The confirmation namespace must begin with a letter and contain 2 to 8 alphanumeric characters.");
  }
  const date = new Date(now);
  if (Number.isNaN(date.getTime())) throw new Error("A valid confirmation timestamp is required.");
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const token = sha256(stableJson({ namespace: normalizedNamespace, now: date.toISOString(), entropy }))
    .slice(0, 12)
    .toUpperCase();
  return `${normalizedNamespace}-${datePart}-${token}`;
}

export function validateReferenceId(referenceId) {
  return REFERENCE_PATTERN.test(String(referenceId || "").trim());
}

export function buildConfirmationBundle({
  record,
  applicantEmail,
  confirmationBaseUrl = "https://intake.example.test/matadata/intake/confirmation",
}) {
  if (!record || record.state !== SubmissionState.SUBMITTED) {
    throw new Error("A confirmed submission record is required.");
  }
  const referenceId = requireText(record.referenceId, "A confirmation reference ID");
  if (!validateReferenceId(referenceId)) throw new Error(`Invalid confirmation reference ID: ${referenceId}.`);
  const confirmationDigest = requireText(record.confirmationDigest, "A confirmation digest");
  const email = requireText(applicantEmail, "An applicant email address");
  const base = confirmationBaseUrl.replace(/\/$/, "");
  const pageUrl = `${base}/${encodeURIComponent(referenceId)}`;

  const page = {
    status: SubmissionState.SUBMITTED,
    heading: "Submission received",
    referenceId,
    confirmationDigest,
    pageUrl,
    submissionActions: record.submissionActions,
  };
  const emailArtifact = {
    to: email,
    subject: `Submission received — ${referenceId}`,
    referenceId,
    confirmationDigest,
    headers: {
      "X-MATADATA-Reference": referenceId,
      "X-MATADATA-Confirmation-Digest": confirmationDigest,
    },
    bodyText: [
      "Your submission was received.",
      `Reference ID: ${referenceId}`,
      `Confirmation page: ${pageUrl}`,
      "Keep this reference for support or reconciliation.",
    ].join("\n"),
  };
  const receipt = {
    status: SubmissionState.SUBMITTED,
    idempotencyKey: record.key,
    payloadDigest: record.payloadDigest,
    referenceId,
    confirmationDigest,
    submissionActions: record.submissionActions,
    updatedAt: record.updatedAt,
  };
  const bundle = { page, email: emailArtifact, receipt };
  return { ...bundle, digest: sha256(stableJson(bundle)) };
}

export function verifyConfirmationParity(bundle) {
  const surfaces = [
    { surface: "page", referenceId: bundle?.page?.referenceId, confirmationDigest: bundle?.page?.confirmationDigest },
    { surface: "email", referenceId: bundle?.email?.referenceId, confirmationDigest: bundle?.email?.confirmationDigest },
    { surface: "receipt", referenceId: bundle?.receipt?.referenceId, confirmationDigest: bundle?.receipt?.confirmationDigest },
  ];
  const blockers = [];
  const referenceIds = [...new Set(surfaces.map((item) => item.referenceId).filter(Boolean))];
  const confirmationDigests = [...new Set(surfaces.map((item) => item.confirmationDigest).filter(Boolean))];

  if (surfaces.some((item) => !item.referenceId) || referenceIds.length !== 1) {
    blockers.push({ code: "CONFIRMATION_REFERENCE_MISMATCH", surfaces });
  }
  if (surfaces.some((item) => !item.confirmationDigest) || confirmationDigests.length !== 1) {
    blockers.push({ code: "CONFIRMATION_DIGEST_MISMATCH", surfaces });
  }

  const referenceId = referenceIds.length === 1 ? referenceIds[0] : null;
  if (referenceId) {
    if (!bundle.email.subject.includes(referenceId)) {
      blockers.push({ code: "CONFIRMATION_REFERENCE_MISMATCH", surface: "email-subject", referenceId });
    }
    if (!bundle.email.bodyText.includes(referenceId)) {
      blockers.push({ code: "CONFIRMATION_REFERENCE_MISMATCH", surface: "email-body", referenceId });
    }
    if (bundle.email.headers?.["X-MATADATA-Reference"] !== referenceId) {
      blockers.push({ code: "CONFIRMATION_REFERENCE_MISMATCH", surface: "email-header", referenceId });
    }
    if (!bundle.page.pageUrl.endsWith(`/${encodeURIComponent(referenceId)}`)) {
      blockers.push({ code: "CONFIRMATION_REFERENCE_MISMATCH", surface: "page-url", referenceId });
    }
  }

  const result = {
    ok: blockers.length === 0,
    referenceId,
    confirmationDigest: confirmationDigests.length === 1 ? confirmationDigests[0] : null,
    surfaces,
    blockers,
  };
  return { ...result, digest: sha256(stableJson(result)) };
}
