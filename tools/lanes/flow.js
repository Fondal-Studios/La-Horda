'use strict';
/* Guerra de Cristales (motor real) por la interfaz: hub → sala → entrenar → HUD real (mismos botones de habilidad) →
 * suministros y compra → resultado con estadísticas → revancha → abandonar → vuelta al hub con el guardado intacto. */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const PORT=8894,root=path.resolve(__dirname,'../..');
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:root,stdio:'ignore'});
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(const [w,h] of [[844,390],[667,375]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true});await ctx.addInitScript(f=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},FIX);
  const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof setState==='function'&&typeof renderMainMenu==='function'&&typeof lanesStart==='function',null,{timeout:60000});
  await p.evaluate(()=>{save.tut=save.tut||{};save.tut.training=1;persistNow();setState('mainmenu');renderMainMenu();});
  const before=await p.evaluate(()=>localStorage.getItem('laHordaSave_v1'));
  await p.evaluate(()=>document.getElementById('hub-crystal-btn').scrollIntoView({block:'center'}));await p.click('#hub-crystal-btn');
  await p.waitForSelector('#crystalwars-screen:not(.hidden) #practice');
  assert(await p.locator('#champ option').count()>=30,'roster completo');
  await p.selectOption('#champ','mago');await p.click('#practice');
  await p.waitForFunction(()=>state==='playing'&&lanesOn(),null,{timeout:20000});
  // HUD real: los botones de habilidad del motor están y el marcador de la mini-partida también
  const hud=await p.evaluate(()=>({skills:['btn-s1','btn-s2','btn-s3','btn-ult','btn-basic'].map(id=>{const e=document.getElementById(id),r=e&&e.getBoundingClientRect();return !!r&&r.width>0;}),score:!!document.querySelector('.ln-score')&&document.querySelector('.ln-score').getBoundingClientRect().width>0,rival:!!document.querySelector('.ln-rival canvas'),pill:document.getElementById('hud-level').parentElement.textContent}));
  assert(hud.skills.every(Boolean),w+': HUD de campaña completo '+JSON.stringify(hud));assert(hud.score&&hud.rival,w+': marcador y vista rival');assert.match(hud.pill,/Oleada/);
  // fuente mínima del HUD propio
  const small=await p.evaluate(()=>[...document.querySelectorAll('#lanes-hud *')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.display!=='none'&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)&&parseFloat(cs.fontSize)<14;}).map(e=>e.className+':'+e.textContent.trim().slice(0,12)));
  assert.deepEqual(small,[],w+': letra menor a 14 px: '+small.join(','));
  // suministros: se abre el panel y se compra
  await p.evaluate(()=>{LN.lane[0].shards=100;});await p.waitForFunction(()=>lanesShopOpen(),null,{timeout:20000});
  await p.click('.ln-chip');assert(await p.isVisible('.ln-shop'),'panel de suministros');
  const bb=await p.evaluate(()=>[...document.querySelectorAll('.ln-buy')].map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height,d:b.disabled};}));assert(bb.every(x=>x.h>=48),w+': botones de compra >= 48 px '+JSON.stringify(bb));
  await p.click('.ln-buy[data-key="upgrade"]');assert.equal(await p.evaluate(()=>LN.lane[0].upgrade),1,'compra de mejora');
  // el guardado real no se tocó
  assert.equal(await p.evaluate(()=>localStorage.getItem('laHordaSave_v1')),before,'la partida no escribe el guardado real');
  // final rápido: el cristal rival cae → resultado con estadísticas
  await p.evaluate(()=>{LN.lane[1].crystal.hp=1;lanesCrystalHit(1,50);});
  await p.waitForSelector('#lanes-result:not(.hidden)',{timeout:8000});
  assert.equal(await p.locator('#lanes-result tbody tr').count(),4,'estadísticas de 4 jugadores');assert.match(await p.textContent('#lanes-result h2'),/VICTORIA/);
  // revancha
  await p.click('#lanes-result .ln-again');await p.waitForFunction(()=>state==='playing'&&lanesOn()&&LN.t<2000,null,{timeout:20000});
  // abandonar por la pausa
  await p.click('#pause-btn');await p.click('#quit-btn');await p.getByRole('button',{name:'Abandonar',exact:true}).click();
  await p.waitForFunction(()=>state==='mainmenu'&&!lanesOn(),null,{timeout:10000});
  assert.equal(await p.evaluate(()=>localStorage.getItem('laHordaSave_v1')),before,'guardado intacto al volver');
  assert.equal(await p.evaluate(()=>typeof save.champions.mago.level),'number');assert.notEqual(await p.evaluate(()=>save.champions.mago.level),10,'el guardado real volvió');
  assert.deepEqual(errs,[],'sin errores de página');console.log(`PASS lanes flow ${w}x${h}`);await ctx.close();
 }
 await b.close();srv.kill();
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
