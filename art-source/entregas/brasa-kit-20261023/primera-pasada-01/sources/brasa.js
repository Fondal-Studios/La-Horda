'use strict';
/* Brasa: recetas nativas de montaje, purga, desmontaje y respiraderos.
 * Sólo raster/eventos visuales. Turret, proyectil nut y sirena UF conservados. */
function brasaFxStrip(kind,T,art,size,arc){
  const aura=art==='aura',cone=art==='cone',zone=art==='zone';
  if(!(kind==='mount'&&(art==='burst'||art==='nova')||kind==='purge'&&cone||kind==='dismantle'&&(art==='burst'||aura)||kind==='vent'&&zone))return null;
  arc=arc||.85;
  const W=aura?48:cone?size+2:size,H=aura?56:cone?Math.ceil(2*size*Math.sin(Math.min(arc,1.5))+6):size,N=12;
  const S=new SfaStrip(W,H,N),P=T.px,c=W/2,cy=H/2,R=cone?size-2:W/2-3;
  for(let f=0;f<N;f++){
    const q=f/(N-1),loop=aura||zone,fade=loop?1:q<.62?1:(1-q)/.38;
    const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x<1||y<1||x>=W-1||y>=H-1)return;
      if(cone&&(Math.hypot(x-1,y-cy)>R||Math.abs(Math.atan2(y-cy,x-1))>arc))return;
      if(sfaDither(x,y,fade))S.set(f,x,y,col);};
    const line=(ax,ay,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))));for(let i=0;i<=n;i++)dot(ax+(bx-ax)*i/n,ay+(by-ay)*i/n,col);};
    const bolt=(x,y,r)=>{line(x-r,y-1,x+r,y-1,P.o);line(x-r,y,x+r,y,P.b);line(x-r,y+1,x+r,y+1,P.d);dot(x,y-2,P.c);};
    const puff=(x,y,r,phase)=>{for(let a=.35;a<Math.PI*1.85;a+=1/Math.max(4,r*2)){const rr=r*(.85+.15*Math.cos(a*3+phase));dot(x+Math.cos(a)*rr,y+Math.sin(a)*rr,P.o);dot(x+Math.cos(a)*(rr-1),y+Math.sin(a)*(rr-1),P.c);}line(x-r*.4,y+r*.6,x+r*.3,y+r*.6,P.b);};
    if(kind==='mount'){
      if(art==='burst'){
        const reach=R*(.88-.35*Math.min(1,q/.55));
        for(const a of [-Math.PI*.78,-Math.PI*.22,Math.PI*.5]){
          const x=c+Math.cos(a)*reach,y=cy+Math.sin(a)*reach,u=Math.cos(a),v=Math.sin(a);
          line(x-u*5,y-v*5,x+u*3,y+v*3,P.o);line(x-u*5+1,y-v*5,x+u*3+1,y+v*3,P.a);
          line(x-v*4,y+u*4,x+v*4,y-u*4,P.b);bolt(x,y,2);
        }
      }else{
        const rr=R*(.55+.35*q);
        for(let j=0;j<4;j++)for(let a=j*Math.PI/2+.16;a<j*Math.PI/2+.95;a+=.03){dot(c+Math.cos(a)*rr,cy+Math.sin(a)*rr,P.o);dot(c+Math.cos(a)*(rr-1),cy+Math.sin(a)*(rr-1),P.b);}
        for(let j=0;j<4;j++){const a=j*Math.PI/2+.55;bolt(c+Math.cos(a)*rr,cy+Math.sin(a)*rr,2);}
      }
    }else if(cone){
      // Tres bocanadas con avance y rizo; canal vacío entre ellas, no abanico sólido.
      for(let j=-1;j<=1;j++){
        const a=j*arc*.58,reach=R*(.18+.64*Math.min(1,q/.65)),x=1+Math.cos(a)*reach,y=cy+Math.sin(a)*reach;
        puff(x,y,Math.max(3,R*(.08+.075*q)),q*5+j);
        for(let t=.12;t<.65;t+=.05){const d=reach*t;dot(1+Math.cos(a)*d,cy+Math.sin(a)*d+Math.sin(t*12+j)*2,P.b);}
      }
      if(f<4){line(2,cy-2,9,cy-2,P.a);line(2,cy+2,9,cy+2,P.o);}
    }else if(aura){
      for(const x of [5,42]){const y=37-Math.round(f/N*10);line(x,y-5,x,y+4,P.o);line(x+1,y-5,x+1,y+4,P.b);line(x-3,y-7,x,y-4,P.a);line(x+3,y-7,x,y-4,P.a);bolt(x,y+6,2);}
    }else if(kind==='dismantle'){
      for(let j=0;j<4;j++){const a=j*Math.PI/2-q*.9,r=R*(.85-.6*q);bolt(c+Math.cos(a)*r,cy+Math.sin(a)*r,2);if(f<8)line(c+Math.cos(a-.15)*r,cy+Math.sin(a-.15)*r,c+Math.cos(a-.4)*r,cy+Math.sin(a-.4)*r,P.d);}
    }else{
      // Vapor persistente ligado al objeto real; cuatro respiraderos, centro hueco.
      for(let j=0;j<4;j++){const a=j*Math.PI/2+.35,phase=(f+j*3)%N/N,x=c+Math.cos(a)*R*.63,y=cy+Math.sin(a)*R*.63-phase*R*.16;puff(x,y,Math.max(3,R*(.13+.04*phase)),phase*6);}
    }
  }
  return S;
}
for(const kind of ['mount','purge','dismantle','vent'])sfaDefineTheme('brasa_'+kind,{...sfaThemes.steam,bake:(T,art,size,arc)=>brasaFxStrip(kind,T,art,size,arc)});
SFA_OBJ.steam = {theme: 'brasa_vent', end: 'nova', endDur: 480};
SFA_BIND.brasa = {themes: ['steam','brasa_mount','brasa_purge','brasa_dismantle','brasa_vent'],
  0: {extras:false,run:c => { const o = sfaObj(c, /turret/); if (o) { sfaP('burst', 'brasa_mount', o.x, o.y, 44, {dur: 520}); sfaP('nova', 'brasa_mount', o.x, o.y, 40, {dur: 620}); } }},
  1: {extras:false,run:sfaCone('brasa_purge')},
  2: {extras:false,run:c=>{const dur=Math.max(0,c.h.portSpeedTimer||0);if(dur)sfaP('aura','brasa_dismantle',c.h.x,c.h.y,24,{fi:sfaHeroIdx(c.h),dur});sfaP('burst','brasa_dismantle',c.h.x,c.h.y,50,{dur:480});}},
  ult: c => { sfaP('nova', 'steam', c.h.x, c.h.y, 120, {dur: 1000}); sfaAura('steam')(c); for (const t of sfaOwn('turret').filter(o => o.owner === c.h)) sfaP('nova', 'steam', t.x, t.y, 56, {dur: 700}); }
};
