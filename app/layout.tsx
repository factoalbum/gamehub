import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GameHub — Free Browser Games',
  description: 'Play quick, fun and free browser games instantly.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
