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
    // Tres barridos paralelos por tanda: sus puntas nunca convergen en una V.
    for(let wave=0;wave<3;wave++)for(let lane=0;lane<3;lane++){
      const phase=(q-wave*.31)/.30;
      if(phase<=0||phase>=1)continue;
      const angle=[.35,-.58,.85][wave],dx=Math.cos(angle),dy=Math.sin(angle);
      const offset=(lane-1)*R*.36,shift=[-.12,.08,-.04][wave]*R;
      const x=cx-dy*offset+dx*shift,y=cy+dx*offset+dy*shift;
      const head=Math.min(1,phase*2.8),tail=Math.max(0,(phase-.30)/.70),len=R*.82;
      if(head-tail<.18)continue;
      const point=t=>{const bend=Math.sin(t*Math.PI)*R*.045;
        return [x+dx*len*(t-.5)-dy*bend,y+dy*len*(t-.5)+dx*bend];};
      // Material local en soft: una sombra lateral, sin el segundo contorno de ufStep.
      for(let k=0;k<6;k++){
        const t0=tail+(head-tail)*k/6,t1=tail+(head-tail)*(k+1)/6;
        const a0=point(t0),a1=point(t1);
        ufLine(S,a0[0]-dy,a0[1]+dx,a1[0]-dy,a1[1]+dx,1,P.o);
        ufLine(S,...a0,...a1,1,k>1?P.c:P.b);
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
