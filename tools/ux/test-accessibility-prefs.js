'use strict';
// Accesibilidad, cuentas y primera Tienda (js/core/prefs.js, css/accessibility.css, js/net/account.js, js/ui/shop-ui.js).
// Comprueba en el juego real (844x390 táctil):
//  - valores de fábrica: sin ctl-custom, sin transform/opacity en los controles, ataque "hold", sin paleta;
//  - persistencia de cvd / atkMode / ctlSize / ctlOp y migración de un horda_prefs viejo (sin esas claves);
//  - tamaño y opacidad de los controles: el botón Ataque crece, sigue dentro de la pantalla y el joystick
//    llega a velocidad máxima a JOY_MAX*escala px del centro;
//  - ataque: mantener (como siempre), alternar (un toque prende y otro apaga) y automático (solo con enemigo a alcance);
//  - daltonismo: telegrafías con la paleta elegida, siempre con rayado, barras con marcas;
//  - cuentas: sin la dirección cruda a la vista, con 3 beneficios; Tienda: fila "próxima meta" con 0 de oro y
//    "lo que podés comprar ya" con oro, sin tocar precios.
// Uso: node tools/ux/test-accessibility-prefs.js   (A11Y_PORT para elegir el puerto; CHROMIUM_PATH opcional)
const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.resolve(__dirname,'../..'),PORT=+(process.env.A11Y_PORT||8847);
const server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;console.log('PASS '+m);};
async function load(browser,prefs){
 const ctx=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 if(prefs!==undefined)await ctx.addInitScript(v=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('horda_prefs',v);sessionStorage.setItem('seeded','1');}}catch(e){}},prefs);
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://fondalstudios.com/**',r=>r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:'{"ok":true}'}));
 await page.goto(`http://127.0.0.1:${PORT}/?lazy=0`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof startRun==='function'&&typeof shopOpen==='function'&&typeof renderMainMenu==='function'&&typeof assetsAllReady==='function'&&assetsAllReady(),null,{timeout:120000});
 return {ctx,page,errors};
}
const startPlay=page=>page.evaluate(()=>{for(const ck in save.champions){const s=save.champions[ck];s.unlocked=true;s.level=20;}
 selectedClass='mago';currentArena='bosque';lobbyAllies=['tanque'];netMatch=null;startRun(3);setState('playing');updateHUD();});
(async()=>{
 await sleep(500);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 try{
  // ---- valores de fábrica ----
  let {ctx,page,errors}=await load(browser);
  const def=await page.evaluate(()=>({p:JSON.parse(JSON.stringify(PREFS)),cls:document.body.className}));
  ok(def.p.cvd==='off'&&def.p.atkMode==='hold'&&def.p.ctlSize===100&&def.p.ctlOp===100,'valores de fábrica: sin paleta, ataque mantener, 100% y 100%');
  ok(!/ctl-custom|cvd-|atk-toggle|atk-auto/.test(def.cls),'valores de fábrica: <body> sin clases nuevas ('+def.cls+')');
  await startPlay(page);
  const d0=await page.evaluate(()=>{const g=id=>getComputedStyle(document.getElementById(id));return{sk:g('skillzone').transform,jz:g('joyzone').transform,op:g('skillzone').opacity,b:document.getElementById('btn-basic').getBoundingClientRect().width};});
  ok(d0.sk==='none'&&d0.jz==='none'&&d0.op==='1','valores de fábrica: controles sin transform ni opacidad (experiencia de siempre)');
  ok(Math.round(d0.b)===72,'valores de fábrica: botón Ataque 72 px');
  // ataque "hold" como siempre
  const hold=await page.evaluate(async()=>{const b=document.getElementById('btn-basic'),r=b.getBoundingClientRect();
   const ev=t=>new PointerEvent(t,{pointerId:7,bubbles:true,clientX:r.left+10,clientY:r.top+10,pointerType:'touch'});
   b.dispatchEvent(ev('pointerdown'));const a=basicHeld;b.dispatchEvent(ev('pointerup'));return{down:a,up:basicHeld};});
  ok(hold.down===true&&hold.up===false,'ataque Mantener: apretar = atacando, soltar = deja de atacar');
  // ---- persistencia + migración ----
  await page.evaluate(()=>{prefSet('cvd','by');prefSet('atkMode','toggle');prefSet('ctlSize',130);prefSet('ctlOp',60);});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('horda_prefs')));
  ok(saved.cvd==='by'&&saved.atkMode==='toggle'&&saved.ctlSize===130&&saved.ctlOp===60,'las 4 opciones nuevas se guardan en horda_prefs');
  await page.evaluate(()=>{prefSet('ctlSize',9999);prefSet('ctlOp',-5);});
  const clamp=await page.evaluate(()=>({s:PREFS.ctlSize,o:PREFS.ctlOp}));
  ok(clamp.s===150&&clamp.o===40,'tamaño y opacidad se limitan a 90-150 y 40-100');
  await page.evaluate(()=>{prefSet('ctlSize',130);prefSet('ctlOp',60);});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&typeof shopOpen==='function'&&typeof renderMainMenu==='function'&&typeof assetsAllReady==='function'&&assetsAllReady(),null,{timeout:120000});
  const re=await page.evaluate(()=>({p:JSON.parse(JSON.stringify(PREFS)),cls:document.body.className}));
  ok(re.p.cvd==='by'&&re.p.atkMode==='toggle'&&re.p.ctlSize===130&&re.p.ctlOp===60&&/cvd-by/.test(re.cls)&&/ctl-custom/.test(re.cls)&&/atk-toggle/.test(re.cls),'al recargar se conservan y se aplican (clases del <body>)');
  await ctx.close();
  ({ctx,page,errors}=await load(browser,JSON.stringify({vibrate:false,shake:'off',textLg:true,lefty:true,contrast:true})));
  const old=await page.evaluate(()=>JSON.parse(JSON.stringify(PREFS)));
  ok(old.vibrate===false&&old.lefty===true&&old.contrast===true&&old.cvd==='off'&&old.atkMode==='hold'&&old.ctlSize===100&&old.ctlOp===100,'un horda_prefs viejo (sin las claves nuevas) conserva lo suyo y completa con valores de fábrica');
  await ctx.close();
  ({ctx,page,errors}=await load(browser,'{"cvd":"xx","atkMode":7,"ctlSize":"grande","ctlOp":null}'));
  const bad=await page.evaluate(()=>JSON.parse(JSON.stringify(PREFS)));
  ok(bad.cvd==='off'&&bad.atkMode==='hold'&&bad.ctlSize===100&&bad.ctlOp===100,'valores inválidos guardados vuelven a los de fábrica');
  await ctx.close();
  // ---- controles escalados ----
  ({ctx,page,errors}=await load(browser,JSON.stringify({ctlSize:150,ctlOp:60})));
  await startPlay(page);
  const sc=await page.evaluate(()=>{const g=id=>document.getElementById(id).getBoundingClientRect(),op=getComputedStyle(document.getElementById('skillzone')).opacity;
   const out={op,vw:innerWidth,vh:innerHeight};for(const id of ['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult','joy-base']){const r=g(id);out[id]={x:r.left,y:r.top,w:r.width,h:r.height};}return out;});
  ok(sc.op==='0.6','opacidad 60% aplicada a los botones');
  ok(Math.round(sc['btn-basic'].w)===108,'tamaño 150%: botón Ataque 72 -> 108 px (vale '+Math.round(sc['btn-basic'].w)+')');
  const bad2=['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult','joy-base'].filter(id=>{const r=sc[id];return r.x<0||r.y<0||r.x+r.w>sc.vw+0.5||r.y+r.h>sc.vh+0.5;});
  ok(!bad2.length,'tamaño 150%: botones y joystick dentro de la pantalla '+(bad2.join(',')||''));
  const ids=['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult'];let overlaps=[];
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const a=sc[ids[i]],b=sc[ids[j]];const ox=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),oy=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);if(ox>2&&oy>2)overlaps.push(ids[i]+'/'+ids[j]);}
  ok(!overlaps.length,'tamaño 150%: botones sin superponerse '+(overlaps.join(',')||''));
  const joy=await page.evaluate(()=>{const z=document.getElementById('joyzone'),b=document.getElementById('joy-base').getBoundingClientRect(),c={x:b.left+b.width/2,y:b.top+b.height/2},s=ctlScale();
   const ev=(t,x,y)=>new PointerEvent(t,{pointerId:3,bubbles:true,clientX:x,clientY:y,pointerType:'touch'});
   z.dispatchEvent(ev('pointerdown',c.x,c.y));
   z.dispatchEvent(ev('pointermove',c.x+JOY_MAX*s,c.y));const full=Math.hypot(joyVec.x,joyVec.y);
   z.dispatchEvent(ev('pointermove',c.x+JOY_MAX*s/2,c.y));const half=Math.hypot(joyVec.x,joyVec.y);
   const kn=document.getElementById('joy-knob').getBoundingClientRect(),kc={x:kn.left+kn.width/2};z.dispatchEvent(ev('pointerup',c.x,c.y));
   return{full,half,baseW:b.width,knobDx:kc.x-c.x+0};});
  ok(Math.abs(joy.full-1)<0.01&&Math.abs(joy.half-0.5)<0.02,'joystick escalado: velocidad máxima a JOY_MAX x escala px (vale '+joy.full.toFixed(2)+' / '+joy.half.toFixed(2)+')');
  await ctx.close();
  // ---- ataque alternar / automático ----
  ({ctx,page,errors}=await load(browser,JSON.stringify({atkMode:'toggle'})));
  await startPlay(page);
  const tg=await page.evaluate(()=>{const b=document.getElementById('btn-basic'),r=b.getBoundingClientRect();
   const ev=(t,id)=>new PointerEvent(t,{pointerId:id,bubbles:true,clientX:r.left+10,clientY:r.top+10,pointerType:'touch'});
   const o=[];b.dispatchEvent(ev('pointerdown',5));b.dispatchEvent(ev('pointerup',5));basicAutoTick();o.push(basicHeld,b.classList.contains('atk-on'));
   b.dispatchEvent(ev('pointerdown',6));o.push(basicHeld);b.dispatchEvent(ev('pointerup',6));basicAutoTick();o.push(basicHeld,b.classList.contains('atk-on'));
   b.dispatchEvent(ev('pointerdown',8));b.dispatchEvent(ev('pointerup',8));basicAutoTick();o.push(basicHeld);inputResetAll();o.push(basicHeld);return o;});
  ok(JSON.stringify(tg)==='[true,true,false,false,false,true,false]','ataque Alternar: un toque prende (queda prendido al soltar), otro apaga, y soltar el control lo apaga: '+JSON.stringify(tg));
  await ctx.close();
  ({ctx,page,errors}=await load(browser,JSON.stringify({atkMode:'auto'})));
  await startPlay(page);
  const au=await page.evaluate(()=>{const saved=enemies.slice();enemies.length=0;const o=[];
   basicAutoTick();o.push(basicHeld);
   enemies.push({alive:true,x:player.x+20,y:player.y});basicAutoTick();o.push(basicHeld);
   enemies.length=0;enemies.push({alive:true,x:player.x+5000,y:player.y});basicAutoTick();o.push(basicHeld);
   enemies.length=0;for(const e of saved)enemies.push(e);return o;});
  ok(JSON.stringify(au)==='[false,true,false]','ataque Automático: ataca solo con un enemigo a alcance, no con ninguno ni lejos: '+JSON.stringify(au));
  await ctx.close();
  // ---- daltonismo ----
  ({ctx,page,errors}=await load(browser,JSON.stringify({cvd:'rg'})));
  await startPlay(page);
  const cv=await page.evaluate(()=>{const t=vfxTelegraph({x:player.x,y:player.y,r:80,dur:900,rgb:'80,255,120'}),s=vfxTelegraph({x:player.x,y:player.y,r:60,dur:900,shape:4,rgb:'255,0,0'});
   const hp=getComputedStyle(document.getElementById('hp-fill')).backgroundImage;
   return{danger:t.rgb,safe:s.rgb,hi:VFX_HICON(),pal:cvdPal(),hp};});
  ok(cv.danger===cv.pal.danger&&cv.safe===cv.pal.safe&&cv.danger!==cv.safe,'rojo-verde: peligro y zona segura toman la paleta (no el color del jefe) y son distintos');
  ok(cv.hi===true,'rojo-verde: telegrafías siempre con rayado y borde (forma, no solo color)');
  ok(/repeating-linear-gradient/.test(cv.hp),'rojo-verde: la barra de vida lleva muescas');
  const by=await page.evaluate(()=>{prefSet('cvd','by');const t=vfxTelegraph({x:0,y:0,r:50,dur:300,rgb:'80,255,120'});return{danger:t.rgb,pal:cvdPal()};});
  ok(by.danger===by.pal.danger&&by.danger!==cv.danger,'azul-amarillo: paleta propia, distinta a la de rojo-verde');
  const off=await page.evaluate(()=>{prefSet('cvd','off');return vfxTelegraph({x:0,y:0,r:50,dur:300,rgb:'80,255,120'}).rgb+'|'+VFX_HICON();});
  ok(off==='80,255,120|false','sin paleta: el aviso conserva su color y no fuerza el rayado');
  await ctx.close();
  // ---- cuentas ----
  ({ctx,page,errors}=await load(browser));
  const acc=await page.evaluate(()=>{_acctBuild();_acctRenderAuth('register');_acctShow();const b=acct.el.querySelector('.acc-body');
   const d=b.querySelector('details.net-tech');return{text:b.innerText,open:d&&d.open,perks:b.querySelectorAll('.acc-perks li').length,html:b.innerHTML.includes('https://fondalstudios.com/la-horda/red')};});
  ok(!/https?:\/\//.test(acc.text),'cuenta: la URL cruda no se ve en pantalla');
  ok(acc.open===false&&acc.html,'cuenta: la dirección queda en "Detalle técnico", colapsado');
  ok(acc.perks===3&&/Respaldo/.test(acc.text)&&/Brasas/.test(acc.text)&&/Ranking/.test(acc.text),'cuenta: 3 beneficios (respaldo, Brasas, ranking)');
  // ---- Tienda ----
  const sh0=await page.evaluate(()=>{save.gold=0;save.starterChosen=true;setState('mainmenu');renderMainMenu();shopOpen('destacados');const g=document.querySelector('[data-shop-now="goal"]');
   const prices=[...document.querySelectorAll('[data-deal-buy]')].map(b=>+b.dataset.goldPrice),sc=shopDailyShowcase().deals.map(d=>d.price);
   return{goal:!!g,txt:g?g.innerText:'',prices,sc,cheapest:shopPriceOf(shopCatalog().find(e=>e.kind==='archetype'),'comun')};});
  ok(sh0.goal&&sh0.txt.includes('Te faltan'),'Tienda con 0 de oro: aparece "Tu próxima meta" con lo que falta');
  ok(sh0.txt.replace(/\./g,'').includes(String(sh0.cheapest)),'Tienda con 0 de oro: la meta es el equipo más barato ('+sh0.cheapest+')');
  ok(JSON.stringify(sh0.prices)===JSON.stringify(sh0.sc),'Tienda: los precios de las ofertas del día no cambian');
  const sh1=await page.evaluate(()=>{save.gold=3000;renderShop();const c=document.querySelector('[data-shop-now="can"]');
   const cards=c?[...c.querySelectorAll('.shop-now-card [data-gold-price],.shop-now-card [data-champ-buy],.shop-now-card [data-skin-buy],.shop-now-card [data-croma-buy],.shop-now-card [data-now-go]')].length:0;
   const prices=[...c.querySelectorAll('.shop-btn')].map(b=>(b.innerText.match(/[\d.]+$/)||[''])[0].replace(/\./g,'')).map(Number);return{can:!!c,cards,prices,gold:save.gold};});
  ok(sh1.can&&sh1.cards>=1&&sh1.cards<=4,'Tienda con 3.000: "Lo que podés comprar ya" con '+sh1.cards+' opciones');
  ok(sh1.prices.every(p=>p<=sh1.gold),'Tienda con 3.000: todo lo de la fila alcanza ('+sh1.prices.join(', ')+')');
  const buy=await page.evaluate(()=>{const b=document.querySelector('[data-shop-now="can"] [data-deal-buy]');return b?{price:+b.dataset.goldPrice,before:save.gold}:null;});
  if(buy){await page.evaluate(()=>document.querySelector('[data-shop-now="can"] [data-deal-buy]').click());await sleep(300);const after=await page.evaluate(()=>save.gold);ok(after===buy.before-buy.price,'comprar desde la fila cobra exactamente el precio de la oferta ('+buy.price+')');}
  await ctx.close();
  ok(errors.length===0,'sin errores de página en el último contexto '+(errors[0]||''));
  console.log(`\n${checks} comprobaciones OK`);
 }catch(e){console.error('FAIL',e.message||e);process.exitCode=1;}
 finally{await browser.close();server.kill();}
})();
