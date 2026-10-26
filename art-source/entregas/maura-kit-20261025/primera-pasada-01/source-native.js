'use strict';
/* Original native SFA candidate kit. Workshop only: no SFA_BIND/SFA_OBJ mutation.
 * Requires the repository's SfaStrip/sfaCol/sfaHash. Integer opaque pixels;
 * geometry is illustrative, never determines collision or shield lifetime.
 * B163 path only (endpoint thicket remains existing); B164 bark shell;
 * B165 pruning shears (seed transfer remains an integration task).
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
    const advance=Math.min(1,(f+1)/7),end=6+154*advance;
    for(let side=-1;side<=1;side+=2){let px=5,py=20+side*3;
      for(let x=7;x<=end;x+=3){const y=20+Math.sin(x*.105)*3+side;stroke(roots,f,px,py,x,y,f<3?2:4,P.a);stroke(roots,f,px,py-1,x,y-1,1,P.b);px=x;py=y;}
      for(let i=0;i<8;i++){const x=15+i*19;if(x>end-5)continue;const grow=Math.min(1,Math.max(0,(end-x)/20));const y=20+Math.sin(x*.105)*3,tip=y+side*(8+(i%3)*2)*grow;
        polygon(roots,f,[[x-5,y],[x+8,y+side*3],[x+5,tip],[x+1,tip-side*2]],P.a);
        stroke(roots,f,x,y,x+2,tip,1,P.c);polygon(roots,f,[[x+3,y+side*2],[x+8,y+side*3],[x+6,y+side*7*grow]],P.e);
      }
    }edge(roots,f);if(f>7)dissolve(roots,f,(f-7)/4);
  }
  const bark=new SfaStrip(64,80,18);
  const plates=[[[7,22],[12,17],[15,21],[20,18],[22,26],[19,31],[20,40],[15,38],[11,43],[6,36]],[[42,26],[44,18],[49,21],[52,17],[58,22],[58,36],[53,43],[49,38],[44,40],[45,31]],[[10,45],[14,40],[18,44],[22,40],[24,49],[21,54],[23,63],[18,66],[16,71],[10,64]],[[40,49],[42,40],[46,44],[50,40],[54,45],[54,64],[48,71],[46,66],[41,63],[43,54]]];
  for(let f=0;f<17;f++){
    const count=f<4?f+1:4;const spread=f>=14?(f-13):0;
    for(let i=0;i<count;i++){
      const shift=(i%2?1:-1)*spread,dy=f<4?(3-f)*2:0,pts=plates[i].map(([x,y])=>[x+shift,y+dy]);
      polygon(bark,f,pts,P.a);
      const cx=(i%2?49:15)+shift,top=(i<2?22:45)+dy;
      stroke(bark,f,cx-2,top,cx-3,top+12,2,P.b);stroke(bark,f,cx-3,top+12,cx,top+19,1,P.d);
      stroke(bark,f,cx+3,top+3,cx+1,top+9,1,P.e);stroke(bark,f,cx+1,top+9,cx+4,top+14,1,(f%4===2)?P.c:P.e);
      polygon(bark,f,[[cx-2,top+7],[cx-7,top+1],[cx-4,top+11]],P.d);
    }edge(bark,f);if(f>=14)dissolve(bark,f,(f-13)/4);
  }
  const shears=new SfaStrip(152,152,12);
  for(let f=0;f<11;f++){
    const spin=(f<3?-.8:-.8+(Math.min(f,7)-2)*Math.PI*2/5),open=f<3?.38+f*.08:Math.max(.03,.56-(f-2)*.15);
    const centre=[76+Math.cos(spin)*38,76+Math.sin(spin)*38];
    function pt(x,y,angle){return[centre[0]+x*Math.cos(angle)-y*Math.sin(angle),centre[1]+x*Math.sin(angle)+y*Math.cos(angle)];}
    for(const side of [-1,1]){
      const angle=spin+Math.PI/2+side*open;
      polygon(shears,f,[[0,-4],[19,-6],[30,-1],[22,4],[3,5]].map(([x,y])=>pt(x,y,angle)),P.b);
      const a=pt(3,-2,angle),b=pt(25,-1,angle);stroke(shears,f,...a,...b,1,P.c);
      const h=pt(-12,side*2,angle);stroke(shears,f,...centre,...h,4,P.a);
      for(let t=0;t<24;t++){const theta=t*Math.PI*2/24;const q=pt(-16+Math.cos(theta)*5,side*2+Math.sin(theta)*3,angle);stroke(shears,f,Math.round(q[0]),Math.round(q[1]),Math.round(q[0]),Math.round(q[1]),3,P.a);}
    }
    stroke(shears,f,centre[0],centre[1],centre[0],centre[1],4,P.e);
    if(f>=3)for(let i=0;i<6;i++){const a=spin-i*.15,r=47+(i%2)*5,x=76+Math.cos(a)*r,y=76+Math.sin(a)*r;polygon(shears,f,[[x-2,y],[x,y-3],[x+2,y],[x,y+2]],P.e);}
    edge(shears,f);if(f>7)dissolve(shears,f,(f-7)/4);
  }
  return {palette:hex,roots,bark,shears};
}
