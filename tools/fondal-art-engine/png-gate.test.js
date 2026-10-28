'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {inspectPNG}=require('./png-gate');
test('reject non PNG',()=>assert.deepEqual(inspectPNG(Buffer.from('hello')).issues,['NOT_PNG']));
test('reject incomplete PNG',()=>{
 const b=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10]).copy(b);
 b.writeUInt32BE(13,8);b.write('IHDR',12);b.writeUInt32BE(112,16);b.writeUInt32BE(112,20);b[24]=8;b[25]=6;
 const r=inspectPNG(b,{width:112,height:112,requireRgba8:true});
 assert.ok(r.issues.includes('MISSING_IDAT'));assert.ok(r.issues.includes('MISSING_IEND'));
});
test('reject mismatched dimensions',()=>{
 const b=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10]).copy(b);
 b.writeUInt32BE(13,8);b.write('IHDR',12);b.writeUInt32BE(10,16);b.writeUInt32BE(20,20);b[24]=8;b[25]=6;
 assert.ok(inspectPNG(b,{width:112}).issues.includes('WIDTH_MISMATCH'));
});
