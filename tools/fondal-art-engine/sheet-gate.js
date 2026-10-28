'use strict';
const crypto=require('node:crypto');
const {decodePNG,inspectPixels}=require('./pixel-gate');
const {compare}=require('../factory/check-animation-contract');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function inspectSheet(bytes,meta,baseline=meta,{binaryAlpha=true,maxBytes=8*1024*1024,maxColors=256}={}){
 const png=decodePNG(bytes), issues=[];
 const contract=compare(baseline,meta,[png.width,png.height]);
 if(contract.status==='REJECT')return {ok:false,issues:contract.issues,contract};
 const pixels=inspectPixels(png,{cellWidth:meta.w,cellHeight:meta.h,requireBinaryAlpha:binaryAlpha});
 issues.push(...pixels.problems.map(code=>({code})));
 if(bytes.length>maxBytes)issues.push({code:'FILE_BUDGET'});
 const used=[...new Set(Object.values(meta.sets).flat().map(n=>n<0?~n:n))].sort((a,b)=>a-b),frames=[];
 for(const index of used){
  const ox=(index%meta.cols)*meta.w,oy=Math.floor(index/meta.cols)*meta.h;
  let opaque=0,border=0,minX=meta.w,minY=meta.h,maxX=-1,maxY=-1;const colors=new Set(),raw=Buffer.alloc(meta.w*meta.h*4);
  for(let y=0;y<meta.h;y++)for(let x=0;x<meta.w;x++){
   const src=((oy+y)*png.width+ox+x)*4, dst=(y*meta.w+x)*4;
   png.pixels.copy(raw,dst,src,src+4);
   if(!png.pixels[src+3])continue;
   opaque++;colors.add(png.pixels.readUInt32BE(src));
   if(x===0||y===0||x===meta.w-1||y===meta.h-1)border++;
   minX=Math.min(x,minX);minY=Math.min(y,minY);maxX=Math.max(x,maxX);maxY=Math.max(y,maxY);
  }
  if(!opaque)issues.push({code:'EMPTY_FRAME',frame:index});
  if(border)issues.push({code:'CLIPPED_FRAME',frame:index,pixels:border});
  if(colors.size>maxColors)issues.push({code:'PALETTE_BUDGET',frame:index,colors:colors.size});
  if(opaque===meta.w*meta.h)issues.push({code:'OPAQUE_BACKGROUND',frame:index});
  frames.push({index,opaque,colors:colors.size,bounds:opaque?[minX,minY,maxX+1,maxY+1]:null,rgba_sha256:sha(raw)});
 }
 const clips={};
 for(const [name,indices] of Object.entries(meta.sets)){
  const hashes=indices.map(n=>frames.find(f=>f.index===(n<0?~n:n)).rgba_sha256);
  clips[name]={frames:indices.length,uniqueFrames:new Set(hashes).size};
  // Intentional holds can repeat; an entirely frozen multi-frame clip cannot pass.
  if(indices.length>1&&clips[name].uniqueFrames===1)issues.push({code:'FROZEN_CLIP',clip:name});
 }
 return {ok:issues.length===0,status:issues.length?'FIX':'TECHNICAL_PASS',approvalClaimed:false,
  sha256:sha(bytes),rgba_sha256:sha(png.pixels),width:png.width,height:png.height,
  bytes:bytes.length,frames,clips,issues,contract};
}
module.exports={inspectSheet,sha};
