'use strict';
/* Facu GM: resaca longitudinal, presión hacia el centro y espuma de la trayectoria real.
 * Fuentes nativas SfaStrip. No cambia objetos, emisores, daño, duración ni radio mecánico. */
function facuFxStrip(kind,T,art,size){
  if(!((kind==='current'&&(art==='beam'||art==='burst'))||(kind==='pressure'&&art==='nova')||(kind==='ride'&&(art==='beam'||art==='burst'))))return null;
  const beam=art==='beam',W=beam?16:size,H=beam?size:size,N=beam?8:12,S=new SfaStrip(W,H,N),P=T.px,c=W/2,cy=H/2;
  for(let f=0;f<N;f++){
    const q=f/(N-1),fade=beam?1:q<.64?1:(1-q)/.36;
    const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x<1||y<1||x>=W-1||y>=H-1||!sfaDither(x,y,fade))return;S.set(f,x,y,col);};
    const line=(x,y,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(bx-x),Math.abs(by-y))));for(let i=0;i<=n;i++)dot(x+(bx-x)*i/n,y+(by-y)*i/n,col);};
    const ridge=(x,y,bx,by)=>{line(x,y+1,bx,by+1,P.o);line(x,y,bx,by,P.b);};
    const arc=(x,y,rx,ry,a,b,col)=>{let px=x+Math.cos(a)*rx,py=y+Math.sin(a)*ry;const n=Math.max(8,Math.ceil((b-a)*Math.max(rx,ry)*1.4));for(let i=1;i<=n;i++){const t=a+(b-a)*i/n,nx=x+Math.cos(t)*rx,ny=y+Math.sin(t)*ry;line(px,py,nx,ny,col);px=nx;py=ny;}};
    if(beam){
      if(kind==='current'){
        // Dos corrientes sinuosas dejan un canal abierto; fase de agua dentro de la línea real.
        for(let x=1;x<15;x++){const a=(x/14-q)*Math.PI*2,y=cy+Math.sin(a)*Math.max(1,H*.16);dot(x,y-2,P.o);dot(x,y-3,P.b);dot(x,y+3,P.a);if((x+f)%5===0)dot(x,y+2,P.c);}
      }else{
        // Cresta rizada y remanso discontinuo; sin flechas ni sello radial.
        const bob=Math.sin(q*Math.PI*2),y=cy+bob;
        arc(7,y,5,Math.max(2,H*.24),Math.PI*.8,Math.PI*2.05,P.o);
        arc(7,y-1,5,Math.max(2,H*.24),Math.PI*.8,Math.PI*2.05,P.c);
        arc(9,y-1,2,2,Math.PI*.1,Math.PI*1.5,P.b);
        line(2,Math.min(H-2,y+4),6,Math.min(H-2,y+4),P.a);
      }
    }else if(kind==='pressure'){
      // Espiral descendente: el frente converge; la orilla punteada conserva el área real.
      const R=c-3,rad=R*(.9-.64*Math.min(1,q/.64));
      for(let j=0;j<3;j++){
        const a=j*Math.PI*2/3+q*.7;
        for(let i=0;i<60;i++){const t=i/59,th=a+t*2.6,r=rad*(1-t*.64),x=c+Math.cos(th)*r,y=cy+Math.sin(th)*r;
          dot(x,y+1,P.o);dot(x,y,t>.8?P.c:P.b);if(i%4===0)dot(x+1,y+1,P.a);}
      }
      for(let i=0;i<48;i++)if(i%3!==2){const a=i*Math.PI/24;dot(c+Math.cos(a)*R,cy+Math.sin(a)*R,P.a);}
      if(f>=4&&f<=8){arc(c,cy,3,2,0,Math.PI*2,P.d);dot(c,cy,P.o);}
    }else{
      const R=(c-5)*(.45+.5*Math.min(1,q/.55)),cx=c-R*.15;
      arc(cx,cy,R,R*.62,Math.PI*.12,Math.PI*1.75,P.o);
      arc(cx,cy-1,R,R*.62,Math.PI*.12,Math.PI*1.75,P.b);
      arc(cx+R*.5,cy-R*.27,R*.35,R*.3,Math.PI*.1,Math.PI*1.7,P.c);
      if(kind==='current')ridge(c-R*.7,cy+R*.6,c+R*.7,cy+R*.6);
      else{ridge(c-R*.8,cy+R*.45,c-R*.2,cy+R*.45);dot(c+R*.82,cy-R*.7,P.c);dot(c+R*.6,cy-R*.9,P.b);}
    }
  }
  return S;
}
for(const kind of ['current','pressure','ride'])sfaDefineTheme('facu_'+kind,{...sfaThemes.tide,bake:(T,art,size)=>facuFxStrip(kind,T,art,size)});
SFA_OBJ.as_current={theme:'facu_current',draw:sfaBeamObj('facu_current',o=>o.bx!==undefined?{ax:o.x,ay:o.y,bx:o.bx,by:o.by,w:Math.max(30,(o.r||30)*1.6)}:null)};
// La espuma nace en update, después del cast: ambos clientes usan los mismos extremos replicados.
SFA_OBJ.as_foam={theme:'facu_ride~p',draw:sfaBeamObj('facu_ride~p',o=>o.bx!==undefined?{ax:o.x,ay:o.y,bx:o.bx,by:o.by,w:(o.r||26)*2}:null)};
SFA_OBJ.as_ocean={theme:'tide',end:'nova',endDur:800};
SFA_BIND.facu_gm={themes:['tide','facu_current','facu_pressure','facu_ride'],
  0:{extras:false,run:c=>{const o=sfaObj(c,/as_current/);if(o)sfaP('burst','facu_current',o.x,o.y,44,{dur:480});}},
  1:{extras:false,run:sfaNovaAt('facu_pressure')},
  2:{extras:false,run:c=>{if(c.h.asState?.rideLeft>0)sfaP('burst','facu_ride',c.h.x,c.h.y,38,{dur:460});}},
  ult:sfaNovaAt('tide')
};
