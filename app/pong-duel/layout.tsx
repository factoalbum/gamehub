import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pong Duel — 2 Player Local Arcade | GameHub',
  description: 'Play a fast two-player Pong duel on one device. Keyboard and simultaneous touch controls, no login required.',
};

export default function PongDuelLayout({ children }: { children: React.ReactNode }) { return children; }
