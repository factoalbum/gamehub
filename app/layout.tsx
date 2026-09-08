import './globals.css';
import './polish.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'GameHub — Free Browser Games',
  description: 'Play quick, fun and free browser games instantly. Arcade, puzzle, brain and classic games with no download.',
  icons: { icon: '/gamehub/favicon.svg' },
  manifest: '/gamehub/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#b7f34a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
