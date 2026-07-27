#!/usr/bin/env python3
"""Upgrade the checksum-locked MATADATA Pathfinder package from V2.2 to V2.3.

The upgrade is fail-closed: every source replacement must match exactly once, the
patched runner must pass syntax and self-tests, and the rebuilt package is
rejected unless it can be extracted and verified again.
"""

from __future__ import annotations

import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile

ROOT = Path.cwd()
PART_DIR = ROOT / "tools" / "matadata-pathfinder" / "v22"
WORKFLOW = ROOT / ".github" / "workflows" / "matadata-openai-pathfinder-v22.yml"
OLD_PACKAGE_SHA = "f24a9cab7980e8d43a6be642e16500828952d89c1285af4cfff2ed363e078d11"
OLD_RUNNER_SHA = "d7fabf86cd9aa63644e9d09c5c0d2201b205503c2a0072502ee7cd1644faaf2b"
OLD_APPLICATION_SHA = "6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340"
OLD_VERSION = "2.2.0"
NEW_VERSION = "2.3.0"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    require(count == 1, f"Expected exactly one {label} target; found {count}.")
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str, flags: int = re.S) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    require(count == 1, f"Expected exactly one {label} regex target; found {count}.")
    return updated


def run(command: list[str], *, env: dict[str, str] | None = None, cwd: Path | None = None) -> None:
    subprocess.run(command, check=True, env=env, cwd=cwd, text=True)


def deterministic_gzip(data: bytes) -> bytes:
    buffer = io.BytesIO()
    with gzip.GzipFile(filename="", mode="wb", fileobj=buffer, compresslevel=9, mtime=0) as archive:
        archive.write(data)
    return buffer.getvalue()


def patch_runner(source: str) -> str:
    source = replace_once(source, "const RUNNER_VERSION = '2.2.0';", "const RUNNER_VERSION = '2.3.0';", "runner version")

    source = regex_once(
        source,
        r"  projectTitle: '[^\n]*',\n  descriptiveSentence: '[^\n]*',\n",
        "  projectTitle: 'MATADATA is a defensive authorization ledger for safety-gated AI tool execution with tamper-evident receipts.',\n",
        "project-title consolidation",
    )

    field_specs = """const FIELD_SPECS = [
  { key: 'firstName', name: 'FirstName', pattern: /First name/i },
  { key: 'lastName', name: 'LastName', pattern: /Last name/i },
  { key: 'email', name: 'Email', pattern: /^Email/i },
  { key: 'company', name: 'Company', pattern: /Company or University/i },
  { key: 'role', name: 'Title', pattern: /Role\\s*\\/\\s*Title/i },
  { key: 'linkedin', name: 'mkto_linkedin_url_form_fill', pattern: /LinkedIn/i },
  { key: 'personnel', name: 'mkto_cybersecurity_grant_stakeholders', pattern: /other people working with you/i },
  { key: 'additionalNotes', name: 'mkto_cybersecurity_grant_notes', pattern: /Additional notes/i },
  { key: 'projectTitle', name: 'mkto_cybersecurity_grant_project_title', pattern: /Project title|One descriptive sentence/i },
  { key: 'proposal', name: 'mkto_cybersecurity_grant_project_summary', pattern: /Project proposal/i },
  { key: 'problem', name: 'mkto_cybersecurity_grant_problem_statement', pattern: /What problem are you trying to solve/i },
  { key: 'timeline', name: 'mkto_cybersecurity_grant_project_roadmap', pattern: /Project timeline/i },
  { key: 'funding', name: 'mkto_cybersecurity_grant_funds_usage', pattern: /Requested funding|API credits|resources needed/i }
];"""
    source = regex_once(source, r"const FIELD_SPECS = \[.*?\n\];", field_specs, "field specification block")

    stable_helpers = r"""
async function resolveFieldControl(spec) {
  if (spec && spec.name) {
    const exact = page.locator(`[name="${String(spec.name).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`).first();
    if (await visible(exact)) return exact;
  }
  return locateControl(spec.pattern);
}

async function stableFieldIdentity(control) {
  return control.evaluate((el) => ({
    tag: el.tagName.toLowerCase(),
    type: el.getAttribute('type'),
    name: el.getAttribute('name'),
    id: el.id || null,
    ariaLabel: el.getAttribute('aria-label'),
    placeholder: el.getAttribute('placeholder')
  }));
}

async function preflightFieldContract() {
  const missing = [];
  const duplicates = [];
  const bindings = [];
  const owners = new Map();
  for (const spec of FIELD_SPECS) {
    try {
      const control = await resolveFieldControl(spec);
      const identity = await stableFieldIdentity(control);
      const stableKey = identity.name
        ? `name:${identity.name}`
        : identity.id
          ? `id:${identity.id}`
          : `fallback:${identity.tag}:${identity.type || ''}:${identity.ariaLabel || ''}:${identity.placeholder || ''}`;
      if (owners.has(stableKey)) duplicates.push({ stableKey, firstKey: owners.get(stableKey), secondKey: spec.key });
      else owners.set(stableKey, spec.key);
      bindings.push({ key: spec.key, expectedName: spec.name, stableKey, ...identity });
    } catch (err) {
      missing.push({ key: spec.key, expectedName: spec.name, pattern: String(spec.pattern), error: String(err) });
    }
  }
  return { ok: missing.length === 0 && duplicates.length === 0, missing, duplicates, bindings };
}

async function fillStableField(spec, value) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      let control = await resolveFieldControl(spec);
      await control.scrollIntoViewIfNeeded().catch(() => {});
      const tag = await control.evaluate((el) => el.tagName.toLowerCase());
      const editable = await control.getAttribute('contenteditable');
      if (tag === 'select') {
        await control.selectOption({ label: value }).catch(async () => control.selectOption(value));
      } else if (editable === 'true') {
        await control.click();
        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
        await page.keyboard.insertText(value);
      } else {
        await control.fill(value, { timeout: 15000 });
      }
      await control.evaluate((el) => {
        el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
      }).catch(() => {});
      await page.waitForTimeout(250 * attempt);
      control = await resolveFieldControl(spec);
      const observed = await controlValue(control);
      if (observed !== value) throw new Error(`Value verification mismatch: expected ${value.length} chars, observed ${observed.length}.`);
      const details = await stableFieldIdentity(control);
      const validity = await control.evaluate((el) => ({
        required: Boolean(el.required || el.getAttribute('aria-required') === 'true'),
        valid: typeof el.checkValidity === 'function' ? el.checkValidity() : true,
        validationMessage: typeof el.validationMessage === 'string' ? el.validationMessage : ''
      }));
      return { key: spec.key, length: value.length, valueSha256: sha256(value), attempt, ...details, ...validity };
    } catch (err) {
      lastError = err;
      await page.waitForTimeout(500 * attempt);
    }
  }
  throw new Error(`Failed to fill ${spec.key}: ${String(lastError)}`);
}

async function verifyAllApplicationFields() {
  const mismatches = [];
  const observations = [];
  for (const spec of FIELD_SPECS) {
    try {
      const control = await resolveFieldControl(spec);
      const observed = await controlValue(control);
      const expected = application[spec.key];
      const identity = await stableFieldIdentity(control);
      const ok = observed === expected;
      observations.push({ key: spec.key, ok, expectedLength: expected.length, observedLength: observed.length, expectedSha256: sha256(expected), observedSha256: sha256(observed), ...identity });
      if (!ok) mismatches.push({ key: spec.key, expectedLength: expected.length, observedLength: observed.length, expectedSha256: sha256(expected), observedSha256: sha256(observed), ...identity });
    } catch (err) {
      mismatches.push({ key: spec.key, error: String(err) });
    }
  }
  return { ok: mismatches.length === 0, mismatches, observations };
}
"""
    source = replace_once(source, "\nasync function controlValue(control) {", stable_helpers + "\nasync function controlValue(control) {", "stable field helper insertion")

    source = regex_once(
        source,
        r"async function fillLocatedField\(spec, control, value\) \{.*?\n\}\n\nasync function findAcknowledgmentInfo",
        "async function findAcknowledgmentInfo",
        "legacy retained-locator fill function removal",
    )

    fill_application = r"""async function fillApplication() {
  if (fillInProgress || state.formFilled) return;
  fillInProgress = true;
  try {
    setState({ phase: 'PREFLIGHTING_FORM', message: 'Human verification cleared. Verifying the trusted OpenAI origin and stable field contract before entering application data.' });
    if (!await requireTrustedPage('before-fill')) return;
    await collectFormSchema();

    const contract = await preflightFieldContract();
    await fsp.writeFile(path.join(ARTIFACT_DIR, 'field-contract.json'), JSON.stringify(contract, null, 2));
    if (!contract.ok) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'form-structure-changed.png'), fullPage: true }).catch(() => {});
      await finish('FORM_STRUCTURE_CHANGED', `The current form failed the stable field contract: ${contract.missing.length} missing and ${contract.duplicates.length} duplicate binding(s). No submit click occurred.`, { missingFields: contract.missing, duplicateBindings: contract.duplicates });
      return;
    }

    setState({ phase: 'FILLING_FORM', message: 'Stable form contract validated. Filling and re-resolving every reviewed field.' });
    fieldManifest = [];
    for (const spec of FIELD_SPECS) fieldManifest.push(await fillStableField(spec, application[spec.key]));

    const fieldVerification = await verifyAllApplicationFields();
    await fsp.writeFile(path.join(ARTIFACT_DIR, 'field-verification.json'), JSON.stringify(fieldVerification, null, 2));
    if (!fieldVerification.ok) {
      await finish('VALIDATION_ERROR', `Final field verification found ${fieldVerification.mismatches.length} mismatch(es); no submit click occurred.`, { fieldMismatches: fieldVerification.mismatches });
      return;
    }

    await fsp.writeFile(path.join(ARTIFACT_DIR, 'field-manifest.json'), JSON.stringify({
      applicationSha256: sha256(JSON.stringify(application)),
      formSchemaDigest,
      fields: fieldManifest,
      verification: fieldVerification
    }, null, 2));

    await page.waitForTimeout(1200);
    const invalid = await invalidFieldDetails();
    const ack = await focusAcknowledgment();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'application-filled-before-acknowledgment.png') }).catch(() => {});
    setState({
      phase: 'ACKNOWLEDGMENT_REQUIRED',
      message: invalid.count > 0
        ? `The application is filled and value-verified, but ${invalid.count} browser validation field(s) remain. No submission can occur until validation clears.`
        : ack.textValid
          ? 'The application is filled and value-verified. JP must personally review and accept OpenAI’s current acknowledgment in the separate panel.'
          : 'The application is filled and value-verified, but the complete OpenAI acknowledgment text is not yet available. Use Focus required step or Refresh.',
      formFilled: true,
      invalidCount: invalid.count,
      invalidFields: invalid.details,
      acknowledgmentTargetFound: ack.targetFound || ack.textFound,
      acknowledgmentText: ack.textValid ? ack.normalizedText : null,
      acknowledgmentTextSha256: ack.textSha256,
      acknowledgmentTextValid: ack.textValid,
      currentUrl: page.url(),
      title: await page.title().catch(() => '')
    });
  } finally {
    fillInProgress = false;
  }
}"""
    source = regex_once(source, r"async function fillApplication\(\) \{.*?\n\}\n\nasync function applyUnderlyingAcknowledgment", fill_application + "\n\nasync function applyUnderlyingAcknowledgment", "fillApplication replacement")

    apply_ack = r"""async function applyUnderlyingAcknowledgment() {
  let info = await findAcknowledgmentInfo();
  const text = normalizeAcknowledgmentText(info.textSnippet);
  if (!acknowledgmentTextValid(text)) return { ok: false, mode: 'missing', reason: 'The complete OpenAI acknowledgment text is not available in the current form DOM.', info };

  if (!info.targetFound) {
    return { ok: true, mode: 'official-terms-text-only', reason: 'OpenAI presents the acknowledgment as official terms text without a separate interactive control. JP’s personal affirmation is the required human action.', info, text, textSha256: sha256(text) };
  }

  if (!info.checked) {
    const target = page.locator('[data-pathfinder-ack-target="1"]').first();
    const type = String(info.targetType || '').toLowerCase();
    try {
      if (info.targetTag === 'input' && (type === 'checkbox' || type === 'radio')) await target.check({ force: true, timeout: 10000 });
      else await target.click({ force: true, timeout: 10000 });
    } catch (err) {
      eventLog('acknowledgment-control-primary-action-failed', { error: String(err), targetTag: info.targetTag, targetType: info.targetType, targetRole: info.targetRole });
    }
  }

  await page.waitForTimeout(700);
  info = await findAcknowledgmentInfo();
  if (!info.checked) {
    try {
      const target = page.locator('[data-pathfinder-ack-target="1"]').first();
      await target.focus({ timeout: 5000 }).catch(() => {});
      await page.keyboard.press('Space').catch(() => {});
      await page.waitForTimeout(350);
      const afterKeyboard = await findAcknowledgmentInfo();
      if (!afterKeyboard.checked) await target.evaluate((el) => { if (typeof el.click === 'function') el.click(); el.dispatchEvent(new Event('input', { bubbles: true, composed: true })); el.dispatchEvent(new Event('change', { bubbles: true, composed: true })); });
    } catch (err) {
      eventLog('acknowledgment-control-event-fallback-failed', { error: String(err) });
    }
  }

  await page.waitForTimeout(700);
  info = await findAcknowledgmentInfo();
  return { ok: info.checked, mode: 'interactive-control', reason: info.checked ? 'The underlying OpenAI acknowledgment control is positively checked.' : 'The underlying OpenAI acknowledgment control could not be positively verified as checked.', info, text, textSha256: sha256(text) };
}"""
    source = regex_once(source, r"async function applyUnderlyingAcknowledgment\(\) \{.*?\n\}\n\nasync function verifyAcknowledgmentStable", apply_ack + "\n\nasync function verifyAcknowledgmentStable", "acknowledgment application replacement")

    verify_ack = r"""async function verifyAcknowledgmentStable(expectedTextSha256, samples = 3, expectedMode = null) {
  const observations = [];
  for (let index = 0; index < samples; index += 1) {
    const info = await findAcknowledgmentInfo();
    const text = normalizeAcknowledgmentText(info.textSnippet);
    const textValid = acknowledgmentTextValid(text);
    const textSha256 = textValid ? sha256(text) : null;
    const mode = info.targetFound ? 'interactive-control' : info.textFound ? 'official-terms-text-only' : 'missing';
    const accepted = mode === 'interactive-control' ? Boolean(info.checked) : mode === 'official-terms-text-only';
    const submit = await findSubmitControl().catch(() => null);
    const submitVisible = Boolean(submit && await visible(submit));
    const submitDisabled = submitVisible ? await submit.isDisabled().catch(() => true) : null;
    observations.push({ sample: index + 1, at: new Date().toISOString(), accepted, mode, checked: Boolean(info.checked), textValid, textSha256, targetFound: Boolean(info.targetFound), targetVisible: Boolean(info.targetVisible), targetFingerprintSha256: info.targetFingerprint ? sha256(info.targetFingerprint) : null, candidateCount: Number(info.candidateCount || 0), submitVisible, submitDisabled });
    if (index + 1 < samples) await page.waitForTimeout(450);
  }
  const ok = observations.length === samples && observations.every((item) => item.accepted && item.textValid && item.textSha256 === expectedTextSha256 && (!expectedMode || item.mode === expectedMode));
  const evidence = { ok, expectedMode, requiredSamples: samples, stableSamples: observations.filter((item) => item.accepted && item.textValid && item.textSha256 === expectedTextSha256 && (!expectedMode || item.mode === expectedMode)).length, expectedTextSha256, observations };
  await fsp.writeFile(path.join(ARTIFACT_DIR, 'acknowledgment-evidence.json'), JSON.stringify(evidence, null, 2)).catch(() => {});
  eventLog('acknowledgment-stability', evidence);
  return evidence;
}"""
    source = regex_once(source, r"async function verifyAcknowledgmentStable\(expectedTextSha256, samples = 3\) \{.*?\n\}\n\nasync function acceptProxyAcknowledgment", verify_ack + "\n\nasync function acceptProxyAcknowledgment", "acknowledgment stability replacement")

    accept_ack = r"""async function acceptProxyAcknowledgment(body = {}) {
  if (state.phase !== 'ACKNOWLEDGMENT_REQUIRED') return { ok: false, reason: `Personal acknowledgment is unavailable during ${state.phase}.` };
  if (state.submitClicks !== 0) return { ok: false, reason: 'A submit click has already been recorded; no additional action is permitted.' };
  if (body.affirmation !== ACK_PROXY_AFFIRMATION) return { ok: false, reason: 'The required personal-acknowledgment affirmation was not supplied.' };
  if (body.screenToken && !recentScreenTokens.includes(String(body.screenToken))) return { ok: false, reason: 'The displayed session image is stale. Refresh and review the acknowledgment again.' };
  if (!body.screenToken && Number.isFinite(Number(body.revision)) && Number(body.revision) < screenRevision - 6) return { ok: false, reason: 'The displayed session state is stale. Refresh and review the acknowledgment again.' };

  const info = await findAcknowledgmentInfo();
  const text = normalizeAcknowledgmentText(info.textSnippet);
  if (!acknowledgmentTextValid(text)) return { ok: false, reason: 'The complete acknowledgment is not currently available from OpenAI’s form. No submit click occurred.' };
  const textSha256 = sha256(text);
  if (!body.acknowledgmentTextSha256 || body.acknowledgmentTextSha256 !== textSha256) return { ok: false, reason: 'The acknowledgment text changed or the displayed copy is stale. Refresh and read the current text before agreeing.' };

  eventLog('jp-personal-acknowledgment', { method: 'pathfinder-proxy-control', acknowledgmentTextSha256: textSha256, revision: Number(body.revision) || null, screenToken: body.screenToken || null, affirmation: ACK_PROXY_AFFIRMATION });
  setState({ message: 'JP personally accepted the displayed OpenAI acknowledgment. Pathfinder is verifying its current presentation before any submission.', acknowledgmentMethod: 'pathfinder-proxy-control', acknowledgmentPersonallyAffirmed: true });

  const applied = await applyUnderlyingAcknowledgment();
  const afterText = normalizeAcknowledgmentText(applied.info && applied.info.textSnippet);
  const afterSha256 = acknowledgmentTextValid(afterText) ? sha256(afterText) : null;
  const stable = applied.ok ? await verifyAcknowledgmentStable(textSha256, 3, applied.mode) : { ok: false, stableSamples: 0, observations: [], expectedMode: applied.mode };
  acknowledgmentEvidence = { personallyAffirmedAt: new Date().toISOString(), method: 'pathfinder-proxy-control', mode: applied.mode, textSha256, underlyingApplied: Boolean(applied.ok), stable };
  setState({
    acknowledgmentChecked: Boolean(applied.ok && stable.ok),
    acknowledgmentMethod: applied.mode,
    acknowledgmentStableSamples: stable.stableSamples || 0,
    acknowledgmentTargetFound: Boolean(applied.info && (applied.info.targetFound || applied.info.textFound)),
    acknowledgmentText: acknowledgmentTextValid(afterText) ? afterText : state.acknowledgmentText,
    acknowledgmentTextSha256: afterSha256 || state.acknowledgmentTextSha256,
    acknowledgmentTextValid: acknowledgmentTextValid(afterText) || state.acknowledgmentTextValid,
    message: applied.ok && stable.ok
      ? applied.mode === 'interactive-control'
        ? 'JP’s personal acknowledgment matched a stable, positively checked OpenAI control. Final revalidation is starting.'
        : 'JP personally affirmed stable official OpenAI acknowledgment text; no separate checkbox exists. Final revalidation is starting.'
      : 'JP’s personal acknowledgment was recorded, but the current OpenAI acknowledgment presentation was not stable. No submission occurred.'
  });
  if (!applied.ok || !stable.ok) return { ok: false, acknowledged: false, reason: applied.ok ? 'The acknowledgment presentation did not remain stable. Refresh and review it again.' : applied.reason };
  setState({ phase: 'ACKNOWLEDGMENT_ACCEPTED', message: 'Personal acknowledgment and the current OpenAI acknowledgment presentation are verified. Final validation is starting.' });
  void submitOnce().catch(async (err) => { await finish('ERROR', `Submission sequence failed: ${String(err)}`).catch(() => {}); });
  return { ok: true, acknowledged: true, mode: applied.mode, reason: 'Personal acknowledgment accepted; final validation started.' };
}"""
    source = regex_once(source, r"async function acceptProxyAcknowledgment\(body = \{\}\) \{.*?\n\}\n\nasync function findSubmitControl", accept_ack + "\n\nasync function findSubmitControl", "proxy acknowledgment replacement")

    old_submit_ack = r"""  const ack = await findAcknowledgmentInfo();
  if (!state.acknowledgmentPersonallyAffirmed) {
    setState({ phase: 'ACKNOWLEDGMENT_REQUIRED', acknowledgmentChecked: Boolean(ack.checked), message: 'JP’s personal acknowledgment action has not been recorded. No submit click occurred.' });
    return;
  }
  if (!ack.checked) {
    setState({ phase: 'ACKNOWLEDGMENT_REQUIRED', acknowledgmentChecked: false, message: 'The underlying OpenAI acknowledgment control is not positively checked. No submit click occurred.' });
    return;
  }
  const expectedAckSha256 = state.acknowledgmentTextSha256;
  const stableAck = expectedAckSha256 ? await verifyAcknowledgmentStable(expectedAckSha256, 3) : { ok: false, stableSamples: 0 };
  if (!stableAck.ok) {
    setState({ phase: 'ACKNOWLEDGMENT_REQUIRED', acknowledgmentChecked: false, acknowledgmentStableSamples: stableAck.stableSamples || 0, message: 'The OpenAI acknowledgment control did not remain stable during final validation. No submit click occurred.' });
    return;
  }
  acknowledgmentEvidence = { ...(acknowledgmentEvidence || {}), finalPreSubmitVerification: stableAck };

  const invalid = await invalidFieldDetails();"""
    new_submit_ack = r"""  const ack = await findAcknowledgmentInfo();
  const ackText = normalizeAcknowledgmentText(ack.textSnippet);
  const ackMode = ack.targetFound ? 'interactive-control' : ack.textFound ? 'official-terms-text-only' : 'missing';
  if (!state.acknowledgmentPersonallyAffirmed) {
    setState({ phase: 'ACKNOWLEDGMENT_REQUIRED', acknowledgmentChecked: Boolean(ack.checked), message: 'JP’s personal acknowledgment action has not been recorded. No submit click occurred.' });
    return;
  }
  if (ackMode === 'interactive-control' && !ack.checked) {
    setState({ phase: 'ACKNOWLEDGMENT_REQUIRED', acknowledgmentChecked: false, message: 'The underlying OpenAI acknowledgment control is not positively checked. No submit click occurred.' });
    return;
  }
  if (ackMode === 'missing' || !acknowledgmentTextValid(ackText)) {
    setState({ phase: 'ACKNOWLEDGMENT_REQUIRED', acknowledgmentChecked: false, message: 'The complete current OpenAI acknowledgment is unavailable. No submit click occurred.' });
    return;
  }
  const expectedAckSha256 = state.acknowledgmentTextSha256;
  const stableAck = expectedAckSha256 ? await verifyAcknowledgmentStable(expectedAckSha256, 3, ackMode) : { ok: false, stableSamples: 0 };
  if (!stableAck.ok) {
    setState({ phase: 'ACKNOWLEDGMENT_REQUIRED', acknowledgmentChecked: false, acknowledgmentStableSamples: stableAck.stableSamples || 0, message: 'The OpenAI acknowledgment presentation did not remain stable during final validation. No submit click occurred.' });
    return;
  }
  acknowledgmentEvidence = { ...(acknowledgmentEvidence || {}), finalPreSubmitVerification: stableAck, mode: ackMode };

  const finalFieldVerification = await verifyAllApplicationFields();
  await fsp.writeFile(path.join(ARTIFACT_DIR, 'final-field-verification.json'), JSON.stringify(finalFieldVerification, null, 2)).catch(() => {});
  if (!finalFieldVerification.ok) {
    await finish('VALIDATION_ERROR', `Final pre-submit field verification found ${finalFieldVerification.mismatches.length} mismatch(es); no submit click occurred.`, { fieldMismatches: finalFieldVerification.mismatches });
    return;
  }

  const invalid = await invalidFieldDetails();"""
    source = replace_once(source, old_submit_ack, new_submit_ack, "submit acknowledgment and final field validation")

    source = replace_once(source, "add('field-spec-count', FIELD_SPECS.length === 14, FIELD_SPECS.length);", "add('field-spec-count', FIELD_SPECS.length === 13, FIELD_SPECS.length);\n  add('unique-stable-field-names', new Set(FIELD_SPECS.map((spec) => spec.name)).size === FIELD_SPECS.length);\n  add('no-descriptive-sentence-duplicate', !FIELD_SPECS.some((spec) => spec.key === 'descriptiveSentence') && !Object.prototype.hasOwnProperty.call(application, 'descriptiveSentence'));\n  add('fresh-field-resolution', fillApplication.toString().includes('fillStableField') && fillStableField.toString().includes('resolveFieldControl'));\n  add('full-field-verification', fillApplication.toString().includes('verifyAllApplicationFields') && submitOnce.toString().includes('verifyAllApplicationFields'));\n  add('terms-text-only-acknowledgment', applyUnderlyingAcknowledgment.toString().includes('official-terms-text-only') && verifyAcknowledgmentStable.toString().includes('expectedMode'));", "self-test field count and new tests")

    return source


def update_package_text_files(pkg: Path, runner_sha: str, application_sha: str) -> None:
    for file in pkg.rglob("*"):
        if not file.is_file() or file.name == "runner.cjs.gz":
            continue
        try:
            text = file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        text = text.replace(OLD_RUNNER_SHA, runner_sha).replace(OLD_APPLICATION_SHA, application_sha).replace(OLD_VERSION, NEW_VERSION)
        if file.name == "preflight.sh":
            text = text.replace("'field-spec-count', 'application-keys'", "'field-spec-count', 'unique-stable-field-names', 'no-descriptive-sentence-duplicate', 'fresh-field-resolution', 'full-field-verification', 'terms-text-only-acknowledgment', 'application-keys'")
        file.write_text(text, encoding="utf-8")


def deterministic_tar_gz(source_dir: Path, output: Path) -> None:
    with output.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as gz:
            with tarfile.open(fileobj=gz, mode="w", format=tarfile.PAX_FORMAT) as tar:
                for file in sorted(source_dir.rglob("*"), key=lambda item: item.relative_to(source_dir).as_posix()):
                    arcname = file.relative_to(source_dir).as_posix()
                    info = tar.gettarinfo(str(file), arcname)
                    info.uid = 0
                    info.gid = 0
                    info.uname = ""
                    info.gname = ""
                    info.mtime = 0
                    if file.is_file():
                        with file.open("rb") as fh:
                            tar.addfile(info, fh)
                    else:
                        tar.addfile(info)


def main() -> None:
    parts = sorted(PART_DIR.glob("package.part.*"))
    require(parts, "No MATADATA V2.2 package parts were found.")
    old_package = b"".join(part.read_bytes() for part in parts)
    require(sha256(old_package) == OLD_PACKAGE_SHA, "Existing package checksum does not match the reviewed V2.2 package.")

    with tempfile.TemporaryDirectory(prefix="matadata-v23-") as temp_name:
        temp = Path(temp_name)
        old_archive = temp / "old-package.tar.gz"
        old_archive.write_bytes(old_package)
        pkg = temp / "pkg"
        pkg.mkdir()
        with tarfile.open(old_archive, "r:gz") as tar:
            tar.extractall(pkg, filter="data")

        runner_gz = pkg / "runner.cjs.gz"
        require(runner_gz.exists(), "Package runner.cjs.gz is missing.")
        old_source = gzip.decompress(runner_gz.read_bytes()).decode("utf-8")
        require(sha256(old_source.encode()) == OLD_RUNNER_SHA, "Runner checksum does not match reviewed V2.2 source.")
        new_source = patch_runner(old_source)
        runner_sha = sha256(new_source.encode())
        runner_gz.write_bytes(deterministic_gzip(new_source.encode()))

        mock = temp / "mock-playwright.cjs"
        mock.write_text("module.exports={chromium:{}};\n", encoding="utf-8")
        selftest_dir = temp / "selftest"
        selftest_dir.mkdir()
        runner_path = temp / "runner.cjs"
        runner_path.write_text(new_source, encoding="utf-8")
        run(["node", "--check", str(runner_path)])
        env = os.environ.copy()
        env.update({
            "PATHFINDER_SELF_TEST": "1",
            "PATHFINDER_TOKEN": "offline-v23-token-0000000000000000",
            "PATHFINDER_ARTIFACT_DIR": str(selftest_dir),
            "PATHFINDER_SUBMISSION_ID": "matadata-openai-cybersecurity-grant-v1",
            "PATHFINDER_RUNNER_SHA256": runner_sha,
            "PLAYWRIGHT_MODULE": str(mock),
        })
        run(["node", str(runner_path)], env=env)
        selftest = json.loads((selftest_dir / "selftest.json").read_text(encoding="utf-8"))
        require(selftest.get("passed") is True, "Patched runner self-test failed.")
        require(selftest.get("runnerVersion") == NEW_VERSION, "Patched runner version mismatch.")
        application_sha = str(selftest.get("applicationSha256") or "")
        require(re.fullmatch(r"[a-f0-9]{64}", application_sha) is not None, "Patched application hash is invalid.")

        update_package_text_files(pkg, runner_sha, application_sha)
        manifest_path = pkg / "MANIFEST.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest.update({
            "version": NEW_VERSION,
            "runner_sha256": runner_sha,
            "application_sha256": application_sha,
            "live_execution": False,
            "field_spec_count": 13,
            "project_title_single_field": True,
            "fresh_field_resolution": True,
            "final_field_verification": True,
            "terms_text_only_acknowledgment_supported": True,
            "upgrade_from": OLD_VERSION,
        })
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

        new_archive = temp / "package.tar.gz"
        deterministic_tar_gz(pkg, new_archive)
        new_package = new_archive.read_bytes()
        package_sha = sha256(new_package)

        verify_dir = temp / "verify"
        verify_dir.mkdir()
        with tarfile.open(new_archive, "r:gz") as tar:
            tar.extractall(verify_dir, filter="data")
        verify_source = gzip.decompress((verify_dir / "runner.cjs.gz").read_bytes())
        require(sha256(verify_source) == runner_sha, "Rebuilt package runner checksum mismatch.")
        run(["node", "--check", str(runner_path)])

        for old_part in parts:
            old_part.unlink()
        part_size = 8000
        for index, start in enumerate(range(0, len(new_package), part_size)):
            (PART_DIR / f"package.part.{index:02d}").write_bytes(new_package[start:start + part_size])

        workflow = WORKFLOW.read_text(encoding="utf-8")
        workflow = workflow.replace(OLD_PACKAGE_SHA, package_sha).replace(OLD_RUNNER_SHA, runner_sha).replace(OLD_APPLICATION_SHA, application_sha).replace(OLD_VERSION, NEW_VERSION)
        WORKFLOW.write_text(workflow, encoding="utf-8")

        report = {
            "status": "UPGRADED_STAGED_NOT_EXECUTED",
            "fromVersion": OLD_VERSION,
            "runnerVersion": NEW_VERSION,
            "packageSha256": package_sha,
            "runnerSha256": runner_sha,
            "runnerGzipSha256": sha256((pkg / "runner.cjs.gz").read_bytes()),
            "applicationSha256": application_sha,
            "packageBytes": len(new_package),
            "packageParts": [p.name for p in sorted(PART_DIR.glob("package.part.*"))],
            "selfTest": selftest,
            "liveExecution": False,
        }
        report_path = PART_DIR / "V23_UPGRADE_RECEIPT.json"
        report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(report, indent=2))

    shutil.rmtree(ROOT / "tools" / "matadata-pathfinder" / "v22" / "runner-inspection", ignore_errors=True)
    shutil.rmtree(ROOT / "tools" / "matadata-pathfinder" / "v22" / "process-diagnostic", ignore_errors=True)
    shutil.rmtree(ROOT / "tools" / "matadata-pathfinder" / "v22" / "tunnel-diagnostic", ignore_errors=True)
    shutil.rmtree(ROOT / "tools" / "matadata-pathfinder" / "v22" / "extracted", ignore_errors=True)


if __name__ == "__main__":
    main()
