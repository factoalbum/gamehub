'use client';

import { useEffect, useMemo, useState } from 'react';
import './daily-challenge.css';

const challenges = [
  { id: 'reflex', title: 'Reflex Rush', emoji: '⚡', goal: 'Beat 280ms', href: '/gamehub/' },
  { id: 'memory-grid', title: 'Memory Grid', emoji: '🧠', goal: 'Reach level 5', href: '/gamehub/' },
  { id: 'snake', title: 'Snake', emoji: '🐍', goal: 'Score 10', href: '/gamehub/' },
  { id: 'number-merge', title: 'Number Merge', emoji: '🔢', goal: 'Score 2,048', href: '/gamehub/' },
  { id: 'color-match', title: 'Color Match', emoji: '🎨', goal: 'Survive 20 rounds', href: '/gamehub/' },
  { id: 'stack-tower', title: 'Stack Tower', emoji: '🏗️', goal: 'Stack 15 blocks', href: '/gamehub/' },
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
  const [done, setDone] = useState(false);
  useEffect(() => setDone(localStorage.getItem(`gamehub:daily:${dateKey}`) === challenge.id), [challenge.id, dateKey]);
  function markStarted() {
    localStorage.setItem(`gamehub:daily:${dateKey}`, challenge.id);
    setDone(true);
  }
  return <section className="daily-challenge" aria-label="Daily challenge">
    <div className="daily-copy"><span className="daily-kicker">DAILY CHALLENGE · {dateKey}</span><strong>{challenge.emoji} {challenge.title}</strong><span>{done ? 'Challenge claimed — now beat your best.' : `Today’s goal: ${challenge.goal}.`}</span></div>
    <a className="daily-cta" href={challenge.href} onClick={markStarted}>{done ? 'PLAY AGAIN →' : 'TAKE CHALLENGE →'}</a>
  </section>;
}
