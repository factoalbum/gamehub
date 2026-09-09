# GameHub

A free, fast browser-games platform built for instant play. GameHub is **static-first** so it can run on GitHub Pages with essentially zero infrastructure cost while the product is validated.

## Product loop

**Discover → Play instantly → Chase a score / beat a friend → Rematch → Try another game**

The platform favors recognizable, short-session games with simple controls, strong replay loops and mobile-friendly play over a large catalog of filler.

## Current platform

- Responsive dark arcade-style portal UI
- Dedicated searchable **All Games** library with category filters
- Fresh Drops discovery shelf
- Recently Played / Jump Back In tracking via `localStorage`
- Daily Challenge surface
- Share-score flow and analytics-ready game events
- SEO metadata and sitemap coverage
- Static Next.js export for GitHub Pages
- GitHub Actions deployment with Node 24

## Game catalog

### Arcade / classic

- Minesweeper
- Tap Target
- Brick Breaker
- Neon Dodge
- Bubble Pop
- Whack Attack
- Falling Blocks
- Sky Hopper
- Asteroid Blaster
- Alien Blaster
- Reflex Rush
- Stack Tower
- Snake
- Color Match
- Number Merge
- Memory Grid

### Local 2 Player

- Hoop Duel — basketball
- Football Random — one-button football
- Mini Football — arcade football
- Volley Duel — volleyball
- Tennis Duel — tennis
- Air Hockey — hockey
- Racing Duel — racing

Local multiplayer is designed around **one device, two players**, with simultaneous touch controls where useful and keyboard controls as a desktop fallback. The multiplayer architecture is local-first so remote multiplayer can be introduced later without requiring it today.

## Engineering direction

- Next.js App Router + React + TypeScript
- Client-side HTML5/Canvas gameplay
- No game server or paid multiplayer service
- Shared typed game catalog in `app/lib/game-catalog.ts`
- Reusable touch primitives such as `TwoPlayerTouchControls` and `TwoPlayerTapZones`
- Original generic game visuals; no copyrighted team/player assets
- Keep pages fast, accessible and safe for static export

## Adding a game

1. Create the game route under `app/`.
2. Keep gameplay client-side and static-hosting compatible.
3. Add the game to `app/lib/game-catalog.ts` so discovery, recent tracking and the library stay synchronized.
4. Add SEO metadata and a sitemap entry.
5. Add it to a homepage shelf only when it deserves prominent discovery.
6. Verify the production build before considering the change complete.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the static `out/` directory and deploys it to GitHub Pages. No backend or paid infrastructure is required for the current product.
