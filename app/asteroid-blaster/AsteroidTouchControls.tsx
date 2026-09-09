'use client';

import { useEffect, useRef } from 'react';

type Props = {
  onMove: (x: number, y: number) => void;
  onStop: () => void;
  onFireStart: () => void;
  onFireStop: () => void;
};

export default function AsteroidTouchControls({ onMove, onStop, onFireStart, onFireStop }: Props) {
  const stickRef = useRef<HTMLButtonElement>(null);
  const fireRef = useRef<HTMLButtonElement>(null);
  const active = useRef<number | null>(null);
  const firePointer = useRef<number | null>(null);

  useEffect(() => {
    const el = stickRef.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      if (active.current !== e.pointerId) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width * .34);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height * .34);
      const len = Math.hypot(dx, dy) || 1;
      const scale = Math.min(1, len) / len;
      onMove(Math.max(-1, Math.min(1, dx * scale)), Math.max(-1, Math.min(1, dy * scale)));
    };
    const stop = (e: PointerEvent) => {
      if (active.current !== e.pointerId) return;
      active.current = null;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      onStop();
    };
    const down = (e: PointerEvent) => {
      active.current = e.pointerId;
      el.setPointerCapture(e.pointerId);
      move(e);
      e.preventDefault();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
    el.addEventListener('lostpointercapture', stop);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', stop); el.removeEventListener('pointercancel', stop); el.removeEventListener('lostpointercapture', stop); };
  }, [onMove, onStop]);

  useEffect(() => {
    const el = fireRef.current;
    if (!el) return;
    const stop = (e: PointerEvent) => {
      if (firePointer.current !== e.pointerId) return;
      firePointer.current = null;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      onFireStop();
    };
    const down = (e: PointerEvent) => {
      if (firePointer.current !== null) return;
      firePointer.current = e.pointerId;
      el.setPointerCapture(e.pointerId);
      onFireStart();
      e.preventDefault();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
    el.addEventListener('lostpointercapture', stop);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointerup', stop); el.removeEventListener('pointercancel', stop); el.removeEventListener('lostpointercapture', stop); };
  }, [onFireStart, onFireStop]);

  return <div className="asteroid-touch" aria-label="Mobile game controls">
    <div className="asteroid-stick-wrap">
      <span>MOVE</span>
      <button ref={stickRef} className="asteroid-stick" type="button" aria-label="Virtual joystick">
        <i aria-hidden="true">✦</i>
      </button>
    </div>
    <button ref={fireRef} className="asteroid-fire" type="button" aria-label="Fire">
      <strong>FIRE</strong><small>HOLD / TAP</small>
    </button>
  </div>;
}
