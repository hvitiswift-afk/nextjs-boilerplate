#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

export const COMPONENT_ID = 'VSHARP-COMP-ARMITRON-001';
export const PROTOCOL = 'JP-XYZ-VSHARP-ARMITRON-COMPONENT/1';
export const CESIUM_133_HZ = 9192631770;
export const DEFAULT_TIMEZONE = 'America/Detroit';
export const DEFAULT_RECEIPTS = '.armitron/receipts/armitron-v23.jsonl';

export const CLOCK_TYPES = Object.freeze([
  'wall', 'monotonic', 'high_resolution', 'chronograph', 'countdown',
  'interval', 'alarm', 'second_timezone', 'atomic', 'ionic', 'sonic',
  'phonic', 'positronic', 'nuclear', 'neutronic', 'synthezoid', 'gray',
  'ray', 'orbital', 'quartz', 'circadian', 'domain', 'facility', 'oracle',
  'nexter'
]);

export function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function grayCode(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Gray input must be a non-negative safe integer.');
  return value ^ (value >> 1);
}

export function grayBitDistance(left, right) {
  let value = left ^ right;
  let count = 0;
  while (value > 0) {
    count += value & 1;
    value >>>= 1;
  }
  return count;
}

function sourceState(type, verified) {
  if (['wall', 'monotonic', 'high_resolution'].includes(type)) return 'OBSERVED_LOCAL_SOURCE';
  if (type === 'atomic') return verified ? 'VERIFIED_REFERENCE_DECLARED' : 'REFERENCE_PROFILE_UNCONNECTED';
  if (type === 'ionic') return verified ? 'VERIFIED_LAB_REFERENCE_DECLARED' : 'SYMBOLIC_IONIC_COUNTDOWN_UNCONNECTED';
  if (type === 'gray') return 'DERIVED_GRAY_REPRESENTATION';
  if (type === 'ray') return 'DERIVED_RADIAL_REPRESENTATION';
  return 'DERIVED_VSHARP_CONTROL_PROFILE';
}

export function sampleClock(type, options = {}) {
  if (!CLOCK_TYPES.includes(type)) throw new Error(`Unknown Armitron clock type: ${type}`);
  const now = options.now instanceof Date ? options.now : new Date();
  const wallMs = now.getTime();
  const wallNs = BigInt(wallMs) * 1000000n;
  const tick = Number((wallNs / 1000000n) % 65536n);
  const verified = options.referenceVerified === true && Boolean(options.traceabilityReference);
  const sample = {
    type,
    state: sourceState(type, verified),
    wallIsoUtc: now.toISOString(),
    wallUnixMs: wallMs,
    wallUnixNs: wallNs.toString(),
    monotonicNs: process.hrtime.bigint().toString(),
    highResolutionMs: performance.now(),
    timezone: options.timezone || DEFAULT_TIMEZONE,
    uncertaintyNs: Number.isFinite(options.uncertaintyNs) ? Number(options.uncertaintyNs) : 5000000,
    connectionState: verified ? 'VERIFIED_REFERENCE_DECLARED' : 'LOCAL_SYSTEM_ONLY',
    traceabilityReference: options.traceabilityReference || null,
    leapIndicator: options.leapIndicator || 'UNKNOWN_NOT_QUERIED'
  };
  if (type === 'gray') {
    sample.tick = tick;
    sample.grayDecimal = grayCode(tick);
    sample.grayBinary = grayCode(tick).toString(2).padStart(16, '0');
  }
  if (type === 'atomic') {
    sample.referenceDefinition = {
      atom: 'cesium-133',
      transitionFrequencyHz: CESIUM_133_HZ,
      physicalAccuracyClaim: verified
    };
  }
  if (type === 'ionic') {
    sample.ionicCountdown = {
      signedChargeState: Number.isInteger(options.chargeState) ? options.chargeState : 0,
      targetIsoUtc: options.targetIsoUtc || null,
      physicalIonClockClaim: verified
    };
  }
  if (type === 'ray') {
    sample.radial = {
      phaseDegrees: ((wallMs % 60000) / 60000) * 360,
      uncertaintyArcDegrees: Math.min(360, (sample.uncertaintyNs / 60000000000) * 360)
    };
  }
  sample.digest = sha256(canonical(sample));
  return sample;
}

export function sampleClockMatrix(options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  return Object.fromEntries(CLOCK_TYPES.map((type) => [type, sampleClock(type, { ...options, now })]));
}

function sanitize(value, key = '') {
  if (value === null || value === undefined) return value;
  if (/password|passkey|secret|token|cookie|authorization|mfa|otp|captcha|recovery|private.?key|card|cvv|cvc/i.test(key)) return '[REDACTED]';
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, sanitize(child, childKey)]));
  if (typeof value === 'string') return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => `email-sha256:${sha256(email.toLowerCase())}`);
  return value;
}

async function lastReceipt(receiptsPath) {
  try {
    const text = await readFile(receiptsPath, 'utf8');
    const lines = text.trim().split('\n').filter(Boolean);
    return lines.length ? JSON.parse(lines.at(-1)) : null;
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function appendReceipt(input, options = {}) {
  const receiptsPath = path.resolve(options.receiptsPath || process.env.JP_ARMITRON_RECEIPTS || DEFAULT_RECEIPTS);
  const prior = await lastReceipt(receiptsPath);
  const record = {
    schemaVersion: 'vsharp.armitron.receipt.v23',
    componentId: COMPONENT_ID,
    protocol: PROTOCOL,
    lane: input.lane,
    action: input.action,
    status: input.status,
    eventId: input.eventId || null,
    details: sanitize(input.details || {}),
    clockMatrix: sampleClockMatrix(options),
    priorDigest: prior ? prior.digest : null
  };
  record.digest = sha256(canonical(record));
  await mkdir(path.dirname(receiptsPath), { recursive: true, mode: 0o700 });
  await appendFile(receiptsPath, `${JSON.stringify(record)}\n`, { mode: 0o600 });
  return record;
}

export class Watchdog {
  constructor(maximumDriftMs = 500) {
    this.maximumDriftMs = maximumDriftMs;
    this.wallStartMs = Date.now();
    this.monoStartNs = process.hrtime.bigint();
  }
  health() {
    const wallElapsed = Date.now() - this.wallStartMs;
    const monoElapsed = Number(process.hrtime.bigint() - this.monoStartNs) / 1000000;
    const driftMs = Math.abs(wallElapsed - monoElapsed);
    return { healthy: driftMs <= this.maximumDriftMs, driftMs, maximumDriftMs: this.maximumDriftMs, failClosed: driftMs > this.maximumDriftMs };
  }
}

const [command = 'help', type = 'wall'] = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}`) {
  if (command === 'types') console.log(JSON.stringify({ componentId: COMPONENT_ID, clockTypes: CLOCK_TYPES }, null, 2));
  else if (command === 'sample') console.log(JSON.stringify(sampleClock(type), null, 2));
  else if (command === 'matrix') console.log(JSON.stringify(sampleClockMatrix(), null, 2));
  else console.log('Usage: armitron-clock.mjs types | sample <type> | matrix');
}
