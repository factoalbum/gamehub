import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About GameHub — Free Browser Games',
  description: 'Learn how GameHub works, why it is free, how games are built, and how the platform is designed for quick, accessible browser play.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return (
    <main className="legal-page">
      <a href="/gamehub/">← GameHub</a>
      <h1>About GameHub</h1>
      <p>GameHub is a small, independent browser-game platform built around one simple idea: make good games easy to start.</p>

      <h2>What makes GameHub different?</h2>
      <p>
        GameHub focuses on short, replayable games that work directly in a modern browser. There are no required accounts, downloads, or installations. You can open a game, understand the objective quickly, play a round, and try again.
      </p>

      <h2>Original game experiences</h2>
      <p>
        The GameHub interface, game implementations, controls, scoring systems, and visual presentation are developed for this project. The collection combines familiar arcade and puzzle ideas with original implementations designed for quick sessions, personal-best chasing, and local multiplayer.
      </p>

      <h2>Built for phones and computers</h2>
      <p>
        Games are designed to work across phones, tablets, and desktop browsers. Where a game supports touch, controls are designed around large, direct interactions. Keyboard controls are provided where they make sense, and multiplayer games are built for two people sharing one device.
      </p>

      <h2>How GameHub saves progress</h2>
      <p>
        Supported games can save personal bests and recently played games in your browser using local storage. This keeps the experience simple and avoids requiring a GameHub account for basic play.
      </p>

      <h2>Our approach to the platform</h2>
      <p>
        We prioritize fast loading, clear controls, accessible interactions, responsive layouts, and reliable static hosting. New games are added and existing games are tested and refined as the platform grows.
      </p>

      <h2>Explore GameHub</h2>
      <p>
        Browse the <a href="/gamehub/games/">full game library</a>, challenge a friend in the <a href="/gamehub/multiplayer/">multiplayer hub</a>, or read the <a href="/gamehub/faq/">FAQ</a> for quick answers.
      </p>
    </main>
  );
}
