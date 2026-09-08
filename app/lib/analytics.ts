export type GameEvent =
  | 'game_open'
  | 'game_start'
  | 'game_finish'
  | 'game_restart';

/**
 * Tiny, provider-neutral analytics hook. It is intentionally a no-op until
 * an analytics provider is configured, while still giving every game a
 * consistent event contract.
 */
export function trackGame(event: GameEvent, game: string, data?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent('gamehub:analytics', {
    detail: { event, game, ...data },
  }));

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[GameHub]', event, game, data || {});
  }
}
