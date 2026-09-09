'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recentGames } from './lib/game-catalog';

const routes = Object.fromEntries(recentGames.map((game) => [game.href.split('?')[0], game.id]));

export default function RecentTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const id = routes[pathname];
    if (!id) return;
    try {
      const current = JSON.parse(localStorage.getItem('gamehub:recent') || '[]') as unknown;
      const previous = Array.isArray(current) ? current.filter((item): item is string => typeof item === 'string') : [];
      const recent = [id, ...previous.filter((item) => item !== id)].slice(0, 5);
      localStorage.setItem('gamehub:recent', JSON.stringify(recent));
      window.dispatchEvent(new CustomEvent('gamehub:recent', { detail: recent }));
    } catch {}
  }, [pathname]);
  return null;
}
