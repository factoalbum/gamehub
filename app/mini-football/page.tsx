'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './mini-football.css';
import { trackGame } from '../lib/analytics';

type Player = { x: number; y: number; vx: number; vy: number; facing: number; score: number };
type Ball = { x: number; y: number; vx: number; vy: number };

const W = 960;
const H = 500;
const FLOOR = 420;
const PLAYER = 34;
const GOAL = 82;
const GRAVITY = 0.32;
const WIN = 3;

function players(): [Player, Player] {
  return [
    { x: 120, y: FLOOR - PLAYER, vx: 0, vy: 0, facing: 1, score: 0 },
    { x: W - 154, y: FLOOR - PLAYER, vx: 0, vy: 0, facing: -1, score: 0 },
  ];
}
function ball(): Ball { return { x: W / 2, y: 230, vx: 0, vy: 0 }; }

export default function MiniFootball() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef(new Set<string>());
  const p = useRef<[Player, Player]>(players());
  const b = useRef<Ball>(ball());
  const state = useRef<'ready' | 'playing' | 'over'>('ready');
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState(0);
  const [message, setMessage] = useState('First to 3 goals wins');

  const reset = useCallback((start = true) => {
    p.current = players(); b.current = ball(); state.current = start ? 'playing' : 'ready';
    setPhase(start ? 'playing' : 'ready'); setScore([0, 0]); setWinner(0); setMessage('First to 3 goals wins');
    trackGame(start ? 'game_restart' : 'game_open', 'mini-football');
  }, []);

  const kick = useCallback((who: 1 | 2) => {
    if (state.current !== 'playing') return;
    const player = p.current[who - 1]; const ballState = b.current;
    const near = Math.hypot(ballState.x - (player.x + PLAYER / 2), ballState.y - (player.y + PLAYER / 2)) < 58;
    if (!near) return;
    const direction = who === 1 ? 1 : -1;
    ballState.vx = direction * 9.2; ballState.vy = -6.6;
    ballState.x = player.x + PLAYER / 2 + direction * 26; ballState.y = player.y + 8;
    setMessage(`PLAYER ${who} KICKS!`);
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const controls = ['a','d','w','f','arrowleft','arrowright','arrowup','l','enter',' '];
      if (controls.includes(key)) event.preventDefault();
      if (key === 'f') kick(1); if (key === 'l') kick(2);
      keys.current.add(key);
      if ((key === 'enter' || key === ' ') && state.current !== 'playing') reset(true);
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [kick, reset]);

  useEffect(() => {
    trackGame('game_open', 'mini-football');
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const gradient = ctx.createLinearGradient(0, 0, 0, H); gradient.addColorStop(0, '#14211b'); gradient.addColorStop(1, '#07100c');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#163523'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
      ctx.strokeStyle = '#31533f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(W, FLOOR); ctx.stroke();
      ctx.strokeStyle = '#ffffff16'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(W / 2, 50); ctx.lineTo(W / 2, FLOOR); ctx.stroke(); ctx.arc(W / 2, 250, 58, 0, Math.PI * 2); ctx.stroke();
      drawGoal(ctx, 0, 1); drawGoal(ctx, W, -1);
      drawPlayer(ctx, p.current[0], 1); drawPlayer(ctx, p.current[1], 2);
      const ballState = b.current; ctx.beginPath(); ctx.arc(ballState.x, ballState.y, 12, 0, Math.PI * 2); ctx.fillStyle = '#f4f4ef'; ctx.fill(); ctx.strokeStyle = '#1e2520'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = '#59645d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ballState.x - 9, ballState.y); ctx.lineTo(ballState.x + 9, ballState.y); ctx.moveTo(ballState.x, ballState.y - 9); ctx.lineTo(ballState.x, ballState.y + 9); ctx.stroke();
    };
    const drawGoal = (c: CanvasRenderingContext2D, x: number, side: -1 | 1) => {
      c.strokeStyle = '#e7efe9'; c.lineWidth = 5; c.strokeRect(x + (side === 1 ? 0 : -GOAL), FLOOR - 82, GOAL, 82);
      c.strokeStyle = '#ffffff24'; c.lineWidth = 1;
      for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(x + side * (-GOAL + i * 16), FLOOR - 82); c.lineTo(x + side * (-GOAL + i * 16), FLOOR); c.stroke(); }
    };
    const drawPlayer = (c: CanvasRenderingContext2D, player: Player, no: 1 | 2) => {
      c.fillStyle = no === 1 ? '#b7f34a' : '#78e4ff'; c.fillRect(player.x, player.y + 13, PLAYER, PLAYER - 13);
      c.beginPath(); c.arc(player.x + PLAYER / 2, player.y + 7, 10, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#09100b'; c.fillRect(player.x + (player.facing > 0 ? 22 : 7), player.y + 4, 3, 3);
    };

    const tick = (time: number) => {
      const dt = Math.min(2, (time - last.current) / 16.67 || 1); last.current = time;
      if (state.current === 'playing') {
        const [p1, p2] = p.current;
        const control: [[string, string, string], [string, string, string]] = [['a','d','w'], ['arrowleft','arrowright','arrowup']];
        [p1, p2].forEach((player, index) => {
          const [left, right, jump] = control[index]; player.vx = 0;
          if (keys.current.has(left)) { player.vx = -4.4; player.facing = -1; }
          if (keys.current.has(right)) { player.vx = 4.4; player.facing = 1; }
          if (keys.current.has(jump) && player.y >= FLOOR - PLAYER - 1) player.vy = -7.6;
          player.vy += GRAVITY * dt; player.x += player.vx * dt; player.y += player.vy * dt;
          player.x = Math.max(12, Math.min(W - PLAYER - 12, player.x));
          if (player.y > FLOOR - PLAYER) { player.y = FLOOR - PLAYER; player.vy = 0; }
        });
        const ballState = b.current; ballState.vy += GRAVITY * dt; ballState.x += ballState.vx * dt; ballState.y += ballState.vy * dt; ballState.vx *= Math.pow(.995, dt);
        if (ballState.y > FLOOR - 12) { ballState.y = FLOOR - 12; ballState.vy *= -.58; if (Math.abs(ballState.vy) < 1) ballState.vy = 0; }
        if (ballState.x < 12) { ballState.x = 12; ballState.vx *= -.72; }
        if (ballState.x > W - 12) { ballState.x = W - 12; ballState.vx *= -.72; }
        [p1, p2].forEach((player, index) => {
          const dx = ballState.x - (player.x + PLAYER / 2), dy = ballState.y - (player.y + 20);
          if (Math.hypot(dx, dy) < 35 && ballState.vy > -2) { ballState.vx += (dx > 0 ? 2.1 : -2.1); ballState.vy = -4.2; ballState.vx += player.vx * .35; setMessage(`PLAYER ${index + 1} CHALLENGES!`); }
        });
        const goalLeft = ballState.x < 20 && ballState.y > FLOOR - 86;
        const goalRight = ballState.x > W - 20 && ballState.y > FLOOR - 86;
        if (goalLeft || goalRight) {
          const scorer = goalLeft ? 2 : 1; p.current[scorer - 1].score += 1; const next = p.current.map(player => player.score) as [number, number]; setScore(next);
          trackGame('game_finish', 'mini-football', { scorer, score: next[scorer - 1] });
          if (next[scorer - 1] >= WIN) { state.current = 'over'; setPhase('over'); setWinner(scorer); setMessage(`PLAYER ${scorer} WINS!`); }
          else { ballState.x = W / 2; ballState.y = 220; ballState.vx = scorer === 1 ? -2 : 2; ballState.vy = -2; setMessage(`GOAL! PLAYER ${scorer}`); }
        }
      }
      draw(); raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const touch = (player: 1 | 2, action: 'left' | 'right' | 'jump' | 'kick') => {
    if (state.current !== 'playing') { if (action === 'kick') reset(true); return; }
    if (action === 'kick') { kick(player); return; }
    const map = player === 1 ? { left: 'a', right: 'd', jump: 'w' } : { left: 'arrowleft', right: 'arrowright', jump: 'arrowup' };
    const key = map[action as 'left' | 'right' | 'jump']; keys.current.add(key); window.setTimeout(() => keys.current.delete(key), action === 'jump' ? 130 : 85);
  };

  return <main className="football-page"><div className="football-shell">
    <header><a href="/gamehub/">← Games</a><div><span>2 PLAYER · SPORTS</span><h1>⚽ MINI FOOTBALL</h1></div><div className="score">{score[0]} <i>:</i> {score[1]}</div></header>
    <section className="football-card"><div className="football-info"><span>LOCAL MULTIPLAYER</span><strong>{message}</strong><small>P1: A/D move · W jump · F kick &nbsp; | &nbsp; P2: ←/→ move · ↑ jump · L kick</small></div>
      <div className="football-stage"><canvas ref={canvasRef} width={W} height={H} aria-label="Mini football game court" />{phase !== 'playing' && <div className="football-overlay"><div>⚽</div><h2>{phase === 'over' ? `PLAYER ${winner} WINS!` : 'MINI FOOTBALL'}</h2><p>{phase === 'over' ? `${score[0]} — ${score[1]} · Rematch instantly.` : 'Kick, jump and defend. First to 3 goals wins.'}</p><button className="primary" onClick={() => reset(true)}>{phase === 'over' ? 'REMATCH' : 'START MATCH'}</button></div>}</div>
      <div className="football-touch"><div><span>P1</span><button onPointerDown={() => touch(1,'left')}>←</button><button onPointerDown={() => touch(1,'right')}>→</button><button onPointerDown={() => touch(1,'jump')}>↑</button><button className="shoot" onPointerDown={() => touch(1,'kick')}>KICK</button></div><div><span>P2</span><button onPointerDown={() => touch(2,'left')}>←</button><button onPointerDown={() => touch(2,'right')}>→</button><button onPointerDown={() => touch(2,'jump')}>↑</button><button className="shoot" onPointerDown={() => touch(2,'kick')}>KICK</button></div></div>
    </section><p className="football-note">Two players. One device. Zero setup. Built for quick rematches.</p>
  </div></main>;
}
