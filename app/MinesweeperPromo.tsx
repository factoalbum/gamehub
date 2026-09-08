'use client';

import { usePathname } from 'next/navigation';
import './minesweeper-promo.css';

export default function MinesweeperPromo() {
  const pathname = usePathname();
  if (pathname !== '/gamehub/' && pathname !== '/') return null;
  return <a className="mine-promo" href="/gamehub/minesweeper/" aria-label="Play Minesweeper">
    <span className="mine-promo-icon">💣</span>
    <span><b>NEW GAME</b><strong>Minesweeper</strong><small>Clear the minefield. Beat your best.</small></span>
    <span className="mine-promo-cta">PLAY →</span>
  </a>;
}
