'use strict';
// Seguridad: netPlayEvent (js/net/net-game.js) solo ejecuta eventos de la lista blanca; el nombre lo manda el anfitrión.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.resolve(__dirname,'../js/net/net-game.js'),'utf8');
const cut=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,'marcador '+a);return src.slice(i,j);};
const code=[cut('const NET_EVENT_FNS','const NET_INLINE_EVENTS'),'const NET_ORIG = {};',
  cut('function netDecode(','function netRestore'),cut('const NET_PLAY_ALLOWED','/* =====================================================================\n   ANFITRI')].join('\n');
const calls=[];
const ctx={netMatch:{mySlot:1,ents:new Map()},heroes:[],CLASSES:{},selectedClass:'x',save:{champions:{x:{level:1}}},
  netLog(){},netRestore:o=>o,divinaMode:false,ENEMY_BASE:{},
  grantXP:(...a)=>{calls.push(['xp',a]);return 0;},grantGold:(...a)=>calls.push(['gold',a]),
  registerPlayerHurt:(...a)=>calls.push(['hurt',a]),gainSkillUseXp:(...a)=>calls.push(['useXp',a]),
  floatText:(...a)=>calls.push(['floatText',a]),
  eval:()=>calls.push(['EVIL','eval']),Function:function(){calls.push(['EVIL','Function']);},alert:()=>calls.push(['EVIL','alert']),
  constructor:()=>calls.push(['EVIL','constructor'])};
ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(code,ctx);
const play=ev=>vm.runInContext('netPlayEvent',ctx)(ev);
for(const n of ['eval','Function','constructor','__proto__','alert','toString','hasOwnProperty','netPlayEvent','setTimeout','NET_ORIG']){
  assert.doesNotThrow(()=>play([n,['globalThis.pwn=1']]),n);
  assert.doesNotThrow(()=>play([n,['x'],1]),n);
}
assert.doesNotThrow(()=>play(null)); assert.doesNotThrow(()=>play([123,[]])); assert.doesNotThrow(()=>play(['xp','notarray']));
assert.deepEqual(calls.filter(c=>c[0]==='EVIL'),[],'ninguna función peligrosa debe ejecutarse');
assert.equal(ctx.pwn,undefined);
// legítimos
play(['xp',[50,'x'],1]); play(['gold',[7]]); play(['hurt',[3,1,2],1]); play(['useXp',[2,'x']]); play(['floatText',[1,2,'9']]);
assert.deepEqual(calls.map(c=>c[0]),['xp','gold','hurt','useXp','floatText']);
// dirigido a otro slot: ignorado; demasiados args: ignorado
play(['gold',[9],0]); play(['gold',new Array(40).fill(1)]);
assert.equal(calls.length,5);
console.log('PASS net-play-event');
