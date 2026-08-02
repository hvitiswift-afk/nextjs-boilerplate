import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const WORLDS = Object.freeze(['V#', 'T#', 'C#']);
export const WORLD_CODES = Object.freeze({ 'V#': 'V', 'T#': 'T', 'C#': 'C' });
export const DEFAULT_REGISTRY_PATH = 'examples/armitron/v25/universe-registry.json';

export function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();
}

export function universeId({ world, number, name, version = 1 }) {
  if (!WORLDS.includes(world)) throw new Error(`Unsupported world: ${world}`);
  if (!Number.isSafeInteger(number) || number < 1 || number > 999999) {
    throw new Error('Universe number must be an integer from 1 through 999999.');
  }
  if (!String(name).trim()) throw new Error('Universe name is required.');
  if (!Number.isSafeInteger(version) || version < 1) throw new Error('Universe version must be a positive integer.');
  return `UNI-${WORLD_CODES[world]}-${String(number).padStart(6, '0')}-${slugify(name)}-V${version}`;
}

export function assertUniverse(record) {
  const expected = universeId(record);
  if (record.universeId !== expected) {
    throw new Error(`Universe ID mismatch: expected ${expected}, received ${record.universeId}`);
  }
  if (!Array.isArray(record.aliases)) throw new Error(`Universe ${record.universeId} requires aliases.`);
  return record;
}

export function validateRegistry(registry) {
  if (registry?.schemaVersion !== 'armitron.multiverse.registry.v25') {
    throw new Error('Unsupported multiverse registry schema.');
  }
  const ids = new Set();
  const aliases = new Set();
  const worldNumbers = new Set();
  for (const universe of registry.universes ?? []) {
    assertUniverse(universe);
    if (ids.has(universe.universeId)) throw new Error(`Duplicate universe ID: ${universe.universeId}`);
    ids.add(universe.universeId);
    const numberKey = `${universe.world}:${universe.number}`;
    if (worldNumbers.has(numberKey)) throw new Error(`Duplicate universe number in ${universe.world}: ${universe.number}`);
    worldNumbers.add(numberKey);
    for (const alias of universe.aliases) {
      const normalized = String(alias).trim().toUpperCase();
      if (!normalized) throw new Error(`Empty alias in ${universe.universeId}`);
      if (aliases.has(normalized)) throw new Error(`Duplicate universe alias: ${alias}`);
      aliases.add(normalized);
    }
  }

  const linkIds = new Set();
  for (const link of registry.links ?? []) {
    if (linkIds.has(link.linkId)) throw new Error(`Duplicate link ID: ${link.linkId}`);
    linkIds.add(link.linkId);
    if (!ids.has(link.sourceUniverseId) || !ids.has(link.targetUniverseId)) {
      throw new Error(`Link ${link.linkId} references an unknown universe.`);
    }
    if (link.sourceUniverseId === link.targetUniverseId) throw new Error(`Link ${link.linkId} must cross universe boundaries.`);
    if (link.gate !== 'V-10_TRANSVERSE_TRANSFER_TRANSFORM') {
      throw new Error(`Link ${link.linkId} lacks the V-10 transfer/transform gate.`);
    }
    if (link.returnRouteRequired !== true) throw new Error(`Link ${link.linkId} must require a return route.`);
  }

  return {
    universeCount: ids.size,
    linkCount: linkIds.size,
    aliases: aliases.size,
    registryDigest: sha256(JSON.stringify(registry))
  };
}

export async function loadRegistry(filePath = DEFAULT_REGISTRY_PATH) {
  const registry = JSON.parse(await readFile(filePath, 'utf8'));
  validateRegistry(registry);
  return registry;
}

export function resolveUniverse(registry, idOrAlias) {
  const requested = String(idOrAlias).trim();
  const upper = requested.toUpperCase();
  const match = registry.universes.find((universe) =>
    universe.universeId === requested || universe.aliases.some((alias) => String(alias).toUpperCase() === upper)
  );
  if (!match) throw new Error(`Unknown universe: ${idOrAlias}`);
  return match;
}

export function resolveLink(registry, sourceUniverseId, targetUniverseId, activityType) {
  const link = registry.links.find((candidate) => {
    const direct = candidate.sourceUniverseId === sourceUniverseId && candidate.targetUniverseId === targetUniverseId;
    const reverse = candidate.direction === 'BIDIRECTIONAL' && candidate.sourceUniverseId === targetUniverseId && candidate.targetUniverseId === sourceUniverseId;
    return (direct || reverse) && candidate.status === 'ACTIVE_INTERNAL';
  });
  if (!link) throw new Error(`No active link from ${sourceUniverseId} to ${targetUniverseId}.`);
  if (!link.scope.includes(activityType)) {
    throw new Error(`Link ${link.linkId} does not permit activity type ${activityType}.`);
  }
  return link;
}

export function registerUniverse(registry, input) {
  const next = structuredClone(registry);
  const record = {
    universeId: universeId(input),
    world: input.world,
    number: input.number,
    name: String(input.name).trim(),
    aliases: [...new Set((input.aliases ?? []).map(String))],
    status: input.status ?? 'ACTIVE_INTERNAL',
    governance: input.governance ?? 'JP_FINAL_AUTHORITY',
    privacy: input.privacy ?? 'PRIVATE',
    version: input.version ?? 1
  };
  next.universes.push(record);
  validateRegistry(next);
  return next;
}
