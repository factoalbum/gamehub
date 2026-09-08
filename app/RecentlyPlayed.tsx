'use client';

import { useEffect, useState } from 'react';
import './recently-played.css';

type RecentGame = { id: string; title: string; emoji: string; href: string; category: string };

const catalog: RecentGame[] = [
  { id: 'reflex', title: 'Reflex Rush', emoji: '⚡', href: '/gamehub/?game=reflex', category: 'Arcade' },
  { id: 'memory-grid', title: 'Memory Grid', emoji: '🧠', href: '/gamehub/?game=memory-grid', category: 'Brain' },
  { id: 'snake', title: 'Snake', emoji: '🐍', href: '/gamehub/?game=snake', category: 'Classic' },
  { id: 'number-merge', title: 'Number Merge', emoji: '🔢', href: '/gamehub/?game=number-merge', category: 'Puzzle' },
  { id: 'color-match', title: 'Color Match', emoji: '🎨', href: '/gamehub/?game=color-match', category: 'Puzzle' },
  { id: 'stack-tower', title: 'Stack Tower', emoji: '🏗️', href: '/gamehub/?game=stack-tower', category: 'Arcade' },
  { id: 'minesweeper', title: 'Minesweeper', emoji: '💣', href: '/gamehub/minesweeper/', category: 'Puzzle' },
  { id: 'tap-target', title: 'Tap Target', emoji: '🎯', href: '/gamehub/tap-target/', category: 'Arcade' },
  { id: 'brick-breaker', title: 'Brick Breaker', emoji: '🧱', href: '/gamehub/brick-breaker/', category: 'Arcade' },
  { id: 'neon-dodge', title: 'Neon Dodge', emoji: '🟣', href: '/gamehub/neon-dodge/', category: 'Arcade' },
  { id: 'hoop-duel', title: 'Hoop Duel', emoji: '🏀', href: '/gamehub/hoop-duel/', category: '2 Player' },
  { id: 'mini-football', title: 'Mini Football', emoji: '⚽', href: '/gamehub/mini-football/', category: '2 Player' },
  { id: 'volley-duel', title: 'Volley Duel', emoji: '🏐', href: '/gamehub/volley-duel/', category: '2 Player' },
  { id: 'tennis-duel', title: 'Tennis Duel', emoji: '🎾', href: '/gamehub/tennis-duel/', category: '2 Player' },
];

function readRecent(){try{const ids=JSON.parse(localStorage.getItem('gamehub:recent')||'[]') as string[];return ids.map(id=>catalog.find(g=>g.id===id)).filter(Boolean) as RecentGame[]}catch{return []}}
export default function RecentlyPlayed(){const[recent,setRecent]=useState<RecentGame[]>([]);useEffect(()=>{setRecent(readRecent());const r=()=>setRecent(readRecent());window.addEventListener('gamehub:recent',r);window.addEventListener('storage',r);return()=>{window.removeEventListener('gamehub:recent',r);window.removeEventListener('storage',r)}},[]);if(!recent.length)return null;return <section className="recently-played" aria-label="Recently played games"><div className="recent-heading"><div><span className="section-kicker">JUMP BACK IN</span><h2>Recently played</h2></div><span>{recent.length} game{recent.length===1?'':'s'}</span></div><div className="recent-row">{recent.slice(0,5).map(game=><a className="recent-card" href={game.href} key={game.id}><span className="recent-icon">{game.emoji}</span><span><strong>{game.title}</strong><small>{game.category}</small></span><b>→</b></a>)}</div></section>}
