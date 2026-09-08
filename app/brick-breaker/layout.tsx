import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brick Breaker — Free Online Arcade Game | GameHub',
  description: 'Play Brick Breaker free in your browser. Break every brick, survive three lives, level up and chase your personal best.',
};

export default function BrickBreakerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
