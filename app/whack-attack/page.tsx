'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './whack-attack.css';
import { trackGame } from '../lib/analytics';

const ROUND = 30;

type Target = { hole: number; kind: 'target' | 'bomb' };

export default function WhackAttackPage() {
  const [status, setStatus] = useState<'ready' | 'playing' | 'over'>('ready');
  const [time, setTime] = useState(ROUND);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [target, setTarget] = useState<Target>({ hole: 4, kind: 'target' });
  const state = useRef({ running: false, score: 0, combo: 0, endAt: 0, target: target });

  useEffect(() => {
    setBest(Number(localStorage.getItem('gamehub:whack-attack-best') || 0));
    trackGame('game_open', 'whack-attack');
  }, []);

  const nextTarget = useCallback(() => {
    const hole = Math.floor(Math.random() * 9);
    const kind = Math.random() < 0.13 ? 'bomb' : 'target';
    const next = { hole, kind } as Target;
    state.current.target = next;
    setTarget(next);
  }, []);

  const finish = useCallback(() => {
    const s = state.current;
    if (!s.running) return;
    s.running = false;
    const nextBest = Math.max(Number(localStorage.getItem('gamehub:whack-attack-best') || 0), s.score);
    localStorage.setItem('gamehub:whack-attack-best', String(nextBest));
    setBest(nextBest); setScore(s.score); setCombo(s.combo); setTime(0); setStatus('over');
    trackGame('game_finish', 'whack-attack', { score: s.score, combo: s.combo });
  }, []);

  const start = useCallback(() => {
    const s = state.current;
    s.running = true; s.score = 0; s.combo = 0; s.endAt = performance.now() + ROUND * 1000;
    setScore(0); setCombo(0); setTime(ROUND); setStatus('playing'); nextTarget();
    trackGame('game_start', 'whack-attack');
  }, [nextTarget]);

  useEffect(() => {
    if (status !== 'playing') return;
    const clock = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((state.current.endAt - performance.now()) / 1000));
      setTime(left);
      if (left <= 0) finish();
    }, 100);
    return () => window.clearInterval(clock);
  }, [status, finish]);

  const hit = (hole: number) => {
    const s = state.current;
    if (!s.running || hole !== s.target.hole) return;
    if (s.target.kind === 'bomb') {
      s.combo = 0; s.score = Math.max(0, s.score - 20); setCombo(0); setScore(s.score); nextTarget(); return;
    }
    s.combo += 1;
    s.score += 10 + Math.min(40, (s.combo - 1) * 3);
    setCombo(s.combo); setScore(s.score); nextTarget();
  };

  return <main className="whack-page"><div className="whack-shell">
    <div className="whack-top"><a href="/gamehub/">← GAMES</a><span>🔨 WHACK ATTACK</span><b>{time}s · {score} · ×{combo}</b></div>
    <section className="whack-card" aria-label="Whack Attack game">
      <div className="whack-heading"><div><span className="eyebrow">30 SECOND ARCADE</span><h1>Whack <em>Attack</em></h1></div><span className="best">BEST {best || '—'}</span></div>
      <div className="whack-board">{Array.from({ length: 9 }, (_, i) => { const active = status === 'playing' && target.hole === i; return <button key={i} type="button" className={`hole ${active ? target.kind : ''}`} onPointerDown={() => hit(i)} aria-label={active ? target.kind === 'bomb' ? 'Bomb — avoid' : 'Hit target' : `Hole ${i + 1}`}>{active && (target.kind === 'bomb' ? '×' : '●')}</button>; })}</div>
      <div className="whack-footer">{status === 'ready' && <p>Hit the target. Chain hits for bonus points. Avoid the bombs.</p>}{status === 'playing' && <p>KEEP GOING · TARGETS MOVE FAST</p>}{status === 'over' && <p>Score {score} · {score >= best && score > 0 ? '🏆 NEW BEST' : `Beat ${best || 'your best'}`}</p>}<button className="primary" onClick={start}>{status === 'over' ? 'PLAY AGAIN' : status === 'playing' ? 'RESTART RUN' : 'START GAME'}</button></div>
    </section>
  </div></main>;
}
