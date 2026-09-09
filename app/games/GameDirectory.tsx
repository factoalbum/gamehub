'use client';

import { useMemo, useState } from 'react';
import type { GameCatalogItem } from '../lib/game-catalog';

type Props = { games: GameCatalogItem[]; groups: string[] };

export default function GameDirectory({ games, groups }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return games.filter(game => {
      const matchesCategory = category === 'All' || game.category === category;
      const matchesQuery = !needle || `${game.label} ${game.meta} ${game.category}`.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [games, query, category]);

  const visibleByCategory = groups.map(group => ({
    group,
    games: visible.filter(game => game.category === group),
  })).filter(section => section.games.length);

  return (
    <>
      <div className="directory-tools" aria-label="Filter games">
        <label className="directory-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search games..."
            aria-label="Search games"
          />
        </label>
        <div className="directory-filters" role="group" aria-label="Game categories">
          {['All', ...groups].map(item => (
            <button
              key={item}
              type="button"
              className={category === item ? 'is-active' : ''}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visible.length ? visibleByCategory.map(section => (
        <section className="directory-section" key={section.group}>
          <div className="directory-section-head"><h2>{section.group}</h2><span>{section.games.length} {section.games.length === 1 ? 'game' : 'games'}</span></div>
          <div className="directory-grid">
            {section.games.map(game => (
              <a className="directory-card" href={game.href} key={game.id}>
                <span className="directory-icon" aria-hidden="true">{game.emoji}</span>
                <span className="directory-copy"><strong>{game.label}</strong><small>{game.meta}</small></span>
                <b aria-hidden="true">→</b>
              </a>
            ))}
          </div>
        </section>
      )) : (
        <div className="directory-empty" role="status">
          <strong>No games found.</strong>
          <span>Try a different search or category.</span>
          <button type="button" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button>
        </div>
      )}
    </>
  );
}
