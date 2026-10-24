'use strict';
/* Aelith: dial quebrado, vidrio dentado y post-imágenes del receptor real.
 * Solo renderer: jamás escribe buffs, daño ni posición del héroe. */
// Mezcla moderada con el tinte recibido: conserva identidad, pero sí responde a la arena.
function aelithFxPalette(kind,T){
 const canon=kind==='fracture'?{o:'#1e1633',a:'#a58fd6',b:'#d9c9f5',c:'#fff8e0',d:'#5a4a8c',e:'#e5dbf7'}:
 kind==='haste'?{o:'#302034',a:'#b87839',b:'#f0c070',c:'#fff1ce',d:'#705078',e:'#eed5a4'}:
 kind==='debt'?{o:'#27252f',a:'#504c59',b:'#c2b5cf',c:'#ece3f9',d:'#77717f',e:'#c7bed3'}:null;
 if(!canon)return T.px;const px={};for(const k in canon)px[k]=sfaCol(sfaMix(canon[k],T.pal[k],.18));return px;
}
function aelithFxStrip(kind,T,art,size){
 if(!(kind==='echo'&&(art==='zone'||art==='nova')||kind==='fracture'&&art==='beam'||(kind==='haste'||kind==='debt')&&art==='aura'))return null;
 const beam=art==='beam',aura=art==='aura',W=beam?224:aura?40:size,H=aura?56:beam?40:size,N=12,S=new SfaStrip(W,H,N),P=aelithFxPalette(kind,T),c=W/2,R=c-3;
 for(let f=0;f<N;f++){
  const q=f/(N-1),fade=art==='nova'&&q>.55?(1-q)/.45:1;
  const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(sfaDither(x,y,fade))S.set(f,x,y,col);};
  const line=(x,y,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(x-bx),Math.abs(y-by))));for(let i=0;i<=n;i++)dot(x+(bx-x)*i/n,y+(by-y)*i/n,col);};
  if(kind==='echo'){
   // Doce marcas para el eco normal; las trece de la definitiva quedan intactas.
   for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2,rr=R+(art==='nova'?Math.max(0,q-.35)*3:0);line(c+Math.cos(a)*(rr-4),c+Math.sin(a)*(rr-4),c+Math.cos(a)*rr,c+Math.sin(a)*rr,P.b);}
   for(let i=0;i<120;i++){if(i%10>7)continue;const a=i*Math.PI/60;dot(c+Math.cos(a)*R,c+Math.sin(a)*R,P.d);}
   for(let i=0;i<3;i++){const a=i*2.1+.25,rr=R*(art==='zone'?.72:.3+.6*Math.min(1,q*2));let x=c,y=c;
    for(let j=1;j<=4;j++){const r=rr*j/4,aa=a+(j%2?.11:-.11);const nx=c+Math.cos(aa)*r,ny=c+Math.sin(aa)*r;line(x,y,nx,ny,P.e);x=nx;y=ny;}}
   const a=-Math.PI/2+(art==='zone'?-f:f)*Math.PI/6;line(c,c,c+Math.cos(a)*R*.66,c+Math.sin(a)*R*.66,P.c);
   if(art==='nova')for(let i=0;i<8;i++){const a=i*2.4,rr=R*(.2+.65*q);line(c+Math.cos(a)*rr,c+Math.sin(a)*rr,c+Math.cos(a)*rr+2,c+Math.sin(a)*rr-3,P.a);}
  }else if(beam){
   // Una sola grieta longitudinal: dientes irregulares, sin repetir una teja de16px.
   // El hueco central conserva la lectura de cuerpos cruzados.
   for(let x=2;x<W-2;x++){
    const tooth=[0,1,2,1,-1,-3,-1,0,2,4,1,-2][Math.floor(x/4)%12];
    const taper=Math.min(1,x/20,(W-1-x)/24),gap=(4+Math.abs(tooth)*.45)*taper,y=H/2+tooth;
    for(const side of [-1,1]){
     dot(x,y+side*(gap+2),P.o);dot(x,y+side*(gap+1),side<0?P.b:P.d);
     if(x%7<5)dot(x,y+side*gap,P.e);
    }
    if(x%31===12){const yy=H/2+(x%2?1:-1)*(10+f%3);line(x,yy,x+3,yy-2,P.c);line(x+3,yy-2,x+5,yy,P.o);}
   }
  }else{
   // Segundero a los pies y arena ascendente; cuerpo central libre.
   const cy=47;for(let i=0;i<12;i++){const a=i*Math.PI/6;const x=20+Math.cos(a)*14,y=cy+Math.sin(a)*4;dot(x,y+1,P.o);line(x,y,x+1,y,P.e);}
   const a=-Math.PI/2+f*Math.PI/6;line(20,cy,20+Math.cos(a)*12,cy+Math.sin(a)*3,P.b);
   for(let i=0;i<6;i++){const u=(f/12+i/6)%1,x=20+(i%2?1:-1)*(12+(i%3));dot(x-1,43-u*28,P.o);dot(x,43-u*28,P.e);dot(x+1,43-u*28,P.b);dot(x,44-u*28,P.d);}
  }
 }
 return S;
}
function aelithFractureSpan(t,dur){
 // Impacto mecánico instantáneo: traza completa visible desde el inicio;
 // el vidrio se abre150ms y se cose punta->mano en los últimos150ms.
 return Math.max(0,Math.min(1,t/150,(dur-t)/150));
}
function aelithDrawFracture(s,g){
 const L=Math.hypot(s.bx-s.x,s.by-s.y);if(L<4)return;
 const b=sfaBake('beam',s.theme,16),f=Math.min(b.n-1,Math.floor(s.t/s.dur*b.n)),span=aelithFractureSpan(s.t,s.dur);
 const T=sfaTheme(s.theme),arena=sfaArenaKey(),P=aelithFxPalette('fracture',arena?sfaTintTheme(T,arena):T);
 g.save();g.translate(s.x,s.y);g.rotate(Math.atan2(s.by-s.y,s.bx-s.x));
 g.globalAlpha=.55*Math.min(1,(s.dur-s.t)/80);g.fillStyle=`rgb(${P.d&255},${(P.d>>>8)&255},${(P.d>>>16)&255})`;
 // La traza comunica el alcance completo; el frente brillante no sugiere daño demorado.
 g.fillRect(0,-.7,L,1.4);
 if(span>0){g.globalAlpha=.95;g.drawImage(b.cv,f*b.w,0,b.w*span,b.h,0,-s.w/2,L*span,s.w);}
 g.restore();
}
for(const kind of ['echo','fracture','haste'])sfaDefineTheme('aelith_'+kind,{...sfaThemes.time,beamDraw:kind==='fracture'?aelithDrawFracture:null,auraEventPhase:kind==='haste',auraFamily:kind==='haste'?'aelith_clock':null,bake:(T,art,size)=>aelithFxStrip(kind,T,art,size)});
// La variante de H2 conserva vidrio blanco-lila: la rotación genérica lo volvía verde.
sfaDefineTheme('aelith_fracture~h',{...sfaThemes.aelith_fracture,pal:{o:'#1e1633',a:'#a58fd6',b:'#d9c9f5',c:'#fff8e0',d:'#5a4a8c',e:'#e5dbf7'}});
// Reutiliza la receta de arena en gris lavanda, sin sobrescribir el atlas ámbar.
sfaDefineTheme('aelith_debt',{...sfaThemes.time,auraEventPhase:true,auraFamily:'aelith_clock',pal:{o:'#27252f',a:'#504c59',b:'#aaa3b4',c:'#d2cbdc',d:'#77717f',e:'#b7b0c1'},bake:(T,art,size)=>aelithFxStrip('debt',T,art,size)});
function aelithEchoFrame(o,n){return Math.min(n-1,Math.max(0,Math.floor((1-o.life/(o.maxLife||o.life))*n)));}
SFA_OBJ.ael_echo={theme:'aelith_echo',draw:(o,r)=>{
 const size=sfaBucket(r*2),b=sfaBake('zone','aelith_echo',size),f=aelithEchoFrame(o,b.n),D=r*2*size/(size-3);
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=.7;ctx.drawImage(b.cv,f*b.w,0,b.w,b.h,o.x-D/2,o.y-D/2,D,D);ctx.restore();
}};
// El fin gráfico nace de la llamada de impacto real, no de perder un objeto del snapshot.
// Mantiene la llamada genérica y todo su RNG. Muerte, fusión, vacío o reemplazo no la emiten.
(function(){
 const update=aelithUpdateObject;
 aelithUpdateObject=function(o,dt){
  if(window.SFA_OFF || !o || o.kind!=='ael_echo')return update.apply(this,arguments);
  const fx=qualityFiveFx;let impact=false,result;
  qualityFiveFx=function(h,draw,...args){
   if(h===o.owner && draw===kitFx && args[0]==='rune' && args[1]===o.x && args[2]===o.y)impact=true;
   return fx.apply(this,arguments);
  };
  try{result=update.apply(this,arguments);}finally{qualityFiveFx=fx;}
  if(impact)sfaRaw('nova','aelith_echo',o.x,o.y,o.r,{dur:520});
  return result;
 };
 const hero=updatePortadorHero;
 updatePortadorHero=function(h,dt){
  const until=h.aelithDebtUntil||0,result=hero.apply(this,arguments);
  if(!window.SFA_OFF && h.alive && !h.fused && heroes.includes(h) && until>0 && runElapsedMs>=until && h.aelithDebtUntil===0)
   sfaRaw('aura','aelith_debt',h.x,h.y,25,{fi:sfaHeroIdx(h),dur:800});
  return result;
 };
})();
SFA_OBJ.ael_hour={theme:'time',pulse:true,end:'nova',endDur:720};
SFA_BIND.aelith={themes:['time'],
 0:{extras:false,run:sfaNovaAt('aelith_echo',{dur:520})},
 1:{extras:false,run:sfaLine('aelith_fracture',{noEnd:true,dur:720})},
 2:{extras:false,run:c=>{const fx=sfaFx(c);if(!fx)return;const list=aelithFlag(c.h,2,'share')?aelithAllies(c.h,c.h,fx.r):[c.h];
  for(const a of list){const dur=Math.max(0,(a.aelithDebtUntil||0)-runElapsedMs);if(dur)sfaP('aura','aelith_haste',a.x,a.y,25,{fi:sfaHeroIdx(a),dur});}
 }},ult:sfaNovaAt('time')
};
// Capturas del cuerpo equipado, no una silueta genérica que cambie la skin.
// Estado exclusivamente visual y local; el temporizador de deuda llega del host.
const aelithTrailState=new Map();
(function(){const reset=vfxResetRun;vfxResetRun=function(){aelithTrailState.clear();return reset.apply(this,arguments);};})();
// Una máscara por snapshot: el cambio a deuda reutiliza alfa/borde, sin otra lectura GPU.
const aelithTrailMasks=new WeakMap();
function aelithTrailPaint(cv,debt){
 const g=cv.getContext('2d');let mask=aelithTrailMasks.get(cv);
 if(!mask){
  const im=g.getImageData(0,0,cv.width,cv.height),alpha=new Uint8Array(cv.width*cv.height),edge=new Uint8Array(alpha.length),rim=new Uint8Array(alpha.length);
  let x0=cv.width,y0=cv.height,x1=0,y1=0;
  for(let i=0;i<alpha.length;i++){const a=im.data[i*4+3];alpha[i]=a;if(a){const x=i%cv.width,y=Math.floor(i/cv.width);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}
  const indices=[];
  // Recorrer solo el rectángulo ocupado evita25.600 arrays temporales por pose.
  for(let y=Math.max(0,y0-1);y<=Math.min(cv.height-1,y1+1);y++)for(let x=Math.max(0,x0-1);x<=Math.min(cv.width-1,x1+1);x++){
   const n=y*cv.width+x,l=x?alpha[n-1]:0,r=x<cv.width-1?alpha[n+1]:0,u=y?alpha[n-cv.width]:0,d=y<cv.height-1?alpha[n+cv.width]:0;
   if(alpha[n]&&(!l||!r||!u||!d))edge[n]=alpha[n];
   else if(!alpha[n])rim[n]=Math.max(l,r,u,d);
   if(alpha[n]||rim[n])indices.push(n);
  }
  const outline=document.createElement('canvas');outline.width=cv.width;outline.height=cv.height;
  mask={alpha,edge,rim,outline,indices,cx:Math.floor((x0+x1)/2),cy:Math.floor((y0+y1)/2)};aelithTrailMasks.set(cv,mask);
 }
 const im=g.createImageData(cv.width,cv.height),og=mask.outline.getContext('2d'),oi=og.createImageData(cv.width,cv.height);
 const edge=debt?[236,227,249]:[255,231,181],fill=debt?[119,108,141]:[184,120,57],dark=debt?[39,37,47]:[48,32,52];
 for(const n of mask.indices){
  const col=mask.edge[n]?edge:fill;
  for(let k=0;k<3;k++){im.data[n*4+k]=col[k];oi.data[n*4+k]=mask.edge[n]?edge[k]:dark[k];}
  im.data[n*4+3]=mask.alpha[n];oi.data[n*4+3]=mask.edge[n]||mask.rim[n];
 }
 g.putImageData(im,0,0);og.putImageData(oi,0,0);
}
// El relleno conserva16/28/40%; el contorno independiente distingue tres poses
// sin volver opaca toda la masa ni ampliar la silueta más de un píxel.
function aelithTrailEdgeAlpha(i,collapse){return (.55+i*.15)*(1-collapse);}
function aelithTrailAlpha(i,collapse){return (.16+i*.12)*(1-collapse);}
function aelithTrailStamp(h){
 const cv=document.createElement('canvas');cv.width=cv.height=160;const g=cv.getContext('2d'),main=ctx,m=ANIM_ALPHA_MUL;
 g.imageSmoothingEnabled=false;g.translate(80-h.x,140-h.y);ctx=g;ANIM_ALPHA_MUL=1;
 try{drawHeroBody(h,h.scale*uniqueScaleMult(h),false,false);}finally{ctx=main;ANIM_ALPHA_MUL=m;}
 g.setTransform(1,0,0,1,0,0);aelithTrailPaint(cv,false);
 return cv;
}
SFA_POLL.push(()=>{
 for(const h of [...aelithTrailState.keys()])if(!heroes.includes(h)||!h.alive||h.fused)aelithTrailState.delete(h);
 for(const h of heroes){if(!h.alive||h.fused)continue;
  const active=h.aelithDebtUntil>runElapsedMs,fi=sfaHeroIdx(h),debt=sfaPool.find(e=>e.theme==='aelith_debt'&&e.fi===fi&&e.t>=0&&e.t<e.dur);
  let s=aelithTrailState.get(h);
  if(!active&&!debt){aelithTrailState.delete(h);continue;}
  if(active){
   if(!s||s.until!==h.aelithDebtUntil||s.debt){s={until:h.aelithDebtUntil,last:-1e9,shots:[]};aelithTrailState.set(h,s);}
   if(runElapsedMs-s.last>=60){s.last=runElapsedMs;s.shots.push({cv:aelithTrailStamp(h),x:h.x,y:h.y});while(s.shots.length>3)s.shots.shift();}
  }else if(s&&!s.debt){
   s.debt=true;
   for(const p of s.shots)aelithTrailPaint(p.cv,true);
  }
  if(!s)continue;
  const collapse=active?0:Math.min(1,debt.t/220);
  ctx.save();ctx.imageSmoothingEnabled=false;for(let i=0;i<s.shots.length;i++){
   const p=s.shots[i],x=p.x+(h.x-p.x)*collapse,y=p.y+(h.y-p.y)*collapse;
   if(Math.hypot(x-h.x,y-h.y)<3)continue;
   const px=Math.round(x-80),py=Math.round(y-140);
   ctx.globalAlpha=aelithTrailAlpha(i,collapse);ctx.drawImage(p.cv,px,py);

  }ctx.restore();
 }
});


// Solo el borde posterior de la pose más antigua va sobre cuerpos.
// Las tres masas siguen en suelo: un recuerdo separado, no tres dobles sólidos.
// Resuelve dueño y deuda otra vez al dibujar: no conserva una cola con posiciones viejas.
function aelithDrawTrailEdges(g){
 if(window.SFA_OFF)return;
 g.save();g.imageSmoothingEnabled=false;
 for(const [h,s] of aelithTrailState){
  if(!heroes?.includes(h)||!h.alive||h.fused)continue;
  const active=h.aelithDebtUntil>runElapsedMs,fi=sfaHeroIdx(h);
  const debt=active?null:sfaPool.find(e=>e.theme==='aelith_debt'&&e.fi===fi&&e.t>=0&&e.t<e.dur);
  if(!active&&!debt)continue;
  const collapse=active?0:Math.min(1,debt.t/220);
  if(collapse>=1)continue;
  for(let i=0;i<Math.min(1,s.shots.length);i++){
   const p=s.shots[i],x=p.x+(h.x-p.x)*collapse,y=p.y+(h.y-p.y)*collapse;
   const mask=aelithTrailMasks.get(p.cv),outline=mask?.outline;
   if(!outline||Math.hypot(x-h.x,y-h.y)<3||!inView(x,y,160))continue;
   const px=Math.round(x-80),py=Math.round(y-140),dx=x-h.x,dy=y-h.y;
   g.save();g.beginPath();
   // Eje dominante del desplazamiento real; recorte sobre la mitad que se aleja.
   if(Math.abs(dx)>=Math.abs(dy))g.rect(px+(dx<0?0:mask.cx),py,dx<0?mask.cx:160-mask.cx,160);
   else g.rect(px,py+(dy<0?0:mask.cy),160,dy<0?mask.cy:160-mask.cy);
   g.clip();g.globalAlpha=aelithTrailEdgeAlpha(i,collapse);g.drawImage(outline,px,py);g.restore();
  }
 }
 g.restore();
}
(function(){const top=drawPortadorTop;drawPortadorTop=function(){const r=top.apply(this,arguments);aelithDrawTrailEdges(ctx);return r;};})();

// B106: procedencia del impacto real. Solo metadatos cosméticos; los snapshots
// existentes transportan estos escalares junto al objetivo, sin otro evento ni ID.
function aelithFractureMark(e,dur){
 if(window.SFA_OFF || !e?.alive || e.cineT>0 || !(e.slowTimer>0) || !(e.slowAmt>0) || !(dur>0))return;
 const end=runElapsedMs+dur;
 // Un recasteo corto no acorta la contribución anterior de Fractura.
 if(!(e.aelithFractureFxEnd>end)){
  e.aelithFractureFxStart=runElapsedMs;
  e.aelithFractureFxEnd=end;
 }
}
function aelithClearSlow(e){
 // Los deltas existentes no transmiten claves borradas: cero sí invalida al invitado.
 if(e.aelithFractureFxEnd!==undefined){e.aelithFractureFxStart=0;e.aelithFractureFxEnd=0;}
}
function aelithSlowPhase(e){
 const start=e.aelithFractureFxStart,end=e.aelithFractureFxEnd;
 if(!e.alive || e.fused || !(e.slowTimer>0) || !(e.slowAmt>0) || runElapsedMs>=end){
  // La limpieza observada invalida la procedencia; otro slow no revive el icono.
  aelithClearSlow(e);return -1;
 }
 if(!Number.isFinite(start) || !(end>start) || runElapsedMs<start)return -1;
 return Math.min(11,Math.floor((runElapsedMs-start)/(end-start)*12));
}
function aelithSlowStrip(T){
 const S=new SfaStrip(16,20,12),P=aelithFxPalette('fracture',T);
 for(let f=0;f<12;f++){
  const set=(x,y,c)=>S.set(f,x,y,c);
  // Reloj de arena estrecho, contorno oscuro y vidrio blanco-lila; centro abierto.
  for(const y of [2,17])for(let x=3;x<=12;x++){set(x,y,P.o);set(x,y+(y===2?1:-1),P.b);}
  for(let y=4;y<=15;y++){
   const side=y<=9?4+Math.floor((y-4)*.6):7-Math.floor((y-10)*.6);
   for(const x of [side,15-side]){set(x,y,P.o);set(x+(x<8?1:-1),y,P.e);}
  }
  // Arena de arriba baja y se acumula abajo: fase única de la duración recibida.
  const top=Math.ceil((11-f)/3),bottom=Math.floor(f/3);
  for(let y=0;y<top;y++)for(let x=5+y;x<=10-y;x++)set(x,5+y,P.b);
  for(let y=0;y<bottom;y++)for(let x=5+y;x<=10-y;x++)set(x,15-y,P.b);
  if(f<11)set(7+(f%2),9+(f%3),P.c);
 }
 return S;
}
sfaDefineTheme('aelith_slow',{...sfaThemes.aelith_fracture,bake:(T,art)=>art==='aura'?aelithSlowStrip(T):null});
function aelithDrawSlow(e,g){
 if(window.SFA_OFF)return false;
 const f=aelithSlowPhase(e);if(f<0 || !inView(e.x,e.y,70))return false;
 const b=sfaBake('aura','aelith_slow',0),x=Math.round(e.x+(e.radius||18)*.7),y=Math.round(e.y-(e.radius||18)*1.8-20);
 g.save();g.imageSmoothingEnabled=false;g.globalAlpha=1;
 g.drawImage(b.cv,f*b.w,0,b.w,b.h,x,y,b.w,b.h);g.restore();return true;
}
(function(){
 const overlay=drawEnemyOverlays;
 drawEnemyOverlays=function(e){const r=overlay.apply(this,arguments);aelithDrawSlow(e,ctx);return r;};
 // En PvP los objetivos son héroes/minions/estructuras, no la lista enemies.
 const top=drawPortadorTop;
 drawPortadorTop=function(){const r=top.apply(this,arguments);
  // También invalida objetivos fuera de cámara; no hornea ni dibuja aquí.
  for(const e of enemies)if(e.aelithFractureFxEnd>0)aelithSlowPhase(e);
  if(divinaMode&&!window.SFA_OFF){
  for(const e of new Set([...heroes,...divinaEnemies,...divinaMinions,...divinaStructures]))aelithDrawSlow(e,ctx);
 }return r;};
 const reset=vfxResetRun;
 vfxResetRun=function(){for(const e of [...(enemies||[]),...(heroes||[]),...(typeof divinaEnemies==='undefined'?[]:(divinaEnemies||[])),...(typeof divinaMinions==='undefined'?[]:(divinaMinions||[])),...(typeof divinaStructures==='undefined'?[]:(divinaStructures||[]))]){
  aelithClearSlow(e);
 }return reset.apply(this,arguments);};
})();
