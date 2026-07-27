#!/usr/bin/env python3
"""Fail-closed MATADATA Pathfinder V2.5 terminal-formatting repair.

V2.4 stopped before Submit with a one-code-unit funding-textarea mismatch even
though line-ending normalization and a single terminal LF were already allowed.
V2.5 accepts only one additional terminal Unicode whitespace/format code point
on a textarea, records its code point/category, and continues to reject every
internal or substantive difference.
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
import tarfile
import tempfile

ROOT = Path.cwd()
PART_DIR = ROOT / "tools" / "matadata-pathfinder" / "v22"
WORKFLOW = ROOT / ".github" / "workflows" / "matadata-openai-pathfinder-v22.yml"
OLD_PACKAGE_SHA = "3fd7760d1237ecef90db65a1ba6a5b90e6b4ad88a411626528b3ff12f4c07ea4"
OLD_RUNNER_SHA = "491c542b849a33c4f6caa8df24525566b07e820d6cd45eda1a47489729ae48ab"
APPLICATION_SHA = "54a4f19763f3d5ac2cbddc57d946f30fe4a7cd3938908c570443c5996120812a"
OLD_VERSION = "2.4.0"
NEW_VERSION = "2.5.0"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    require(count == 1, f"Expected exactly one {label} target; found {count}.")
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    require(count == 1, f"Expected exactly one {label} regex target; found {count}.")
    return updated


def run(command: list[str], *, env: dict[str, str] | None = None) -> None:
    subprocess.run(command, check=True, text=True, env=env)


def deterministic_gzip(data: bytes) -> bytes:
    buffer = io.BytesIO()
    with gzip.GzipFile(filename="", mode="wb", fileobj=buffer, compresslevel=9, mtime=0) as archive:
        archive.write(data)
    return buffer.getvalue()


def patch_runner(source: str) -> str:
    source = replace_once(source, "const RUNNER_VERSION = '2.4.0';", "const RUNNER_VERSION = '2.5.0';", "runner version")

    comparison = r'''function normalizeFieldLineEndings(value) {
  return String(value == null ? '' : value).replace(/\r\n?/g, '\n');
}

function unicodeCodePointLabel(character) {
  if (!character) return null;
  return `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
}

function terminalFormattingDescriptor(value) {
  const characters = Array.from(String(value == null ? '' : value));
  if (characters.length === 0) return null;
  const character = characters[characters.length - 1];
  if (!/^[\p{White_Space}\p{Cf}]$/u.test(character)) return null;
  const codePoint = character.codePointAt(0);
  const names = new Map([
    [0x0009, 'CHARACTER TABULATION'],
    [0x000A, 'LINE FEED'],
    [0x000D, 'CARRIAGE RETURN'],
    [0x0020, 'SPACE'],
    [0x0085, 'NEXT LINE'],
    [0x00A0, 'NO-BREAK SPACE'],
    [0x1680, 'OGHAM SPACE MARK'],
    [0x2000, 'EN QUAD'],
    [0x2001, 'EM QUAD'],
    [0x2002, 'EN SPACE'],
    [0x2003, 'EM SPACE'],
    [0x2004, 'THREE-PER-EM SPACE'],
    [0x2005, 'FOUR-PER-EM SPACE'],
    [0x2006, 'SIX-PER-EM SPACE'],
    [0x2007, 'FIGURE SPACE'],
    [0x2008, 'PUNCTUATION SPACE'],
    [0x2009, 'THIN SPACE'],
    [0x200A, 'HAIR SPACE'],
    [0x200B, 'ZERO WIDTH SPACE'],
    [0x2028, 'LINE SEPARATOR'],
    [0x2029, 'PARAGRAPH SEPARATOR'],
    [0x202F, 'NARROW NO-BREAK SPACE'],
    [0x205F, 'MEDIUM MATHEMATICAL SPACE'],
    [0x2060, 'WORD JOINER'],
    [0x3000, 'IDEOGRAPHIC SPACE'],
    [0xFEFF, 'ZERO WIDTH NO-BREAK SPACE']
  ]);
  return {
    character,
    codePoint,
    codePointLabel: unicodeCodePointLabel(character),
    name: names.get(codePoint) || (/^\p{White_Space}$/u.test(character) ? 'UNICODE WHITE SPACE' : 'UNICODE FORMAT CHARACTER'),
    stripped: characters.slice(0, -1).join('')
  };
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
  let terminalFormatting = null;
  if (observedRaw === expectedRaw) {
    ok = true;
    mode = 'exact';
  } else if (observedNormalized === expectedNormalized) {
    ok = true;
    mode = 'line-ending-normalized';
  } else if (isTextarea) {
    terminalFormatting = terminalFormattingDescriptor(observedNormalized);
    if (terminalFormatting && terminalFormatting.stripped === expectedNormalized) {
      ok = true;
      mode = 'single-terminal-unicode-formatting';
      observedCanonical = terminalFormatting.stripped;
    }
  }
  const expectedPoints = Array.from(expectedNormalized);
  const observedPoints = Array.from(observedNormalized);
  let firstDifferenceCodePointIndex = null;
  const shared = Math.min(expectedPoints.length, observedPoints.length);
  for (let index = 0; index < shared; index += 1) {
    if (expectedPoints[index] !== observedPoints[index]) {
      firstDifferenceCodePointIndex = index;
      break;
    }
  }
  if (firstDifferenceCodePointIndex == null && expectedPoints.length !== observedPoints.length) firstDifferenceCodePointIndex = shared;
  return {
    ok,
    mode,
    expectedLength: expectedRaw.length,
    observedLength: observedRaw.length,
    expectedCodePoints: expectedPoints.length,
    observedCodePoints: observedPoints.length,
    expectedSha256: sha256(expectedRaw),
    observedSha256: sha256(observedRaw),
    expectedCanonicalSha256: sha256(expectedNormalized),
    observedCanonicalSha256: sha256(observedCanonical),
    rawLengthDelta: observedRaw.length - expectedRaw.length,
    codePointDelta: observedPoints.length - expectedPoints.length,
    firstDifferenceCodePointIndex,
    extraTerminalCodePoint: terminalFormatting ? terminalFormatting.codePointLabel : null,
    extraTerminalCharacterName: terminalFormatting ? terminalFormatting.name : null,
    canonicalizationRule: terminalFormatting ? 'remove-exactly-one-terminal-unicode-whitespace-or-format-code-point' : null
  };
}

async function fillStableField'''
    source = regex_once(
        source,
        r"function normalizeFieldLineEndings\(value\) \{.*?\n\}\n\nfunction compareFieldValue\(spec, expected, observed, tag = ''\) \{.*?\n\}\n\nasync function fillStableField",
        comparison,
        "V2.4 field comparison block",
    )

    source = source.replace(
        "rawLengthDelta: comparison.rawLengthDelta, ...details, ...validity",
        "rawLengthDelta: comparison.rawLengthDelta, codePointDelta: comparison.codePointDelta, firstDifferenceCodePointIndex: comparison.firstDifferenceCodePointIndex, extraTerminalCodePoint: comparison.extraTerminalCodePoint, extraTerminalCharacterName: comparison.extraTerminalCharacterName, canonicalizationRule: comparison.canonicalizationRule, ...details, ...validity",
    )
    source = source.replace(
        "rawLengthDelta: comparison.rawLengthDelta, ...identity",
        "rawLengthDelta: comparison.rawLengthDelta, codePointDelta: comparison.codePointDelta, firstDifferenceCodePointIndex: comparison.firstDifferenceCodePointIndex, extraTerminalCodePoint: comparison.extraTerminalCodePoint, extraTerminalCharacterName: comparison.extraTerminalCharacterName, canonicalizationRule: comparison.canonicalizationRule, ...identity",
    )

    tests = r'''  const fundingSpec = FIELD_SPECS.find((spec) => spec.key === 'funding');
  const terminalNewlineTest = compareFieldValue(fundingSpec, 'alpha\nbeta', 'alpha\nbeta\n', 'textarea');
  const crlfTest = compareFieldValue(fundingSpec, 'alpha\nbeta', 'alpha\r\nbeta', 'textarea');
  const terminalSpaceTest = compareFieldValue(fundingSpec, 'alpha\nbeta', 'alpha\nbeta ', 'textarea');
  const terminalNbspTest = compareFieldValue(fundingSpec, 'alpha\nbeta', 'alpha\nbeta\u00A0', 'textarea');
  const terminalZeroWidthTest = compareFieldValue(fundingSpec, 'alpha\nbeta', 'alpha\nbeta\u200B', 'textarea');
  const twoTerminalCharactersTest = compareFieldValue(fundingSpec, 'alpha\nbeta', 'alpha\nbeta  ', 'textarea');
  const internalDifferenceTest = compareFieldValue(fundingSpec, 'alpha\nbeta', 'alpha \nbeta', 'textarea');
  const nonTextareaTest = compareFieldValue({ key: 'projectTitle' }, 'alpha', 'alpha ', 'input');
  add('single-terminal-linebreak-equivalence', terminalNewlineTest.ok && terminalNewlineTest.mode === 'single-terminal-unicode-formatting' && terminalNewlineTest.rawLengthDelta === 1, terminalNewlineTest);
  add('line-ending-normalization-equivalence', crlfTest.ok && crlfTest.mode === 'line-ending-normalized', crlfTest);
  add('single-terminal-space-equivalence', terminalSpaceTest.ok && terminalSpaceTest.extraTerminalCodePoint === 'U+0020', terminalSpaceTest);
  add('single-terminal-nbsp-equivalence', terminalNbspTest.ok && terminalNbspTest.extraTerminalCodePoint === 'U+00A0', terminalNbspTest);
  add('single-terminal-zero-width-equivalence', terminalZeroWidthTest.ok && terminalZeroWidthTest.extraTerminalCodePoint === 'U+200B', terminalZeroWidthTest);
  add('multiple-terminal-formatting-rejected', !twoTerminalCharactersTest.ok, twoTerminalCharactersTest);
  add('internal-field-difference-rejected', !internalDifferenceTest.ok, internalDifferenceTest);
  add('non-textarea-terminal-formatting-rejected', !nonTextareaTest.ok, nonTextareaTest);'''
    source = regex_once(
        source,
        r"  const fundingSpec = FIELD_SPECS\.find\(\(spec\) => spec\.key === 'funding'\);.*?  add\('substantive-field-difference-rejected'.*?\);",
        tests,
        "V2.4 normalization self-tests",
    )
    return source


def deterministic_tar_gz(source_dir: Path, destination: Path) -> None:
    with destination.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as zipped:
            with tarfile.open(fileobj=zipped, mode="w", format=tarfile.PAX_FORMAT) as archive:
                for item in sorted(source_dir.rglob("*"), key=lambda value: value.relative_to(source_dir).as_posix()):
                    info = archive.gettarinfo(str(item), item.relative_to(source_dir).as_posix())
                    info.uid = info.gid = 0
                    info.uname = info.gname = ""
                    info.mtime = 0
                    if item.is_file():
                        with item.open("rb") as stream:
                            archive.addfile(info, stream)
                    else:
                        archive.addfile(info)


def main() -> None:
    parts = sorted(PART_DIR.glob("package.part.*"))
    require(parts, "No V2.4 package parts were found.")
    old_package = b"".join(part.read_bytes() for part in parts)
    require(sha256(old_package) == OLD_PACKAGE_SHA, "V2.4 package checksum mismatch.")

    with tempfile.TemporaryDirectory(prefix="matadata-v25-") as temp_name:
        temp = Path(temp_name)
        old_archive = temp / "v24.tar.gz"
        old_archive.write_bytes(old_package)
        package_dir = temp / "package"
        package_dir.mkdir()
        with tarfile.open(old_archive, "r:gz") as archive:
            archive.extractall(package_dir, filter="data")

        runner_gz = package_dir / "runner.cjs.gz"
        old_source = gzip.decompress(runner_gz.read_bytes()).decode("utf-8")
        require(sha256(old_source.encode()) == OLD_RUNNER_SHA, "V2.4 runner checksum mismatch.")
        new_source = patch_runner(old_source)
        runner_sha = sha256(new_source.encode())
        new_runner_gz = deterministic_gzip(new_source.encode())
        runner_gzip_sha = sha256(new_runner_gz)
        runner_gz.write_bytes(new_runner_gz)

        runner_path = temp / "runner.cjs"
        runner_path.write_text(new_source, encoding="utf-8")
        run(["node", "--check", str(runner_path)])
        mock = temp / "mock-playwright.cjs"
        mock.write_text("module.exports={chromium:{}};\n", encoding="utf-8")
        selftest_dir = temp / "selftest"
        selftest_dir.mkdir()
        environment = os.environ.copy()
        environment.update({
            "PATHFINDER_SELF_TEST": "1",
            "PATHFINDER_TOKEN": "offline-v25-token-0000000000000000",
            "PATHFINDER_ARTIFACT_DIR": str(selftest_dir),
            "PATHFINDER_SUBMISSION_ID": "matadata-openai-cybersecurity-grant-v1",
            "PATHFINDER_RUNNER_SHA256": runner_sha,
            "PLAYWRIGHT_MODULE": str(mock),
        })
        run(["node", str(runner_path)], env=environment)
        selftest = json.loads((selftest_dir / "selftest.json").read_text(encoding="utf-8"))
        require(selftest.get("passed") is True, "V2.5 runner self-test failed.")
        require(selftest.get("runnerVersion") == NEW_VERSION, "V2.5 runner version mismatch.")
        require(selftest.get("applicationSha256") == APPLICATION_SHA, "Application content changed unexpectedly.")
        checked = {item["name"]: item["ok"] for item in selftest.get("tests", [])}
        for name in (
            "single-terminal-space-equivalence",
            "single-terminal-nbsp-equivalence",
            "single-terminal-zero-width-equivalence",
            "multiple-terminal-formatting-rejected",
            "internal-field-difference-rejected",
            "non-textarea-terminal-formatting-rejected",
        ):
            require(checked.get(name) is True, f"Missing or failed V2.5 self-test: {name}.")

        preflight = package_dir / "scripts" / "preflight.sh"
        preflight_text = preflight.read_text(encoding="utf-8").replace(OLD_VERSION, NEW_VERSION).replace(OLD_RUNNER_SHA, runner_sha)
        old_required = "'single-terminal-linebreak-equivalence', 'line-ending-normalization-equivalence', 'substantive-field-difference-rejected'"
        new_required = "'single-terminal-linebreak-equivalence', 'line-ending-normalization-equivalence', 'single-terminal-space-equivalence', 'single-terminal-nbsp-equivalence', 'single-terminal-zero-width-equivalence', 'multiple-terminal-formatting-rejected', 'internal-field-difference-rejected', 'non-textarea-terminal-formatting-rejected'"
        preflight_text = replace_once(preflight_text, old_required, new_required, "preflight normalization-test set")
        preflight.write_text(preflight_text, encoding="utf-8")
        for script in (package_dir / "scripts").glob("*"):
            if script == preflight:
                continue
            script.write_text(script.read_text(encoding="utf-8").replace(OLD_VERSION, NEW_VERSION).replace(OLD_RUNNER_SHA, runner_sha), encoding="utf-8")

        manifest_path = package_dir / "MANIFEST.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest.update({
            "name": "MATADATA OpenAI Form Pathfinder V2.5",
            "version": NEW_VERSION,
            "status": "STAGED_NOT_EXECUTED",
            "runner_sha256": runner_sha,
            "gzip_sha256": runner_gzip_sha,
            "application_sha256": APPLICATION_SHA,
            "source_bytes": len(new_source.encode()),
            "gzip_bytes": len(new_runner_gz),
            "upgrade_from": OLD_VERSION,
            "single_terminal_unicode_formatting_equivalence": True,
            "terminal_code_point_diagnostics": True,
            "internal_and_multiple_character_differences_rejected": True,
            "live_execution": False,
        })
        manifest.setdefault("features", {}).update({
            "single_terminal_unicode_formatting_equivalence": True,
            "terminal_code_point_diagnostics": True,
            "unicode_whitespace_or_format_only": True,
            "internal_and_multiple_character_differences_rejected": True,
        })
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

        new_archive = temp / "v25.tar.gz"
        deterministic_tar_gz(package_dir, new_archive)
        new_package = new_archive.read_bytes()
        package_sha = sha256(new_package)
        verify_dir = temp / "verify"
        verify_dir.mkdir()
        with tarfile.open(new_archive, "r:gz") as archive:
            archive.extractall(verify_dir, filter="data")
        require(sha256(gzip.decompress((verify_dir / "runner.cjs.gz").read_bytes())) == runner_sha, "Rebuilt V2.5 package runner mismatch.")

        for part in parts:
            part.unlink()
        new_parts = []
        for index, start in enumerate(range(0, len(new_package), 8000)):
            part = PART_DIR / f"package.part.{index:02d}"
            part.write_bytes(new_package[start:start + 8000])
            new_parts.append(part.name)

        receipt = {
            "status": "UPGRADED_STAGED_NOT_EXECUTED",
            "fromVersion": OLD_VERSION,
            "runnerVersion": NEW_VERSION,
            "packageSha256": package_sha,
            "runnerSha256": runner_sha,
            "runnerGzipSha256": runner_gzip_sha,
            "applicationSha256": APPLICATION_SHA,
            "packageBytes": len(new_package),
            "packageParts": new_parts,
            "repair": {
                "sourceStatusPhase": "VALIDATION_ERROR",
                "sourceSubmitClicks": 0,
                "field": "funding",
                "expectedLength": 960,
                "observedLength": 961,
                "v24Result": "The single-terminal-LF and CRLF rules did not classify the extra code unit.",
                "v25Rule": "Accept exactly one terminal Unicode White_Space or Format code point for a textarea only, record its code point/category, and reject every internal or multi-character difference.",
                "substantiveDifferencesStillBlocked": True,
            },
            "selfTest": selftest,
            "liveExecution": False,
        }
        (PART_DIR / "V25_UPGRADE_RECEIPT.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")

        root_manifest_path = PART_DIR / "MANIFEST.json"
        root_manifest = json.loads(root_manifest_path.read_text(encoding="utf-8"))
        root_manifest.update({
            "name": "MATADATA OpenAI Form Pathfinder V2.5",
            "version": NEW_VERSION,
            "status": "STAGED_NOT_EXECUTED",
            "package_sha256": package_sha,
            "package_bytes": len(new_package),
            "runner_sha256": runner_sha,
            "runner_gzip_sha256": runner_gzip_sha,
            "application_sha256": APPLICATION_SHA,
            "source_error_repaired": receipt["repair"],
            "live_execution": False,
        })
        root_manifest.setdefault("features", {}).update({
            "single_terminal_unicode_formatting_equivalence_for_textareas": True,
            "terminal_code_point_diagnostics": True,
            "internal_and_multiple_character_differences_rejected": True,
        })
        root_manifest_path.write_text(json.dumps(root_manifest, indent=2) + "\n", encoding="utf-8")

        workflow = WORKFLOW.read_text(encoding="utf-8")
        workflow = workflow.replace("V2.4", "V2.5").replace("v24", "v25").replace(OLD_VERSION, NEW_VERSION)
        workflow = workflow.replace(OLD_PACKAGE_SHA, package_sha).replace(OLD_RUNNER_SHA, runner_sha)
        workflow = workflow.replace("V24_UPGRADE_RECEIPT.json", "V25_UPGRADE_RECEIPT.json")
        WORKFLOW.write_text(workflow, encoding="utf-8")

        print(json.dumps(receipt, indent=2))

    snapshot = ROOT / ".github" / "workflows" / "matadata-v24-live-snapshot.yml"
    snapshot.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
