'use strict';
// Pase de batalla de punta a punta: servidor REAL (cuentas+wallet+economía+pase) y la pantalla REAL en Chromium.
// NODE_PATH=server/node_modules:$(npm root -g) node tools/ux/test-battlepass-ui.js
process.env.DATA_PERSISTENT='1';process.env.HORDA_ITEM_ECONOMY='1';
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),http=require('http'),assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-bpui-'));
 const {create}=require('../../server/accounts'),BP=require('../../server/battlepass');
 const app=create({dataDir:dir,databaseUrl:'',adminUsers:'',log:()=>{},originAllowed:()=>true});await app.ready;
 const server=http.createServer((req,res)=>{if(app.handle(req,res))return;const p=path.join(ROOT,decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':TYPES[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const request=async(m,u,b,t)=>{const r=await fetch(base+u,{method:m,headers:{'content-type':'application/json',...(t?{authorization:'Bearer '+t}:{})},body:b===undefined?undefined:JSON.stringify(b)});let j=null;try{j=await r.json();}catch(e){}return {status:r.status,j};};
 const reg=await request('POST','/api/register',{user:'Pasero',pass:'player-password'});assert.equal(reg.status,201);const token=reg.j.token;
 await request('PUT','/api/save',{data:{gold:500,champions:{tanque:{unlocked:true,level:3}},arenasCleared:{},stash:[],cromas:{},cosmeticUnlocks:{},firstRun:null,starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true,campaignResetV3:true,testStageV1:true},baseVersion:0},token);
 const uid=(await app.store.getUserByKey('pasero')).id;
 await request('GET','/api/economy',undefined,token);                       // crea la cuenta de economía
 await app.store.gmUpdate(async raw=>{const r=BP.root(raw);BP.acct(r,String(uid),Date.now()).xp=6500;return {state:r,value:null};});   // nivel 6 (solo test)
 await app.store.walletApply({userId:uid,delta:2000,reason:'purchase:test',ref:'t-credit',actor:null,at:Date.now()});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
 async function open(logged,w,h){
  const ctx=await browser.newContext({viewport:{width:w,height:h}});
  if(logged)await ctx.addInitScript(([b,t])=>{try{localStorage.setItem('horda_account:'+encodeURIComponent(b),JSON.stringify({token:t,user:'Pasero',name:'Pasero',expiresAt:Date.now()+86400000,apiBase:b}));}catch(e){}},[base,token]);
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/index.html?lazy=0&api='+encodeURIComponent(base));
  await page.waitForFunction(()=>typeof bpOpen==='function'&&typeof renderMainMenu==='function'&&typeof assetsAllReady==='function'&&assetsAllReady());
  if(logged)await page.waitForFunction(()=>acct.lastPull&&!acct.pulling&&!acct.applying,null,{timeout:30000});
  return {page,ctx,errors};
 }
 const goldOf=async()=>(await request('GET','/api/economy',undefined,token)).j.account.gold, brasasOf=async()=>(await app.store.walletGet(uid)).premium;
 // sin sesión: pide iniciar sesión
 {const {page,ctx,errors}=await open(false,844,390);await page.evaluate(()=>bpOpen());await page.waitForSelector('.bp-msg');
  ok(/Iniciá sesión/.test(await page.locator('.bp-panel').innerText()),'sin sesión pide iniciar sesión');ok(errors.length===0,errors.join());await ctx.close();}
 for(const [w,h] of [[844,390],[568,320]]){
  const {page,ctx,errors}=await open(true,w,h);
  ok(await page.evaluate(()=>!!document.getElementById('hub-pass-btn')),'existe el botón del pase en el hub');
  await page.evaluate(()=>{setState('mainmenu');renderMainMenu();bpOpen();});
  await page.waitForSelector('.bp-row .bp-claim');
  const t=await page.locator('.bp-panel').innerText();
  ok(/Temporada 1/.test(t)&&/Nivel\s*6\/30/.test(t),'muestra temporada y nivel: '+t.slice(0,120));
  ok(await page.locator('.bp-track .bp-row:not(.bp-hd)').count()===30,'30 niveles');
  const fit=await page.evaluate(()=>{const p=document.querySelector('.bp-panel').getBoundingClientRect();return {l:p.left,r:p.right,b:p.bottom,t:p.top,w:innerWidth,h:innerHeight,sw:document.querySelector('.bp-panel').scrollWidth,cw:document.querySelector('.bp-panel').clientWidth};});
  ok(fit.l>=0&&fit.r<=fit.w+.5&&fit.b<=fit.h+.5&&fit.sw<=fit.cw+1,'el panel entra en '+w+'x'+h+' '+JSON.stringify(fit));
  if(w===844){
   // doble clic en Reclamar nivel 1 (gratis): el oro entra UNA vez
   const g0=await goldOf();
   const btn=page.locator('[data-key="free:1"] .bp-claim');await btn.dblclick();
   await page.waitForSelector('[data-key="free:1"].bp-done');
   const g1=await goldOf();ok(g1===g0+300,'oro +300 una sola vez ('+g0+'→'+g1+')');
   // premium sin ruta: no hay botón de reclamar
   ok(await page.locator('[data-key="premium:5"] .bp-claim').count()===0,'premium bloqueado sin ruta');
   // comprar premium (confirmación aceptada)
   await page.evaluate(()=>{window.gameConfirm=async()=>true;});
   const b0=await brasasOf();await page.locator('.bp-buy').click();await page.waitForSelector('.bp-tag.bp-on');
   ok((await brasasOf())===b0-BP.PASS_PRICE_BRASAS,'cargo único de Brasas por el premium');
   // reclamar premium nivel 5 (Brasas) con doble clic: una sola entrega
   const b1=await brasasOf();await page.locator('[data-key="premium:5"] .bp-claim').dblclick();await page.waitForSelector('[data-key="premium:5"].bp-done');
   ok((await brasasOf())===b1+30,'Brasas del pase entregadas una sola vez');
   if(process.env.BP_SHOT)await page.screenshot({path:process.env.BP_SHOT});
   const txt=await page.locator('.bp-panel').innerText();ok(/arte pendiente/.test(txt),'los cosméticos sin arte se rotulan «arte pendiente»');
  }
  ok(errors.length===0,errors.join());await ctx.close();
 }
 await browser.close();await new Promise(r=>server.close(r));await app.close();fs.rmSync(dir,{recursive:true,force:true});
 console.log(`PASS battlepass UI: ${checks} comprobaciones (servidor real + Chromium, 844x390 y 568x320)`);
})().catch(e=>{console.error(e);process.exit(1);});
