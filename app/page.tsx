'use client';

import { useEffect, useRef, useState } from 'react';

type Game = { id: string; title: string; category: string; emoji: string; description: string; tag: string };

const games: Game[] = [
  { id: 'reflex', title: 'Reflex Rush', category: 'Arcade', emoji: '⚡', description: 'Test your reaction speed. How fast can you tap?', tag: 'NEW' },
  { id: 'memory-grid', title: 'Memory Grid', category: 'Brain', emoji: '🧠', description: 'Remember the pattern and beat your best score.', tag: 'HOT' },
  { id: 'snake', title: 'Snake', category: 'Classic', emoji: '🐍', description: 'The classic snake game. Eat, grow, survive.', tag: 'CLASSIC' },
  { id: 'number-merge', title: 'Number Merge', category: 'Puzzle', emoji: '🔢', description: 'Merge matching numbers and chase a new high score.', tag: 'POPULAR' },
  { id: 'color-match', title: 'Color Match', category: 'Puzzle', emoji: '🎨', description: 'Match fast before the clock runs out.', tag: 'FAST' },
  { id: 'stack-tower', title: 'Stack Tower', category: 'Arcade', emoji: '🏗️', description: 'Place blocks perfectly and build the tallest tower.', tag: 'SKILL' },
];

const categories = ['All', 'Arcade', 'Puzzle', 'Brain', 'Classic'];

function ReflexGame({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<'ready' | 'waiting' | 'go' | 'result'>('ready');
  const [time, setTime] = useState<number | null>(null);
  const start = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function begin() {
    setState('waiting'); setTime(null);
    const delay = 900 + Math.random() * 2200;
    timer.current = setTimeout(() => { start.current = performance.now(); setState('go'); }, delay);
  }
  function hit() {
    if (state === 'waiting') { if (timer.current) clearTimeout(timer.current); setState('result'); setTime(-1); }
    else if (state === 'go') { setTime(Math.round(performance.now() - start.current)); setState('result'); }
  }

  return <div className="game-shell">
    <div className="game-top"><button onClick={onExit} className="back">← Games</button><span>⚡ REFLEX RUSH</span><span className="pill">1 PLAYER</span></div>
    <div className={`reflex-board ${state === 'go' ? 'go' : ''}`} onClick={state === 'ready' || state === 'result' ? begin : hit} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') hit(); }}>
      {state === 'ready' && <><div className="target">⚡</div><h2>Ready?</h2><p>Click anywhere when the screen turns green.</p><button className="primary" onClick={(e) => { e.stopPropagation(); begin(); }}>START</button></>}
      {state === 'waiting' && <><div className="waiting-dot"/><h2>Wait for green...</h2><p>Don't click yet!</p></>}
      {state === 'go' && <><div className="target">⚡</div><h2>CLICK!</h2><p>NOW!</p></>}
      {state === 'result' && <>{time === -1 ? <><h2>Too early! 😅</h2><p>Wait for the green screen.</p></> : <><div className="result-time">{time}<small> ms</small></div><h2>{time! < 220 ? 'LIGHTNING FAST!' : time! < 350 ? 'Great reflexes!' : 'You can beat that!'}</h2></>}<button className="primary" onClick={(e) => { e.stopPropagation(); begin(); }}>TRY AGAIN</button></>}
    </div>
    <div className="game-stats"><span>Best: —</span><span>Average: —</span><span>Rounds: 1</span></div>
  </div>;
}

function MemoryGame({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState(1); const [active, setActive] = useState<number[]>([]); const [input, setInput] = useState<number[]>([]); const [playing, setPlaying] = useState(false); const [message, setMessage] = useState('');
  const startLevel = () => { const count = Math.min(2 + level, 12); const picks: number[] = []; while (picks.length < count) { const n = Math.floor(Math.random() * 25); if (!picks.includes(n)) picks.push(n); } setActive(picks); setInput([]); setPlaying(false); setMessage('Memorize!'); setTimeout(() => { setActive([]); setPlaying(true); setMessage('Your turn'); }, Math.max(850, 1700 - level * 45)); };
  const pick = (n: number) => { if (!playing || input.includes(n)) return; const next = [...input, n]; setInput(next); if (!active.includes(n)) { setPlaying(false); setMessage('Wrong tile!'); return; } if (next.length === active.length) { setPlaying(false); setMessage('Perfect!'); setTimeout(() => { setLevel(v => v + 1); startLevel(); }, 650); } };
  return <div className="game-shell"><div className="game-top"><button onClick={onExit} className="back">← Games</button><span>🧠 MEMORY GRID</span><span className="pill">LEVEL {level}</span></div><div className="memory-board">{Array.from({ length: 25 }, (_, n) => <button key={n} className={`memory-cell ${active.includes(n) ? 'lit' : ''} ${input.includes(n) ? 'picked' : ''}`} onClick={() => pick(n)} aria-label={`Grid tile ${n + 1}`}/>)}</div><div className="memory-message">{message || 'Press start to begin'}{!message && <button className="primary" onClick={startLevel}>START</button>}</div></div>;
}

function GameView({ game, onExit }: { game: Game; onExit: () => void }) { if (game.id === 'reflex') return <ReflexGame onExit={onExit}/>; if (game.id === 'memory-grid') return <MemoryGame onExit={onExit}/>; return <div className="game-shell"><div className="game-top"><button onClick={onExit} className="back">← Games</button><span>{game.emoji} {game.title.toUpperCase()}</span></div><div className="coming"><div>{game.emoji}</div><h2>{game.title}</h2><p>This game is coming next. We're building the GameHub library one game at a time.</p><button className="primary" onClick={onExit}>BROWSE GAMES</button></div></div>; }

export default function Home() {
  const [category, setCategory] = useState('All'); const [selected, setSelected] = useState<Game | null>(null); const [search, setSearch] = useState('');
  const filtered = games.filter(g => (category === 'All' || g.category === category) && (g.title + g.description).toLowerCase().includes(search.toLowerCase()));
  if (selected) return <GameView game={selected} onExit={() => setSelected(null)} />;
  return <main><nav><div className="logo"><span>G</span> GAMEHUB</div><div className="nav-links"><a href="#games">Games</a><a href="#categories">Categories</a></div><label className="search">⌕<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games..." aria-label="Search games"/></label></nav>
    <section className="hero"><div className="hero-copy"><div className="eyebrow">🎮 PLAY INSTANTLY · NO DOWNLOAD</div><h1>Find your next<br/><em>favorite game.</em></h1><p>Quick games. Big scores. Zero downloads. Pick a game and start playing.</p><a href="#games" className="primary hero-button">PLAY NOW ↓</a></div><div className="hero-art"><div className="orb orb-one">⚡</div><div className="orb orb-two">🧠</div><div className="orb orb-three">🐍</div><div className="orbit-card"><span>NEW</span><strong>REFLEX<br/>RUSH</strong><small>Can you beat 200ms?</small></div></div></section>
    <section className="content" id="games"><div className="section-head"><div><div className="eyebrow">DISCOVER</div><h2>Play something <em>fun.</em></h2></div><div className="filters" id="categories">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div></div><div className="game-grid">{filtered.map(game => <button className="game-card" key={game.id} onClick={() => setSelected(game)}><div className="card-art"><span className="game-emoji">{game.emoji}</span><span className="tag">{game.tag}</span></div><div className="card-copy"><div><h3>{game.title}</h3><p>{game.description}</p></div><span className="play">▶</span></div><span className="category-label">{game.category}</span></button>)}</div>{filtered.length === 0 && <div className="empty">No games found. Try another search.</div>}</section>
    <footer><div className="logo"><span>G</span> GAMEHUB</div><p>Small games. Big fun. More coming soon.</p><span>© 2026 GameHub</span></footer>
  </main>;
}
