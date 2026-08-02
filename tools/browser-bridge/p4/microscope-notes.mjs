import { createHash } from 'node:crypto';
import {
  appendBackwardLookingNote,
  readBackwardLookingNotes
} from '../p1/secure-notes.mjs';

export const ZOOM_LEVELS = Object.freeze(['macro', 'meso', 'micro', 'nano']);

const SECRET_KEY_PATTERN = /(password|passkey|secret|token|cookie|authorization|mfa|otp|captcha|recovery|private.?key|card|cvv|cvc|access.?code)/i;
const SECRET_VALUE_PATTERN = /(bearer\s+[a-z0-9._~+\/-]+=*|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i;

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function assertZoom(zoom) {
  if (!ZOOM_LEVELS.includes(zoom)) throw new Error(`Unsupported microscope zoom: ${zoom}`);
  return zoom;
}

function assertNoCredentialMaterial(value, path = 'note') {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoCredentialMaterial(item, `${path}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (SECRET_KEY_PATTERN.test(key) && child !== null && child !== undefined && String(child).length > 0) {
        throw new Error(`Credential-like material is prohibited in microscope notes: ${path}.${key}`);
      }
      assertNoCredentialMaterial(child, `${path}.${key}`);
    }
    return;
  }
  if (typeof value === 'string' && SECRET_VALUE_PATTERN.test(value)) {
    throw new Error(`Credential-like material is prohibited in microscope notes: ${path}`);
  }
}

function normalizeScopePath(scopePath) {
  if (!Array.isArray(scopePath) || scopePath.length === 0) {
    throw new Error('Microscope notes require a non-empty scopePath array.');
  }
  const normalized = scopePath.map((part) => String(part).trim()).filter(Boolean);
  if (normalized.length === 0) throw new Error('Microscope scopePath cannot be empty.');
  return normalized;
}

function makePayload(input) {
  const zoom = assertZoom(input.zoom);
  const scopePath = normalizeScopePath(input.scopePath);
  const summary = String(input.summary ?? '').trim();
  if (!summary) throw new Error('Microscope notes require a summary.');

  const payload = {
    schemaVersion: 'armitron.microscope-note.v24',
    zoom,
    scopePath,
    scopeKey: sha256(scopePath.join(' > ')),
    summary,
    observations: Array.isArray(input.observations) ? input.observations.map(String) : [],
    decisions: Array.isArray(input.decisions) ? input.decisions.map(String) : [],
    actors: Array.isArray(input.actors) ? input.actors.map(String) : [],
    dependencies: Array.isArray(input.dependencies) ? input.dependencies.map(String) : [],
    risks: Array.isArray(input.risks) ? input.risks.map(String) : [],
    unresolved: Array.isArray(input.unresolved) ? input.unresolved.map(String) : [],
    browser: input.browser ?? null,
    pressure: input.pressure ?? null,
    authentication: input.authentication ?? null,
    authority: input.authority ?? 'JP_HUMAN_FINAL_AUTHORITY',
    evidenceClass: input.evidenceClass ?? 'USER_REPORTED_OR_LOCAL_OBSERVATION',
    correctionOf: input.correctionOf ?? null,
    supersedes: input.supersedes ?? null,
    tags: Array.isArray(input.tags) ? input.tags.map(String) : []
  };
  assertNoCredentialMaterial(payload);
  return payload;
}

export async function appendMicroscopeNote({
  path,
  missionId,
  zoom,
  scopePath,
  summary,
  observations,
  decisions,
  actors,
  dependencies,
  risks,
  unresolved,
  browser,
  pressure,
  authentication,
  authority,
  evidenceClass,
  correctionOf,
  supersedes,
  tags,
  evidence = [],
  truthState = 'RETROSPECTIVE_UNVERIFIED',
  env = process.env,
  now = new Date()
}) {
  const payload = makePayload({
    zoom,
    scopePath,
    summary,
    observations,
    decisions,
    actors,
    dependencies,
    risks,
    unresolved,
    browser,
    pressure,
    authentication,
    authority,
    evidenceClass,
    correctionOf,
    supersedes,
    tags
  });
  const result = await appendBackwardLookingNote({
    path,
    missionId,
    text: JSON.stringify(payload),
    evidence,
    truthState,
    env,
    now
  });
  return {
    ...result,
    zoom: payload.zoom,
    scopeKey: payload.scopeKey,
    scopeDepth: payload.scopePath.length,
    summaryHash: sha256(payload.summary)
  };
}

export async function readMicroscopeNotes({ path, env = process.env }) {
  const notes = await readBackwardLookingNotes({ path, env });
  return notes.map((note) => {
    let payload;
    try {
      payload = JSON.parse(note.text);
    } catch {
      payload = {
        schemaVersion: 'browser-bridge.backward-note.v1-legacy',
        zoom: 'macro',
        scopePath: [note.missionId ?? 'unknown-mission'],
        summary: note.text,
        legacy: true
      };
    }
    return {
      createdAt: note.createdAt,
      missionId: note.missionId,
      truthState: note.truthState,
      evidence: note.evidence,
      previousDigest: note.previousDigest,
      ...payload
    };
  });
}

function isPrefix(prefix, full) {
  return prefix.length <= full.length && prefix.every((part, index) => part === full[index]);
}

export function projectMicroscope(notes, options = {}) {
  const zoom = options.zoom ? assertZoom(options.zoom) : null;
  const scopePrefix = options.scopePrefix ? normalizeScopePath(options.scopePrefix) : null;
  const missionId = options.missionId ? String(options.missionId) : null;
  const includeCorrections = options.includeCorrections !== false;

  const filtered = notes.filter((note) => {
    if (zoom && note.zoom !== zoom) return false;
    if (missionId && note.missionId !== missionId) return false;
    if (scopePrefix && !isPrefix(scopePrefix, note.scopePath ?? [])) return false;
    if (!includeCorrections && note.correctionOf) return false;
    return true;
  });

  return filtered.sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)));
}

export function microscopeTimeline(notes, options = {}) {
  const projected = projectMicroscope(notes, options);
  return projected.map((note, index) => ({
    sequence: index + 1,
    createdAt: note.createdAt,
    zoom: note.zoom,
    scopePath: note.scopePath,
    summary: note.summary,
    truthState: note.truthState,
    evidenceClass: note.evidenceClass,
    correctionOf: note.correctionOf,
    supersedes: note.supersedes,
    unresolved: note.unresolved ?? []
  }));
}

export function microscopeSummary(notes, options = {}) {
  const projected = projectMicroscope(notes, options);
  const byZoom = Object.fromEntries(ZOOM_LEVELS.map((zoom) => [zoom, projected.filter((note) => note.zoom === zoom).length]));
  const truthStates = {};
  for (const note of projected) truthStates[note.truthState] = (truthStates[note.truthState] ?? 0) + 1;
  return {
    count: projected.length,
    byZoom,
    truthStates,
    earliest: projected.at(0)?.createdAt ?? null,
    latest: projected.at(-1)?.createdAt ?? null,
    unresolved: projected.flatMap((note) => note.unresolved ?? []),
    lastSummary: projected.at(-1)?.summary ?? null
  };
}
