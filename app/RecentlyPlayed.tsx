'use client';

import { useEffect, useState } from 'react';
import './recently-played.css';

type RecentGame = { id: string; title: string; emoji: string; href: string; category: string };

const catalog: RecentGame[] = [
  { id: 'reflex', title: 'Reflex Rush', emoji: '⚡', href: '/gamehub/', category: 'Arcade' },
  { id: 'memory-grid', title: 'Memory Grid', emoji: '🧠', href: '/gamehub/', category: 'Brain' },
  { id: 'snake', title: 'Snake', emoji: '🐍', href: '/gamehub/', category: 'Classic' },
  { id: 'number-merge', title: 'Number Merge', emoji: '🔢', href: '/gamehub/', category: 'Puzzle' },
  { id: 'color-match', title: 'Color Match', emoji: '🎨', href: '/gamehub/', category: 'Puzzle' },
  { id: 'stack-tower', title: 'Stack Tower', emoji: '🏗️', href: '/gamehub/', category: 'Arcade' },
  { id: 'minesweeper', title: 'Minesweeper', emoji: '💣', href: '/gamehub/minesweeper/', category: 'Puzzle' },
  { id: 'tap-target', title: 'Tap Target', emoji: '🎯', href: '/gamehub/tap-target/', category: 'Arcade' },
];

export default function RecentlyPlayed() {
  const [recent, setRecent] = useState<RecentGame[]>([]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('gamehub:recent') || '[]') as string[];
      const items = ids.map(id => catalog.find(game => game.id === id)).filter(Boolean) as RecentGame[];
      setRecent(items);
    } catch { setRecent([]); }
  }, []);

  if (!recent.length) return null;
  return <section className="recently-played" aria-label="Recently played games">
    <div className="recent-heading"><div><span className="section-kicker">JUMP BACK IN</span><h2>Recently played</h2></div><span>{recent.length} game{recent.length === 1 ? '' : 's'}</span></div>
    <div className="recent-row">
      {recent.slice(0, 5).map(game => <a className="recent-card" href={game.href} key={game.id}>
        <span className="recent-icon">{game.emoji}</span><span><strong>{game.title}</strong><small>{game.category}</small></span><b>→</b>
      </a>)}
    </div>
  </section>;
}
