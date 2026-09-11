import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brick Breaker — Free Online Arcade Game',
  description: 'Play Brick Breaker free in your browser. Break every brick, survive three lives, level up and chase your personal best.',
  alternates: { canonical: '/brick-breaker/' },
};

export default function BrickBreakerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
