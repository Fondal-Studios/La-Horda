'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({console,Math,Date,performance,structuredClone,setTimeout,clearTimeout});
const ev=s=>vm.runInContext(s,c);
const load=p=>vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:p});
ev(`var writes=[],disk=null,failWrite=false,cloud=0;
var window={addEventListener(){}},document={addEventListener(){},getElementById(){return {addEventListener(){}}}};
var localStorage={setItem(k,v){if(failWrite)throw Error('quota');disk=v;writes.push(JSON.parse(v));},getItem(){return disk;}};
var CHAMPION_CATALOG=[{id:'mago',unlockedByDefault:true}],state='victory';
function accountOnPersist(){cloud++;}
`);
load('js/storage/save.js');
ev(`saveLoadStarted=true;saveLoadFailed=false;`);
load('js/systems/hero-stats.js');load('js/systems/potions.js');
ev(`var h={hp:100,maxHp:100,itemMaxShield:100,itemShield:0,shield:0};`);
assert.equal(ev('heroVitals(h).hpPct'),100);assert.equal(ev('potionUseful(h,{type:"heal"})'),false);
ev('h.hp=50;h.shield=500');assert.equal(ev('heroVitals(h).hpPct'),50);assert.equal(ev('potionUseful(h,{type:"heal"})'),true);
ev('h.maxHp=200');assert.equal(ev('heroVitals(h).hpPct'),25);
ev('h.hp=0;h.alive=false');assert.equal(ev('heroVitals(h).hpPct'),0);
ev('h.hp=80;h.alive=true');assert.equal(ev('heroVitals(h).hpPct'),40);
ev('h.maxHp=0');assert.equal(ev('heroVitals(h).hpPct'),0);
console.log('PASS HP, shields, healing eligibility, max-HP changes, death/revive');
load('js/systems/items.js');load('js/systems/loot.js');load('js/ui/end-screens.js');
// Full production grant function, controlled loot generator and external gameplay services.
ev(`var INVENTORY_CAPACITY=1,currentArena='bosque',runLevel=10,subjefesDefeated=0,kills=12;
var CLASSES={mago:{name:'Mago',icon:'M',color:'#fff'}};
var player={classKey:'mago',stats:{}},heroes=[player],groundLoot=[],rolls=0,quests=0;
var LOOT_VICTORY_FLOOR='raro';
function computePerformance(){return {score:50,grade:'A'};}
function ownedDesignIds(){return new Set();}
function firstWinLootDue(){return false;}
function rollLoot(){rolls++;return {items:[{tier:'raro'},{tier:'mitico'}],pity:{},grade:'A'};}
function materializeLoot(s){return {uid:'reward-'+rolls+'-'+s.tier,type:'arma',rarity:s.tier};}
function grantRunGems(){save.gems+=2;return 2;}
function victoryXpFor(){return 10;}
function grantXP(k,n){save.champions[k].xp+=n;persist();}
function grantGold(n){save.gold+=n;persist();}
function arenaHas(){return false;}
function groundLootCollectAll(){return [];}
function questsOnRunEnd(){quests++;}
save.stash=[{uid:'old',type:'arma',rarity:'mitico'}];
victoryBeginRun('run-a');writes=[];
var result=buildVictoryData();`);
assert.equal(ev('save.stash.length'),3);assert.equal(ev('save.gold'),80);assert.equal(ev('save.champions.mago.xp'),10);assert.equal(ev('save.gems'),2);
assert.equal(ev('writes.length'),1);assert.equal(ev('writes[0].lastVictoryReward.data.rewards.length'),2);
ev('buildVictoryData();buildVictoryData()');assert.equal(ev('rolls'),1);assert.equal(ev('save.stash.length'),3);assert.equal(ev('quests'),1);
console.log('PASS full inventory: all earned items; one atomic write includes receipt, gold, XP, gems');
// Reload of persisted save and same remote run identity cannot reroll or repay.
ev('save=JSON.parse(disk);victoryBeginRun("run-a");buildVictoryData()');assert.equal(ev('rolls'),1);assert.equal(ev('save.gold'),80);
console.log('PASS duplicate close and reload/reconnect identity: no duplicate rewards');
// Storage failure: no false cloud notification, same in-memory roll retained for retry.
ev('victoryBeginRun("run-b");failWrite=true;var priorCloud=cloud;buildVictoryData()');
assert.equal(ev('saveLastWriteOK'),false);assert.equal(ev('cloud===priorCloud'),true);assert.equal(ev('JSON.parse(disk).gold'),80);
ev('buildVictoryData()');assert.equal(ev('rolls'),2);
ev('failWrite=false;buildVictoryData()');assert.equal(ev('saveLastWriteOK'),true);assert.equal(ev('JSON.parse(disk).gold'),160);assert.equal(ev('rolls'),2);
console.log('PASS failed storage and retry: no reroll, no partial disk state, no false cloud success');
// Generation error after the gold mutation rolls back save and releases the write barrier.
ev('victoryBeginRun("run-c");var previous=JSON.stringify(save);rollLoot=function(){throw Error("generator");}');
assert.throws(()=>ev('buildVictoryData()'),/generator/);assert.equal(ev('JSON.stringify(save)===previous'),true);assert.equal(ev('_persistBatchDepth'),0);
console.log('PASS generation failure rolls back progression and releases batch guard');
// Actual potion update: restores HP, leaves shield untouched, does not consume when HP full.
ev(`var potions=[{x:0,y:0,type:'heal',life:10000,phase:0}],particles=[];
player={x:0,y:0,hp:50,maxHp:100,itemMaxShield:100,itemShield:0,alive:true};heroes=[player];
function arenaRuleHealMult(){return 1;}function floatText(){}function playSfx(){}
updatePotions(16);`);
assert.equal(ev('player.hp'),78);assert.equal(ev('player.itemShield'),0);assert.equal(ev('potions.length'),0);
ev('player.hp=100;potions=[{x:0,y:0,type:"heal",life:10000,phase:0}];updatePotions(16)');assert.equal(ev('potions.length'),1);
console.log('PASS actual potion update heals HP only and preserves unused potions');
