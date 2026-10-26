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
      const phase=(q-(j%3)*.22)/.52;
      if(phase<=0||phase>=1)continue;
      const origins=[[-.38,-.32],[.12,.13],[.43,.38],[.33,-.40],[-.40,.15],[.05,.46],[-.10,-.50],[.45,-.04],[-.36,.43]];
      const x=cx+origins[j][0]*R,y=cy+origins[j][1]*R;
      // Barridos diagonales cruzados, sin tangentes que reconstruyan un anillo.
      const angle=j%2?-.72:.62,len=R*.65;
      const head=Math.min(1,phase*2.8),tail=Math.max(0,(phase-.28)/.72);
      if(tail>=head)continue;
      const dx=Math.cos(angle)*len,dy=Math.sin(angle)*len;
      // Curva corta y afilada: la punta avanza, la cola se recoge sin dejar una hoja rígida.
      const point=t=>{const bend=Math.sin(t*Math.PI)*R*.05*(j%2?1:-1);
        return [x+dx*(t-.5)-dy/len*bend,y+dy*(t-.5)+dx/len*bend];};
      for(let k=0;k<5;k++){
        const t0=tail+(head-tail)*k/5,t1=tail+(head-tail)*(k+1)/5;
        const a0=point(t0),a1=point(t1);
        // Un píxel nativo de filo; la sombra lateral no engrosa ambas orillas.
        ufLine(S,a0[0]+1,a0[1]+1,a1[0]+1,a1[1]+1,1,P.o);
        ufLine(H,...a0,...a1,1,k>1?P.c:P.b);
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
