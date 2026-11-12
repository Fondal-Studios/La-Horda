'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'art-source/entregas/bloques/B005_myla/cierre-cast-02');
const calls=[];
const box={window:{ART_GATE_NO_VFX:true},portadorCosmeticAura(){},ynaraDrawWings(){},champPackCasting:h=>!!h.casting,setSkinPackKey:(h,key)=>h.skin||key,portadorOwned:(h,kind)=>kind==='tantrum'&&h.tantrum?[{}]:[],drawChampPack:(key)=>{calls.push(key);return true;},ctx:{},heroes:[],enemies:[],portadorObjects:[]};
vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(ROOT,'js/rendering/portadores.js'),'utf8'),box,{filename:'portadores.js'});
const cases=[
 ['base cast',{classKey:'myla',casting:true,attackAnim:100},'myla_cast'],
 ['base cast flag without attack',{classKey:'myla',casting:true,attackAnim:0},'myla'],
 ['base idle',{classKey:'myla',casting:false},'myla'],
 ['Merienda cast',{classKey:'myla',casting:true,attackAnim:100,skin:'skin_merienda_magica'},'myla'],
 ['Arandanos cast',{classKey:'myla',casting:true,attackAnim:100,skin:'skin_myla_arandanos'},'myla'],
 ['Berrinche priority',{classKey:'myla',casting:true,attackAnim:100,tantrum:true},'myla_berrinche'],
 ['other champion',{classKey:'tanque',casting:true},'tanque']
];
const checks=cases.map(([name,h,expected])=>{calls.length=0;const returned=box.drawPortador(h,2,1);return{name,expected,calls:[...calls],ok:returned===true&&calls.length===1&&calls[0]===expected};});
const meta=fs.readFileSync(path.join(ROOT,'js/assets/portadores-meta.js'),'utf8');
checks.push({name:'supplement metadata',ok:/champPackLoadAtlas\("myla_cast","assets\/sprites\/champions\/myla\/v2\/cast\.png",\{w:112,h:112,cols:12,refH:82,anchor:106\/112/.test(meta)});
const result={status:checks.every(c=>c.ok)?'PASS':'FAIL',scope:'deterministic routing contract; browser/gameplay gate is separate',checks};
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'CONTRACT_GATE.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));if(result.status!=='PASS')process.exitCode=1;
