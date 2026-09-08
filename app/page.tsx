'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Game = { id: string; title: string; category: string; emoji: string; description: string; tag: string; difficulty: string; accent: string };

const games: Game[] = [
  { id: 'reflex', title: 'Reflex Rush', category: 'Arcade', emoji: '⚡', description: 'React fast. Tap the instant the board turns green.', tag: 'NEW', difficulty: 'Easy', accent: 'lime' },
  { id: 'memory-grid', title: 'Memory Grid', category: 'Brain', emoji: '🧠', description: 'Remember every tile. Each level makes your brain work harder.', tag: 'HOT', difficulty: 'Medium', accent: 'blue' },
  { id: 'snake', title: 'Snake', category: 'Classic', emoji: '🐍', description: 'Eat, grow and survive. How long can you keep the snake alive?', tag: 'CLASSIC', difficulty: 'Easy', accent: 'green' },
  { id: 'number-merge', title: 'Number Merge', category: 'Puzzle', emoji: '🔢', description: 'Slide, merge and chase the legendary 2048 tile.', tag: 'POPULAR', difficulty: 'Hard', accent: 'purple' },
  { id: 'color-match', title: 'Color Match', category: 'Puzzle', emoji: '🎨', description: 'Spot the odd color before the timer catches you.', tag: 'FAST', difficulty: 'Medium', accent: 'pink' },
  { id: 'stack-tower', title: 'Stack Tower', category: 'Arcade', emoji: '🏗️', description: 'Drop blocks perfectly and build a tower that never ends.', tag: 'SKILL', difficulty: 'Medium', accent: 'orange' },
];

const categories = ['All', 'Arcade', 'Puzzle', 'Brain', 'Classic'];

function useBest(key: string) {
  const [best, setBest] = useState(0);
  useEffect(() => { const value = Number(localStorage.getItem(`gamehub:${key}`) || 0); setBest(value); }, [key]);
  const save = useCallback((value: number) => {
    setBest(prev => { const next = Math.max(prev, value); localStorage.setItem(`gamehub:${key}`, String(next)); return next; });
  }, [key]);
  return [best, save] as const;
}

function GameTop({ game, onExit, right }: { game: Game; onExit: () => void; right?: React.ReactNode }) {
  return <div className="game-top"><button onClick={onExit} className="back">← <span>Games</span></button><span className="game-title">{game.emoji} {game.title.toUpperCase()}</span>{right || <span className="pill">{game.difficulty.toUpperCase()}</span>}</div>;
}

function ReflexGame({ game, onExit }: { game: Game; onExit: () => void }) {
  const [state, setState] = useState<'ready' | 'waiting' | 'go' | 'result'>('ready');
  const [time, setTime] = useState<number | null>(null);
  const [rounds, setRounds] = useState(0);
  const [best, saveBest] = useBest('reflex-best');
  const start = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function begin() { setState('waiting'); setTime(null); setRounds(v => v + 1); const delay = 800 + Math.random() * 2300; timer.current = setTimeout(() => { start.current = performance.now(); setState('go'); }, delay); }
  function hit() {
    if (state === 'waiting') { if (timer.current) clearTimeout(timer.current); setState('result'); setTime(-1); return; }
    if (state === 'go') { const value = Math.round(performance.now() - start.current); setTime(value); saveBest(value === -1 ? 0 : value); setState('result'); }
  }
  const label = time === null ? '' : time < 0 ? 'TOO EARLY' : time < 200 ? '⚡ INSANE' : time < 280 ? '🔥 LIGHTNING FAST' : time < 380 ? 'NICE REFLEXES' : 'KEEP PRACTICING';
  return <div className="game-shell"><GameTop game={game} onExit={onExit} right={<span className="pill">BEST {best ? `${best}MS` : '—'}</span>} /><div className={`reflex-board ${state === 'go' ? 'go' : ''}`} onClick={state === 'ready' || state === 'result' ? begin : hit} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state === 'ready' || state === 'result' ? begin() : hit(); } }}>
    {state === 'ready' && <><div className="target">⚡</div><h2>How fast are you?</h2><p>Wait for green. Then hit anywhere as fast as possible.</p><button className="primary" onClick={e => { e.stopPropagation(); begin(); }}>START GAME</button></>}
    {state === 'waiting' && <><div className="waiting-dot"/><h2>WAIT...</h2><p>Don't touch the screen yet.</p></>}
    {state === 'go' && <><div className="target pulse">⚡</div><h2>NOW!</h2><p>TAP!</p></>}
    {state === 'result' && <>{time === -1 ? <><div className="result-icon">😅</div><h2>Too early!</h2><p>Patience. Wait for the green.</p></> : <><div className="result-time">{time}<small> ms</small></div><h2>{label}</h2><p>{best && time <= best ? '🏆 New personal best!' : 'One more round. Beat your score.'}</p></>}<button className="primary" onClick={e => { e.stopPropagation(); begin(); }}>PLAY AGAIN</button></>}
  </div><div className="game-stats"><span>🏆 Best: {best ? `${best} ms` : '—'}</span><span>🎯 Rounds: {rounds}</span><span>⚡ Goal: &lt; 200ms</span></div></div>;
}

function MemoryGame({ game, onExit }: { game: Game; onExit: () => void }) {
  const [level, setLevel] = useState(1); const [pattern, setPattern] = useState<number[]>([]); const [input, setInput] = useState<number[]>([]); const [playing, setPlaying] = useState(false); const [message, setMessage] = useState(''); const [best, saveBest] = useBest('memory-level'); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const startLevel = useCallback((nextLevel = level) => { const count = Math.min(2 + nextLevel, 15); const picks: number[] = []; while (picks.length < count) { const n = Math.floor(Math.random() * 25); if (!picks.includes(n)) picks.push(n); } setPattern(picks); setInput([]); setPlaying(false); setMessage('MEMORIZE'); timer.current = setTimeout(() => { setPattern([]); setPlaying(true); setMessage('YOUR TURN'); }, Math.max(750, 1600 - nextLevel * 55)); }, [level]);
  function pick(n: number) { if (!playing || input.includes(n)) return; const next = [...input, n]; setInput(next); if (!pattern.includes(n)) { setPlaying(false); setMessage('WRONG TILE — TRY AGAIN'); return; } if (next.length === pattern.length) { setPlaying(false); saveBest(level); setMessage('PERFECT!'); timer.current = setTimeout(() => { setLevel(v => v + 1); startLevel(level + 1); }, 650); } }
  return <div className="game-shell"><GameTop game={game} onExit={onExit} right={<span className="pill">LEVEL {level} · BEST {best || '—'}</span>} /><div className="memory-wrap"><div className="memory-intro"><strong>{message || 'Ready to test your memory?'}</strong><span>{pattern.length ? `${pattern.length} tiles` : 'The pattern gets harder every round.'}</span></div><div className="memory-board">{Array.from({ length: 25 }, (_, n) => <button key={n} className={`memory-cell ${pattern.includes(n) ? 'lit' : ''} ${input.includes(n) ? 'picked' : ''}`} onClick={() => pick(n)} aria-label={`Grid tile ${n + 1}`} />)}</div>{!message && <button className="primary" onClick={() => startLevel(1)}>START MEMORY</button>}{message === 'WRONG TILE — TRY AGAIN' && <button className="primary" onClick={() => { setLevel(1); startLevel(1); }}>RESTART</button>}</div></div>;
}

const makeSnake = () => [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
type Point = { x: number; y: number };
function SnakeGame({ game, onExit }: { game: Game; onExit: () => void }) {
  const [snake, setSnake] = useState<Point[]>(makeSnake); const [food, setFood] = useState<Point>({ x: 12, y: 7 }); const [dir, setDir] = useState<Point>({ x: 1, y: 0 }); const [score, setScore] = useState(0); const [running, setRunning] = useState(false); const [best, saveBest] = useBest('snake-best'); const dirRef = useRef(dir); const runningRef = useRef(running);
  useEffect(() => { dirRef.current = dir; }, [dir]); useEffect(() => { runningRef.current = running; }, [running]);
  const spawn = useCallback((body: Point[]) => { let p: Point; do { p = { x: Math.floor(Math.random() * 15), y: Math.floor(Math.random() * 15) }; } while (body.some(s => s.x === p.x && s.y === p.y)); return p; }, []);
  const start = () => { const initial = makeSnake(); setSnake(initial); setFood({ x: 12, y: 7 }); const d = { x: 1, y: 0 }; setDir(d); dirRef.current = d; setScore(0); setRunning(true); };
  useEffect(() => { const onKey = (e: KeyboardEvent) => { const map: Record<string, Point> = { ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 } }; const next = map[e.key]; if (!next || (next.x === -dirRef.current.x && next.y === -dirRef.current.y)) return; e.preventDefault(); setDir(next); dirRef.current = next; }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);
  useEffect(() => { if (!running) return; const id = setInterval(() => { setSnake(current => { const head = current[0]; const d = dirRef.current; const next = { x: head.x + d.x, y: head.y + d.y }; if (next.x < 0 || next.x >= 15 || next.y < 0 || next.y >= 15 || current.some(p => p.x === next.x && p.y === next.y)) { setRunning(false); saveBest(score); return current; } const ate = next.x === food.x && next.y === food.y; const nextSnake = [next, ...current]; if (ate) { setScore(v => v + 1); setFood(spawn(nextSnake)); return nextSnake; } nextSnake.pop(); return nextSnake; }); }, Math.max(75, 145 - Math.min(score, 40) * 2)); return () => clearInterval(id); }, [running, food, score, saveBest, spawn]);
  return <div className="game-shell"><GameTop game={game} onExit={onExit} right={<span className="pill">SCORE {score} · BEST {best}</span>} /><div className="snake-layout"><div className="snake-board" aria-label="Snake game board">{Array.from({ length: 225 }, (_, i) => { const x = i % 15, y = Math.floor(i / 15); const isHead = snake[0]?.x === x && snake[0]?.y === y; const isBody = snake.some((p, n) => n > 0 && p.x === x && p.y === y); const isFood = food.x === x && food.y === y; return <div key={i} className={`snake-cell ${isHead ? 'snake-head' : isBody ? 'snake-body' : isFood ? 'snake-food' : ''}`}>{isFood && '✦'}</div>; })}</div><div className="snake-side"><div className="score-big">{score}<small>FOOD EATEN</small></div>{!running && <div><h2>{score ? 'Game over!' : 'Ready to slither?'}</h2><p>{score ? `You scored ${score}. Can you beat ${best || 'your first'}?` : 'Use arrow keys or WASD. Eat ✦ and avoid the walls.'}</p><button className="primary" onClick={start}>{score ? 'PLAY AGAIN' : 'START SNAKE'}</button></div>} {running && <div className="tip">⌨️ Arrow keys / WASD<br/>🍎 Eat the stars<br/>💥 Don't hit yourself</div>}</div></div></div>;
}

const emptyGrid = () => Array.from({ length: 16 }, () => 0);
function addTile(grid: number[]) { const empty = grid.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0); if (!empty.length) return grid; const copy = [...grid]; copy[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < .9 ? 2 : 4; return copy; }
function move2048(grid: number[], direction: 'left' | 'right' | 'up' | 'down') {
  const rows = direction === 'left' || direction === 'right' ? [0, 1, 2, 3].map(r => grid.slice(r * 4, r * 4 + 4)) : [0, 1, 2, 3].map(c => [grid[c], grid[c + 4], grid[c + 8], grid[c + 12]]);
  let gained = 0; const result: number[][] = [];
  for (const original of rows) { const line = direction === 'right' || direction === 'down' ? [...original].reverse() : [...original]; const compact = line.filter(Boolean); const out: number[] = []; for (let i = 0; i < compact.length; i++) { if (compact[i] === compact[i + 1]) { const v = compact[i] * 2; out.push(v); gained += v; i++; } else out.push(compact[i]); } while (out.length < 4) out.push(0); result.push(direction === 'right' || direction === 'down' ? out.reverse() : out); }
  const next = emptyGrid(); if (direction === 'left' || direction === 'right') result.forEach((row, r) => row.forEach((v, c) => next[r * 4 + c] = v)); else result.forEach((col, c) => col.forEach((v, r) => next[r * 4 + c] = v)); return { grid: next, gained, changed: next.some((v, i) => v !== grid[i]) };
}
function NumberMergeGame({ game, onExit }: { game: Game; onExit: () => void }) {
  const initial = () => addTile(addTile(emptyGrid())); const [grid, setGrid] = useState(initial); const [score, setScore] = useState(0); const [over, setOver] = useState(false); const [best, saveBest] = useBest('2048-best');
  const reset = () => { setGrid(initial()); setScore(0); setOver(false); };
  const handle = useCallback((direction: 'left' | 'right' | 'up' | 'down') => { if (over) return; const result = move2048(grid, direction); if (!result.changed) { const stuck = (['left', 'right', 'up', 'down'] as const).every(d => !move2048(grid, d).changed); if (stuck) { setOver(true); saveBest(score); } return; } const next = addTile(result.grid); setGrid(next); const newScore = score + result.gained; setScore(newScore); saveBest(newScore); if (![0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].every((_, i) => !next.includes(2 ** (i + 11)))) { setOver(true); } }, [grid, over, score, saveBest]);
  useEffect(() => { const key = (e: KeyboardEvent) => { const map: Record<string, 'left' | 'right' | 'up' | 'down'> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' }; if (map[e.key]) { e.preventDefault(); handle(map[e.key]); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [handle]);
  return <div className="game-shell"><GameTop game={game} onExit={onExit} right={<span className="pill">SCORE {score.toLocaleString()} · BEST {best.toLocaleString()}</span>} /><div className="merge-wrap"><div className="merge-heading"><div><h2>Reach <em>2048</em>.</h2><p>Use your keyboard to slide. Same numbers merge into one.</p></div><button className="secondary" onClick={reset}>↻ NEW GAME</button></div><div className="merge-board">{grid.map((v, i) => <div key={i} className={`merge-tile tile-${v}`}>{v || ''}</div>)}{over && <div className="merge-over"><strong>GAME OVER</strong><span>Score {score.toLocaleString()}</span><button className="primary" onClick={reset}>TRY AGAIN</button></div>}</div><div className="mobile-arrows"><button onClick={() => handle('up')}>↑</button><div><button onClick={() => handle('left')}>←</button><button onClick={() => handle('down')}>↓</button><button onClick={() => handle('right')}>→</button></div></div></div></div>;
}

function ColorMatchGame({ game, onExit }: { game: Game; onExit: () => void }) {
  const colors = ['#b7f34a', '#78e4ff', '#ff72b6', '#a78bfa', '#ffb86b']; const [round, setRound] = useState(1); const [score, setScore] = useState(0); const [time, setTime] = useState(30); const [target, setTarget] = useState(0); const [odd, setOdd] = useState(1); const [running, setRunning] = useState(false); const [best, saveBest] = useBest('color-best');
  const newRound = useCallback(() => { setTarget(Math.floor(Math.random() * colors.length)); setOdd(Math.floor(Math.random() * 9)); }, []);
  useEffect(() => { newRound(); }, [newRound]);
  useEffect(() => { if (!running) return; const id = setInterval(() => setTime(t => { if (t <= 1) { setRunning(false); saveBest(score); return 0; } return t - 1; }), 1000); return () => clearInterval(id); }, [running, score, saveBest]);
  const start = () => { setRound(1); setScore(0); setTime(30); setRunning(true); newRound(); };
  const choose = (i: number) => { if (!running) return; if (i === odd) { setScore(s => s + 1); setRound(r => r + 1); newRound(); } else { setTime(t => Math.max(0, t - 2)); } };
  return <div className="game-shell"><GameTop game={game} onExit={onExit} right={<span className="pill">{time}s · BEST {best}</span>} /><div className="color-wrap"><div className="color-head"><div><div className="eyebrow">ROUND {round}</div><h2>Find the <em>odd</em> one.</h2></div><div className="timer-ring">{time}<small>SEC</small></div></div><div className="color-grid">{Array.from({ length: 9 }, (_, i) => <button key={i} aria-label="Color choice" onClick={() => choose(i)} style={{ background: colors[target], opacity: i === odd ? .68 : 1 }} />)}</div>{!running && <div className="color-overlay"><div className="result-icon">🎨</div><h2>{score ? `Score: ${score}` : 'Can you spot it?'}</h2><p>One tile is slightly different. Find it before time runs out.</p><button className="primary" onClick={start}>{score ? 'PLAY AGAIN' : 'START COLOR MATCH'}</button></div>}</div></div>;
}

function GameView({ game, onExit }: { game: Game; onExit: () => void }) {
  if (game.id === 'reflex') return <ReflexGame game={game} onExit={onExit} />;
  if (game.id === 'memory-grid') return <MemoryGame game={game} onExit={onExit} />;
  if (game.id === 'snake') return <SnakeGame game={game} onExit={onExit} />;
  if (game.id === 'number-merge') return <NumberMergeGame game={game} onExit={onExit} />;
  if (game.id === 'color-match') return <ColorMatchGame game={game} onExit={onExit} />;
  return <div className="game-shell"><GameTop game={game} onExit={onExit} /><div className="coming"><div>{game.emoji}</div><h2>{game.title}</h2><p>This one is next in the GameHub build queue. More games are coming fast.</p><button className="primary" onClick={onExit}>BROWSE GAMES</button></div></div>;
}

export default function Home() {
  const [category, setCategory] = useState('All'); const [selected, setSelected] = useState<Game | null>(null); const [search, setSearch] = useState('');
  const filtered = useMemo(() => games.filter(g => (category === 'All' || g.category === category) && (g.title + g.description).toLowerCase().includes(search.toLowerCase())), [category, search]);
  if (selected) return <GameView game={selected} onExit={() => setSelected(null)} />;
  return <main><nav><button className="logo" onClick={() => { setCategory('All'); setSearch(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><span>G</span> GAMEHUB</button><div className="nav-links"><a href="#games">Games</a><a href="#categories">Categories</a><a href="#why">Why GameHub</a></div><label className="search">⌕<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games..." aria-label="Search games" /></label></nav>
    <section className="hero"><div className="hero-copy"><div className="eyebrow">🎮 FREE TO PLAY · NO DOWNLOAD · INSTANT FUN</div><h1>One more game.<br /><em>Then one more.</em></h1><p>Quick games built for tiny breaks, big scores and that “I can beat that” feeling. Pick a game and jump straight in.</p><div className="hero-actions"><a href="#games" className="primary hero-button">PLAY NOW ↓</a><span>⚡ Fast loading · 📱 Mobile friendly</span></div></div><div className="hero-art"><div className="hero-glow" /><div className="orb orb-one">⚡</div><div className="orb orb-two">🧠</div><div className="orb orb-three">🐍</div><div className="orbit-card"><span>PLAYER 001</span><strong>WHAT'S<br />YOUR<br /><em>HIGH SCORE?</em></strong><small>Play. Fail. Retry. Win.</small><div className="mini-bar"><i /></div></div></div></section>
    <section className="content" id="games"><div className="section-head"><div><div className="eyebrow">THE ARCADE</div><h2>Pick a game. <em>Lose track of time.</em></h2><p className="section-sub">{filtered.length} games ready to play · no signup required</p></div><div className="filters" id="categories">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div></div><div className="game-grid">{filtered.map(game => <button className={`game-card ${game.accent}`} key={game.id} onClick={() => setSelected(game)}><div className="card-art"><span className="game-emoji">{game.emoji}</span><span className="tag">{game.tag}</span><span className="play-badge">▶</span></div><div className="card-copy"><div><h3>{game.title}</h3><p>{game.description}</p></div></div><div className="card-meta"><span>{game.category}</span><span>•</span><span>{game.difficulty}</span><strong>PLAY →</strong></div></button>)}</div>{filtered.length === 0 && <div className="empty"><div>🔎</div><h3>No game found</h3><p>Try “snake”, “puzzle” or clear your search.</p><button className="secondary" onClick={() => { setSearch(''); setCategory('All'); }}>SHOW ALL GAMES</button></div>}</section>
    <section className="why" id="why"><div><div className="eyebrow">BUILT FOR FUN</div><h2>Zero friction.<br /><em>Maximum replay.</em></h2></div><div className="why-grid"><article><strong>01</strong><h3>Instant start</h3><p>No accounts. No downloads. Click a card and you're playing.</p></article><article><strong>02</strong><h3>Beat yourself</h3><p>Personal bests are saved on your device so every round has a target.</p></article><article><strong>03</strong><h3>Short sessions</h3><p>Perfect for a 30-second break or a “just one more” hour.</p></article></div></section>
    <footer><div className="logo"><span>G</span> GAMEHUB</div><p>Small games. Big fun. More games every week.</p><span>© 2026 GameHub</span></footer>
  </main>;
}
