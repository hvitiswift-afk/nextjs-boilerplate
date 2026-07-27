#!/usr/bin/env python3
from __future__ import annotations

import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile

ROOT = Path.cwd()
PART_DIR = ROOT / 'tools' / 'matadata-pathfinder' / 'v22'
WORKFLOW = ROOT / '.github' / 'workflows' / 'matadata-openai-pathfinder-v22.yml'
OLD_PACKAGE_SHA = 'ea5d0589225f4a7e6ac9fc177f90ec15e33b732e14c9ce2b1bf6ae8270336241'
OLD_RUNNER_SHA = 'defc4b0e311d7a68e9e12d7464b6959fd1538b240bf98a7c073e521a169f6a4e'
APPLICATION_SHA = '54a4f19763f3d5ac2cbddc57d946f30fe4a7cd3938908c570443c5996120812a'
OLD_VERSION = '2.3.0'
NEW_VERSION = '2.4.0'


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    require(count == 1, f'Expected exactly one {label} target; found {count}.')
    return text.replace(old, new, 1)


def run(command: list[str], *, env: dict[str, str] | None = None) -> None:
    subprocess.run(command, check=True, text=True, env=env)


def deterministic_gzip(data: bytes) -> bytes:
    buffer = io.BytesIO()
    with gzip.GzipFile(filename='', mode='wb', fileobj=buffer, compresslevel=9, mtime=0) as archive:
        archive.write(data)
    return buffer.getvalue()


def patch_runner(source: str) -> str:
    source = replace_once(source, "const RUNNER_VERSION = '2.3.0';", "const RUNNER_VERSION = '2.4.0';", 'runner version')

    marker = 'async function fillStableField(spec, value) {'
    helpers = r'''function normalizeFieldLineEndings(value) {
  return String(value == null ? '' : value).replace(/\r\n?/g, '\n');
}

function compareFieldValue(spec, expected, observed, tag = '') {
  const expectedRaw = String(expected == null ? '' : expected);
  const observedRaw = String(observed == null ? '' : observed);
  const expectedNormalized = normalizeFieldLineEndings(expectedRaw);
  const observedNormalized = normalizeFieldLineEndings(observedRaw);
  const isTextarea = String(tag || '').toLowerCase() === 'textarea';
  let ok = false;
  let mode = 'mismatch';
  let observedCanonical = observedNormalized;
  if (observedRaw === expectedRaw) {
    ok = true;
    mode = 'exact';
  } else if (observedNormalized === expectedNormalized) {
    ok = true;
    mode = 'line-ending-normalized';
  } else if (isTextarea && observedNormalized === `${expectedNormalized}\n`) {
    ok = true;
    mode = 'single-terminal-linebreak';
    observedCanonical = observedNormalized.slice(0, -1);
  }
  return {
    ok,
    mode,
    expectedLength: expectedRaw.length,
    observedLength: observedRaw.length,
    expectedSha256: sha256(expectedRaw),
    observedSha256: sha256(observedRaw),
    expectedCanonicalSha256: sha256(expectedNormalized),
    observedCanonicalSha256: sha256(observedCanonical),
    rawLengthDelta: observedRaw.length - expectedRaw.length
  };
}

'''
    source = replace_once(source, marker, helpers + marker, 'field comparison helper insertion')

    old_fill = r'''      control = await resolveFieldControl(spec);
      const observed = await controlValue(control);
      if (observed !== value) throw new Error(`Value verification mismatch: expected ${value.length} chars, observed ${observed.length}.`);
      const details = await stableFieldIdentity(control);
      const validity = await control.evaluate((el) => ({
        required: Boolean(el.required || el.getAttribute('aria-required') === 'true'),
        valid: typeof el.checkValidity === 'function' ? el.checkValidity() : true,
        validationMessage: typeof el.validationMessage === 'string' ? el.validationMessage : ''
      }));
      return { key: spec.key, length: value.length, valueSha256: sha256(value), attempt, ...details, ...validity };'''
    new_fill = r'''      control = await resolveFieldControl(spec);
      const observed = await controlValue(control);
      const details = await stableFieldIdentity(control);
      const comparison = compareFieldValue(spec, value, observed, details.tag);
      if (!comparison.ok) throw new Error(`Value verification mismatch: expected ${value.length} chars, observed ${observed.length}; mode ${comparison.mode}.`);
      const validity = await control.evaluate((el) => ({
        required: Boolean(el.required || el.getAttribute('aria-required') === 'true'),
        valid: typeof el.checkValidity === 'function' ? el.checkValidity() : true,
        validationMessage: typeof el.validationMessage === 'string' ? el.validationMessage : ''
      }));
      return { key: spec.key, length: value.length, valueSha256: sha256(value), attempt, comparisonMode: comparison.mode, rawObservedLength: observed.length, rawObservedSha256: sha256(observed), expectedCanonicalSha256: comparison.expectedCanonicalSha256, observedCanonicalSha256: comparison.observedCanonicalSha256, rawLengthDelta: comparison.rawLengthDelta, ...details, ...validity };'''
    source = replace_once(source, old_fill, new_fill, 'fill-time value verification')

    old_verify = r'''      const control = await resolveFieldControl(spec);
      const observed = await controlValue(control);
      const expected = application[spec.key];
      const identity = await stableFieldIdentity(control);
      const ok = observed === expected;
      observations.push({ key: spec.key, ok, expectedLength: expected.length, observedLength: observed.length, expectedSha256: sha256(expected), observedSha256: sha256(observed), ...identity });
      if (!ok) mismatches.push({ key: spec.key, expectedLength: expected.length, observedLength: observed.length, expectedSha256: sha256(expected), observedSha256: sha256(observed), ...identity });'''
    new_verify = r'''      const control = await resolveFieldControl(spec);
      const observed = await controlValue(control);
      const expected = application[spec.key];
      const identity = await stableFieldIdentity(control);
      const comparison = compareFieldValue(spec, expected, observed, identity.tag);
      observations.push({ key: spec.key, ok: comparison.ok, comparisonMode: comparison.mode, expectedLength: expected.length, observedLength: observed.length, expectedSha256: sha256(expected), observedSha256: sha256(observed), expectedCanonicalSha256: comparison.expectedCanonicalSha256, observedCanonicalSha256: comparison.observedCanonicalSha256, rawLengthDelta: comparison.rawLengthDelta, ...identity });
      if (!comparison.ok) mismatches.push({ key: spec.key, comparisonMode: comparison.mode, expectedLength: expected.length, observedLength: observed.length, expectedSha256: sha256(expected), observedSha256: sha256(observed), expectedCanonicalSha256: comparison.expectedCanonicalSha256, observedCanonicalSha256: comparison.observedCanonicalSha256, rawLengthDelta: comparison.rawLengthDelta, ...identity });'''
    source = replace_once(source, old_verify, new_verify, 'full-form value verification')

    selftest_marker = "  add('full-field-verification', fillApplication.toString().includes('verifyAllApplicationFields') && submitOnce.toString().includes('verifyAllApplicationFields'));"
    selftest_addition = selftest_marker + "\n  const fundingSpec = FIELD_SPECS.find((spec) => spec.key === 'funding');\n  const terminalNewlineTest = compareFieldValue(fundingSpec, 'alpha\\nbeta', 'alpha\\nbeta\\n', 'textarea');\n  const crlfTest = compareFieldValue(fundingSpec, 'alpha\\nbeta', 'alpha\\r\\nbeta', 'textarea');\n  const substantiveMismatchTest = compareFieldValue(fundingSpec, 'alpha\\nbeta', 'alpha\\nBETA\\n', 'textarea');\n  add('single-terminal-linebreak-equivalence', terminalNewlineTest.ok && terminalNewlineTest.mode === 'single-terminal-linebreak' && terminalNewlineTest.rawLengthDelta === 1, terminalNewlineTest);\n  add('line-ending-normalization-equivalence', crlfTest.ok && crlfTest.mode === 'line-ending-normalized', crlfTest);\n  add('substantive-field-difference-rejected', !substantiveMismatchTest.ok, substantiveMismatchTest);"
    source = replace_once(source, selftest_marker, selftest_addition, 'normalization self-tests')
    return source


def deterministic_tar_gz(source_dir: Path, destination: Path) -> None:
    with destination.open('wb') as raw:
        with gzip.GzipFile(filename='', mode='wb', fileobj=raw, compresslevel=9, mtime=0) as zipped:
            with tarfile.open(fileobj=zipped, mode='w', format=tarfile.PAX_FORMAT) as archive:
                for item in sorted(source_dir.rglob('*'), key=lambda value: value.relative_to(source_dir).as_posix()):
                    info = archive.gettarinfo(str(item), item.relative_to(source_dir).as_posix())
                    info.uid = info.gid = 0
                    info.uname = info.gname = ''
                    info.mtime = 0
                    if item.is_file():
                        with item.open('rb') as stream:
                            archive.addfile(info, stream)
                    else:
                        archive.addfile(info)


def main() -> None:
    parts = sorted(PART_DIR.glob('package.part.*'))
    require(parts, 'No V2.3 package parts were found.')
    old_package = b''.join(part.read_bytes() for part in parts)
    require(sha256(old_package) == OLD_PACKAGE_SHA, 'V2.3 package checksum mismatch.')

    with tempfile.TemporaryDirectory(prefix='matadata-v24-') as temp_name:
        temp = Path(temp_name)
        old_archive = temp / 'v23.tar.gz'
        old_archive.write_bytes(old_package)
        package_dir = temp / 'package'
        package_dir.mkdir()
        with tarfile.open(old_archive, 'r:gz') as archive:
            archive.extractall(package_dir, filter='data')

        runner_gz = package_dir / 'runner.cjs.gz'
        old_source = gzip.decompress(runner_gz.read_bytes()).decode('utf-8')
        require(sha256(old_source.encode()) == OLD_RUNNER_SHA, 'V2.3 runner checksum mismatch.')
        new_source = patch_runner(old_source)
        runner_sha = sha256(new_source.encode())
        new_runner_gz = deterministic_gzip(new_source.encode())
        runner_gzip_sha = sha256(new_runner_gz)
        runner_gz.write_bytes(new_runner_gz)

        runner_path = temp / 'runner.cjs'
        runner_path.write_text(new_source, encoding='utf-8')
        run(['node', '--check', str(runner_path)])
        mock = temp / 'mock-playwright.cjs'
        mock.write_text('module.exports={chromium:{}};\n', encoding='utf-8')
        selftest_dir = temp / 'selftest'
        selftest_dir.mkdir()
        environment = os.environ.copy()
        environment.update({
            'PATHFINDER_SELF_TEST': '1',
            'PATHFINDER_TOKEN': 'offline-v24-token-0000000000000000',
            'PATHFINDER_ARTIFACT_DIR': str(selftest_dir),
            'PATHFINDER_SUBMISSION_ID': 'matadata-openai-cybersecurity-grant-v1',
            'PATHFINDER_RUNNER_SHA256': runner_sha,
            'PLAYWRIGHT_MODULE': str(mock),
        })
        run(['node', str(runner_path)], env=environment)
        selftest = json.loads((selftest_dir / 'selftest.json').read_text(encoding='utf-8'))
        require(selftest.get('passed') is True, 'V2.4 runner self-test failed.')
        require(selftest.get('runnerVersion') == NEW_VERSION, 'V2.4 runner version mismatch.')
        require(selftest.get('applicationSha256') == APPLICATION_SHA, 'Application content changed unexpectedly.')
        tests = {item['name']: item['ok'] for item in selftest.get('tests', [])}
        for name in ('single-terminal-linebreak-equivalence', 'line-ending-normalization-equivalence', 'substantive-field-difference-rejected'):
            require(tests.get(name) is True, f'Missing or failed V2.4 self-test: {name}.')

        for script in (package_dir / 'scripts').glob('*'):
            text = script.read_text(encoding='utf-8').replace(OLD_VERSION, NEW_VERSION).replace(OLD_RUNNER_SHA, runner_sha)
            if script.name == 'preflight.sh':
                old_required = "'field-spec-count', 'unique-stable-field-names', 'no-descriptive-sentence-duplicate', 'fresh-field-resolution', 'full-field-verification', 'terms-text-only-acknowledgment', 'application-keys'"
                new_required = "'field-spec-count', 'unique-stable-field-names', 'no-descriptive-sentence-duplicate', 'fresh-field-resolution', 'full-field-verification', 'single-terminal-linebreak-equivalence', 'line-ending-normalization-equivalence', 'substantive-field-difference-rejected', 'terms-text-only-acknowledgment', 'application-keys'"
                text = replace_once(text, old_required, new_required, 'preflight required-test set')
            script.write_text(text, encoding='utf-8')

        manifest_path = package_dir / 'MANIFEST.json'
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
        manifest.update({
            'name': 'MATADATA OpenAI Form Pathfinder V2.4',
            'version': NEW_VERSION,
            'status': 'STAGED_NOT_EXECUTED',
            'runner_sha256': runner_sha,
            'gzip_sha256': runner_gzip_sha,
            'application_sha256': APPLICATION_SHA,
            'source_bytes': len(new_source.encode()),
            'gzip_bytes': len(new_runner_gz),
            'expected_field_specs': 13,
            'field_spec_count': 13,
            'upgrade_from': OLD_VERSION,
            'textarea_canonical_verification': True,
            'single_terminal_linebreak_equivalence': True,
            'line_ending_normalization': True,
            'substantive_difference_rejection': True,
            'live_execution': False,
        })
        manifest.setdefault('features', {}).update({
            'textarea_canonical_verification': True,
            'single_terminal_linebreak_equivalence': True,
            'line_ending_normalization': True,
            'substantive_difference_rejection': True,
        })
        manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')

        new_archive = temp / 'v24.tar.gz'
        deterministic_tar_gz(package_dir, new_archive)
        new_package = new_archive.read_bytes()
        package_sha = sha256(new_package)
        verify_dir = temp / 'verify'
        verify_dir.mkdir()
        with tarfile.open(new_archive, 'r:gz') as archive:
            archive.extractall(verify_dir, filter='data')
        require(sha256(gzip.decompress((verify_dir / 'runner.cjs.gz').read_bytes())) == runner_sha, 'Rebuilt V2.4 package runner mismatch.')

        for part in parts:
            part.unlink()
        part_size = 8000
        new_parts = []
        for index, start in enumerate(range(0, len(new_package), part_size)):
            part = PART_DIR / f'package.part.{index:02d}'
            part.write_bytes(new_package[start:start + part_size])
            new_parts.append(part.name)

        receipt = {
            'status': 'UPGRADED_STAGED_NOT_EXECUTED',
            'fromVersion': OLD_VERSION,
            'runnerVersion': NEW_VERSION,
            'packageSha256': package_sha,
            'runnerSha256': runner_sha,
            'runnerGzipSha256': runner_gzip_sha,
            'applicationSha256': APPLICATION_SHA,
            'packageBytes': len(new_package),
            'packageParts': new_parts,
            'repair': {
                'sourceStatusPhase': 'VALIDATION_ERROR',
                'sourceSubmitClicks': 0,
                'field': 'funding',
                'expectedLength': 960,
                'observedLength': 961,
                'acceptedEquivalence': 'exact content plus one terminal line break for textarea only',
                'lineEndingNormalization': 'CRLF and CR normalized to LF',
                'substantiveDifferencesStillBlocked': True,
            },
            'selfTest': selftest,
            'liveExecution': False,
        }
        (PART_DIR / 'V24_UPGRADE_RECEIPT.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')

        workflow = WORKFLOW.read_text(encoding='utf-8')
        workflow = workflow.replace('V2.3', 'V2.4').replace('v23', 'v24').replace(OLD_VERSION, NEW_VERSION)
        workflow = workflow.replace(OLD_PACKAGE_SHA, package_sha).replace(OLD_RUNNER_SHA, runner_sha)
        workflow = workflow.replace('V23_UPGRADE_RECEIPT.json', 'V24_UPGRADE_RECEIPT.json')
        WORKFLOW.write_text(workflow, encoding='utf-8')

        print(json.dumps(receipt, indent=2))

    for removable in (
        ROOT / '.github/workflows/matadata-v23-live-snapshot.yml',
        ROOT / '.github/workflows/matadata-v23-source-export.yml',
        PART_DIR / 'POST_CLICK_ERROR_PENDING.md',
    ):
        removable.unlink(missing_ok=True)


if __name__ == '__main__':
    main()
