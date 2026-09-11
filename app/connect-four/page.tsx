'use client';

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import './connect-four.css';

type Disc = 'R' | 'Y' | null;
const ROWS = 6;
const COLS = 7;
const WIN_DIRECTIONS = [[0,1],[1,0],[1,1],[1,-1]] as const;

function winner(board: Disc[], row: number, col: number) {
  const mark = board[row * COLS + col];
  if (!mark) return false;
  return WIN_DIRECTIONS.some(([dr, dc]) => {
    let count = 1;
    for (const sign of [-1, 1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r * COLS + c] === mark) {
        count += 1;
        r += dr * sign;
        c += dc * sign;
      }
    }
    return count >= 4;
  });
}

export default function ConnectFourPage() {
  const [board, setBoard] = useState<Disc[]>(Array(ROWS * COLS).fill(null));
  const [turn, setTurn] = useState<Exclude<Disc, null>>('R');
  const [scores, setScores] = useState({ R: 0, Y: 0 });
  const [winnerMark, setWinnerMark] = useState<Disc>(null);
  const [draw, setDraw] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const columnsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const winningCells = useMemo(() => {
    if (!winnerMark) return new Set<number>();
    const cells = new Set<number>();
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (board[r * COLS + c] === winnerMark && winner(board, r, c)) cells.add(r * COLS + c);
      }
    }
    return cells;
  }, [board, winnerMark]);

  function drop(column: number) {
    if (winnerMark || draw) return;
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      const index = row * COLS + column;
      if (!board[index]) {
        const next = [...board];
        next[index] = turn;
        if (winner(next, row, column)) {
          setBoard(next);
          setWinnerMark(turn);
          setScores((current) => ({ ...current, [turn]: current[turn] + 1 }));
        } else if (next.every(Boolean)) {
          setBoard(next);
          setDraw(true);
        } else {
          setBoard(next);
          setTurn(turn === 'R' ? 'Y' : 'R');
        }
        return;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, column: number) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = event.key === 'ArrowLeft' ? (column + COLS - 1) % COLS : (column + 1) % COLS;
      setSelectedColumn(next);
      columnsRef.current[next]?.focus();
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      drop(column);
    }
  }

  function resetRound() {
    setBoard(Array(ROWS * COLS).fill(null));
    setTurn('R');
    setWinnerMark(null);
    setDraw(false);
    setSelectedColumn(0);
  }

  function resetMatch() {
    setScores({ R: 0, Y: 0 });
    resetRound();
  }

  const status = winnerMark ? `Player ${winnerMark === 'R' ? 'Red' : 'Yellow'} wins!` : draw ? 'Draw game.' : `Player ${turn === 'R' ? 'Red' : 'Yellow'}'s turn`;

  return (
    <main className="connect-page">
      <section className="connect-shell" aria-label="Connect Four local multiplayer game">
        <a className="connect-back" href="/gamehub/">← GameHub</a>
        <div className="connect-kicker">CLASSIC · LOCAL 2 PLAYER</div>
        <h1>Connect Four</h1>
        <p className="connect-subtitle">Drop four in a row. Quick turns, easy rules, instant rematches.</p>
        <div className="connect-score" aria-label={`Score: Red ${scores.R}, Yellow ${scores.Y}`}>
          <span>Red <strong>{scores.R}</strong></span>
          <strong aria-live="polite">{status}</strong>
          <span><strong>{scores.Y}</strong> Yellow</span>
        </div>
        <div className="connect-board" role="grid" aria-label="Connect Four board">
          <div className="connect-columns" aria-label="Drop controls">
            {Array.from({ length: COLS }, (_, column) => (
              <button
                key={column}
                ref={(element) => { columnsRef.current[column] = element; }}
                className={`connect-drop ${selectedColumn === column ? 'selected' : ''}`}
                onClick={() => drop(column)}
                onKeyDown={(event) => handleKeyDown(event, column)}
                aria-label={`Drop disc in column ${column + 1}`}
              >↓</button>
            ))}
          </div>
          <div className="connect-grid">
            {board.map((disc, index) => (
              <div key={index} className={`connect-cell ${disc ? `disc-${disc.toLowerCase()}` : ''} ${winningCells.has(index) ? 'winning' : ''}`} role="gridcell" aria-label={`${disc ? `${disc === 'R' ? 'Red' : 'Yellow'} disc` : 'Empty'}, row ${Math.floor(index / COLS) + 1}, column ${index % COLS + 1}`}>
                <span />
              </div>
            ))}
          </div>
        </div>
        <div className="connect-actions">
          <button className="connect-reset" onClick={resetRound}>{winnerMark || draw ? 'REMATCH' : 'NEW ROUND'}</button>
          {(winnerMark || draw) && <button className="connect-match-reset" onClick={resetMatch}>RESET MATCH</button>}
        </div>
        <p className="connect-hint">Tap a column · Arrow keys move · Enter/Space drops · First to four wins</p>
      </section>
    </main>
  );
}
