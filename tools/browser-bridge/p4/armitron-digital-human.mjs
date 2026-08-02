#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { appendReceipt } from '../../armitron/v23/armitron-clock.mjs';
import {
  authenticationCapability,
  transitionAuthentication
} from '../../armitron/v24/authentication-state.mjs';
import { evaluatePressureIntent } from '../p1/pressure-policy.mjs';
import {
  appendMicroscopeNote,
  microscopeSummary,
  microscopeTimeline,
  projectMicroscope,
  readMicroscopeNotes
} from './microscope-notes.mjs';

const DEFAULT_MISSION = 'examples/browser-bridge/github-enterprise-signup.mission.json';
const DEFAULT_PROFILE = 'examples/armitron/armitron-digital-human.profile.json';
const DEFAULT_NOTES = '.browser-bridge/p4/microscope-notes.enc.jsonl';
const DEFAULT_SESSIONS = '.browser-bridge/p4/sessions';

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const options = {};
  const positionals = [];
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = rest[index + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      index += 1;
    } else options[key] = true;
  }
  return { command, options, positionals };
}

function required(options, key) {
  const value = options[key];
  if (!value || value === true) throw new Error(`--${key} is required.`);
  return String(value);
}

async function loadJson(filePath) {
  return JSON.parse(await readFile(path.resolve(filePath), 'utf8'));
}

function sessionPath(sessionId, sessionsDir = DEFAULT_SESSIONS) {
  return path.resolve(sessionsDir, `${sessionId}.json`);
}

async function loadSession(sessionId, sessionsDir = DEFAULT_SESSIONS) {
  return loadJson(sessionPath(sessionId, sessionsDir));
}

async function saveSession(session, sessionsDir = DEFAULT_SESSIONS) {
  const filePath = sessionPath(session.sessionId, sessionsDir);
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  await writeFile(filePath, `${JSON.stringify(session, null, 2)}\n`, { mode: 0o600 });
  return filePath;
}

function safeSessionProjection(session) {
  return {
    sessionId: session.sessionId,
    missionId: session.missionId,
    state: session.state,
    authentication: session.authentication,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
    lastAction: session.lastAction,
    ordinaryActionCount: session.ordinaryActionCount,
    protectedHandoffCount: session.protectedHandoffCount,
    providerReadbackState: session.providerReadbackState
  };
}

async function noteForSession(session, input, options = {}) {
  const notesPath = options.notesPath ?? DEFAULT_NOTES;
  return appendMicroscopeNote({
    path: notesPath,
    missionId: session.missionId,
    env: process.env,
    ...input
  });
}

async function startSession(options) {
  const missionPath = String(options.mission ?? DEFAULT_MISSION);
  const profilePath = String(options.profile ?? DEFAULT_PROFILE);
  const mission = await loadJson(missionPath);
  const profile = await loadJson(profilePath);
  const sessionId = String(options.session ?? randomUUID());
  const now = new Date().toISOString();
  const session = {
    schemaVersion: 'armitron.browser-session.v24',
    sessionId,
    missionId: mission.missionId,
    missionTitle: mission.title,
    missionPath,
    missionHash: sha256(JSON.stringify(mission)),
    profilePath,
    profileHash: sha256(JSON.stringify(profile)),
    rootIdentity: profile.rootIdentity,
    principal: profile.principal?.name ?? 'JP',
    state: 'READY',
    authentication: 'UNAUTHENTICATED',
    providerReadbackState: 'NOT_STARTED',
    startedAt: now,
    updatedAt: now,
    lastAction: 'SESSION_STARTED',
    ordinaryActionCount: 0,
    protectedHandoffCount: 0,
    noBlindRetry: true,
    humanFinalAuthority: true
  };
  const filePath = await saveSession(session, options.sessions);
  await noteForSession(session, {
    zoom: 'macro',
    scopePath: ['MATADATA', mission.missionId],
    summary: `Armitron Digital Human browser session started for ${mission.title}.`,
    observations: [
      `Mission truth state: ${mission.truthState ?? mission.currentState ?? 'UNKNOWN'}`,
      'JP remains human final authority.',
      'Protected browser and authentication steps remain human-only.'
    ],
    actors: ['JP', 'Armitron', 'MATADATA Digital Human'],
    unresolved: ['Provider-authenticated result not yet established.'],
    evidenceClass: 'LOCAL_VERIFIED_CONFIGURATION',
    tags: ['session-start', 'browser', 'armitron-v24']
  }, { notesPath: options.notes });
  await appendReceipt({
    lane: 'browser',
    action: 'DIGITAL_HUMAN_SESSION_START',
    status: 'READY',
    eventId: sessionId,
    details: safeSessionProjection(session)
  });
  console.log(JSON.stringify({ session: safeSessionProjection(session), stateFile: filePath }, null, 2));
}

async function pressureEvent(options) {
  const session = await loadSession(required(options, 'session'), options.sessions);
  const pressure = required(options, 'pressure');
  const targetCategory = String(options['target-category'] ?? 'ordinary');
  const stableForMs = Number(options['stable-ms'] ?? 0);
  const released = options.released === true || options.released === 'true';
  const result = evaluatePressureIntent({ pressure, targetCategory, stableForMs, released });

  if (result.disposition === 'pause-and-handoff') session.protectedHandoffCount += 1;
  else if (result.allowed && result.disposition !== 'observe-only') session.ordinaryActionCount += 1;
  session.lastAction = `PRESSURE_${result.disposition.toUpperCase().replaceAll('-', '_')}`;
  session.updatedAt = new Date().toISOString();
  await saveSession(session, options.sessions);

  const eventId = randomUUID();
  await noteForSession(session, {
    zoom: 'micro',
    scopePath: ['MATADATA', session.missionId, 'browser', 'pressure', eventId],
    summary: `Pressure ${pressure} evaluated for ${targetCategory}: ${result.disposition}.`,
    pressure: {
      stage: result.stage.intent,
      normalized: result.stage.normalized,
      targetCategory,
      stableForMs,
      released,
      allowed: result.allowed,
      disposition: result.disposition
    },
    decisions: [result.reason],
    unresolved: result.allowed ? [] : [result.reason],
    evidenceClass: 'LOCAL_POLICY_EVALUATION',
    tags: ['pressure', result.disposition]
  }, { notesPath: options.notes });
  await appendReceipt({
    lane: 'browser',
    action: 'MATADATA_PRESSURE_EVALUATION',
    status: result.allowed ? 'ALLOWED' : 'BLOCKED_OR_HANDOFF',
    eventId,
    details: {
      sessionId: session.sessionId,
      missionId: session.missionId,
      pressureStage: result.stage.intent,
      normalized: result.stage.normalized,
      targetCategory,
      disposition: result.disposition,
      stableForMs,
      released
    }
  });
  console.log(JSON.stringify(result, null, 2));
}

async function authEvent(options) {
  const session = await loadSession(required(options, 'session'), options.sessions);
  const next = required(options, 'to');
  const provider = options.provider ? String(options.provider) : null;
  const principal = options.principal ? String(options.principal) : null;
  const providerReference = options['provider-reference'] ? String(options['provider-reference']) : null;
  const transition = transitionAuthentication(session.authentication, next, {
    humanPresent: options['human-present'] === true || options['human-present'] === 'true',
    humanCompletedProtectedStep: options['human-completed'] === true || options['human-completed'] === 'true',
    provider,
    principal,
    providerSessionReference: providerReference,
    providerSessionReferenceHash: providerReference ? sha256(providerReference) : null,
    reason: options.reason ? String(options.reason) : null
  });
  session.authentication = next;
  session.providerReadbackState = next === 'AUTHENTICATED_PROVIDER_CONFIRMED'
    ? 'CONFIRMED'
    : next === 'AUTHENTICATED_PROVIDER_READBACK_PENDING'
      ? 'PENDING'
      : session.providerReadbackState;
  session.lastAction = `AUTH_${next}`;
  session.updatedAt = new Date().toISOString();
  await saveSession(session, options.sessions);

  const eventId = randomUUID();
  await noteForSession(session, {
    zoom: 'meso',
    scopePath: ['MATADATA', session.missionId, 'authentication', eventId],
    summary: `Authentication state changed from ${transition.from} to ${transition.to}.`,
    authentication: {
      from: transition.from,
      to: transition.to,
      provider,
      principal,
      providerReferenceHash: providerReference ? sha256(providerReference) : null,
      capability: authenticationCapability(next)
    },
    decisions: [
      transition.humanOnlyStep ? 'Protected authentication is being performed by JP.' : 'No protected authentication automation was performed.'
    ],
    unresolved: next === 'AUTHENTICATED_PROVIDER_READBACK_PENDING' ? ['Provider readback still required.'] : [],
    evidenceClass: next === 'AUTHENTICATED_PROVIDER_CONFIRMED' ? 'PROVIDER_READBACK' : 'LOCAL_STATE_TRANSITION',
    tags: ['authentication', next.toLowerCase()]
  }, { notesPath: options.notes });
  await appendReceipt({
    lane: 'browser',
    action: 'AUTHENTICATION_STATE_TRANSITION',
    status: next,
    eventId,
    details: {
      sessionId: session.sessionId,
      missionId: session.missionId,
      from: transition.from,
      to: transition.to,
      provider,
      principalHash: principal ? sha256(principal) : null,
      providerReferenceHash: providerReference ? sha256(providerReference) : null
    }
  });
  console.log(JSON.stringify({ transition, capability: authenticationCapability(next) }, null, 2));
}

async function manualNote(options) {
  const session = await loadSession(required(options, 'session'), options.sessions);
  const zoom = required(options, 'zoom');
  const summary = required(options, 'summary');
  const scopePath = String(options.scope ?? `MATADATA/${session.missionId}`).split('/').filter(Boolean);
  const result = await noteForSession(session, {
    zoom,
    scopePath,
    summary,
    observations: options.observation ? [String(options.observation)] : [],
    decisions: options.decision ? [String(options.decision)] : [],
    unresolved: options.unresolved ? [String(options.unresolved)] : [],
    evidenceClass: options['evidence-class'] ? String(options['evidence-class']) : 'USER_REPORTED_OR_LOCAL_OBSERVATION',
    correctionOf: options['correction-of'] ? String(options['correction-of']) : null,
    supersedes: options.supersedes ? String(options.supersedes) : null,
    tags: options.tags ? String(options.tags).split(',').map((value) => value.trim()).filter(Boolean) : []
  }, { notesPath: options.notes });
  await appendReceipt({
    lane: 'browser',
    action: 'MICROSCOPE_NOTE_APPENDED',
    status: 'ENCRYPTED_LOCAL_NOTE',
    eventId: result.recordDigest,
    details: {
      sessionId: session.sessionId,
      missionId: session.missionId,
      zoom: result.zoom,
      scopeKey: result.scopeKey,
      summaryHash: result.summaryHash,
      noteContentReceipted: false
    }
  });
  console.log(JSON.stringify(result, null, 2));
}

async function recall(options) {
  const notes = await readMicroscopeNotes({ path: String(options.notes ?? DEFAULT_NOTES), env: process.env });
  const projection = {
    missionId: options.mission ? String(options.mission) : null,
    zoom: options.zoom ? String(options.zoom) : null,
    scopePrefix: options.scope ? String(options.scope).split('/').filter(Boolean) : null,
    includeCorrections: options['exclude-corrections'] !== true
  };
  const output = String(options.format ?? 'timeline') === 'summary'
    ? microscopeSummary(notes, projection)
    : String(options.format ?? 'timeline') === 'full'
      ? projectMicroscope(notes, projection)
      : microscopeTimeline(notes, projection);
  console.log(JSON.stringify(output, null, 2));
}

async function runBrowser(options, positionals) {
  const session = await loadSession(required(options, 'session'), options.sessions);
  const browserArgs = positionals.length > 0 ? positionals : ['help'];
  const eventId = randomUUID();
  session.state = 'RUNNING';
  session.lastAction = 'BROWSER_RUN_STARTED';
  session.updatedAt = new Date().toISOString();
  await saveSession(session, options.sessions);
  await noteForSession(session, {
    zoom: 'meso',
    scopePath: ['MATADATA', session.missionId, 'browser-run', eventId],
    summary: `Armitron browser lane started command ${browserArgs[0]}.`,
    observations: [`Argument count: ${browserArgs.length - 1}`],
    evidenceClass: 'LOCAL_EXECUTION_START',
    tags: ['browser-run', 'start']
  }, { notesPath: options.notes });

  const child = spawn(process.execPath, [
    'tools/browser-bridge/p1/armitron-browser.mjs',
    ...browserArgs
  ], { stdio: 'inherit', shell: false });
  const outcome = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });

  session.state = outcome.code === 0 ? 'READY' : 'FAILED';
  session.lastAction = 'BROWSER_RUN_ENDED';
  session.updatedAt = new Date().toISOString();
  await saveSession(session, options.sessions);
  await noteForSession(session, {
    zoom: 'meso',
    scopePath: ['MATADATA', session.missionId, 'browser-run', eventId, 'outcome'],
    summary: `Armitron browser lane ended with ${outcome.code === 0 ? 'success' : 'failure'}.`,
    observations: [`Exit code: ${outcome.code}`, `Signal: ${outcome.signal ?? 'none'}`],
    unresolved: outcome.code === 0 ? [] : ['Review browser lane failure before retrying.'],
    evidenceClass: 'LOCAL_EXECUTION_RESULT',
    tags: ['browser-run', 'end']
  }, { notesPath: options.notes });
  process.exitCode = outcome.code ?? 1;
}

function help() {
  console.log(`Armitron MATADATA Digital Human Browser P4

Commands:
  start [--mission PATH] [--profile PATH] [--session ID]
  pressure --session ID --pressure 1/4 --target-category ordinary --stable-ms 300 --released
  auth --session ID --to STATE [--human-present] [--human-completed] [--provider NAME] [--principal ID] [--provider-reference REF]
  note --session ID --zoom macro|meso|micro|nano --summary TEXT [--scope A/B/C]
  recall [--mission ID] [--zoom LEVEL] [--scope A/B] [--format timeline|summary|full]
  run --session ID [browser companion command and arguments]

Runtime notes require JP_BROWSER_BRIDGE_NOTES_KEY. Protected authentication and consequential actions remain human-only.`);
}

async function main() {
  const { command, options, positionals } = parseArgs(process.argv.slice(2));
  if (command === 'start') return startSession(options);
  if (command === 'pressure') return pressureEvent(options);
  if (command === 'auth') return authEvent(options);
  if (command === 'note') return manualNote(options);
  if (command === 'recall') return recall(options);
  if (command === 'run') return runBrowser(options, positionals);
  return help();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
