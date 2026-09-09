'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { recentGames } from './lib/game-catalog';

const routeIds = new Map(
  recentGames
    .filter((game) => !game.href.includes('?'))
    .map((game) => [game.href.replace(/\/$/, ''), game.id]),
);

const queryIds = new Map(
  recentGames
    .filter((game) => game.href.includes('?'))
    .map((game) => {
      const url = new URL(game.href, 'https://gamehub.local');
      return [
        `${url.pathname.replace(/\/$/, '')}?${url.searchParams.toString()}`,
        game.id,
      ];
    }),
);

export default function RecentTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const normalizedPath = pathname.replace(/\/$/, '');
    const query = searchParams.toString();
    const id = query
      ? queryIds.get(`${normalizedPath}?${query}`)
      : routeIds.get(normalizedPath);
    if (!id) return;

    try {
      const current = JSON.parse(localStorage.getItem('gamehub:recent') || '[]') as unknown;
      const previous = Array.isArray(current)
        ? current.filter((item): item is string => typeof item === 'string')
        : [];
      const recent = [id, ...previous.filter((item) => item !== id)].slice(0, 5);
      localStorage.setItem('gamehub:recent', JSON.stringify(recent));
      window.dispatchEvent(new CustomEvent('gamehub:recent', { detail: recent }));
    } catch {}
  }, [pathname, searchParams]);

  return null;
}
