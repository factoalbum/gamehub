'use client';

import { useEffect, useState } from 'react';
import { recentGames, type GameCatalogItem } from './lib/game-catalog';
import './recently-played.css';

type RecentGame = GameCatalogItem;

function readRecent(){
  try{
    const ids=JSON.parse(localStorage.getItem('gamehub:recent')||'[]') as string[];
    return ids.map(id=>recentGames.find(g=>g.id===id)).filter(Boolean) as RecentGame[];
  }catch{return []}
}

export default function RecentlyPlayed(){
  const[recent,setRecent]=useState<RecentGame[]>([]);
  useEffect(()=>{
    setRecent(readRecent());
    const r=()=>setRecent(readRecent());
    window.addEventListener('gamehub:recent',r);
    window.addEventListener('storage',r);
    return()=>{window.removeEventListener('gamehub:recent',r);window.removeEventListener('storage',r)};
  },[]);
  if(!recent.length)return null;
  return <section className="recently-played" aria-label="Recently played games"><div className="recent-heading"><div><span className="section-kicker">JUMP BACK IN</span><h2>Recently played</h2></div><span>{recent.length} game{recent.length===1?'':'s'}</span></div><div className="recent-row">{recent.slice(0,5).map(game=><a className="recent-card" href={game.href} key={game.id}><span className="recent-icon">{game.emoji}</span><span><strong>{game.label}</strong><small>{game.category}</small></span><b>→</b></a>)}</div></section>
}
