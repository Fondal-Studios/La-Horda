'use strict';
/* ---- Iria: tejedora de límites (hilos, triángulos) ---- */
SFA_OBJ.anchor = {theme: 'thread', draw: iriaDrawAnchor, end: 'nova', endDur: 480};
SFA_OBJ.triangle = {theme: 'thread', draw: o => { const age = (o.maxLife || o.life) - o.life, a = Math.min(1, age / 260, o.life / 420) * .85; if (a <= 0) return; ctx.save(); ctx.imageSmoothingEnabled = false;
  sfaBeamTiles(ctx, 'thread', o.ax, o.ay, o.bx, o.by, 18, a, 1); sfaBeamTiles(ctx, 'thread', o.bx, o.by, o.cx, o.cy, 18, a, 1); sfaBeamTiles(ctx, 'thread', o.cx, o.cy, o.ax, o.ay, 18, a, 1); ctx.restore(); }};
SFA_POLL.push(() => { for (const h of heroes) { if (!h.alive || h.classKey !== 'iria') continue; const tension = h.portTensionTimer > 0;
  ctx.save(); ctx.imageSmoothingEnabled = false; for (const l of portadorLinks(h)) { if(tension) iriaDrawTension(l,h); else sfaBeamTiles(ctx, 'thread', l.a.x, l.a.y, l.b.x, l.b.y, 9, .5, 1); } ctx.restore(); } });
SFA_BIND.iria = {themes: ['thread'],
  0: c => { const o = sfaObj(c, /anchor/); if (o) { sfaP('burst', 'thread', o.x, o.y, 44, {dur: 520}); sfaP('nova', 'thread', o.x, o.y, 30, {dur: 560}); } },
  1: sfaNovaAt('thread', {self: true, r: 80}),
  2: c => { const p = c.rec.pts[0] || c.h; sfaP('nova', 'thread', p.x, p.y, c.sk.radius || 75, {dur: 640}); },
  ult: c => { const o = sfaObj(c, /triangle/), p = o ? {x: (o.ax + o.bx + o.cx) / 3, y: (o.ay + o.by + o.cy) / 3} : c.h; sfaP('nova', 'thread', p.x, p.y, 160, {dur: 1000}); }
};

// Native strips, scoped to Iria. No random calls or changes to combat state.
const iriaStripCache = new Map();
function iriaNativeStrip(kind) {
  if (iriaStripCache.has(kind)) return iriaStripCache.get(kind);
  const dims = {anchor:[32,48,18],tension:[200,24,16],cut:[104,104,10]}[kind];
  if (!dims) return null;
  const [w,h,n]=dims, S=new SfaStrip(w,h,n), P={o:sfaCol('#181830'),d:sfaCol('#4e50a0'),a:sfaCol('#8889c1'),b:sfaCol('#e3e0ff'),c:sfaCol('#ffffff'),e:sfaCol('#ffd870')};
  const line=(f,x0,y0,x1,y1,col)=>{x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;for(;;){S.set(f,x0,y0,col);if(x0===x1&&y0===y1)break;const e=2*er;if(e>=dy){er+=dy;x0+=sx;}if(e<=dx){er+=dx;y0+=sy;}}};
  const stroke=(f,x0,y0,x1,y1,col)=>{for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])line(f,x0+dx,y0+dy,x1+dx,y1+dy,P.o);line(f,x0,y0,x1,y1,col);};
  for(let f=0;f<n;f++) {
    if(kind==='anchor') {
      // Threaded needle with open eye and two inward hooks, not a nautical anchor.
      const drop=f<3?(2-f)*5:0,cy=10-drop;
      stroke(f,16,cy+6,16,35-drop,P.b);
      for(const [a,b,c,d] of [[16,cy,20,cy+4],[20,cy+4,16,cy+8],[16,cy+8,12,cy+4],[12,cy+4,16,cy]])stroke(f,a,b,c,d,P.a);
      stroke(f,7,30-drop,10,36-drop,P.a);stroke(f,10,36-drop,16,39-drop,P.b);stroke(f,25,30-drop,22,36-drop,P.a);stroke(f,22,36-drop,16,39-drop,P.b);
      const sway=Math.round(Math.sin((f-10)*Math.PI/4)*2);
      stroke(f,16,cy+3,6+sway,19,P.a);stroke(f,6+sway,19,8,25,P.b);
      if(f>=3&&f<6){const r=(f-2)*3;line(f,16-r,42,16+r,42,P.e);}
      if(f>=6&&f<10)for(let y=40;y<46;y++)for(let x=3;x<29;x++)if((x+y+f)%5===0)S.set(f,x,y,0);
    } else if(kind==='tension') {
      // Three separated threads; tiny transverse ties travel along the true segment.
      for(let x=3;x<w-3;x++){const amp=f<3?3-f:f<6?2:1;const wave=Math.round(Math.sin(x*.12+f*.8)*amp);for(const dy of [-5,0,5]){const y=12+dy+wave;S.set(f,x,y-1,P.o);S.set(f,x,y,P.b);S.set(f,x,y+1,P.d);}if((x+f*5)%38===0)line(f,x,5,x+3,19,P.e);}
    } else {
      // Closing scissors and separated thread tails. Candidate only: no false impact hook.
      if(f===9)continue;
      const gap=f<3?18-f*5:f<6?2:(f-5)*5;
      stroke(f,27,76,71,25+gap,P.b);stroke(f,77,76,33,25+gap,P.c);
      for(const cx of [25,79]){for(let i=0;i<24;i++){let a=i*Math.PI/12,b=(i+1)*Math.PI/12;stroke(f,cx+7*Math.cos(a),78+7*Math.sin(a),cx+7*Math.cos(b),78+7*Math.sin(b),P.a);}}
      stroke(f,10,47,46-(f>=3?(f-2)*3:0),47,P.e);stroke(f,58+(f>=3?(f-2)*3:0),47,94,47,P.e);
      if(f>=6)for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(sfaHash(x,y)<(f-5)/4)S.set(f,x,y,0);
    }
  }
  const out={cv:S.toCanvas(),w,h,n};iriaStripCache.set(kind,out);return out;
}
function iriaDrawAnchor(o) {
  const b=iriaNativeStrip('anchor'), age=Math.max(0,(o.maxLife||16000)-o.life);
  const f=age<700?Math.min(9,Math.floor(age/70)):10+Math.floor((age-700)/100)%8;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=Math.min(1,age/200,o.life/420)*.9;
  ctx.drawImage(b.cv,f*b.w,0,b.w,b.h,Math.round(o.x-16),Math.round(o.y-35),32,48);ctx.restore();
}
function iriaDrawTension(l,h) {
  const b=iriaNativeStrip('tension'),dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,L=Math.hypot(dx,dy);
  if(L<=0)return;const f=10+Math.floor(Math.max(0,h.portTensionTimer)/100)%6;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(l.a.x,l.a.y);ctx.rotate(Math.atan2(dy,dx));ctx.globalAlpha=.9;
  ctx.drawImage(b.cv,f*b.w,0,b.w,b.h,0,-9,L,18);ctx.restore();
}
