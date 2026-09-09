'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './brick-quest.css';

type Brick = { x:number; y:number; w:number; h:number; hp:number; maxHp:number };
type Ball = { x:number; y:number; vx:number; vy:number; stuck?:boolean };
type Power = { x:number; y:number; kind:'wide'|'slow'|'multi'; vy:number };
const W=760,H=520,PADDLE=104,BH=18;
const paddleWidth=(wide:number)=>PADDLE+(wide>0?48:0);

function makeLevel(level:number):Brick[]{
  const cols=Math.min(10,7+Math.floor((level-1)/2));
  const rows=Math.min(7,4+Math.floor((level-1)/2));
  const gap=7,side=24,bw=(W-side*2-gap*(cols-1))/cols;
  const pattern=(r:number,c:number)=>level%4===0?((r+c)%3===0?0:1):level%3===0?(r===0||c===0||c===cols-1?2:1):1;
  return Array.from({length:rows*cols},(_,i)=>{const r=Math.floor(i/cols),c=i%cols,hp=Math.min(2,pattern(r,c)+(level>=6&&r<2?1:0));return {x:side+c*(bw+gap),y:52+r*(BH+7),w:bw,h:BH,hp,maxHp:hp};}).filter(b=>b.hp>0);
}

export default function BrickQuestPage(){
  const canvasRef=useRef<HTMLCanvasElement>(null),frame=useRef<number|null>(null);
  const s=useRef({running:false,paused:false,score:0,best:0,lives:3,level:1,paddle:W/2-PADDLE/2,wide:0,slow:0,won:false,bricks:makeLevel(1),balls:[{x:W/2,y:H-52,vx:2.8,vy:-4.2,stuck:true} as Ball],powers:[] as Power[]});
  const [ui,setUi]=useState({score:0,best:0,lives:3,level:1,status:'ready' as 'ready'|'playing'|'paused'|'over'|'won'});
  const sync=useCallback(()=>{const x=s.current;setUi({score:x.score,best:x.best,lives:x.lives,level:x.level,status:x.won?'won':x.running?(x.paused?'paused':'playing'):'over'});},[]);
  const resetBall=useCallback(()=>{const x=s.current;x.balls=[{x:W/2,y:H-52,vx:(Math.random()>.5?1:-1)*2.8,vy:-4.2,stuck:true}];},[]);
  const start=useCallback(()=>{const x=s.current;x.running=true;x.paused=false;x.won=false;x.score=0;x.lives=3;x.level=1;x.paddle=W/2-PADDLE/2;x.wide=0;x.slow=0;x.bricks=makeLevel(1);x.powers=[];resetBall();sync();},[resetBall,sync]);
  const move=useCallback((clientX:number)=>{const c=canvasRef.current;if(!c)return;const r=c.getBoundingClientRect(),px=(clientX-r.left)*W/r.width,pw=paddleWidth(s.current.wide);s.current.paddle=Math.max(0,Math.min(W-pw,px-pw/2));const b=s.current.balls[0];if(b?.stuck)b.x=s.current.paddle+pw/2;},[]);
  useEffect(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;
    const draw=()=>{const x=s.current;ctx.clearRect(0,0,W,H);ctx.fillStyle='#080b11';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(120,228,255,.06)';for(let gx=0;gx<W;gx+=38){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}for(let gy=0;gy<H;gy+=38){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
      for(const b of x.bricks){ctx.fillStyle=b.maxHp>=3?'#ffbd69':b.hp===2?'#78e4ff':'#b7f34a';ctx.globalAlpha=.86;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,5);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#071016';ctx.font='800 10px sans-serif';ctx.textAlign='center';if(b.maxHp>1)ctx.fillText(String(b.hp),b.x+b.w/2,b.y+13);}
      for(const p of x.powers){ctx.fillStyle=p.kind==='wide'?'#b7f34a':p.kind==='slow'?'#78e4ff':'#ffbd69';ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#071016';ctx.font='900 9px sans-serif';ctx.fillText(p.kind==='multi'?'×3':p.kind==='wide'?'W':'S',p.x,p.y+3);}
      const pw=paddleWidth(x.wide),py=H-34;ctx.fillStyle='#f7f9fc';ctx.beginPath();ctx.roundRect(x.paddle,py,pw,13,7);ctx.fill();for(const b of x.balls){ctx.fillStyle='#b7f34a';ctx.beginPath();ctx.arc(b.x,b.y,7,0,Math.PI*2);ctx.fill();}
      if(!x.running||x.paused){ctx.fillStyle='rgba(5,7,11,.68)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f7f9fc';ctx.font='800 31px sans-serif';ctx.textAlign='center';ctx.fillText(x.paused?'PAUSED':x.won?'QUEST CLEARED':'RUN OVER',W/2,H/2-10);ctx.fillStyle='#aeb7c8';ctx.font='600 14px sans-serif';ctx.fillText(x.paused?'P or tap pause to resume':x.won?'You cleared all 10 levels. Can you beat your best?':'Try again and chase a higher score.',W/2,H/2+20);}}
    const tick=()=>{const x=s.current;if(x.running&&!x.paused){const speedScale=x.slow>0?.72:1;x.slow=Math.max(0,x.slow-1);x.wide=Math.max(0,x.wide-1);const pw=paddleWidth(x.wide),py=H-34;
        for(let bi=x.balls.length-1;bi>=0;bi--){const b=x.balls[bi];if(b.stuck){b.x=x.paddle+pw/2;continue;}b.x+=b.vx*speedScale;b.y+=b.vy*speedScale;if(b.x<7||b.x>W-7){b.x=Math.max(7,Math.min(W-7,b.x));b.vx*=-1;}if(b.y<7){b.y=7;b.vy=Math.abs(b.vy);}if(b.vy>0&&b.y+7>=py&&b.y-7<=py+13&&b.x>=x.paddle&&b.x<=x.paddle+pw){const hit=(b.x-(x.paddle+pw/2))/(pw/2),sp=Math.min(9,Math.hypot(b.vx,b.vy)*1.015);b.vx=sp*hit*.92;b.vy=-Math.sqrt(Math.max(7,sp*sp-b.vx*b.vx));b.y=py-8;}
          for(const br of x.bricks){if(br.hp<=0)continue;if(b.x+7>=br.x&&b.x-7<=br.x+br.w&&b.y+7>=br.y&&b.y-7<=br.y+br.h){br.hp--;x.score+=br.hp===0?10*x.level:3*x.level;if(Math.random()<.11)x.powers.push({x:br.x+br.w/2,y:br.y+br.h,vy:2.2,kind:['wide','slow','multi'][Math.floor(Math.random()*3)] as Power['kind']});b.vy*=-1;break;}}
          if(x.bricks.every(br=>br.hp<=0)){if(x.level>=10){x.running=false;x.won=true;x.best=Math.max(x.best,x.score);localStorage.setItem('gamehub:brick-quest-best',String(x.best));}else{x.level++;x.score+=100*x.level;x.bricks=makeLevel(x.level);resetBall();}}
          if(b.y>H+15){x.balls.splice(bi,1);if(!x.balls.length){x.lives--;if(x.lives<=0){x.running=false;x.best=Math.max(x.best,x.score);localStorage.setItem('gamehub:brick-quest-best',String(x.best));}else resetBall();}}
        }
        for(let i=x.powers.length-1;i>=0;i--){const p=x.powers[i];p.y+=p.vy;if(p.y>=py&&p.y<=py+18&&p.x>=x.paddle&&p.x<=x.paddle+pw){if(p.kind==='wide')x.wide=600;if(p.kind==='slow')x.slow=420;if(p.kind==='multi'){const base=x.balls[0];if(base){x.balls.push({x:base.x,y:base.y,vx:-base.vx*.9,vy:base.vy});x.balls.push({x:base.x,y:base.y,vx:base.vx*.9,vy:base.vy});}}x.score+=25;x.powers.splice(i,1);}else if(p.y>H)x.powers.splice(i,1);}
        sync();}draw();frame.current=requestAnimationFrame(tick);};frame.current=requestAnimationFrame(tick);return()=>{if(frame.current)cancelAnimationFrame(frame.current);};},[resetBall,sync]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(['ArrowLeft','ArrowRight','a','d','A','D','p','P',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')s.current.paddle=Math.max(0,s.current.paddle-34);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')s.current.paddle=Math.min(W-paddleWidth(s.current.wide),s.current.paddle+34);if(e.key===' '&&s.current.running&&s.current.balls[0]?.stuck)s.current.balls[0].stuck=false;if(e.key.toLowerCase()==='p'&&s.current.running){s.current.paused=!s.current.paused;sync();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[sync]);
  useEffect(()=>{const b=s.current;const v=Number(localStorage.getItem('gamehub:brick-quest-best')||0);b.best=v;setUi(u=>({...u,best:v}));},[]);
  return <main className="quest-page"><div className="game-shell quest-shell"><div className="game-top"><button onClick={()=>{window.location.href='/gamehub/'}} className="back">← <span>Games</span></button><span className="game-title">🧱 BRICK QUEST</span><span className="pill">LEVEL {ui.level}/10 · BEST {ui.best||'—'}</span></div><div className="quest-stage" onPointerMove={e=>move(e.clientX)} onPointerDown={e=>{if(s.current.balls[0]?.stuck&&s.current.running&&!s.current.paused)s.current.balls[0].stuck=false;move(e.clientX)}}><canvas ref={canvasRef} width={W} height={H} aria-label="Brick Quest game"/></div><div className="quest-controls"><span>🏆 {ui.score}</span><span>❤️ {ui.lives}</span><span>⚡ {ui.level}/10</span><button onClick={()=>{if(s.current.running){s.current.paused=!s.current.paused;sync();}}} disabled={!s.current.running}>{ui.status==='paused'?'RESUME':'PAUSE'}</button></div><div className="quest-actions"><button className="primary" onClick={start}>{ui.status==='over'||ui.status==='won'?'PLAY AGAIN':ui.status==='playing'||ui.status==='paused'?'RESTART QUEST':'START QUEST'}</button><p>Move with mouse/touch or ← → · tap/Space to launch · Catch W, S and ×3 power-ups.</p></div></div></main>;
}
