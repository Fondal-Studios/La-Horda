'use strict';
/* Baltra: primera pasada nativa de los tres normales. Campana UF, cuerpo,
 * skins y básico bell existentes intactos. Sólo dibujo, sin RNG de combate. */
function baltraFxStrip(kind,T,art,size,arc){
 const aura=art==='aura',cone=art==='cone';
 if(!(kind==='wave'&&art==='nova'||kind==='guard'&&(cone||aura)||kind==='clapper'&&cone))return null;
 arc=arc||.85;
 const W=aura?48:cone?size+2:size,H=aura?56:cone?Math.ceil(2*size*Math.sin(Math.min(arc,1.5))+6):size,N=12;
 const S=new SfaStrip(W,H,N),P=T.px,c=W/2,cy=H/2,R=cone?size-2:c-2;
 for(let f=0;f<N;f++){
  const q=f/(N-1),fade=aura?1:q<.6?1:(1-q)/.4;
  const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x<1||y<1||x>=W-1||y>=H-1)return;
   if(cone&&(Math.hypot(x-1,y-cy)>R||Math.abs(Math.atan2(y-cy,x-1))>arc))return;
   if(sfaDither(x,y,fade))S.set(f,x,y,col);};
  const line=(ax,ay,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))));for(let i=0;i<=n;i++)dot(ax+(bx-ax)*i/n,ay+(by-ay)*i/n,col);};
  const bell=(x,y,r)=>{line(x-r*.5,y-r,x+r*.5,y-r,P.o);line(x-r*.5,y-r,x-r,y+r*.5,P.b);line(x+r*.5,y-r,x+r,y+r*.5,P.a);line(x-r,y+r*.5,x+r,y+r*.5,P.b);line(x-r,y+r*.5+1,x+r,y+r*.5+1,P.o);dot(x,y+r,P.c);};
  if(kind==='wave'){
   // Contorno mecánico exterior; ondas huecas de bronce con interrupciones de agua.
   for(let j=0;j<3;j++){
    const rr=R*Math.min(1,.12+q*1.6-j*.22);if(rr<2)continue;
    for(let a=0;a<Math.PI*2;a+=1/Math.max(4,rr*2)){
     if(Math.cos(a*3+j*.8)>.83)continue;
     dot(c+Math.cos(a)*rr,c+Math.sin(a)*rr,j===0?P.b:P.e);
     if(j===0)dot(c+Math.cos(a)*(rr-1),c+Math.sin(a)*(rr-1),P.o);
    }
   }
   if(f<3)for(let i=0;i<32;i++){const a=i*Math.PI/16;dot(c+Math.cos(a)*R,c+Math.sin(a)*R,P.a);}
   if(f<7)bell(c,c,Math.max(3,W*.065));
  }else if(aura){
   // Dos placas votivas colgantes, centro del torso libre, bucle decorativo.
   for(const x of [6,41]){const y=31+Math.round(Math.sin(f/N*Math.PI*2)*2);line(x,20,x,y-5,P.d);bell(x,y,4);dot(x,19,P.e);}
  }else if(kind==='guard'){
   const rr=R*(.63+.25*Math.min(1,q/.3));
   for(let a=-arc;a<=arc;a+=.02){const x=1+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;dot(x,y,P.o);dot(x-1,y,P.b);if(Math.abs(a)>.3)dot(x-2,y,P.a);}
   for(const a of [-arc*.8,0,arc*.8]){const x=1+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;line(x-5,y-3,x-5,y+3,P.e);}
  }else{
   // Badajo reconocible: mango estrecho y cabeza rectangular; barrido y retorno.
   const sweep=q<.65?q/.65:1-(q-.65)/.35*.45,a=-arc*.8+sweep*arc*1.6,rr=R*.67;
   const x=1+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
   line(3,cy,x,y,P.o);line(3,cy-1,x,y-1,P.b);
   const u=Math.cos(a),v=Math.sin(a),r=Math.max(3,size*.055);
   for(let i=-r;i<=r;i++)for(let j=-2;j<=2;j++)dot(x+u*j-v*i,y+v*j+u*i,Math.abs(j)===2||Math.abs(i)>=r-1?P.o:j<0?P.b:P.a);
   if(f>1&&f<9)for(let th=a-.35;th<a;th+=.025)dot(1+Math.cos(th)*R*.88,cy+Math.sin(th)*R*.88,P.e);
  }
 }
 return S;
}
for(const kind of ['wave','guard','clapper'])sfaDefineTheme('baltra_'+kind,{...sfaThemes.bell,bake:(T,art,size,arc)=>baltraFxStrip(kind,T,art,size,arc)});
SFA_OBJ.ex_toll = {theme:'bell',pulse:true,end:'nova',endDur:700};
SFA_BIND.baltra = {themes:['bell','baltra_wave','baltra_guard','baltra_clapper'],
 0:{extras:false,run:sfaNovaAt('baltra_wave',{self:true})},
 1:{extras:false,run:c=>{
  const s=exState(c.h),dur=Math.max(0,s.guardUntil-runElapsedMs);if(!dur)return;
  sfaP('cone','baltra_guard',c.h.x,c.h.y,120,{ang:Math.atan2(s.guardY,s.guardX),arc:.95,dur:700});
  sfaP('aura','baltra_guard',c.h.x,c.h.y,24,{fi:sfaHeroIdx(c.h),dur});
 }},
 2:{extras:false,run:sfaCone('baltra_clapper')},
 ult:sfaNovaAt('bell',{self:true})
};
