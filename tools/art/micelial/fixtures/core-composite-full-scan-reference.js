// Frozen reference from reviewed3a1b2c0c/a479b67b full-canvas implementation.
// Test-only pixel-equivalence oracle; never loaded by the game.
(()=>{
const _micMotherCoreCache=new Map();let _micMotherCoreCacheBytes=0;
function _micMotherCoreComposite(pilot){
  if(!MIC_MP_OK.mp_heart_key || !MIC_MP.mp_heart_key || MIC_MP.mp_heart_key.width!==656 || MIC_MP.mp_heart_key.height!==560) return null;
  const binding=MIC_MOTHER_CORE_BINDINGS[pilot.key],source=MIC_MP[pilot.key],heartSource=MIC_MP.mp_heart_key;
  if(!binding || !Number.isInteger(pilot.frame) || pilot.frame<0 || pilot.frame>=binding.frames.length || !source || source.width!==binding.w*binding.frames.length || source.height!==binding.h || pilot.w!==binding.w || (pilot.h||496)!==binding.h || (pilot.anchor||472)!==binding.anchor) return null;
  const stage=Math.round(Math.max(0,Math.min(1,pilot.coreAmount===undefined?1:pilot.coreAmount))*8);
  const key=pilot.key+":"+pilot.frame+":"+MIC_MOTHER_CORE_REVISION+":"+stage;
  const cached=_micMotherCoreCache.get(key);if(cached && cached.source===source && cached.heartSource===heartSource && cached.binding===binding){_micMotherCoreCache.delete(key);_micMotherCoreCache.set(key,cached);return cached.canvas;}
  const w=binding.w,h=binding.h,anchor=binding.anchor;
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
  const layer=document.createElement("canvas");layer.width=w;layer.height=h;
  const g=canvas.getContext("2d"),l=layer.getContext("2d");g.imageSmoothingEnabled=false;l.imageSmoothingEnabled=false;
  const sourceDraw=c=>c.drawImage(source,pilot.frame*w,0,w,h,0,0,w,h);
  const path=(c,poly)=>{c.beginPath();poly.forEach((p,i)=>c[i?"lineTo":"moveTo"](w/2+p[0]-328,anchor+p[1]-528));c.closePath();};
  sourceDraw(g);const basePixels=g.getImageData(0,0,w,h);l.save();path(l,MIC_MOTHER_CORE_POLY);l.clip();l.drawImage(MIC_MP.mp_heart_key,w/2-328,anchor-528);l.restore();
  // The patch cannot invent silhouette outside the existing body alpha.
  l.globalCompositeOperation="destination-in";sourceDraw(l);l.globalCompositeOperation="source-over";g.drawImage(layer,0,0);
  if(stage<8){
    // Two real source-bark plates part around the center; fixed body/root scale.
    // Their destination stays inside the reviewed cavity footprint, under arms.
    const q=stage/8, eased=q*q*(3-2*q),cx=w/2+4,cy=anchor-190;
    for(const side of [-1,1]){
      const plate=document.createElement("canvas");plate.width=w;plate.height=h;const pg=plate.getContext("2d");
      path(pg,MIC_MOTHER_CORE_POLY);pg.clip();pg.beginPath();pg.rect(side<0?0:cx,0,side<0?cx:w-cx,h);pg.clip();sourceDraw(pg);
      g.save();path(g,MIC_MOTHER_CORE_POLY);g.clip();g.translate(cx+side*90*eased,cy);g.rotate(side*0.12*eased);g.translate(-cx,-cy);g.drawImage(plate,0,0);g.restore();
    }
  }
  for(const poly of binding.frames[pilot.frame].foreground){g.save();path(g,poly);g.clip();sourceDraw(g);g.restore();}
  // One cached preparation scan, never a per-frame scan. Source alpha is exact,
  // including antialiased edges: opening the trunk must not enlarge silhouette.
  // Copy protected source bytes rather than source-over: translucent claw edges
  // must not retain cavity RGB underneath an otherwise restored foreground.
  const mask=document.createElement("canvas");mask.width=w;mask.height=h;const mg=mask.getContext("2d");
  path(mg,MIC_MOTHER_CORE_POLY);mg.fill();const patchAlpha=mg.getImageData(0,0,w,h).data;
  mg.clearRect(0,0,w,h);for(const poly of binding.frames[pilot.frame].foreground){path(mg,poly);mg.fill();}
  const frontAlpha=mg.getImageData(0,0,w,h).data,result=g.getImageData(0,0,w,h);
  for(let i=0;i<result.data.length;i+=4){
    if(stage===0 || patchAlpha[i+3]===0 || frontAlpha[i+3]===255)for(let k=0;k<3;k++)result.data[i+k]=basePixels.data[i+k];
    result.data[i+3]=basePixels.data[i+3];
  }g.putImageData(result,0,0);
  if(cached){_micMotherCoreCacheBytes-=cached.bytes;_micMotherCoreCache.delete(key);}
  const bytes=w*h*4;
  while(_micMotherCoreCacheBytes+bytes>MIC_MOTHER_CORE_CACHE_LIMIT && _micMotherCoreCache.size){
    const oldest=_micMotherCoreCache.keys().next().value;_micMotherCoreCacheBytes-=_micMotherCoreCache.get(oldest).bytes;_micMotherCoreCache.delete(oldest);
  }
  _micMotherCoreCache.set(key,{source,heartSource,binding,canvas,bytes});_micMotherCoreCacheBytes+=bytes;return canvas;
}
// Oracle keeps only one result: it is not a second production cache.
return pilot=>{_micMotherCoreCache.clear();_micMotherCoreCacheBytes=0;return _micMotherCoreComposite(pilot);};
})()
