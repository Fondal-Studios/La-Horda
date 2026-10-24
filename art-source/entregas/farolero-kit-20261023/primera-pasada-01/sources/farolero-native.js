'use strict';
/* Farolero: encendido con polillas, tapa de farol y senda de losetas.
 * Arte nativo SfaStrip; conserva farol/UF, objetos, geometría y mecánicas. */
function faroleroFxStrip(kind,T,art,size,arc){
  if(!((kind==='kindling'&&art==='nova')||(kind==='flash'&&(art==='cone'||art==='burst'))||(kind==='path'&&art==='beam')))return null;
  const beam=art==='beam',cone=art==='cone',W=beam?16:cone?size+2:size,H=beam?size:cone?Math.ceil(2*size*Math.sin(Math.min(arc,1.5))+6):size,N=beam?8:12,S=new SfaStrip(W,H,N),P=T.px,c=W/2,cy=H/2;
  for(let f=0;f<N;f++){
    const q=f/(N-1),fade=beam?1:q<.64?1:(1-q)/.36;
    const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x<1||y<1||x>=W-1||y>=H-1||!sfaDither(x,y,fade))return;S.set(f,x,y,col);};
    const line=(x,y,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(bx-x),Math.abs(by-y))));for(let i=0;i<=n;i++)dot(x+(bx-x)*i/n,y+(by-y)*i/n,col);};
    const outline=(x,y,bx,by)=>{line(x,y+1,bx,by+1,P.o);line(x,y,bx,by,P.a);};
    const moth=(x,y,a)=>{const wing=2+(f%3===0?1:0);line(x,y-2,x,y+2,P.o);for(const side of [-1,1]){line(x+side,y,x+side*wing,y-2,P.b);line(x+side,y+1,x+side*wing,y+2,P.a);}dot(x,y,P.c);};
    if(beam){
      // Una loseta abierta por segmento de 16 px; farolitos laterales, sin flechas.
      const top=Math.max(6,Math.round(H*.32)),bottom=H-top;
      outline(2,top,12,top);outline(12,top,14,cy);outline(14,cy,12,bottom);outline(12,bottom,2,bottom);outline(2,bottom,1,cy);outline(1,cy,2,top);
      for(const y of [3,H-5]){line(6,y-1,10,y-1,P.o);line(6,y,6,y+2,P.o);line(10,y,10,y+2,P.o);line(6,y+3,10,y+3,P.o);dot(8,y+(f%3===0?0:1),P.c);dot(8,y+2,P.e);}
      if(f%4<2)line(4,cy,6,cy,P.d);
    }else if(cone){
      // Abanico que avanza desde el vidrio; tres franjas abiertas, no una estrella radial.
      const R=size-3,reach=R*(.15+.82*Math.min(1,q/.55));
      for(let j=-1;j<=1;j++){
        const a=j*arc*.7,near=Math.max(3,reach-R*.4),far=reach-(Math.abs(j)*R*.09);
        line(1+Math.cos(a)*near,cy+Math.sin(a)*near+1,1+Math.cos(a)*far,cy+Math.sin(a)*far+1,P.o);
        line(1+Math.cos(a)*near,cy+Math.sin(a)*near,1+Math.cos(a)*far,cy+Math.sin(a)*far,P.b);
        for(let t=0;t<7;t++){const th=a+(t-3)*.025;dot(1+Math.cos(th)*far,cy+Math.sin(th)*far,P.c);}
      }
      for(let i=0;i<40;i++)if(i%3!==2){const a=-arc+i*arc*2/39;dot(1+Math.cos(a)*R,cy+Math.sin(a)*R,P.a);}
    }else if(kind==='kindling'){
      const R=c-4,spread=R*(.24+.58*Math.min(1,q/.6));
      for(let j=0;j<3;j++){const a=j*Math.PI*2/3+q*.85;const x=c+Math.cos(a)*spread,y=cy+Math.sin(a)*spread*.75;moth(x,y,a);
        for(let t=0;t<8;t++){const th=a-t*.035;dot(c+Math.cos(th)*(spread-t*.6),cy+Math.sin(th)*(spread-t*.6)*.75,P.d);}}
      // Luces discontinuas del límite real; el prop existente sigue siendo la fuente.
      for(let i=0;i<56;i++)if(i%4<2){const a=i*Math.PI/28;dot(c+Math.cos(a)*R,cy+Math.sin(a)*R,P.a);}
      for(let y=0;y<8;y++){const x=c+Math.sin(y*.8+q*5)*2;dot(x,cy-y-2,P.e);dot(x-1,cy-y-2,P.b);}
    }else{
      // Dos hojas de tapa se abren; vidrio central hueco, sin círculo de impacto genérico.
      const spread=4+Math.min(1,q/.42)*W*.18,y0=cy-W*.14,y1=cy+W*.14;
      for(const side of [-1,1]){const x=c+side*spread;outline(x,y0,x,y1);outline(x,y0,x+side*W*.08,y0+W*.04);outline(x,y1,x+side*W*.08,y1-W*.04);line(x+side*W*.08,y0+W*.04,x+side*W*.08,y1-W*.04,P.d);}
      line(c-2,cy-5,c+2,cy+5,P.e);line(c,cy-7,c,cy+3,P.c);
    }
  }
  return S;
}
for(const kind of ['kindling','flash','path'])sfaDefineTheme('farolero_'+kind,{...sfaThemes.lantern,bake:(T,art,size,arc)=>faroleroFxStrip(kind,T,art,size,arc)});
SFA_OBJ.lantern={theme:'lantern',draw:sfaDrawMotifObj('lantern','lantern',3),end:'nova',endDur:520};
// Tema explícito: el objeto replicado no depende del mapa local de variantes del cast.
SFA_OBJ.path={theme:'farolero_path~p',draw:sfaBeamObj('farolero_path~p',o=>o.bx!==undefined?{ax:o.x,ay:o.y,bx:o.bx,by:o.by,w:Math.max(36,(o.r||40)*1.6)}:null)};
SFA_HEROZ.push({key:'farolero',theme:'lantern',on:h=>h.portVigilTimer>0,r:h=>h.portVigilR,end:'nova',alpha:.7});
SFA_BIND.farolero={themes:['lantern','farolero_kindling','farolero_flash','farolero_path'],
  0:{extras:false,run:c=>{const o=sfaObj(c,/lantern/);if(o)sfaP('nova','farolero_kindling',o.x,o.y,o.r,{dur:700});}},
  1:{extras:false,run:sfaMulti(sfaCone('farolero_flash'),c=>sfaP('burst','farolero_flash',c.h.x,c.h.y,60,{dur:480}))},
  2:{extras:false,run:c=>{const o=sfaObj(c,/path/);if(o)sfaP('beam','farolero_path',o.x,o.y,0,{bx:o.bx,by:o.by,w:Math.max(36,o.r*1.6),dur:700});}},
  ult:c=>sfaP('nova','lantern',c.h.x,c.h.y,c.h.portVigilR||190,{dur:1000})
};
