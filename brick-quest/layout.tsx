import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brick Quest — Free Brick Breaker Game | GameHub',
  description: 'Play Brick Quest, a fast mobile-friendly brick breaker with 10 levels, power-ups, multiple balls, and a local best score.',
};

export default function BrickQuestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
