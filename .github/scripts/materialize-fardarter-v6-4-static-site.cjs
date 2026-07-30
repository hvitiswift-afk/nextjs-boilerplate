const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const sourceRoot = path.resolve(process.argv[2] || '.');
const packageRoot = path.resolve(process.argv[3] || 'static-package');
const primaryOrigin = process.env.NETLIFY_PRIMARY_ORIGIN || 'https://lichburn-v0-2-8.netlify.app';
const placeholderOrigins = [
  'https://head--site-name.netlify.app',
  'http://head--site-name.netlify.app',
];
const blobsRoot = path.join(sourceRoot, '.netlify', 'deploy', 'v1', 'blobs', 'deploy');
const distRoot = path.join(packageRoot, 'dist');

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const mkdirFor = (filePath) => fs.mkdirSync(path.dirname(filePath), { recursive: true });
const write = (filePath, contents) => {
  mkdirFor(filePath);
  fs.writeFileSync(filePath, contents);
};
const decodeRoute = (name) => {
  const padded = name.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - name.length % 4) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
};
const replaceOrigin = (text) => {
  let output = text;
  for (const origin of placeholderOrigins) output = output.split(origin).join(primaryOrigin);
  return output;
};
const copyDirectoryContents = (source, destination) => {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectoryContents(from, to);
    else if (entry.isSymbolicLink()) fs.symlinkSync(fs.readlinkSync(from), to);
    else fs.copyFileSync(from, to);
  }
};

if (!fs.existsSync(blobsRoot)) throw new Error(`Missing generated Netlify route blobs: ${blobsRoot}`);
fs.rmSync(packageRoot, { recursive: true, force: true });
fs.mkdirSync(distRoot, { recursive: true });

copyDirectoryContents(path.join(sourceRoot, 'public'), distRoot);
copyDirectoryContents(path.join(sourceRoot, '.next', 'static'), path.join(distRoot, '_next', 'static'));

const redirects = [];
const headers = [];
const records = [];

for (const name of fs.readdirSync(blobsRoot).sort()) {
  const route = decodeRoute(name);
  const blobPath = path.join(blobsRoot, name);
  const envelope = JSON.parse(fs.readFileSync(blobPath, 'utf8'));
  const value = envelope.value || {};

  if (value.kind === 'APP_PAGE') {
    const html = replaceOrigin(String(value.html || ''));
    let outputPath;
    if (route === '/index' || route === '/') outputPath = path.join(distRoot, 'index.html');
    else if (!route.startsWith('/')) outputPath = path.join(distRoot, route);
    else outputPath = path.join(distRoot, route.slice(1), 'index.html');
    write(outputPath, html);
    records.push({ route: route === '/index' ? '/' : route, kind: value.kind, output: path.relative(packageRoot, outputPath), bytes: Buffer.byteLength(html), sha256: sha256(Buffer.from(html)) });
    continue;
  }

  if (value.kind !== 'APP_ROUTE') continue;
  const contentType = String(value.headers?.['content-type'] || 'application/octet-stream').split(';')[0].trim();
  let body = Buffer.from(String(value.body || ''), 'base64');
  if (/^(text\/|application\/(json|xml))/.test(contentType)) body = Buffer.from(replaceOrigin(body.toString('utf8')));

  let publicTarget = route;
  if (route.startsWith('/api/')) {
    publicTarget = `${route}.json`;
    redirects.push(`${route} ${publicTarget} 200!`);
  } else if (!path.posix.extname(route)) {
    const extension = contentType === 'image/png' ? '.png' : contentType === 'image/jpeg' ? '.jpg' : contentType === 'application/json' ? '.json' : '.bin';
    publicTarget = `${route}${extension}`;
    redirects.push(`${route} ${publicTarget} 200!`);
  }

  const outputPath = path.join(distRoot, publicTarget.replace(/^\//, ''));
  write(outputPath, body);
  headers.push(`${publicTarget}\n  Content-Type: ${contentType}`);
  if (value.headers?.['cache-control']) headers.push(`  Cache-Control: ${value.headers['cache-control']}`);
  records.push({ route, kind: value.kind, output: path.relative(packageRoot, outputPath), contentType, status: value.status || 200, bytes: body.length, sha256: sha256(body) });
}

write(path.join(distRoot, '_redirects'), redirects.join('\n') + '\n');
write(path.join(distRoot, '_headers'), headers.join('\n') + '\n');

const netlifyToml = `[build]\n  command = "npm run build"\n  publish = "dist"\n\n[build.environment]\n  NODE_VERSION = "20"\n  NPM_FLAGS = "--omit=dev"\n`;
write(path.join(packageRoot, 'netlify.toml'), netlifyToml);
write(path.join(packageRoot, 'package.json'), JSON.stringify({
  name: 'fardarter-drive-v6-4-static-materialization',
  private: true,
  version: '6.4.0',
  scripts: { build: 'node verify-package.cjs' },
}, null, 2) + '\n');

const requiredFiles = [
  'dist/index.html',
  'dist/github-control-tower-audit/index.html',
  'dist/github-control-tower-audit/operations/index.html',
  'dist/github-control-tower-audit/reconciliation/index.html',
  'dist/github-control-tower-audit/canonicalization-preview/index.html',
  'dist/api/revenue/pilot.json',
  'dist/api/revenue/capacity.json',
  'dist/api/revenue/operations.json',
  'dist/api/revenue/reconciliation.json',
  'dist/api/revenue/canonicalization-preview.json',
  'dist/sitemap.xml',
  'dist/robots.txt',
  'dist/_redirects',
  'dist/_headers',
];
for (const relative of requiredFiles) {
  const absolute = path.join(packageRoot, relative);
  if (!fs.existsSync(absolute) || fs.statSync(absolute).size === 0) throw new Error(`Missing materialized file: ${relative}`);
}

const verifier = `const fs=require('node:fs');\nconst path=require('node:path');\nconst root=__dirname;\nconst must=(p)=>{const f=path.join(root,p);if(!fs.existsSync(f)||fs.statSync(f).size===0)throw new Error('Missing '+p);return fs.readFileSync(f,'utf8')};\nconst preview=JSON.parse(must('dist/api/revenue/canonicalization-preview.json'));\nif(preview.schemaVersion!=='1.0.0'||preview.controllerVersion!=='6.4.0'||preview.controllingIssue!==165)throw new Error('Preview identity mismatch');\nif(preview.previewLedger?.digest!=='9294df7c63b535b292f163bc1bbc183883d05f7bd99329ed845db9d62e2e7a8c')throw new Error('Preview ledger digest mismatch');\nif(preview.preparedReviewBundle?.digest!=='3198341aebdf82e95d8cd0de680a16553cf9c3b3c2e4fd4824d197de79aa6ef2')throw new Error('Review bundle digest mismatch');\nfor(const p of ${JSON.stringify(requiredFiles)})must(p);\nconsole.log('Static v6.4 package verification: PASS');\n`;
write(path.join(packageRoot, 'verify-package.cjs'), verifier);

const receipt = {
  schemaVersion: '1.0.0',
  packageId: 'FARDARTER-DRIVE-V6-4-STATIC-MATERIALIZATION',
  sourceCommit: 'e482004bfff1bb90aba2d67b8da62a524f18cdb4',
  primaryOrigin,
  sourceBoundary: {
    generatedFromNetlifyV1RouteBlobs: true,
    applicationSourceModified: false,
    runtimeFunctionsRequiredForRequestedRoutes: false,
  },
  lockedBlobs: {
    previewLedger: '99a4bb840df5630efdf55d7e5fd4d6bdd0b62996',
    preparedReviewBundle: 'e55188c34b34dddbe22652442b1ed6d0d932f25b',
    privateDriveContinuity: 'bd24a05b0372ef77c97d520609baef73d0b778c6',
    previewApi: '95cf068221fd49fc6ddba755f8d47f72dc3da55e',
    previewController: '6d2a32710a00bdb2a8fa49275447699fe8e2c7b3',
  },
  records,
};
write(path.join(packageRoot, 'materialization-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(`Materialized ${records.length} exact route records into ${packageRoot}`);
