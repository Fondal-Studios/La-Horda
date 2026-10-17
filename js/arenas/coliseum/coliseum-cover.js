"use strict";
// Same symmetric layout in both pits; final ring remains entirely open.
const COL_COVER_LAYOUT=[[-110,-120,30,'column',140],[110,-120,30,'column',140],[-110,120,30,'column',140],[110,120,30,'column',140],[0,-255,34,'slate',82],[0,255,34,'slate',82]];
function colBuildCover(){
 for(const [pit,c]of COL.PITS.entries())for(const [dx,dy,r,art,h]of COL_COVER_LAYOUT){
  battlefieldProp(art,c.x+dx,c.y+dy,h,r);
  Object.assign(aidSolids[aidSolids.length-1],{colCover:true,pit});
 }
}
function colCoverHit(x0,y0,x1,y1,pad){
 const dx=x1-x0,dy=y1-y0,len=dx*dx+dy*dy;
 for(const s of aidSolids){if(!s.colCover)continue;
  const t=len?Math.max(0,Math.min(1,((s.x-x0)*dx+(s.y-y0)*dy)/len)):0;
  if(Math.hypot(x0+t*dx-s.x,y0+t*dy-s.y)<s.r+(pad||0))return s;
 }return null;
}
function colBlockProjectile(p,x0,y0){
 // Lobbed shots fly over cover. Ground projectiles (also piercing) stop at stone.
 if(p.lob||p.ignoreTerrain)return false;
 if(!colCoverHit(x0,y0,p.x,p.y,p.radius||0))return false;
 p.life=0;return true;
}
function colBotMove(h,target,dodging){
 if(!LN||!LN.col||LN.col.phase!=='fight'||dodging)return null;
 const c=colPitCenter(h.pit),escape=Math.hypot(h.x-c.x,h.y-c.y)>LN.col.ringR-35;
 let goal=escape?{x:c.x,y:c.y,alive:true}:target||colLeaderFor(h);
 if(!goal||!AID_NAV.on)return null;
 if(!escape&&!colCoverHit(h.x,h.y,goal.x,goal.y,(h.radius||18)+8))return null;
 if(!h._colNav||h._colNav.length!==AID_NAV.dist.length){h._colNav=new Uint16Array(AID_NAV.dist.length);h._colNavAt=-1e9;}
 if(LN.t-h._colNavAt>200){aidNavBfs(h._colNav,seed=>seed({x:goal.x,y:goal.y,alive:true}));h._colNavAt=LN.t;}
 return aidNavDir(h,h._colNav);
}
let colStadiumCache=null;
function colStadiumArt(){
 if(colStadiumCache)return colStadiumCache;
 const cv=document.createElement('canvas');cv.width=cv.height=1120;const g=cv.getContext('2d');g.translate(560,560);
 const ring=(r,w,color)=>{g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.stroke();};
 ring(535,18,'#171311');ring(521,22,'#8d7757');ring(510,5,'#c3a879');
 for(let tier=0;tier<4;tier++){
  const r=417+tier*25;ring(r,22,tier%2?'#71604b':'#807059');ring(r-10,3,'#b49b73');ring(r+10,4,'#302b26');
  for(let j=0;j<72;j++){g.save();g.rotate(j*Math.PI/36);g.fillStyle='#453d32';g.fillRect(r-9,-1,19,2);g.restore();}
 }
 for(let tier=0;tier<4;tier++)for(let j=0;j<60;j++){
  const a=j*Math.PI/30+.02*(tier%2);if(Math.abs(Math.sin(a))<.14||j%15===7)continue;
  const r=416+tier*25,x=Math.cos(a)*r,y=Math.sin(a)*r;
  g.fillStyle='#221e1d';g.fillRect(x-4,y-5,8,11);g.fillStyle=['#795147','#526875','#6b7350','#94754b'][(j+tier)%4];g.fillRect(x-3,y-2,6,7);g.fillStyle='#a78b6a';g.fillRect(x-2,y-6,4,4);
 }
 for(const a of [Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4]){
  g.save();g.rotate(a);for(let i=0;i<9;i++){g.fillStyle=i%2?'#b09975':'#8d795c';g.fillRect(404+i*13,-12,12,24);g.fillStyle='#443a2e';g.fillRect(404+i*13,-12,2,24);}g.restore();
 }
 ring(394,12,'#b39970');ring(384,5,'#544633');
 for(const side of [-1,1]){
  g.save();g.translate(side*465,0);g.fillStyle='#171719';g.fillRect(-62,-34,124,68);
  g.fillStyle='#ac926a';g.fillRect(-66,-42,132,10);g.fillRect(-66,32,132,10);
  g.fillStyle='#574936';for(let i=0;i<8;i++)g.fillRect(-60+i*16,-30,3,60);
  g.fillStyle='#c7aa77';g.fillRect(-67,-42,12,84);g.fillRect(55,-42,12,84);g.restore();
  g.fillStyle='#3e2e22';g.fillRect(side*230-3,-490,6,88);g.fillStyle='#884036';g.fillRect(side*230-20,-484,40,58);
  g.fillStyle='#d1ad65';g.fillRect(side*230-20,-484,40,4);g.fillRect(side*230-2,-470,4,24);g.fillRect(side*230-12,-460,24,4);
 }
 return colStadiumCache=cv;
}
function colDrawStadium(p){ctx.drawImage(colStadiumArt(),p.x-560,p.y-560);}
let colSandCache=null;
function colDrawSand(p){
 if(!colSandCache){const cv=document.createElement('canvas');cv.width=cv.height=760;const g=cv.getContext('2d');g.fillStyle='#796447';g.fillRect(0,0,760,760);
  let seed=8793;for(let i=0;i<1700;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%760;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%760;g.fillStyle=i%2?'#826d4e':'#705c42';g.fillRect(x,y,2+i%3,2);}colSandCache=cv;
 }ctx.drawImage(colSandCache,p.x-380,p.y-380);
}
