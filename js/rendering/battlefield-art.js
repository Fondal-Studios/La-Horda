"use strict";
const BATTLEFIELD_IMAGES = {};
for(const key of Object.keys(BATTLEFIELD_META)){
 const src='assets/sprites/battlefield/'+key+'.png',img=new Image();
 ASSET_WEBP.add(src);assetsRegisterSource(src);img.src=src;BATTLEFIELD_IMAGES[key]=img;
}
const BATTLEFIELD_HEIGHTS={golem_cuerpos:218,mn_titan:174,mn_cerbero:160,ab_carcelero:170,cm_maestro:112,cm_dama:125,cm_tramoyista:138,cm_presentador:138,minotauro:196,leviatan:230,dragon_forja:206,micelio:185,'stone-dragon':160,'king-colossus':174,thornbeast:66,scavenger:58};
function battlefieldMonsterKey(e){
 if(e.lanesProxy)return null;
 if(currentArena==='convergencia'){
  if(e.epicId!=null)return e.epicId===0?'stone-dragon':'king-colossus';
  if(e.kindM==='melee')return 'scavenger';
 }
 if(e.type==='bestia_bosque')return 'thornbeast';
 return BATTLEFIELD_HEIGHTS[e.type]?e.type:null;
}
function battlefieldDrawMonster(e){
 const key=battlefieldMonsterKey(e),m=BATTLEFIELD_META[key],img=BATTLEFIELD_IMAGES[key];
 if(!m||!img||!img.complete||!img.naturalWidth)return false;
 const n=e.attackAnim>0?3:e.moving===false?0:1+Math.floor((e.animT||0)/180)%2,s=BATTLEFIELD_HEIGHTS[key]/m.ref;
 drawAnimFrameSized(img,{frames:[{x:n*m.w,y:0,w:m.w,h:m.h}]},0,e.x,e.y,m.w*s,m.h*s,.5,376/m.h,e.fx<0,1);return true;
}
function battlefieldDrawProp(p){
 const m=BATTLEFIELD_META[p.battlefield],img=BATTLEFIELD_IMAGES[p.battlefield];
 if(!img||!img.complete||!img.naturalWidth)return false;
 let alpha=p.alpha==null?1:p.alpha;
 if(p.h>110&&heroes.some(h=>h.alive&&Math.abs(h.x-p.x)<p.w*.42&&h.y<p.y&&h.y>p.y-p.h*.85))alpha*=.38;
 drawAnimFrameSized(img,{frames:[{x:0,y:0,w:m.w,h:m.h}]},0,p.x,p.y,p.w,p.h,.5,.98,p.flip,alpha);return true;
}
function battlefieldProp(key,x,y,h,r){
 const m=BATTLEFIELD_META[key],p={battlefield:key,x,y,h,w:h*m.w/m.h,noSolid:!r};aidProps.push(p);if(r)aidSolids.push({x,y,r});return p;
}
function battlefieldLaneFree(x,y){
 if(x<250||y<250||x>LANES.W-250||y>LANES.H-250)return false;
 for(let l=0;l<3;l++)if(laneProject(l,x,y).d<270)return false;
 for(let t=0;t<2;t++){const c=laneCrystalPos(t);if(Math.hypot(c.x-x,c.y-y)<740)return false;}
 for(const c of [...LANES_CAMPS,...LANES_EPICS])if(Math.hypot(c.x-x,c.y-y)<400)return false;
 return Math.abs(y-(LANES.H/LANES.W)*x)>=260;
}
function battlefieldBuild(){
 if(currentArena==='convergencia'){
  const rnd=aidRng(74119);let groups=0;
  for(let tries=0;tries<2400&&groups<28;tries++){
   const x=350+rnd()*(LANES.W-700),y=350+rnd()*(LANES.H/2-350);
   if(!battlefieldLaneFree(x,y)||aidSolids.some(s=>Math.hypot(s.x-x,s.y-y)<250))continue;
   const cluster=[[0,0],[75,35],[-60,55]];
   if(!cluster.every(([dx,dy])=>battlefieldLaneFree(x+dx,y+dy)))continue;
   for(const [dx,dy]of cluster)for(const mirror of [false,true]){
    const px=mirror?LANES.W-x-dx:x+dx,py=mirror?LANES.H-y-dy:y+dy;
    battlefieldProp(groups%5===0?(groups%2?'slate':'moss-rock'):groups%7===0?'dead-tree':groups%2?'oak':'pine',px,py,groups%5===0?100:170+rnd()*35,groups%5===0?30:22);
   }groups++;
  }
  for(const [i,c]of LANES_CAMPS.entries())battlefieldProp(i%2?'cart':'bones',c.x+110,c.y+80,i%2?52:34,0);
  for(const c of LANES_EPICS)battlefieldProp('altar',c.x,c.y-210,105,0);
 }else if(currentArena==='coliseo'){
  for(const c of COL.PITS)for(let i=0;i<12;i++){const a=i*Math.PI/6;battlefieldProp(i%3?'column':'brazier',c.x+Math.cos(a)*445,c.y+Math.sin(a)*445,i%3?100:72,0);}
 }else if(['bosque','laberinto','infernal','micelial','ciudad','minas'].includes(currentArena)){
  const rnd=aidRng(9217^_aidSalt());
  for(let i=0;i<26;i++){const p=aidFreeSpot(rnd,240,850,55);if(p)battlefieldProp(currentArena==='bosque'?(i%2?'fern':'mushrooms'):currentArena==='micelial'?'mushrooms':i%3?'bones':'fallen',p.x,p.y,28+rnd()*22,0);}
 }
}
