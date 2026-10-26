'use strict';
/* ---- Musashi: el rōnin (tinta, cortes) ---- */
// Sólo registra el lanzamiento resuelto; el motor entrega su área exacta, incluida evolución.
function vfxMusashiThousand(x, y, r){
  if(SFA_REC.on) SFA_REC.fx.push({fn:'musashi-thousand', x, y, r});
}
const musashiThousandGeometry = c => c.rec.fx.find(p => p.fn === 'musashi-thousand');
// Receta nativa exclusiva: ensō abierto y catorce cortes; sin masas que crucen el cuerpo.
// UF invoca este pintor después de cargar su rasterizador; no consume azar de combate.
function musashiThousandForm(){ return {N:24, tall:1, dur:1200, gdur:0, shake:2,
  paint(L, o){
    const {P,R,cx,cy,q,f}=o,S=L.soft,H=L.hard;
    if(f===23)return;
    const enter=Math.min(1,q/.12),fade=q>.66?Math.max(0,(1-q)/.34):1;
    // El borde se mantiene en el radio entregado por combate; el centro queda abierto.
    for(let i=0;i<56;i++){
      const a=i*Math.PI*2/56;
      if(i%7>3||!ufDith(i,f,fade*.6))continue;
      ufPx(S,cx+Math.cos(a)*R,cy+Math.sin(a)*R,P.d);
      if(q<.18)ufPx(H,cx+Math.cos(a)*R,cy+Math.sin(a)*R,P.b);
    }
    if(q<.08)return;
    for(let j=0;j<14;j++){
      if(!ufDith(j*3,f,fade))continue;
      const phase=((q-.08)*2.6+j/14)%1;
      if(phase>.55)continue;
      const a=j*Math.PI*2/14+phase*.28,rad=R*(.66+.15*phase);
      const span=.24*Math.sin(phase/.55*Math.PI)*enter;
      // Barrido tangencial corto: talón oscuro y punta fina; nunca converge sobre el dueño.
      for(let s=0;s<5;s++){
        const u=s/5,v=(s+1)/5,aa=a-span/2+span*u,ab=a-span/2+span*v;
        const x=cx+Math.cos(aa)*rad,y=cy+Math.sin(aa)*rad;
        const bx=cx+Math.cos(ab)*rad,by=cy+Math.sin(ab)*rad;
        if(s<4)ufLine(S,x,y,bx,by,2,P.o);
        ufLine(H,x,y,bx,by,1,s<2?P.a:s<4?P.b:P.c);
      }
    }
  }
}; }
SFA_BIND.musashi = {themes: ['ink'],
  0: sfaMulti(sfaDash('ink', {w: 30}), sfaTgtBurst('ink', 54)),
  1: sfaMulti(sfaDash('ink', {w: 30}), sfaTgtBurst('ink', 46)),
  2: c => { const p = musashiThousandGeometry(c); if(p) sfaP('nova', 'ink', p.x, p.y, p.r, {dur: 700}); },
  ult: c => { sfaP('nova', 'ink', c.h.x, c.h.y, 200, {dur: 1000}); const t = c.h.duelTarget; if (t) sfaP('burst', 'ink', t.x, t.y, 70, {dur: 700}); }
};
