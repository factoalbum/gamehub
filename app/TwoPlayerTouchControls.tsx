'use client';

import './two-player-touch-controls.css';

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
  onPress: Props['onPress'];
  onRelease: Props['onRelease'];
};

function ControlButton({ player, action, label, onPress, onRelease }: ButtonProps) {
  const release = (button: HTMLButtonElement) => {
    button.classList.remove('touch-held');
    onRelease(player, action);
  };

  return (
    <button
      type="button"
      className={`touch-key touch-${action}`}
      aria-label={`Player ${player} ${label}`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('touch-held');
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onPress(player, action);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        release(e.currentTarget);
      }}
      onPointerCancel={(e) => {
        e.preventDefault();
        release(e.currentTarget);
      }}
      onLostPointerCapture={(e) => release(e.currentTarget)}
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
        <ControlButton player={player} action="left" label="←" onPress={onPress} onRelease={onRelease} />
        <ControlButton player={player} action="up" label={upLabel} onPress={onPress} onRelease={onRelease} />
        <ControlButton player={player} action="right" label="→" onPress={onPress} onRelease={onRelease} />
        {showDown && <ControlButton player={player} action="down" label="↓" onPress={onPress} onRelease={onRelease} />}
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
