'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './football-random.css';
import { trackGame } from '../lib/analytics';
import TwoPlayerTapZones from '../TwoPlayerTapZones';

type Player = { x: number; y: number; vy: number; score: number; phase: number };
type Ball = { x: number; y: number; vx: number; vy: number };
const W = 900, H = 500, FLOOR = 430, GRAVITY = 0.42, WIN = 5;
const makePlayers = (): [Player, Player] => [
  { x: 180, y: FLOOR - 64, vy: 0, score: 0, phase: 0 },
  { x: 686, y: FLOOR - 64, vy: 0, score: 0, phase: Math.PI },
];
const makeBall = (): Ball => ({ x: W / 2, y: 190, vx: Math.random() > .5 ? 3.4 : -3.4, vy: -2 });

export default function FootballRandom() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const players = useRef<[Player, Player]>(makePlayers());
  const ball = useRef<Ball>(makeBall());
  const phase = useRef<'ready' | 'playing' | 'over'>('ready');
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const [uiPhase, setUiPhase] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState(0);
  const [message, setMessage] = useState('Tap your side to jump');

  const reset = useCallback((start = true) => {
    players.current = makePlayers(); ball.current = makeBall(); phase.current = start ? 'playing' : 'ready';
    setUiPhase(phase.current); setScore([0, 0]); setWinner(0); setMessage('Tap your side to jump');
    trackGame(start ? 'game_restart' : 'game_open', 'football-random');
  }, []);

  const jump = useCallback((who: 1 | 2) => {
    if (phase.current !== 'playing') { reset(true); return; }
    const p = players.current[who - 1];
    if (p.y >= FLOOR - 65) p.vy = -10.2;
  }, [reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'arrowup', 'f', 'l', 'enter', ' '].includes(k)) e.preventDefault();
      if (k === 'w' || k === 'f') jump(1);
      if (k === 'arrowup' || k === 'l') jump(2);
      if ((k === 'enter' || k === ' ') && phase.current !== 'playing') reset(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, reset]);

  useEffect(() => {
    trackGame('game_open', 'football-random');
    const c = canvasRef.current, ctx = c?.getContext('2d'); if (!c || !ctx) return;
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); c.width = W * dpr; c.height = H * dpr; c.style.aspectRatio = `${W}/${H}`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener('resize', resize);
    const scorePoint = (scorer: 0 | 1) => {
      players.current[scorer].score++;
      const s: [number, number] = [players.current[0].score, players.current[1].score]; setScore(s);
      if (s[scorer] >= WIN) {
        phase.current = 'over'; setUiPhase('over'); setWinner(scorer + 1); setMessage(`PLAYER ${scorer + 1} WINS!`);
        trackGame('game_finish', 'football-random', { scorer: scorer + 1, score: s[scorer] });
      } else { ball.current = makeBall(); ball.current.x = W / 2; ball.current.y = 170; setMessage(`GOAL! PLAYER ${scorer + 1}`); }
    };
    const drawPlayer = (p: Player, no: 1 | 2) => { const bob = Math.sin(p.phase) * 3; ctx.save(); ctx.translate(p.x, p.y + bob); ctx.fillStyle = no === 1 ? '#b7f34a' : '#78e4ff'; ctx.beginPath(); ctx.arc(0, -12, 17, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-16, 4, 32, 35); ctx.fillRect(-13, 39, 9, 23); ctx.fillRect(4, 39, 9, 23); ctx.restore(); };
    const draw = () => { ctx.clearRect(0, 0, W, H); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#162c20'); g.addColorStop(1, '#07100c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#14331f'; ctx.fillRect(0, FLOOR, W, H - FLOOR); ctx.strokeStyle = '#31533f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(W, FLOOR); ctx.stroke(); ctx.strokeStyle = '#294936'; ctx.setLineDash([9, 11]); ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, FLOOR); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = '#dfe9e2'; ctx.lineWidth = 5; ctx.strokeRect(0, FLOOR - 100, 55, 100); ctx.strokeRect(W - 55, FLOOR - 100, 55, 100); drawPlayer(players.current[0], 1); drawPlayer(players.current[1], 2); const b = ball.current; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, 14, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#b8c2c0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, Math.PI * 1.5); ctx.stroke(); };
    const tick = (time: number) => {
      const dt = Math.min(2, (time - last.current) / 16.67 || 1); last.current = time;
      if (phase.current === 'playing') {
        const ps = players.current, b = ball.current;
        ps.forEach((p, i) => { p.phase += 0.12 * dt; p.vy += GRAVITY * dt; p.y += p.vy * dt; if (p.y > FLOOR - 64) { p.y = FLOOR - 64; p.vy = 0; } p.x += (i === 0 ? 0.8 : -0.8) * Math.sin(p.phase * .55) * dt; });
        b.vy += GRAVITY * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= Math.pow(.997, dt);
        if (b.x < 14) { b.x = 14; b.vx = Math.abs(b.vx); } if (b.x > W - 14) { b.x = W - 14; b.vx = -Math.abs(b.vx); } if (b.y < 14) { b.y = 14; b.vy = Math.abs(b.vy); }
        ps.forEach((p, i) => { const dx = b.x - p.x, dy = b.y - (p.y + 8); if (Math.hypot(dx, dy) < 42) { const toward = i === 0 ? 1 : -1; b.vx = toward * (5.5 + Math.min(3, Math.abs(dx) / 10)); b.vy = -7.5 - Math.max(0, -p.vy * .18); b.x = p.x + toward * 35; b.y = p.y + 4; } });
        if (b.y > FLOOR - 3 && b.x < 65) scorePoint(1); if (b.y > FLOOR - 3 && b.x > W - 65) scorePoint(0); if (b.y > FLOOR + 35) { b.x = W / 2; b.y = 170; b.vx *= -1; b.vy = -4; }
      }
      draw(); raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('resize', resize); if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  return <main className="random-football-page"><div className="random-football-shell">
    <header className="random-football-top"><a href="/gamehub/multiplayer/">← MULTIPLAYER</a><div><span>GAMEHUB · RANDOM SPORTS</span><h1>⚽ FOOTBALL RANDOM</h1></div><div className="random-score"><b>{score[0]}</b><i>:</i><b>{score[1]}</b></div></header>
    <section className="random-card"><div className="random-head"><span>ONE BUTTON · 2 PLAYER</span><strong>{message}</strong><small>Tap your side to jump. Both players can jump at the same time.</small></div>
      <div className="random-stage"><canvas ref={canvasRef} width={W} height={H} aria-label="Football Random game"/><div className="side-label p1">P1</div><div className="side-label p2">P2</div>{uiPhase !== 'playing' && <div className="random-overlay"><span>⚽</span><h2>{uiPhase === 'over' ? `PLAYER ${winner} WINS!` : 'READY?'}</h2><p>{uiPhase === 'over' ? `${score[0]} — ${score[1]} · Rematch instantly.` : 'One tap is all you need. First to 5 goals wins.'}</p><button onClick={() => reset(true)}>{uiPhase === 'over' ? 'REMATCH' : 'START MATCH'}</button></div>}</div>
      <TwoPlayerTapZones onPress={jump} label="JUMP" />
      <p className="random-note">ONE DEVICE · TWO PLAYERS · SIMULTANEOUS TOUCH</p>
    </section>
  </div></main>;
}
