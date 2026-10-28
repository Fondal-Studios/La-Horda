'use strict';
// PNG decoder for RGBA8 non-interlaced sprites; checks pixel alpha and grid.
const fs=require('node:fs'),zlib=require('node:zlib');
const SIGN=Buffer.from([137,80,78,71,13,10,26,10]);
function decodePNG(buffer){
 if(!Buffer.isBuffer(buffer)||!buffer.subarray(0,8).equals(SIGN))throw Error('NOT_PNG');
 let p=8,w=0,h=0,depth=0,color=0,interlace=0,ended=false;const chunks=[];
 while(p+12<=buffer.length){
  const len=buffer.readUInt32BE(p),type=buffer.toString('ascii',p+4,p+8);
  if(len>buffer.length-p-12)throw Error('TRUNCATED_CHUNK');
  const data=buffer.subarray(p+8,p+8+len);p+=12+len;
  if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);depth=data[8];color=data[9];interlace=data[12]}
  if(type==='IDAT')chunks.push(data);
  if(type==='IEND'){ended=true;break}
 }
 if(!ended||!chunks.length||!w||!h||w>8192||h>8192)throw Error('INVALID_PNG_STRUCTURE');
 if(depth!==8||color!==6||interlace!==0)throw Error('ONLY_RGBA8_NONINTERLACED');
 const stride=w*4,raw=zlib.inflateSync(Buffer.concat(chunks),{maxOutputLength:(stride+1)*h+1024});
 if(raw.length!==(stride+1)*h)throw Error('INVALID_RAW_LENGTH');
 const out=Buffer.alloc(stride*h);let src=0;
 const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c};
 for(let y=0;y<h;y++){
  const filter=raw[src++];
  if(filter>4)throw Error('BAD_FILTER');
  for(let x=0;x<stride;x++){
   const v=raw[src++],idx=y*stride+x;
   const a=x>=4?out[idx-4]:0,b=y?out[idx-stride]:0,c=y&&x>=4?out[idx-stride-4]:0;
   const f=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c);
   out[idx]=(v+f)&255;
  }
 }
 return {width:w,height:h,pixels:out};
}
function inspectPixels(png,{cellWidth,cellHeight,requireBinaryAlpha=true}={}){
 const problems=[];let semi=0,opaque=0,edge=0;
 const {width:w,height:h,pixels:p}=png;
 if(cellWidth&&w%cellWidth)problems.push('GRID_WIDTH');
 if(cellHeight&&h%cellHeight)problems.push('GRID_HEIGHT');
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const a=p[(y*w+x)*4+3];
  if(a>0&&a<255)semi++;
  if(a===255)opaque++;
  if(a&&((x===0||x===w-1)||(y===0||y===h-1)))edge++;
 }
 if(requireBinaryAlpha&&semi)problems.push('PARTIAL_ALPHA');
 if(!opaque)problems.push('EMPTY_SPRITE');
 return {ok:!problems.length,width:w,height:h,semiTransparentPixels:semi,opaquePixels:opaque,edgePixels:edge,problems};
}
if(require.main===module){
 try{
  const file=process.argv[2];if(!file)throw Error('Usage: node pixel-gate.js file.png [cellWidth] [cellHeight]');
  const r=inspectPixels(decodePNG(fs.readFileSync(file)),{cellWidth:Number(process.argv[3])||undefined,cellHeight:Number(process.argv[4])||undefined});
  console.log(JSON.stringify(r,null,2));if(!r.ok)process.exitCode=1;
 }catch(e){console.error(e.message);process.exitCode=2}
}
module.exports={decodePNG,inspectPixels};
