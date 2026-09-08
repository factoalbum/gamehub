'use client';

import { useRef } from 'react';
import './two-player-tap-zones.css';

type Props = {
  onPress: (player: 1 | 2) => void;
  onRelease?: (player: 1 | 2) => void;
  label?: string;
};

function Zone({ player, label, onPress, onRelease }: { player: 1 | 2; label: string; onPress: Props['onPress']; onRelease: Props['onRelease'] }) {
  const pointers = useRef(new Set<number>());
  const release = (button: HTMLButtonElement, id: number) => {
    if (!pointers.current.has(id)) return;
    pointers.current.delete(id);
    if (!pointers.current.size) {
      button.classList.remove('tap-held');
      onRelease?.(player);
    }
  };
  return <button
    type="button"
    className={`tap-zone tap-zone-${player}`}
    aria-label={`Player ${player} ${label}`}
    onPointerDown={(e) => {
      e.preventDefault();
      if (!pointers.current.size) { e.currentTarget.classList.add('tap-held'); onPress(player); }
      pointers.current.add(e.pointerId);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }}
    onPointerUp={(e) => { e.preventDefault(); release(e.currentTarget, e.pointerId); }}
    onPointerCancel={(e) => { e.preventDefault(); release(e.currentTarget, e.pointerId); }}
    onLostPointerCapture={(e) => release(e.currentTarget, e.pointerId)}
  >
    <strong>P{player}</strong><span>{label}</span><small>HOLD / TAP</small>
  </button>;
}

export default function TwoPlayerTapZones({ onPress, onRelease, label = 'JUMP' }: Props) {
  return <div className="two-player-tap-zones" role="group" aria-label="Two player touch zones">
    <Zone player={1} label={label} onPress={onPress} onRelease={onRelease} />
    <Zone player={2} label={label} onPress={onPress} onRelease={onRelease} />
  </div>;
}
