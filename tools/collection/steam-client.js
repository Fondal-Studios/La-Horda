// STEAM (cliente): con un contenedor de escritorio FALSO (window.HORDA_DESKTOP con steamTicket) y un Steam FALSO en el servidor real
// (server/steam.js con fetch inyectado). Cubre: «Entrar con Steam» en la pantalla de cuenta, compra de Brasas con el overlay
// (pedido -> sondeo -> acreditación), cuenta sin vincular (ofrece vincular), y retomar un pedido pendiente tras cerrar el juego.
// NO prueba Steam real ni Electron real (docs/steam/PRUEBAS_ELECTRON.md).
// Uso: NODE_PATH=/opt/node-tools/node_modules:server/node_modules node tools/collection/steam-client.js
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os'),http=require('http'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../..');
process.env.DATA_PERSISTENT='1';
process.env.PAYMENTS_PROVIDER='steam';process.env.STEAM_ENABLED='1';process.env.STEAM_APP_ID='480';
process.env.STEAM_PUBLISHER_KEY='ABCDEF0123456789ABCDEF0123456789';process.env.STEAM_MODE='sandbox';
const steam=require('../../server/steam');
const SID_A='76561197960265729',SID_B='76561197960265730';
const orders={},calls=[];
steam._setFetch(async(url,opts)=>{
 const u=new URL(url),body=opts&&opts.body?Object.fromEntries(new URLSearchParams(opts.body)):Object.fromEntries(u.searchParams);calls.push({path:u.pathname,body});
 const ok=response=>({ok:true,status:200,json:async()=>({response})});
 if(u.pathname.endsWith('/AuthenticateUserTicket/v1/')){const t=body.ticket||'';const sid=t.startsWith('aa')?SID_A:t.startsWith('bb')?SID_B:null;return sid?ok({params:{result:'OK',steamid:sid,ownersteamid:sid,vacbanned:false,publisherbanned:false}}):ok({error:{errorcode:3}});}
 if(u.pathname.endsWith('/InitTxn/v3/')){orders[body.orderid]={status:'Init',steamid:body.steamid,currency:body.currency,items:[{itemid:Number(body['itemid[0]']),qty:Number(body['qty[0]']),amount:Number(body['amount[0]'])}]};return ok({result:'OK',params:{orderid:body.orderid,transid:'T'}});}
 if(u.pathname.endsWith('/QueryTxn/v3/')){const o=orders[body.orderid];return o?ok({result:'OK',params:{orderid:body.orderid,status:o.status,steamid:o.steamid,currency:o.currency,items:o.items}}):ok({result:'Failure'});}
 if(u.pathname.endsWith('/FinalizeTxn/v2/')){const o=orders[body.orderid];if(!o||o.status!=='Approved')return ok({result:'Failure'});o.status='Succeeded';return ok({result:'OK',params:{orderid:body.orderid}});}
 return {ok:false,status:404,json:async()=>({})};
});
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/json','.woff2':'font/woff2','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-steamc-'));delete process.env.ADMIN_USERS;
 const {create}=require('../../server/accounts');
 const app=create({dataDir:dir,databaseUrl:'',adminUsers:'',log:()=>{},originAllowed:()=>true});await app.ready;
 const server=http.createServer((req,res)=>{if(app.handle(req,res))return;const p=path.join(ROOT,decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(200,{'content-type':'text/html'});res.end(fs.readFileSync(path.join(ROOT,'index.html')));return;}res.writeHead(200,{'content-type':TYPES[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 async function request(method,url,body,token){const r=await fetch(base+url,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});let j=null;try{j=await r.json();}catch(e){}return{status:r.status,j};}
 const SAVE={gold:500,champions:{tanque:{unlocked:true,level:3}},arenasCleared:{},stash:[],cromas:{},cosmeticUnlocks:{},firstRun:null,starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true,campaignResetV3:true,testStageV1:true};
 // cuenta sin vincular (usuario/contraseña)
 const reg=await request('POST','/api/register',{user:'SinSteam',pass:'player-password'});assert.equal(reg.status,201);await request('PUT','/api/save',{data:SAVE,baseVersion:0},reg.j.token);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
 const stub=ticket=>`window.HORDA_DESKTOP={platform:'win32',desktop:true,quit(){},setFullscreen(){},unlockAchievement(){},setPresence(){},flushSave(){},steamInfo:async()=>({name:'Cazadora',lang:'spanish'}),steamTicket:async()=>'${ticket}'};`;
 async function open(ticket,token){
  const ctx=await browser.newContext({viewport:{width:844,height:390}});
  await ctx.addInitScript(stub(ticket));
  if(token)await ctx.addInitScript(([b,t])=>{try{localStorage.setItem('horda_account:'+encodeURIComponent(b),JSON.stringify({token:t,user:'x',name:'x',expiresAt:Date.now()+86400000,apiBase:b}));}catch(e){}},[base,token]);
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/index.html?lazy=0&api='+encodeURIComponent(base));
  await page.waitForFunction(()=>typeof assetsAllReady==='function'&&assetsAllReady()&&typeof shopOpen==='function'&&typeof accountSteamLogin==='function');
  return{page,ctx,errors};
 }
 // diálogos reales del juego (.gd-*): se lee el mensaje y se acepta
 const dialog=async(page)=>{await page.locator('.gd-ok').waitFor({state:'visible',timeout:30000});const m=await page.locator('.gd-msg').innerText();await page.locator('.gd-ok').click();await page.locator('.gd-ok').waitFor({state:'hidden',timeout:5000}).catch(()=>{});return m;};
 // la primera compra con dinero real pide aceptar términos (js/ui/legal.js): se acepta como lo haría el jugador
 const buyClick=async(page,id)=>{await page.locator(`[data-brasas-buy="${id}"]`).click();const cb=page.locator('#legal-buy-cb');if(await cb.isVisible().catch(()=>false)||await cb.waitFor({state:'visible',timeout:3000}).then(()=>true).catch(()=>false)){const t=await page.locator('.legal-buy-p').innerText();ok(/Steam/.test(t)&&!/Mercado Pago/.test(t),'el aviso legal habla de Steam, no de Mercado Pago: '+t);await cb.check();await page.locator('.legal-btns .btn:not(.secondary)').click();}};
 const approveNewOrder=async(afterMs)=>{const t0=Date.now();for(;;){const id=Object.keys(orders).find(k=>orders[k].status==='Init'&&!orders[k]._seen);if(id){orders[id]._seen=true;setTimeout(()=>{orders[id].status='Approved';},afterMs);return id;}if(Date.now()-t0>20000)throw new Error('no se abrió ningún pedido');await new Promise(r=>setTimeout(r,100));}};

 // ---- 1) «Entrar con Steam» crea la cuenta y deja la sesión abierta ----
 {
  const {page,ctx,errors}=await open('aa11223344556677889900');
  ok(await page.evaluate(()=>accountSteamAvailable()),'con el contenedor de Steam hay inicio con Steam');
  await page.evaluate(()=>{accountOpen();});
  await page.locator('#acc-steam-btn').waitFor({state:'visible',timeout:15000});checks++;
  await page.locator('#acc-steam-btn').click();
  await page.waitForFunction(()=>!!acct.session,null,{timeout:20000});
  ok(await page.evaluate(()=>acct.session.name==='Cazadora'),'la cuenta toma el nombre de Steam');
  ok(Boolean(await app.store.getUserBySteamId(SID_A)),'el servidor guardó el steamid');
  ok(errors.length===0,'sin errores de página: '+errors.join('|'));
  await ctx.close();
 }
 // ---- 2) compra: el jugador aprueba en el overlay y las Brasas llegan ----
 {
  const steamUser=await app.store.getUserBySteamId(SID_A);
  const login=await request('POST','/api/steam/login',{ticket:'aa11223344556677889900'});const token=login.j.token;
  await request('PUT','/api/save',{data:SAVE,baseVersion:0},token);
  const {page,ctx,errors}=await open('aa11223344556677889900',token);
  await page.waitForFunction(()=>acct.lastPull&&!acct.pulling&&!acct.applying&&PREMIUM.at>0,null,{timeout:30000});
  ok(await page.evaluate(()=>PREMIUM.payments&&PREMIUM.payments.provider==='steam'&&PREMIUM.payments.enabled===true),'el servidor informa proveedor Steam');
  await page.evaluate(()=>{save.firstRun=null;selectedClass='tanque';setState('mainmenu');renderMainMenu();shopOpen('brasas');});
  await page.locator('[data-brasas-buy="brasas_1000"]').waitFor({state:'visible',timeout:15000});checks++;
  await page.waitForTimeout(1500);   // la tienda se vuelve a dibujar cuando llega la billetera: se espera a que quede estable
  const before=await page.evaluate(()=>PREMIUM.premium);
  await buyClick(page,'brasas_1000');
  const ask=await dialog(page);ok(/Steam te va a pedir que apruebes/.test(ask)&&/1\.100/.test(ask),'confirmación habla de Steam y de 1.100 Brasas: '+ask);
  const oid=await approveNewOrder(4000);   // el jugador «aprueba» 4 s después
  ok(orders[oid].items[0].itemid===1002&&orders[oid].items[0].amount===999&&orders[oid].steamid===SID_A,'el pedido salió con el artículo, monto y steamid correctos');
  const done=await dialog(page);ok(/Listo/.test(done),'aviso de éxito: '+done);
  await page.waitForFunction(b=>PREMIUM.premium===b+1100,before,{timeout:15000});checks++;
  ok(await page.evaluate(()=>premiumSteamPending()===null),'el pedido pendiente se limpió');
  ok(calls.filter(c=>c.path.endsWith('/FinalizeTxn/v2/')).length===1,'se cerró UNA vez en Steam');
  // ---- 3) retomar: se aprobó pero el juego se cerró antes de confirmar ----
  const ck=await request('POST','/api/wallet/checkout',{pack:'brasas_500',expectedPrice:{currency:'USD',amount:4.99}},token);
  orders[ck.j.orderId]._seen=true;orders[ck.j.orderId].status='Approved';
  await page.evaluate(o=>premiumSteamPendingSet(o,'brasas_500'),ck.j.orderId);
  const b2=await page.evaluate(()=>PREMIUM.premium);
  const rs=await page.evaluate(()=>premiumSteamResume());
  ok(rs&&rs.state==='credited','retomar: el pedido aprobado se acredita al volver');
  await page.waitForFunction(b=>PREMIUM.premium===b+500,b2,{timeout:15000});checks++;
  ok(await page.evaluate(()=>premiumSteamResume())===null,'retomar sin pedido pendiente no hace nada');
  ok(errors.length===0,'sin errores de página: '+errors.join('|'));
  await ctx.close();
 }
 // ---- 4) cuenta sin vincular: ofrece vincular y después compra ----
 {
  const {page,ctx,errors}=await open('bb11223344556677889900',reg.j.token);
  await page.waitForFunction(()=>acct.lastPull&&!acct.pulling&&!acct.applying&&PREMIUM.at>0,null,{timeout:30000});
  await page.evaluate(()=>{save.firstRun=null;selectedClass='tanque';setState('mainmenu');renderMainMenu();shopOpen('brasas');});
  await page.locator('[data-brasas-buy="brasas_500"]').waitFor({state:'visible',timeout:15000});await page.waitForTimeout(1500);
  await buyClick(page,'brasas_500');await dialog(page);   // «Comprar con Steam»
  const link=await dialog(page);ok(/no está vinculada a Steam/.test(link),'ofrece vincular la cuenta: '+link);
  const linked=await dialog(page);ok(/vinculada/.test(linked),'avisa que quedó vinculada: '+linked);
  ok(Boolean(await app.store.getUserBySteamId(SID_B)),'el servidor vinculó el steamid a la cuenta clásica');
  ok(errors.length===0,'sin errores de página: '+errors.join('|'));
  await ctx.close();
 }
 // ---- 5) sin contenedor de Steam no hay botón ni vinculación ----
 {
  const ctx=await browser.newContext({viewport:{width:844,height:390}});const page=await ctx.newPage();
  await page.goto(base+'/index.html?lazy=0&api='+encodeURIComponent(base));
  await page.waitForFunction(()=>typeof accountSteamAvailable==='function');
  ok(await page.evaluate(()=>accountSteamAvailable()===false),'en el navegador no hay inicio con Steam');
  await ctx.close();
 }
 await browser.close();server.close();
 console.log('steam-client: '+checks+' checks PASS');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
