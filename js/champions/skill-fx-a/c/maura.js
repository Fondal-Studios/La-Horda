'use strict';
/* Maura: native roots, bark and pruning silhouettes; visual state only.
 * Sources/failed attempts: art-source/entregas/maura-kit-20261025.
 * Existing thorn endpoint, expiry burst and walking_forest remain unchanged.
 */
function mauraCandidateKit() {
  const hex={o:'#1a2010',d:'#4a5a30',a:'#6c5424',b:'#879c60',c:'#cfe0a0',e:'#8b3a2a'};
  const P=Object.fromEntries(Object.entries(hex).map(([k,v])=>[k,sfaCol(v)]));
  function polygon(S,f,points,col){
    const minX=Math.floor(Math.min(...points.map(p=>p[0]))),maxX=Math.ceil(Math.max(...points.map(p=>p[0])));
    const minY=Math.floor(Math.min(...points.map(p=>p[1]))),maxY=Math.ceil(Math.max(...points.map(p=>p[1])));
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
      let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
        const a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&x+.5<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0])inside=!inside;
      }if(inside)S.set(f,x,y,col);
    }
  }
  function stroke(S,f,ax,ay,bx,by,width,col){
    const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy;
    for(let y=Math.floor(Math.min(ay,by)-width);y<=Math.ceil(Math.max(ay,by)+width);y++)for(let x=Math.floor(Math.min(ax,bx)-width);x<=Math.ceil(Math.max(ax,bx)+width);x++){
      const t=L?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/L)):0;
      if(Math.hypot(x-ax-t*dx,y-ay-t*dy)<=width/2)S.set(f,x,y,col);
    }
  }
  function edge(S,f){const q=[];for(let y=1;y<S.h-1;y++)for(let x=1;x<S.w-1;x++)if(!S.get(f,x,y)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>S.get(f,x+dx,y+dy)))q.push([x,y]);for(const [x,y]of q)S.set(f,x,y,P.o);}
  function dissolve(S,f,k){for(let y=0;y<S.h;y++)for(let x=0;x<S.w;x++)if(sfaHash(x+71,y+19)<k)S.set(f,x,y,0);}
  const roots=new SfaStrip(168,40,12);
  for(let f=0;f<11;f++){
    const end=6+154*Math.min(1,(f+1)/7);
    const trunkY=x=>20+Math.sin(x*.065)*3+Math.sin(x*.137)*1.5;
    let px=5,py=trunkY(5);
    for(let x=7;x<=end;x+=2){const y=trunkY(x),w=4.8-x/65;
      stroke(roots,f,px,py,x,y,w,P.a);stroke(roots,f,px,py-1,x,y-1,2,P.c);px=x;py=y;
    }
    // Unequal curved forks taper into the soil; no repeated spear/leaf silhouette.
    const forks=[[18,-1,20,10],[39,1,23,11],[68,-1,17,13],[84,1,31,9],[117,-1,24,10],[135,1,21,12]];
    for(let i=0;i<forks.length;i++){
      const [x,side,len,reach]=forks[i];if(end<=x)continue;
      const growth=Math.min(1,(end-x)/len),sy=trunkY(x);let ax=x,ay=sy;
      for(let j=1;j<=12*growth;j++){
        const t=j/12,bx=x+len*t,by=sy+side*reach*Math.sin(t*Math.PI*.5);
        stroke(roots,f,ax,ay,bx,by,Math.max(1,3.4*(1-t)),P.a);
        if(j<8)stroke(roots,f,ax,ay-side,bx,by-side,2,P.b);
        if(j===6){const tx=bx+len*.3,ty=by+side*4;stroke(roots,f,bx,by,tx,ty,1,P.a);}
        ax=bx;ay=by;
      }
      if(growth>.65){const bx=x+len*.48,by=sy+side*reach*.65;stroke(roots,f,bx,by,bx-2,by-side*3,1,P.e);}
    }
    edge(roots,f);if(f>7)dissolve(roots,f,(f-7)/4);
  }
  const bark=new SfaStrip(64,80,18);
  const plates=[[[7,22],[12,17],[15,21],[20,18],[22,26],[19,31],[20,40],[15,38],[11,43],[6,36]],[[42,26],[44,18],[49,21],[52,17],[58,22],[58,36],[53,43],[49,38],[44,40],[45,31]],[[10,45],[14,40],[18,44],[22,40],[24,49],[21,54],[23,63],[18,66],[16,71],[10,64]],[[40,49],[42,40],[46,44],[50,40],[54,45],[54,64],[48,71],[46,66],[41,63],[43,54]]];
  for(let f=0;f<17;f++){
    const count=f<4?f+1:4;const spread=f>=14?(f-13):0;
    for(let i=0;i<count;i++){
      const shift=(i%2?1:-1)*spread,dy=f<4?(3-f)*2:0,pts=plates[i].map(([x,y])=>[x+shift,y+dy]);
      polygon(bark,f,pts,P.a);
      const cx=(i%2?49:15)+shift,top=(i<2?22:45)+dy;
      stroke(bark,f,cx-2,top,cx-3,top+12,3,P.c);stroke(bark,f,cx-3,top+12,cx,top+19,1,P.d);
      stroke(bark,f,cx+3,top+3,cx+1,top+9,1,P.e);stroke(bark,f,cx+1,top+9,cx+4,top+14,1,(f%4===2)?P.c:P.e);
      polygon(bark,f,[[cx-2,top+7],[cx-7,top+1],[cx-4,top+11]],P.d);
    }
    // Long open grain channels retain the plate silhouette without a solid panel over actors.
    const holes=[];
    for(let y=2;y<bark.h-2;y++)for(let x=2;x<bark.w-2;x++){
      if(!bark.get(f,x,y))continue;
      const interior=[[-2,0],[2,0],[0,-2],[0,2]].every(([dx,dy])=>bark.get(f,x+dx,y+dy));
      if(interior && (x + Math.floor(y/9)) % 5 !== 0)holes.push([x,y]);
    }
    for(const [x,y] of holes)bark.set(f,x,y,0);
    edge(bark,f);if(f>=14)dissolve(bark,f,(f-13)/4);
  }
  const steel=sfaCol('#f3e8bb'),steelShade=sfaCol('#acb9a4');
  const shears=new SfaStrip(152,152,12);
  for(let f=0;f<11;f++){
    const spin=(f<3?-.8:-.8+(Math.min(f,7)-2)*Math.PI*2/5),open=f<3?.38+f*.08:Math.max(.03,.56-(f-2)*.15);
    const centre=[76+Math.cos(spin)*38,76+Math.sin(spin)*38];
    function pt(x,y,angle){return[centre[0]+x*Math.cos(angle)-y*Math.sin(angle),centre[1]+x*Math.sin(angle)+y*Math.cos(angle)];}
    for(const side of [-1,1]){
      const angle=spin+Math.PI/2+side*open;
      polygon(shears,f,[[0,-3],[29,-4],[42,-1],[30,2],[3,3]].map(([x,y])=>pt(x,y,angle)),steelShade);
      const a=pt(3,-2,angle),b=pt(36,-1,angle);stroke(shears,f,...a,...b,2,steel);
      const h=pt(-17,side*2,angle);stroke(shears,f,...centre,...h,4,P.a);
      for(let t=0;t<24;t++){const theta=t*Math.PI*2/24;const q=pt(-22+Math.cos(theta)*7,side*2+Math.sin(theta)*4,angle);stroke(shears,f,Math.round(q[0]),Math.round(q[1]),Math.round(q[0]),Math.round(q[1]),3,P.a);}
    }
    stroke(shears,f,centre[0],centre[1],centre[0],centre[1],4,P.e);
    if(f>=3)for(let i=0;i<6;i++){const a=spin-i*.15,r=47+(i%2)*5,x=76+Math.cos(a)*r,y=76+Math.sin(a)*r;polygon(shears,f,[[x-2,y],[x,y-3],[x+2,y],[x,y+2]],P.e);}
    edge(shears,f);if(f>7)dissolve(shears,f,(f-7)/4);
  }
  return {palette:hex,roots,bark,shears};
}

const mauraNativeCache = new Map();
function mauraNativeStrip(kind) {
  if (!mauraNativeCache.size) {
    const kit=mauraCandidateKit();
    for(const key of ['roots','bark','shears']) { const S=kit[key]; mauraNativeCache.set(key,{cv:S.toCanvas(),w:S.w,h:S.h,n:S.n,S}); }
  }
  return mauraNativeCache.get(kind);
}
function mauraDrawRoots(s,g) {
  const b=mauraNativeStrip('roots'),L=Math.hypot(s.bx-s.x,s.by-s.y);
  if(!b||L<1)return;
  const f=Math.min(b.n-1,Math.max(0,Math.floor(s.t/s.dur*b.n)));
  g.save();g.imageSmoothingEnabled=false;g.globalAlpha=.9;g.translate(s.x,s.y);g.rotate(Math.atan2(s.by-s.y,s.bx-s.x));
  g.drawImage(b.cv,f*b.w,0,b.w,b.h,0,-s.w/2,L,s.w);g.restore();
}
function mauraBakeShears(T,art,size) {
  if(art!=='nova')return null;
  const b=mauraNativeStrip('shears'),out=new SfaStrip(size,size,b.n);
  // Bake into the engine bucket; nearest-neighbor and alpha remain binary.
  for(let f=0;f<b.n;f++) {
    const spin=f<3?-.8:-.8+(Math.min(f,7)-2)*Math.PI*2/5;
    const cx=76+Math.cos(spin)*38,cy=76+Math.sin(spin)*38;
    // Keep the orbit in the real area; cap the tool silhouette within large buckets.
    const glyphScale=Math.min(1,64/size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
      const sx=Math.floor(glyphScale===1?x*b.w/size:cx+(x*b.w/size-cx)/glyphScale),sy=Math.floor(glyphScale===1?y*b.h/size:cy+(y*b.h/size-cy)/glyphScale);
      if(sx>=0&&sx<b.w&&sy>=0&&sy<b.h)out.set(f,x,y,b.S.get(f,sx,sy));
    }
  }
  return out;
}
function mauraDrawBark(o) {
  const h=o.owner;if(!h||!h.alive||h.fused||!(h.shield>0)||!(o.life>0))return;
  const b=mauraNativeStrip('bark'),age=Math.max(0,(o.maxLife||4000)-o.life);
  const f=age<300?Math.min(5,Math.floor(age/50)):o.life<300?Math.min(16,14+Math.floor((300-o.life)/100)):6+Math.floor((age-300)/100)%8;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=.95;
  ctx.drawImage(b.cv,f*b.w,0,b.w,b.h,h.x-56,h.y-123,112,112);ctx.restore();
}
sfaDefineTheme('maura_roots',{...sfaTheme('thorn'),beamDraw:()=>{}});
sfaDefineTheme('maura_shears',{...sfaTheme('thorn'),bake:mauraBakeShears,beamDraw:(s,g)=>sfaDrawOne({...s,art:'nova',r:s.r/2},g)});
SFA_OBJ.ex_thorns={theme:'thorn',end:'nova',endDur:520};
SFA_OBJ.ex_bark={theme:'thorn',draw:()=>{},end:'nova',endDur:560};
SFA_OBJ.ex_forest={theme:'thorn',pulse:true,end:'nova',endDur:720};
SFA_BIND.maura={themes:['thorn'],
  0:{extras:false,run:c=>{if(!sfaObj(c,/^ex_thorns$/))return;const l=sfaLineOf(c);if(l)sfaP('beam','maura_roots',l.ax,l.ay,0,{bx:l.bx,by:l.by,w:l.w,dur:720,noEnd:1});}},
  1:{extras:false,run:c=>{if(sfaObj(c,/^ex_bark$/))mauraNativeStrip('bark');}},
  2:{extras:false,run:c=>{if(!c.rec.fx.length||c.h.exCue?.action!=='shear')return;sfaP('beam','maura_shears',c.from.x,c.from.y,sfaR(c)*2,{dur:700,noEnd:1,bx:c.from.x,by:c.from.y});}},
  ult:sfaNovaAt('thorn',{self:true})
};
// Warm only when Maura is present, before the first combat frame.
(function(){const start=startRun;startRun=function(){const out=start.apply(this,arguments);if(heroes.some(h=>h.classKey==='maura'))mauraNativeStrip('roots');return out;};})();

// Roots travel along the ground; actors render above them. Keep the shared beam clock/network contract.
(function(){const ground=drawPortadorGround;drawPortadorGround=function(){ground.apply(this,arguments);if(window.SFA_OFF)return;for(const s of sfaPool)if(s.theme.split('~')[0]==='maura_roots'&&s.t>=0&&s.t<s.dur)mauraDrawRoots(s,ctx);};})();

// Bark plates belong above actors; shield ownership and lifetime still gate every draw.
(function(){const top=drawPortadorTop;drawPortadorTop=function(){top.apply(this,arguments);if(window.SFA_OFF)return;for(const o of portadorObjects)if(o.kind==='ex_bark')mauraDrawBark(o);};})();
