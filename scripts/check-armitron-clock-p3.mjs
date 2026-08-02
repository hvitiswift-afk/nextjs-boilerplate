#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  CESIUM_133_HZ,
  CLOCK_TYPES,
  Watchdog,
  appendReceipt,
  grayBitDistance,
  grayCode,
  sampleClock,
  sampleClockMatrix
} from '../tools/armitron/v23/armitron-clock.mjs';

const requiredTypes = [
  'wall', 'monotonic', 'high_resolution', 'chronograph', 'countdown',
  'interval', 'alarm', 'second_timezone', 'atomic', 'ionic', 'sonic',
  'phonic', 'positronic', 'nuclear', 'neutronic', 'synthezoid', 'gray',
  'ray', 'orbital', 'quartz', 'circadian', 'domain', 'facility', 'oracle',
  'nexter'
];

assert.deepEqual(CLOCK_TYPES, requiredTypes);
assert.equal(CESIUM_133_HZ, 9192631770);

for (let tick = 0; tick < 1024; tick += 1) {
  const left = grayCode(tick);
  const right = grayCode(tick + 1);
  assert.equal(grayBitDistance(left, right), 1, `Gray transition ${tick} -> ${tick + 1} must change one bit.`);
}

const fixed = new Date('2026-08-02T21:45:00.000Z');
const matrix = sampleClockMatrix({ now: fixed });
assert.deepEqual(Object.keys(matrix), requiredTypes);
assert.equal(matrix.wall.state, 'OBSERVED_LOCAL_SOURCE');
assert.equal(matrix.gray.state, 'DERIVED_GRAY_REPRESENTATION');
assert.equal(matrix.atomic.state, 'REFERENCE_PROFILE_UNCONNECTED');
assert.equal(matrix.atomic.referenceDefinition.physicalAccuracyClaim, false);
assert.equal(matrix.ionic.state, 'SYMBOLIC_IONIC_COUNTDOWN_UNCONNECTED');
assert.equal(matrix.ionic.ionicCountdown.physicalIonClockClaim, false);
assert.equal(matrix.ray.state, 'DERIVED_RADIAL_REPRESENTATION');

const tracedAtomic = sampleClock('atomic', {
  now: fixed,
  referenceVerified: true,
  traceabilityReference: 'TEST-REFERENCE-ONLY'
});
assert.equal(tracedAtomic.state, 'VERIFIED_REFERENCE_DECLARED');
assert.equal(tracedAtomic.referenceDefinition.physicalAccuracyClaim, true);

assert.throws(() => sampleClock('unknown-clock'), /Unknown Armitron clock type/);

const watchdog = new Watchdog(500);
assert.equal(watchdog.health().healthy, true);

const temporary = await mkdtemp(path.join(os.tmpdir(), 'armitron-p3-'));
try {
  const receiptsPath = path.join(temporary, 'receipts.jsonl');
  const first = await appendReceipt({
    lane: 'email',
    action: 'TEST_START',
    status: 'STARTED',
    details: {
      accountEmail: 'hviti.swift@gmail.com',
      refreshToken: 'must-not-appear'
    }
  }, { receiptsPath, now: fixed });
  const second = await appendReceipt({
    lane: 'browser',
    action: 'TEST_END',
    status: 'SUCCEEDED',
    details: { result: 'ok' }
  }, { receiptsPath, now: fixed });
  assert.equal(second.priorDigest, first.digest);

  const receiptText = await readFile(receiptsPath, 'utf8');
  assert.equal(receiptText.includes('hviti.swift@gmail.com'), false);
  assert.equal(receiptText.includes('must-not-appear'), false);
  assert.match(receiptText, /email-sha256:/);
  assert.match(receiptText, /\[REDACTED\]/);

  const wrappedPath = path.join(temporary, 'wrapped.jsonl');
  const wrapped = spawnSync(process.execPath, [
    'tools/armitron/v23/armitron-wrap.mjs',
    '--lane', 'github',
    '--clock', 'atomic',
    '--',
    process.execPath,
    '-e',
    'process.exit(0)'
  ], {
    cwd: process.cwd(),
    env: { ...process.env, JP_ARMITRON_RECEIPTS: wrappedPath },
    encoding: 'utf8'
  });
  assert.equal(wrapped.status, 0, wrapped.stderr || wrapped.stdout);
  const wrappedRecords = (await readFile(wrappedPath, 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(wrappedRecords.length, 2);
  assert.equal(wrappedRecords[0].lane, 'github');
  assert.equal(wrappedRecords[0].action, 'COMMAND_START');
  assert.equal(wrappedRecords[1].action, 'COMMAND_END');
  assert.equal(wrappedRecords[1].status, 'SUCCEEDED');
  assert.equal(Object.keys(wrappedRecords[1].clockMatrix).length, requiredTypes.length);

  const browserLauncher = await readFile('tools/browser-bridge/p1/armitron-browser.mjs', 'utf8');
  const emailLauncher = await readFile('tools/gmail-bridge/p2/armitron-email.mjs', 'utf8');
  assert.match(browserLauncher, /--lane', 'browser'/);
  assert.match(emailLauncher, /--lane', 'email'/);

  const verification = {
    schemaVersion: 'vsharp.armitron.verification.v23',
    componentId: 'VSHARP-COMP-ARMITRON-001',
    status: 'PASS',
    clockTypes: requiredTypes,
    tests: {
      completeClockRegistry: true,
      grayAdjacency: true,
      cesiumReferenceConstant: true,
      atomicTruthBoundary: true,
      ionicTruthBoundary: true,
      unknownClockFailClosed: true,
      receiptDigestChain: true,
      secretRedaction: true,
      emailHashing: true,
      browserLaneWrapper: true,
      emailLaneWrapper: true,
      githubLaneWrapper: true,
      watchdogHealthy: true
    },
    generatedAt: new Date().toISOString()
  };
  await writeFile('armitron-p3-verification.json', `${JSON.stringify(verification, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(verification, null, 2));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
