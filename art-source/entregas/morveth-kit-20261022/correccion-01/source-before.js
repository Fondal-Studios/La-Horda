'use strict';
/* Morveth: brote, esporas sueltas y micelio. La geometría y los destinatarios
 * provienen del cast real. Recetas SFA nativas con el tinte/caché comunes. */
function morvethFxStrip(kind,T,art,size,arc){
 if(!(kind==='growth'&&art==='burst'||kind==='pulse'&&art==='nova'||kind==='spores'&&art==='cone'||kind==='symbiosis'&&art==='aura'))return null;
 const cone=art==='cone',aura=art==='aura',W=aura?40:cone?size+2:size,H=aura?56:cone?Math.ceil(2*size*Math.sin(Math.min(arc,1.5))+6):size,N=aura?18:cone?14:kind==='growth'?12:11;
 const S=new SfaStrip(W,H,N),P=T.px,c=W/2,R=cone?size-1:c-3,cy=H/2;
 for(let f=0;f<N;f++){
  const q=f/(N-1),fade=aura?1:q<.55?1:(1-q)/.45;
  const keep=(x,y)=>!cone||(x>=1&&Math.hypot(x-1,y-cy)<=R&&Math.abs(Math.atan2(y-cy,x-1))<=arc);
  const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(keep(x,y)&&sfaDither(x,y,fade))S.set(f,x,y,col);};
  const line=(x,y,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(x-bx),Math.abs(y-by))));for(let i=0;i<=n;i++)dot(x+(bx-x)*i/n,y+(by-y)*i/n,col);};
  const spore=(x,y,r)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const d=Math.hypot(dx,dy);if(d<=r)dot(x+dx,y+dy,d>r-.9?P.o:dy<0?P.b:P.a);}dot(x-1,y-1,P.c);};
  if(kind==='growth'){
   const k=sfaEase(Math.min(1,q/.5)),w=R*(.15+.4*k),top=cy-R*.45*k;
   for(let y=top;y<=cy+R*.35;y++)for(let x=c-2;x<=c+2;x++)dot(x,y,x<c?P.b:P.d);
   for(let y=-w*.5;y<=w*.25;y++)for(let x=-w;x<=w;x++)if(x*x/(w*w)+y*y/(w*w*.3)<=1)dot(c+x,top+y,y<0?P.e:P.d);
   for(let i=0;i<5;i++){const a=Math.PI*.15+i*Math.PI*.18;line(c,cy+R*.3,c+Math.cos(a)*R*.7*k,cy+R*.3+Math.sin(a)*R*.3*k,P.a);}
   if(q>.2)for(let i=0;i<5;i++)spore(c+Math.cos(i*2.4)*R*.6*k,top-Math.abs(Math.sin(i*2.4))*R*.35*k,1);
  }else if(kind==='pulse'){
   // Borde del radio real, centro abierto; las esporas avanzan sin tapar el suelo.
   sfaRing(S,f,c,R,1,T,{shape:'round',dash:{n:24,ph:0,on:.25}});
   const k=sfaEase(Math.min(1,q/.65));
   for(let i=0;i<13;i++){const a=i*2.39996,rr=R*(.18+.68*k)*( .8+.2*sfaHash(i,3));spore(c+Math.cos(a)*rr,cy+Math.sin(a)*rr,1+(i%3===0?1:0));}
  }else if(cone){
   // Premarcado fino en toda la cuña; nubes discretas salen del origen.
   for(let i=0;i<90;i++){const a=-arc+2*arc*i/89;if(i%4===0)dot(1+Math.cos(a)*R,cy+Math.sin(a)*R,P.a);}
   for(let i=0;i<23;i++){const a=(sfaHash(i,7)*2-1)*arc*.88,rr=R*(.06+.88*sfaEase(Math.min(1,q/.6)))*(.45+.55*sfaHash(i,11));
    spore(1+Math.cos(a)*rr,cy+Math.sin(a)*rr,1+(i%4===0?2:0));
    if(q>.2&&q<.7)line(1+Math.cos(a)*rr,cy+Math.sin(a)*rr,1+Math.cos(a)*Math.max(0,rr-5),cy+Math.sin(a)*Math.max(0,rr-5)+2,P.d);
   }
  }else{
   // Dos hebras abiertas: se conserva visible el cuerpo entre ellas.
   for(const side of [-1,1]){
    let last=null;for(let y=47;y>=15;y--){const x=20+side*(10+Math.sin((47-y)*.15+f/N*Math.PI*2)*3);dot(x,y,P.o);dot(x+side,y,P.b);
     if(last)line(last[0],last[1],x,y,P.a);last=[x,y];
     if(y%8===0){line(x,y,x+side*4,y-4,P.a);dot(x+side*4,y-4,P.e);}
    }
   }
   for(let i=0;i<3;i++){const u=(f/N+i/3)%1;spore(20+(i-1)*8,46-u*31,1);}
  }
 }
 return S;
}
for(const kind of ['growth','pulse','spores','symbiosis'])sfaDefineTheme('morveth_'+kind,{...sfaThemes.plague,bake:(T,art,size,arc)=>morvethFxStrip(kind,T,art,size,arc)});
SFA_OBJ.mor_mushroom = {theme: 'morveth_pulse', pulse: true, draw: sfaDrawMotifObj('plague', 'shroom', 3), end: 'nova', endDur: 520};
SFA_OBJ.mor_garden = {theme: 'plague', pulse: true, end: 'nova', endDur: 720};
SFA_BIND.morveth = {themes: ['plague'],
 0:{extras:false,run:c=>{const o=sfaObj(c,/^mor_mushroom$/);if(o)sfaP('burst','morveth_growth',o.x,o.y,42,{dur:650});}},
 1:{extras:false,run:sfaCone('morveth_spores')},
 2:{extras:false,run:c=>{const fx=sfaFx(c);if(!fx)return;const list=morvethFlag(c.h,2,'share')?morvethAllies(c.h,c.h,fx.r):[c.h];
  for(const a of list){const dur=Math.max(0,(a._kitArmorUntil||0)-runElapsedMs);if(dur)sfaP('aura','morveth_symbiosis',a.x,a.y,25,{fi:sfaHeroIdx(a),dur});}
 }},
 ult:sfaNovaAt('plague')
};
