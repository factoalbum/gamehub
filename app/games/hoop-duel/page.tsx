'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const GAME_SECONDS = 30;
const MAX_POWER = 100;

type Shooter = {
  score: number;
  power: number;
  shooting: boolean;
  shotTime: number;
  target: number;
};

const initialShooter = (target: number): Shooter => ({ score: 0, power: 0, shooting: false, shotTime: 0, target });

export default function HoopDuel() {
  const [time, setTime] = useState(GAME_SECONDS);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [p1, setP1] = useState<Shooter>(() => initialShooter(58));
  const [p2, setP2] = useState<Shooter>(() => initialShooter(42));
  const [ballFlash, setBallFlash] = useState<'p1' | 'p2' | null>(null);
  const [best, setBest] = useState(0);
  const startedAt = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const saved = Number(localStorage.getItem('gamehub:hoop-duel-best') || 0);
    setBest(saved);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const elapsed = Math.floor((performance.now() - startedAt.current) / 1000);
      const remaining = Math.max(0, GAME_SECONDS - elapsed);
      setTime(remaining);
      if (remaining === 0) {
        setRunning(false);
        setWinner(null);
        setP1(current => current.shooting ? { ...current, shooting: false } : current);
        setP2(current => current.shooting ? { ...current, shooting: false } : current);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      const resolve = (player: Shooter, setPlayer: React.Dispatch<React.SetStateAction<Shooter>>, id: 'p1' | 'p2') => {
        if (!player.shooting) return;
        const nextTime = player.shotTime + 1;
        if (nextTime < 3) {
          setPlayer(current => ({ ...current, shotTime: nextTime }));
          return;
        }
        const accuracy = Math.abs(player.power - player.target);
        const made = accuracy <= 11 || (accuracy <= 19 && Math.random() < 0.35);
        setPlayer(current => ({ ...current, shooting: false, shotTime: 0, score: current.score + (made ? 1 : 0), target: 35 + Math.floor(Math.random() * 31) }));
        setBallFlash(made ? id : null);
        window.setTimeout(() => setBallFlash(current => current === id ? null : current), 260);
      };
      resolve(p1, setP1, 'p1');
      resolve(p2, setP2, 'p2');
    }, 180);
    return () => window.clearInterval(interval);
  }, [p1, p2, running]);

  const start = () => {
    startedAt.current = performance.now();
    setTime(GAME_SECONDS);
    setWinner(null);
    setP1(initialShooter(58));
    setP2(initialShooter(42));
    setBallFlash(null);
    setRunning(true);
  };

  const shoot = (id: 'p1' | 'p2') => {
    if (!running) return;
    const setPlayer = id === 'p1' ? setP1 : setP2;
    setPlayer(current => current.shooting ? current : { ...current, shooting: true, shotTime: 0 });
  };

  const adjustPower = (id: 'p1' | 'p2', delta: number) => {
    if (!running) return;
    const setPlayer = id === 'p1' ? setP1 : setP2;
    setPlayer(current => ({ ...current, power: Math.max(0, Math.min(MAX_POWER, current.power + delta)) }));
  };

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const map: Record<string, ['p1' | 'p2', number]> = {
        a: ['p1', -8],
        d: ['p1', 8],
        ArrowLeft: ['p2', -8],
        ArrowRight: ['p2', 8],
      };
      if (event.key === 'w') shoot('p1');
      if (event.key === 'ArrowUp') shoot('p2');
      const action = map[event.key];
      if (action) adjustPower(action[0], action[1]);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  const total = p1.score + p2.score;
  useEffect(() => {
    if (running || total === 0) return;
    const high = Math.max(best, total);
    if (high !== best) {
      setBest(high);
      localStorage.setItem('gamehub:hoop-duel-best', String(high));
    }
  }, [best, running, total]);

  const leader = useMemo(() => p1.score === p2.score ? 'TIED' : p1.score > p2.score ? 'PLAYER 1 LEADS' : 'PLAYER 2 LEADS', [p1.score, p2.score]);

  return (
    <main className="hoop-page">
      <section className="hoop-shell">
        <header className="hoop-top">
          <a href="/gamehub/">← GameHub</a>
          <div><span>SPORTS ARCADE</span><h1>Hoop Duel</h1></div>
          <strong>{time}s</strong>
        </header>

        <div className="scoreboard" aria-live="polite">
          <div><span>PLAYER 1</span><b>{p1.score}</b></div>
          <div className="score-status"><small>{leader}</small><em>BEST {best}</em></div>
          <div><span>PLAYER 2</span><b>{p2.score}</b></div>
        </div>

        <div className="court">
          <div className={`lane p1 ${ballFlash === 'p1' ? 'made' : ''}`}>
            <div className="hoop"><span /></div>
            <div className="player">●</div>
            <div className="ball" />
            <div className="lane-copy"><strong>PLAYER 1</strong><small>A / D adjust · W shoot</small></div>
            <PowerBar shooter={p1} onAdjust={(delta) => adjustPower('p1', delta)} onShoot={() => shoot('p1')} />
          </div>
          <div className="midline"><span>VS</span></div>
          <div className={`lane p2 ${ballFlash === 'p2' ? 'made' : ''}`}>
            <div className="hoop"><span /></div>
            <div className="player">●</div>
            <div className="ball" />
            <div className="lane-copy"><strong>PLAYER 2</strong><small>← / → adjust · ↑ shoot</small></div>
            <PowerBar shooter={p2} onAdjust={(delta) => adjustPower('p2', delta)} onShoot={() => shoot('p2')} />
          </div>
          {!running && (
            <div className="start-overlay">
              <div className="basketball">🏀</div>
              <h2>{winner || '30-SECOND HOOP DUEL'}</h2>
              <p>Pick a power. Shoot. Beat your friend on the same keyboard or phone.</p>
              <button onClick={start}>{total ? 'REMATCH' : 'START DUEL'}</button>
            </div>
          )}
        </div>

        <div className="mobile-controls">
          <div><b>P1</b><button onClick={() => adjustPower('p1', -8)}>−</button><button onClick={() => adjustPower('p1', 8)}>+</button><button className="shoot" onClick={() => shoot('p1')}>SHOOT</button></div>
          <div><b>P2</b><button onClick={() => adjustPower('p2', -8)}>−</button><button onClick={() => adjustPower('p2', 8)}>+</button><button className="shoot" onClick={() => shoot('p2')}>SHOOT</button></div>
        </div>

        <p className="rules">Aim for the moving sweet spot on the power meter. Closest shots score most consistently. No signup, no download.</p>
      </section>
      <style>{styles}</style>
    </main>
  );
}

function PowerBar({ shooter, onAdjust, onShoot }: { shooter: Shooter; onAdjust: (delta: number) => void; onShoot: () => void }) {
  return <div className="power"><div className="power-head"><span>POWER</span><b>{shooter.power}%</b></div><div className="meter"><i style={{ left: `${shooter.target}%` }} /><strong style={{ width: `${shooter.power}%` }} /></div><div className="power-buttons"><button onClick={() => onAdjust(-8)}>−</button><button onClick={() => onAdjust(8)}>+</button><button className="shoot" disabled={shooter.shooting} onClick={onShoot}>{shooter.shooting ? 'IN AIR' : 'SHOOT'}</button></div></div>;
}

const styles = `
:root{--lime:#b7f34a;--ink:#07090d;--panel:#0f131b;--line:#283143;--muted:#8993a6}
.hoop-page{min-height:100vh;background:radial-gradient(circle at 50% -15%,#203022 0,#07090d 42%);padding:18px;color:#f7f9fc;font-family:'DM Sans',sans-serif}.hoop-shell{max-width:1100px;margin:auto}.hoop-top{height:64px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;border-bottom:1px solid var(--line)}.hoop-top a{color:var(--muted);font-size:12px;font-weight:800}.hoop-top a:hover{color:#fff}.hoop-top div{text-align:center}.hoop-top span{font-size:9px;letter-spacing:.16em;color:var(--lime);font-weight:900}.hoop-top h1{font-family:'Space Grotesk',sans-serif;font-size:23px;margin:2px 0 0;letter-spacing:-.04em}.hoop-top>strong{text-align:right;font-family:'Space Grotesk';font-size:25px}.scoreboard{display:grid;grid-template-columns:1fr 150px 1fr;align-items:center;gap:15px;padding:18px 0}.scoreboard>div:not(.score-status){display:flex;align-items:center;gap:12px}.scoreboard>div:last-child{justify-content:flex-end}.scoreboard span{font-size:10px;letter-spacing:.12em;color:var(--muted);font-weight:900}.scoreboard b{font-family:'Space Grotesk';font-size:34px}.score-status{text-align:center}.score-status small,.score-status em{display:block;font-style:normal;font-size:9px;letter-spacing:.1em;color:var(--muted)}.score-status em{margin-top:4px;color:#657084}.court{position:relative;display:grid;grid-template-columns:1fr 44px 1fr;min-height:560px;border:1px solid var(--line);border-radius:26px;overflow:hidden;background:linear-gradient(90deg,#1c3b29 0,#214b31 49%,#214b31 51%,#1c3b29 100%);box-shadow:0 25px 70px #0008}.court:before{content:'';position:absolute;inset:25px;border:1px solid #ffffff1b;border-radius:20px;pointer-events:none}.lane{position:relative;padding:38px 34px;overflow:hidden}.lane.p1{border-right:1px solid #ffffff12}.lane.p2{border-left:1px solid #ffffff12}.midline{display:grid;place-items:center;border-left:1px solid #ffffff12;border-right:1px solid #ffffff12;background:#101a14}.midline span{width:34px;height:34px;border:1px solid #ffffff25;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:900;color:#ffffff80}.hoop{position:absolute;top:65px;width:110px;height:92px;border:5px solid #f7f9fc;border-bottom:0;border-radius:55px 55px 0 0;opacity:.9}.p1 .hoop{left:36px}.p2 .hoop{right:36px}.hoop span{position:absolute;bottom:-4px;left:50%;width:56px;height:12px;border:3px solid #ff7a45;border-radius:50%;transform:translateX(-50%)}.player{position:absolute;bottom:205px;width:42px;height:42px;border-radius:50%;background:var(--lime);color:#16220d;display:grid;place-items:center;box-shadow:0 10px 25px #0005;font-size:15px}.p1 .player{left:28%}.p2 .player{right:28%;background:#78e4ff}.ball{position:absolute;bottom:247px;width:18px;height:18px;border-radius:50%;background:#ff9a5c;box-shadow:0 5px 16px #0007}.p1 .ball{left:43%}.p2 .ball{right:43%}.lane-copy{position:absolute;bottom:31px;left:34px}.p2 .lane-copy{left:auto;right:34px;text-align:right}.lane-copy strong{display:block;font-family:'Space Grotesk';font-size:17px}.lane-copy small{display:block;margin-top:4px;color:#ffffff78;font-size:10px}.power{position:absolute;left:34px;right:34px;top:190px}.p2 .power{direction:rtl}.power-head{display:flex;justify-content:space-between;margin-bottom:7px;font-size:9px;letter-spacing:.12em;color:#ffffff88;font-weight:900}.power-head b{color:#fff}.meter{height:12px;position:relative;background:#0d1510;border:1px solid #ffffff18;border-radius:99px;overflow:hidden}.meter strong{display:block;height:100%;background:var(--lime);border-radius:99px;opacity:.9}.p2 .meter strong{background:#78e4ff}.meter i{position:absolute;z-index:2;top:0;bottom:0;width:3px;background:#fff;box-shadow:0 0 10px #fff;transform:translateX(-50%)}.power-buttons{display:flex;gap:7px;margin-top:10px}.power-buttons button,.mobile-controls button{height:36px;min-width:36px;border:1px solid #ffffff1c;border-radius:9px;background:#0e1711;color:#fff;font-weight:900}.power-buttons .shoot,.mobile-controls .shoot{flex:1;background:var(--lime);color:#0b1108;border-color:var(--lime)}.p2 .power-buttons .shoot{background:#78e4ff;border-color:#78e4ff}.power-buttons button:disabled{opacity:.45}.start-overlay{position:absolute;inset:0;z-index:5;display:grid;place-items:center;align-content:center;text-align:center;padding:30px;background:#07090de8;backdrop-filter:blur(5px)}.basketball{font-size:65px}.start-overlay h2{font-family:'Space Grotesk';font-size:clamp(28px,5vw,50px);letter-spacing:-.05em;margin:13px 0 8px}.start-overlay p{max-width:500px;margin:0 0 20px;color:var(--muted);font-size:13px;line-height:1.6}.start-overlay button{border:0;border-radius:12px;padding:14px 24px;background:var(--lime);color:#0b1108;font-weight:900;letter-spacing:.06em}.lane.made .ball{animation:swish .3s ease-out}@keyframes swish{50%{transform:translate(20px,-45px) scale(.7);opacity:.5}100%{transform:translate(35px,10px)}}.mobile-controls{display:none}.rules{text-align:center;color:#667184;font-size:10px;margin:16px 0 0}.mobile-controls>div{display:grid;grid-template-columns:auto 38px 38px 1fr;gap:6px;align-items:center}.mobile-controls b{font-size:10px;color:var(--muted)}
@media(max-width:760px){.hoop-page{padding:10px}.hoop-top{grid-template-columns:auto 1fr auto;height:56px}.hoop-top div{text-align:left}.scoreboard{grid-template-columns:1fr 80px 1fr;padding:13px 0}.scoreboard b{font-size:28px}.court{grid-template-columns:1fr;min-height:650px;border-radius:20px}.midline{display:none}.lane{min-height:315px;padding:24px}.lane.p1{border-right:0;border-bottom:1px solid #ffffff15}.lane.p2{border-left:0}.p1 .hoop{left:24px;top:35px}.p2 .hoop{right:24px;top:35px}.player{bottom:145px}.ball{bottom:188px}.power{left:24px;right:24px;top:120px}.lane-copy{bottom:18px;left:24px}.p2 .lane-copy{right:24px}.mobile-controls{display:grid;gap:7px;margin-top:10px}.rules{line-height:1.6}.score-status em{display:none}}
`;
