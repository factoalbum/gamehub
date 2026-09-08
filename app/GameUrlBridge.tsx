'use client';

import { useEffect } from 'react';

const titles: Record<string, string> = {
  reflex: 'Reflex Rush',
  'memory-grid': 'Memory Grid',
  snake: 'Snake',
  'number-merge': 'Number Merge',
  'color-match': 'Color Match',
  'stack-tower': 'Stack Tower',
};

function remember(id: string) {
  try {
    const current = JSON.parse(localStorage.getItem('gamehub:recent') || '[]') as string[];
    const recent = [id, ...current.filter(item => item !== id)].slice(0, 5);
    localStorage.setItem('gamehub:recent', JSON.stringify(recent));
    window.dispatchEvent(new CustomEvent('gamehub:recent', { detail: recent }));
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

      if (id && titles[id]) {
        const title = titles[id];
        const button = Array.from(document.querySelectorAll<HTMLButtonElement>('.game-card')).find(el => el.textContent?.includes(title));
        if (button) {
          remember(id);
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
        const entry = Object.entries(titles).find(([, title]) => card.textContent?.includes(title));
        if (entry) {
          const [id] = entry;
          remember(id);
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
