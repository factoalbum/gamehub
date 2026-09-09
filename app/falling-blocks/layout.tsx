import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Falling Blocks — GameHub', description: 'Stack falling pieces, clear lines and chase your best score in this fast classic arcade puzzle.', alternates: { canonical: '/gamehub/falling-blocks/' } };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
