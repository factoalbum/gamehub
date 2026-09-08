'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import DailyChallenge from './DailyChallenge';
import RecentlyPlayed from './RecentlyPlayed';
import './home-promos.css';

const drops = [
  { emoji: '🏀', label: 'Hoop Duel', meta: '2 Player · Basketball battle', href: '/gamehub/hoop-duel/' },
  { emoji: '💣', label: 'Minesweeper', meta: 'Puzzle · Clear the minefield', href: '/gamehub/minesweeper/' },
  { emoji: '🎯', label: 'Tap Target', meta: 'Arcade · 30-second score chase', href: '/gamehub/tap-target/' },
  { emoji: '🧱', label: 'Brick Breaker', meta: 'Arcade · Endless levels', href: '/gamehub/brick-breaker/' },
  { emoji: '🌌', label: 'Neon Dodge', meta: 'Arcade · Survive 45 seconds', href: '/gamehub/neon-dodge/' },
];

export default function HomePromos() {
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (pathname !== '/gamehub/' && pathname !== '/') { setHost(null); return; }
    const hero = document.querySelector('.hero');
    if (!hero?.parentElement) return;
    const node = document.createElement('div');
    node.className = 'home-promos-host';
    hero.parentElement.insertBefore(node, hero);
    setHost(node);
    return () => node.remove();
  }, [pathname]);

  if (!host) return null;
  return createPortal(
    <section className="home-promos" aria-label="GameHub highlights">
      <DailyChallenge />
      <RecentlyPlayed />
      <div className="fresh-drops">
        <div className="fresh-heading"><div><span className="eyebrow">FRESH DROPS</span><h2>More games. <em>More reasons to stay.</em></h2></div><a href="#games">VIEW ALL →</a></div>
        <div className="fresh-grid">
          {drops.map(drop => <a className="fresh-card" href={drop.href} key={drop.href}>
            <span className="fresh-icon">{drop.emoji}</span><span className="fresh-copy"><strong>{drop.label}</strong><small>{drop.meta}</small></span><b>→</b>
          </a>)}
        </div>
      </div>
    </section>, host,
  );
}
