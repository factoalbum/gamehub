import type { Metadata } from 'next';
import { freshDropGames, multiplayerGames, recentGames } from '../lib/game-catalog';
import './games.css';

export const metadata: Metadata = {
  title: 'All Games — GameHub',
  description: 'Browse all free GameHub browser games, from quick arcade challenges to local 2-player sports games.',
};

const allGames = Array.from(new Map([...recentGames, ...freshDropGames, ...multiplayerGames].map(game => [game.id, game])).values());
const groups = ['Arcade', 'Puzzle', 'Brain', 'Classic', '2 Player'];

export default function GamesPage() {
  return (
    <main className="games-directory">
      <header className="directory-header">
        <a className="directory-brand" href="/gamehub/">GAME<span>HUB</span></a>
        <a className="directory-back" href="/gamehub/">← Home</a>
      </header>
      <section className="directory-hero">
        <span className="directory-kicker">THE GAME LIBRARY</span>
        <h1>Pick a game.<br /><em>Start playing.</em></h1>
        <p>{allGames.length} free games, ready in your browser. No downloads, no accounts.</p>
      </section>
      <div className="directory-groups">
        {groups.map(category => {
          const games = allGames.filter(game => game.category === category);
          if (!games.length) return null;
          return (
            <section className="directory-section" key={category}>
              <div className="directory-section-head"><h2>{category}</h2><span>{games.length} games</span></div>
              <div className="directory-grid">
                {games.map(game => (
                  <a className="directory-card" href={game.href} key={game.id}>
                    <span className="directory-icon" aria-hidden="true">{game.emoji}</span>
                    <span className="directory-copy"><strong>{game.label}</strong><small>{game.meta}</small></span>
                    <b aria-hidden="true">→</b>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <footer className="directory-footer"><a href="/gamehub/">GAMEHUB</a><span>Free browser games · Play instantly</span></footer>
    </main>
  );
}
