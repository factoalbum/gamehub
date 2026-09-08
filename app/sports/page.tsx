import type { Metadata } from 'next';
import './sports.css';

export const metadata: Metadata = {
  title: '2 Player Sports Games — Play Together | GameHub',
  description: 'Play free local 2-player sports arcade games in your browser. Basketball, football, volleyball, tennis, air hockey and racing — no download or signup.',
};

const sports = [
  { href: '/gamehub/hoop-duel/', emoji: '🏀', title: 'Hoop Duel', copy: 'Fast 1v1 basketball. Outscore your friend before the clock hits zero.', tag: 'BASKETBALL' },
  { href: '/gamehub/mini-football/', emoji: '⚽', title: 'Mini Football', copy: 'Simple 1v1 football with quick movement, shots and instant rematches.', tag: 'FOOTBALL' },
  { href: '/gamehub/volley-duel/', emoji: '🏐', title: 'Volley Duel', copy: 'Keep the ball alive, find the opening and be first to take the set.', tag: 'VOLLEYBALL' },
  { href: '/gamehub/tennis-duel/', emoji: '🎾', title: 'Tennis Duel', copy: 'A pick-up-and-play tennis rally built for two people on one device.', tag: 'TENNIS' },
  { href: '/gamehub/air-hockey/', emoji: '🏒', title: 'Air Hockey Duel', copy: 'Slide, defend and fire the puck. First to 7 wins the table.', tag: 'HOCKEY' },
  { href: '/gamehub/racing-duel/', emoji: '🏁', title: 'Racing Duel', copy: 'Race three laps, manage your boost and beat your friend to the finish.', tag: 'RACING' },
];

export default function SportsPage() {
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
                <div className="sport-copy"><span className="sport-tag">{sport.tag}</span><h3>{sport.title}</h3><p>{sport.copy}</p></div>
                <span className="sport-play" aria-hidden="true">PLAY →</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
