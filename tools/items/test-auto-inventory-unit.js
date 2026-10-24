'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({console,performance,CTX_KINDS:{},save:{stash:[],champions:{tanque:{equipment:{}}},gold:0},persist(){},invalidatePassiveCache(){},selectedClass:'tanque',player:null});
for(const p of ['js/data/items.js','js/data/legendaries.js','js/data/item-identity.js','js/data/ground-loot.js','js/systems/items.js','js/systems/loot.js','js/systems/ground-loot.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:p});
function run(code){return vm.runInContext(code,c);}
let count=0;function check(code){assert.equal(run(code),true,code);count++;}
run(`var seed=makeItem('arma','comun',null,{noAffixes:true});var dup=uid=>({...JSON.parse(JSON.stringify(seed)),uid});var reset=()=>{save.stash=[];save.champions.tanque.equipment={};save.lootManagement={enabled:true,autoFuse:true,recycleDuplicates:true};};reset();save.stash.push(dup('a'));save.stash[0].favorite=true;`);
check(`discardItem(null,'a')===null && sellItem(null,'a')===null && !recyclable(save.stash[0])`);
run(`save.stash[0].favorite=false`);check(`!fuseItems(null,['a','a','a']).ok && save.stash.length===1`);
run(`addItemToInventory(null,dup('b'));addItemToInventory(null,dup('c'));`);check(`save.stash.length===1 && save.stash[0].rarity==='raro'`);
for(const mutation of [`save.stash[0].favorite=true`,`save.stash[0]._reserved=true`,`save.stash[0].set='lucifer'`,`save.stash[0].level=2`,`save.stash[0].roll+=0.01`,`save.stash[0].affixes=[{effect:'hp_mult',value:0.02}]`,`save.champions.tanque.equipment.arma='a'`]){run(`reset();save.stash.push(dup('a'),dup('b'));${mutation};addItemToInventory(null,dup('c'));`);check(`save.stash.length===3`);}
run(`reset();save.lootManagement.autoFuse=false;for(let i=0;i<INVENTORY_CAPACITY;i++){const it=dup('full_'+i);it.favorite=true;save.stash.push(it);}var valuable=makeItem('arma','mitico',null,{noAffixes:true});var room=stashMakeRoomFor(valuable);addItemToInventory(null,valuable);`);
check(`room.ok && room.overflow && save.stash.length===INVENTORY_CAPACITY+1 && stashUsedSlots()===INVENTORY_CAPACITY`);
check(`!recyclable(valuable)`);run(`save.lootManagement.enabled=false`);check(`!stashMakeRoomFor(dup('off')).ok`);
run(`reset();save.lootManagement.autoFuse=false;for(let i=0;i<INVENTORY_CAPACITY;i++)save.stash.push(dup('full_'+i));`);
check(`stashMakeRoomFor(dup('recycle')).self===true`);
run(`var newBuild=dup('build');newBuild.roll+=0.001;`);check(`!stashMakeRoomFor(newBuild).self`);
// Persistence roundtrip through the actual sanitizer.
vm.runInContext(fs.readFileSync('js/storage/save-sanitize.js','utf8'),c);
run(`var roundtrip=JSON.parse(JSON.stringify({stash:[{...dup('persist'),favorite:true,overflow:true}],lootManagement:{enabled:true,autoFuse:false}}));saveSanitize(roundtrip,{});`);
check(`roundtrip.stash[0].favorite===true && roundtrip.stash[0].overflow===true && roundtrip.lootManagement.autoFuse===false`);
console.log('PASS auto inventory: '+count+' domain assertions');
