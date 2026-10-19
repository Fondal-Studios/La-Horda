'use strict';
/* Guerra de Cristales (motor real) por la interfaz: hub → sala → entrenar → HUD real (mismos botones de habilidad) →
 * suministros y compra → resultado con estadísticas → revancha → abandonar → vuelta al hub con el guardado intacto. */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const PORT=+process.env.LH_PORT||8894,root=path.resolve(__dirname,'../..');
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:root,stdio:'ignore'});
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true,arenasCleared:{infernal:true}};
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(const [w,h] of [[844,390],[667,375]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true});await ctx.addInitScript(f=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},FIX);
  const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`,{timeout:120000});await p.waitForFunction(()=>typeof setState==='function'&&typeof renderMainMenu==='function'&&typeof lanesStart==='function',null,{timeout:60000});
  await p.evaluate(()=>{save.tut=save.tut||{};save.tut.training=1;persistNow();setState('mainmenu');renderMainMenu();});
  const before=await p.evaluate(()=>{const o=JSON.parse(localStorage.getItem('laHordaSave_v1'));delete o.postgame;return JSON.stringify(o);});
  await p.evaluate(()=>document.getElementById('hub-crystal-btn').scrollIntoView({block:'center'}));await p.click('#hub-crystal-btn');
  await p.waitForSelector('#crystalwars-screen:not(.hidden) #practice');
  assert(await p.locator('#champ option').count()>=30,'roster completo');
  await p.selectOption('#champ','mago');await p.click('#practice');
  await p.waitForFunction(()=>state==='playing'&&lanesOn(),null,{timeout:20000});
  // HUD real: los botones de habilidad del motor están y el marcador de la mini-partida también
  const hud=await p.evaluate(()=>({skills:['btn-s1','btn-s2','btn-s3','btn-ult','btn-basic'].map(id=>{const e=document.getElementById(id),r=e&&e.getBoundingClientRect();return !!r&&r.width>0;}),score:!!document.querySelector('.ln-score')&&document.querySelector('.ln-score').getBoundingClientRect().width>0,rival:!!document.querySelector('.ln-rival canvas'),pill:document.getElementById('hud-level').parentElement.textContent}));
  assert(hud.skills.every(Boolean),w+': HUD de campaña completo '+JSON.stringify(hud));assert(hud.score&&hud.rival,w+': marcador y mapa');assert.match(hud.pill,/Oleada/);
  // fuente mínima del HUD propio
  const small=await p.evaluate(()=>[...document.querySelectorAll('#lanes-hud *')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.display!=='none'&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)&&parseFloat(cs.fontSize)<14;}).map(e=>e.className+':'+e.textContent.trim().slice(0,12)));
  assert.deepEqual(small,[],w+': letra menor a 14 px: '+small.join(','));
  // suministros: se abre el panel y se compra
  await p.evaluate(()=>{player.gold=900;});
  await p.click('.ln-chip');assert(await p.isVisible('.ln-shop'),'panel de suministros');
  assert(await p.evaluate(()=>{const r=document.querySelector('.ln-recall').getBoundingClientRect();return r.width>=48&&r.height>=48;}),w+': botón de volver a la base >= 48 px');
  assert.equal(await p.evaluate(()=>heroes.length),10,'cinco contra cinco');assert.equal(await p.evaluate(()=>player.mlvl),3,'arranca en nivel 3');
  await p.evaluate(()=>{player.x=LANES_PATHS[1].pts[2][0];player.y=LANES_PATHS[1].pts[2][1];});await p.click('.ln-recall');assert.equal(await p.evaluate(()=>!!player._recall),true,'volver a la base se canaliza');
  await p.evaluate(()=>{player.x+=200;});await p.waitForFunction(()=>!player._recall,null,{timeout:5000});
  const bb=await p.evaluate(()=>[...document.querySelectorAll('.ln-buy')].map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height,d:b.disabled};}));assert(bb.every(x=>x.h>=48),w+': botones de compra >= 48 px '+JSON.stringify(bb));
  await p.click('.ln-buy[data-key="ward"]');assert.equal(await p.evaluate(()=>LN.team[0].S.filter(x=>x.ward===200).length),1,'compra de barrera');
  assert.equal(await p.evaluate(()=>lanesCanBuy(0,'item:atk',player)),false,'los objetos no se compran lejos de la base');
  await p.evaluate(()=>{const r=laneRally(0);player.x=r.x;player.y=r.y;});await p.waitForFunction(()=>!document.querySelector('.ln-buy[data-key="item:atk"]').disabled,null,{timeout:5000});
  await p.click('.ln-buy[data-key="item:atk"]');assert.equal(await p.evaluate(()=>player.itAtk),1,'compra de un objeto en la base');
  assert.equal(await p.evaluate(()=>{const b=document.querySelector('.ln-buy[data-key="item:atk"]').querySelector('span');return /Nv 2/.test(b.textContent);}),true,'el objeto muestra su siguiente nivel');
  await p.click('.ln-chip');
  // carta de horda: se ofrece, se ve legible (>= 14 px, botones >= 48 px) y al elegirla potencia a la horda propia
  await p.evaluate(()=>{LN.team[0].pendingCards=1;});await p.waitForSelector('.ln-cards:not(.hidden) .ln-card',{timeout:8000});
  const cd=await p.evaluate(()=>[...document.querySelectorAll('.ln-card')].map(b=>{const r=b.getBoundingClientRect();return {h:r.height,w:r.width};}));assert(cd.length===3&&cd.every(x=>x.h>=48&&x.w>=48),w+': tres cartas grandes '+JSON.stringify(cd));
  const small2=await p.evaluate(()=>[...document.querySelectorAll('.ln-cards *')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)&&parseFloat(cs.fontSize)<14;}).map(e=>e.className));assert.deepEqual(small2,[],w+': letra de cartas < 14 px');
  const pre=await p.evaluate(()=>LN.team[0].offer.slice());await p.click('.ln-card[data-i="0"]');
  assert.equal(await p.evaluate(()=>LN.team[0].taken),1,'carta elegida');assert.equal(await p.evaluate(({id})=>LN.team[0].cards[id],{id:pre[0]}),1);
  await p.waitForSelector('.ln-cards.hidden',{state:'attached'});
  // el guardado real no se tocó
  assert.equal(await p.evaluate(()=>{const o=JSON.parse(localStorage.getItem('laHordaSave_v1'));delete o.postgame;return JSON.stringify(o);}),before,'la partida no escribe el guardado real');
  // final rápido: el cristal rival cae → resultado con estadísticas
  await p.evaluate(()=>{for(let l=0;l<3;l++)for(let k=0;k<3;k++)LN.team[1].S[l*3+k].alive=false;LN.team[1].S[9].hp=1;lanesStructDamage(LN.team[1].S[9],50,0);});
  await p.waitForSelector('#lanes-result:not(.hidden)',{timeout:8000});
  assert.equal(await p.locator('#lanes-result tbody tr').count(),10,'estadísticas de 10 jugadores');assert.match(await p.textContent('#lanes-result h2'),/VICTORIA/);
  // revancha
  await p.click('#lanes-result .ln-again');await p.waitForFunction(()=>state==='playing'&&lanesOn()&&LN.t<2000,null,{timeout:20000});
  // abandonar por la pausa
  await p.click('#pause-btn');await p.click('#quit-btn');await p.waitForTimeout(400);await p.getByRole('button',{name:'Abandonar',exact:true}).click();
  await p.waitForFunction(()=>state==='mainmenu'&&!lanesOn(),null,{timeout:10000});
  assert.equal(await p.evaluate(()=>{const o=JSON.parse(localStorage.getItem('laHordaSave_v1'));delete o.postgame;return JSON.stringify(o);}),before,'guardado intacto al volver');
  assert.equal(await p.evaluate(()=>typeof save.champions.mago.level),'number');assert.notEqual(await p.evaluate(()=>save.champions.mago.level),10,'el guardado real volvió');
  assert.deepEqual(errs,[],'sin errores de página');console.log(`PASS lanes flow ${w}x${h}`);await ctx.close();
 }
 await b.close();srv.kill();
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
