#!/usr/bin/env python3
from __future__ import annotations

import base64
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
PACKAGE_DIR = ROOT / 'tools' / 'matadata-pathfinder' / 'v22'
UPGRADE_DIR = ROOT / 'tools' / 'matadata-pathfinder' / 'v26'
WORKFLOW = ROOT / '.github' / 'workflows' / 'matadata-openai-pathfinder-v22.yml'

OLD_VERSION = '2.5.0'
NEW_VERSION = '2.6.0'
OLD_PACKAGE_SHA = '78c1edc9a4b469f771a9b59742bb1c5f65acadaac2d40d2fd2af4b6a0f284358'
OLD_RUNNER_SHA = '6f56edf83efeaec921112c5997d751f7d8a04e810205a7928c1c249906128ab6'
OLD_RUNNER_GZIP_SHA = '75f8c1d9cedd7c968ecb6928f9332ac3d99fdd67eca594eebe75397cd179055d'
NEW_RUNNER_SHA = 'f65082e4e6578558ba592103f4c86ed1ca702c512ff8e93e3a1466c893372ced'
NEW_RUNNER_GZIP_SHA = '83c63f380a4b4f6a464046ac75afb5bcc1e1d9b8050d7f729d2dac23972f6fcb'
APPLICATION_SHA = '54a4f19763f3d5ac2cbddc57d946f30fe4a7cd3938908c570443c5996120812a'
PATCH_B64_SHA = '1f51852c4a78d490952f05767c78ad61199942e2970cbae0852ffe8209d7ff66'
PATCH_GZIP_SHA = '63b97e6d804a669d12ca6ba9f8ef47a28570900d74f46498170435bb4757b6d4'
PATCH_SHA = '5fb303e990ac9e27c3fa5d977721d82d88b8e8a65ef5071a0c17d2af9458c43d'


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def run(command: list[str], *, env: dict[str, str] | None = None) -> None:
    subprocess.run(command, check=True, text=True, env=env)


def deterministic_gzip(data: bytes) -> bytes:
    output = io.BytesIO()
    with gzip.GzipFile(filename='', mode='wb', fileobj=output, compresslevel=9, mtime=0) as archive:
        archive.write(data)
    return output.getvalue()


def deterministic_tar_gz(source: Path, destination: Path) -> None:
    with destination.open('wb') as raw:
        with gzip.GzipFile(filename='', mode='wb', fileobj=raw, compresslevel=9, mtime=0) as zipped:
            with tarfile.open(fileobj=zipped, mode='w', format=tarfile.PAX_FORMAT) as archive:
                for item in sorted(source.rglob('*'), key=lambda value: value.relative_to(source).as_posix()):
                    info = archive.gettarinfo(str(item), item.relative_to(source).as_posix())
                    info.uid = info.gid = 0
                    info.uname = info.gname = ''
                    info.mtime = 0
                    if item.is_file():
                        with item.open('rb') as stream:
                            archive.addfile(info, stream)
                    else:
                        archive.addfile(info)


def update_package_files(package: Path, runner_sha: str, runner_gzip_sha: str, selftest: dict) -> None:
    required_old = "'field-spec-count', 'unique-stable-field-names', 'no-descriptive-sentence-duplicate', 'fresh-field-resolution', 'full-field-verification', 'single-terminal-linebreak-equivalence', 'line-ending-normalization-equivalence', 'single-terminal-space-equivalence', 'single-terminal-nbsp-equivalence', 'single-terminal-zero-width-equivalence', 'multiple-terminal-formatting-rejected', 'internal-field-difference-rejected', 'non-textarea-terminal-formatting-rejected', 'terms-text-only-acknowledgment', 'application-keys', 'proposal-limit', 'problem-limit',"
    required_new = "'field-spec-count', 'unique-stable-field-names', 'no-descriptive-sentence-duplicate', 'fresh-field-resolution', 'full-field-verification', 'single-terminal-linebreak-equivalence', 'line-ending-normalization-equivalence', 'single-terminal-space-equivalence', 'single-terminal-nbsp-equivalence', 'single-terminal-zero-width-equivalence', 'multiple-terminal-formatting-rejected', 'internal-field-difference-rejected', 'non-textarea-terminal-formatting-rejected', 'terms-text-only-acknowledgment', 'semantic-acknowledgment-association', 'submit-readiness-button-path', 'submit-readiness-marketo-path', 'submit-readiness-gate-preserved', 'marketo-api-does-not-force-submittable', 'disabled-submit-recovery', 'application-keys', 'proposal-limit', 'problem-limit',"
    for script in (package / 'scripts').iterdir():
        if not script.is_file():
            continue
        text = script.read_text(encoding='utf-8').replace(OLD_VERSION, NEW_VERSION).replace(OLD_RUNNER_SHA, runner_sha)
        if script.name == 'preflight.sh':
            require(required_old in text, 'V2.5 preflight required-test set was not found.')
            text = text.replace(required_old, required_new, 1)
        script.write_text(text, encoding='utf-8')
        os.chmod(script, 0o755)

    manifest_path = package / 'MANIFEST.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    manifest.update({
        'name': 'MATADATA OpenAI Form Pathfinder V2.6',
        'version': NEW_VERSION,
        'status': 'STAGED_NOT_EXECUTED',
        'runner_sha256': runner_sha,
        'gzip_sha256': runner_gzip_sha,
        'application_sha256': APPLICATION_SHA,
        'source_bytes': 128390,
        'gzip_bytes': 33892,
        'upgrade_from': OLD_VERSION,
        'semantic_acknowledgment_association': True,
        'terms_text_only_preferred_without_semantic_control': True,
        'marketo_set_values_and_validate': True,
        'marketo_submittable_gate_preserved': True,
        'marketo_submit_api_fallback': True,
        'disabled_submit_recovery_cycles': 3,
        'single_safe_reload_for_expired_form_state': True,
        'live_execution': False,
    })
    manifest.setdefault('features', {}).update({
        'semantic_acknowledgment_association': True,
        'terms_text_only_preferred_without_semantic_control': True,
        'marketo_set_values_and_validate': True,
        'marketo_submittable_gate_preserved': True,
        'marketo_submit_api_fallback': True,
        'disabled_submit_readiness_diagnostics': True,
        'single_safe_reload_for_expired_form_state': True,
    })
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')

    receipt = {
        'status': 'UPGRADED_STAGED_NOT_EXECUTED',
        'fromVersion': OLD_VERSION,
        'runnerVersion': NEW_VERSION,
        'runnerSha256': runner_sha,
        'runnerGzipSha256': runner_gzip_sha,
        'applicationSha256': APPLICATION_SHA,
        'repair': {
            'sourcePhase': 'SUBMIT_DISABLED',
            'sourceSubmitClicks': 0,
            'sourceInvalidCount': 0,
            'sourceAcknowledgmentMethod': 'interactive-control',
            'visualFinding': 'Official form screenshot showed acknowledgment terms text and no visible acknowledgment checkbox.',
            'v26AcknowledgmentRule': 'Only semantically and spatially associated controls qualify; otherwise the official text-only mode is used.',
            'v26SubmitRecovery': 'Synchronize through native events and Marketo setValues/validate, preserve submittable gate, then use enabled button or validated Marketo submit API exactly once.',
            'forcedEnableProhibited': True,
            'submittableTrueOverrideProhibited': True,
        },
        'selfTest': selftest,
        'liveExecution': False,
    }
    (package / 'V26_UPGRADE_RECEIPT.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')


def update_repository_files(package_sha: str, runner_sha: str, runner_gzip_sha: str, package_bytes: int, package_parts: list[str], selftest: dict) -> None:
    workflow = WORKFLOW.read_text(encoding='utf-8')
    workflow = workflow.replace('V2.5', 'V2.6').replace('v25', 'v26')
    workflow = workflow.replace(OLD_PACKAGE_SHA, package_sha).replace(OLD_RUNNER_SHA, runner_sha).replace(OLD_RUNNER_GZIP_SHA, runner_gzip_sha)
    workflow = workflow.replace('V25_UPGRADE_RECEIPT.json', 'V26_UPGRADE_RECEIPT.json')
    workflow = workflow.replace('stable-field and acknowledgment preflight', 'disabled-submit recovery preflight')
    workflow = workflow.replace('submission with failover', 'submission with Marketo recovery')
    workflow = workflow.replace('Upload receipt, event chain, screenshots, and logs', 'Upload receipt, readiness evidence, event chain, screenshots, and logs')
    WORKFLOW.write_text(workflow, encoding='utf-8')

    readme = f'''# MATADATA OpenAI Pathfinder V2.6\n\nV2.6 stages a human-gated, exactly-once submission runner for the reviewed non-confidential MATADATA Cybersecurity Grant Program application.\n\n## V2.5 diagnosis\n\nThe V2.5 acknowledgment action completed, all 13 fields passed canonical verification, browser-invalid fields were zero, and no Submit click occurred. The official screenshot showed OpenAI's acknowledgment as terms text with no visible checkbox, yet V2.5 associated an unrelated control and then found the Submit button disabled.\n\n## V2.6 repair\n\n- A checkbox or ARIA control qualifies as an acknowledgment only when semantic evidence and spatial association tie it to the official acknowledgment text.\n- When no associated control exists, JP's personal affirmation uses the official-terms-text-only mode.\n- Final submission readiness synchronizes native field events and Marketo `setValues`, then checks `validate`, `allFieldsFilled`, and the Marketo `submittable` gate.\n- Pathfinder never removes `disabled`, never calls `submittable(true)`, and never overrides OpenAI's validation gate.\n- When the visible button remains stale-disabled but Marketo reports a valid and submittable form, Pathfinder may invoke the official Marketo `submit()` method as the single authorized submission action.\n- Three bounded recovery cycles and one safe form-state reload are supported. Any renewed human-verification challenge returns control to JP and requires a fresh acknowledgment.\n- Direct remote taps on Submit remain blocked; an atomic in-run lock and repository-wide confirmed-submission lock remain mandatory.\n\n## Verified integrity\n\n- Package SHA-256: `{package_sha}`\n- Package bytes: `{package_bytes}`\n- Package parts: `{', '.join(package_parts)}`\n- Runner SHA-256: `{runner_sha}`\n- Runner gzip SHA-256: `{runner_gzip_sha}`\n- Application SHA-256: `{APPLICATION_SHA}`\n- Offline self-tests: `{len(selftest.get('tests', []))} / {len(selftest.get('tests', []))} PASS`\n- Live execution during upgrade: `false`\n\nJP personally completes CAPTCHA, identity, signature, human verification, and applicant acknowledgment. A live run requires a separate commit-bound one-submit authorization and execution-title edit.\n'''
    (PACKAGE_DIR / 'README.md').write_text(readme, encoding='utf-8')

    with tempfile.TemporaryDirectory(prefix='matadata-v26-repo-copy-') as temp_name:
        temp = Path(temp_name)
        archive_path = temp / 'package.tar.gz'
        archive_path.write_bytes(b''.join((PACKAGE_DIR / name).read_bytes() for name in package_parts))
        with tarfile.open(archive_path, 'r:gz') as archive:
            archive.extract('MANIFEST.json', temp, filter='data')
            archive.extract('V26_UPGRADE_RECEIPT.json', temp, filter='data')
        shutil.copy2(temp / 'MANIFEST.json', PACKAGE_DIR / 'MANIFEST.json')
        shutil.copy2(temp / 'V26_UPGRADE_RECEIPT.json', PACKAGE_DIR / 'V26_UPGRADE_RECEIPT.json')


def main() -> None:
    old_parts = sorted(PACKAGE_DIR.glob('package.part.*'))
    require(old_parts, 'No V2.5 package parts were found.')
    old_package = b''.join(part.read_bytes() for part in old_parts)
    require(sha256(old_package) == OLD_PACKAGE_SHA, 'V2.5 package checksum mismatch.')

    patch_b64 = b''.join(path.read_bytes().strip() for path in sorted((UPGRADE_DIR / 'patch').glob('v26.patch.gz.b64.*')))
    require(sha256(patch_b64) == PATCH_B64_SHA, 'V2.6 patch base64 checksum mismatch.')
    patch_gzip = base64.b64decode(patch_b64, validate=True)
    require(sha256(patch_gzip) == PATCH_GZIP_SHA, 'V2.6 patch gzip checksum mismatch.')
    patch = gzip.decompress(patch_gzip)
    require(sha256(patch) == PATCH_SHA, 'V2.6 patch checksum mismatch.')

    with tempfile.TemporaryDirectory(prefix='matadata-v26-') as temp_name:
        temp = Path(temp_name)
        archive_path = temp / 'v25.tar.gz'
        archive_path.write_bytes(old_package)
        package = temp / 'package'
        package.mkdir()
        with tarfile.open(archive_path, 'r:gz') as archive:
            archive.extractall(package, filter='data')

        runner_gzip_path = package / 'runner.cjs.gz'
        old_source = gzip.decompress(runner_gzip_path.read_bytes())
        require(sha256(old_source) == OLD_RUNNER_SHA, 'V2.5 runner checksum mismatch.')
        old_source_path = temp / 'runner-v25.cjs'
        new_source_path = temp / 'runner-v26.cjs'
        patch_path = temp / 'v26.patch'
        old_source_path.write_bytes(old_source)
        new_source_path.write_bytes(old_source)
        patch_path.write_bytes(patch)
        run(['patch', '--batch', '--forward', str(new_source_path), str(patch_path)])
        new_source = new_source_path.read_bytes()
        require(sha256(new_source) == NEW_RUNNER_SHA, 'Patched V2.6 runner checksum mismatch.')
        run(['node', '--check', str(new_source_path)])
        new_runner_gzip = deterministic_gzip(new_source)
        require(sha256(new_runner_gzip) == NEW_RUNNER_GZIP_SHA, 'V2.6 deterministic runner gzip checksum mismatch.')
        runner_gzip_path.write_bytes(new_runner_gzip)

        mock = temp / 'mock-playwright.cjs'
        mock.write_text('module.exports={chromium:{}};\n', encoding='utf-8')
        selftest_dir = temp / 'selftest'
        selftest_dir.mkdir()
        env = os.environ.copy()
        env.update({
            'PATHFINDER_SELF_TEST': '1',
            'PATHFINDER_TOKEN': 'offline-v26-token-0000000000000000',
            'PATHFINDER_ARTIFACT_DIR': str(selftest_dir),
            'PATHFINDER_SUBMISSION_ID': 'matadata-openai-cybersecurity-grant-v1',
            'PATHFINDER_RUNNER_SHA256': NEW_RUNNER_SHA,
            'PLAYWRIGHT_MODULE': str(mock),
        })
        run(['node', str(new_source_path)], env=env)
        selftest = json.loads((selftest_dir / 'selftest.json').read_text(encoding='utf-8'))
        require(selftest.get('passed') is True, 'V2.6 self-test failed.')
        require(selftest.get('runnerVersion') == NEW_VERSION, 'V2.6 self-test version mismatch.')
        require(selftest.get('applicationSha256') == APPLICATION_SHA, 'Application content changed unexpectedly.')
        tests = {item['name']: item['ok'] for item in selftest.get('tests', [])}
        for name in ('semantic-acknowledgment-association', 'submit-readiness-button-path', 'submit-readiness-marketo-path', 'submit-readiness-gate-preserved', 'marketo-api-does-not-force-submittable', 'disabled-submit-recovery'):
            require(tests.get(name) is True, f'Missing or failed V2.6 self-test: {name}.')

        update_package_files(package, NEW_RUNNER_SHA, NEW_RUNNER_GZIP_SHA, selftest)
        new_archive = temp / 'v26.tar.gz'
        deterministic_tar_gz(package, new_archive)
        new_package = new_archive.read_bytes()
        package_sha = sha256(new_package)

        verify = temp / 'verify'
        verify.mkdir()
        with tarfile.open(new_archive, 'r:gz') as archive:
            archive.extractall(verify, filter='data')
        require(sha256(gzip.decompress((verify / 'runner.cjs.gz').read_bytes())) == NEW_RUNNER_SHA, 'Rebuilt V2.6 package runner mismatch.')

        for part in old_parts:
            part.unlink()
        package_parts: list[str] = []
        for index, start in enumerate(range(0, len(new_package), 8000)):
            part = PACKAGE_DIR / f'package.part.{index:02d}'
            part.write_bytes(new_package[start:start + 8000])
            package_parts.append(part.name)

        update_repository_files(package_sha, NEW_RUNNER_SHA, NEW_RUNNER_GZIP_SHA, len(new_package), package_parts, selftest)
        print(json.dumps({
            'status': 'UPGRADED_STAGED_NOT_EXECUTED',
            'runnerVersion': NEW_VERSION,
            'packageSha256': package_sha,
            'packageBytes': len(new_package),
            'packageParts': package_parts,
            'runnerSha256': NEW_RUNNER_SHA,
            'runnerGzipSha256': NEW_RUNNER_GZIP_SHA,
            'applicationSha256': APPLICATION_SHA,
            'selfTestPassed': True,
            'liveExecution': False,
        }, indent=2))

    for path in (
        ROOT / '.github/workflows/matadata-v25-submit-disabled-snapshot.yml',
        ROOT / '.github/workflows/matadata-v25-source-export.yml',
        ROOT / '.github/workflows/matadata-v25-high-screen.yml',
    ):
        path.unlink(missing_ok=True)
    shutil.rmtree(UPGRADE_DIR, ignore_errors=True)


if __name__ == '__main__':
    main()
