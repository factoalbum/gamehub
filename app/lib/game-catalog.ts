export type GameCatalogItem = {
  id: string;
  label: string;
  emoji: string;
  meta: string;
  href: string;
  category: string;
  /** Optional multiplayer card label; kept in the catalog to avoid page-level duplication. */
  tag?: string;
};

/**
 * Single source of truth for discoverable games. Keep this data-only so it is
 * safe to import from both server and client components and remains static-
 * hosting friendly.
 */
export const multiplayerGames: GameCatalogItem[] = [
  { id: 'hoop-duel', label: 'Hoop Duel', emoji: '🏀', meta: 'Basketball · 1P / 2P', href: '/gamehub/hoop-duel/', category: '2 Player', tag: 'ONE BUTTON' },
  { id: 'football-random', label: 'Football Random', emoji: '⚽', meta: 'Football · 2 players', href: '/gamehub/football-random/', category: '2 Player', tag: 'ONE BUTTON' },
  { id: 'mini-football', label: 'Mini Football', emoji: '⚽', meta: 'Football · 2 players', href: '/gamehub/mini-football/', category: '2 Player', tag: 'LOCAL' },
  { id: 'volley-duel', label: 'Volley Duel', emoji: '🏐', meta: 'Volleyball · 2 players', href: '/gamehub/volley-duel/', category: '2 Player', tag: 'LOCAL' },
  { id: 'tennis-duel', label: 'Tennis Duel', emoji: '🎾', meta: 'Tennis · 2 players', href: '/gamehub/tennis-duel/', category: '2 Player', tag: 'LOCAL' },
  { id: 'air-hockey', label: 'Air Hockey', emoji: '🏒', meta: 'Hockey · 2 players', href: '/gamehub/air-hockey/', category: '2 Player', tag: 'LOCAL' },
  { id: 'racing-duel', label: 'Racing Duel', emoji: '🏎️', meta: 'Racing · 2 players', href: '/gamehub/racing-duel/', category: '2 Player', tag: 'LOCAL' },
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
