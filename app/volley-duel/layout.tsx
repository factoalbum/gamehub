import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Volley Duel — Free 2 Player Volleyball Game | GameHub',
  description: 'Play Volley Duel, a fast local 2-player volleyball game in your browser. No download, no signup.',
};

export default function VolleyDuelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
