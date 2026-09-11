'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { trackGame } from '../lib/analytics';
import './tap-target.css';

type Phase = 'ready' | 'playing' | 'finished';

type Target = { x: number; y: number; size: number };

function randomTarget(size: number): Target {
  const padding = size / 2 + 2;
  return {
    x: padding + Math.random() * (100 - padding * 2),
    y: padding + Math.random() * (100 - padding * 2),
    size,
  };
}

export default function TapTargetPage() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [target, setTarget] = useState<Target>({ x: 50, y: 50, size: 72 });
  const [best, setBest] = useState(0);
  const startedAt = useRef(0);

  useEffect(() => {
    setBest(Number(localStorage.getItem('gamehub:tap-target-best') || 0));
    trackGame('game_open', 'tap-target');
  }, []);

  const finish = useCallback(() => {
    setPhase('finished');
    setScore(current => {
      setBest(old => {
        const next = Math.max(old, current);
        localStorage.setItem('gamehub:tap-target-best', String(next));
        return next;
      });
      trackGame('game_finish', 'tap-target', { score: current });
      return current;
    });
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, 30 - Math.floor((performance.now() - startedAt.current) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) finish();
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, finish]);

  function start() {
    startedAt.current = performance.now();
    setScore(0);
    setTimeLeft(30);
    setTarget(randomTarget(72));
    setPhase('playing');
    trackGame(phase === 'finished' ? 'game_restart' : 'game_start', 'tap-target');
  }

  function hitTarget() {
    if (phase !== 'playing') return;
    setScore(current => {
      const next = current + 1;
      setTarget(randomTarget(Math.max(38, 72 - Math.floor(next / 8) * 4)));
      return next;
    });
  }

  return (
    <main className="tap-page">
      <div className="tap-top">
        <a href="/gamehub/" className="tap-back">← Games</a>
        <div className="tap-title">🎯 TAP TARGET</div>
        <div className="tap-best">BEST {best || '—'}</div>
      </div>

      <section className="tap-shell">
        <div className="tap-hud">
          <div><small>SCORE</small><strong>{score}</strong></div>
          <div><small>TIME</small><strong>{timeLeft}s</strong></div>
          <div><small>BEST</small><strong>{best || '—'}</strong></div>
        </div>

        <div className="tap-board" aria-label="Tap Target game board">
          {phase === 'playing' && (
            <button
              className="tap-target"
              style={{ left: `${target.x}%`, top: `${target.y}%`, width: target.size, height: target.size }}
              onClick={hitTarget}
              aria-label="Tap target"
            >
              <span />
            </button>
          )}
          {phase === 'ready' && (
            <div className="tap-overlay">
              <div className="tap-icon">🎯</div>
              <h1>How many can you hit?</h1>
              <p>30 seconds. One target at a time. They get smaller as you score.</p>
              <button className="tap-button" onClick={start}>START GAME</button>
            </div>
          )}
          {phase === 'finished' && (
            <div className="tap-overlay">
              <div className="tap-result">{score}</div>
              <h1>{score > best ? 'NEW BEST!' : 'TIME!'}</h1>
              <p>You hit {score} targets in 30 seconds.</p>
              <button className="tap-button" onClick={start}>PLAY AGAIN</button>
            </div>
          )}
        </div>

        <div className="tap-tip">⚡ Tip: aim for the center — speed matters.</div>
      </section>
    </main>
  );
}
