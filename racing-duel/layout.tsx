import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Racing Duel — Free 2 Player Racing Game | GameHub',
  description: 'Play Racing Duel with a friend on one device. Race three laps, use boost and finish first. Free browser game with no download or signup.',
};

export default function RacingDuelLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
