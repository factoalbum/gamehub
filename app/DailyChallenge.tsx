'use client';

import { useEffect, useMemo, useState } from 'react';
import './daily-challenge.css';

const challenges = [
  { id: 'reflex', title: 'Reflex Rush', emoji: '⚡', goal: 'Beat 280ms', href: '/gamehub/?game=reflex' },
  { id: 'memory-grid', title: 'Memory Grid', emoji: '🧠', goal: 'Reach level 5', href: '/gamehub/?game=memory-grid' },
  { id: 'snake', title: 'Snake', emoji: '🐍', goal: 'Score 10', href: '/gamehub/?game=snake' },
  { id: 'number-merge', title: 'Number Merge', emoji: '🔢', goal: 'Score 2,048', href: '/gamehub/?game=number-merge' },
  { id: 'color-match', title: 'Color Match', emoji: '🎨', goal: 'Survive 20 rounds', href: '/gamehub/?game=color-match' },
  { id: 'stack-tower', title: 'Stack Tower', emoji: '🏗️', goal: 'Stack 15 blocks', href: '/gamehub/?game=stack-tower' },
  { id: 'minesweeper', title: 'Minesweeper', emoji: '💣', goal: 'Clear the minefield', href: '/gamehub/minesweeper/' },
];

function dayIndex() {
  const start = Date.UTC(2026, 0, 1);
  const today = new Date();
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.floor((utcToday - start) / 86400000);
}

export default function DailyChallenge() {
  const challenge = useMemo(() => challenges[((dayIndex() % challenges.length) + challenges.length) % challenges.length], []);
  const dateKey = new Date().toISOString().slice(0, 10);
  const [played, setPlayed] = useState(false);
  useEffect(() => setPlayed(localStorage.getItem(`gamehub:daily:${dateKey}`) === challenge.id), [challenge.id, dateKey]);
  function play() {
    localStorage.setItem(`gamehub:daily:${dateKey}`, challenge.id);
    setPlayed(true);
    window.location.href = challenge.href;
  }
  return <section className="daily-challenge" aria-label="Daily challenge">
    <div className="daily-copy"><span className="daily-kicker">DAILY CHALLENGE · {dateKey}</span><strong>{challenge.emoji} {challenge.title}</strong><span>{played ? 'Today’s challenge is ready again — beat your best.' : `Today’s goal: ${challenge.goal}.`}</span></div>
    <button className="daily-cta" type="button" onClick={play}>{played ? 'PLAY AGAIN →' : 'PLAY TODAY →'}</button>
  </section>;
}
