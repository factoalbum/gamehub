'use client';

import { useEffect } from 'react';
import { recentGames } from './lib/game-catalog';
import { trackGame } from './lib/analytics';

const queryGameTitles = new Map(
  recentGames
    .filter((game) => game.href.includes('?'))
    .map((game) => {
      const url = new URL(game.href, 'https://gamehub.local');
      return [url.searchParams.get('game'), game.label] as const;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry[0])),
);

function remember(id: string, source: 'card' | 'url') {
  try {
    const current = JSON.parse(localStorage.getItem('gamehub:recent') || '[]') as unknown;
    const ids = Array.isArray(current) ? current.filter((item): item is string => typeof item === 'string') : [];
    const recent = [id, ...ids.filter(item => item !== id)].slice(0, 5);
    localStorage.setItem('gamehub:recent', JSON.stringify(recent));
    window.dispatchEvent(new CustomEvent('gamehub:recent', { detail: recent }));
    trackGame('game_open', id, { source });
  } catch {}
}

function setGameUrl(id: string, replace = false) {
  const url = new URL(window.location.href);
  if (url.searchParams.get('game') === id) return;
  url.searchParams.set('game', id);
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
}

function clearGameUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('game')) return;
  url.searchParams.delete('game');
  window.history.replaceState({}, '', url);
}

export default function GameUrlBridge() {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const syncUrl = () => {
      if (cancelled) return;
      const path = window.location.pathname;
      if (path !== '/gamehub/' && path !== '/') return;
      const id = new URLSearchParams(window.location.search).get('game');

      const label = id ? queryGameTitles.get(id) : undefined;
      if (id && label) {
        const button = Array.from(document.querySelectorAll<HTMLButtonElement>('.game-card')).find(el => el.textContent?.includes(label));
        if (button) {
          remember(id, 'url');
          button.click();
          return;
        }
      }

      if (!id && document.querySelector('.game-shell')) {
        document.querySelector<HTMLButtonElement>('.game-top .back')?.click();
      }

      if (attempts < 20) {
        attempts += 1;
        window.setTimeout(syncUrl, 50);
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const card = target?.closest<HTMLButtonElement>('.game-card');
      if (card) {
        const entry = [...queryGameTitles.entries()].find(([, label]) => card.textContent?.includes(label));
        if (entry) {
          const [id] = entry;
          remember(id, 'card');
          setGameUrl(id);
        }
        return;
      }

      const back = target?.closest<HTMLButtonElement>('.game-top .back');
      if (back) clearGameUrl();
    };

    document.addEventListener('click', handleClick, true);
    syncUrl();
    window.addEventListener('popstate', syncUrl);
    return () => {
      cancelled = true;
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', syncUrl);
    };
  }, []);

  return null;
}
