'use client';

import { usePathname } from 'next/navigation';

export default function SiteInfoLinks() {
  const pathname = usePathname();
  if (pathname === '/gamehub/faq/' || pathname === '/gamehub/privacy/' || pathname === '/gamehub/terms/') return null;

  return (
    <nav className="site-info-links" aria-label="Site information">
      <a href="/gamehub/faq/">FAQ</a>
      <a href="/gamehub/privacy/">Privacy</a>
      <a href="/gamehub/terms/">Terms</a>
      <a href="/gamehub/games/">All games</a>
    </nav>
  );
}
