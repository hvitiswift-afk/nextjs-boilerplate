#!/usr/bin/env python3
"""Apply the reviewed MATADATA Pathfinder V2.1 acknowledgment repair offline."""

from __future__ import annotations

import base64
import gzip
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path.cwd()
V2_DIR = ROOT / "tools" / "matadata-pathfinder" / "v2"
UPGRADE_DIR = V2_DIR / "upgrade"
WORKFLOW = ROOT / ".github" / "workflows" / "matadata-openai-pathfinder-v2.yml"
INSPECT_WORKFLOW = ROOT / ".github" / "workflows" / "matadata-pathfinder-v2-inspect.yml"
UPGRADE_WORKFLOW = ROOT / ".github" / "workflows" / "matadata-openai-pathfinder-v21-upgrade.yml"

OLD_SOURCE_SHA = "f2839e50dbf2e7c2dad64a6e227555c4b9f5c9b29ff45e073a92026e4a561811"
NEW_SOURCE_SHA = "738ccace37392a064eb37bd1b360a292199cb1bad94b0a656e899f03d43ab13c"
NEW_GZIP_SHA = "cead533070b44e4782e9863584cde0e4d5384d81c9f11361a1090bf5524d2952"
NEW_BASE64_SHA = "0a1cf699c1b94300edc58e5cefdf754ee1450d9ef6877a7217a08a5fcb9d0d88"
PATCH_BASE64_SHA = "11e20d0300ac0c15e57eee8c676f73887c67547791c55ce087a0285a17cde91c"
PATCH_GZIP_SHA = "28856b1f2963b0a13c39aa5ddf2d60d3f877895d4877f91764c8c0c58bcfbf44"
PATCH_SHA = "7dfff4552e7aa28490853362dc84ca3378e2bd7a286c457ff2c329e0ceebc326"
APPLICATION_SHA = "6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340"
EXPECTED_CHUNKS = [5000, 5000, 5000, 5000, 5000, 2864]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def concatenate(paths: list[Path]) -> bytes:
    require(bool(paths), "No expected input chunks were found.")
    return b"".join(path.read_bytes() for path in paths)


def run(command: list[str], **kwargs: object) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, check=True, text=True, **kwargs)


def main() -> None:
    require(WORKFLOW.exists(), f"Missing retained workflow: {WORKFLOW}")
    require(UPGRADE_DIR.exists(), f"Missing upgrade directory: {UPGRADE_DIR}")

    with tempfile.TemporaryDirectory(prefix="matadata-v21-") as temporary:
        tmp = Path(temporary)

        old_b64 = concatenate(sorted(V2_DIR.glob("runner.b64.*")))
        old_gzip = base64.b64decode(old_b64, validate=True)
        old_source = gzip.decompress(old_gzip)
        require(sha256(old_source) == OLD_SOURCE_SHA, "Original V2.0 runner checksum mismatch.")

        patch_b64 = concatenate(sorted(UPGRADE_DIR.glob("v21.patch.b64.*")))
        require(sha256(patch_b64) == PATCH_BASE64_SHA, "V2.1 patch base64 checksum mismatch.")
        patch_gzip = base64.b64decode(patch_b64, validate=True)
        require(sha256(patch_gzip) == PATCH_GZIP_SHA, "V2.1 patch gzip checksum mismatch.")
        patch_text = gzip.decompress(patch_gzip)
        require(sha256(patch_text) == PATCH_SHA, "V2.1 patch checksum mismatch.")

        old_path = tmp / "runner-v20.cjs"
        new_path = tmp / "runner-v21.cjs"
        patch_path = tmp / "v21.patch"
        old_path.write_bytes(old_source)
        new_path.write_bytes(old_source)
        patch_path.write_bytes(patch_text)

        run(["patch", "--batch", "--forward", str(new_path), str(patch_path)])
        new_source = new_path.read_bytes()
        require(sha256(new_source) == NEW_SOURCE_SHA, "Patched V2.1 runner checksum mismatch.")
        run(["node", "--check", str(new_path)])

        mock = tmp / "mock-playwright.cjs"
        mock.write_text("module.exports={chromium:{}};\n", encoding="utf-8")
        selftest_dir = tmp / "selftest"
        selftest_dir.mkdir()
        environment = os.environ.copy()
        environment.update(
            {
                "PATHFINDER_SELF_TEST": "1",
                "PATHFINDER_TOKEN": "offline-preflight-token-000000000000",
                "PATHFINDER_ARTIFACT_DIR": str(selftest_dir),
                "PATHFINDER_SUBMISSION_ID": "matadata-openai-cybersecurity-grant-v1",
                "PLAYWRIGHT_MODULE": str(mock),
            }
        )
        run(["node", str(new_path)], env=environment)
        result = json.loads((selftest_dir / "selftest.json").read_text(encoding="utf-8"))
        tests = {item["name"]: item["ok"] for item in result.get("tests", [])}
        required_tests = {
            "field-spec-count",
            "application-keys",
            "proposal-limit",
            "problem-limit",
            "authorization-language",
            "html-token-removal",
            "direct-submit-block",
            "acknowledgment-proxy-panel",
            "acknowledgment-proxy-endpoint",
            "acknowledgment-text-validation",
            "acknowledgment-affirmation-gate",
            "personal-affirmation-submit-precondition",
        }
        failed = sorted(name for name in required_tests if tests.get(name) is not True)
        require(result.get("passed") is True, "V2.1 self-test did not pass.")
        require(result.get("runnerVersion") == "2.1.0", "Unexpected V2.1 runner version.")
        require(not failed, f"Missing or failed V2.1 self-tests: {failed}")
        require(result.get("applicationSha256") == APPLICATION_SHA, "Application content changed unexpectedly.")

        compressed = gzip.compress(new_source, compresslevel=9, mtime=0)
        encoded = base64.b64encode(compressed)
        require(sha256(compressed) == NEW_GZIP_SHA, "Deterministic V2.1 gzip checksum mismatch.")
        require(sha256(encoded) == NEW_BASE64_SHA, "Deterministic V2.1 base64 checksum mismatch.")

        for old_chunk in V2_DIR.glob("runner.b64.*"):
            old_chunk.unlink()
        sizes: list[int] = []
        for index, start in enumerate(range(0, len(encoded), 5000)):
            chunk = encoded[start : start + 5000]
            (V2_DIR / f"runner.b64.{index:02d}").write_bytes(chunk)
            sizes.append(len(chunk))
        require(sizes == EXPECTED_CHUNKS, f"Unexpected V2.1 chunk sizes: {sizes}")

    workflow_text = WORKFLOW.read_text(encoding="utf-8")
    require(OLD_SOURCE_SHA in workflow_text, "Original workflow checksum was not found.")
    WORKFLOW.write_text(workflow_text.replace(OLD_SOURCE_SHA, NEW_SOURCE_SHA), encoding="utf-8")

    readme = """# MATADATA OpenAI Pathfinder V2.1

This directory stages the reviewed, non-confidential MATADATA Cybersecurity Grant Program submission runner for a future authorized attempt.

## Safety boundary

- Opening or updating the draft PR runs **offline preflight only**.
- A live form session requires an explicit execution gate.
- JP personally completes any CAPTCHA, identity, signature, human-verification, or applicant-acknowledgment step.
- The runner blocks direct remote taps on **Submit** and performs no more than one authorized submit click.
- A submission is recorded only after positive confirmation evidence.
- If one click occurs but confirmation is uncertain, the runner stops and will not click again.
- A confirmed-submission artifact prevents later runs from submitting the same application again.

## Acknowledgment control

V2.1 does not depend on OpenAI's visual checkbox loading correctly inside the remote screenshot. It extracts the current acknowledgment text from the official form and displays that text in a dedicated Pathfinder panel. JP must personally check the panel and press **Record my acknowledgment and continue**. The runner then checks and positively verifies the real underlying OpenAI control before submission. If the text changes, the screenshot revision is stale, or the underlying control cannot be verified, submission remains blocked.

## Integrity

Reviewed runner SHA-256:

```text
738ccace37392a064eb37bd1b360a292199cb1bad94b0a656e899f03d43ab13c
```

Application content SHA-256:

```text
6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340
```

The six `runner.b64.*` files concatenate into a base64-encoded deterministic gzip stream. The workflow reconstructs the reviewed runner, verifies its checksum, checks JavaScript syntax, and runs policy/proposal self-tests before any live browser can start.

## Normal use

Keep the PR title in staged form for review and preflight. Do not use the execution trigger unless JP has renewed the exact one-submit authorization and is available to complete the human-only steps.
"""
    (V2_DIR / "README.md").write_text(readme, encoding="utf-8")

    manifest = {
        "name": "MATADATA OpenAI Form Pathfinder V2.1",
        "version": "2.1.0",
        "status": "STAGED_NOT_EXECUTED",
        "submission_id": "matadata-openai-cybersecurity-grant-v1",
        "runner_sha256": NEW_SOURCE_SHA,
        "gzip_sha256": NEW_GZIP_SHA,
        "base64_sha256": NEW_BASE64_SHA,
        "application_sha256": APPLICATION_SHA,
        "chunk_sizes_bytes": EXPECTED_CHUNKS,
        "self_test": {
            "passed": True,
            "expected_field_specs": 14,
            "proposal_words": 902,
            "problem_statement_words": 147,
            "direct_submit_taps_blocked": True,
            "positive_confirmation_required": True,
            "exactly_once_lock": True,
            "acknowledgment_proxy_panel": True,
            "acknowledgment_proxy_endpoint": True,
            "acknowledgment_text_validation": True,
            "personal_affirmation_submit_precondition": True,
        },
        "acknowledgment_flow": {
            "source": "Current text extracted from the official OpenAI form DOM",
            "personal_action": "JP checks the dedicated panel and presses Record my acknowledgment and continue",
            "underlying_control_verification_required": True,
            "stale_revision_rejected": True,
            "direct_submit_taps_blocked": True,
        },
        "human_only_steps": [
            "CAPTCHA or human verification",
            "identity or signature if requested",
            "applicant acknowledgment",
        ],
        "live_execution": False,
    }
    (V2_DIR / "MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    shutil.rmtree(UPGRADE_DIR)
    INSPECT_WORKFLOW.unlink(missing_ok=True)
    UPGRADE_WORKFLOW.unlink(missing_ok=True)

    print(
        json.dumps(
            {
                "status": "UPGRADED_STAGED_NOT_EXECUTED",
                "runnerVersion": "2.1.0",
                "runnerSha256": NEW_SOURCE_SHA,
                "applicationSha256": APPLICATION_SHA,
                "chunkSizes": EXPECTED_CHUNKS,
                "selfTestPassed": True,
                "liveExecution": False,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
