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
   // Dos filos separados con convergencia de punta; nunca banda sólida.
   const tip=112,base=14+Math.round(Math.min(1,q/.55)*22),gap=2+Math.round(Math.sin(q*Math.PI)*3);
   for(const side of [-1,1]){line(base,16+side*gap,tip,16,P.o);line(base+2,16+side*(gap-1),tip-2,16,P.b);}
   line(tip-9,13,tip,16,P.c);line(tip-9,19,tip,16,P.e);
   for(let j=0;j<3;j++){const x=9+j*18+f%3;line(x,9-j%2,x+7,9-j%2,P.d);line(x+3,24,x+11,24,P.a);}
  }else if(kind==='charge'){
   // Herraduras abiertas alternadas: el caballo real proporciona la silueta principal.
   for(let j=0;j<5;j++){
    const x=12+j*23,y=j%2?23:9,r=4+(f%3===1?1:0);
    for(let a=.2;a<Math.PI*1.8;a+=.12){dot(x+Math.sin(a)*r,y+Math.cos(a)*r,P.o);dot(x+Math.sin(a)*(r-1),y+Math.cos(a)*(r-1),P.b);}
    line(x-3,y+6,x-7-(f%3),y+7,P.d);dot(x+2,y+5,P.e);
   }
  }else{
   const c=W/2,R=c-3,front=R*(.55+.4*Math.min(1,q/.65));
   // Borde real punteado; cinco llamadas abiertas con espacio para espectrales.
   for(let a=0;a<Math.PI*2;a+=.016)if(Math.floor(a*R)%9<4){dot(c+Math.cos(a)*R,c+Math.sin(a)*R,P.d);}
   for(let j=0;j<5;j++){
    const a=j*Math.PI*2/5+Math.PI/10;
    for(let da=-.18;da<=.18;da+=.012){dot(c+Math.cos(a+da)*front,c+Math.sin(a+da)*front,P.o);dot(c+Math.cos(a+da)*(front-1),c+Math.sin(a+da)*(front-1),P.b);}
    const x=c+Math.cos(a)*front,y=c+Math.sin(a)*front;
    line(x,y,x+Math.cos(a)*4,y+Math.sin(a)*4,P.e);
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
 g.save();g.translate(s.x,s.y);g.rotate(Math.atan2(dy,dx));g.globalAlpha=.85;g.imageSmoothingEnabled=false;
 if(charge){
  // Recorta la última celda al recorrido observado, sin estirar cascos.
  for(let x=0;x<travel;x+=128){const n=Math.min(128,travel-x);g.drawImage(b.cv,f*b.w,0,n,b.h,x,-16,n,32);}
 }else{
  const len=Math.min(96,travel);g.drawImage(b.cv,f*b.w,0,b.w,b.h,travel-len,-s.w/2,len,s.w);
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
