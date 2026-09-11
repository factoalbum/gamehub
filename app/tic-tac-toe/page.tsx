'use client';

import { useMemo, useState } from 'react';
import './tic-tac-toe.css';

type Mark = 'X' | 'O' | null;
const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function winner(board: Mark[]) {
  for (const [a,b,c] of WIN_LINES) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  return null;
}

export default function TicTacToePage() {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Exclude<Mark, null>>('X');

  const win = useMemo(() => winner(board), [board]);
  const draw = !win && board.every(Boolean);
  const finished = Boolean(win || draw);

  function play(index: number) {
    if (finished || board[index]) return;
    const next = [...board];
    next[index] = turn;
    setBoard(next);
    if (!winner(next) && !next.every(Boolean)) setTurn(turn === 'X' ? 'O' : 'X');
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setTurn('X');
  }

  const status = win ? `Player ${win} wins!` : draw ? 'Draw game.' : `Player ${turn}'s turn`;

  return (
    <main className="ttt-page">
      <section className="ttt-shell" aria-label="Tic Tac Toe local multiplayer game">
        <a className="ttt-back" href="/gamehub/">← GameHub</a>
        <div className="ttt-kicker">CLASSIC · LOCAL 2 PLAYER</div>
        <h1>Tic Tac Toe</h1>
        <p className="ttt-subtitle">The tiny game that never needs a login. Pass the phone, or play side by side.</p>
        <div className="ttt-score"><span>Player X</span><strong>{status}</strong><span>Player O</span></div>
        <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
          {board.map((mark, index) => (
            <button key={index} className={`ttt-cell ${mark ? `mark-${mark.toLowerCase()}` : ''}`} onClick={() => play(index)} role="gridcell" aria-label={mark ? `Cell ${index + 1}: ${mark}` : `Cell ${index + 1}, empty`}>
              {mark}
            </button>
          ))}
        </div>
        <button className="ttt-reset" onClick={reset}>{finished ? 'REMATCH' : 'RESET GAME'}</button>
        <p className="ttt-hint">Tap a square · X starts · First to three in a row wins</p>
      </section>
    </main>
  );
}
