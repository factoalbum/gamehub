'use client';

import { usePathname } from 'next/navigation';
import './tap-target-promo.css';

export default function TapTargetPromo() {
  const pathname = usePathname();
  if (pathname !== '/gamehub/' && pathname !== '/') return null;
  return <a className="tap-promo" href="/gamehub/tap-target/" aria-label="Play Tap Target">
    <span className="tap-promo-icon">🎯</span>
    <span className="tap-promo-copy"><b>NEW ARCADE GAME</b><strong>Tap Target</strong><small>30 seconds. Hit as many targets as you can.</small></span>
    <span className="tap-promo-cta">PLAY NOW →</span>
  </a>;
}
