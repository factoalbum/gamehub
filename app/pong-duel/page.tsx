'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './pong-duel.css';
import { trackGame } from '../../lib/analytics';
import TwoPlayerTouchControls, { TouchAction } from '../../TwoPlayerTouchControls';

type Paddle = { y: number; score: number };
type Ball = { x: number; y: number; vx: number; vy: number };
const W = 900, H = 500, PADDLE_H = 92, PADDLE_W = 18, WIN = 7;
const initialPaddles = (): [Paddle, Paddle] => [
  { y: H / 2 - PADDLE_H / 2, score: 0 },
  { y: H / 2 - PADDLE_H / 2, score: 0 },
];
const initialBall = (): Ball => ({ x: W / 2, y: H / 2, vx: 6, vy: 3 });

export default function PongDuel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const keys = useRef(new Set<string>());
  const ps = useRef(initialPaddles());
  const ball = useRef(initialBall());
  const phase = useRef<'ready' | 'play' | 'over'>('ready');
  const raf = useRef<number | undefined>(undefined);
  const [state, setState] = useState<'ready' | 'play' | 'over'>('ready');
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState(0);

  const reset = useCallback((start = true) => {
    ps.current = initialPaddles();
    ball.current = initialBall();
    phase.current = start ? 'play' : 'ready';
    setState(start ? 'play' : 'ready');
    setScore([0, 0]);
    setWinner(0);
    if (start) trackGame('game_restart', 'pong-duel');
  }, []);

  const keyFor = (player: 1 | 2, action: TouchAction) =>
    player === 1
      ? ({ up: 'w', down: 's' } as Record<string, string>)[action]
      : ({ up: 'arrowup', down: 'arrowdown' } as Record<string, string>)[action];

  const touchPress = useCallback((player: 1 | 2, action: TouchAction) => {
    if (phase.current !== 'play') {
      if (action === 'action' || action === 'boost') reset(true);
      return;
    }
    if (action === 'up' || action === 'down') {
      const key = keyFor(player, action);
      if (key) keys.current.add(key);
    }
  }, [reset]);

  const touchRelease = useCallback((player: 1 | 2, action: TouchAction) => {
    if (action === 'up' || action === 'down') {
      const key = keyFor(player, action);
      if (key) keys.current.delete(key);
    }
  }, []);

  useEffect(() => {
    const d = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 's', 'arrowup', 'arrowdown', 'enter', ' '].includes(k)) e.preventDefault();
      keys.current.add(k);
      if ((k === 'enter' || k === ' ') && phase.current !== 'play') reset(true);
    };
    const u = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const clear = () => keys.current.clear();
    addEventListener('keydown', d);
    addEventListener('keyup', u);
    addEventListener('blur', clear);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clear();
    });
    return () => {
      removeEventListener('keydown', d);
      removeEventListener('keyup', u);
      removeEventListener('blur', clear);
    };
  }, [reset]);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.67);
      last = now;
      const p = ps.current, b = ball.current, k = keys.current;
      if (phase.current === 'play') {
        p[0].y += ((k.has('s') ? 7 : 0) - (k.has('w') ? 7 : 0)) * dt;
        p[1].y += ((k.has('arrowdown') ? 7 : 0) - (k.has('arrowup') ? 7 : 0)) * dt;
        p.forEach(x => x.y = Math.max(20, Math.min(H - PADDLE_H - 20, x.y)));
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y < 22 || b.y > H - 22) {
          b.y = Math.max(22, Math.min(H - 22, b.y));
          b.vy *= -1;
        }
        const hit = (px: number, py: number, left: boolean) =>
          b.x + (left ? -8 : 8) > px - (left ? 0 : PADDLE_W) &&
          b.x + (left ? -8 : 8) < px + (left ? PADDLE_W : 0) &&
          b.y > py - 10 && b.y < py + PADDLE_H + 10;
        if (b.vx < 0 && hit(42, p[0].y, true)) {
          b.x = 60; b.vx = Math.min(13, Math.abs(b.vx) + .45);
          b.vy += (b.y - (p[0].y + PADDLE_H / 2)) / 30;
        }
        if (b.vx > 0 && hit(W - 60 - PADDLE_W, p[1].y, false)) {
          b.x = W - 60 - PADDLE_W; b.vx = -Math.min(13, Math.abs(b.vx) + .45);
          b.vy += (b.y - (p[1].y + PADDLE_H / 2)) / 30;
        }
        if (b.x < -20) { p[1].score++; b.x = W / 2; b.y = H / 2; b.vx = -6; b.vy = Math.random() > .5 ? 3 : -3; }
        if (b.x > W + 20) { p[0].score++; b.x = W / 2; b.y = H / 2; b.vx = 6; b.vy = Math.random() > .5 ? 3 : -3; }
        if (p[0].score >= WIN || p[1].score >= WIN) {
          const w = p[0].score >= WIN ? 1 : 2;
          phase.current = 'over'; setState('over'); setWinner(w);
          trackGame('game_finish', 'pong-duel', { winner: w });
        }
        setScore([p[0].score, p[1].score]);
      }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#071019'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.setLineDash([12, 16]);
      ctx.beginPath(); ctx.moveTo(W / 2, 18); ctx.lineTo(W / 2, H - 18); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#b7f34a'; ctx.roundRect(42, ps.current[0].y, PADDLE_W, PADDLE_H, 9); ctx.fill();
      ctx.fillStyle = '#78e4ff'; ctx.roundRect(W - 60, ps.current[1].y, PADDLE_W, PADDLE_H, 9); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, 12, 0, Math.PI * 2); ctx.fill();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current !== undefined) cancelAnimationFrame(raf.current); };
  }, []);

  return <main className="pong-page"><div className="pong-shell"><header><a href="/gamehub/">← GAMEHUB</a><span>2 PLAYER · PONG</span><button onClick={() => reset(true)}>REMATCH</button></header><div className="pong-score" aria-live="polite" aria-atomic="true"><div><small>P1</small><strong>{score[0]}</strong></div><b aria-hidden="true">VS</b><div><small>P2</small><strong>{score[1]}</strong></div></div><div className="pong-court"><canvas ref={canvas} width={W} height={H} aria-label="Pong Duel game board" role="img"/>{state !== 'play' && <div className="pong-overlay" role="status" aria-live="polite"><span aria-hidden="true">{state === 'ready' ? '🏓' : winner === 1 ? '🥇' : '🥈'}</span><h1>{state === 'ready' ? 'PONG DUEL' : `PLAYER ${winner} WINS`}</h1><p>First to {WIN}. Hold your movement key to defend.</p><button onClick={() => reset(true)}>{state === 'ready' ? 'START MATCH' : 'PLAY AGAIN'}</button></div>}</div><TwoPlayerTouchControls onPress={touchPress} onRelease={touchRelease} upLabel="UP" showDown actionLabel="READY" actionLabel2="READY" /><p className="pong-tip">P1: W/S · P2: ↑/↓ · Hold movement. Touch both sides at once.</p></div></main>;
}
