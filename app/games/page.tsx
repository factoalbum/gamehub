import type { Metadata } from 'next';
import { freshDropGames, multiplayerGames, recentGames } from '../lib/game-catalog';
import GameDirectory from './GameDirectory';
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
        <GameDirectory games={allGames} groups={groups} />
      </div>
      <footer className="directory-footer"><a href="/gamehub/">GAMEHUB</a><span>Free browser games · Play instantly</span></footer>
    </main>
  );
}
