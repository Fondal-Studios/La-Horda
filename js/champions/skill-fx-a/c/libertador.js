'use strict';
/* Libertador: estocada, señal de mando y huellas de carga. Píxel SFA nativo.
 * Reutiliza cuerpo, caballo, espectrales e iconos. Sólo lectura del estado real. */
function libertadorFxStrip(kind,T,art,size){
 const beam=art==='beam';
 if(!(beam&&(kind==='bayonet'||kind==='charge')||art==='nova'&&kind==='command'))return null;
 const W=beam?128:size,H=beam?32:size,N=12,S=new SfaStrip(W,H,N),P=T.px;
 for(let f=0;f<N;f++){
  const q=f/(N-1),fade=q>.65?(1-q)/.35:1;
  const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x>0&&y>0&&x<W-1&&y<H-1&&sfaDither(x,y,fade))S.set(f,x,y,col);};
  const line=(x,y,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(bx-x),Math.abs(by-y))));for(let i=0;i<=n;i++)dot(x+(bx-x)*i/n,y+(by-y)*i/n,col);};
  if(kind==='bayonet'){
   // Estela de acero: filo continuo corto, talón abierto y punta hacia el movimiento.
   const base=16+Math.round(q*20),tip=119,half=Math.max(1,Math.round(4*Math.sin(Math.PI*Math.min(1,q/.85))));
   for(let x=base;x<=tip;x++){
    const w=Math.max(0,Math.round(half*(tip-x)/(tip-base)));
    for(let y=-w;y<=w;y++)dot(x,16+y,Math.abs(y)===w?P.o:y<=0?P.b:P.a);
    if(w>0)dot(x,16-w+1,P.c);
   }
   line(base-6,12,base+8,12,P.d);line(base-3,21,base+15,21,P.e);
  }else if(kind==='charge'){
   // Pares de cascos, abiertos hacia delante; suelo visible entre ambas ramas.
   for(let j=0;j<4;j++)for(const side of [-1,1]){
    const x=12+j*30+(side>0?8:0),y=16+side*8;
    for(let dx=-4;dx<=3;dx++)for(let dy=-5;dy<=5;dy++){
     const outer=dx*dx/25+dy*dy/36<=1,inner=dx*dx/9+dy*dy/12<=1;
     if(outer&&!inner&&!(dx>=1&&Math.abs(dy)<4))dot(x+dx,y+dy,(dx===-4||Math.abs(dy)>=4)?P.o:dy<0?P.b:P.a);
    }
    dot(x-2,y-3,P.c);dot(x-2,y+3,P.e);
   }
  }else{
   const c=W/2,R=c-3,front=R*(.55+.4*Math.min(1,q/.65));
   // Cinco llamadas con asta y paño abierto; mantienen vacío el centro de mando.
   for(let a=0;a<Math.PI*2;a+=.016)if(Math.floor(a*R)%12<3)dot(c+Math.cos(a)*R,c+Math.sin(a)*R,P.d);
   for(let j=0;j<5;j++){
    const a=j*Math.PI*2/5+Math.PI/10,x=c+Math.cos(a)*front,y=c+Math.sin(a)*front;
    line(x,y-5,x,y+5,P.o);line(x+1,y-5,x+1,y+4,P.e);
    for(let u=2;u<7;u++){line(x+u,y-5,x+u,y-1+(u%2),P.o);line(x+u,y-4,x+u,y-2,P.b);}
    dot(x+2,y-4,P.c);
   }
  }
 }
 return S;
}
function libertadorDrawTravel(s,g){
 const h=heroes[s.fi],charge=s.theme.split('~')[0]==='libertador_charge';
 if(!h||!h.alive||h.classKey!=='libertador')return;
 const moving=h.smPhase===(charge?'charge':'bayo');
 if(!moving)return; // no franja de carga durante montaje, muerte o desmontaje
 const dx=s.bx-s.x,dy=s.by-s.y,L=Math.hypot(dx,dy);if(L<1)return;
 const travel=Math.max(0,Math.min(L,((h.x-s.x)*dx+(h.y-s.y)*dy)/L));if(travel<2)return;
 const b=sfaBake('beam',s.theme,16);if(!b)return;
 const f=Math.min(b.n-1,Math.max(0,Math.floor(s.t/s.dur*b.n)));
 g.save();g.translate(s.x,s.y-(charge?0:18));g.rotate(Math.atan2(dy,dx));g.globalAlpha=.85;g.imageSmoothingEnabled=false;
 if(charge){
  // Recorta la última celda al recorrido observado, sin estirar cascos.
  for(let x=0;x<travel;x+=128){const n=Math.min(128,travel-x);g.drawImage(b.cv,f*b.w,0,n,b.h,x,-16,n,32);}
 }else{
  const len=Math.min(96,travel);g.drawImage(b.cv,f*b.w,0,b.w,b.h,travel-len,-16,len,32);
 }
 g.restore();
}
for(const kind of ['bayonet','command','charge'])sfaDefineTheme('libertador_'+kind,{...sfaThemes.patria,beamDraw:kind==='command'?null:libertadorDrawTravel,bake:(T,art,size)=>libertadorFxStrip(kind,T,art,size)});
function libertadorTravelCue(c,kind){
 const h=c.h,charge=kind==='charge';if(h.smPhase!==(charge?'mount':'bayo')&&!(charge&&h.smPhase==='charge'))return;
 const L=Math.max(0,h.smDashLeft||0);if(!L)return;
 const dx=h.smDashDx,dy=h.smDashDy,dur=(charge&&h.smPhase==='mount'?Math.max(0,h.smPhaseTimer||0):0)+L/Math.max(1,h.smDashSpeed)*1000+100;
 sfaP('beam','libertador_'+kind+(charge?'~p':''),c.from.x,c.from.y,0,{bx:c.from.x+dx*L,by:c.from.y+dy*L,w:charge?64:44,dur,fi:sfaHeroIdx(h)});
}
// Emit only after the real cast executes, with the exact AREA passed by combat.
// This also avoids replaying an old active cue when a fused/frozen cast is rejected.
(function(){
 const cast=libertadorCast;
 libertadorCast=function(h,sk,isUlt,dmg,AREA,DUR){
  const from={x:h.x,y:h.y},out=cast.apply(this,arguments);
  if(!SFA_REC.on||window.SFA_OFF||isUlt)return out;
  const c={h,from};
  if(sk.kind==='sm_bayonet')libertadorTravelCue(c,'bayonet');
  else if(sk.kind==='sm_san_lorenzo')libertadorTravelCue(c,'charge');
  else if(sk.kind==='sm_granaderos'&&h.smCmdTimer>0)
   sfaP('nova','libertador_command~h',h.x,h.y,SM_CFG.granaderos.radius*AREA,{dur:1000});
  return out;
 };
})();
SFA_BIND.libertador={themes:['patria','libertador_bayonet','libertador_command','libertador_charge'],
 0:{extras:false,run:()=>{}},
 1:{extras:false,run:()=>{}},
 2:{extras:false,run:()=>{}},
 ult:c=>sfaP('nova','patria',c.h.x,c.h.y,210,{dur:1000})
};
