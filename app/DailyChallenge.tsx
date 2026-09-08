'use client';

import { useEffect, useMemo, useState } from 'react';
import './daily-challenge.css';

const challenges = [
  { id: 'reflex', title: 'Reflex Rush', emoji: '⚡', goal: 'Beat 280ms' },
  { id: 'memory-grid', title: 'Memory Grid', emoji: '🧠', goal: 'Reach level 5' },
  { id: 'snake', title: 'Snake', emoji: '🐍', goal: 'Score 10' },
  { id: 'number-merge', title: 'Number Merge', emoji: '🔢', goal: 'Score 2,048' },
  { id: 'color-match', title: 'Color Match', emoji: '🎨', goal: 'Survive 20 rounds' },
  { id: 'stack-tower', title: 'Stack Tower', emoji: '🏗️', goal: 'Stack 15 blocks' },
  { id: 'minesweeper', title: 'Minesweeper', emoji: '💣', goal: 'Clear the minefield' },
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
  const [claimed, setClaimed] = useState(false);
  useEffect(() => setClaimed(localStorage.getItem(`gamehub:daily:${dateKey}`) === challenge.id), [challenge.id, dateKey]);
  function claim() {
    localStorage.setItem(`gamehub:daily:${dateKey}`, challenge.id);
    setClaimed(true);
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return <section className="daily-challenge" aria-label="Daily challenge">
    <div className="daily-copy"><span className="daily-kicker">DAILY CHALLENGE · {dateKey}</span><strong>{challenge.emoji} {challenge.title}</strong><span>{claimed ? 'Challenge claimed — now beat your best.' : `Today’s goal: ${challenge.goal}.`}</span></div>
    <button className="daily-cta" type="button" onClick={claim}>{claimed ? 'PLAY AGAIN →' : 'TAKE CHALLENGE →'}</button>
  </section>;
}
