'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({console});
vm.runInContext(`
let save={champions:{axiom:{unlocked:true,level:42,croma:'blue',cosmeticSkin:'',ascSkin:2},tanque:{unlocked:false,level:1},hidden:{unlocked:true}},cromas:{blue:true},cosmeticUnlocks:{skin:true}};
let selectedClass='axiom',currentArena='infernal',lobbyAllies=null,endlessActive=false,endlessPending=false,divinaMode=false;
let CLASSES={axiom:{},tanque:{},hidden:{}};let LANES={LEVEL0:3};
function championPlayable(k){return k!=='hidden'}
function defaultSave(){return {champions:{axiom:{},tanque:{},hidden:{}}}}
function lanesWrap(){} function lanesNewTeam(t){return {team:t}}
`,c);
// Only initialization and selection: no renderer/match stubs presented as real gameplay validation.
let src=fs.readFileSync('js/arenas/lanes/lanes-core.js','utf8');
src=src.slice(0,src.indexOf('// Devuelve TODO'));
vm.runInContext(src,c);
vm.runInContext(`lanesWrap=()=>{};lanesNewTeam=t=>({team:t});`,c);
const run=s=>vm.runInContext(s,c);
assert.equal(run(`JSON.stringify(lanesOwnedRoster())`),'["axiom"]');
assert.equal(run(`lanesOwnedSelection()`),'axiom');
assert.equal(run(`lanesOwnedSelection('tanque')`),null);
assert.equal(run(`lanesOwnedSelection('hidden')`),null);
const original=run('JSON.stringify(save)');
run(`lanesBegin('lobby')`);
assert.equal(run(`JSON.stringify(lanesOwnedRoster())`),'["axiom"]');
assert.equal(run(`save.champions.tanque.unlocked`),false);
assert.equal(run(`save.champions.axiom.croma`),'blue');
assert.equal(run(`save.champions.axiom.cosmeticSkin`),'');
assert.equal(run(`save.champions.axiom.ascSkin`),2);
run(`save.champions.axiom.level=3;save.cromas.blue=false;save.cosmeticUnlocks.skin=false`);
assert.equal(run('JSON.stringify(LN.snap.save)'),original);
assert.equal(run(`lanesOwnedSelection('tanque')`),null);
console.log('11 ownership/cosmetic/isolation assertions PASS');
