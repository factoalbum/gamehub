'use client';

import { useEffect, useState } from 'react';

type Props = { game?: string; score?: string; label?: string };

function readGame() {
  const title = document.querySelector('.game-title')?.textContent?.replace(/^\S+\s*/, '').trim();
  return title || 'GameHub';
}

function readScore() {
  const pill = document.querySelector('.game-top .pill')?.textContent?.trim();
  const big = document.querySelector('.score-big')?.textContent?.trim();
  const tower = document.querySelector('.tower-score strong')?.textContent?.trim();
  const color = document.querySelector('.color-overlay h2')?.textContent?.match(/Score:\s*([\d,]+)/i);
  if (color) return color[1];
  if (big) return big.split(/\s+/)[0];
  if (tower) return tower;
  if (pill) {
    const match = pill.match(/SCORE\s+([\d,]+)/i);
    if (match) return match[1];
    const level = pill.match(/LEVEL\s+(\d+)/i);
    if (level) return `Level ${level[1]}`;
  }
  const result = document.querySelector('.result-time')?.textContent?.trim();
  return result || 'a new score';
}

export default function ShareScore({ game, score, label = 'Share score' }: Props) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(Boolean(game && score));
  const [currentGame, setCurrentGame] = useState(game || 'GameHub');
  const [currentScore, setCurrentScore] = useState(score || 'a new score');

  useEffect(() => {
    if (game && score) return;
    let frame = 0;
    let scheduled = false;
    const sync = () => {
      scheduled = false;
      const shell = document.querySelector('.game-shell');
      setVisible(Boolean(shell));
      if (shell) {
        setCurrentGame(readGame());
        setCurrentScore(readScore());
      }
    };
    const scheduleSync = () => {
      if (scheduled) return;
      scheduled = true;
      frame = window.requestAnimationFrame(sync);
    };
    sync();
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [game, score]);

  async function share() {
    const finalGame = game || currentGame;
    const finalScore = score || currentScore;
    const text = `I scored ${finalScore} on ${finalGame} at GameHub 🎮 Can you beat me?`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${finalGame} — GameHub`, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {}
  }

  if (!visible) return null;
  return <button className="share-score" onClick={share} type="button" aria-label={`${label} for ${game || currentGame}`}>
    <span>{copied ? '✓' : '↗'}</span> {copied ? 'Copied!' : label}
  </button>;
}
