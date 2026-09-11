import type { Metadata } from 'next';

const games = {
  reflex: { title: 'Reflex Rush', emoji: '⚡', category: 'Arcade', description: 'Test your reaction speed. Wait for the green signal, then tap as fast as you can.', tip: 'Stay ready, but do not tap early.' },
  'memory-grid': { title: 'Memory Grid', emoji: '🧠', category: 'Brain', description: 'Memorize a growing pattern of tiles and reproduce it perfectly.', tip: 'Focus on the pattern before the board disappears.' },
  snake: { title: 'Snake', emoji: '🐍', category: 'Classic', description: 'Eat stars, grow longer and survive as long as possible without hitting the wall or yourself.', tip: 'Plan your next turn before the snake gets too long.' },
  'number-merge': { title: 'Number Merge', emoji: '🔢', category: 'Puzzle', description: 'Slide matching numbers together, build bigger tiles and chase 2048.', tip: 'Keep one corner organized and avoid filling the board.' },
  'color-match': { title: 'Color Match', emoji: '🎨', category: 'Puzzle', description: 'Spot the odd color before the clock runs out. Speed and accuracy are everything.', tip: 'Look for the subtle shade difference instead of reading the labels.' },
  'stack-tower': { title: 'Stack Tower', emoji: '🏗️', category: 'Arcade', description: 'Drop moving blocks onto the tower and build as high as your timing allows.', tip: 'Perfect drops keep your tower wide and your score climbing.' },
} as const;

export function generateStaticParams() {
  return Object.keys(games).map(id => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const game = games[id as keyof typeof games];
  if (!game) return { title: 'Game not found | GameHub' };
  return {
    title: `${game.title} — Free Online Game | GameHub`,
    description: `${game.description} Play ${game.title} free in your browser on GameHub.`,
  };
}

export default async function GameLanding({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = games[id as keyof typeof games];
  if (!game) return <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}><div><h1>Game not found</h1><a href="/gamehub/">← Back to GameHub</a></div></main>;

  return <main style={{ minHeight: '100vh', padding: 'clamp(32px, 7vw, 88px) 20px', background: '#07090d', color: '#f7f9fc' }}>
    <article style={{ maxWidth: 820, margin: '0 auto', background: '#0f131b', border: '1px solid #232b3a', borderRadius: 28, padding: 'clamp(28px, 6vw, 64px)', boxShadow: '0 24px 80px rgba(0,0,0,.28)' }}>
      <a href="/gamehub/" style={{ color: '#b7f34a', textDecoration: 'none', fontWeight: 800 }}>← GameHub</a>
      <div style={{ fontSize: 72, marginTop: 34 }}>{game.emoji}</div>
      <p style={{ textTransform: 'uppercase', letterSpacing: '.14em', fontSize: 12, fontWeight: 800, opacity: .65 }}>{game.category} · FREE · NO DOWNLOAD</p>
      <h1 style={{ fontSize: 'clamp(42px, 8vw, 76px)', lineHeight: .95, margin: '14px 0 22px' }}>{game.title}</h1>
      <p style={{ maxWidth: 650, fontSize: 19, lineHeight: 1.65, opacity: .78 }}>{game.description}</p>
      <div style={{ margin: '28px 0', padding: 20, borderRadius: 18, background: '#151b26', border: '1px solid #232b3a' }}><strong>Quick tip:</strong> {game.tip}</div>
      <a href={`/gamehub/?game=${id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 54, padding: '0 28px', borderRadius: 14, background: '#b7f34a', color: '#07090d', textDecoration: 'none', fontWeight: 900 }}>PLAY {game.title.toUpperCase()} →</a>
      <p style={{ marginTop: 30, fontSize: 13, opacity: .5 }}>No signup. No download. Play instantly and chase your best score.</p>
    </article>
  </main>;
}
