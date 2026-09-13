import { existsSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'out');

const routes = [
  // Platform and discovery pages.
  '/',
  '/games/',
  '/multiplayer/',
  '/sports/',
  '/faq/',
  '/privacy/',
  '/terms/',

  // Local multiplayer and sports.
  '/tic-tac-toe/',
  '/connect-four/',
  '/pong-duel/',
  '/hoop-duel/',
  '/football-random/',
  '/mini-football/',
  '/volley-duel/',
  '/tennis-duel/',
  '/air-hockey/',
  '/racing-duel/',

  // Single-player game pages.
  '/minesweeper/',
  '/tap-target/',
  '/brick-breaker/',
  '/brick-quest/',
  '/neon-dodge/',
  '/bubble-pop/',
  '/whack-attack/',
  '/falling-blocks/',
  '/sky-hopper/',
  '/asteroid-blaster/',
  '/alien-blaster/',
];

const assets = [
  '/manifest.webmanifest',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.svg',
];

const missing = [...routes.map((route) => join(outDir, route, 'index.html')),
  ...assets.map((asset) => join(outDir, asset)),
].filter((path) => !existsSync(path));

if (missing.length) {
  console.error('Static export verification failed. Missing:');
  for (const path of missing) console.error(`- ${path}`);
  process.exit(1);
}

console.log(`Static export verified: ${routes.length} routes + ${assets.length} metadata assets.`);
