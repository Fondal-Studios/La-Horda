'use strict';
/* Dáriel: diapasón discordante, marcha en barras de compás y retorno al estribillo.
 * Primera pasada nativa; sólo dibujo. Concierto UF, básico note y mecánicas intactos. */
function darielFxStrip(kind,T,art,size,arc){
  const cone=art==='cone',aura=art==='aura';
  if(!(kind==='discord'&&cone||kind!=='discord'&&(aura||art==='nova')))return null;
  arc=arc||.85;const W=aura?48:cone?size+2:size,H=aura?56:cone?Math.ceil(2*size*Math.sin(Math.min(arc,1.5))+6):size,N=12;
  const S=new SfaStrip(W,H,N),P=T.px,c=W/2,cy=H/2,R=cone?size-2:W/2-3;
  for(let f=0;f<N;f++){
    const q=f/(N-1),fade=aura?1:q<.64?1:(1-q)/.36;
    const dot=(x,y,col)=>{x=Math.round(x);y=Math.round(y);if(x<1||y<1||x>=W-1||y>=H-1)return;if(cone&&(Math.hypot(x-1,y-cy)>R||Math.abs(Math.atan2(y-cy,x-1))>arc))return;if(sfaDither(x,y,fade))S.set(f,x,y,col);};
    const line=(ax,ay,bx,by,col)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))));for(let i=0;i<=n;i++)dot(ax+(bx-ax)*i/n,ay+(by-ay)*i/n,col);};
    const stroke=(ax,ay,bx,by)=>{line(ax,ay+1,bx,by+1,P.o);line(ax,ay,bx,by,P.b);};
    const note=(x,y,flip=1)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-2;dx<=1;dx++)dot(x+dx,y+dy,P.o);line(x-1,y,x+1,y,P.b);stroke(x+2,y,x+2,y-7);line(x+2,y-7,x+5*flip,y-5,P.a);};
    if(cone){
      // Tres frentes angulares que se abren desde un diapasón; huecos entre ondas.
      for(let j=0;j<3;j++){
        const reach=R*(.16+.61*Math.min(1,q/.66))*(1-j*.24),spread=reach*Math.tan(arc)*.5;
        stroke(1+reach*.62,cy-spread,1+reach,cy-spread*.28);
        stroke(1+reach,cy-spread*.28,1+reach*.82,cy);
        stroke(1+reach*.82,cy,1+reach,cy+spread*.28);
        stroke(1+reach,cy+spread*.28,1+reach*.62,cy+spread);
      }
      if(f<8){stroke(3,cy-3,12,cy-3);stroke(3,cy+3,12,cy+3);stroke(3,cy-3,3,cy+3);stroke(3,cy,2,cy);}
      if(f>1&&f<10){note(1+R*.56,cy-R*.19);note(1+R*.48,cy+R*.23,-1);}
    }else if(aura){
      const y=36-Math.round((f%6)/6*5);
      if(kind==='march'){
        // Barras de compás a los lados del cuerpo, sin escudo macizo sobre el torso.
        for(const x of[5,41]){stroke(x,y+8,x,y-16);stroke(x+2,y+8,x+2,y-16);for(let j=0;j<3;j++)line(x-2,y-12+j*4,x+4,y-12+j*4,P.a);}
      }else{
        note(8,y,-1);note(39,y-6,1);for(let j=0;j<3;j++){dot(6+j,46-j,P.a);dot(40+j,43-j,P.a);}
      }
    }else if(kind==='march'){
      // Tres tramos de pentagrama radiales con barras terminales, abren una salida.
      const rr=R*(.26+.67*Math.min(1,q/.7));
      for(let side=0;side<3;side++){
        const a=side*Math.PI*2/3+.2,u=Math.cos(a),v=Math.sin(a),x=c+u*rr,y=cy+v*rr;
        for(let j=-1;j<=1;j++)stroke(x-v*8-u*j*3,y+u*8-v*j*3,x+v*8-u*j*3,y-u*8-v*j*3);
        stroke(x-v*9-u*4,y+u*9-v*4,x-v*9+u*4,y+u*9+v*4);note(x+u*5,y+v*5);
      }
    }else{
      // Dos signos de repetición enfrentados viajan hacia dentro, no otra nova circular.
      const rr=R*(.86-.56*Math.min(1,q/.7));
      for(const side of[-1,1]){
        const x=c+side*rr,y=cy;stroke(x,y-R*.3,x,y+R*.3);stroke(x+side*3,y-R*.3,x+side*3,y+R*.3);
        stroke(x,y-R*.3,x-side*R*.24,y-R*.3);stroke(x,y+R*.3,x-side*R*.24,y+R*.3);
        for(const dy of[-R*.13,R*.13]){dot(x-side*5,y+dy,P.c);dot(x-side*6,y+dy,P.b);}
      }
      if(f>1&&f<9){note(c,cy-4);note(c+4,cy+9,-1);}
    }
  }
  return S;
}
for(const kind of['discord','march','refrain'])sfaDefineTheme('dariel_'+kind,{...sfaThemes.music,bake:(T,art,size,arc)=>darielFxStrip(kind,T,art,size,arc)});
SFA_OBJ.ex_concert = {theme: 'music', pulse: true, end: 'nova', endDur: 700};
SFA_BIND.dariel = {themes: ['music','dariel_discord','dariel_march','dariel_refrain'],
  0: {extras:false,run:sfaCone('dariel_discord')},
  1: {extras:false,run:sfaMulti(sfaNovaAt('dariel_march', {self: true}), sfaAura('dariel_march', {allies: true, r: 150, test: a => (a.shield || 0) > 0}))},
  2: {extras:false,run:sfaMulti(sfaNovaAt('dariel_refrain', {self: true}), sfaAura('dariel_refrain', {allies: true, r: 140, test: a => a.hp < a.maxHp}))},
  ult: sfaNovaAt('music', {self: true})
};
