'use client';

import { usePathname } from 'next/navigation';
import './brick-breaker-promo.css';

export default function BrickBreakerPromo() {
  const pathname = usePathname();
  if (pathname !== '/gamehub/' && pathname !== '/') return null;
  return <section className="brick-promo" aria-label="New Brick Breaker game">
    <div><span className="brick-promo-kicker">NEW ARCADE DROP</span><h2>Break the wall. Chase the high score.</h2><p>Brick Breaker gets faster every level. Three lives. Endless levels. Zero downloads.</p></div>
    <a className="brick-promo-play" href="/gamehub/brick-breaker/">PLAY BRICK BREAKER <span>→</span></a>
  </section>;
}
