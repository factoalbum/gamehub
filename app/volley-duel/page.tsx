'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './volley-duel.css';
import { trackGame } from '../lib/analytics';

type Player = { x: number; y: number; vy: number; score: number };
type Ball = { x: number; y: number; vx: number; vy: number };

const W = 960, H = 520, FLOOR = 455, NET_X = W / 2, NET_H = 150, PLAYER_W = 32, PLAYER_H = 62, GRAVITY = 0.34, WIN = 7;
const makePlayers = (): [Player, Player] => [{ x: 180, y: FLOOR - PLAYER_H, vy: 0, score: 0 }, { x: W - 212, y: FLOOR - PLAYER_H, vy: 0, score: 0 }];
const makeBall = (dir = 1): Ball => ({ x: W / 2 + dir * 80, y: 180, vx: dir * 4.5, vy: -2.5 });

export default function VolleyDuel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef(new Set<string>());
  const players = useRef<[Player, Player]>(makePlayers());
  const ball = useRef<Ball>(makeBall());
  const phase = useRef<'ready' | 'playing' | 'over'>('ready');
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const [uiPhase, setUiPhase] = useState(phase.current);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState(0);
  const [message, setMessage] = useState('First to 7 points wins');

  const reset = useCallback((start = true) => {
    players.current = makePlayers(); ball.current = makeBall(Math.random() > .5 ? 1 : -1);
    phase.current = start ? 'playing' : 'ready'; setUiPhase(phase.current); setScore([0, 0]); setWinner(0); setMessage('First to 7 points wins');
    trackGame(start ? 'game_restart' : 'game_open', 'volley-duel');
  }, []);

  const serve = useCallback((dir: 1 | -1) => { if (phase.current !== 'playing') return; ball.current = makeBall(dir); }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['a','d','w','f','arrowleft','arrowright','arrowup','l','enter',' '].includes(k)) e.preventDefault();
      if (k === 'f') serve(1); if (k === 'l') serve(-1);
      if (k === 'enter' || k === ' ') { if (phase.current !== 'playing') reset(true); }
      keys.current.add(k);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [reset, serve]);

  useEffect(() => {
    trackGame('game_open', 'volley-duel');
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return;
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.aspectRatio = `${W}/${H}`; ctx.setTransform(dpr,0,0,dpr,0,0); };
    resize(); window.addEventListener('resize', resize);

    const scorePoint = (pointFor: 0 | 1) => {
      players.current[pointFor].score += 1; const s: [number,number] = [players.current[0].score, players.current[1].score]; setScore(s);
      if (s[pointFor] >= WIN) { phase.current = 'over'; setUiPhase('over'); setWinner(pointFor + 1); setMessage(`PLAYER ${pointFor + 1} WINS!`); trackGame('game_finish','volley-duel',{winner: pointFor + 1, score: s[pointFor]}); return; }
      setMessage(`POINT PLAYER ${pointFor + 1}`); ball.current = makeBall(pointFor === 0 ? 1 : -1);
    };

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const bg = ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#101a29'); bg.addColorStop(1,'#070b12'); ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#172b45'; ctx.fillRect(0,FLOOR,W,H-FLOOR);
      ctx.strokeStyle='#395777'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,FLOOR); ctx.lineTo(W,FLOOR); ctx.stroke();
      ctx.strokeStyle='#24364f'; ctx.setLineDash([8,10]); ctx.beginPath(); ctx.moveTo(NET_X,0); ctx.lineTo(NET_X,FLOOR); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#dfe8f4'; ctx.fillRect(NET_X-5,FLOOR-NET_H,10,NET_H); ctx.fillStyle='#b7f34a'; ctx.fillRect(NET_X-8,FLOOR-NET_H-7,16,7);
      const ps=players.current; const b=ball.current;
      for (let i=0;i<2;i++){ const p=ps[i]; ctx.fillStyle=i===0?'#b7f34a':'#78e4ff'; ctx.beginPath(); ctx.roundRect(p.x,p.y,PLAYER_W,PLAYER_H,10); ctx.fill(); ctx.fillStyle='#0a0d13'; ctx.fillRect(p.x+7,p.y+12,18,6); ctx.fillRect(p.x+6,p.y+PLAYER_H-9,20,6); }
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(b.x,b.y,12,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#aeb9c9'; ctx.lineWidth=2; ctx.stroke();
      if (uiPhase !== 'playing') { ctx.fillStyle='rgba(5,8,13,.58)'; ctx.fillRect(0,0,W,H); }
    };

    const tick = (time:number) => {
      const dt = Math.min((time-last.current)/16.67 || 1, 2); last.current=time;
      if (phase.current==='playing') {
        const ps=players.current, b=ball.current;
        const move=(p:Player,left:string,right:string,jump:string)=>{ if(keys.current.has(left)) p.x-=5.2*dt; if(keys.current.has(right)) p.x+=5.2*dt; if(keys.current.has(jump)&&p.y>=FLOOR-PLAYER_H-1) p.vy=-8.5; p.vy+=GRAVITY*dt; p.y+=p.vy*dt; if(p.y>FLOOR-PLAYER_H){p.y=FLOOR-PLAYER_H;p.vy=0;} };
        move(ps[0],'a','d','w'); move(ps[1],'arrowleft','arrowright','arrowup');
        ps[0].x=Math.max(8,Math.min(NET_X-PLAYER_W-10,ps[0].x)); ps[1].x=Math.max(NET_X+10,Math.min(W-PLAYER_W-8,ps[1].x));
        b.vy+=GRAVITY*dt; b.x+=b.vx*dt; b.y+=b.vy*dt;
        if(b.x<12){b.x=12;b.vx=Math.abs(b.vx);} if(b.x>W-12){b.x=W-12;b.vx=-Math.abs(b.vx);}
        if(b.y<12){b.y=12;b.vy=Math.abs(b.vy)*.9;}
        const netTop=FLOOR-NET_H;
        if(b.x>NET_X-8&&b.x<NET_X+8&&b.y>netTop-12){b.x=b.x<NET_X?NET_X-10:NET_X+10;b.vx=b.x<NET_X?-Math.abs(b.vx):Math.abs(b.vx);}
        for(let i=0;i<2;i++){const p=ps[i]; if(b.x>p.x-12&&b.x<p.x+PLAYER_W+12&&b.y>p.y-14&&b.y<p.y+PLAYER_H+10&&b.vy>0){const hit=(b.x-(p.x+PLAYER_W/2))/(PLAYER_W/2); b.vx=(i===0?1:-1)*(5.5+Math.abs(hit)*2); b.vy=-8.4-Math.abs(hit)*2; b.x=i===0?p.x+PLAYER_W+13:p.x-13; setMessage(`PLAYER ${i+1} RETURNS!`);}}
        if(b.y>FLOOR+18) scorePoint(b.x<NET_X?1:0);
      }
      draw(); raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return ()=>{ window.removeEventListener('resize',resize); if(raf.current) cancelAnimationFrame(raf.current); };
  }, [uiPhase]);

  return <main className="volley-page"><div className="volley-shell">
    <header className="volley-top"><a href="/gamehub/">← GAMEHUB</a><span>2 PLAYER SPORTS</span></header>
    <div className="volley-card">
      <div className="volley-head"><div><span className="eyebrow">LOCAL MULTIPLAYER</span><h1>Volley Duel</h1><p>Keep it up. Return it. Beat your friend.</p></div><div className="volley-score"><strong>{score[0]}</strong><i>:</i><strong>{score[1]}</strong></div></div>
      <div className="court-wrap"><canvas ref={canvasRef} aria-label="Volley Duel court" />{uiPhase!=='playing'&&<div className="volley-overlay"><span>{winner?`PLAYER ${winner} TAKES IT`:'READY?'}</span><h2>{message}</h2><button onClick={()=>reset(true)}>{winner?'REMATCH':'PLAY NOW'} ↗</button></div>}</div>
      <div className="volley-info"><div><b>P1</b><span>A / D move · W jump · F serve</span></div><div><b>P2</b><span>← / → move · ↑ jump · L serve</span></div><div><b>FIRST TO {WIN}</b><span>Miss the return = point</span></div></div>
      <div className="touch-controls"><div><button onPointerDown={()=>keys.current.add('a')} onPointerUp={()=>keys.current.delete('a')}>←</button><button onPointerDown={()=>keys.current.add('d')} onPointerUp={()=>keys.current.delete('d')}>→</button><button onPointerDown={()=>keys.current.add('w')} onPointerUp={()=>keys.current.delete('w')}>JUMP</button></div><div><button onPointerDown={()=>keys.current.add('arrowleft')} onPointerUp={()=>keys.current.delete('arrowleft')}>←</button><button onPointerDown={()=>keys.current.add('arrowright')} onPointerUp={()=>keys.current.delete('arrowright')}>→</button><button onPointerDown={()=>keys.current.add('arrowup')} onPointerUp={()=>keys.current.delete('arrowup')}>JUMP</button></div></div>
    </div>
  </div></main>;
}
