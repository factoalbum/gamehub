import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'FAQ | GameHub', description: 'Frequently asked questions about GameHub, free browser games, controls, scores, and multiplayer.', alternates: { canonical: '/faq/' } };

const faqs = [
  ['Is GameHub free?', 'Yes. GameHub is built around free browser games with no download required.'],
  ['Do I need an account?', 'No. You can play the available games without creating an account.'],
  ['Can I play on my phone?', 'Yes. GameHub is designed to work across phones, tablets, and desktop browsers. Games with touch controls are optimized for touch input.'],
  ['Can two people play together?', 'Yes. Multiplayer games such as Hoop Duel, Football Random, Mini Football, Volley Duel, Tennis Duel, Air Hockey, and Racing Duel support local play on one device.'],
  ['Are scores saved?', 'Where supported, personal bests and recent-game information are stored locally in your browser.'],
  ['Why can a game behave differently on my device?', 'Browser, screen size, touch input, and performance can affect gameplay. We continually test and improve compatibility.'],
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
};

export default function FAQPage() {
  return <main className="legal-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <a href="/gamehub/">← GameHub</a><h1>Frequently Asked Questions</h1><p>Quick answers about playing GameHub.</p>
    {faqs.map(([q, a]) => <section key={q}><h2>{q}</h2><p>{a}</p></section>)}
  </main>;
}
