import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const FORM_URL = 'https://openai.com/form/cybersecurity-grant-program/';
const ARTIFACT_DIR = path.resolve('pathfinder-artifacts');
const APPLICATION_PATH = process.env.PATHFINDER_APPLICATION_PATH || path.resolve('application.json');
const HUMAN_WINDOW_MS = Number(process.env.PATHFINDER_HUMAN_WINDOW_MS || 15 * 60 * 1000);
const application = JSON.parse(await fs.readFile(APPLICATION_PATH, 'utf8'));

await fs.mkdir(ARTIFACT_DIR, { recursive: true });

const receipt = {
  project: application.projectTitle,
  formUrl: FORM_URL,
  startedAt: new Date().toISOString(),
  status: 'STARTED',
  submitClicks: 0,
  humanVerificationBypassed: false,
};

async function writeReceipt(extra = {}) {
  Object.assign(receipt, extra, { updatedAt: new Date().toISOString() });
  await fs.writeFile(
    path.join(ARTIFACT_DIR, 'receipt.json'),
    JSON.stringify(receipt, null, 2),
    'utf8',
  );
}

function compact(value, limit = 1800) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function wordCount(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

async function visible(locator) {
  return (await locator.count()) > 0 && (await locator.first().isVisible().catch(() => false));
}

async function pageText(page) {
  return compact(await page.locator('body').innerText().catch(() => ''), 12000);
}

async function saveAuditMetadata(page, name) {
  await fs.writeFile(
    path.join(ARTIFACT_DIR, `${name}.txt`),
    await pageText(page),
    'utf8',
  ).catch(() => {});

  const fields = await page.locator('input, textarea, button').evaluateAll((nodes) =>
    nodes.map((node) => ({
      tag: node.tagName,
      type: node.getAttribute('type'),
      name: node.getAttribute('name'),
      id: node.id || null,
      required: node.hasAttribute('required'),
      checked: 'checked' in node ? node.checked : undefined,
      valueLength: 'value' in node ? String(node.value || '').length : undefined,
      text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
    })),
  ).catch(() => []);

  await fs.writeFile(
    path.join(ARTIFACT_DIR, `${name}-fields.json`),
    JSON.stringify(fields, null, 2),
    'utf8',
  ).catch(() => {});
}

async function formVisible(page) {
  return visible(page.locator('input[name="FirstName"]:visible').first());
}

async function challengePresent(page) {
  return (
    (await page.locator(
      'input[name*="turnstile" i], iframe[src*="turnstile" i], [data-sitekey], .cf-turnstile',
    ).count()) > 0 ||
    /verify you are human|human verification|security check|checking your browser/i.test(await pageText(page))
  );
}

async function waitForForm(page) {
  if (await formVisible(page)) return;

  const challenge = await challengePresent(page);
  await writeReceipt({
    status: challenge ? 'WAITING_FOR_HUMAN_VERIFICATION' : 'WAITING_FOR_FORM',
    challengePresent: challenge,
    submitClicks: 0,
    note: 'No challenge-solving automation is used. A human may complete provider verification in the temporary remote browser.',
  });

  const deadline = Date.now() + HUMAN_WINDOW_MS;
  while (Date.now() < deadline) {
    if (await formVisible(page)) {
      await writeReceipt({
        status: 'FORM_VISIBLE',
        challengePresent: challenge,
        submitClicks: 0,
      });
      return;
    }
    await page.waitForTimeout(1000);
  }

  await saveAuditMetadata(page, 'human-window-expired');
  await writeReceipt({
    status: 'HUMAN_VERIFICATION_REQUIRED',
    challengePresent: await challengePresent(page),
    submitClicks: 0,
    endUrl: page.url(),
    title: await page.title(),
    bodyExcerpt: compact(await pageText(page)),
  });
  throw new Error('HUMAN_VERIFICATION_REQUIRED');
}

async function fillVisible(page, selector, value, fieldName) {
  const target = page.locator(`${selector}:visible`).first();
  if (!(await visible(target))) {
    throw new Error(`Could not locate visible ${fieldName} field using ${selector}`);
  }

  await target.fill(value);
  const actual = await target.inputValue().catch(() => '');
  if (actual !== value) {
    throw new Error(`${fieldName} did not retain the intended value`);
  }
}

async function confirmAcknowledgmentNotice(page) {
  const legalText = await pageText(page);
  const noticePresent = /applicant acknowledges|obligation of exclusivity|sole discretion/i.test(legalText);
  if (!noticePresent) {
    throw new Error('OpenAI applicant acknowledgment notice was not present');
  }

  // The live form presents the acknowledgment as displayed notice text. It
  // does not expose a visible legal-consent checkbox. A similarly named hidden
  // operational field is intentionally left untouched.
  const visibleCheckboxCount = await page.locator('input[type="checkbox"]:visible').count();
  return { noticePresent, visibleCheckboxCount };
}

async function validateFields(page, acknowledgmentNoticePresent) {
  const required = [
    ['input[name="FirstName"]', 'first name'],
    ['input[name="LastName"]', 'last name'],
    ['input[name="Email"]', 'email'],
    ['input[name="Title"]', 'role or title'],
    ['input[name="mkto_linkedin_url_form_fill"]', 'LinkedIn'],
    ['input[name="mkto_cybersecurity_grant_project_title"]', 'project title'],
    ['textarea[name="mkto_cybersecurity_grant_project_summary"]', 'project proposal'],
    ['textarea[name="mkto_cybersecurity_grant_project_roadmap"]', 'project timeline'],
    ['textarea[name="mkto_cybersecurity_grant_funds_usage"]', 'funding and resources request'],
  ];

  const missing = [];
  for (const [selector, name] of required) {
    const target = page.locator(`${selector}:visible`).first();
    if (!(await visible(target))) {
      missing.push({ field: name, reason: 'not visible' });
      continue;
    }
    const value = await target.inputValue().catch(() => '');
    if (!String(value).trim()) missing.push({ field: name, reason: 'empty' });
  }

  if (!acknowledgmentNoticePresent) {
    missing.push({ field: 'applicant acknowledgment notice', reason: 'not present' });
  }

  return missing;
}

async function readSubmitState(submitButton) {
  return submitButton.evaluate((button) => {
    const form = button.closest('form');
    const controls = form ? Array.from(form.querySelectorAll('input, textarea, select')) : [];
    const invalid = controls
      .filter((control) => !control.validity.valid)
      .map((control) => ({
        name: control.getAttribute('name'),
        id: control.id || null,
        type: control.getAttribute('type'),
        required: control.hasAttribute('required'),
        valueLength: String(control.value || '').length,
        validationMessage: control.validationMessage || null,
      }));
    const turnstile = controls
      .filter((control) => /turnstile/i.test(control.getAttribute('name') || ''))
      .map((control) => String(control.value || '').length);

    return {
      disabled: button.disabled,
      dataDisabled: button.getAttribute('data-disabled'),
      formFound: Boolean(form),
      formValid: form ? form.checkValidity() : null,
      invalid,
      turnstileResponseLengths: turnstile,
    };
  });
}

async function waitForSubmitEnabled(page, submitButton) {
  let state = await readSubmitState(submitButton);
  await fs.writeFile(
    path.join(ARTIFACT_DIR, '02-submit-state.json'),
    JSON.stringify(state, null, 2),
    'utf8',
  );

  if (state.formValid === false) {
    await writeReceipt({
      status: 'FORM_INVALID_BEFORE_SUBMIT',
      submitClicks: 0,
      submitState: state,
    });
    throw new Error('OpenAI form remained natively invalid after field validation');
  }

  if (!state.disabled && (await submitButton.isEnabled().catch(() => false))) return state;

  await writeReceipt({
    status: 'WAITING_FOR_HUMAN_VERIFICATION_TO_ENABLE_SUBMIT',
    submitClicks: 0,
    submitState: state,
    note: 'The form is populated and valid, but OpenAI has not enabled Submit. A human may complete the provider verification in the temporary remote browser. The runner will not solve or bypass it.',
  });

  const deadline = Date.now() + HUMAN_WINDOW_MS;
  while (Date.now() < deadline) {
    state = await readSubmitState(submitButton);
    if (!state.disabled && (await submitButton.isEnabled().catch(() => false))) {
      await writeReceipt({
        status: 'SUBMIT_ENABLED_AFTER_HUMAN_VERIFICATION',
        submitClicks: 0,
        submitState: state,
      });
      return state;
    }
    await page.waitForTimeout(1000);
  }

  await saveAuditMetadata(page, 'human-submit-window-expired');
  await writeReceipt({
    status: 'HUMAN_VERIFICATION_REQUIRED_BEFORE_SUBMIT',
    submitClicks: 0,
    submitState: state,
    endUrl: page.url(),
    title: await page.title(),
  });
  throw new Error('HUMAN_VERIFICATION_REQUIRED_BEFORE_SUBMIT');
}

if (wordCount(application.proposal) > 3000) {
  throw new Error('Project proposal exceeds OpenAI’s 3,000-word limit');
}
if (wordCount(application.problemStatement) > 200) {
  throw new Error('Problem statement exceeds OpenAI’s 200-word limit');
}

let browser;
try {
  browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    locale: 'en-US',
    timezoneId: 'America/Detroit',
    viewport: { width: 1365, height: 900 },
  });
  const page = await context.newPage();

  await page.goto(FORM_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await saveAuditMetadata(page, '01-opened');
  await waitForForm(page);

  const values = [
    ['input[name="FirstName"]', application.firstName, 'first name'],
    ['input[name="LastName"]', application.lastName, 'last name'],
    ['input[name="Email"]', application.email, 'email'],
    ['input[name="Company"]', application.company, 'company or university'],
    ['input[name="Title"]', application.role, 'role or title'],
    ['input[name="mkto_linkedin_url_form_fill"]', application.linkedin, 'LinkedIn'],
    [
      'textarea[name="mkto_cybersecurity_grant_stakeholders"]',
      application.otherPeople,
      'project collaborators',
    ],
    [
      'textarea[name="mkto_cybersecurity_grant_notes"]',
      application.additionalNotes,
      'additional notes',
    ],
    [
      'input[name="mkto_cybersecurity_grant_project_title"]',
      application.projectTitle,
      'project title',
    ],
    [
      'textarea[name="mkto_cybersecurity_grant_project_summary"]',
      application.proposal,
      'project proposal',
    ],
    [
      'textarea[name="mkto_cybersecurity_grant_problem_statement"]',
      application.problemStatement,
      'problem statement',
    ],
    [
      'textarea[name="mkto_cybersecurity_grant_project_roadmap"]',
      application.timeline,
      'project timeline',
    ],
    [
      'textarea[name="mkto_cybersecurity_grant_funds_usage"]',
      application.funding,
      'funding and resources request',
    ],
  ];

  for (const [selector, value, fieldName] of values) {
    await fillVisible(page, selector, value, fieldName);
  }

  const acknowledgment = await confirmAcknowledgmentNotice(page);
  await page.waitForTimeout(500);
  await saveAuditMetadata(page, '02-before-submit');

  const missing = await validateFields(page, acknowledgment.noticePresent);
  if (missing.length) {
    await writeReceipt({ status: 'REQUIRED_FIELDS_EMPTY', requiredEmpty: missing, acknowledgmentNoticePresent: acknowledgment.noticePresent, visibleAcknowledgmentCheckboxCount: acknowledgment.visibleCheckboxCount, submitClicks: 0 });
    throw new Error(`Required visible fields were not ready: ${JSON.stringify(missing)}`);
  }

  const startUrl = page.url();
  const submitButton = page
    .locator('button[type="submit"]:visible')
    .filter({ hasText: /^\s*Submit\s*$/i })
    .first();

  if (!(await visible(submitButton))) {
    throw new Error('Visible OpenAI Submit button was not found');
  }

  const enabledSubmitState = await waitForSubmitEnabled(page, submitButton);
  await submitButton.click();
  receipt.submitClicks = 1;
  await writeReceipt({
    status: 'SUBMIT_CLICKED',
    acknowledgmentNoticePresent: acknowledgment.noticePresent,
    visibleAcknowledgmentCheckboxCount: acknowledgment.visibleCheckboxCount,
    startUrl,
    submitClicks: 1,
    submitState: enabledSubmitState,
  });

  await Promise.race([
    page.waitForURL((url) => url.toString() !== startUrl, { timeout: 45000 }),
    page
      .getByText(/thank you|submission.*received|successfully submitted|response has been recorded|we have received your/i)
      .first()
      .waitFor({ timeout: 45000 }),
    page.waitForTimeout(45000),
  ]).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await saveAuditMetadata(page, '03-after-submit');

  const finalText = await pageText(page);
  const finalTextLower = finalText.toLowerCase();
  const finalUrl = page.url();
  const successText = /thank you|submission.{0,60}received|successfully submitted|response has been recorded|we have received your/.test(finalTextLower);
  const successUrl = finalUrl !== startUrl && /thank|success|submitted|confirmation|complete/i.test(finalUrl);
  const visibleInvalid = await page.locator('[aria-invalid="true"]:visible').count();
  const validationText = /please (?:complete|enter|provide|select)|required field|invalid (?:email|url|value)|there was an error/i.test(finalTextLower);
  const postSubmitChallenge = await challengePresent(page);

  if (successText || successUrl) {
    await writeReceipt({
      status: 'SUBMITTED_CONFIRMED',
      submittedAt: new Date().toISOString(),
      endUrl: finalUrl,
      title: await page.title(),
      acknowledgmentNoticePresent: acknowledgment.noticePresent,
      visibleAcknowledgmentCheckboxCount: acknowledgment.visibleCheckboxCount,
      confirmationEvidence: {
        successText,
        successUrl,
        excerpt: compact(finalText),
      },
    });
    console.log('MATADATA_PATHFINDER_STATUS=SUBMITTED_CONFIRMED');
  } else if (visibleInvalid || validationText) {
    await writeReceipt({
      status: 'VALIDATION_ERROR_AFTER_SUBMIT',
      endUrl: finalUrl,
      title: await page.title(),
      acknowledgmentNoticePresent: acknowledgment.noticePresent,
      visibleAcknowledgmentCheckboxCount: acknowledgment.visibleCheckboxCount,
      visibleInvalid,
      bodyExcerpt: compact(finalText),
    });
    throw new Error('OpenAI returned a validation error after the single Submit click');
  } else {
    await writeReceipt({
      status: postSubmitChallenge
        ? 'HUMAN_VERIFICATION_REQUIRED_AFTER_SUBMIT'
        : 'SUBMISSION_UNCERTAIN',
      endUrl: finalUrl,
      title: await page.title(),
      acknowledgmentNoticePresent: acknowledgment.noticePresent,
      visibleAcknowledgmentCheckboxCount: acknowledgment.visibleCheckboxCount,
      challengePresent: postSubmitChallenge,
      bodyExcerpt: compact(finalText),
    });
    throw new Error('Submit was clicked once, but explicit confirmation was not observed');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(error instanceof Error ? error.stack || error.message : String(error));

  if (receipt.submitClicks === 0 && ['STARTED', 'FORM_VISIBLE'].includes(receipt.status)) {
    await writeReceipt({ status: 'FAILED_BEFORE_SUBMIT', submitClicks: 0, error: message });
  } else {
    await writeReceipt({ error: message });
  }
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
}
