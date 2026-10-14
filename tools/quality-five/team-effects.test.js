'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('js/champions/quality-five/fx.js','utf8');
test('delayed targets exclude own team and retain hostile and neutral creatures',()=>{
 const own={team:0,alive:true,x:1},rival={team:1,alive:true,x:2},neutral={team:2,alive:true,x:3};
 const c={portadorEnemies:()=>[own,rival,neutral],distance:(h,e)=>e.x,heroes:[]};vm.createContext(c);vm.runInContext(source,c);
 assert.deepEqual(Array.from(c.qualityFiveTargets({team:0},()=>true)),[rival,neutral]);
 assert.deepEqual(Array.from(c.qualityFiveTargets({team:1},()=>true)),[own,neutral]);
 assert.equal(c.qualityFiveTargets({},()=>true).length,3);
});
test('Solciju owner slot survives temporary cast-team filtering',()=>{
 const a={},b={_qualityFiveSlot:5},c={heroes:[a,b]};vm.createContext(c);vm.runInContext(source,c);
 assert.equal(c.qualityFiveSlot(b),5);c.heroes=[b];assert.equal(c.qualityFiveSlot(b),5);
 c.heroes=[a,b];assert.equal(c.qualityFiveSlot(a),0);
});
test('bots can make their first shop purchase before leaving spawn, then respect cooldown',()=>{
 const purchases=[],c={LN:{t:16},lanesAtShop:()=>true,LANES_ITEMS:Object.fromEntries(['atk','speed','hp','regen','siege'].map(id=>[id,{field:id,costs:[350,700,1100]}])),lanesBuy:(team,key,h)=>{purchases.push(key);h.gold-=350;}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('js/arenas/lanes/lanes-levels.js','utf8'),c);
 const h={gold:500,team:0};c.lanesBotShop(h);assert.equal(purchases.length,1);h.gold=500;c.lanesBotShop(h);assert.equal(purchases.length,1);c.LN.t=2017;c.lanesBotShop(h);assert.equal(purchases.length,2);
});
