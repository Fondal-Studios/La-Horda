'use strict';
/* Brakk: montaje de asedio, clavos y vigas en X. Recetas nativas; no modifican el kit.
 * Los props de ladrillo/torreta y la definitiva UF se conservan. La pintura recibe
 * la paleta ya teñida por arena; ningún dibujo consume Math.random de combate. */
function brakkFxStrip(kind,T,art,size){
 const beam=art==='beam',aura=art==='aura';
 if(!((kind==='build'||kind==='nails')&&beam||kind==='deploy'&&art==='burst'||kind==='repair'&&(aura||art==='burst')))return null;
 const W=beam?16:aura?40:size,H=beam?size:aura?56:size,N=kind==='build'?11:kind==='nails'?8:aura?12:kind==='deploy'?12:10;
 const S=new SfaStrip(W,H,N),P=T.px;
 for(let f=0;f<N;f++){
  const q=f/(N-1),fade=beam&&kind==='nails'||aura?1:q<.55?1:(1-q)/.45;
  const dot=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(sfaDither(x,y,fade))S.set(f,x,y,c);};
  const line=(x0,y0,x1,y1,c,w=1)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)for(let dx=0;dx<w;dx++)for(let dy=0;dy<w;dy++)dot(x0+(x1-x0)*i/n+dx,y0+(y1-y0)*i/n+dy,c);};
  const bar=(x0,y0,x1,y1)=>{line(x0,y0,x1,y1,P.o,3);line(x0+1,y0+1,x1+1,y1+1,P.a);line(x0,y0,x1,y1,P.b);};
  const c=W/2,R=W*.36;
  if(kind==='build'){
   const y=H/2,spread=Math.min(1,q/.4)*(H*.32);
   line(0,y-spread,15,y-spread,P.o,2);line(0,y+spread,15,y+spread,P.o,2);
   line(0,y-spread,15,y-spread,P.b);line(0,y+spread,15,y+spread,P.a);
   if(q>.15){bar(2,y-spread,12,y+spread);dot(2,y-spread,P.c);dot(12,y+spread,P.e);}
  }else if(kind==='nails'){
   for(const [offset,dy] of [[0,-2],[8,2]]){const x=(f*2+offset)%16,y=H/2+dy;
    line(x-5,y,x+2,y,P.o,2);line(x-4,y,x+1,y,P.b);line(x-4,y-2,x-4,y+2,P.a);dot(x+2,y,P.c);
   }
  }else if(kind==='deploy'){
   const k=sfaEase(Math.min(1,q/.4)),rr=R*(.35+.65*k);
   for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
    const x=c+sx*rr,y=c+sy*rr;
    bar(c+sx*R*.2,c+sy*R*.2,x,y);bar(x,y,x-sx*R*.28,y);bar(x,y,x,y-sy*R*.28);
    dot(x+1,y+1,P.e);
   }
  }else if(aura){
   const pulse=Math.round(Math.sin(f/N*Math.PI*2)*1.5),left=5-pulse,right=32+pulse;
   for(const x of [left,right]){bar(x,27,x,47);const sign=x<20?1:-1;bar(x,27,x+sign*5,23);bar(x,47,x+sign*5,49);dot(x+1,33+f%7,P.e);}
  }else{
   const k=sfaEase(Math.min(1,q/.35)),r=R*k;
   bar(c-r,c-r,c+r,c+r);bar(c-r,c+r,c+r,c-r);
   if(q>.2&&q<.65)for(let i=0;i<4;i++){const a=i*Math.PI/2+q*3;line(c+Math.cos(a)*R*.2,c+Math.sin(a)*R*.2,c+Math.cos(a)*R*.45,c+Math.sin(a)*R*.45,P.e);}
  }
 }
 return S;
}
for(const kind of ['build','deploy','nails','repair'])sfaDefineTheme('brakk_'+kind,{...sfaThemes.siege,beamEventPhase:kind==='build',bake:(T,art,size)=>brakkFxStrip(kind,T,art,size)});
SFA_OBJ.brk_wall = {theme: 'siege', draw: sfaDrawWallObj('siege'), end: 'burst', endR: 52, endDur: 520};
SFA_OBJ.brk_turret = {theme: 'siege', draw: sfaDrawTurretObj('siege'), pulse: true, pulseArt: 'burst', pulseR: 28, pulseDur: 380, end: 'burst', endR: 46, endDur: 520};
SFA_BIND.brakk = {themes: ['siege','brakk_build','brakk_deploy','brakk_nails','brakk_repair'],
 0:{extras:false,run:c=>{const o=sfaObj(c,/^brk_wall$/);if(!o)return;
  sfaP('beam','brakk_build',o.x-o.dx*o.r,o.y-o.dy*o.r,0,{bx:o.x+o.dx*o.r,by:o.y+o.dy*o.r,w:28,dur:600,noEnd:1});}},
 1:{extras:false,run:c=>{const o=sfaObj(c,/^brk_turret$/);if(o)sfaP('burst','brakk_deploy',o.x,o.y,o.r,{dur:620});}},
 2:{extras:false,run:c=>{const fx=sfaFx(c);if(!fx)return;
  for(const o of brakkOwned(c.h))if(distance(c.h,o)<=fx.r)sfaP('burst','brakk_repair',o.x,o.y,30,{dur:650});
  const list=brakkFlag(c.h,2,'crew')?brakkAllies(c.h,fx.r):[c.h];
  for(const a of list){const dur=Math.max(0,(a._kitArmorUntil||0)-runElapsedMs);if(dur)sfaP('aura','brakk_repair',a.x,a.y,24,{fi:sfaHeroIdx(a),dur});}
 }},
 ult:sfaNovaAt('siege',{self:true})
};
// Cada ráfaga usa los extremos emitidos por el kit; conserva RNG/partículas del original.
{
 const original=qualityFiveFx;
 qualityFiveFx=function(h,draw,...args){
  if(!window.SFA_OFF&&h?.classKey==='brakk'&&draw===kitFxLine&&args[0]==='spike'){
   const out=sfaQuiet(()=>original.call(this,h,draw,...args));
   const [,ax,ay,bx,by,w]=args;sfaRaw('beam','brakk_nails',ax,ay,0,{bx,by,w,dur:260,fi:-2});return out;
  }
  return original.call(this,h,draw,...args);
 };
}
