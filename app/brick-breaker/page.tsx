'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import '../../globals.css';
import '../../polish.css';
import './brick-breaker.css';

type Brick = { x: number; y: number; alive: boolean; hits: number };

const WIDTH = 760;
const HEIGHT = 520;
const PADDLE_W = 110;
const PADDLE_H = 13;
const BALL_R = 8;

function makeBricks(level: number): Brick[] {
  const cols = Math.min(10, 7 + Math.floor((level - 1) / 2));
  const rows = Math.min(6, 4 + Math.floor(level / 3));
  const gap = 7;
  const side = 28;
  const brickW = (WIDTH - side * 2 - gap * (cols - 1)) / cols;
  const bricks: Brick[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      bricks.push({
        x: side + col * (brickW + gap),
        y: 54 + row * 27,
        alive: true,
        hits: level >= 4 && row < 2 ? 2 : 1,
      });
    }
  }
  return bricks;
}

export default function BrickBreakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const stateRef = useRef({
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    paddleX: WIDTH / 2 - PADDLE_W / 2,
    ball: { x: WIDTH / 2, y: HEIGHT - 55, vx: 3.6, vy: -4.2 },
    bricks: makeBricks(1),
  });
  const [status, setStatus] = useState<'ready' | 'playing' | 'paused' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(0);

  useEffect(() => {
    setBest(Number(localStorage.getItem('gamehub:brick-breaker-best') || 0));
  }, []);

  const sync = useCallback(() => {
    const s = stateRef.current;
    setScore(s.score); setLives(s.lives); setLevel(s.level);
  }, []);

  const resetBall = useCallback((serveDirection = -1) => {
    const s = stateRef.current;
    const speed = 4.1 + (s.level - 1) * 0.28;
    const angle = (Math.random() * 0.8 - 0.4);
    s.ball = { x: WIDTH / 2, y: HEIGHT - 58, vx: speed * angle, vy: speed * serveDirection };
  }, []);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.running = true; s.paused = false; s.score = 0; s.lives = 3; s.level = 1;
    s.paddleX = WIDTH / 2 - PADDLE_W / 2; s.bricks = makeBricks(1);
    resetBall(); sync(); setStatus('playing');
  }, [resetBall, sync]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.paused = !s.paused;
    setStatus(s.paused ? 'paused' : 'playing');
  }, []);

  const movePaddle = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = WIDTH / rect.width;
    const x = (clientX - rect.left) * scale;
    stateRef.current.paddleX = Math.max(0, Math.min(WIDTH - PADDLE_W, x - PADDLE_W / 2));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      bg.addColorStop(0, '#0d1420'); bg.addColorStop(1, '#080b11');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = 'rgba(183,243,74,.06)'; ctx.lineWidth = 1;
      for (let x = 0; x < WIDTH; x += 38) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }
      for (let y = 0; y < HEIGHT; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }

      for (const brick of s.bricks) if (brick.alive) {
        const cols = Math.min(10, 7 + Math.floor((s.level - 1) / 2));
        const gap = 7; const side = 28;
        const brickW = (WIDTH - side * 2 - gap * (cols - 1)) / cols;
        const height = 20;
        ctx.fillStyle = brick.hits > 1 ? '#78e4ff' : '#b7f34a';
        ctx.globalAlpha = brick.hits > 1 ? 0.78 : 0.92;
        ctx.beginPath(); ctx.roundRect(brick.x, brick.y, brickW, height, 6); ctx.fill();
        ctx.globalAlpha = 1;
        if (brick.hits > 1) { ctx.fillStyle = '#071016'; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('2', brick.x + brickW / 2, brick.y + 14); }
      }

      ctx.fillStyle = '#f7f9fc'; ctx.beginPath(); ctx.roundRect(s.paddleX, HEIGHT - 34, PADDLE_W, PADDLE_H, 7); ctx.fill();
      ctx.shadowColor = '#b7f34a'; ctx.shadowBlur = 16; ctx.fillStyle = '#b7f34a';
      ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

      if (s.paused || !s.running) {
        ctx.fillStyle = 'rgba(5,7,11,.64)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#f7f9fc'; ctx.textAlign = 'center'; ctx.font = '800 32px sans-serif';
        ctx.fillText(s.paused ? 'PAUSED' : status === 'over' ? 'GAME OVER' : 'BRICK BREAKER', WIDTH / 2, HEIGHT / 2 - 12);
        ctx.font = '600 15px sans-serif'; ctx.fillStyle = '#aeb7c8';
        ctx.fillText(s.paused ? 'Press P or tap pause to resume' : status === 'over' ? 'Break the wall. Beat your best.' : 'Start a run and clear every level.', WIDTH / 2, HEIGHT / 2 + 20);
      }
    };

    const tick = () => {
      const s = stateRef.current;
      if (s.running && !s.paused) {
        const prev = { ...s.ball };
        s.ball.x += s.ball.vx; s.ball.y += s.ball.vy;
        if (s.ball.x <= BALL_R || s.ball.x >= WIDTH - BALL_R) { s.ball.x = Math.max(BALL_R, Math.min(WIDTH - BALL_R, s.ball.x)); s.ball.vx *= -1; }
        if (s.ball.y <= BALL_R) { s.ball.y = BALL_R; s.ball.vy *= -1; }

        const paddleY = HEIGHT - 34;
        if (s.ball.vy > 0 && s.ball.y + BALL_R >= paddleY && s.ball.y - BALL_R <= paddleY + PADDLE_H && s.ball.x >= s.paddleX && s.ball.x <= s.paddleX + PADDLE_W) {
          const hit = (s.ball.x - (s.paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
          const speed = Math.min(8.8, Math.hypot(s.ball.vx, s.ball.vy) * 1.015);
          s.ball.vx = speed * hit * 0.9; s.ball.vy = -Math.max(3.3, Math.sqrt(Math.max(1, speed * speed - s.ball.vx * s.ball.vx)));
          s.ball.y = paddleY - BALL_R - 1;
        }

        for (const brick of s.bricks) if (brick.alive) {
          const cols = Math.min(10, 7 + Math.floor((s.level - 1) / 2));
          const brickW = (WIDTH - 56 - 7 * (cols - 1)) / cols;
          if (s.ball.x + BALL_R >= brick.x && s.ball.x - BALL_R <= brick.x + brickW && s.ball.y + BALL_R >= brick.y && s.ball.y - BALL_R <= brick.y + 20) {
            brick.hits -= 1; if (brick.hits <= 0) { brick.alive = false; s.score += 10 * s.level; } else s.score += 4 * s.level;
            const fromSide = prev.x < brick.x || prev.x > brick.x + brickW;
            if (fromSide) s.ball.vx *= -1; else s.ball.vy *= -1;
            break;
          }
        }

        if (s.bricks.every(b => !b.alive)) {
          s.level += 1; s.score += 100 * s.level; s.bricks = makeBricks(s.level); resetBall(); sync();
        }

        if (s.ball.y - BALL_R > HEIGHT) {
          s.lives -= 1; sync();
          if (s.lives <= 0) {
            s.running = false; setStatus('over');
            setBest(prevBest => { const next = Math.max(prevBest, s.score); localStorage.setItem('gamehub:brick-breaker-best', String(next)); return next; });
          } else resetBall();
        }
        sync();
      }
      draw();
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [resetBall, sync, status]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D', 'p', 'P', ' '].includes(e.key)) e.preventDefault();
      const s = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') s.paddleX = Math.max(0, s.paddleX - 34);
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') s.paddleX = Math.min(WIDTH - PADDLE_W, s.paddleX + 34);
      if (e.key.toLowerCase() === 'p' || e.key === ' ') togglePause();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [togglePause]);

  const exit = () => { window.location.href = '/gamehub/'; };

  return <main className="brick-page">
    <div className="game-shell brick-shell">
      <div className="game-top"><button onClick={exit} className="back">← <span>Games</span></button><span className="game-title">🧱 BRICK BREAKER</span><span className="pill">LEVEL {level} · BEST {best || '—'}</span></div>
      <div className="brick-stage" onMouseMove={e => movePaddle(e.clientX)} onTouchMove={e => { const touch = e.touches[0]; if (touch) movePaddle(touch.clientX); }}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Brick Breaker game" />
      </div>
      <div className="brick-controls"><span>🏆 {score}</span><span>❤️ {lives}</span><span>⚡ Level {level}</span><button onClick={togglePause} disabled={status !== 'playing'}>{status === 'paused' ? 'RESUME' : 'PAUSE'}</button></div>
      <div className="brick-actions"><button className="primary" onClick={start}>{status === 'over' ? 'PLAY AGAIN' : status === 'playing' || status === 'paused' ? 'RESTART RUN' : 'START GAME'}</button><p>Move with mouse/touch or ← → · P to pause · Clear the wall to level up.</p></div>
    </div>
  </main>;
}
