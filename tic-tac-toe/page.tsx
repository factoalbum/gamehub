'use client';

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import './tic-tac-toe.css';

type Mark = 'X' | 'O' | null;
const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function winningLine(board: Mark[]) {
  for (const line of WIN_LINES) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

export default function TicTacToePage() {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Exclude<Mark, null>>('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const cellsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const line = useMemo(() => winningLine(board), [board]);
  const win = line ? board[line[0]] : null;
  const draw = !win && board.every(Boolean);
  const finished = Boolean(win || draw);

  function play(index: number) {
    if (finished || board[index]) return;
    const next = [...board];
    next[index] = turn;
    setBoard(next);
    if (winningLine(next)) {
      setScores((current) => ({ ...current, [turn]: current[turn] + 1 }));
    } else if (!next.every(Boolean)) {
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const row = Math.floor(index / 3);
    const column = index % 3;
    let nextIndex = index;
    if (event.key === 'ArrowUp') nextIndex = ((row + 2) % 3) * 3 + column;
    if (event.key === 'ArrowDown') nextIndex = ((row + 1) % 3) * 3 + column;
    if (event.key === 'ArrowLeft') nextIndex = row * 3 + ((column + 2) % 3);
    if (event.key === 'ArrowRight') nextIndex = row * 3 + ((column + 1) % 3);
    if (nextIndex !== index) {
      event.preventDefault();
      cellsRef.current[nextIndex]?.focus();
    }
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setTurn('X');
  }

  function resetMatch() {
    setScores({ X: 0, O: 0 });
    reset();
  }

  const status = win ? `Player ${win} wins!` : draw ? 'Draw game.' : `Player ${turn}'s turn`;

  return (
    <main className="ttt-page">
      <section className="ttt-shell" aria-label="Tic Tac Toe local multiplayer game">
        <a className="ttt-back" href="/gamehub/">← GameHub</a>
        <div className="ttt-kicker">CLASSIC · LOCAL 2 PLAYER</div>
        <h1>Tic Tac Toe</h1>
        <p className="ttt-subtitle">The tiny game that never needs a login. Pass the phone, or play side by side.</p>
        <div className="ttt-score" aria-label={`Score: Player X ${scores.X}, Player O ${scores.O}`}>
          <span>Player X <strong>{scores.X}</strong></span>
          <strong aria-live="polite">{status}</strong>
          <span><strong>{scores.O}</strong> Player O</span>
        </div>
        <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
          {board.map((mark, index) => (
            <button
              key={index}
              ref={(element) => { cellsRef.current[index] = element; }}
              className={`ttt-cell ${mark ? `mark-${mark.toLowerCase()}` : ''} ${line?.includes(index) ? 'winning' : ''}`}
              onClick={() => play(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              role="gridcell"
              aria-label={mark ? `Cell ${index + 1}: ${mark}` : `Cell ${index + 1}, empty`}
            >
              {mark}
            </button>
          ))}
        </div>
        <div className="ttt-actions">
          <button className="ttt-reset" onClick={reset}>{finished ? 'REMATCH' : 'NEW ROUND'}</button>
          {finished && <button className="ttt-match-reset" onClick={resetMatch}>RESET MATCH</button>}
        </div>
        <p className="ttt-hint">Tap a square · Arrow keys move · X starts · First to three in a row wins</p>
      </section>
    </main>
  );
}
