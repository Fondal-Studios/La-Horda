'use strict';
// Recetas nativas: eslabones huecos, anclaje y candados. Sólo dibujo.
function eslabonFxStrip(kind,T,art,size){
  if(!(['hook','line','ward'].includes(kind))||!['beam','burst','aura'].includes(art))return null;
  if(art==='aura'&&kind!=='ward')return null;
  const beam=art==='beam',aura=art==='aura',W=beam?16:aura?48:size,H=beam?size:aura?56:size,N=beam?8:12;
  const S=new SfaStrip(W,H,N),P=T.px,c=W/2,cy=H/2;
  for(let f=0;f<N;f++){
    const q=f/(N-1),fade=beam||aura?1:q<.6?1:(1-q)/.4;
    const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x<1||x>=W-1||y<1||y>=H-1)return;if(sfaDither(x,y,fade))S.set(f,x,y,col);};
    const line=(x,y,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(bx-x),Math.abs(by-y))));for(let i=0;i<=n;i++)dot(x+(bx-x)*i/n,y+(by-y)*i/n,col);};
    const stroke=(x,y,bx,by)=>{line(x,y+1,bx,by+1,P.o);line(x,y,bx,by,P.b);};
    const link=(x,y,rx,ry)=>{stroke(x-rx+1,y-ry,x+rx-1,y-ry);stroke(x+rx,y-ry+1,x+rx,y+ry-1);stroke(x+rx-1,y+ry,x-rx+1,y+ry);stroke(x-rx,y+ry-1,x-rx,y-ry+1);dot(x-rx+1,y-ry,P.c);};
    const lock=(x,y,k)=>{link(x,y-5,3,4);for(let dy=0;dy<7;dy++)for(let dx=-5;dx<=5;dx++)dot(x+dx,y+dy,dy===0||dy===6||Math.abs(dx)===5?P.o:P.a);line(x-3,y+1,x+3,y+1,P.b);dot(x,y+3,P.o);dot(x,y+4,P.o);if(k)dot(x+4,y+2,P.c);};
    if(beam){
      // Teja de 16 px; los huecos interiores sobreviven sin una banda maciza.
      const bob=kind==='line'?0:Math.round(Math.sin(f*Math.PI/4));
      link(5,cy+bob,4,kind==='ward'?2:3);link(11,cy-bob,3,2);
      if(kind==='line'){stroke(8,cy-5,8,cy-3);dot(8,cy-5,P.c);}
    }else if(aura){
      const bob=Math.round(Math.sin(q*Math.PI*2));
      lock(8,27+bob,f%4===0);lock(39,33-bob,f%4===2);
      link(8,44+bob,3,2);link(39,47-bob,3,2);
    }else if(kind==='hook'){
      const r=Math.max(5,(W/2-4)*(.45+.42*Math.min(1,q/.55)));
      // Mandíbula curva y cuello de gancho, sin estrella de impacto.
      stroke(c-r*.7,cy-r*.6,c-r*.7,cy+r*.35);stroke(c-r*.7,cy+r*.35,c-r*.3,cy+r*.7);
      stroke(c-r*.3,cy+r*.7,c+r*.4,cy+r*.7);stroke(c+r*.4,cy+r*.7,c+r*.75,cy+r*.2);
      stroke(c+r*.75,cy+r*.2,c+r*.4,cy-r*.1);link(c-r*.7,cy-r*.75,2,2);
      if(f>2&&f<9){stroke(c+r*.65,cy-r*.7,c+r*.8,cy-r*.45);dot(c+r*.2,cy-r*.65,P.c);}
    }else if(kind==='line'){
      const drop=(1-Math.min(1,q/.4))*W*.12,rr=Math.max(4,W*.18);
      stroke(c,cy-rr-drop,c,cy+rr);stroke(c-rr,cy+rr,c+rr,cy+rr);stroke(c-rr*.65,cy+rr-2,c+rr*.65,cy+rr-2);
      link(c,cy-rr-drop,3,3);stroke(c-rr,cy,c-3,cy);stroke(c+3,cy,c+rr,cy);
      if(f>2&&f<9){dot(c-rr-2,cy+rr+2,P.a);dot(c+rr+2,cy+rr+1,P.b);}
    }else{lock(c,cy-2,f<5);}
  }
  return S;
}
for(const kind of ['hook','line','ward'])sfaDefineTheme('eslabon_'+kind,{...sfaThemes.chain,bake:(T,art,size)=>eslabonFxStrip(kind,T,art,size)});

'use strict';
/* ---- Garren, el Eslabón (cadenas, eslabones) ---- */
SFA_OBJ.chain = {theme: 'eslabon_line', draw: sfaBeamObj('eslabon_line', o => o.ax !== undefined ? {ax: o.ax, ay: o.ay, bx: o.bx, by: o.by, w: 26} : null)};
SFA_HEROZ.push({key: 'eslabon', theme: 'chain', on: h => h.portRingTimer > 0, r: h => h.portRingR, end: 'nova', alpha: .75});
SFA_BIND.eslabon = {themes: ['chain','eslabon_hook','eslabon_line','eslabon_ward'],
  0: {extras:false,run:c => { const o = sfaObj(c, /hook/); if (o) { sfaP('beam', 'eslabon_hook', c.h.x, c.h.y - 12, 0, {bx: o.x, by: o.y - 12, w: 24, dur: 560, noEnd: 1}); sfaP('burst', 'eslabon_hook', o.x, o.y, 44, {dur: 480}); } }},
  1: {extras:false,run:c => { const o = sfaObj(c, /chain/); if (o) { sfaP('burst', 'eslabon_line', o.ax, o.ay, 40, {dur: 480}); sfaP('burst', 'eslabon_line', o.bx, o.by, 40, {dur: 480}); } }},
  2: {extras:false,run:c => { sfaP('aura', 'eslabon_ward', c.h.x, c.h.y, 44, {fi: sfaHeroIdx(c.h), dur: 2200}); const a = heroes[c.h.portWardSlot]; if (a && a !== c.h && a.alive) { sfaP('aura', 'eslabon_ward', a.x, a.y, 44, {fi: sfaHeroIdx(a), dur: 2200}); sfaP('beam', 'eslabon_ward', c.h.x, c.h.y - 12, 0, {bx: a.x, by: a.y - 12, w: 18, dur: 700, noEnd: 1}); } }},
  ult: c => sfaP('nova', 'chain', c.h.x, c.h.y, c.h.portRingR || 190, {dur: 1000})
};
