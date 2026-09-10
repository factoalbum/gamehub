'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { recentGames } from './lib/game-catalog';

const routeIds = new Map(
  recentGames
    .filter((game) => !game.href.includes('?'))
    .map((game) => [game.href.replace(/\/$/, ''), game.id]),
);

const queryGameIds = new Map(
  recentGames
    .filter((game) => game.href.includes('?'))
    .map((game) => {
      const url = new URL(game.href, 'https://gamehub.local');
      return [url.searchParams.get('game'), game.id] as const;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry[0])),
);

function readRecent(): string[] {
  try {
    const current = JSON.parse(localStorage.getItem('gamehub:recent') || '[]') as unknown;
    return Array.isArray(current)
      ? current.filter((item): item is string => typeof item === 'string').slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

function publishRecent(id: string) {
  const recent = [id, ...readRecent().filter((item) => item !== id)].slice(0, 5);
  try {
    localStorage.setItem('gamehub:recent', JSON.stringify(recent));
    window.dispatchEvent(new CustomEvent('gamehub:recent', { detail: recent }));
  } catch {}
}

export default function RecentTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const normalizedPath = pathname.replace(/\/$/, '');
    const gameParam = searchParams.get('game');
    const id = gameParam
      ? queryGameIds.get(gameParam)
      : query
        ? undefined
        : routeIds.get(normalizedPath);
    if (id) publishRecent(id);
  }, [pathname, query]);

  useEffect(() => {
    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== 'gamehub:recent') return;

      try {
        const recent = event.newValue ? JSON.parse(event.newValue) as unknown : [];
        if (!Array.isArray(recent)) return;
        window.dispatchEvent(
          new CustomEvent('gamehub:recent', {
            detail: recent.filter((item): item is string => typeof item === 'string').slice(0, 5),
          }),
        );
      } catch {}
    };

    window.addEventListener('storage', syncFromAnotherTab);
    return () => window.removeEventListener('storage', syncFromAnotherTab);
  }, []);

  return null;
}
