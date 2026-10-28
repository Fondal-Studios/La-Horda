'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const {decodePNG,inspectPixels}=require('./pixel-gate');
function png(pixel,filter=0){
 const sig=Buffer.from([137,80,78,71,13,10,26,10]);
 const chunk=(name,data)=>{const b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length,0);b.write(name,4);data.copy(b,8);b.writeUInt32BE(require('./png-gate').crc32(b.subarray(4,8+data.length)),8+data.length);return b};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(1,0);ihdr.writeUInt32BE(1,4);ihdr[8]=8;ihdr[9]=6;
 return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(Buffer.from([filter,...pixel]))),chunk('IEND',Buffer.alloc(0))]);
}
test('accepts opaque pixel',()=>{const r=inspectPixels(decodePNG(png([10,20,30,255])),{cellWidth:1,cellHeight:1});assert.equal(r.ok,true);assert.equal(r.opaquePixels,1)});
test('rejects semi transparency',()=>{const r=inspectPixels(decodePNG(png([10,20,30,128])));assert.ok(r.problems.includes('PARTIAL_ALPHA'))});
test('rejects empty sprite',()=>{const r=inspectPixels(decodePNG(png([0,0,0,0])));assert.ok(r.problems.includes('EMPTY_SPRITE'))});
test('rejects unsupported filter',()=>assert.throws(()=>decodePNG(png([1,2,3,255],7)),/BAD_FILTER/));
test('rejects malformed input',()=>assert.throws(()=>decodePNG(Buffer.from('not png')),/NOT_PNG/));

test('rejects CRC corruption',()=>{const b=png([1,2,3,255]);b[29]^=1;assert.throws(()=>decodePNG(b),/BAD_CRC/)});
