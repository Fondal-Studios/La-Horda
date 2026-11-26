'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const OUT='art-source/entregas/guerrero-codex-20261125/integracion-direccional-06';
const old=PNG.sync.read(fs.readFileSync('assets/sprites/champions/guerrero/codex-v1/atlas.png'));
const png=PNG.sync.read(fs.readFileSync('assets/sprites/champions/guerrero/codex-v2/atlas.png'));
assert.equal(png.width,576);assert.equal(png.height,1584);
assert.deepEqual(png.data.subarray(0,old.data.length),old.data,'36 existing cells must be pixel-identical');
for(let i=3;i<png.data.length;i+=4)assert(png.data[i]===0||png.data[i]===255,'nonbinary alpha');
const source=fs.readFileSync('tools/art/pixel-density.js','utf8');
const section=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b));
const context=vm.createContext({});
vm.runInContext(section('const CANON =','const FLOOR_SCALE')+section('function analyzeInPage','function walk')+section('function classify','(async () => {'),context);
const rows=[];
for(let f=36;f<44;f++){
 const data=new Uint8ClampedArray(144*144*4);
 for(let y=0;y<144;y++){const start=(((f/4|0)*144+y)*576+(f%4)*144)*4;data.set(png.data.subarray(start,start+576),y*576);}
 const m=context.analyzeInPage(data,144,144,8),result=context.classify('campeones',m,66/71,'atlas.png');
 assert(m.opaque>150,'empty frame');assert.equal(result.issues.length,0,JSON.stringify({f,m,result}));
 rows.push({frame:f,...m,...result});
}
fs.writeFileSync(OUT+'/NATIVE.json',JSON.stringify({status:'PASS',decoder:'pngjs; unchanged canonical density detector',preservedCells:36,rows},null,2)+'\n');
console.log('PASS: 36 preserved cells; eight nonempty, binary-alpha frames within canonical density.');
