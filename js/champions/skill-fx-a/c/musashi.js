'use strict';
/* ---- Musashi: el rōnin (tinta, cortes) ---- */
// Sólo registra el lanzamiento resuelto; el motor entrega su área exacta, incluida evolución.
function vfxMusashiThousand(x, y, r){
  if(SFA_REC.on) SFA_REC.fx.push({fn:'musashi-thousand', x, y, r});
}
const musashiThousandGeometry = c => c.rec.fx.find(p => p.fn === 'musashi-thousand');
// Cortes discontinuos de katana: tres tandas, sin perímetro decorativo ni masa central.
function musashiThousandForm(){ return {N:24, tall:1, dur:460, gdur:0, shake:2,
  paint(L,o){
    const {P,R,cx,cy,q,f}=o,S=L.soft,H=L.hard;
    if(f===23)return;
    // Posiciones irregulares reproducibles; el radio recibido sigue delimitando el alcance.
    for(let j=0;j<9;j++){
      const phase=q*3-(j%3)*.52;
      if(phase<0||phase>1.15)continue;
      const a=j*2.399963,rad=R*(.45+(j%3)*.13);
      const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;
      const angle=a+(j%2?-.65:.85),len=R*.38;
      const head=Math.min(1,phase*2.8),tail=Math.max(0,(phase-.3)*1.3);
      if(tail>=head)continue;
      const dx=Math.cos(angle)*len,dy=Math.sin(angle)*len;
      const ax=x+dx*(tail-.5),ay=y+dy*(tail-.5);
      const bx=x+dx*(head-.5),by=y+dy*(head-.5);
      ufLine(S,ax,ay,bx,by,3,P.o);
      ufLine(H,ax,ay,bx,by,2,P.a);
      ufLine(H,ax+dy/len,ay-dx/len,bx,by,1,P.c);
    }
  }
}; }
SFA_BIND.musashi = {themes: ['ink'],
  0: sfaMulti(sfaDash('ink', {w: 30}), sfaTgtBurst('ink', 54)),
  1: sfaMulti(sfaDash('ink', {w: 30}), sfaTgtBurst('ink', 46)),
  2: c => { const p = musashiThousandGeometry(c); if(p) sfaP('nova', 'ink', p.x, p.y, p.r, {dur: 700}); },
  ult: c => { sfaP('nova', 'ink', c.h.x, c.h.y, 200, {dur: 1000}); const t = c.h.duelTarget; if (t) sfaP('burst', 'ink', t.x, t.y, 70, {dur: 700}); }
};
