import './globals.css';
import './polish.css';
import './share-score.css';
import './legal.css';
import './accessibility.css';
import type { Metadata, Viewport } from 'next';
import HomePromos from './HomePromos';
import GameUrlBridge from './GameUrlBridge';
import ShareScore from './ShareScore';
import RecentTracker from './RecentTracker';

const siteUrl = 'https://factoalbum.github.io/gamehub';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'GameHub — Free Browser Games', template: '%s | GameHub' },
  description: 'Play free browser games instantly. Arcade, puzzle, brain, classic and local 2-player games on phone, tablet and desktop — no download required.',
  applicationName: 'GameHub',
  keywords: ['free browser games', 'online games', 'arcade games', '2 player games', 'multiplayer games', 'puzzle games', 'games to play', 'mobile games'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  icons: { icon: '/gamehub/favicon.svg', shortcut: '/gamehub/favicon.svg', apple: '/gamehub/favicon.svg' },
  openGraph: { type: 'website', siteName: 'GameHub', title: 'GameHub — Free Browser Games', description: 'Play free browser games instantly. Arcade, puzzle, classic and local 2-player games.', url: siteUrl, locale: 'en_US' },
  twitter: { card: 'summary', title: 'GameHub — Free Browser Games', description: 'Play free browser games instantly. No download required.' },
};

export const viewport: Viewport = { themeColor: '#b7f34a', colorScheme: 'dark', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><GameUrlBridge /><RecentTracker />{children}<HomePromos /><ShareScore /></body></html>;
}
