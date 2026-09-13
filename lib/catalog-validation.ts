import type { GameCatalogItem } from './game-catalog';

export function validateGameCatalog(groups: Record<string, readonly GameCatalogItem[]>) {
  const seenIds = new Set<string>();
  const seenHrefs = new Set<string>();
  const errors: string[] = [];

  for (const [groupName, games] of Object.entries(groups)) {
    for (const game of games) {
      if (seenIds.has(game.id)) errors.push(`duplicate game id: ${game.id}`);
      seenIds.add(game.id);

      if (seenHrefs.has(game.href)) errors.push(`duplicate game href: ${game.href}`);
      seenHrefs.add(game.href);

      if (!game.label.trim()) errors.push(`empty game label: ${game.id}`);
      if (!game.href.startsWith('/')) errors.push(`game href must be root-relative: ${game.id}`);
      if (!game.category.trim()) errors.push(`empty game category: ${game.id}`);
      if (groupName === 'multiplayerGames' && game.sport && !game.description?.trim()) {
        errors.push(`sport game missing description: ${game.id}`);
      }
    }
  }

  if (errors.length) {
    throw new Error(`Game catalog validation failed:\n- ${errors.join('\n- ')}`);
  }
}
