'use client';

import { useState } from 'react';

type Props = { game: string; score: string; label?: string };

export default function ShareScore({ game, score, label = 'Share score' }: Props) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `I scored ${score} on ${game} at GameHub 🎮 Can you beat me?`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${game} — GameHub`, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {}
  }

  return <button className="share-score" onClick={share} type="button" aria-label={`${label} for ${game}`}>
    <span>{copied ? '✓ Copied!' : '↗'}</span> {copied ? 'Copied!' : label}
  </button>;
}
