'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ids=['solciju','brakk','veyra','morveth','aelith'];
const source=fs.readFileSync(path.join(__dirname,'../../js/champions/quality-five/register.js'),'utf8');
function load(champions){
 const c={save:{champions},mkChampion:unlocked=>({unlocked,level:1,xp:0}),CHAMPION_PRICE_GOLD:12000,CHAMPION_CATALOG:[]};
 for(const name of ['CLASSES','PORTADORES','CLASS_WEAPON_LABEL','SCORE_CONFIG','CHAMP_ITEM_AFFINITY','PAL','GRIDS','ANIM_PROFILES','CHAMP_IDENTITY','CODEX_CHAMP_LORE','HERO_VOICES','CODEX_SKILL_FX','TALENT_TREES'])c[name]={mago:{},guerrero:{},tanque:{}};
 for(const k of ids)c[k.toUpperCase()+'_KIT']=[{},{},{},{}];
 vm.createContext(c);vm.runInContext(source,c);return c;
}
test('registering existing champions preserves ownership, XP, inventory and irreversible mastery',()=>{
 const champions=Object.fromEntries(ids.map((k,i)=>[k,{unlocked:true,level:[40,60,90,99,39][i],xp:123,inventory:[{uid:k+'-item'}],talents:{mastery:k+'_0',masteryNodes:{chosen:1}},croma:k+'_alt1'}]));
 const before=JSON.stringify(champions),refs={...champions};load(champions);
 assert.equal(JSON.stringify(champions),before);
 for(const k of ids)assert.equal(champions[k],refs[k]);
});
test('missing champions start locked at level one, without altering another champion',()=>{
 const old={unlocked:true,level:99};const c=load({tanque:old});
 assert.equal(c.save.champions.tanque,old);
 for(const k of ids){assert.deepEqual(c.save.champions[k],{unlocked:false,level:1,xp:0});assert.equal(c.CHAMPION_CATALOG.filter(x=>x.id===k).length,1);}
});
