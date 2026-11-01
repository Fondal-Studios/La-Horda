'use strict';
// Prueba funcional del productor (UF-HUD v1). NO es evidencia de aprobación: el evaluador independiente corre la suya.
// Verifica: press inmediato (táctil real vía CDP, mouse, teclado), hold, confirm distinto de press, reject en cd/sin energía,
// limpieza al soltar/cancelar, blancos >=44px y que ?uf=0 apague todo.
const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.resolve(__dirname,'../..'),PORT=+(process.env.UF_PORT||8871),BASE=process.env.UF_BASE||`http://127.0.0.1:${PORT}/`;
const server=process.env.UF_BASE?null:spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;
const ok=(c,m)=>{if(c)console.log('PASS',m);else{fails++;console.log('FAIL',m);}};
async function boot(page,champ){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof startRun==='function',null,{timeout:120000});
 await page.evaluate(champ=>{for(const k in save.champions){save.champions[k].unlocked=true;save.champions[k].level=20;}
  selectedClass=champ;currentArena='bosque';lobbyAllies=['tanque'];netMatch=null;startRun(3);setState('playing');
  enemies=[];spawnTimer=1e9;player.energy=1e4;player.cds=[0,0,0];player.ultCharge=player.ultMax;player.ultCd=0;runLevel=Math.max(runLevel,ULT_MIN_ARENA_LEVEL);
  updateAbilityButtons();updateHUD();updateSkillButtonStates();},champ);
 await sleep(400);
}
const center=(page,id)=>page.evaluate(id=>{const b=document.getElementById(id).getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2,w:b.width,h:b.height};},id);
(async()=>{
 await sleep(500);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
 try{
  const ctx=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await boot(page,'mago');
  ok(await page.evaluate(()=>!!window.UIFactory&&UIFactory.contract==='UF-HUD-1'),'adaptador cargado (UF-HUD-1)');
  const cdp=await ctx.newCDPSession(page);
  // 1+2) táctil real: press sincrónico, hold tras 150 ms, limpieza al soltar
  const s1=await center(page,'btn-s1');
  ok(s1.w>=44&&s1.h>=44,`btn-s1 mide ${Math.round(s1.w)}x${Math.round(s1.h)} >= 44`);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:s1.x,y:s1.y,id:1}]});
  await sleep(40);
  ok(await page.evaluate(()=>document.getElementById('btn-s1').classList.contains('uf-press')),'táctil: uf-press aplicado');
  ok(await page.evaluate(()=>UIFactory.metrics.lastLatencyMs)<5,'latencia handler→clase < 5 ms (queueMs del navegador se informa aparte)');
  await sleep(250);
  ok(await page.evaluate(()=>document.getElementById('btn-s1').classList.contains('uf-hold')),'táctil: uf-hold con presión mantenida');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  await sleep(60);
  ok(await page.evaluate(()=>!document.getElementById('btn-s1').matches('.uf-press,.uf-hold')),'cancelar toque limpia press/hold');
  // 3) confirm distinto de press: tap rápido que lanza habilidad
  await page.evaluate(()=>{window.__ev=[];['uf:press','uf:confirm','uf:reject'].forEach(n=>addEventListener(n,e=>__ev.push(n+':'+e.detail.id)));});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:s1.x,y:s1.y,id:1}]});
  await sleep(30);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await sleep(250);
  const ev1=await page.evaluate(()=>__ev.slice());
  ok(ev1.includes('uf:press:btn-s1'),'evento uf:press emitido');
  ok(ev1.includes('uf:confirm:btn-s1'),'evento uf:confirm tras ejecución real (cooldown iniciado): '+JSON.stringify(ev1));
  ok(await page.evaluate(()=>document.getElementById('btn-s1').classList.contains('cd')||document.getElementById('btn-s1').classList.contains('active')),'cooldown visible tras ejecutar');
  // 5) reject: botón en cooldown
  await page.evaluate(()=>{__ev.length=0;});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:s1.x,y:s1.y,id:1}]});
  await sleep(40);
  ok(await page.evaluate(()=>document.getElementById('btn-s1').classList.contains('uf-reject')),'cooldown: uf-reject');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  ok(!(await page.evaluate(()=>__ev.some(e=>e.startsWith('uf:confirm')))),'presionar en cooldown NO emite confirm');
  // sin recursos
  await page.evaluate(()=>{player.energy=0;player.cds=[0,0,0];updateSkillButtonStates();__ev.length=0;});
  const s2=await center(page,'btn-s2');
  await page.mouse.move(s2.x,s2.y);await page.mouse.down();await sleep(40);
  ok(await page.evaluate(()=>document.getElementById('btn-s2').dataset.ufReject==='resources'),'sin energía: reject=resources');
  await page.mouse.up();
  // teclado
  await page.evaluate(()=>{player.energy=1e4;player.cds=[0,0,0];player.ultCharge=player.ultMax;updateSkillButtonStates();__ev.length=0;});
  await page.keyboard.down('Digit2');await sleep(40);
  ok(await page.evaluate(()=>document.getElementById('btn-s2').classList.contains('uf-press')),'teclado 2: uf-press');
  await sleep(120);await page.keyboard.up('Digit2');await sleep(80);
  ok(await page.evaluate(()=>!document.getElementById('btn-s2').classList.contains('uf-press')),'teclado: suelta limpia press');
  ok((await page.evaluate(()=>__ev.slice())).includes('uf:confirm:btn-s2'),'teclado: confirm tras ejecutar');
  // básico: mantener
  const bb=await center(page,'btn-basic');
  await page.evaluate(()=>{__ev.length=0;});
  await page.mouse.move(bb.x,bb.y);await page.mouse.down();await sleep(400);
  ok(await page.evaluate(()=>document.getElementById('btn-basic').classList.contains('uf-hold')),'básico: hold');
  await page.mouse.up();
  // sin errores y sin elementos pegados
  await sleep(200);
  ok(await page.evaluate(()=>!document.querySelector('.uf-press,.uf-hold')),'sin clases pegadas al terminar');
  ok(errors.length===0,'sin errores de página '+errors.slice(0,2).join('|'));
  // kill switch
  const p2=await ctx.newPage();await p2.goto(BASE+'?uf=0',{waitUntil:'domcontentloaded'});await p2.waitForFunction(()=>typeof startRun==='function');
  ok(await p2.evaluate(()=>!window.UIFactory&&document.documentElement.classList.contains('uf-off')),'?uf=0 apaga el adaptador');
 }finally{await browser.close();if(server)server.kill();}
 console.log(fails?`\n${fails} FALLOS`:'\nOK');process.exitCode=fails?1:0;
})().catch(e=>{console.error(e);if(server)server.kill();process.exitCode=1;});
