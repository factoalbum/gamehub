import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sky Hopper — Free Online Arcade Game',
  description: 'Play Sky Hopper free in your browser. Tap, click or press Space to fly through the gaps and chase your best score.',
  alternates: { canonical: '/sky-hopper/' },
};

export default function SkyHopperLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
