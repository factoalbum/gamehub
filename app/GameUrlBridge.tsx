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
    localStorage.setItem('gamehub:recent', JSON.stringify([id, ...current.filter(item => item !== id)].slice(0, 5)));
  } catch {}
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

    syncUrl();
    window.addEventListener('popstate', syncUrl);
    return () => { cancelled = true; window.removeEventListener('popstate', syncUrl); };
  }, []);

  return null;
}
