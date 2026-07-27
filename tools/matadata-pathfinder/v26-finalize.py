#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path.cwd()


def fail(message: str) -> None:
    raise SystemExit(message)


def api(method: str, path: str, payload: dict | None = None):
    repository = os.environ['GITHUB_REPOSITORY']
    token = os.environ['GH_TOKEN']
    data = None if payload is None else json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(
        f'https://api.github.com/repos/{repository}{path}',
        data=data,
        method=method,
        headers={
            'Authorization': f'Bearer {token}',
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'matadata-pathfinder-v26-finalizer',
            'Content-Type': 'application/json',
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            raw = response.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        body = exc.read().decode('utf-8', errors='replace')
        fail(f'GitHub API {method} {path} failed: HTTP {exc.code}: {body}')


def changed_records() -> list[dict[str, str]]:
    raw = subprocess.check_output(['git', 'status', '--porcelain=v1', '-z'])
    records = [item for item in raw.decode('utf-8', errors='strict').split('\0') if item]
    result: list[dict[str, str]] = []
    for record in records:
        if len(record) < 4:
            fail(f'Malformed git status record: {record!r}')
        code, path = record[:2], record[3:]
        if code[0] in {'R', 'C'}:
            fail(f'Unexpected rename/copy: {record!r}')
        result.append({'code': code, 'path': path})
    return result


def validate_generated_state(records: list[dict[str, str]]) -> dict:
    allowed_exact = {
        '.github/workflows/matadata-openai-pathfinder-v22.yml',
        '.github/workflows/matadata-v25-submit-disabled-snapshot.yml',
        '.github/workflows/matadata-v25-source-export.yml',
        '.github/workflows/matadata-v25-high-screen.yml',
        '.github/workflows/matadata-v26-upgrade.yml',
        '.github/workflows/matadata-v26-finalize.yml',
        'tools/matadata-pathfinder/v26-finalize.py',
        'tools/matadata-pathfinder/v22/README.md',
        'tools/matadata-pathfinder/v22/MANIFEST.json',
        'tools/matadata-pathfinder/v22/V26_UPGRADE_RECEIPT.json',
    }
    allowed_prefixes = (
        'tools/matadata-pathfinder/v22/package.part.',
        'tools/matadata-pathfinder/v26/',
    )
    unexpected = [item for item in records if item['path'] not in allowed_exact and not item['path'].startswith(allowed_prefixes)]
    if unexpected:
        fail(f'Unexpected generated paths: {unexpected}')

    required = {
        '.github/workflows/matadata-openai-pathfinder-v22.yml',
        '.github/workflows/matadata-v26-upgrade.yml',
        '.github/workflows/matadata-v26-finalize.yml',
        'tools/matadata-pathfinder/v26-finalize.py',
        'tools/matadata-pathfinder/v22/README.md',
        'tools/matadata-pathfinder/v22/MANIFEST.json',
        'tools/matadata-pathfinder/v22/V26_UPGRADE_RECEIPT.json',
    }
    paths = {item['path'] for item in records}
    missing = sorted(required - paths)
    if missing:
        fail(f'Required generated changes are missing: {missing}')

    parts = sorted((ROOT / 'tools/matadata-pathfinder/v22').glob('package.part.*'))
    if not parts:
        fail('No generated V2.6 package parts found.')
    package = b''.join(part.read_bytes() for part in parts)
    package_sha = hashlib.sha256(package).hexdigest()
    workflow = (ROOT / '.github/workflows/matadata-openai-pathfinder-v22.yml').read_text(encoding='utf-8')
    match = re.search(r'^\s*PACKAGE_SHA256:\s*([0-9a-f]{64})\s*$', workflow, flags=re.M)
    if not match or match.group(1) != package_sha:
        fail(f'Generated package/workflow checksum mismatch: {package_sha}')

    receipt = json.loads((ROOT / 'tools/matadata-pathfinder/v22/V26_UPGRADE_RECEIPT.json').read_text(encoding='utf-8'))
    if receipt.get('runnerVersion') != '2.6.0' or receipt.get('status') != 'UPGRADED_STAGED_NOT_EXECUTED':
        fail('V2.6 receipt is not in the staged state.')
    if receipt.get('selfTest', {}).get('passed') is not True or receipt.get('liveExecution') is not False:
        fail('V2.6 offline self-test evidence is incomplete.')
    if receipt.get('repair', {}).get('sourceSubmitClicks') != 0:
        fail('The source attempt did not record zero Submit clicks.')

    return {
        'packageSha256': package_sha,
        'packageBytes': len(package),
        'packageParts': [part.name for part in parts],
        'runnerVersion': receipt.get('runnerVersion'),
        'selfTestPassed': True,
        'liveExecution': False,
    }


def commit_state(records: list[dict[str, str]], report: dict) -> str:
    branch = os.environ['BRANCH']
    expected_base = os.environ['EXPECTED_BASE_SHA']
    branch_path = urllib.parse.quote(branch, safe='/')

    ref = api('GET', f'/git/ref/heads/{branch_path}')
    base_sha = ref['object']['sha']
    if base_sha != expected_base:
        fail(f'Branch moved during V2.6 generation: expected {expected_base}, found {base_sha}.')
    base_commit = api('GET', f'/git/commits/{base_sha}')
    base_tree = base_commit['tree']['sha']

    entries = []
    for item in records:
        code, path = item['code'], item['path']
        if 'D' in code:
            entries.append({'path': path, 'mode': '100644', 'type': 'blob', 'sha': None})
            continue
        file_path = ROOT / path
        if not file_path.is_file():
            fail(f'Changed path is not a file: {path}')
        blob = api('POST', '/git/blobs', {
            'content': base64.b64encode(file_path.read_bytes()).decode('ascii'),
            'encoding': 'base64',
        })
        entries.append({'path': path, 'mode': '100644', 'type': 'blob', 'sha': blob['sha']})

    if not entries:
        fail('No V2.6 repository changes were available to commit.')
    tree = api('POST', '/git/trees', {'base_tree': base_tree, 'tree': entries})
    commit = api('POST', '/git/commits', {
        'message': 'Upgrade MATADATA Pathfinder to V2.6 Marketo readiness recovery',
        'tree': tree['sha'],
        'parents': [base_sha],
    })
    api('PATCH', f'/git/refs/heads/{branch_path}', {'sha': commit['sha'], 'force': False})

    report.update({'status': 'COMMITTED', 'commitSha': commit['sha'], 'baseSha': base_sha, 'entryCount': len(entries)})
    Path('/tmp/matadata-v26-finalize.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))
    return commit['sha']


def main() -> None:
    for path in (
        ROOT / '.github/workflows/matadata-v26-upgrade.yml',
        ROOT / '.github/workflows/matadata-v26-finalize.yml',
        ROOT / 'tools/matadata-pathfinder/v26-finalize.py',
    ):
        path.unlink(missing_ok=True)

    records = changed_records()
    report = validate_generated_state(records)
    commit_state(records, report)


if __name__ == '__main__':
    main()
