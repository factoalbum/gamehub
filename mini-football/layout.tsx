import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mini Football — Free 2 Player Game | GameHub',
  description: 'Play a fast local 2-player football arcade game on one device. No download, no signup, instant rematches.',
};

export default function MiniFootballLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
