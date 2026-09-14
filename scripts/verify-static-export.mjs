import { existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const outDir = join(process.cwd(), 'out');
const appDir = join(process.cwd(), 'app');

function collectRoutes(dir, prefix = '') {
  const routes = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'api') continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...collectRoutes(fullPath, `${prefix}/${entry.name}`));
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      routes.push(prefix || '/');
    }
  }
  return routes;
}

const routes = [...new Set(collectRoutes(appDir))].sort();
const assets = ['/manifest.webmanifest', '/robots.txt', '/sitemap.xml', '/favicon.svg'];

const missing = [
  ...routes.map((route) => join(outDir, route, 'index.html')),
  ...assets.map((asset) => join(outDir, asset)),
].filter((path) => !existsSync(path));

if (missing.length) {
  console.error('Static export verification failed. Missing:');
  for (const path of missing) console.error(`- ${path}`);
  process.exit(1);
}

console.log(`Static export verified: ${routes.length} app routes + ${assets.length} metadata assets.`);
