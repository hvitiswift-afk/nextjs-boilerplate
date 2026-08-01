import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const FORM_URL = 'https://openai.com/form/cybersecurity-grant-program/';
const ARTIFACT_DIR = path.resolve('pathfinder-artifacts');

const APPLICATION_PATH = process.env.PATHFINDER_APPLICATION_PATH || path.resolve('application.json');
const application = JSON.parse(await fs.readFile(APPLICATION_PATH, 'utf8'));

await fs.mkdir(ARTIFACT_DIR, { recursive: true });

const startedAt = new Date().toISOString();
const receipt = {
  project: application.projectTitle,
  formUrl: FORM_URL,
  startedAt,
  status: 'STARTED',
  submitClicks: 0,
};

async function writeReceipt(extra = {}) {
  Object.assign(receipt, extra, { updatedAt: new Date().toISOString() });
  await fs.writeFile(
    path.join(ARTIFACT_DIR, 'receipt.json'),
    JSON.stringify(receipt, null, 2),
    'utf8',
  );
}

function compact(text, limit = 1800) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

async function pageText(page) {
  return compact(await page.locator('body').innerText().catch(() => ''), 12000);
}

async function detectBoundary(page) {
  const text = (await pageText(page)).toLowerCase();
  if (
    text.includes('blocked by administrator') ||
    text.includes("your organization doesn’t allow you to view this site") ||
    text.includes("your organization doesn't allow you to view this site")
  ) {
    return 'ACCESS_BLOCKED';
  }

  const captchaSelectors = [
    'iframe[src*="recaptcha"]',
    'iframe[src*="hcaptcha"]',
    'iframe[src*="turnstile"]',
    '[data-sitekey]',
    '.g-recaptcha',
    '.h-captcha',
    'input[name*="captcha" i]',
  ];
  for (const selector of captchaSelectors) {
    if (await page.locator(selector).count()) return 'HUMAN_VERIFICATION_REQUIRED';
  }
  if (/captcha|verify you are human|human verification|security check/.test(text)) {
    return 'HUMAN_VERIFICATION_REQUIRED';
  }
  return null;
}

async function visible(locator) {
  return (await locator.count()) > 0 && (await locator.first().isVisible().catch(() => false));
}

async function fillByLabel(page, labelPattern, value, fallbackSelectors = []) {
  const candidates = [
    page.getByRole('textbox', { name: labelPattern }).first(),
    page.getByLabel(labelPattern).first(),
  ];

  for (const candidate of candidates) {
    if (await visible(candidate)) {
      await candidate.fill(value);
      return;
    }
  }

  const labels = page.locator('label');
  for (let i = 0; i < (await labels.count()); i += 1) {
    const label = labels.nth(i);
    const text = await label.innerText().catch(() => '');
    if (!labelPattern.test(text)) continue;

    const forId = await label.getAttribute('for');
    if (forId) {
      const escapedId = forId.replace(/([ #;.:[\],=+*~'"!^$()=>|/@])/g, '\\$1');
      const target = page.locator(`#${escapedId}`).first();
      if (await visible(target)) {
        await target.fill(value);
        return;
      }
    }

    let container = label;
    for (let depth = 0; depth < 4; depth += 1) {
      const nested = container.locator('input:not([type="hidden"]), textarea').first();
      if (await visible(nested)) {
        await nested.fill(value);
        return;
      }
      container = container.locator('xpath=..');
    }
  }

  for (const selector of fallbackSelectors) {
    const fallback = page.locator(selector).first();
    if (await visible(fallback)) {
      await fallback.fill(value);
      return;
    }
  }

  throw new Error(`Could not locate visible field matching ${labelPattern}`);
}

async function clickAction(page, pattern) {
  const roleButton = page.getByRole('button', { name: pattern }).first();
  if (await visible(roleButton)) {
    await roleButton.click();
    return true;
  }

  const controls = page.locator('button, input[type="button"], input[type="submit"]');
  for (let i = 0; i < (await controls.count()); i += 1) {
    const control = controls.nth(i);
    if (!(await control.isVisible().catch(() => false))) continue;
    const text = `${await control.innerText().catch(() => '')} ${await control.getAttribute('value') || ''}`;
    if (pattern.test(text)) {
      await control.click();
      return true;
    }
  }
  return false;
}

async function fieldInventory(page) {
  return page.locator('input, textarea, button').evaluateAll((nodes) =>
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
  );
}

async function saveAuditMetadata(page, name) {
  await fs.writeFile(
    path.join(ARTIFACT_DIR, `${name}.txt`),
    await pageText(page),
    'utf8',
  ).catch(() => {});
  await fs.writeFile(
    path.join(ARTIFACT_DIR, `${name}-fields.json`),
    JSON.stringify(await fieldInventory(page).catch(() => []), null, 2),
    'utf8',
  ).catch(() => {});
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'en-US',
    timezoneId: 'America/Detroit',
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();

  await page.goto(FORM_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await saveAuditMetadata(page, '01-opened');

  let boundary = await detectBoundary(page);
  if (boundary) {
    await writeReceipt({
      status: boundary,
      endUrl: page.url(),
      title: await page.title(),
      bodyExcerpt: compact(await pageText(page)),
    });
    throw new Error(boundary);
  }

  await fillByLabel(page, /first name/i, application.firstName, ['input[name*="first" i]']);
  await fillByLabel(page, /last name/i, application.lastName, ['input[name*="last" i]']);
  await fillByLabel(page, /^email/i, application.email, ['input[type="email"]']);
  await fillByLabel(page, /company or university/i, application.company, ['input[name*="company" i]']);
  await fillByLabel(page, /role\s*\/\s*title/i, application.role, ['input[name*="role" i]']);
  await fillByLabel(page, /linkedin/i, application.linkedin, ['input[name*="linkedin" i]']);
  await fillByLabel(page, /other people working with you/i, application.otherPeople, ['textarea:nth-of-type(1)']);
  await fillByLabel(page, /additional notes/i, application.additionalNotes, ['textarea:nth-of-type(2)']);

  await saveAuditMetadata(page, '02-applicant-filled');

  const projectTitleVisible = await visible(page.getByRole('textbox', { name: /project title/i }).first());
  if (!projectTitleVisible) {
    const advanced = await clickAction(page, /next|continue|project proposal/i);
    if (!advanced) throw new Error('Could not advance from applicant information to project proposal');
    await page.waitForTimeout(1200);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  boundary = await detectBoundary(page);
  if (boundary) {
    await saveAuditMetadata(page, '03-boundary');
    await writeReceipt({
      status: boundary,
      endUrl: page.url(),
      title: await page.title(),
      bodyExcerpt: compact(await pageText(page)),
    });
    throw new Error(boundary);
  }

  await fillByLabel(page, /project title/i, application.projectTitle, ['input[name*="title" i]']);
  await fillByLabel(page, /one descriptive sentence/i, application.descriptiveSentence);
  await fillByLabel(page, /^project proposal/i, application.proposal);
  await fillByLabel(page, /what problem are you trying to solve/i, application.problemStatement);
  await fillByLabel(page, /project timeline/i, application.timeline);
  await fillByLabel(page, /requested funding|api credits|resources needed/i, application.funding);

  const checkboxes = page.locator('input[type="checkbox"]');
  let consentChecked = false;
  for (let i = 0; i < (await checkboxes.count()); i += 1) {
    const checkbox = checkboxes.nth(i);
    if (!(await checkbox.isVisible().catch(() => false))) continue;
    let container = checkbox;
    let surrounding = '';
    for (let depth = 0; depth < 5; depth += 1) {
      surrounding = await container.innerText().catch(() => surrounding);
      if (/applicant acknowledges|exclusivity|independently developing/i.test(surrounding)) break;
      container = container.locator('xpath=..');
    }
    if (/applicant acknowledges|exclusivity|independently developing/i.test(surrounding)) {
      if (!(await checkbox.isChecked())) await checkbox.check();
      consentChecked = true;
      break;
    }
  }

  if (!consentChecked && (await checkboxes.count()) === 1) {
    const checkbox = checkboxes.first();
    if (await checkbox.isVisible().catch(() => false)) {
      if (!(await checkbox.isChecked())) await checkbox.check();
      consentChecked = true;
    }
  }

  await saveAuditMetadata(page, '04-before-submit');

  boundary = await detectBoundary(page);
  if (boundary) {
    await writeReceipt({
      status: boundary,
      endUrl: page.url(),
      title: await page.title(),
      consentChecked,
      bodyExcerpt: compact(await pageText(page)),
    });
    throw new Error(boundary);
  }

  const requiredEmpty = await page
    .locator('input[required], textarea[required]')
    .evaluateAll((nodes) =>
      nodes
        .filter((node) => node.offsetParent !== null && !String(node.value || '').trim())
        .map((node) => ({ name: node.getAttribute('name'), id: node.id, type: node.getAttribute('type') })),
    );
  if (requiredEmpty.length) {
    await writeReceipt({ status: 'REQUIRED_FIELDS_EMPTY', requiredEmpty, consentChecked });
    throw new Error(`Required visible fields remained empty: ${JSON.stringify(requiredEmpty)}`);
  }

  const startUrl = page.url();
  const submitButton = page.getByRole('button', { name: /^submit$/i }).first();
  let clicked = false;
  if (await visible(submitButton)) {
    receipt.submitClicks += 1;
    await submitButton.click();
    clicked = true;
  } else {
    const submitInput = page.locator('input[type="submit"]').first();
    if (await visible(submitInput)) {
      receipt.submitClicks += 1;
      await submitInput.click();
      clicked = true;
    }
  }
  if (!clicked) throw new Error('Visible Submit control not found');

  await writeReceipt({
    status: 'SUBMIT_CLICKED',
    consentChecked,
    startUrl,
    submitClicks: receipt.submitClicks,
  });

  await Promise.race([
    page.waitForURL((url) => url.toString() !== startUrl, { timeout: 30000 }),
    page.getByText(/thank you|submission.*received|successfully submitted|response has been recorded/i).first().waitFor({ timeout: 30000 }),
    page.waitForTimeout(30000),
  ]).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await saveAuditMetadata(page, '05-after-submit');

  boundary = await detectBoundary(page);
  const finalText = await pageText(page);
  const finalTextLower = finalText.toLowerCase();
  const finalUrl = page.url();
  const successText = /thank you|submission.{0,40}received|successfully submitted|response has been recorded|we have received your/.test(finalTextLower);
  const successUrl = finalUrl !== startUrl && /thank|success|submitted|confirmation|complete/i.test(finalUrl);
  const visibleInvalid = await page.locator('[aria-invalid="true"]:visible').count();
  const validationText = /please (?:complete|enter|provide|select)|required field|invalid (?:email|url|value)|there was an error/i.test(finalTextLower);

  if (boundary === 'HUMAN_VERIFICATION_REQUIRED') {
    await writeReceipt({
      status: boundary,
      endUrl: finalUrl,
      title: await page.title(),
      consentChecked,
      bodyExcerpt: compact(finalText),
    });
    throw new Error(boundary);
  }

  if (successText || successUrl) {
    await writeReceipt({
      status: 'SUBMITTED_CONFIRMED',
      submittedAt: new Date().toISOString(),
      endUrl: finalUrl,
      title: await page.title(),
      consentChecked,
      confirmationEvidence: {
        successText,
        successUrl,
        excerpt: compact(finalText),
      },
    });
    console.log('MATADATA_PATHFINDER_STATUS=SUBMITTED_CONFIRMED');
    process.exitCode = 0;
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
    await writeReceipt({
      status: 'FAILED_BEFORE_SUBMIT',
      error: error instanceof Error ? error.message : String(error),
    });
  } else {
    await writeReceipt({ error: error instanceof Error ? error.message : String(error) });
  }
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
}
