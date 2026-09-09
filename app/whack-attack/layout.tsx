import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whack Attack — Free 30-Second Arcade Game',
  description: 'Play Whack Attack free in your browser. Hit moving targets, build combos and chase your high score in 30 seconds.',
};

export default function WhackAttackLayout({ children }: { children: React.ReactNode }) { return children; }
