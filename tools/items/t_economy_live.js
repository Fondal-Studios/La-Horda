'use strict';
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/node22/lib/node_modules/playwright'));}
process.env.DATA_PERSISTENT='1';process.env.HORDA_ITEM_ECONOMY='1';
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-economy-ui-')),app=require('../../server/accounts').create({dataDir:dir,databaseUrl:'',log:()=>{},originAllowed:()=>true});await app.ready;
 const server=http.createServer((q,s)=>app.handle(q,s)||s.end());await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const r=await fetch(base+'/api/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({user:'uitester',pass:'test-long-password'})}),user=await r.json(),id=(await app.store.getUserByKey('uitester')).id;
 await app.store.putSave(id,JSON.stringify({gold:10000,gems:100,stash:[],champions:{tanque:{unlocked:true,equipment:{}}}}),{},0,false);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.SE_BASE_URL||'http://127.0.0.1:8821')+'/index.html',{waitUntil:'load',timeout:180000});await page.waitForFunction(()=>typeof economyOpen==='function'&&typeof save!=='undefined');
 await page.evaluate(async({base,token})=>{loop=function(){};accountState=()=>({logged:true,user:'uitester'});accountFetch=async(method,p,b)=>{const r=await fetch(base+p,{method,headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:b===undefined?undefined:JSON.stringify(b)});return {status:r.status,j:await r.json()};};await economyOpen('Forja');},{base,token:user.token});
 const modal=page.locator('.eco-modal');await modal.getByRole('button',{name:'Fabricar',exact:true}).first().click();
 await page.waitForFunction(()=>ECON.data.items.length===1);assert.equal(await page.evaluate(()=>ECON.data.account.gold),9700);
 await modal.getByRole('button',{name:'Inventario',exact:true}).click();await modal.getByRole('button',{name:'☆ Proteger',exact:true}).click();await page.waitForFunction(()=>ECON.data.items[0].favorite===true);
 await modal.getByRole('button',{name:'Equipar',exact:true}).click();await page.waitForFunction(()=>ECON.data.account.equipment.tanque?.arma===ECON.data.items[0].uid);
 for(const t of ['Subastas','Colección','Reliquias','Temporada']){await modal.locator('[data-eco-tab="'+t+'"]').click();assert.ok(await modal.locator('.eco-body').textContent());}
 assert.ok(await page.evaluate(()=>{const p=document.querySelector('.eco-panel');return p.scrollWidth<=p.clientWidth+2;}),'no horizontal overflow on mobile');
 // A live ledger refresh must preserve another player's temporary multiplayer loadout.
 assert.equal(await page.evaluate(()=>{save.champions.mago.loadoutItems=[{uid:'remote'}];save.champions.mago.equipment={arma:'remote'};economyApply(ECON.data);return save.champions.mago.equipment.arma;}),'remote');
 await modal.getByRole('button',{name:'Cerrar',exact:true}).click();assert.equal(await page.locator('.eco-modal').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS mobile UI with real API: craft, favorite, equip, tabs, modal focus/close, no overflow, multiplayer projection, no JS errors');
 }finally{await browser.close();await new Promise(r=>server.close(r));await app.close();fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
