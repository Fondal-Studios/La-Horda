'use strict';
/* Veyra, la Última Herida — tajos carmesí, sangre y latido. Antes: el arco blanco 'fxScytheSlash' (el mismo del Segador) y un escudo celeste.
   Abrir la herida (abanico de tajos) · Paso escarlata (estela de sangre) · Pacto de dolor (sello y vapor de sangre) · La última herida (corte enorme). Solo visual.
   Incisión recta usa vy_lance con el ancho y alcance reales; el abanico se conserva para el kit base. */
{
  const VY = ['#2a0612', '#7a1d38', '#ab3459', '#ff7d8e', '#ffd6dc'];
  kvbDefMotif('vy_drop', 4, 6, kvbBmp(['.r..', 'rhr.', 'rrrr', 'rrrr', '.rr.'], {r: '#ab3459', h: '#ff7d8e'}));
  kvbDefMotif('vy_wisp', 5, 8, kvbBmp(['..r..', '.rhr.', '.rhr.', 'rrhrr', '.rrr.', '.rr..', '..r..', '..r..'], {r: '#ab3459', h: '#ff7d8e'}));
  kvbDefMotif('vy_claw', 9, 9, (g, p) => { for(const [d, col] of [[0, '#ffd6dc'], [-2, '#ff7d8e'], [2, '#ab3459']]){ g.beginPath(); g.arc(p + 1, p + 8 + d * .2, 8 + d * .3, -1.2, -.15); g.strokeStyle = col; g.lineWidth = 1.2; g.stroke(); } });

  // Tres filos separados: barrido de 97 grados, sin disco genérico detrás.
  kvbDefDecal('vy_slash', 10, (g, q, S) => {
    const c=S/2,R=c-3,sweep=kvbEase(Math.min(1,q/.4)),fade=q<.5?1:(1-q)/.5;
    kvbLayer(g,S,fade,lg=>{
      for(let k=0;k<3;k++){
        const r=R*(.48+k*.22),outer=[],inner=[];
        for(let i=0;i<=16;i++){
          const u=i/16,a=-.85+1.7*u*sweep,w=(1+S/65)*(1-u*.8);
          outer.push([c+Math.cos(a)*(r+w),c+Math.sin(a)*(r+w)]);
          inner.unshift([c+Math.cos(a)*(r-w),c+Math.sin(a)*(r-w)]);
        }
        kvbPoly(lg,outer.concat(inner),VY[3],VY[0],1);
        kvbArcLine(lg,c,c,r,-.85,-.85+1.7*sweep,VY[4],1);
      }
    });
  });
  const woundDetails = (lg, c, R, rad, pal, q) => {
    const k = kvbEase(Math.min(1, q / .35)), L = rad * .95 * k, pts = []; for(let i = 0; i <= 8; i++){ const u = i / 8 * 2 - 1; pts.push([c + u * L * .85, c + u * L * .5 + (kvbHash(i, 4) - .5) * 7]); }
    for(const [col, th] of [[pal[0], 7], [pal[2], 5], [pal[3], 3], [pal[4], 1.4]]){ lg.beginPath(); lg.moveTo(pts[0][0], pts[0][1]); for(const p of pts) lg.lineTo(p[0], p[1]); lg.strokeStyle = col; lg.lineWidth = th; lg.lineJoin = 'miter'; lg.stroke(); }
    kvbCracks(lg, c, rad * .7, k, 6, pal[2], 1.4, 5);
  };
  kvbDefDecal('vy_wound', 10, kvbRingPaint(VY, {fillCol: '#7a1d38', core: '#ab3459', fill: .4, details: woundDetails, flash: '#ff7d8e', rimThick: 4}));
  // El pacto conserva su corazón partido y pulsa; no reutiliza una zona de daño.
  const pactPaint = idle => (g,q,S) => {
    const c=S/2,beat=idle?Math.pow(Math.max(0,Math.sin(q*Math.PI*4)),6):Math.sin(Math.min(1,q/.45)*Math.PI/2);
    const r=(c-4)*(.68+.16*beat),fade=idle?1:q<.6?1:(1-q)/.4;
    const pts=[[c,c+r*.85],[c-r*.9,c-r*.12],[c-r*.75,c-r*.65],[c-r*.3,c-r*.75],[c,c-r*.4],[c+r*.3,c-r*.75],[c+r*.75,c-r*.65],[c+r*.9,c-r*.12]];
    kvbLayer(g,S,Math.min(KVB_FILL_CAP,.18*fade),lg=>kvbPoly(lg,pts,VY[1]));
    kvbLayer(g,S,fade,lg=>{
      kvbPoly(lg,pts,null,VY[0],3);kvbPoly(lg,pts,null,VY[3],1);
      const seam=[[c,c-r*.4],[c-r*.18,c-r*.1],[c+r*.15,c+r*.08],[c-r*.12,c+r*.35],[c,c+r*.78]];
      for(let i=1;i<seam.length;i++)kvbLine(lg,...seam[i-1],...seam[i],VY[4],1);
    });
  };
  // Launch badge only: open lobes and a split seam above the combat bodies.
  // Persistent ground heartbeat keeps its original recipe and lifecycle.
  kvbDefDecal('vy_pact',10,(g,q,S)=>{
    const u=S/24,beat=Math.sin(Math.min(1,q/.35)*Math.PI/2),fade=q<.6?1:(1-q)/.4;
    const pts=[[12,19],[4,11],[3,7],[5,4],[8,4],[12,8],[16,4],[19,4],[21,7],[20,11]];
    const points=pts.map(([x,y])=>[(12+(x-12)*(.85+.15*beat))*u,y*u]);
    kvbLayer(g,S,fade,lg=>{
      kvbPoly(lg,points,null,VY[0],3*u);kvbPoly(lg,points,null,VY[3],u);
      const seam=[[12,8],[10,11],[13,13],[11,16],[12,19]];
      for(let i=1;i<seam.length;i++)kvbLine(lg,seam[i-1][0]*u,seam[i-1][1]*u,seam[i][0]*u,seam[i][1]*u,VY[4],u);
    });
  });
  kvbDefDecal('vy_pact_idle',12,pactPaint(true));
  // Dos bordes rasgados dejan el centro de la trayectoria visible.
  kvbDefBeam('vy_dash',8,24,16,(g,q,W,H)=>{
    const m=H/2,fade=q<.5?1:(1-q)/.5;
    for(const sign of [-1,1])for(let x=0;x<W;x+=2){
      const y=m+sign*(3+((x/2|0)%4===0?2:0)),w=q<.2?1:2;
      if(q>.65&&((x/2|0)%3===0))continue;
      g.fillStyle=VY[0];g.fillRect(x,y-1,3,w+2);
      g.fillStyle=fade>.3?VY[3]:VY[2];g.fillRect(x,y,2,w);
    }
    if(q>.12&&q<.6){g.fillStyle=VY[4];g.fillRect(0,m,Math.ceil(W*(1-q)),1);}
  });
  kvbDefBeam('vy_lance',8,24,16,(g,q,W,H)=>{
    const m=H/2,th=q<.25?1:q<.6?3:1;
    g.fillStyle=VY[0];g.fillRect(0,m-th-1,W,th*2+2);
    g.fillStyle=VY[2];g.fillRect(0,m-th,W,th*2);
    g.fillStyle=VY[4];g.fillRect(0,m-1,W,1);
    for(let x=4;x<W;x+=8)kvbLine(g,x,m-3,x+3,m+3,VY[3],1);
  });
  kvbDefDecal('vy_dash_end',8,(g,q,S)=>{
    const c=S/2,R=c-4,L=R*(.3+.7*kvbEase(Math.min(1,q/.35))),fade=q<.5?1:(1-q)/.5;
    kvbLayer(g,S,fade,lg=>{
      const pts=[[c-L*.7,c-L*.7],[c+L*.16,c-L*.1],[c-L*.12,c+L*.14],[c+L*.7,c+L*.7]];
      for(const [col,w] of [[VY[0],5],[VY[2],3],[VY[4],1]])for(let i=1;i<pts.length;i++)kvbLine(lg,...pts[i-1],...pts[i],col,w);
    });
  });

  KVB_FX['veyra.cut'] = (x, y, range, ang, half) => {
    kvbSectorFx('vy_slash', x, y, range, ang, 560, {layer: 'g'});
    kvbEmit('vy_drop', 10, x, y, {ang, spread: (half || .85) * 1.7, v0: range * .5, v1: range * 1.2, up: 20, grav: 300, l0: 340, l1: 560, scale: 1.3, shrink: true});
    kvbPart('vy_claw', x + Math.cos(ang) * range * .55, y + Math.sin(ang) * range * .55, {rot: ang + .2, dur: 380, scale: 2.4, layer: 't', fadeAt: .4});
  };
  KVB_FX['veyra.lance'] = (x,y,width,ang,len) => {
    kvbBeam('vy_lance',x,y,x+Math.cos(ang)*len,y+Math.sin(ang)*len,width*2,560,{layer:'g'});
    kvbPart('vy_claw',x+Math.cos(ang)*len,y+Math.sin(ang)*len,{rot:ang,dur:380,scale:1.8,layer:'t'});
  };
  KVB_FX['veyra.dash'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('vy_dash', x, y, ex, ey, Math.max(18, r * 1.6), 460, {layer: 'g'});
    kvbEmit('vy_drop', 8, x, y, {ang, spread: 1.4, v0: 30, v1: 110, up: 30, grav: 300, l0: 340, l1: 560, scale: 1.3, shrink: true});
    kvbPart('vy_claw', ex, ey, {rot: ang + .2, dur: 360, scale: 2.2, layer: 't', fadeAt: .4}); kvbDecal('vy_dash_end', ex, ey, Math.max(28, r * 1.5), 520, {layer: 'g', alpha: .8});
  };
  KVB_FX['veyra.pact'] = (x, y, r, ang, duration, ownerIndex) => {
    kvbDecal('vy_pact', x, y - 126, 22, 760, {layer: 't', prio: true});
    kvbEmit('vy_wisp', 7, x, y, {ring: 20, v0: 5, v1: 25, up: 70, l0: 520, l1: 800, scale: 1.3, flat: .6});
    const h = Number.isInteger(ownerIndex) ? heroes[ownerIndex] : null;
    if(!h || h.classKey !== 'veyra' || !h.alive || !(duration > 0)) return;
    // Un solo latido por lanzamiento real; el pool limpia muerte, fin y reinicio.
    for(let i=KVB.pool.length-1;i>=0;i--) if(KVB.pool[i].name==='vy_pact_idle' && KVB.pool[i].follow===h) KVB.pool.splice(i,1);
    kvbDecal('vy_pact_idle', h.x, h.y+4, 30, Math.min(5000,duration), {follow:h,ofy:4,loop:true,fps:15,layer:'g',alpha:.9,fadeAt:1,prio:true});
  };
  KVB_FX['veyra.final'] = (x, y, r) => { kvbDecal('vy_wound', x, y, r, 880, {layer: 'g'}); kvbEmit('vy_drop', 14, x, y, {ring: r * .5, v0: 50, v1: 160, up: 110, grav: 340, l0: 420, l1: 700, scale: 1.4, flat: .6}); kvbEmit('vy_wisp', 6, x, y, {ring: r * .4, v0: 5, v1: 30, up: 90, l0: 560, l1: 900, scale: 1.4, flat: .6}); };
  kvbBindQ5('vey_cut', 'veyra.cut'); kvbBindQ5('vey_dash', 'veyra.dash'); kvbBindQ5('vey_pact', 'veyra.pact'); kvbBindQ5('vey_final', 'veyra.final');
  // Vapor solo mientras existe el latido propio, nunca por un buff de otro campeón.
  kvbOverlay('veyra', null, (h, dt) => {
    if(KVB.pool.some(e=>e.name==='vy_pact_idle' && e.follow===h && e.t<e.dur) && kvbPulseEvery(h,'wisp',130,dt))
      kvbPart('vy_wisp',h.x+kvbRR(-10,10),h.y-4,{vy:-46,dur:520,scale:1.1,layer:'t',shrink:true});
  });
  kvbBasic('veyra', VY, 'vy_drop');
}
