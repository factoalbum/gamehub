import type { Metadata } from 'next';
import './sports.css';
import { getSportsGames } from '../lib/game-catalog';

export const metadata: Metadata = {
  title: '2 Player Sports Games — Play Together | GameHub',
  description: 'Play free local 2-player sports arcade games in your browser. Basketball, football, volleyball, tennis, air hockey and racing — no download or signup.',
  alternates: { canonical: '/sports/' },
};

export default function SportsPage() {
  const sports = getSportsGames();

  return (
    <main className="sports-page">
      <div className="sports-inner">
        <a className="sports-back" href="/gamehub/">← Back to GameHub</a>
        <header className="sports-hero">
          <p className="eyebrow">GAMEHUB · 2 PLAYER</p>
          <h1>Play together.<br /><span>Rematch instantly.</span></h1>
          <p>Classic sports energy without the simulation. Grab one device, pick a game and settle the score.</p>
          <div className="sports-pills"><span>⌨️ Keyboard</span><span>📱 Touch</span><span>⚡ No download</span></div>
        </header>

        <section aria-labelledby="sports-list-title">
          <div className="section-heading"><div><p className="eyebrow">LOCAL MULTIPLAYER</p><h2 id="sports-list-title">Choose your game</h2></div><span>{sports.length} games</span></div>
          <div className="sports-grid">
            {sports.map((sport) => (
              <a className="sport-card" href={sport.href} key={sport.href}>
                <div className="sport-icon" aria-hidden="true">{sport.emoji}</div>
                <div className="sport-copy"><span className="sport-tag">{sport.sport}</span><h3>{sport.label}</h3><p>{sport.description ?? sport.meta}</p></div>
                <span className="sport-play" aria-hidden="true">PLAY →</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
