import type { Metadata } from 'next';
export const metadata: Metadata={title:'Minesweeper — Free Online Puzzle Game',description:'Play Minesweeper free in your browser. Clear the 9×9 minefield, flag dangerous tiles and beat your best time.',alternates:{canonical:'/minesweeper/'}};
export default function Layout({children}:{children:React.ReactNode}){return children;}
