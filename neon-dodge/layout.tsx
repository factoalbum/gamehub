import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neon Dodge — Free Survival Arcade Game',
  description: 'Play Neon Dodge free in your browser. Survive falling neon blocks for 45 seconds with keyboard or touch controls and chase your best score.',
  alternates: { canonical: '/neon-dodge/' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
