'use client';

import { usePathname } from 'next/navigation';
import './neon-dodge-promo.css';

export default function NeonDodgePromo() {
  const pathname = usePathname();
  if (pathname !== '/gamehub/' && pathname !== '/') return null;
  return <section className="neon-promo" aria-label="New Neon Dodge game">
    <div><span className="neon-promo-kicker">NEW SURVIVAL ARCADE</span><h2>45 seconds. 5 lanes. Don't blink.</h2><p>Neon Dodge gets faster as you survive. How many blocks can you dodge?</p></div>
    <a className="neon-promo-play" href="/gamehub/neon-dodge/">PLAY NEON DODGE <span>→</span></a>
  </section>;
}
