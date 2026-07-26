from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding='utf-8')

def replace_once(old: str, new: str, label: str) -> None:
    global s
    if old not in s:
        raise SystemExit(f'Patch target not found: {label}')
    s = s.replace(old, new, 1)

replace_once(
'''  const invalidCount = await page.locator('input:invalid, textarea:invalid').count().catch(() => 0);
  const acknowledgment = await firstVisibleCheckbox();
  await acknowledgment.scrollIntoViewIfNeeded();
  await page.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }), acknowledgment);
  await page.waitForTimeout(500);
''',
'''  await page.waitForTimeout(1000);
  const invalidCount = await page.locator('input:invalid, textarea:invalid, select:invalid').count().catch(() => 0);
  const acknowledgmentText = page.getByText(/The Applicant acknowledges/i).first();
  if (await visible(acknowledgmentText)) {
    await acknowledgmentText.scrollIntoViewIfNeeded().catch(() => {});
    await page.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }), acknowledgmentText).catch(() => {});
  } else {
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })).catch(() => {});
  }
  await page.waitForTimeout(700);
''',
'fillApplication acknowledgment discovery',
)

replace_once(
'''  if (state.phase === 'ACKNOWLEDGMENT_REQUIRED') {
    const acknowledgment = await firstVisibleCheckbox();
    const box = await acknowledgment.boundingBox();
    if (!box) return { ok: false, reason: 'Acknowledgment is not visible.' };
    const allowed = x >= box.x - 35 && x <= box.x + Math.max(90, box.width + 90) && y >= box.y - 35 && y <= box.y + Math.max(90, box.height + 90);
    if (!allowed) return { ok: false, reason: 'Only the applicant acknowledgment checkbox can be tapped now.' };
    await page.mouse.click(x, y);
    await page.waitForTimeout(500);
    const checked = await acknowledgment.isChecked().catch(() => false);
    setState({ acknowledgmentChecked: checked, message: checked ? 'JP checked the applicant acknowledgment. Validating for one-time submission.' : 'Applicant acknowledgment is not checked.' });
    if (checked) await submitOnce();
    return { ok: checked, reason: checked ? 'Acknowledgment accepted.' : 'Tap did not check the acknowledgment.' };
  }
''',
'''  if (state.phase === 'ACKNOWLEDGMENT_REQUIRED') {
    const submit = page.getByRole('button', { name: /^Submit$/i }).first();
    if (await visible(submit)) {
      const submitBox = await submit.boundingBox().catch(() => null);
      if (submitBox) {
        const insideSubmit = x >= submitBox.x - 20 && x <= submitBox.x + submitBox.width + 20 && y >= submitBox.y - 20 && y <= submitBox.y + submitBox.height + 20;
        if (insideSubmit) return { ok: false, reason: 'Direct Submit taps are blocked. Tap the applicant acknowledgment; Pathfinder performs the one authorized submit click.' };
      }
    }
    await page.mouse.click(x, y);
    await page.waitForTimeout(800);
    const ackSignals = await page.locator('input[type="checkbox"]:checked, [role="checkbox"][aria-checked="true"], [data-state="checked"], button[aria-pressed="true"]').count().catch(() => 0);
    const invalidCount = await page.locator('input:invalid, textarea:invalid, select:invalid').count().catch(() => 0);
    const submitEnabled = await visible(submit) && !await submit.isDisabled().catch(() => true);
    const checked = ackSignals > 0 || (submitEnabled && invalidCount === 0);
    setState({ acknowledgmentChecked: checked, message: checked ? 'JP completed the applicant acknowledgment. Validating for one-time submission.' : 'Acknowledgment is not yet detected. Scroll if needed and tap its checkbox or acknowledgment row again.' });
    if (checked) await submitOnce();
    return { ok: true, acknowledged: checked, reason: checked ? 'Acknowledgment accepted.' : 'Tap forwarded; acknowledgment not yet detected.' };
  }
''',
'authorizedTap acknowledgment handling',
)

s = s.replace(
    "const invalid = page.locator('input:invalid, textarea:invalid');",
    "const invalid = page.locator('input:invalid, textarea:invalid, select:invalid');",
    1,
)
s = s.replace(
    'Tap only OpenAI’s human-verification challenge. After the form is filled, tap only the applicant acknowledgment checkbox. Radio will submit exactly once.',
    'Tap only OpenAI’s human-verification challenge. After the form is filled, scroll if needed and tap the applicant acknowledgment checkbox or its row. Direct Submit taps are blocked; Radio submits exactly once after validation.',
    1,
)
s = s.replace(
    'This temporary session accepts taps only during human verification and on the applicant acknowledgment. It cannot change the proposal or click Submit directly.',
    'This temporary session forwards taps only during human verification or the acknowledgment step. Direct Submit taps are blocked and the proposal cannot be edited through this interface.',
    1,
)

p.write_text(s, encoding='utf-8')
