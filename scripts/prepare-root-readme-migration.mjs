import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const FRONT_DOOR_PATH = 'README.front-door.md';
const ROOT_README_PATH = 'README.md';
const PREVIEW_PATH = 'README.migrated.preview.md';
const TECHNICAL_SECTION = '\n## Technical documentation\n';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

const [frontDoorRaw, rootReadmeRaw] = await Promise.all([
  readFile(FRONT_DOOR_PATH, 'utf8'),
  readFile(ROOT_README_PATH, 'utf8'),
]);

const technicalIndex = frontDoorRaw.indexOf(TECHNICAL_SECTION);
if (technicalIndex === -1) {
  throw new Error(`Expected ${TECHNICAL_SECTION.trim()} section in ${FRONT_DOOR_PATH}`);
}

const frontDoor = frontDoorRaw.slice(0, technicalIndex).trimEnd();
const migrated = `${frontDoor}\n\n---\n\n${rootReadmeRaw}`;

if (!migrated.endsWith(rootReadmeRaw)) {
  throw new Error('Migration invariant failed: original README body was not preserved exactly.');
}

const receipt = {
  source_front_door: FRONT_DOOR_PATH,
  source_root_readme: ROOT_README_PATH,
  preview_output: PREVIEW_PATH,
  original_readme_sha256: sha256(rootReadmeRaw),
  migrated_readme_sha256: sha256(migrated),
  original_bytes: Buffer.byteLength(rootReadmeRaw),
  migrated_bytes: Buffer.byteLength(migrated),
  original_body_preserved_exactly: true,
};

if (process.argv.includes('--write-root')) {
  await writeFile(ROOT_README_PATH, migrated, 'utf8');
  console.log(JSON.stringify({ ...receipt, output: ROOT_README_PATH }, null, 2));
} else {
  await writeFile(PREVIEW_PATH, migrated, 'utf8');
  console.log(JSON.stringify({ ...receipt, output: PREVIEW_PATH }, null, 2));
}
