'use client';

import './two-player-touch-controls.css';
import { useEffect, useRef, useState } from 'react';

export type TouchAction = 'left' | 'right' | 'up' | 'down' | 'action' | 'boost';

type Props = {
  onPress: (player: 1 | 2, action: TouchAction) => void;
  onRelease: (player: 1 | 2, action: TouchAction) => void;
  actionLabel?: string;
  actionLabel2?: string;
  upLabel?: string;
  showDown?: boolean;
  showBoost?: boolean;
};

type ButtonProps = {
  player: 1 | 2;
  action: TouchAction;
  label: string;
  ariaLabel?: string;
  onPress: Props['onPress'];
  onRelease: Props['onRelease'];
};

function ControlButton({ player, action, label, ariaLabel, onPress, onRelease }: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const pointers = useRef(new Set<number>());
  const onReleaseRef = useRef(onRelease);
  const [held, setHeld] = useState(false);

  onReleaseRef.current = onRelease;

  const releaseAll = () => {
    if (pointers.current.size === 0) return;
    pointers.current.clear();
    buttonRef.current?.classList.remove('touch-held');
    setHeld(false);
    onReleaseRef.current(player, action);
  };

  const releasePointer = (button: HTMLButtonElement, pointerId: number) => {
    if (!pointers.current.has(pointerId)) return;
    pointers.current.delete(pointerId);
    if (pointers.current.size === 0) {
      button.classList.remove('touch-held');
      setHeld(false);
      onReleaseRef.current(player, action);
    }
  };

  useEffect(() => {
    const releaseOnFocusLoss = () => releaseAll();
    const releaseOnVisibilityChange = () => {
      if (document.hidden) releaseAll();
    };

    window.addEventListener('blur', releaseOnFocusLoss);
    document.addEventListener('visibilitychange', releaseOnVisibilityChange);
    return () => {
      window.removeEventListener('blur', releaseOnFocusLoss);
      document.removeEventListener('visibilitychange', releaseOnVisibilityChange);
      releaseAll();
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`touch-key touch-${action}`}
      aria-label={`Player ${player} ${ariaLabel ?? label}`}
      aria-pressed={held}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        if (pointers.current.size === 0) {
          e.currentTarget.classList.add('touch-held');
          setHeld(true);
          onPress(player, action);
        }
        pointers.current.add(e.pointerId);
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        releasePointer(e.currentTarget, e.pointerId);
      }}
      onPointerCancel={(e) => {
        e.preventDefault();
        releasePointer(e.currentTarget, e.pointerId);
      }}
      onLostPointerCapture={(e) => {
        releasePointer(e.currentTarget, e.pointerId);
      }}
    >
      {label}
    </button>
  );
}

export default function TwoPlayerTouchControls({
  onPress,
  onRelease,
  actionLabel = 'ACTION',
  actionLabel2,
  upLabel = 'JUMP',
  showDown = false,
  showBoost = false,
}: Props) {
  const side = (player: 1 | 2, actionLabelForPlayer: string) => (
    <section className={`touch-player touch-player-${player}`} aria-label={`Player ${player} touch controls`}>
      <div className="touch-player-title">
        <strong>P{player}</strong>
        <span>HOLD TO PLAY</span>
      </div>
      <div className="touch-pad">
        <ControlButton player={player} action="left" label="←" ariaLabel="MOVE LEFT" onPress={onPress} onRelease={onRelease} />
        <ControlButton player={player} action="up" label={upLabel} onPress={onPress} onRelease={onRelease} />
        <ControlButton player={player} action="right" label="→" ariaLabel="MOVE RIGHT" onPress={onPress} onRelease={onRelease} />
        {showDown && <ControlButton player={player} action="down" label="↓" ariaLabel="MOVE DOWN" onPress={onPress} onRelease={onRelease} />}
      </div>
      <div className="touch-actions">
        <ControlButton player={player} action="action" label={actionLabelForPlayer} onPress={onPress} onRelease={onRelease} />
        {showBoost && <ControlButton player={player} action="boost" label="BOOST" onPress={onPress} onRelease={onRelease} />}
      </div>
    </section>
  );

  return (
    <div className="two-player-touch" role="group" aria-label="Two player touch controls">
      {side(1, actionLabel)}
      {side(2, actionLabel2 ?? actionLabel)}
    </div>
  );
}
