'use strict';
const assert=require('node:assert/strict');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/node22/lib/node_modules/playwright'));}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__campaignMode=true;});
  await page.goto((process.env.SE_BASE_URL||'http://127.0.0.1:8821')+'/index.html',{waitUntil:'load',timeout:180000});
  await page.waitForFunction(()=>typeof makeItem==='function'&&typeof save!=='undefined',{},{timeout:180000});
  const results=await page.evaluate(()=>{
   loop=function(){};let tests=[];const check=(name,pass)=>{if(!pass)throw Error(name);tests.push(name);};
   const reset=()=>{save.stash=[];save.lootManagement={enabled:true,autoFuse:true,recycleDuplicates:true};for(const c of Object.values(save.champions))c.equipment=mkEquipment();};
   reset();
   const seed=makeItem('arma','comun',null,{noAffixes:true});
   const duplicate=uid=>({...JSON.parse(JSON.stringify(seed)),uid});
   const a=duplicate('a');save.stash.push(a);a.favorite=true;
   check('favorite cannot be discarded',discardItem(null,'a')===null);
   check('favorite cannot be sold',sellItem(null,'a')===null);
   check('favorite cannot recycle',!recyclable(a));
   a.favorite=false;
   check('repeated UID rejected',!fuseItems(null,['a','a','a']).ok && save.stash.length===1);
   addItemToInventory(null,duplicate('b'));addItemToInventory(null,duplicate('c'));
   check('exact duplicates auto-fused',save.stash.length===1 && save.stash[0].rarity==='raro');
   reset();save.stash.push(duplicate('a'),duplicate('b'));const different=duplicate('c');different.roll+=0.01;addItemToInventory(null,different);
   check('different roll preserved',save.stash.length===3);
   reset();save.stash.push(duplicate('a'),duplicate('b'));save.stash[0].favorite=true;addItemToInventory(null,duplicate('c'));
   check('favorite excluded from auto-fusion',save.stash.length===3);
   reset();save.stash.push(duplicate('a'),duplicate('b'));save.champions.tanque.equipment.arma='a';addItemToInventory(null,duplicate('c'));
   check('equipped item excluded',save.stash.length===3);
   reset();save.stash.push(duplicate('a'),duplicate('b'));save.stash[0].set='lucifer';addItemToInventory(null,duplicate('c'));
   check('set piece excluded',save.stash.length===3);
   reset();save.lootManagement.autoFuse=false;
   for(let i=0;i<INVENTORY_CAPACITY;i++){const it=duplicate('full_'+i);it.favorite=true;save.stash.push(it);}
   const valuable=makeItem('arma','mitico',null,{noAffixes:true});const room=stashMakeRoomFor(valuable);
   check('full bag reserves valuable loot',room.ok && room.overflow);
   addItemToInventory(null,valuable);
   check('reserve does not consume conventional slots',stashUsedSlots()===INVENTORY_CAPACITY && save.stash.length===INVENTORY_CAPACITY+1);
   check('reserve can be equipped',equipItem('tanque',valuable.uid));
   save.lootManagement.enabled=false;
   check('management can be disabled',!stashMakeRoomFor(makeItem('casco','raro',null,{noAffixes:true})).ok);
   save.lootManagement.enabled=true;persistNow();
   openMyInventory('objetos');
   check('settings rendered',document.querySelectorAll('[data-loot-setting]').length===3);
   check('favorites rendered',document.querySelectorAll('[data-inv-favorite]').length>0);
   return tests;
  });
  await page.reload({waitUntil:'load',timeout:180000});
  const persisted=await page.evaluate(()=>({fav:save.stash.some(it=>it.favorite),overflow:save.stash.some(it=>it.overflow),auto:save.lootManagement?.autoFuse}));
  assert.equal(persisted.fav,true);assert.equal(persisted.overflow,true);assert.equal(persisted.auto,false);
  assert.deepEqual(errors,[]);
  for(const name of results)console.log('PASS '+name);
  console.log('PASS browser reload preserves favorites, reserve and preferences');
  console.log('PASS no browser JS errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
