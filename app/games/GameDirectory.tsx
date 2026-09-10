'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameCatalogItem } from '../lib/game-catalog';

type Props = { games: GameCatalogItem[]; groups: string[] };

export default function GameDirectory({ games, groups }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (!target || target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      event.preventDefault();
      searchRef.current?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    searchRef.current?.focus();
  };

  const hasFilters = Boolean(query.trim()) || category !== 'All';
  const resultDescription = [
    `${visible.length} ${visible.length === 1 ? 'game' : 'games'}`,
    query.trim() ? `matching “${query.trim()}”` : '',
    category !== 'All' ? `in ${category}` : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className="directory-tools" aria-label="Filter games">
        <label className="directory-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Escape' && hasFilters) clearFilters();
            }}
            placeholder="Search games..."
            aria-label="Search games"
          />
          {hasFilters ? (
            <button
              type="button"
              className="directory-search-clear"
              onClick={clearFilters}
              aria-label="Clear game search and category filters"
              title="Clear filters"
            >
              ×
            </button>
          ) : (
            <kbd aria-hidden="true">/</kbd>
          )}
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

      <div className="directory-result-status" role="status" aria-live="polite">
        {resultDescription}
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
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      )}
    </>
  );
}
