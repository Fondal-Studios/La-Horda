'use strict';
/* Aelith: dial quebrado, vidrio dentado y post-imágenes del receptor real.
 * Solo renderer: jamás escribe buffs, daño ni posición del héroe. */
function aelithFxStrip(kind,T,art,size){
 if(!(kind==='echo'&&(art==='zone'||art==='nova')||kind==='fracture'&&art==='beam'||kind==='haste'&&art==='aura'))return null;
 const beam=art==='beam',aura=art==='aura',W=beam?16:aura?40:size,H=aura?56:beam?size:size,N=12,S=new SfaStrip(W,H,N),P=T.px,c=W/2,R=c-3;
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
   // Bordes de vidrio dentado, hueco central y fragmentos separados.
   for(let x=0;x<W;x++){const tooth=[0,1,3,1,0,-2,-1,2][x%8],gap=2+(x%5===0?1:0);const y=H/2+tooth;
    dot(x,y-gap-1,P.o);dot(x,y-gap,P.b);dot(x,y+gap,P.d);dot(x,y+gap+1,P.o);
    if((x+f)%9===0){line(x,H/2-1,x+2,H/2+1,P.c);dot(x,H/2+2,P.e);}}
  }else{
   // Segundero a los pies y arena ascendente; cuerpo central libre.
   const cy=47;for(let i=0;i<12;i++){const a=i*Math.PI/6;dot(20+Math.cos(a)*14,cy+Math.sin(a)*4,P.e);}
   const a=-Math.PI/2+f*Math.PI/6;line(20,cy,20+Math.cos(a)*12,cy+Math.sin(a)*3,P.b);
   for(let i=0;i<6;i++){const u=(f/12+i/6)%1,x=20+(i%2?1:-1)*(12+(i%3));dot(x,43-u*28,P.e);dot(x,44-u*28,P.d);}
  }
 }
 return S;
}
for(const kind of ['echo','fracture','haste'])sfaDefineTheme('aelith_'+kind,{...sfaThemes.time,bake:(T,art,size)=>aelithFxStrip(kind,T,art,size)});
function aelithEchoFrame(o,n){return Math.min(n-1,Math.max(0,Math.floor((1-o.life/(o.maxLife||o.life))*n)));}
SFA_OBJ.ael_echo={theme:'aelith_echo',end:'nova',endDur:520,draw:(o,r)=>{
 const size=sfaBucket(r*2),b=sfaBake('zone','aelith_echo',size),f=aelithEchoFrame(o,b.n),D=r*2*size/(size-3);
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=.7;ctx.drawImage(b.cv,f*b.w,0,b.w,b.h,o.x-D/2,o.y-D/2,D,D);ctx.restore();
}};
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
function aelithTrailStamp(h){
 const cv=document.createElement('canvas');cv.width=cv.height=160;const g=cv.getContext('2d'),main=ctx,m=ANIM_ALPHA_MUL;
 g.imageSmoothingEnabled=false;g.translate(80-h.x,140-h.y);ctx=g;ANIM_ALPHA_MUL=1;
 try{drawHeroBody(h,h.scale*uniqueScaleMult(h),false,false);}finally{ctx=main;ANIM_ALPHA_MUL=m;}
 g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#f0c070';g.fillRect(0,0,160,160);
 return cv;
}
SFA_POLL.push(()=>{
 for(const h of [...aelithTrailState.keys()])if(!heroes.includes(h)||!h.alive||h.fused||!(h.aelithDebtUntil>runElapsedMs))aelithTrailState.delete(h);
 for(const h of heroes){if(!h.alive||h.fused||!(h.aelithDebtUntil>runElapsedMs))continue;
  let s=aelithTrailState.get(h);if(!s||s.until!==h.aelithDebtUntil){s={until:h.aelithDebtUntil,last:-1e9,shots:[]};aelithTrailState.set(h,s);}
  if(runElapsedMs-s.last>=60){s.last=runElapsedMs;s.shots.push({cv:aelithTrailStamp(h),x:h.x,y:h.y});while(s.shots.length>3)s.shots.shift();}
  ctx.save();ctx.imageSmoothingEnabled=false;for(let i=0;i<s.shots.length;i++){const p=s.shots[i];if(Math.hypot(p.x-h.x,p.y-h.y)<3)continue;ctx.globalAlpha=(i+1)*.1;ctx.drawImage(p.cv,p.x-80,p.y-140);}ctx.restore();
 }
});
