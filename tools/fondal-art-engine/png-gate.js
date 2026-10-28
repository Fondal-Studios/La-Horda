#!/usr/bin/env node
'use strict';
// Deterministic PNG structural gate; does not imply visual approval.
const fs=require('node:fs'),zlib=require('node:zlib');
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
function inspectPNG(buf,opts={}){
 const issues=[];
 if(!Buffer.isBuffer(buf)||buf.length<33||!buf.subarray(0,8).equals(signature))return {ok:false,issues:['NOT_PNG']};
 const length=buf.readUInt32BE(8),type=buf.toString('ascii',12,16);
 if(type!=='IHDR'||length!==13)return {ok:false,issues:['BAD_IHDR']};
 const width=buf.readUInt32BE(16),height=buf.readUInt32BE(20),depth=buf[24],color=buf[25],compression=buf[26],filter=buf[27],interlace=buf[28];
 if(!width||!height||width>16384||height>16384)issues.push('INVALID_DIMENSIONS');
 if(compression||filter||interlace)issues.push('UNSUPPORTED_ENCODING');
 if(opts.width&&width!==opts.width)issues.push('WIDTH_MISMATCH');
 if(opts.height&&height!==opts.height)issues.push('HEIGHT_MISMATCH');
 if(opts.requireAlpha&&![4,6].includes(color))issues.push('NO_ALPHA_CHANNEL');
 if(opts.requireRgba8&&(color!==6||depth!==8))issues.push('NOT_RGBA8');
 let pos=8,hasEnd=false,hasData=false,bytes=0;
 while(pos+12<=buf.length){
  const n=buf.readUInt32BE(pos),kind=buf.toString('ascii',pos+4,pos+8);
  if(n>buf.length-pos-12){issues.push('TRUNCATED_CHUNK');break}
  if(kind==='IDAT'){hasData=true;bytes+=n}
  pos+=12+n;
  if(kind==='IEND'){hasEnd=true;break}
 }
 if(!hasData||!bytes)issues.push('MISSING_IDAT');
 if(!hasEnd)issues.push('MISSING_IEND');
 return {ok:issues.length===0,width,height,depth,color,issues};
}
if(require.main===module){
 try{
  const file=process.argv[2];if(!file)throw Error('Usage: node png-gate.js <file.png> [width] [height]');
  const result=inspectPNG(fs.readFileSync(file),{width:Number(process.argv[3])||undefined,height:Number(process.argv[4])||undefined,requireAlpha:true,requireRgba8:true});
  console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
 }catch(e){console.error(e.message);process.exitCode=2}
}
module.exports={inspectPNG};
