import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neon Dodge — GameHub',
  description: 'Survive 45 seconds of falling neon blocks in Neon Dodge. A fast, free browser arcade game with keyboard and touch controls.',
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
