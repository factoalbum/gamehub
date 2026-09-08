'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './neon-dodge.css';
import { trackGame } from '../lib/analytics';

type Obstacle = { id: number; lane: number; y: number; speed: number };
const LANES = 5;
const GAME_MS = 45000;

function randomLane(exclude = -1) {
  let lane = Math.floor(Math.random() * LANES);
  while (lane === exclude) lane = Math.floor(Math.random() * LANES);
  return lane;
}

export default function NeonDodge() {
  const [lane, setLane] = useState(2);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_MS);
  const [combo, setCombo] = useState(0);
  const [hit, setHit] = useState(false);
  const laneRef = useRef(2);
  const scoreRef = useRef(0);
  const idRef = useRef(0);
  const lastSpawn = useRef(0);
  const lastFrame = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    const saved = Number(localStorage.getItem('gamehub:neon-dodge-best') || 0);
    setBest(saved);
  }, []);

  const finish = useCallback((finalScore = scoreRef.current, wasHit = false) => {
    setRunning(false);
    setObstacles([]);
    setScore(finalScore);
    setTimeLeft(0);
    setCombo(0);
    setHit(wasHit);
    setBest(prev => {
      const next = Math.max(prev, finalScore);
      localStorage.setItem('gamehub:neon-dodge-best', String(next));
      return next;
    });
    trackGame('game_finish', 'neon-dodge', { score: finalScore, hit: wasHit });
  }, []);

  const move = useCallback((delta: number) => {
    if (!running) return;
    setLane(current => {
      const next = Math.max(0, Math.min(LANES - 1, current + delta));
      laneRef.current = next;
      return next;
    });
  }, [running]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { event.preventDefault(); move(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = (now: number) => {
      const delta = Math.min(40, now - (lastFrame.current || now));
      lastFrame.current = now;
      const elapsed = now - startTime.current;
      const remaining = GAME_MS - elapsed;
      if (remaining <= 0) { finish(scoreRef.current, false); return; }
      setTimeLeft(remaining);
      if (now - lastSpawn.current > Math.max(260, 690 - scoreRef.current * 4)) {
        lastSpawn.current = now;
        setObstacles(current => [...current, { id: idRef.current++, lane: randomLane(), y: -12, speed: 0.085 + Math.min(scoreRef.current, 30) * 0.0018 }]);
      }
      setObstacles(current => {
        let missed = 0;
        const next = current.map(item => ({ ...item, y: item.y + item.speed * delta })).filter(item => {
          if (item.y > 105) { missed += 1; return false; }
          return true;
        });
        if (missed) {
          scoreRef.current += missed;
          setScore(scoreRef.current);
          setCombo(value => value + missed);
        }
        const collision = next.some(item => item.lane === laneRef.current && item.y > 78 && item.y < 94);
        if (collision) {
          finish(scoreRef.current, true);
          return [];
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    lastFrame.current = 0;
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, finish]);

  const start = () => {
    laneRef.current = 2;
    scoreRef.current = 0;
    setLane(2); setScore(0); setCombo(0); setObstacles([]); setHit(false); setTimeLeft(GAME_MS); setRunning(true);
    startTime.current = performance.now();
    lastSpawn.current = startTime.current;
    trackGame('game_start', 'neon-dodge');
  };

  return <main className="neon-page">
    <div className="neon-shell">
      <div className="game-top"><a className="back" href="/gamehub/">← <span>Games</span></a><span className="game-title">🌌 NEON DODGE</span><span className="pill">BEST {best}</span></div>
      <section className="neon-card">
        <div className="neon-head"><div><div className="eyebrow">SURVIVE THE DROP</div><h1>Don't get <em>hit.</em></h1><p>Move between lanes. Dodge every neon block. Survive 45 seconds.</p></div><div className="neon-score"><strong>{score}</strong><span>SCORE</span></div></div>
        <div className="neon-arena" aria-label="Neon Dodge game area">
          <div className="lane-lines">{Array.from({ length: LANES - 1 }, (_, i) => <i key={i} style={{ left: `${((i + 1) / LANES) * 100}%` }} />)}</div>
          {obstacles.map(item => <div key={item.id} className="neon-obstacle" style={{ left: `${(item.lane / LANES) * 100 + 2}%`, top: `${item.y}%`, width: `${100 / LANES - 4}%` }} />)}
          <div className="neon-player" style={{ left: `${(lane / LANES) * 100 + 2}%`, width: `${100 / LANES - 4}%` }}>◆</div>
          <div className="neon-hud"><span>{Math.ceil(timeLeft / 1000)}s</span><span>{combo >= 3 ? `🔥 ${combo} streak` : 'KEEP MOVING'}</span></div>
          {!running && <div className="neon-overlay"><div className="neon-icon">{hit ? '💥' : '🌌'}</div><h2>{hit ? 'You got hit!' : score ? `Run complete · ${score}` : 'Ready?'}</h2><p>{hit ? `You dodged ${score} blocks. Beat ${best || 'your first'} run.` : 'Arrow keys, A/D, or the buttons below.'}</p><button className="primary" onClick={start}>{score ? 'PLAY AGAIN' : 'START DODGING'}</button></div>}
          {!running && score === 0 && <div className="neon-tip">45 SEC · 5 LANES · SPEED RISES</div>}
        </div>
        <div className="neon-controls"><button onClick={() => move(-1)} aria-label="Move left">←</button><span>← A / D →</span><button onClick={() => move(1)} aria-label="Move right">→</button></div>
        <div className="neon-stats"><span>🏆 Best: {best}</span><span>⚡ 45 second survival</span><span>🎯 Dodge as many as possible</span></div>
      </section>
    </div>
  </main>;
}
