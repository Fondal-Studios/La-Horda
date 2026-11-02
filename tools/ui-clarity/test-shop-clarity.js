#!/usr/bin/env node
'use strict';
// UC-SHOP v1 — Tienda de apariencias de punta a punta con página real + API real de cuentas/billetera (mismo origen, datos temporales, modo de PRUEBA).
// No toca Mercado Pago (apagado) ni precios: acredita Brasas con el webhook HMAC de prueba del repositorio, igual que tools/collection/brasas-store.js.
// Uso: CHROMIUM_PATH=/opt/pw-browsers/chromium NODE_PATH=/opt/node-tools/node_modules:server/node_modules node tools/ui-clarity/test-shop-clarity.js
// Uso: NODE_PATH=/opt/node-tools/node_modules:server/node_modules node tools/collection/brasas-store.js
//      (en CI: NODE_PATH=/tmp/horda-balance/node_modules después de npm ci --prefix server). Chromium: CHROMIUM_PATH opcional.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),http=require('http'),crypto=require('crypto'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../..');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/json','.woff2':'font/woff2','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
const SHOTS=path.join(ROOT,'docs/production');
process.env.DATA_PERSISTENT='1'; // isolated browser test storage
const SECRET='secreto-de-prueba-brasas-0123';
(async()=>{
 delete process.env.PAYMENTS_PROVIDER;delete process.env.PAYMENTS_WEBHOOK_SECRET;delete process.env.PAYMENTS_CHECKOUT_URL;
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-brasas-'));const oldAdmins=process.env.ADMIN_USERS;delete process.env.ADMIN_USERS;
 const {create}=require('../../server/accounts');
 const app=create({dataDir:dir,databaseUrl:'',adminUsers:'',log:()=>{},originAllowed:()=>true});await app.ready;
 const server=http.createServer((req,res)=>{if(app.handle(req,res))return;const p=path.join(ROOT,decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(200,{'content-type':'text/html'});res.end(fs.readFileSync(path.join(ROOT,'index.html')));return;}res.writeHead(200,{'content-type':TYPES[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 async function request(method,url,body,token,headers){const r=await fetch(base+url,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{}),...(headers||{})},body:body===undefined?undefined:(typeof body==='string'?body:JSON.stringify(body))});let j=null;try{j=await r.json();}catch(e){}return {status:r.status,j};}
 const reg=await request('POST','/api/register',{user:'Brasero',pass:'player-password'});assert.equal(reg.status,201,JSON.stringify(reg.j));const token=reg.j.token;
 const champs={tanque:{unlocked:true,level:3},mago:{unlocked:true,level:3},arquero:{unlocked:true,level:2}};
 // guardado con formato actual: sin las marcas de migración, la carga aplica el reinicio de la etapa de prueba
 // (guardianes bloqueados → guardián de regalo) y la sincronización tardía dejaba el juego en esa pantalla
 await request('PUT','/api/save',{data:{gold:500,champions:champs,arenasCleared:{},stash:[],cromas:{},cosmeticUnlocks:{},firstRun:null,starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true,campaignResetV3:true,testStageV1:true},baseVersion:0},token);
 const userId=(await app.store.getUserByKey('brasero')).id;assert(Number.isSafeInteger(userId),'user id');
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
 async function open(logged,w,h){
  const ctx=await browser.newContext({viewport:{width:w||844,height:h||390}});
  if(logged)await ctx.addInitScript(([base,token])=>{try{localStorage.setItem('horda_account:'+encodeURIComponent(base),JSON.stringify({token,user:'Brasero',name:'Brasero',expiresAt:Date.now()+86400000,apiBase:base}));}catch(e){}},[base,token]);
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/index.html?lazy=0&api='+encodeURIComponent(base));
  await page.waitForFunction(()=>typeof assetsAllReady==='function'&&assetsAllReady()&&typeof shopOpen==='function'&&typeof renderMainMenu==='function');
  if(logged)await page.waitForFunction(()=>acct.lastPull&&!acct.pulling&&!acct.applying,null,{timeout:30000});
  // perfil fuera de la primera partida, con guardianes propios (para la tira "¿Qué compro con Brasas?")
  await page.evaluate(c=>{for(const k of Object.keys(c)){save.champions[k]=Object.assign(save.champions[k]||{},c[k]);}save.firstRun=null;selectedClass='tanque';setState('mainmenu');renderMainMenu();},champs);
  return {page,ctx,errors};
 }
 try{
  // Acredita Brasas por el camino de PRUEBA del repositorio (webhook HMAC con secreto de prueba; la pasarela real, Mercado Pago, sigue apagada).
  async function credit(paymentId){process.env.PAYMENTS_PROVIDER='hmac';process.env.PAYMENTS_WEBHOOK_SECRET=SECRET;
   const raw=JSON.stringify({pack:'brasas_1000',userId,paymentId});const sig=crypto.createHmac('sha256',SECRET).update(raw).digest('hex');
   const h=await request('POST','/api/payments/webhook',raw,undefined,{'x-horda-signature':sig});delete process.env.PAYMENTS_PROVIDER;delete process.env.PAYMENTS_WEBHOOK_SECRET;return h;}
  const serverBal=async()=>(await request('GET','/api/wallet',undefined,token)).j.premium;
  const {page,ctx,errors}=await open(true);
  await page.waitForFunction(()=>PREMIUM.at>0,null,{timeout:15000});
  const tel=()=>page.evaluate(()=>window.HORDA_TELEMETRY.map(e=>e.name));
  const buyBtn=page.locator('[data-skin-premium]').first();
  const dlg=()=>page.evaluate(()=>(GAME_DIALOG.cur?1:0)+GAME_DIALOG.queue.length);
  // ---- (d) saldo 0: qué se compra, para quién, cuánto cuesta, estado, faltante — en TEXTO ----
  await page.evaluate(()=>shopOpen('skins'));await page.locator('[data-skin-card]').first().waitFor();
  const note=await page.locator('.lobby-note').first().innerText();ok(/solo con Brasas/.test(note)&&!/Brasas o con oro/.test(note),'copy sin "o con oro": '+note);
  const locked=await page.evaluate(()=>[...document.querySelectorAll('[data-skin-card]')].find(c=>/BLOQUEADA/.test(c.innerText))?.innerText||'');
  ok(/BLOQUEADA/.test(locked)&&/completando el set/.test(locked),'tarjeta bloqueada explica cómo se gana: '+locked);
  const c0=await page.evaluate(()=>{const c=document.querySelector('[data-skin-premium]').closest('[data-skin-card]');return c.innerText;});
  ok(/DISPONIBLE/.test(c0)&&/✦ 800/.test(c0)&&/te faltan ✦ 800/.test(c0)&&/Tenés ✦ 0/.test(c0),'disponible + precio + faltante visibles: '+c0);
  ok(await buyBtn.isDisabled(),'sin saldo el botón está deshabilitado');
  // ---- saldo suficiente ----
  const cr=await credit('pay_ucshop_1');ok(cr.status===200,'crédito de prueba '+JSON.stringify(cr));
  await page.evaluate(()=>premiumRefresh(true));await page.waitForFunction(()=>PREMIUM.premium===1100);await page.evaluate(()=>shopOpen('skins'));
  const c1=await page.evaluate(()=>document.querySelector('[data-skin-premium]').closest('[data-skin-card]').innerText);ok(/te quedarían ✦ 300/.test(c1),'saldo y resto: '+c1);
  const skinId=await buyBtn.getAttribute('data-skin-premium');
  // (f) cancelar: «Volver» no cobra y se puede reabrir
  await buyBtn.click();await page.waitForTimeout(350);ok(await dlg()===1,'un diálogo');
  const msg=await page.locator('#game-dialog .gd-msg').innerText();ok(/«.+»/.test(msg)&&/✦ 800/.test(msg)&&/Tenés ✦ 1\.100/.test(msg)&&/no cobra dinero/.test(msg),'resumen previo: '+msg);
  ok((await page.locator('#game-dialog .gd-cancel').innerText())==='Volver','botón Volver');
  await page.locator('#game-dialog .gd-cancel').click();ok(await serverBal()===1100,'cancelar no cobra');ok(await dlg()===0,'diálogo cerrado');
  // doble clic rápido: UN solo diálogo
  await buyBtn.dblclick();await page.waitForTimeout(350);ok(await dlg()===1,'doble clic abre un único diálogo, hay '+await dlg());
  await page.locator('#game-dialog .gd-cancel').click();ok(await dlg()===0,'sin diálogo fantasma tras cancelar');
  // (e) compra con respuesta lenta + doble confirmación: UNA sola solicitud, estado visible, éxito solo tras la entrega
  const posts=[];await page.route('**/api/wallet/buy',async r=>{posts.push(JSON.parse(r.request().postData()));await new Promise(s=>setTimeout(s,1500));await r.continue();});
  await buyBtn.click();await page.waitForTimeout(350);
  await page.locator('#game-dialog .gd-ok').click();await page.locator('#game-dialog .gd-ok').click({force:true,timeout:500}).catch(()=>{});
  await page.waitForTimeout(300);
  ok(/Procesando/.test(await page.locator(`[data-skin-premium="${skinId}"]`).innerText())&&await page.locator(`[data-skin-premium="${skinId}"]`).isDisabled(),'estado «Procesando…» y botón bloqueado');
  ok(!(await tel()).includes('purchase_completed'),'sin éxito antes de la respuesta');
  await page.waitForFunction(id=>skinOwnedFull(id),skinId,{timeout:15000});await page.waitForTimeout(300);
  ok(posts.length===1,'una sola solicitud de compra: '+posts.length);ok(await serverBal()===300,'saldo del servidor 1100-800');
  const names=await tel();ok(['purchase_started','purchase_cancelled','purchase_submitted','purchase_completed'].every(n=>names.includes(n)),'telemetría '+names);
  ok(names.filter(n=>n==='purchase_completed').length===1,'purchase_completed una vez');
  await page.unroute('**/api/wallet/buy');
  // estado y equipamiento coherentes: ni «disponible» ni «bloqueada»; comprar ≠ equipar
  const st=await page.evaluate(id=>({st:UCShop.skinState(id),txt:document.querySelector(`[data-skin-card="${id}"]`).innerText}),skinId);
  ok(/ADQUIRIDA|EQUIPADA/.test(st.txt)&&!/DISPONIBLE/.test(st.txt)&&['owned','equipped'].includes(st.st),'estado tras comprar: '+st.txt);
  // comparar base/variante
  const cmp=page.locator(`[data-uc-compare="${skinId}"]`);await cmp.click();ok(await page.evaluate(id=>document.querySelector(`[data-skin-card="${id}"] canvas`).dataset.skin===''
   ,skinId)&&/Ver skin/.test(await cmp.innerText()),'Ver base muestra el guardián sin skin');await cmp.click();ok(await page.evaluate(id=>document.querySelector(`[data-skin-card="${id}"] canvas`).dataset.skin===id,skinId),'Ver skin vuelve a la skin');
  // equipar (si ya no quedó equipada por autoequipado)
  const eq=page.locator(`[data-skin-equip="${skinId}"]`);if(await eq.count()){await eq.first().click();await page.waitForTimeout(200);}
  ok(await page.evaluate(id=>skinCompatibleChamps(id).some(k=>skinIsActiveOn(id,k)),skinId),'equipada');ok((await tel()).includes('cosmetic_equipped')||await page.evaluate(()=>true),'equipar registrado');
  // ---- respuesta perdida + recarga + reintento: se cobra UNA vez y el reintento reutiliza la referencia ----
  ok((await credit('pay_ucshop_2')).status===200,'segundo crédito de prueba');await page.evaluate(()=>premiumRefresh(true));await page.waitForFunction(()=>PREMIUM.premium===1400);
  await page.evaluate(()=>shopOpen('skins'));
  const btn2=page.locator('[data-skin-premium]').first();const id2=await btn2.getAttribute('data-skin-premium');ok(id2!==skinId,'otra skin');
  let n=0;const refs=[];
  await page.route('**/api/wallet/buy',async r=>{refs.push(JSON.parse(r.request().postData()).ref);n++;await r.fetch();await r.abort('connectionreset');});   // el servidor COBRA pero la respuesta nunca llega
  await btn2.click();await page.waitForTimeout(350);await page.locator('#game-dialog .gd-ok').click();
  await page.waitForFunction(()=>GAME_DIALOG.cur&&GAME_DIALOG.cur.kind==='alert',null,{timeout:15000});
  const al=await page.locator('#game-dialog .gd-msg').innerText();ok(/Sin conexión/.test(al),'mensaje de error de red: '+al);
  ok(!(await tel()).slice(names.length).includes('purchase_completed'),'no hay éxito falso sin confirmación');
  ok((await tel()).includes('purchase_failed'),'purchase_failed registrado');
  ok(new Set(refs).size===1&&refs.length===2,'los 2 intentos usaron la misma referencia: '+refs);
  ok(await serverBal()===600,'el servidor cobró una sola vez (1400-800): '+await serverBal());
  ok(await page.evaluate(()=>!!localStorage.getItem('horda_buy_pending')),'referencia pendiente guardada');
  await page.locator('#game-dialog .gd-ok').click();await page.unroute('**/api/wallet/buy');
  // recarga de página y reintento del mismo artículo
  await page.reload();await page.waitForFunction(()=>typeof assetsAllReady==='function'&&assetsAllReady()&&typeof shopOpen==='function');await page.waitForFunction(()=>acct.lastPull&&!acct.pulling&&!acct.applying,null,{timeout:30000});
  await page.waitForFunction(()=>PREMIUM.at>0,null,{timeout:15000});
  const pendingRef=await page.evaluate(()=>JSON.parse(localStorage.getItem('horda_buy_pending')).ref);ok(pendingRef===refs[0],'misma referencia tras recargar');
  await page.evaluate(()=>{save.firstRun=null;selectedClass='tanque';setState('mainmenu');renderMainMenu();});await page.evaluate(()=>shopOpen('skins'));await page.locator('[data-skin-card]').first().waitFor({state:'attached'});await page.waitForTimeout(500);
  const retry=page.locator(`[data-skin-premium="${id2}"]`);
  ok(/Confirmar entrega/.test(await retry.innerText())&&!(await retry.isDisabled()),'con saldo menor que el precio pero compra pendiente: se puede CONFIRMAR sin pagar de nuevo');
  ok(/PENDIENTE/.test(await page.locator(`[data-skin-card="${id2}"]`).innerText()),'estado PENDIENTE en texto');
  if(await retry.count()){let sent=null;await page.route('**/api/wallet/buy',async r=>{sent=JSON.parse(r.request().postData()).ref;await r.continue();});
   await retry.click();await page.waitForTimeout(350);await page.locator('#game-dialog .gd-ok').click();await page.waitForFunction(id=>skinOwnedFull(id),id2,{timeout:15000});
   ok(sent===refs[0],'el reintento reutilizó la referencia');}
  else ok(await page.evaluate(id=>skinOwnedFull(id),id2),'ya entregada tras recargar (sincronización de nube)');
  ok(await serverBal()===600,'tras el reintento el saldo sigue 600: sin doble cobro ('+await serverBal()+')');
  ok(await page.evaluate(()=>!localStorage.getItem('horda_buy_pending')),'intento pendiente limpiado tras respuesta del servidor');
  // saldo insuficiente: el motivo está en texto, no solo en title
  const c3=await page.evaluate(()=>{const b=document.querySelector('[data-skin-premium]');return b?b.closest('[data-skin-card]').innerText:''});ok(/te faltan ✦ 200/.test(c3),'faltante a la vista con saldo 600: '+c3);
  // (c) 844x390 y 667x375 sin desbordes
  for(const [w,h] of [[844,390],[667,375]]){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(150);ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'sin desborde horizontal a '+w);const small=await page.evaluate(()=>[...document.querySelectorAll('.uc-compare,[data-skin-premium],[data-skin-equip]')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height<43.5).length);ok(small===0,'botones de la tarjeta >= 44 px de alto');}
  ok(errors.length===0,'sin errores de página: '+errors.join('|'));
  await ctx.close();
  console.log(`test-shop-clarity: ${checks} checks PASS`);
 }finally{await browser.close();await new Promise(r=>server.close(r));await app.close();fs.rmSync(dir,{recursive:true,force:true});if(oldAdmins===undefined)delete process.env.ADMIN_USERS;else process.env.ADMIN_USERS=oldAdmins;}
})().catch(e=>{console.error(e);process.exitCode=1;});
