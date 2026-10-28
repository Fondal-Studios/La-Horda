#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(b){let c=0xffffffff;for(const v of b)c=table[(c^v)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function inspectPNG(buf,opts={}){
 const issues=[];
 if(!Buffer.isBuffer(buf)||buf.length<33||!buf.subarray(0,8).equals(signature))return {ok:false,issues:['NOT_PNG']};
 if(buf.readUInt32BE(8)!==13||buf.toString('ascii',12,16)!=='IHDR')return {ok:false,issues:['BAD_IHDR']};
 const width=buf.readUInt32BE(16),height=buf.readUInt32BE(20),depth=buf[24],color=buf[25];
 if(!width||!height||width>8192||height>8192||width*height>16777216)issues.push('INVALID_DIMENSIONS');
 if(buf[26]||buf[27]||buf[28])issues.push('UNSUPPORTED_ENCODING');
 if(opts.width&&width!==opts.width)issues.push('WIDTH_MISMATCH');
 if(opts.height&&height!==opts.height)issues.push('HEIGHT_MISMATCH');
 if(opts.requireAlpha&&![4,6].includes(color))issues.push('NO_ALPHA_CHANNEL');
 if(opts.requireRgba8&&(color!==6||depth!==8))issues.push('NOT_RGBA8');
 let pos=8,hasEnd=false,hasData=false,bytes=0,headers=0,dataEnded=false;
 while(pos+12<=buf.length){
  const n=buf.readUInt32BE(pos),kind=buf.toString('ascii',pos+4,pos+8);
  if(n>buf.length-pos-12){issues.push('TRUNCATED_CHUNK');break;}
  if(crc32(buf.subarray(pos+4,pos+8+n))!==buf.readUInt32BE(pos+8+n))issues.push('BAD_CRC');
  if(kind==='IHDR')headers++;
  if(kind==='IDAT'){if(dataEnded)issues.push('NONCONTIGUOUS_IDAT');hasData=true;bytes+=n;}
  else if(hasData)dataEnded=true;
  if(/^[A-Z]/.test(kind)&&!['IHDR','PLTE','IDAT','IEND'].includes(kind))issues.push('UNKNOWN_CRITICAL_CHUNK');
  pos+=12+n;
  if(kind==='IEND'){hasEnd=true;if(n!==0)issues.push('BAD_IEND');break;}
 }
 if(headers!==1)issues.push('BAD_IHDR_COUNT');
 if(!hasData||!bytes)issues.push('MISSING_IDAT');
 if(!hasEnd)issues.push('MISSING_IEND');
 if(pos!==buf.length)issues.push('TRAILING_DATA');
 return {ok:issues.length===0,width,height,depth,color,issues:[...new Set(issues)]};
}
if(require.main===module){try{const r=inspectPNG(fs.readFileSync(process.argv[2]),{width:Number(process.argv[3])||undefined,height:Number(process.argv[4])||undefined,requireRgba8:true});console.log(JSON.stringify(r,null,2));if(!r.ok)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=2;}}
module.exports={inspectPNG,crc32};
