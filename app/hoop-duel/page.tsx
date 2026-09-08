'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './hoop-duel.css';
import { trackGame } from '../lib/analytics';

type Player = { x: number; y: number; vx: number; vy: number; facing: number; score: number };
type Ball = { x: number; y: number; vx: number; vy: number; owner: 1 | 2 | null };

const W = 900;
const H = 520;
const FLOOR = 454;
const PLAYER_W = 34;
const PLAYER_H = 58;
const GRAVITY = 0.34;
const WIN_SCORE = 7;

function initialPlayers(): [Player, Player] {
  return [
    { x: 115, y: FLOOR - PLAYER_H, vx: 0, vy: 0, facing: 1, score: 0 },
    { x: 751, y: FLOOR - PLAYER_H, vx: 0, vy: 0, facing: -1, score: 0 },
  ];
}

function initialBall(): Ball { return { x: W / 2, y: 260, vx: 0, vy: 0, owner: null }; }

export default function HoopDuelPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef<Set<string>>(new Set());
  const players = useRef<[Player, Player]>(initialPlayers());
  const ball = useRef<Ball>(initialBall());
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const state = useRef<'ready' | 'playing' | 'over'>('ready');
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready');
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState(0);
  const [message, setMessage] = useState('First to 7 wins');

  const reset = useCallback((startNow = true) => {
    players.current = initialPlayers();
    ball.current = initialBall();
    state.current = startNow ? 'playing' : 'ready';
    setPhase(startNow ? 'playing' : 'ready');
    setScores([0, 0]);
    setWinner(0);
    setMessage('First to 7 wins');
    trackGame(startNow ? 'game_restart' : 'game_open', 'hoop-duel');
  }, []);

  const shoot = useCallback((playerNo: 1 | 2) => {
    if (state.current !== 'playing') return;
    const p = players.current[playerNo - 1];
    const b = ball.current;
    const near = Math.hypot(b.x - (p.x + PLAYER_W / 2), b.y - (p.y + 20)) < 72;
    if (b.owner !== playerNo && !near) return;
    const direction = playerNo === 1 ? 1 : -1;
    b.owner = null;
    b.x = p.x + PLAYER_W / 2 + direction * 24;
    b.y = p.y + 17;
    b.vx = direction * 7.2;
    b.vy = -8.4;
    setMessage(playerNo === 1 ? 'PLAYER 1 SHOOTING!' : 'PLAYER 2 SHOOTING!');
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const controls = ['a','d','w','f','arrowleft','arrowright','arrowup','l','enter',' '];
      if (controls.includes(k)) e.preventDefault();
      if (k === 'f') shoot(1);
      if (k === 'l') shoot(2);
      keys.current.add(k);
      if ((k === 'enter' || k === ' ') && state.current !== 'playing') reset(true);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [reset, shoot]);

  useEffect(() => {
    trackGame('game_open', 'hoop-duel');
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#101722'); g.addColorStop(1, '#070b11'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#172231'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
      ctx.strokeStyle = '#293648'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(W, FLOOR); ctx.stroke();
      ctx.strokeStyle = '#202b3a'; ctx.lineWidth = 1;
      for (let x = 30; x < W; x += 45) { ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x + 22, H); ctx.stroke(); }

      drawHoop(ctx, 46, -1); drawHoop(ctx, W - 46, 1);
      const [p1, p2] = players.current;
      drawPlayer(ctx, p1, 1); drawPlayer(ctx, p2, 2);
      const b = ball.current;
      ctx.beginPath(); ctx.arc(b.x, b.y, 11, 0, Math.PI * 2); ctx.fillStyle = '#f28a3d'; ctx.fill();
      ctx.strokeStyle = '#c95f22'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = '#7d3d1c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.stroke();
    };

    const drawHoop = (c: CanvasRenderingContext2D, x: number, side: -1 | 1) => {
      c.fillStyle = '#d7dde5'; c.fillRect(x - (side < 0 ? 0 : 8), 258, 8, 104);
      const rimX = side < 0 ? x + 8 : x - 58;
      c.strokeStyle = '#ff7655'; c.lineWidth = 7; c.beginPath(); c.moveTo(rimX, 303); c.lineTo(rimX + 50, 303); c.stroke();
      c.strokeStyle = '#dce4ee'; c.lineWidth = 2; c.beginPath(); c.moveTo(rimX + 7, 307); c.lineTo(rimX + 14, 344); c.lineTo(rimX + 43, 344); c.lineTo(rimX + 48, 307); c.stroke();
    };

    const drawPlayer = (c: CanvasRenderingContext2D, p: Player, no: 1 | 2) => {
      c.fillStyle = no === 1 ? '#b7f34a' : '#78e4ff';
      c.fillRect(p.x, p.y + 16, PLAYER_W, PLAYER_H - 16);
      c.beginPath(); c.arc(p.x + PLAYER_W / 2, p.y + 9, 12, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0a0d12'; c.fillRect(p.x + (p.facing > 0 ? 21 : 5), p.y + 6, 4, 4);
      c.fillStyle = '#080b10'; c.fillRect(p.x - 2, p.y + PLAYER_H - 4, 14, 6); c.fillRect(p.x + 22, p.y + PLAYER_H - 4, 14, 6);
    };

    const tick = (time: number) => {
      const dt = Math.min(2, (time - last.current) / 16.67 || 1); last.current = time;
      if (state.current === 'playing') {
        const [p1, p2] = players.current;
        const controls: [[string, string, string], [string, string, string]] = [['a','d','w'], ['arrowleft','arrowright','arrowup']];
        [p1, p2].forEach((p, i) => {
          const [left, right, jump] = controls[i];
          p.vx = 0;
          if (keys.current.has(left)) { p.vx = -4.2; p.facing = -1; }
          if (keys.current.has(right)) { p.vx = 4.2; p.facing = 1; }
          if (keys.current.has(jump) && p.y >= FLOOR - PLAYER_H - 1) p.vy = -8.3;
          p.vy += GRAVITY * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          p.x = Math.max(12, Math.min(W - PLAYER_W - 12, p.x));
          if (p.y > FLOOR - PLAYER_H) { p.y = FLOOR - PLAYER_H; p.vy = 0; }
        });

        const b = ball.current;
        if (!b.owner) {
          b.vy += GRAVITY * 0.95 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= Math.pow(.994, dt);
          if (b.y > FLOOR - 11) { b.y = FLOOR - 11; b.vy *= -0.55; if (Math.abs(b.vy) < 1) b.vy = 0; }
          if (b.x < 14 || b.x > W - 14) { b.x = Math.max(14, Math.min(W - 14, b.x)); b.vx *= -0.7; }
          [p1, p2].forEach((p, i) => {
            const dx = b.x - (p.x + PLAYER_W / 2), dy = b.y - (p.y + 22);
            if (Math.hypot(dx, dy) < 42 && b.vy > -1) { b.owner = (i + 1) as 1 | 2; b.vx = 0; b.vy = 0; b.x = p.x + PLAYER_W / 2 + p.facing * 27; b.y = p.y + 20; setMessage(`PLAYER ${i + 1} HAS THE BALL`); }
          });

          const hoops = [{ x: 58, scoreFor: 2 }, { x: W - 58, scoreFor: 1 }];
          hoops.forEach(h => {
            const inRim = b.x > h.x - 28 && b.x < h.x + 28 && b.y > 298 && b.y < 314 && b.vy > 0;
            if (inRim) {
              const scorer = h.scoreFor as 1 | 2;
              players.current[scorer - 1].score += 1;
              const next = players.current.map(p => p.score) as [number, number];
              setScores(next);
              trackGame('game_finish', 'hoop-duel', { scorer, score: next[scorer - 1] });
              if (next[scorer - 1] >= WIN_SCORE) {
                state.current = 'over'; setPhase('over'); setWinner(scorer); setMessage(`PLAYER ${scorer} WINS!`); return;
              }
              b.x = W / 2; b.y = 230; b.vx = 0; b.vy = 0; b.owner = null; setMessage(`PLAYER ${scorer} SCORES!`);
            }
          });
        } else {
          const p = players.current[b.owner - 1]; b.x = p.x + PLAYER_W / 2 + p.facing * 27; b.y = p.y + 20;
        }
      }
      draw();
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const handleTouch = (player: 1 | 2, action: 'left' | 'right' | 'jump' | 'shoot') => {
    if (state.current !== 'playing') { if (action === 'shoot') reset(true); return; }
    const map = player === 1 ? { left: 'a', right: 'd', jump: 'w' } : { left: 'arrowleft', right: 'arrowright', jump: 'arrowup' };
    if (action === 'shoot') { shoot(player); return; }
    const key = map[action as 'left' | 'right' | 'jump']; keys.current.add(key);
    window.setTimeout(() => keys.current.delete(key), action === 'jump' ? 140 : 90);
  };

  return <main className="hoop-page"><div className="hoop-shell">
    <header className="hoop-top"><a href="/gamehub/" className="back">← Games</a><div><span>2 PLAYER · SPORTS</span><h1>🏀 HOOP DUEL</h1></div><div className="scoreboard"><b>{scores[0]}</b><i>:</i><b>{scores[1]}</b></div></header>
    <section className="hoop-card">
      <div className="hoop-info"><span>LOCAL MULTIPLAYER</span><strong>{message}</strong><small>P1: A/D move · W jump · F shoot &nbsp; | &nbsp; P2: ←/→ move · ↑ jump · L shoot</small></div>
      <div className="court-wrap"><canvas ref={canvasRef} width={W} height={H} aria-label="Basketball duel court" />
        {phase !== 'playing' && <div className="hoop-overlay"><span className="overlay-icon">🏀</span><h2>{phase === 'over' ? `PLAYER ${winner} WINS!` : 'READY TO PLAY?'}</h2><p>{phase === 'over' ? `${scores[0]} — ${scores[1]} · Rematch instantly.` : 'Grab a friend. First to 7 baskets takes it.'}</p><button className="primary" onClick={() => reset(true)}>{phase === 'over' ? 'REMATCH' : 'START DUEL'}</button></div>}
      </div>
      <div className="touch-controls"><div><span>P1</span><button onPointerDown={() => handleTouch(1,'left')}>←</button><button onPointerDown={() => handleTouch(1,'right')}>→</button><button onPointerDown={() => handleTouch(1,'jump')}>↑</button><button className="shoot" onPointerDown={() => handleTouch(1,'shoot')}>SHOOT</button></div><div><span>P2</span><button onPointerDown={() => handleTouch(2,'left')}>←</button><button onPointerDown={() => handleTouch(2,'right')}>→</button><button onPointerDown={() => handleTouch(2,'jump')}>↑</button><button className="shoot" onPointerDown={() => handleTouch(2,'shoot')}>SHOOT</button></div></div>
    </section>
    <p className="hoop-note">No downloads. No accounts. One device, two players, instant rematches.</p>
  </div></main>;
}
