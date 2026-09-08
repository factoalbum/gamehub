import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bubble Pop — GameHub',
  description: 'Pop bubbles, build combos and chase your best score in a fast 45-second arcade game.',
};

export default function BubblePopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
