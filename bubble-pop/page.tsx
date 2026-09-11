'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './bubble-pop.css';
import { trackGame } from '../lib/analytics';

type Bubble = { x: number; y: number; r: number; vx: number; vy: number; hue: number; value: number };
const W = 760;
const H = 520;
const ROUND_MS = 45_000;

function makeBubble(): Bubble {
  const r = 16 + Math.random() * 24;
  return { x: r + Math.random() * (W - r * 2), y: r + Math.random() * (H - r * 2), r, vx: (Math.random() - .5) * 1.4, vy: (Math.random() - .5) * 1.4, hue: Math.floor(Math.random() * 360), value: Math.max(5, Math.round(34 - r / 2)) };
}

export default function BubblePopPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const stateRef = useRef({ running: false, score: 0, combo: 0, best: 0, timeLeft: ROUND_MS, bubbles: Array.from({ length: 13 }, makeBubble) });
  const [status, setStatus] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [best, setBest] = useState(0);

  useEffect(() => {
    setBest(Number(localStorage.getItem('gamehub:bubble-pop-best') || 0));
    trackGame('game_open', 'bubble-pop');
  }, []);

  const sync = useCallback(() => {
    const s = stateRef.current;
    setScore(s.score); setCombo(s.combo); setTimeLeft(s.timeLeft);
  }, []);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.running = true; s.score = 0; s.combo = 0; s.timeLeft = ROUND_MS; s.bubbles = Array.from({ length: 13 }, makeBubble);
    sync(); setStatus('playing'); trackGame('game_start', 'bubble-pop');
  }, [sync]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.aspectRatio = `${W}/${H}`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener('resize', resize);
    let last = performance.now();
    const tick = (now: number) => {
      const elapsedMs = Math.max(0, now - last);
      const dt = Math.min(2, elapsedMs / 16.67 || 1);
      last = now;
      const s = stateRef.current;
      if (s.running) {
        // Use the real elapsed wall-clock time for the countdown so throttled/background tabs cannot stretch a 45s round.
        s.timeLeft -= elapsedMs;
        for (const b of s.bubbles) {
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.x < b.r || b.x > W - b.r) { b.vx *= -1; b.x = Math.max(b.r, Math.min(W - b.r, b.x)); }
          if (b.y < b.r || b.y > H - b.r) { b.vy *= -1; b.y = Math.max(b.r, Math.min(H - b.r, b.y)); }
        }
        if (s.timeLeft <= 0) {
          s.timeLeft = 0; s.running = false;
          const next = Math.max(s.best, s.score); s.best = next; setBest(next); localStorage.setItem('gamehub:bubble-pop-best', String(next));
          setStatus('over'); trackGame('game_finish', 'bubble-pop', { score: s.score, combo: s.combo });
        }
        sync();
      }
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#111827'); bg.addColorStop(1, '#070a10'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(120,228,255,.07)'; for (let x = 20; x < W; x += 38) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 20; y < H; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      for (const b of s.bubbles) {
        const g = ctx.createRadialGradient(b.x - b.r * .35, b.y - b.r * .4, 2, b.x, b.y, b.r);
        g.addColorStop(0, `hsla(${b.hue},100%,92%,.95)`); g.addColorStop(.25, `hsla(${b.hue},88%,68%,.9)`); g.addColorStop(1, `hsla(${b.hue},82%,42%,.72)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(b.x - b.r * .3, b.y - b.r * .3, Math.max(2, b.r * .12), 0, Math.PI * 2); ctx.fill();
      }
      if (!s.running) { ctx.fillStyle = 'rgba(5,7,11,.62)'; ctx.fillRect(0, 0, W, H); ctx.textAlign = 'center'; ctx.fillStyle = '#f7f9fc'; ctx.font = '800 32px sans-serif'; ctx.fillText(status === 'over' ? 'TIME UP' : 'BUBBLE POP', W / 2, H / 2 - 12); ctx.fillStyle = '#aeb7c8'; ctx.font = '600 15px sans-serif'; ctx.fillText(status === 'over' ? `Score ${s.score} · Best ${s.best || '—'}` : 'Pop fast. Build combos. Beat your best.', W / 2, H / 2 + 20); }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('resize', resize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [sync, status]);

  const pop = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s.running) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * W / rect.width;
    const y = (event.clientY - rect.top) * H / rect.height;
    for (let i = s.bubbles.length - 1; i >= 0; i--) {
      const b = s.bubbles[i];
      if (Math.hypot(x - b.x, y - b.y) <= b.r) {
        s.combo += 1; s.score += b.value + Math.min(30, s.combo * 2); s.bubbles[i] = makeBubble(); sync(); return;
      }
    }
    s.combo = 0; sync();
  };

  return <main className="bubble-page"><div className="bubble-shell"><div className="bubble-top"><a href="/gamehub/">← GAMES</a><span>🫧 BUBBLE POP</span><b>{Math.ceil(timeLeft / 1000)}s · {score} · ×{combo}</b></div><div className="bubble-stage"><canvas ref={canvasRef} width={W} height={H} onPointerDown={pop} aria-label="Bubble Pop game"/></div><div className="bubble-actions"><button onClick={start}>{status === 'over' ? 'PLAY AGAIN' : status === 'playing' ? 'RESTART RUN' : 'START GAME'}</button><p>Tap or click bubbles · Chain pops for bigger scores · 45 seconds</p></div></div></main>;
}
