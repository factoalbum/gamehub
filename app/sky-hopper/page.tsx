'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import './sky-hopper.css';
import { trackGame } from '../lib/analytics';

const W = 900, H = 520, GROUND = 470;
type State = 'ready' | 'play' | 'over';
type Obstacle = { x: number; gap: number; passed?: boolean };

function readBest() {
  try { return Number(localStorage.getItem('gamehub:sky-hopper-best') || 0); } catch { return 0; }
}

export default function SkyHopper() {
  const canvas = useRef<HTMLCanvasElement>(null), raf = useRef<number>(), bird = useRef({ x: 170, y: 250, vy: 0 });
  const obstacles = useRef<Obstacle[]>([]), scoreRef = useRef(0), state = useRef<State>('ready'), startedRef = useRef(false);
  const [ui, setUi] = useState<State>('ready'), [score, setScore] = useState(0), [best, setBest] = useState(0);

  const reset = useCallback((start = true) => {
    bird.current = { x: 170, y: 250, vy: 0 };
    obstacles.current = [{ x: 620, gap: 210 }, { x: 980, gap: 330 }];
    scoreRef.current = 0;
    setScore(0);
    state.current = start ? 'play' : 'ready';
    setUi(state.current);
    if (start) {
      trackGame(startedRef.current ? 'game_restart' : 'game_start', 'sky-hopper');
      startedRef.current = true;
    }
  }, []);

  const finish = useCallback(() => {
    state.current = 'over';
    setUi('over');
    setBest(current => {
      const next = Math.max(current, scoreRef.current);
      try { localStorage.setItem('gamehub:sky-hopper-best', String(next)); } catch { /* storage can be unavailable */ }
      return next;
    });
    trackGame('game_finish', 'sky-hopper', { score: scoreRef.current });
  }, []);

  const flap = useCallback(() => {
    if (state.current !== 'play') { reset(true); return; }
    bird.current.vy = -8.2;
  }, [reset]);

  useEffect(() => {
    setBest(readBest());
    trackGame('game_open', 'sky-hopper');
    const key = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); flap(); }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [flap]);

  useEffect(() => {
    const c = canvas.current, ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); addEventListener('resize', resize);
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.67 || 1); last = now;
      const b = bird.current;
      if (state.current === 'play') {
        b.vy += .42 * dt; b.y += b.vy * dt;
        obstacles.current.forEach(o => o.x -= 4.4 * dt);
        if (obstacles.current[0]?.x < -90) obstacles.current.shift();
        const lastX = obstacles.current[obstacles.current.length - 1]?.x ?? 620;
        if (lastX < 590) obstacles.current.push({ x: lastX + 360, gap: 100 + Math.random() * 290 });
        for (const o of obstacles.current) {
          if (o.x + 74 < b.x && !o.passed) { o.passed = true; scoreRef.current++; setScore(scoreRef.current); }
          const hitX = b.x + 18 > o.x && b.x - 18 < o.x + 74;
          const gapTop = o.gap - 85, gapBottom = o.gap + 85;
          if (hitX && (b.y - 18 < gapTop || b.y + 18 > gapBottom)) { finish(); break; }
        }
        if (state.current === 'play' && (b.y < 18 || b.y > GROUND - 18)) finish();
      }
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1827'); g.addColorStop(1, '#102f32'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#173d35'; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = '#b7f34a'; for (const o of obstacles.current) { ctx.fillRect(o.x, 0, 74, o.gap - 85); ctx.fillRect(o.x, o.gap + 85, 74, GROUND - o.gap - 85); }
      ctx.fillStyle = '#78e4ff'; ctx.beginPath(); ctx.arc(b.x, b.y, 19, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#071019'; ctx.beginPath(); ctx.arc(b.x + 7, b.y - 5, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '700 26px system-ui'; ctx.fillText(String(scoreRef.current), W / 2 - 8, 50);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { removeEventListener('resize', resize); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [finish]);

  return <main className="sky-page"><div className="sky-shell"><header><a href="/gamehub/">← GAMEHUB</a><span>ARCADE · ONE BUTTON</span><button onClick={() => reset(true)}>RESTART</button></header><div className="sky-score"><strong>{score}</strong><span>BEST {best}</span></div><div className="sky-stage"><canvas ref={canvas} width={W} height={H} aria-label="Sky Hopper game" onPointerDown={flap}/>{ui !== 'play' && <div className="sky-overlay"><span>☁️</span><h1>{ui === 'ready' ? 'SKY HOPPER' : 'GAME OVER'}</h1><p>{ui === 'ready' ? 'Tap, click or press Space to fly through the gaps.' : 'Score ' + score + '. Can you beat your best?'}</p><button onClick={() => reset(true)}>{ui === 'ready' ? 'START' : 'PLAY AGAIN'}</button></div>}</div><p className="sky-tip">TAP / CLICK / SPACE TO HOP · ONE MORE TRY</p></div></main>;
}
