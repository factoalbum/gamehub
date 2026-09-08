'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackGame } from '../lib/analytics';
import './minesweeper.css';

type Cell = { mine: boolean; count: number; revealed: boolean; flagged: boolean };
const SIZE = 9;
const MINES = 10;
const empty = (): Cell[] => Array.from({ length: SIZE * SIZE }, () => ({ mine: false, count: 0, revealed: false, flagged: false }));

function neighbours(i: number) {
  const x = i % SIZE, y = Math.floor(i / SIZE), out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) out.push(ny * SIZE + nx);
  }
  return out;
}

function buildBoard(first: number): Cell[] {
  const board = empty();
  const blocked = new Set([first, ...neighbours(first)]);
  const candidates = Array.from({ length: SIZE * SIZE }, (_, i) => i).filter(i => !blocked.has(i));
  for (let n = candidates.length - 1; n > 0; n--) { const j = Math.floor(Math.random() * (n + 1)); [candidates[n], candidates[j]] = [candidates[j], candidates[n]]; }
  candidates.slice(0, MINES).forEach(i => { board[i].mine = true; });
  board.forEach((cell, i) => { if (!cell.mine) cell.count = neighbours(i).filter(n => board[n].mine).length; });
  return board;
}

function reveal(board: Cell[], start: number): Cell[] {
  const next = board.map(c => ({ ...c }));
  const queue = [start], seen = new Set<number>();
  while (queue.length) {
    const i = queue.shift()!; if (seen.has(i)) continue; seen.add(i);
    if (next[i].flagged || next[i].mine) continue;
    next[i].revealed = true;
    if (next[i].count === 0) neighbours(i).forEach(n => { if (!seen.has(n) && !next[n].mine) queue.push(n); });
  }
  return next;
}

export default function Minesweeper() {
  const [board, setBoard] = useState<Cell[]>(empty);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [seconds, setSeconds] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const flags = useMemo(() => board.filter(c => c.flagged).length, [board]);

  useEffect(() => { const saved = Number(localStorage.getItem('gamehub:minesweeper-best') || 0); if (saved) setBest(saved); trackGame('game_open', 'minesweeper'); }, []);
  useEffect(() => { if (status !== 'playing') return; const id = setInterval(() => setSeconds(s => Math.min(999, s + 1)), 1000); return () => clearInterval(id); }, [status]);

  const reset = useCallback(() => { setBoard(empty()); setStarted(false); setStatus('ready'); setSeconds(0); trackGame('game_restart', 'minesweeper'); }, []);

  const finish = useCallback((next: Cell[], won: boolean) => {
    setBoard(next); setStatus(won ? 'won' : 'lost');
    if (won && (!best || seconds < best)) { setBest(seconds); localStorage.setItem('gamehub:minesweeper-best', String(seconds)); }
    trackGame('game_finish', 'minesweeper', { result: won ? 'win' : 'loss', score: seconds });
  }, [best, seconds]);

  function open(i: number) {
    if (status === 'won' || status === 'lost' || board[i]?.flagged) return;
    let next = board;
    if (!started) { next = buildBoard(i); setStarted(true); setStatus('playing'); trackGame('game_start', 'minesweeper'); }
    if (next[i].mine) { const shown = next.map(c => ({ ...c, revealed: c.mine ? true : c.revealed })); finish(shown, false); return; }
    next = reveal(next, i);
    const safe = next.filter(c => !c.mine && c.revealed).length;
    if (safe === SIZE * SIZE - MINES) { finish(next.map(c => c.mine ? { ...c, flagged: true } : c), true); } else setBoard(next);
  }

  function toggleFlag(e: React.MouseEvent, i: number) {
    e.preventDefault();
    if (status === 'won' || status === 'lost' || (!started && flags >= MINES)) return;
    setBoard(current => current.map((c, n) => n === i && !c.revealed && (!c.flagged || flags < MINES) ? { ...c, flagged: !c.flagged } : c));
  }

  const statusText = status === 'ready' ? 'Click any tile to start. Your first click is always safe.' : status === 'playing' ? 'Clear the board without hitting a mine.' : status === 'won' ? 'Board cleared. That was clean.' : 'Boom. The mines got you.';

  return <main className="mine-page">
    <header className="mine-top"><a className="mine-back" href="/gamehub/">← Games</a><strong>💣 MINESWEEPER</strong><span className="mine-best">BEST {best === null ? '—' : `${best}s`}</span></header>
    <section className="mine-hero"><div className="mine-kicker">CLASSIC · 9 × 9 · 10 MINES</div><h1>Clear the <em>minefield.</em></h1><p>{statusText}</p></section>
    <section className="mine-panel">
      <div className="mine-hud"><div><small>MINES</small><b>{String(MINES - flags).padStart(2, '0')}</b></div><div className="mine-face" aria-live="polite">{status === 'lost' ? '💥' : status === 'won' ? '😎' : status === 'playing' ? '😬' : '🙂'}</div><div><small>TIME</small><b>{String(seconds).padStart(3, '0')}</b></div></div>
      <div className="mine-board" aria-label="Minesweeper board">{board.map((cell, i) => <button key={i} className={`mine-cell ${cell.revealed ? 'revealed' : ''} ${cell.mine && status === 'lost' ? 'mine' : ''} n${cell.count}`} onClick={() => open(i)} onContextMenu={e => toggleFlag(e, i)} aria-label={cell.flagged ? 'Flagged tile' : cell.revealed ? `${cell.count || 'empty'} revealed tile` : 'Hidden tile'}>{cell.revealed && cell.mine ? '✹' : cell.flagged && !cell.revealed ? '⚑' : cell.revealed && cell.count ? cell.count : ''}</button>)}</div>
      <div className="mine-actions"><button className="primary" onClick={reset}>{status === 'ready' ? 'START GAME' : 'NEW GAME'}</button><span>🖱️ Right-click to flag · 📱 Tap a tile to reveal</span></div>
      {status !== 'ready' && <div className={`mine-result ${status}`}><strong>{status === 'won' ? `YOU WIN · ${seconds}s` : status === 'lost' ? 'GAME OVER' : ''}</strong>{status === 'won' && best === seconds ? <span>🏆 New personal best!</span> : status === 'lost' ? <span>Find the safe tiles and try again.</span> : null}</div>}
    </section>
    <a className="mine-home" href="/gamehub/">← Back to GameHub</a>
  </main>;
}
