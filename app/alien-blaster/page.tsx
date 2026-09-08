'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './alien-blaster.css';
import { trackGame } from '../lib/analytics';

type Enemy = { x: number; y: number; vx: number; alive: boolean; row: number };
type Shot = { x: number; y: number; vy: number };
const W = 760, H = 520;

function makeWave(wave: number): Enemy[] {
  const cols = Math.min(9, 6 + Math.floor(wave / 3));
  const rows = Math.min(5, 2 + Math.floor(wave / 4));
  const gap = 58;
  const startX = W / 2 - ((cols - 1) * gap) / 2;
  return Array.from({ length: cols * rows }, (_, i) => ({ x: startX + (i % cols) * gap, y: 62 + Math.floor(i / cols) * 42, vx: 1.1 + wave * 0.06, alive: true, row: Math.floor(i / cols) }));
}

export default function AlienBlasterPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const fireHeld = useRef(false);
  const stateRef = useRef({ running: false, score: 0, lives: 3, wave: 1, playerX: W / 2, shots: [] as Shot[], enemies: makeWave(1), enemyDir: 1, cooldown: 0, best: 0 });
  const keys = useRef(new Set<string>());
  const [status, setStatus] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [best, setBest] = useState(0);

  useEffect(() => {
    setBest(Number(localStorage.getItem('gamehub:alien-blaster-best') || 0));
    trackGame('game_open', 'alien-blaster');
  }, []);

  const sync = useCallback(() => { const s = stateRef.current; setScore(s.score); setLives(s.lives); setWave(s.wave); }, []);
  const start = useCallback(() => {
    const s = stateRef.current;
    s.running = true; s.score = 0; s.lives = 3; s.wave = 1; s.playerX = W / 2; s.shots = []; s.enemies = makeWave(1); s.enemyDir = 1; s.cooldown = 0;
    fireHeld.current = false; sync(); setStatus('playing'); trackGame('game_start', 'alien-blaster');
  }, [sync]);
  const shoot = useCallback(() => {
    const s = stateRef.current;
    if (!s.running || s.cooldown > 0) return;
    s.shots.push({ x: s.playerX, y: H - 64, vy: -9 }); s.cooldown = 9;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'a', 'd', ' ', 'enter'].includes(k)) e.preventDefault();
      if (k === 'arrowleft' || k === 'a') keys.current.add('left');
      if (k === 'arrowright' || k === 'd') keys.current.add('right');
      if (k === ' ' || k === 'f') { fireHeld.current = true; shoot(); }
      if (k === 'enter' && !stateRef.current.running) start();
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.current.delete('left');
      if (k === 'arrowright' || k === 'd') keys.current.delete('right');
      if (k === ' ' || k === 'f') fireHeld.current = false;
    };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onUp); };
  }, [shoot, start]);

  useEffect(() => {
    const c = canvasRef.current, ctx = c?.getContext('2d'); if (!c || !ctx) return;
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); c.width = W * dpr; c.height = H * dpr; c.style.aspectRatio = `${W}/${H}`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener('resize', resize);
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.67 || 1); last = now;
      const s = stateRef.current;
      if (s.running) {
        if (keys.current.has('left')) s.playerX -= 5.5 * dt;
        if (keys.current.has('right')) s.playerX += 5.5 * dt;
        s.playerX = Math.max(28, Math.min(W - 28, s.playerX));
        s.cooldown = Math.max(0, s.cooldown - dt);
        if (fireHeld.current) shoot();
        for (const shot of s.shots) shot.y += shot.vy * dt;
        s.shots = s.shots.filter(shot => shot.y > -20);
        const alive = s.enemies.filter(e => e.alive);
        let edge = false;
        for (const e of alive) { e.x += e.vx * s.enemyDir * dt; if (e.x > W - 28 || e.x < 28) edge = true; }
        if (edge) { s.enemyDir *= -1; alive.forEach(e => e.y += 15); }
        for (const shot of s.shots) for (const enemy of s.enemies) if (enemy.alive && Math.hypot(shot.x - enemy.x, shot.y - enemy.y) < 17) { enemy.alive = false; shot.y = -99; s.score += 10 + (4 - enemy.row) * 3; }
        s.shots = s.shots.filter(shot => shot.y > -50);
        if (s.enemies.some(e => e.alive && e.y > H - 115)) { s.lives = 0; s.running = false; setStatus('over'); trackGame('game_finish', 'alien-blaster', { score: s.score, wave: s.wave }); }
        if (s.enemies.every(e => !e.alive)) { s.wave++; s.enemies = makeWave(s.wave); s.enemyDir = 1; s.shots = []; }
        if (s.lives <= 0) { s.running = false; setStatus('over'); const next = Math.max(s.best, s.score); s.best = next; setBest(next); localStorage.setItem('gamehub:alien-blaster-best', String(next)); }
        sync();
      }
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#101625'); bg.addColorStop(1, '#070a10'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(120,228,255,.08)'; ctx.lineWidth = 1; for (let x = 20; x < W; x += 38) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 20; y < H; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      for (const e of s.enemies) if (e.alive) { ctx.fillStyle = e.row % 2 ? '#78e4ff' : '#b7f34a'; ctx.beginPath(); ctx.roundRect(e.x - 15, e.y - 11, 30, 22, 6); ctx.fill(); ctx.fillStyle = '#071019'; ctx.fillRect(e.x - 8, e.y - 3, 5, 5); ctx.fillRect(e.x + 3, e.y - 3, 5, 5); ctx.fillRect(e.x - 5, e.y + 6, 10, 3); }
      ctx.fillStyle = '#f7f9fc'; for (const shot of s.shots) ctx.fillRect(shot.x - 2, shot.y - 9, 4, 12);
      ctx.fillStyle = '#f7f9fc'; ctx.beginPath(); ctx.moveTo(s.playerX, H - 36); ctx.lineTo(s.playerX - 25, H - 10); ctx.lineTo(s.playerX + 25, H - 10); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#b7f34a'; ctx.fillRect(s.playerX - 4, H - 50, 8, 18);
      if (!s.running) { ctx.fillStyle = 'rgba(5,7,11,.62)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#f7f9fc'; ctx.textAlign = 'center'; ctx.font = '800 32px sans-serif'; ctx.fillText(status === 'over' ? 'GAME OVER' : 'ALIEN BLASTER', W / 2, H / 2 - 12); ctx.font = '600 15px sans-serif'; ctx.fillStyle = '#aeb7c8'; ctx.fillText(status === 'over' ? `Score ${s.score} · Beat ${s.best || '—'}` : 'Clear every wave. Survive as long as you can.', W / 2, H / 2 + 20); }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('resize', resize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [sync, shoot, status]);

  const pressFire = () => { fireHeld.current = true; shoot(); };
  const releaseFire = () => { fireHeld.current = false; };
  const pressMove = (side: 'left' | 'right') => keys.current.add(side);
  const releaseMove = (side: 'left' | 'right') => keys.current.delete(side);

  return <main className="alien-page"><div className="alien-shell"><div className="alien-top"><a href="/gamehub/">← GAMES</a><span>☄️ ALIEN BLASTER</span><b>WAVE {wave} · {score} · ❤️ {lives}</b></div><div className="alien-stage"><canvas ref={canvasRef} width={W} height={H} aria-label="Alien Blaster game"/></div><div className="alien-controls"><button onPointerDown={() => pressMove('left')} onPointerUp={() => releaseMove('left')} onPointerCancel={() => releaseMove('left')}>←</button><button className="fire" onPointerDown={pressFire} onPointerUp={releaseFire} onPointerCancel={releaseFire} onPointerLeave={releaseFire}>HOLD FIRE</button><button onPointerDown={() => pressMove('right')} onPointerUp={() => releaseMove('right')} onPointerCancel={() => releaseMove('right')}>→</button></div><div className="alien-actions"><button onClick={start}>{status === 'over' ? 'PLAY AGAIN' : status === 'playing' ? 'RESTART RUN' : 'START GAME'}</button><p>Move with A/D or ← → · Hold Space/F or FIRE · Destroy waves to increase the challenge.</p></div></div></main>;
}
