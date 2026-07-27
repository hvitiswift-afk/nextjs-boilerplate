const catalog = {
  FIELD_MISSING: {
    severity: "error",
    audience: "operator",
    retry: "after-fix",
    title: "Required control is missing",
    explanation: "The current form no longer contains the stable control named by the versioned field contract.",
    nextAction: "Reload the current schema, inspect form drift, and do not submit until the control is restored or the contract is deliberately versioned.",
  },
  FIELD_DUPLICATE: {
    severity: "error",
    audience: "operator",
    retry: "after-fix",
    title: "More than one control has the same stable identity",
    explanation: "The form contains duplicate bindings, so the intended destination for the value is ambiguous.",
    nextAction: "Remove the duplicate binding or publish a new schema version with unique control identities.",
  },
  FIELD_NOT_VISIBLE: {
    severity: "error",
    audience: "operator",
    retry: "after-fix",
    title: "A contracted field is not visible",
    explanation: "The control exists but is not presently available to the applicant.",
    nextAction: "Restore the intended form step or explain the conditional requirement before retrying validation.",
  },
  FIELD_REQUIRED: {
    severity: "error",
    audience: "applicant",
    retry: "after-fix",
    title: "A required answer is empty",
    explanation: "A required field has no meaningful value after canonical line-ending normalization.",
    nextAction: "Complete the identified field, then run full-form validation again.",
  },
  FIELD_MISMATCH: {
    severity: "error",
    audience: "operator",
    retry: "after-fix",
    title: "The rendered value differs from the reviewed draft",
    explanation: "The form value and reviewed draft do not match under the narrowly bounded representation rules.",
    nextAction: "Repair only the named field, re-resolve it after any rerender, and compare the entire form again.",
  },
  FIELD_INVALID: {
    severity: "error",
    audience: "applicant",
    retry: "after-fix",
    title: "Browser validation rejected a field",
    explanation: "The browser or form library reports a validation error for the identified control.",
    nextAction: "Show the validation message beside the field and require correction before acknowledgment or submission.",
  },
  FIELD_CONTRACT_FAILED: {
    severity: "error",
    audience: "operator",
    retry: "after-fix",
    title: "The field contract did not validate",
    explanation: "The form could not be proven to match the active versioned schema.",
    nextAction: "Stop submission, preserve the drift receipt, and publish a reviewed schema update if the form legitimately changed.",
  },
  HUMAN_VERIFICATION_REQUIRED: {
    severity: "warning",
    audience: "applicant",
    retry: "human-only",
    title: "Human verification is required",
    explanation: "A CAPTCHA, identity check, signature, or equivalent human-only step has not been completed.",
    nextAction: "Return control to the applicant. Automation must not solve or bypass the human-verification step.",
  },
  ACKNOWLEDGMENT_REQUIRED: {
    severity: "warning",
    audience: "applicant",
    retry: "human-only",
    title: "Applicant acknowledgment is required",
    explanation: "The current terms have not been personally reviewed and affirmed.",
    nextAction: "Display the current terms, require the applicant's explicit action, and verify the same text remains current.",
  },
  ACKNOWLEDGMENT_TEXT_MISSING: {
    severity: "error",
    audience: "operator",
    retry: "after-fix",
    title: "Acknowledgment text is unavailable",
    explanation: "The system cannot retrieve the complete terms the applicant is being asked to affirm.",
    nextAction: "Do not request acknowledgment or submit until the complete current text is available.",
  },
  ACKNOWLEDGMENT_PERSONAL_ACTION_REQUIRED: {
    severity: "warning",
    audience: "applicant",
    retry: "human-only",
    title: "Personal acknowledgment action is missing",
    explanation: "The applicant has not performed the required affirmative action for the displayed terms.",
    nextAction: "Require a fresh personal action; do not infer consent from navigation, silence, or automation state.",
  },
  ACKNOWLEDGMENT_TEXT_UNSTABLE: {
    severity: "error",
    audience: "operator",
    retry: "after-fix",
    title: "Acknowledgment text is changing",
    explanation: "The terms did not remain stable across the required observations.",
    nextAction: "Wait for the form to settle, then display and hash the current text again before personal acknowledgment.",
  },
  ACKNOWLEDGMENT_TEXT_CHANGED: {
    severity: "warning",
    audience: "applicant",
    retry: "human-only",
    title: "The terms changed after they were displayed",
    explanation: "The current acknowledgment digest differs from the copy the applicant reviewed.",
    nextAction: "Invalidate the earlier affirmation and require the applicant to review the new text.",
  },
  ACKNOWLEDGMENT_CONTROL_NOT_CHECKED: {
    severity: "warning",
    audience: "applicant",
    retry: "human-only",
    title: "The official acknowledgment control is not checked",
    explanation: "An interactive acknowledgment control exists but has not been positively verified as selected.",
    nextAction: "Return control to the applicant or use the form's own accessible control; do not substitute an unrelated element.",
  },
  UNTRUSTED_ORIGIN: {
    severity: "critical",
    audience: "operator",
    retry: "after-fix",
    title: "The current origin is not trusted",
    explanation: "The browser is not on an allow-listed HTTPS origin for this intake contract.",
    nextAction: "Stop immediately, preserve the origin receipt, and navigate only through an approved route.",
  },
  SUBMISSION_ALREADY_IN_PROGRESS: {
    severity: "warning",
    audience: "system",
    retry: "replay-only",
    title: "Submission is already in progress",
    explanation: "The idempotency key already owns an in-flight submission action.",
    nextAction: "Return the existing record and poll or reconcile it; never create another submission action.",
  },
  SUBMISSION_ALREADY_CONFIRMED: {
    severity: "info",
    audience: "system",
    retry: "replay-only",
    title: "Submission is already confirmed",
    explanation: "A confirmed record already exists for this idempotency key and payload.",
    nextAction: "Replay the original confirmation and reference ID without contacting the destination again.",
  },
  SUBMISSION_STATUS_UNKNOWN_NO_RETRY: {
    severity: "critical",
    audience: "operator",
    retry: "never",
    title: "Submission outcome is unknown",
    explanation: "A consequential request may have reached the destination, but positive confirmation was not obtained.",
    nextAction: "Do not retry. Reconcile through destination records, support, or a reference lookup before any new action is authorized.",
  },
  READINESS_NOT_PROVIDED: {
    severity: "error",
    audience: "system",
    retry: "after-fix",
    title: "Readiness evidence is missing",
    explanation: "The exactly-once ledger was asked to begin without a verified readiness receipt.",
    nextAction: "Run field, origin, human-verification, and acknowledgment gates before creating an idempotency record.",
  },
  CONFIRMATION_REFERENCE_MISMATCH: {
    severity: "critical",
    audience: "operator",
    retry: "never",
    title: "Confirmation references do not match",
    explanation: "The page, email, or durable receipt identifies a different submission reference.",
    nextAction: "Treat confirmation as unresolved and reconcile the records; do not send a second submission.",
  },
  CONFIRMATION_DIGEST_MISMATCH: {
    severity: "critical",
    audience: "operator",
    retry: "never",
    title: "Confirmation evidence digests do not match",
    explanation: "The confirmation surfaces disagree about the evidence associated with the reference ID.",
    nextAction: "Preserve every surface and reconcile the authoritative record before marking the submission confirmed.",
  },
};

export const BLOCKER_CATALOG = Object.freeze(
  Object.fromEntries(Object.entries(catalog).map(([code, value]) => [code, Object.freeze({ code, ...value })])),
);

export function describeBlocker(blocker = {}) {
  const code = String(blocker.code || "UNKNOWN_BLOCKER");
  const known = BLOCKER_CATALOG[code];
  if (known) return { ...known, details: structuredClone(blocker) };
  return {
    code,
    severity: "error",
    audience: "operator",
    retry: "after-fix",
    title: "Unrecognized intake blocker",
    explanation: "The intake system returned a blocker code that is not in the active catalog.",
    nextAction: "Stop submission, preserve the raw blocker, and update the versioned blocker catalog before continuing.",
    details: structuredClone(blocker),
  };
}

export function explainBlockers(blockers = []) {
  return blockers.map((blocker) => describeBlocker(blocker));
}

export function summarizeBlockers(blockers = []) {
  const explained = explainBlockers(blockers);
  const counts = { critical: 0, error: 0, warning: 0, info: 0 };
  for (const blocker of explained) counts[blocker.severity] = (counts[blocker.severity] || 0) + 1;
  const retryPolicies = [...new Set(explained.map((blocker) => blocker.retry))];
  return {
    blockerCount: explained.length,
    counts,
    requiresHumanAction: explained.some((blocker) => blocker.retry === "human-only"),
    blindRetryProhibited: explained.some((blocker) => blocker.retry === "never" || blocker.retry === "replay-only"),
    retryPolicies,
    blockers: explained,
  };
}
