import { normalizeCatalogValue } from './catalog-utils';
import { validateGameCatalog } from './catalog-validation';

export type GameCatalogItem = {
  id: string;
  label: string;
  emoji: string;
  meta: string;
  href: string;
  category: string;
  /** Optional multiplayer card label; kept in the catalog to avoid page-level duplication. */
  tag?: string;
  /** Optional sport identity for the local sports discovery shelf. */
  sport?: string;
  /** Optional landing-page copy for discoverable game cards. */
  description?: string;
};

/**
 * Single source of truth for discoverable games. Keep this data-only so it is
 * safe to import from both server and client components and remains static-
hosting friendly.
 */
export const multiplayerGames: GameCatalogItem[] = [
  { id: 'tic-tac-toe', label: 'Tic Tac Toe', emoji: '⭕', meta: 'Classic · 2 players', href: '/gamehub/tic-tac-toe/', category: '2 Player', tag: 'CLASSIC' },
  { id: 'connect-four', label: 'Connect Four', emoji: '🔴', meta: 'Classic · 2 players', href: '/gamehub/connect-four/', category: '2 Player', tag: 'CLASSIC' },
  { id: 'pong-duel', label: 'Pong Duel', emoji: '🏓', meta: 'Arcade · 2 players', href: '/gamehub/pong-duel/', category: '2 Player', tag: 'CLASSIC' },
  { id: 'hoop-duel', label: 'Hoop Duel', emoji: '🏀', meta: 'Basketball · 1P / 2P', href: '/gamehub/hoop-duel/', category: '2 Player', tag: 'ONE BUTTON', sport: 'BASKETBALL', description: 'Fast 1v1 basketball. Outscore your friend before the clock hits zero.' },
  { id: 'football-random', label: 'Football Random', emoji: '⚽', meta: 'Football · 2 players', href: '/gamehub/football-random/', category: '2 Player', tag: 'ONE BUTTON', sport: 'FOOTBALL', description: 'Quick football action with simple controls and instant rematches.' },
  { id: 'mini-football', label: 'Mini Football', emoji: '⚽', meta: 'Football · 2 players', href: '/gamehub/mini-football/', category: '2 Player', tag: 'LOCAL', sport: 'FOOTBALL', description: 'Simple 1v1 football with quick movement, shots and instant rematches.' },
  { id: 'volley-duel', label: 'Volley Duel', emoji: '🏐', meta: 'Volleyball · 2 players', href: '/gamehub/volley-duel/', category: '2 Player', tag: 'LOCAL', sport: 'VOLLEYBALL', description: 'Keep the ball alive, find the opening and be first to take the set.' },
  { id: 'tennis-duel', label: 'Tennis Duel', emoji: '🎾', meta: 'Tennis · 2 players', href: '/gamehub/tennis-duel/', category: '2 Player', tag: 'LOCAL', sport: 'TENNIS', description: 'A pick-up-and-play tennis rally built for two people on one device.' },
  { id: 'air-hockey', label: 'Air Hockey', emoji: '🏒', meta: 'Hockey · 2 players', href: '/gamehub/air-hockey/', category: '2 Player', tag: 'LOCAL', sport: 'HOCKEY', description: 'Slide, defend and fire the puck. First to 7 wins the table.' },
  { id: 'racing-duel', label: 'Racing Duel', emoji: '🏎️', meta: 'Racing · 2 players', href: '/gamehub/racing-duel/', category: '2 Player', tag: 'LOCAL', sport: 'RACING', description: 'Race three laps, manage your boost and beat your friend to the finish.' },
];

export const freshDropGames: GameCatalogItem[] = [
  { id: 'minesweeper', label: 'Minesweeper', emoji: '💣', meta: 'Puzzle · Clear the minefield', href: '/gamehub/minesweeper/', category: 'Puzzle' },
  { id: 'tap-target', label: 'Tap Target', emoji: '🎯', meta: 'Arcade · 30-second score chase', href: '/gamehub/tap-target/', category: 'Arcade' },
  { id: 'brick-breaker', label: 'Brick Breaker', emoji: '🧱', meta: 'Arcade · Endless levels', href: '/gamehub/brick-breaker/', category: 'Arcade' },
  { id: 'brick-quest', label: 'Brick Quest', emoji: '🎮', meta: 'Arcade · 10-level power-up run', href: '/gamehub/brick-quest/', category: 'Arcade' },
  { id: 'neon-dodge', label: 'Neon Dodge', emoji: '🌌', meta: 'Arcade · Survive 45 seconds', href: '/gamehub/neon-dodge/', category: 'Arcade' },
  { id: 'bubble-pop', label: 'Bubble Pop', emoji: '🫧', meta: 'Arcade · 45-second combo chase', href: '/gamehub/bubble-pop/', category: 'Arcade' },
  { id: 'whack-attack', label: 'Whack Attack', emoji: '🔨', meta: 'Arcade · 30-second combo chase', href: '/gamehub/whack-attack/', category: 'Arcade' },
  { id: 'falling-blocks', label: 'Falling Blocks', emoji: '🧱', meta: 'Classic · Clear lines and level up', href: '/gamehub/falling-blocks/', category: 'Classic' },
  { id: 'sky-hopper', label: 'Sky Hopper', emoji: '☁️', meta: 'Arcade · One-button score chase', href: '/gamehub/sky-hopper/', category: 'Arcade' },
  { id: 'asteroid-blaster', label: 'Asteroid Blaster', emoji: '☄️', meta: 'Arcade · Shoot and survive', href: '/gamehub/asteroid-blaster/', category: 'Arcade' },
  { id: 'alien-blaster', label: 'Alien Blaster', emoji: '👾', meta: 'Arcade · Clear enemy waves', href: '/gamehub/alien-blaster/', category: 'Arcade' },
];

/** Full set used by the local recent-games tracker. */
export const recentGames: GameCatalogItem[] = [
  { id: 'reflex', label: 'Reflex Rush', emoji: '⚡', meta: 'Arcade · Reflex challenge', href: '/gamehub/?game=reflex', category: 'Arcade' },
  { id: 'memory-grid', label: 'Memory Grid', emoji: '🧠', meta: 'Brain · Match the pattern', href: '/gamehub/?game=memory-grid', category: 'Brain' },
  { id: 'snake', label: 'Snake', emoji: '🐍', meta: 'Classic · Grow and survive', href: '/gamehub/?game=snake', category: 'Classic' },
  { id: 'number-merge', label: 'Number Merge', emoji: '🔢', meta: 'Puzzle · Merge and grow', href: '/gamehub/?game=number-merge', category: 'Puzzle' },
  { id: 'color-match', label: 'Color Match', emoji: '🎨', meta: 'Puzzle · Match the color', href: '/gamehub/?game=color-match', category: 'Puzzle' },
  { id: 'stack-tower', label: 'Stack Tower', emoji: '🏗️', meta: 'Arcade · Build the highest tower', href: '/gamehub/?game=stack-tower', category: 'Arcade' },
  ...freshDropGames,
  ...multiplayerGames,
];

// Fail fast during builds/development if a catalog edit creates broken discovery data.
validateGameCatalog({ recentGames });

export function getGameById(id: string) {
  const normalized = normalizeCatalogValue(id);
  return recentGames.find((game) => normalizeCatalogValue(game.id) === normalized);
}

export function getGamesByCategory(category: string) {
  const normalized = normalizeCatalogValue(category);
  if (normalized === 'all') return [...recentGames];
  return recentGames.filter((game) => normalizeCatalogValue(game.category) === normalized);
}

export function getGamesByTag(tag: string) {
  const normalized = normalizeCatalogValue(tag);
  return recentGames.filter((game) => normalizeCatalogValue(game.tag ?? '') === normalized);
}

/** Return sports for a focused sports shelf while preserving catalog order. */
export function getGamesBySport(sport: string) {
  const normalized = normalizeCatalogValue(sport);
  if (normalized === 'all') return getSportsGames();
  return multiplayerGames.filter((game) => normalizeCatalogValue(game.sport ?? '') === normalized);
}

export function getSportsGames() {
  return multiplayerGames.filter((game) => Boolean(game.sport));
}

/** Return the unique sports represented in the catalog, preserving first-seen order. */
export function getSports() {
  return [...new Set(getSportsGames().map((game) => game.sport as string))];
}

export function getCategories() {
  return [...new Set(recentGames.map((game) => game.category))];
}

/** Return a stable, URL-safe anchor for sport navigation. */
export function getSportAnchorId(sport: string) {
  return `sport-${normalizeCatalogValue(sport).replace(/[^a-z0-9]+/g, '-')}`;
}

export function getRelatedGames(currentId: string, limit = 4) {
  const current = getGameById(currentId);
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  if (!current || safeLimit === 0) return [];

  const currentIdNormalized = normalizeCatalogValue(current.id);
  const currentTag = normalizeCatalogValue(current.tag ?? '');
  const currentCategory = normalizeCatalogValue(current.category);
  const currentSport = normalizeCatalogValue(current.sport ?? '');
  const pool = recentGames
    .map((game, index) => ({ game, index }))
    .filter(({ game }) => normalizeCatalogValue(game.id) !== currentIdNormalized);

  const score = (game: GameCatalogItem) => {
    let value = 0;
    if (currentSport && game.sport && normalizeCatalogValue(game.sport) === currentSport) value += 4;
    if (currentTag && normalizeCatalogValue(game.tag ?? '') === currentTag) value += 3;
    if (normalizeCatalogValue(game.category) === currentCategory) value += 2;
    return value;
  };

  return pool
    .sort((a, b) => score(b.game) - score(a.game) || a.index - b.index)
    .slice(0, safeLimit)
    .map(({ game }) => game);
}
