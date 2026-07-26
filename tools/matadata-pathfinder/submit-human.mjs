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
  await fs.writeFile(path.join(ARTIFACT_DIR, 'receipt.json'), JSON.stringify(receipt, null, 2), 'utf8');
}

function compact(value, limit = 1800) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

async function pageText(page) {
  return compact(await page.locator('body').innerText().catch(() => ''), 12000);
}

async function visible(locator) {
  return (await locator.count()) > 0 && (await locator.first().isVisible().catch(() => false));
}

async function saveAuditMetadata(page, name) {
  await fs.writeFile(path.join(ARTIFACT_DIR, `${name}.txt`), await pageText(page), 'utf8').catch(() => {});
  const fields = await page.locator('input, textarea, button').evaluateAll((nodes) =>
    nodes.map((node) => ({
      tag: node.tagName,
      type: node.getAttribute('type'),
      name: node.getAttribute('name'),
      id: node.id || null,
      placeholder: node.getAttribute('placeholder'),
      ariaLabel: node.getAttribute('aria-label'),
      required: node.hasAttribute('required'),
      checked: 'checked' in node ? node.checked : undefined,
      valueLength: 'value' in node ? String(node.value || '').length : undefined,
      text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
    })),
  ).catch(() => []);
  await fs.writeFile(path.join(ARTIFACT_DIR, `${name}-fields.json`), JSON.stringify(fields, null, 2), 'utf8').catch(() => {});
}

async function firstNameVisible(page) {
  const candidates = [
    page.getByRole('textbox', { name: /first name/i }).first(),
    page.getByLabel(/first name/i).first(),
    page.locator('input[name*="first" i]').first(),
  ];
  for (const candidate of candidates) {
    if (await visible(candidate)) return true;
  }
  const body = (await pageText(page)).toLowerCase();
  const visibleInputs = await page.locator('input:not([type="hidden"]):visible').count();
  return body.includes('step 1') && body.includes('first name') && visibleInputs >= 4;
}

async function waitForHumanVerification(page) {
  const challengePresent =
    (await page.locator('input[name*="turnstile" i], iframe[src*="turnstile" i], [data-sitekey]').count()) > 0;

  if (await firstNameVisible(page)) return;

  await writeReceipt({
    status: challengePresent ? 'WAITING_FOR_HUMAN_VERIFICATION' : 'WAITING_FOR_FORM',
    challengePresent,
    submitClicks: 0,
    note: 'A human may complete the provider verification in the remote browser. No challenge-solving automation is used.',
  });

  const deadline = Date.now() + HUMAN_WINDOW_MS;
  while (Date.now() < deadline) {
    if (await firstNameVisible(page)) {
      await writeReceipt({
        status: 'HUMAN_VERIFICATION_COMPLETED_FORM_VISIBLE',
        challengePresent,
        submitClicks: 0,
      });
      return;
    }
    await page.waitForTimeout(1000);
  }

  await saveAuditMetadata(page, 'human-window-expired');
  await writeReceipt({
    status: 'HUMAN_VERIFICATION_REQUIRED',
    challengePresent,
    submitClicks: 0,
    endUrl: page.url(),
    title: await page.title(),
    bodyExcerpt: compact(await pageText(page)),
  });
  throw new Error('HUMAN_VERIFICATION_REQUIRED');
}

async function fillByLabel(page, labelPattern, value, fallbacks = []) {
  const candidates = [
    page.getByRole('textbox', { name: labelPattern }).first(),
    page.getByLabel(labelPattern).first(),
    page.getByPlaceholder(labelPattern).first(),
  ];

  for (const candidate of candidates) {
    if (await visible(candidate)) {
      await candidate.fill(value);
      return true;
    }
  }

  const labels = page.locator('label');
  for (let i = 0; i < (await labels.count()); i += 1) {
    const label = labels.nth(i);
    const text = await label.innerText().catch(() => '');
    labelPattern.lastIndex = 0;
    if (!labelPattern.test(text)) continue;

    const forId = await label.getAttribute('for');
    if (forId) {
      const escapedId = forId.replace(/([ #;.:[\],=+*~'"!^$()=>|/@])/g, '\\$1');
      const target = page.locator(`#${escapedId}`).first();
      if (await visible(target)) {
        await target.fill(value);
        return true;
      }
    }

    let container = label;
    for (let depth = 0; depth < 6; depth += 1) {
      const target = container.locator('input:not([type="hidden"]):not([type="checkbox"]), textarea').first();
      if (await visible(target)) {
        await target.fill(value);
        return true;
      }
      container = container.locator('xpath=..');
    }
  }

  for (const selector of fallbacks) {
    const target = page.locator(selector).first();
    if (await visible(target)) {
      await target.fill(value);
      return true;
    }
  }

  return false;
}

async function requireField(page, pattern, value, fallbacks = []) {
  if (!(await fillByLabel(page, pattern, value, fallbacks))) {
    throw new Error(`Could not locate visible field matching ${pattern}`);
  }
}

async function fillStepOne(page) {
  const textInputs = page.locator(
    'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):visible',
  );

  await requireField(page, /first name/i, application.firstName, ['input[name*="first" i]']);
  await requireField(page, /last name/i, application.lastName, ['input[name*="last" i]']);
  await requireField(page, /^email/i, application.email, ['input[type="email"]']);
  await requireField(page, /company or university/i, application.company, ['input[name*="company" i]']);
  await requireField(page, /role\s*\/\s*title/i, application.role, ['input[name*="role" i]']);
  await requireField(page, /linkedin/i, application.linkedin, ['input[name*="linkedin" i]']);

  if (!(await fillByLabel(page, /other people working with you/i, application.otherPeople))) {
    const textareas = page.locator('textarea:visible');
    if ((await textareas.count()) >= 1) await textareas.nth(0).fill(application.otherPeople);
    else throw new Error('Could not locate collaborators field');
  }

  if (!(await fillByLabel(page, /additional notes/i, application.additionalNotes))) {
    const textareas = page.locator('textarea:visible');
    if ((await textareas.count()) >= 2) await textareas.nth(1).fill(application.additionalNotes);
    else throw new Error('Could not locate additional-notes field');
  }

  if ((await textInputs.count()) < 6) throw new Error('Applicant field count was unexpectedly small');
}

async function clickAction(page, pattern) {
  const roleButton = page.getByRole('button', { name: pattern }).first();
  if (await visible(roleButton)) {
    await roleButton.click();
    return true;
  }

  const controls = page.locator('button:visible, input[type="button"]:visible, input[type="submit"]:visible');
  for (let i = 0; i < (await controls.count()); i += 1) {
    const control = controls.nth(i);
    const text = `${await control.innerText().catch(() => '')} ${await control.getAttribute('value') || ''}`;
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      await control.click();
      return true;
    }
  }
  return false;
}

async function fillStepTwo(page) {
  let projectTitle = page.getByRole('textbox', { name: /project title/i }).first();
  if (!(await visible(projectTitle))) {
    const advanced = await clickAction(page, /next|continue|project proposal/i);
    if (advanced) {
      await page.waitForTimeout(1200);
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    }
    projectTitle = page.getByRole('textbox', { name: /project title/i }).first();
  }

  await requireField(page, /project title/i, application.projectTitle, ['input[name*="title" i]']);
  await requireField(page, /one descriptive sentence/i, application.descriptiveSentence);
  await requireField(page, /^project proposal/i, application.proposal);
  await requireField(page, /what problem are you trying to solve/i, application.problemStatement);
  await requireField(page, /project timeline/i, application.timeline);
  await requireField(page, /requested funding|api credits|resources needed/i, application.funding);
}

async function acceptAcknowledgment(page) {
  const checkboxes = page.locator('input[type="checkbox"]:visible');
  for (let i = 0; i < (await checkboxes.count()); i += 1) {
    const checkbox = checkboxes.nth(i);
    let container = checkbox;
    let surrounding = '';
    for (let depth = 0; depth < 6; depth += 1) {
      surrounding = await container.innerText().catch(() => surrounding);
      if (/applicant acknowledges|exclusivity|independently developing|sole discretion/i.test(surrounding)) break;
      container = container.locator('xpath=..');
    }
    if (/applicant acknowledges|exclusivity|independently developing|sole discretion/i.test(surrounding)) {
      if (!(await checkbox.isChecked())) await checkbox.check();
      return true;
    }
  }

  if ((await checkboxes.count()) === 1) {
    const checkbox = checkboxes.first();
    if (!(await checkbox.isChecked())) await checkbox.check();
    return true;
  }

  return false;
}

async function validateRequired(page) {
  return page.locator('input[required]:visible, textarea[required]:visible').evaluateAll((nodes) =>
    nodes
      .filter((node) => {
        if (node.type === 'checkbox' || node.type === 'radio') return !node.checked;
        return !String(node.value || '').trim();
      })
      .map((node) => ({ name: node.getAttribute('name'), id: node.id, type: node.getAttribute('type') })),
  );
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
  await waitForHumanVerification(page);

  await fillStepOne(page);
  await saveAuditMetadata(page, '02-applicant-filled');
  await fillStepTwo(page);
  const consentChecked = await acceptAcknowledgment(page);
  await saveAuditMetadata(page, '03-before-submit');

  const requiredEmpty = await validateRequired(page);
  if (requiredEmpty.length) {
    await writeReceipt({ status: 'REQUIRED_FIELDS_EMPTY', requiredEmpty, consentChecked, submitClicks: 0 });
    throw new Error(`Required visible fields remained empty: ${JSON.stringify(requiredEmpty)}`);
  }

  const startUrl = page.url();
  const submitButton = page.getByRole('button', { name: /^submit$/i }).first();
  const submitInput = page.locator('input[type="submit"]:visible').first();
  let clicked = false;
  if (await visible(submitButton)) {
    receipt.submitClicks += 1;
    await submitButton.click();
    clicked = true;
  } else if (await visible(submitInput)) {
    receipt.submitClicks += 1;
    await submitInput.click();
    clicked = true;
  }

  if (!clicked) throw new Error('Visible Submit control not found');

  await writeReceipt({ status: 'SUBMIT_CLICKED', consentChecked, startUrl, submitClicks: receipt.submitClicks });

  await Promise.race([
    page.waitForURL((url) => url.toString() !== startUrl, { timeout: 45000 }),
    page.getByText(/thank you|submission.*received|successfully submitted|response has been recorded|we have received your/i).first().waitFor({ timeout: 45000 }),
    page.waitForTimeout(45000),
  ]).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await saveAuditMetadata(page, '04-after-submit');

  const finalText = await pageText(page);
  const finalTextLower = finalText.toLowerCase();
  const finalUrl = page.url();
  const successText = /thank you|submission.{0,40}received|successfully submitted|response has been recorded|we have received your/.test(finalTextLower);
  const successUrl = finalUrl !== startUrl && /thank|success|submitted|confirmation|complete/i.test(finalUrl);
  const visibleInvalid = await page.locator('[aria-invalid="true"]:visible').count();
  const validationText = /please (?:complete|enter|provide|select)|required field|invalid (?:email|url|value)|there was an error/i.test(finalTextLower);

  if (successText || successUrl) {
    await writeReceipt({
      status: 'SUBMITTED_CONFIRMED',
      submittedAt: new Date().toISOString(),
      endUrl: finalUrl,
      title: await page.title(),
      consentChecked,
      confirmationEvidence: { successText, successUrl, excerpt: compact(finalText) },
    });
    console.log('MATADATA_PATHFINDER_STATUS=SUBMITTED_CONFIRMED');
  } else if (visibleInvalid || validationText) {
    await writeReceipt({
      status: 'VALIDATION_ERROR',
      endUrl: finalUrl,
      title: await page.title(),
      consentChecked,
      visibleInvalid,
      bodyExcerpt: compact(finalText),
    });
    throw new Error('Form returned a validation error after the single Submit click');
  } else {
    await writeReceipt({
      status: 'SUBMISSION_UNCERTAIN',
      endUrl: finalUrl,
      title: await page.title(),
      consentChecked,
      bodyExcerpt: compact(finalText),
    });
    throw new Error('Submit was clicked once, but no explicit confirmation was observed');
  }
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  if (receipt.status === 'STARTED') {
    await writeReceipt({ status: 'FAILED_BEFORE_SUBMIT', error: error instanceof Error ? error.message : String(error) });
  } else {
    await writeReceipt({ error: error instanceof Error ? error.message : String(error) });
  }
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
}
