import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bubble Pop — Free Bubble Popping Arcade Game',
  description: 'Play Bubble Pop free in your browser. Pop bubbles, build combos and chase your best score in a fast 45-second arcade game.',
  alternates: { canonical: '/bubble-pop/' },
};

export default function BubblePopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
