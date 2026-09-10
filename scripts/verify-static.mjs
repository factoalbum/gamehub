import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const outDir = resolve('out');
const basePath = '/gamehub';

if (!existsSync(outDir) || !statSync(outDir).isDirectory()) {
  console.error('Static output directory "out" is missing.');
  process.exit(1);
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function routeExists(pathname) {
  const path = pathname.split('?')[0].split('#')[0];
  if (!path.startsWith(basePath + '/') && path !== basePath) return true;
  const withoutBase = path === basePath ? '' : path.slice(basePath.length);
  const normalized = withoutBase.replace(/^\//, '').replace(/\/$/, '');
  if (!normalized) return existsSync(join(outDir, 'index.html'));
  return existsSync(join(outDir, normalized, 'index.html')) || existsSync(join(outDir, normalized + '.html'));
}

const htmlFiles = walk(outDir).filter(file => file.endsWith('.html'));
const references = new Set();
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const value = match[1].trim();
    if (!value || value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('data:') || value.startsWith('javascript:') || /^https?:\/\//i.test(value)) continue;
    if (value.startsWith('/')) references.add(value);
  }
}

const broken = [...references].filter(value => !routeExists(value));
const required = [
  '/gamehub/',
  '/gamehub/games/',
  '/gamehub/multiplayer/',
  '/gamehub/sports/',
  '/gamehub/faq/',
  '/gamehub/privacy/',
  '/gamehub/terms/',
  '/gamehub/sitemap.xml',
  '/gamehub/robots.txt',
  '/gamehub/manifest.webmanifest',
];
const missing = required.filter(value => {
  if (value.endsWith('.xml') || value.endsWith('.txt') || value.endsWith('.webmanifest')) return !existsSync(join(outDir, value.slice(basePath.length).replace(/^\//, '')));
  return !routeExists(value);
});

const robotsPath = join(outDir, 'robots.txt');
const manifestPath = join(outDir, 'manifest.webmanifest');
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : '';
const manifest = existsSync(manifestPath) ? readFileSync(manifestPath, 'utf8') : '';
const metadataErrors = [];
if (robots && !robots.includes('Sitemap: https://factoalbum.github.io/gamehub/sitemap.xml')) {
  metadataErrors.push('robots.txt is missing the canonical sitemap declaration.');
}
if (manifest) {
  try {
    const parsed = JSON.parse(manifest);
    if (parsed.start_url !== '/gamehub/') metadataErrors.push('manifest.webmanifest must use /gamehub/ as start_url.');
    if (parsed.name !== 'GameHub — Free Browser Games') metadataErrors.push('manifest.webmanifest has an unexpected app name.');
  } catch {
    metadataErrors.push('manifest.webmanifest is not valid JSON.');
  }
}

if (broken.length || missing.length || metadataErrors.length) {
  if (broken.length) console.error(`Broken internal references (${broken.length}):\n${broken.join('\n')}`);
  if (missing.length) console.error(`Missing required outputs (${missing.length}):\n${missing.join('\n')}`);
  if (metadataErrors.length) console.error(`Static metadata errors (${metadataErrors.length}):\n${metadataErrors.join('\n')}`);
  process.exit(1);
}

console.log(`Static integrity OK: ${htmlFiles.length} HTML files, ${references.size} internal references checked.`);
