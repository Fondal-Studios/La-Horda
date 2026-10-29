'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
 try {
 for(const viewport of [{width:844,height:390},{width:667,height:375}]){
 const p=await b.newPage({viewport});
 await p.goto(process.env.LH_URL||'http://127.0.0.1:8750',{waitUntil:'load'});
 await p.waitForFunction(()=>typeof lanesOwnedRoster==='function' && typeof CLASSES!=='undefined');
 const result=await p.evaluate(()=>{
  save=defaultSave();for(const c of Object.values(save.champions))c.unlocked=false;
  save.champions.axiom.unlocked=true;save.champions.axiom.level=42;save.champions.axiom.croma='axiom_piedra';
  save.champions.axiom.cosmeticSkin='';save.starterChosen=true;save.tut={training:1};selectedClass='axiom';
  CrystalWarsUI.open({mode:'crystal'});
  return {options:[...document.getElementById('champ').options].map(o=>o.value),selected:document.getElementById('champ').value};
 });
 assert.deepEqual(result,{options:['axiom'],selected:'axiom'});
 const match=await p.evaluate(()=>{
  CrystalWarsUI.close();const before=JSON.stringify(save);
  const rejected=lanesStart({champ:'tanque'});
  const ok=lanesStart({champ:'axiom',training:true});
  const out={rejected,ok,champ:player.classKey,croma:save.champions.axiom.croma,locked:save.champions.tanque.unlocked,heroes:heroes.length};
  lanesStop();out.restored=JSON.stringify(save)===before;return out;
 });
 assert.equal(match.rejected,false);assert.equal(match.ok,true);assert.equal(match.champ,'axiom');assert.equal(match.croma,'axiom_piedra');assert.equal(match.locked,false);assert.equal(match.heroes,10);assert.equal(match.restored,true);
 const col=await p.evaluate(()=>{const ok=colStart({champ:'axiom',training:true});const out={ok,champ:player.classKey,croma:save.champions.axiom.croma,heroes:heroes.length};lanesStop();return out});
 assert.deepEqual(col,{ok:true,champ:'axiom',croma:'axiom_piedra',heroes:8});
 const guest=await p.evaluate(()=>{
  lanesBegin('host');
  const previous=netMatch;
  netMatch={slots:[{kind:'human',slot:1,champ:'axiom'}],loadouts:{1:{champ:'axiom',level:42,croma:'axiom_piedra',cosmeticSkin:''}}};
  netApplyGuestLoadouts();
  const out={croma:save.champions.axiom.croma,original:save.champions.axiom.cosmeticSkin,level:save.champions.axiom.level};
  netRestoreBackups();netMatch=previous;lanesStop();return out;
 });
 assert.deepEqual(guest,{croma:'axiom_piedra',original:'',level:3});
 const filter=await p.evaluate(()=>{
  const body=document.createElement('div');
  body.innerHTML=['skin','set','set-croma','croma'].map(k=>'<div data-appearance-kind="'+k+'"></div>').join('');
  codexAppearanceFilter='skin';codexApplyAppearanceFilter(body);
  return [...body.children].filter(e=>!e.hidden).map(e=>e.dataset.appearanceKind);
 });
 assert.deepEqual(filter,['skin']);
 console.log(viewport.width+': owned lobby, rejection, Cristales, Coliseo, skin, restore, guest cosmetic and skin filter PASS');
 await p.close();
 }
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
