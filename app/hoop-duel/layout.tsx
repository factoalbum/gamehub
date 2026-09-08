import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hoop Duel — 2 Player Basketball Game | GameHub',
  description: 'Play Hoop Duel, a fast local 2-player basketball arcade game. Grab a friend, shoot hoops and race to 7 baskets on one device.',
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
