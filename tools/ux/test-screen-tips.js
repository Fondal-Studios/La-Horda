'use strict';
// Tutoriales de pantalla y "Cómo se juega": consejos una sola vez por pantalla, omitibles, no bloquean (táctil, teclado ni mando),
// repetibles, con traducción EN/PT, y la guía con una pestaña por tema. También prueba los avisos de ULT y botín en partida.
// NODE_PATH="$(npm root -g)" node tools/ux/test-screen-tips.js
const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),path=require('node:path');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),PORT=+(process.env.TIPS_PORT||8861);
const server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SAVE={tut:{training:1,firstStory:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
(async()=>{
 await sleep(600);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 try{
  for(const [w,h] of [[844,390],[667,375],[1280,720]]){
   const ctx=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<1000});
   await ctx.addInitScript(s=>{try{if(!localStorage.getItem('laHordaSave_v1'))localStorage.setItem('laHordaSave_v1',JSON.stringify(s));}catch(e){}},SAVE);
   const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
   const boot=async q=>{await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0${q}`,{timeout:180000});
    await p.waitForFunction(()=>typeof setState==='function'&&typeof screenTipsTick==='function'&&typeof renderMainMenu==='function',null,{timeout:60000});await sleep(800);};
   const tipNow=()=>p.evaluate(()=>{const e=document.getElementById('screen-tip');return e?e.dataset.tip:null;});
   const settle=async()=>{await p.evaluate(()=>{screenTipsTick();screenTipsTick();});await sleep(150);};

   // 0) automatizados sin ?tips=1 no ven cartel (las pruebas de recorrido siguen limpias)
   await boot('');
   await p.evaluate(()=>{setState('mainmenu');renderMainMenu();});await settle();
   assert.equal(await tipNow(),null,w+': sin ?tips=1 no hay cartel en navegadores automatizados');

   // 1) hub: aparece, es legible, no bloquea
   await boot('&tips=1');
   await p.evaluate(()=>{setState('mainmenu');renderMainMenu();});await settle();
   assert.equal(await tipNow(),'hub',w+': consejo del hub');
   const r=await p.evaluate(()=>{const c=document.getElementById('screen-tip'),b=c.getBoundingClientRect(),
     bt=[...c.querySelectorAll('button')].map(x=>{const r=x.getBoundingClientRect();return {t:x.textContent,h:r.height,w:r.width,fs:parseFloat(getComputedStyle(x).fontSize)};}),
     tx=[...c.querySelectorAll('.st-t,.st-x')].map(x=>parseFloat(getComputedStyle(x).fontSize));
    return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,bt,tx,vw:innerWidth,vh:innerHeight,pe:getComputedStyle(c).pointerEvents,modal:!!document.querySelector('#screen-tip[aria-modal]')};});
   assert(r.left>=0&&r.right<=r.vw+1&&r.bottom<=r.vh+1&&r.top>=0,w+': el cartel entra en pantalla');
   assert(r.bottom-r.top<=r.vh*0.46,w+': el cartel ocupa menos de la mitad del alto ('+Math.round(r.bottom-r.top)+'/'+r.vh+')');
   assert.equal(r.bt.length,3,w+': Entendido, Más ayuda y Omitir todos');
   for(const b of r.bt){assert(b.h>=44&&b.w>=44,w+': botón táctil '+b.t+' '+b.h);assert(b.fs>=14,w+': texto de botón >=14');}
   for(const f of r.tx)assert(f>=14,w+': texto >=14px');
   assert.equal(r.pe,'none',w+': el cartel deja pasar los toques (solo sus botones los reciben)');assert.equal(r.modal,false,w+': no es modal');
   // un toque en el botón Códice del hub pasa aunque el cartel esté a la vista
   const codexBox=await p.evaluate(()=>{const b=document.getElementById('mainmenu-codex-btn').getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2};});
   const hit=await p.evaluate(({x,y})=>{const e=document.elementFromPoint(x,y);return !!(e&&e.closest('#mainmenu-codex-btn'));},codexBox);
   assert(hit,w+': el cartel no tapa los botones del hub');
   // pad-nav ve los botones del cartel (mando)
   const padSees=await p.evaluate(()=>padCandidates().filter(c=>c.el.closest('#screen-tip')).length);
   assert(padSees>=3,w+': el mando puede llegar a los botones del cartel ('+padSees+')');
   // Entendido: se guarda y no vuelve
   await p.click('#screen-tip [data-st="ok"]');
   assert.equal(await tipNow(),null,w+': Entendido lo cierra');
   assert.equal(await p.evaluate(()=>save.tut.tips.hub),1,w+': queda guardado en save.tut.tips');
   await p.evaluate(()=>{setState('shop');renderShop();});await settle();await settle();
   await p.evaluate(()=>{setState('mainmenu');renderMainMenu();});await settle();await settle();
   assert.notEqual(await tipNow(),'hub',w+': el consejo del hub no se repite');

   // 2) un consejo por pantalla clave (con la lógica real de cada pantalla)
   const casesJs=[
    ['arenas',()=>{setState('arenaselect');renderArenaGrid();}],
    ['tienda',()=>{shopTab='destacados';setState('shop');renderShop();}],
    ['brasas',()=>{shopTab='brasas';renderShop();}],
    ['codice',()=>{setState('codex');}],
    ['inventario',()=>{setState('inventory');renderMyInventory();}],
    ['guardian',()=>{save.champions.mago.unlocked=true;selectedClass='mago';codexChampTab='ficha';setState('mainmenu');document.getElementById('mainmenu-guardianes-btn').click();}],
    ['equipo',()=>{document.querySelector('#codex-screen [data-ctab="equipo"]').click();}],
    ['talentos',()=>{document.querySelector('#codex-screen [data-ctab="talentos"]').click();}],
    ['maestria',()=>{document.querySelector('#codex-screen [data-ctab="habilidades"]').click();}],
    ['skins',()=>{document.querySelector('#codex-screen [data-ctab="skins"]').click();}],
    ['opciones',()=>{setState('mainmenu');renderMainMenu();openHubOptions();}],
    ['pausa',()=>{document.getElementById('hub-options').classList.add('hidden');setState('prep');selectedClass='mago';startRun(1);clearRunTimers();setState('paused');}],
    ['fin',()=>{showGameOverScreen();}]
   ];
   for(const [id,fn] of casesJs){
    await p.evaluate(fn);await sleep(250);await settle();await settle();
    assert.equal(await tipNow(),id,w+': consejo '+id+' (hay '+await tipNow()+')');
    const sz=await p.evaluate(()=>{const c=document.getElementById('screen-tip').getBoundingClientRect();return c.right<=innerWidth+1&&c.bottom<=innerHeight+1&&c.left>=0;});
    assert(sz,w+': '+id+' entra en pantalla');
    await p.evaluate(()=>screenTipDone());
   }
   // 3) Más ayuda abre ¿Cómo se juega? en el tema; Omitir todos apaga; Repetir los vuelve a mostrar
   await p.evaluate(()=>{document.getElementById('howto')&&document.getElementById('howto').classList.add('hidden');shopTab='destacados';setState('shop');renderShop();save.tut.tips={};});await settle();await settle();
   assert.equal(await tipNow(),'tienda');
   await p.click('#screen-tip [data-st="more"]');
   const topicOn=await p.evaluate(()=>document.querySelector('#howto .howto-tab.on').dataset.topic);
   assert.equal(topicOn,'tienda',w+': Más ayuda abre el tema del consejo');
   await p.evaluate(()=>howtoClose());
   await p.evaluate(()=>{setState('arenaselect');renderArenaGrid();save.tut.tips={};});await settle();await settle();
   assert.equal(await tipNow(),'arenas');
   await p.click('#screen-tip [data-st="off"]');
   assert.equal(await tipNow(),null);assert.equal(await p.evaluate(()=>save.tut.tipsOff),1,w+': Omitir todos queda guardado');
   await p.evaluate(()=>{setState('shop');renderShop();});await settle();await settle();
   assert.equal(await tipNow(),null,w+': con los consejos apagados no sale ninguno');
   await p.evaluate(()=>{setState('mainmenu');renderMainMenu();openHubOptions();});await sleep(200);
   assert.equal(await p.evaluate(()=>document.getElementById('opt-tips-switch').textContent),'No',w+': Opciones muestra consejos apagados');
   await p.click('#opt-tips-switch');
   assert.equal(await p.evaluate(()=>save.tut.tipsOff),0,w+': Opciones los vuelve a prender');
   await p.evaluate(()=>{document.getElementById('hub-options').classList.add('hidden');save.tut.tips={hub:1};screenTipsReset();});
   assert.deepEqual(await p.evaluate(()=>save.tut.tips),{},w+': Repetir los consejos borra lo visto');

   // 4) ¿Cómo se juega? desde el título, el hub y Opciones: 7 pestañas con pasos, sin desborde, botones táctiles
   await p.evaluate(()=>{setState('title');});await sleep(400);
   assert(await p.evaluate(()=>!!document.getElementById('title-howto-btn')&&document.getElementById('title-howto-btn').getBoundingClientRect().height>=44),w+': título con ¿Cómo se juega?');
   await p.evaluate(()=>document.getElementById('title-howto-btn').click());
   const g=await p.evaluate(()=>{const out=[];const tabs=[...document.querySelectorAll('#howto .howto-tab')];
     for(const t of tabs){t.click();const steps=document.querySelectorAll('#howto .howto-step').length,c=document.querySelector('#howto .howto-card'),r=t.getBoundingClientRect();
      out.push({topic:t.dataset.topic,steps,h:r.height,fs:parseFloat(getComputedStyle(t).fontSize),hov:c.scrollWidth>c.clientWidth+1,fits:c.getBoundingClientRect().bottom<=innerHeight+1});}
     return out;});
   assert.deepEqual(g.map(x=>x.topic),['objetivo','controles','botin','progreso','tienda','pausa','infinita'],w+': 7 temas');
   for(const x of g){assert(x.steps>=3,w+': '+x.topic+' tiene pasos');assert(x.h>=44&&x.fs>=14,w+': pestaña '+x.topic+' táctil y legible');assert(!x.hov&&x.fits,w+': '+x.topic+' sin desborde');}
   const txt=await p.evaluate(()=>{document.querySelector('#howto .howto-tab[data-topic="tienda"]').click();return document.getElementById('howto').textContent;});
   assert(/Brasas/.test(txt)&&/nunca dan poder/i.test(txt),w+': la guía dice que las Brasas son solo cosméticas');
   await p.evaluate(()=>{save.tut.tips={hub:1,tienda:1};document.querySelector('#howto [data-howto-reset]').click();});
   assert.deepEqual(await p.evaluate(()=>save.tut.tips),{},w+': "Repetir los consejos" desde la guía');
   await p.evaluate(()=>howtoClose());
   await p.evaluate(()=>{setState('mainmenu');renderMainMenu();});
   await p.click('#hub-howto-btn');assert(await p.evaluate(()=>!document.getElementById('howto').classList.contains('hidden')),w+': Ayuda del hub abre la guía');
   await p.evaluate(()=>howtoClose());
   await p.evaluate(()=>{openHubOptions();});await sleep(200);
   await p.click('#opt-howto-btn');assert(await p.evaluate(()=>!document.getElementById('howto').classList.contains('hidden')),w+': Opciones abre la guía');
   await p.evaluate(()=>{howtoClose();document.getElementById('hub-options').classList.add('hidden');});

   // 5) en partida: avisos de ULT y botín (una sola vez, con el cuadro de indicaciones existente)
   const run=await p.evaluate(()=>{setState('prep');selectedClass='mago';startRun(1);clearRunTimers();
     const f=save.tut;f.basics=f.b_move=f.b_attack=f.b_skill=1;delete f.u_ult;delete f.u_loot;
     runLevel=Math.max(runLevel,ULT_MIN_ARENA_LEVEL);player.ultCharge=player.ultMax;player.ultCd=0;tutHide();tutTick();
     const ult=TUT.key;const txt=document.querySelector('#tut-panel .tut-text').textContent;tutDone&&tutDone('u_ult');tutHide();
     groundLoot.push({item:{},tier:'comun',x:player.x,y:player.y,t0:0,id:99999});tutTick();const loot=TUT.key;groundLoot.length=0;
     return {ult,txt,loot,seen:!!save.tut.u_ult};});
   assert.equal(run.ult,'u_ult',w+': aviso de definitiva');assert(/definitiva/i.test(run.txt));assert.equal(run.loot,'u_loot',w+': aviso de botín');
   // 6) EN y PT: cartel, guía y avisos de partida traducidos (sin español residual en los textos nuevos)
   if(w===844)for(const [lang,hubRe,tabRe,btnRe] of [['en',/This is your base/,/Loot and items/,/Skip all/],['pt',/Esta é a sua base/,/Espólio e objetos/,/Pular todos/]]){
    await boot('&tips=1&lang='+lang);
    await p.evaluate(()=>{save.tut.tips={};setState('mainmenu');renderMainMenu();});await settle();await settle();await sleep(300);
    const t1=await p.evaluate(()=>document.getElementById('screen-tip').innerText);
    assert(hubRe.test(t1)&&btnRe.test(t1),lang+': cartel traducido: '+t1);assert(!/Esta es tu base|Omitir todos/.test(t1),lang+': sin español en el cartel');
    await p.evaluate(()=>{screenTipDone();howtoOpen('botin');});await sleep(300);
    const t2=await p.evaluate(()=>document.getElementById('howto').innerText);
    assert(tabRe.test(t2),lang+': guía traducida: '+t2.slice(0,200));assert(!/Recoger botín|Repetir los consejos/.test(t2),lang+': sin español en la guía');
    await p.evaluate(()=>howtoClose());
    for(const id of ['arenas','tienda','brasas','pausa','fin','equipo','opciones','codice']){
     const es=await p.evaluate(id=>{const t=SCREEN_TIPS.find(x=>x.id===id);return t.steps.map(s=>s.t+'|'+s.x);},id);
     const tr=await p.evaluate(id=>{const t=SCREEN_TIPS.find(x=>x.id===id);return t.steps.map(s=>I18N.t(s.t)+'|'+I18N.t(s.x));},id);
     assert.notDeepEqual(tr,es,lang+': consejo '+id+' sin traducir');
    }
   }
   assert.deepEqual(errs,[],w+': sin errores de página');
   console.log('PASS tutoriales de pantalla '+w+'x'+h);
   await ctx.close();
  }
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
