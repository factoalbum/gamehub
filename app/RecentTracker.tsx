'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const routes: Record<string, string> = {
  '/gamehub/minesweeper/': 'minesweeper',
  '/gamehub/tap-target/': 'tap-target',
  '/gamehub/brick-breaker/': 'brick-breaker',
  '/gamehub/neon-dodge/': 'neon-dodge',
  '/gamehub/hoop-duel/': 'hoop-duel',
  '/gamehub/mini-football/': 'mini-football',
  '/gamehub/volley-duel/': 'volley-duel',
  '/gamehub/tennis-duel/': 'tennis-duel',
};

export default function RecentTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const id = routes[pathname];
    if (!id) return;
    try {
      const current = JSON.parse(localStorage.getItem('gamehub:recent') || '[]') as string[];
      const recent = [id, ...current.filter(item => item !== id)].slice(0, 5);
      localStorage.setItem('gamehub:recent', JSON.stringify(recent));
      window.dispatchEvent(new CustomEvent('gamehub:recent', { detail: recent }));
    } catch {}
  }, [pathname]);
  return null;
}
