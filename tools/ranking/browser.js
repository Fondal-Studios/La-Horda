'use strict';
/* Rango en el juego real (Chromium, reloj virtual): migración del guardado, pantalla del menú en 844×390 y 667×375, y el rating de verdad
 * con los tres modos: Coliseo y Guerra de Cristales contra bots (peso, techo, práctica), abandono (también cerrar la pestaña), AFK y la
 * Horda Infinita. Uso: node tools/ranking/browser.js   (SHOTS=carpeta para guardar capturas)
 * No prueba servidor global (no existe): solo que la pantalla lo dice y que queda el contrato (window.RANK_SYNC) sin inventar nada. */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const PORT=8932,root=path.resolve(__dirname,'../..'),SHOTS=process.env.SHOTS||'';
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:root,stdio:'ignore'});
const BASE={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true,arenasCleared:{ciudad:true,fabrica:true},defeatCount:5,gems:9};
let browser,passed=0;const ok=n=>{passed++;console.log('ok  '+n);};
async function open(fix,vp){
 const ctx=await browser.newContext({viewport:vp||{width:844,height:390},hasTouch:true});
 await ctx.addInitScript(f=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},fix||BASE);
 const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);
 await p.waitForFunction(()=>typeof Ladder!=='undefined'&&typeof colStart==='function'&&typeof lanesStart==='function'&&typeof endlessBeginRun==='function'&&typeof renderMainMenu==='function',null,{timeout:60000});
 await p.evaluate(()=>{save.tut=save.tut||{};save.tut.training=1;setState('mainmenu');renderMainMenu();});
 return {ctx,p,errs};
}
const done=async(h)=>{assert.deepEqual(h.errs,[],'sin errores de página: '+h.errs.join(' | '));await h.ctx.close();};
const stored=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('laHordaSave_v1')).ladder);
// avanza el juego en reloj virtual (opcional: jugador invulnerable). Devuelve true si la partida terminó.
const step=(p,secs,god)=>p.evaluate(({secs,god})=>{for(let f=0;f<secs*60&&!(LN&&LN.ended);f++){if(god)for(const h of heroes)h.invulnTimer=1e9;update(1000/60);}return !!(LN&&LN.ended);},{secs,god});
// termina el torneo del Coliseo en la primera ronda: gana `winner` (0 = tu equipo)
const finishCol=(p,winner)=>p.evaluate(w=>{const pr=COL_PAIRINGS[0];LN.team[w].points=COL.WIN_POINTS-1;const pit=pr[0].includes(w)?0:1;colResolve(pit,w);if(!LN.col.res[1-pit])colResolve(1-pit,pr[1-pit][0]===w?pr[1-pit][1]:pr[1-pit][0]);LN.col.phase='inter';LN.col.t0=LN.t-COL.INTER_MS;},winner);

(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});

 /* ---- migración ---- */
 { const h=await open(BASE);
   const r=await h.p.evaluate(()=>({l:save.ladder,defeats:save.defeatCount,gems:save.gems,keys:Object.keys(save.ladder.modes)}));
   assert.deepEqual(r.keys.sort(),['col','cw','horda']);assert.equal(r.l.modes.cw.mmr,1000);assert.equal(r.l.modes.col.games,0);assert.equal(r.l.log.length,0);assert.equal(r.defeats,5,'el resto del guardado intacto');assert.equal(r.gems,9);
   await h.p.evaluate(()=>persistNow());const disk=await h.p.evaluate(()=>JSON.parse(localStorage.getItem('laHordaSave_v1')));assert.ok(disk.ladder&&disk.ladder.v===1,'se escribe al guardar');assert.equal(disk.defeatCount,5);assert.equal(disk.starterSkin,'vale');
   await done(h);ok('migración: un guardado de antes (sin rango) arranca en Hierro III y conserva todo'); }
 { const junk=Object.assign({},BASE,{ladder:{v:99,modes:{cw:{mmr:'1e99',games:-4,wins:'x',practice:5},col:7,horda:{mmr:1450,games:12,wins:7,losses:5,peak:1500}},log:[null,{mode:'cw',delta:99999,id:'z'},{mode:'nada'}],botDay:{d:{},gain:'x'}}});
   const h=await open(junk);
   const l=await h.p.evaluate(()=>save.ladder);
   assert.equal(l.modes.cw.mmr,4000,'valor absurdo acotado');assert.equal(l.modes.cw.games,0);assert.equal(l.modes.col.mmr,1000,'modo corrupto → de fábrica');assert.equal(l.modes.horda.mmr,1450,'lo válido se conserva');assert.equal(l.modes.horda.peak,1500);
   assert.ok(l.log.length<=1&&l.log.every(e=>Math.abs(e.delta)<=500),'historial saneado');
   await done(h);ok('migración: un rango corrupto o manipulado se normaliza sin romper el juego'); }

 /* ---- pantalla del menú ---- */
 for(const [w,hh] of [[844,390],[667,375]]){
   const h=await open(BASE,{width:w,height:hh});
   await h.p.evaluate(()=>{const R=(m,o,extra)=>Ladder.record(save,Object.assign({id:'t'+Math.random(),mode:m,outcome:o,opps:[{human:true}]},extra||{}),Date.now());
     R('col','win',{place:1,field:4,opps:[{human:true},{},{}]});R('col','loss',{place:3,field:4,opps:[{},{},{}]});R('col','loss',{abandon:true,durationMs:90000,place:4,field:4,opps:[{},{},{}]});R('cw','win');R('horda','loss',{round:14});persist();renderMainMenu();});
   const sub=await h.p.evaluate(()=>document.getElementById('hub-rank-sub').textContent);assert.match(sub,/· \d+ ·/,'la tarjeta del hub muestra tu mejor división: '+sub);
   await h.p.evaluate(()=>document.getElementById('hub-rank-btn').scrollIntoView({block:'center'}));
   const tile=await h.p.evaluate(()=>{const b=document.getElementById('hub-rank-btn'),r=b.getBoundingClientRect(),t=b.querySelector('.hub-tile-sub');return {h:r.height,w:r.width,clip:t.scrollWidth>t.clientWidth+1,title:getComputedStyle(b.querySelector('.hub-tile-title')).fontSize,sub:parseFloat(getComputedStyle(t).fontSize)};});
   assert.ok(tile.h>=48&&tile.w>=48,w+': tarjeta de rango del tamaño del resto '+JSON.stringify(tile));assert.equal(tile.clip,false,w+': texto de la tarjeta cortado');assert.ok(tile.sub>=14);
   const sizes=await h.p.evaluate(()=>['hub-crystal-btn','hub-coliseum-btn','hub-rank-btn'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];}));
   assert.ok(sizes[2][1]>=84&&sizes[2][0]>=sizes[1][0],w+': la tarjeta de rango ocupa la fila debajo de los modos '+JSON.stringify(sizes));
   await h.p.click('#hub-rank-btn');await h.p.waitForSelector('#rank-screen:not(.hidden) .rk-card');await h.p.waitForTimeout(450);   // (termina la animación de entrada del panel)
   const ui=await h.p.evaluate(()=>{
     const panel=document.querySelector('#rank-screen .rk-panel'),pr=panel.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;
     const btns=[...panel.querySelectorAll('.rk-tab,.rk-x,summary')].map(b=>{const r=b.getBoundingClientRect();return {c:b.className||b.tagName,h:Math.round(r.height),w:Math.round(r.width)};});
     const small=[...panel.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&r.height>0&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)&&parseFloat(cs.fontSize)<14;}).map(e=>e.className+':'+e.textContent.trim().slice(0,14));
     const clipped=[...panel.querySelectorAll('*')].filter(e=>{const cs=getComputedStyle(e);return e.clientWidth>0&&e.scrollWidth>e.clientWidth+1&&cs.overflowX!=='visible'&&cs.overflowX!=='auto'&&cs.overflowX!=='scroll';}).map(e=>e.className+':'+e.textContent.trim().slice(0,14));
     const over=[...panel.querySelectorAll('.rk-tab,.rk-badge,.rk-stats div,.rk-row,.rk-card,.rk-main')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.className);
     return {inView:pr.left>=0&&pr.right<=vw&&pr.top>=0&&pr.bottom<=vh+1,panelW:Math.round(pr.width),panelH:Math.round(pr.height),vh,tabs:panel.querySelectorAll('.rk-tab').length,btns,small,clipped,over,hScroll:panel.scrollWidth>panel.clientWidth+1,
       text:panel.textContent,global:document.getElementById('rk-global').textContent,sync:typeof window.RANK_SYNC};});
   assert.ok(ui.inView,w+': panel dentro de la pantalla '+JSON.stringify([ui.panelW,ui.panelH,ui.vh]));assert.equal(ui.tabs,3);assert.ok(ui.btns.every(b=>b.h>=48&&b.w>=48),w+': botones >= 48 px '+JSON.stringify(ui.btns));
   assert.deepEqual(ui.small,[],w+': letra < 14 px');assert.deepEqual(ui.clipped,[],w+': texto cortado');assert.deepEqual(ui.over,[],w+': desborde horizontal');assert.equal(ui.hScroll,false);
   assert.match(ui.text,/Hierro|Brasa|Ceniza/);assert.match(ui.text,/Últimas partidas/);assert.equal(ui.sync,'undefined','no hay servidor global simulado');assert.match(ui.global,/Todavía no hay tabla global/);
   if(SHOTS) await h.p.screenshot({path:path.join(SHOTS,`rank-${w}x${hh}.png`)});
   // pestañas: cambiar de modo muestra otra división y el historial de ese modo
   await h.p.click('.rk-tab[data-rk-mode="cw"]');assert.match(await h.p.textContent('.rk-card'),/puntos · Guerra de Cristales/);
   await h.p.click('.rk-tab[data-rk-mode="horda"]');assert.match(await h.p.textContent('.rk-card'),/Horda Infinita/);
   await h.p.click('.rk-x');assert.equal(await h.p.evaluate(()=>document.getElementById('rank-screen').classList.contains('hidden')),true,'cierra');
   await h.p.click('#hub-rank-btn');await h.p.keyboard.press('Escape');assert.equal(await h.p.evaluate(()=>document.getElementById('rank-screen').classList.contains('hidden')),true,'Esc cierra');
   await done(h);ok(`pantalla de rango ${w}x${hh}: botones >= 48 px, letra >= 14 px, sin texto cortado, sin tabla global inventada`);
 }

 /* ---- Coliseo contra bots: victoria cuenta (a la mitad), techo y práctica ---- */
 { const h=await open(BASE);
   await h.p.evaluate(()=>colStart({champ:'guerrero',seed:5}));await step(h.p,3);await finishCol(h.p,0);
   await h.p.waitForSelector('#col-result:not(.hidden)',{timeout:15000});
   const line=await h.p.textContent('#col-result .rk-line');assert.match(line,/RANGO COLISEO · Hierro III · 10\d\d \(\+\d+\) · contra bots vale la mitad/,line);
   assert.equal(await h.p.evaluate(()=>LN.snap.save.ladder.modes.col.games),1,'se anota en el guardado REAL, no en el temporal');
   assert.equal(await h.p.evaluate(()=>save.ladder.modes.col.games),0,'el guardado temporal de la partida no se usa');
   await h.p.evaluate(()=>lanesStop('mainmenu'));
   const d=await stored(h.p);assert.equal(d.modes.col.games,1);assert.equal(d.modes.col.wins,1);assert.ok(d.modes.col.mmr>1000&&d.modes.col.mmr<=1012,'ganar contra bots sube poco: '+d.modes.col.mmr);assert.equal(d.log.length,1);assert.equal(d.log[0].vs,'bots');assert.equal(d.log[0].synced,false);
   // techo: en 1300 con bots solo hay práctica
   await h.p.evaluate(()=>{save.ladder.modes.col.mmr=save.ladder.modes.col.peak=1300;persistNow();colStart({champ:'guerrero',seed:6});});await step(h.p,3);await finishCol(h.p,0);
   await h.p.waitForSelector('#col-result:not(.hidden)',{timeout:15000});assert.match(await h.p.textContent('#col-result .rk-line'),/Práctica: contra bots no se sube más de Brasa III/);
   await h.p.evaluate(()=>lanesStop('mainmenu'));const d2=await stored(h.p);assert.equal(d2.modes.col.mmr,1300);assert.equal(d2.modes.col.games,1,'la práctica no cuenta como partida con rango');assert.equal(d2.modes.col.practice.games,1);assert.equal(d2.modes.col.practice.wins,1);
   await done(h);ok('Coliseo: victoria contra bots suma a medias; en el techo es práctica sin puntos'); }

 /* ---- Coliseo: perder, abandonar, salir enseguida, cerrar la pestaña ---- */
 { const h=await open(BASE);
   await h.p.evaluate(()=>colStart({champ:'mago',seed:7}));await step(h.p,2,true);await h.p.evaluate(()=>lanesStop('mainmenu'));
   assert.equal((await stored(h.p)).modes.col.games,0,'salir a los pocos segundos no se anota');
   await h.p.evaluate(()=>colStart({champ:'mago',seed:8}));assert.equal(await step(h.p,35,true),false);   // 35 s: ya pasó el mínimo
   await h.p.evaluate(()=>lanesStop('mainmenu'));
   const d=await stored(h.p);assert.equal(d.modes.col.games,1);assert.equal(d.modes.col.abandons,1);assert.equal(d.modes.col.losses,1);assert.ok(d.modes.col.mmr<1000,'abandonar resta: '+d.modes.col.mmr);assert.equal(d.log[0].abandon,true);assert.ok(d.log[0].delta<0);
   // cerrar la pestaña (pagehide) también es abandono, y una sola vez
   await h.p.evaluate(()=>{save.ladder.modes.col.mmr=1100;persistNow();colStart({champ:'mago',seed:9});});await step(h.p,35,true);
   await h.p.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
   const d2=await stored(h.p);assert.equal(d2.modes.col.abandons,2,'pagehide anotó el abandono en el guardado real');assert.ok(d2.modes.col.mmr<1100);
   await h.p.evaluate(()=>lanesStop('mainmenu'));assert.equal((await stored(h.p)).modes.col.abandons,2,'no se cuenta dos veces');
   await done(h);ok('Coliseo: abandonar resta, salir enseguida no se anota, cerrar la pestaña cuenta una sola vez'); }

 /* ---- Coliseo: AFK no suma ---- */
 { const h=await open(BASE);
   await h.p.evaluate(()=>colStart({champ:'tanque',seed:11}));
   await h.p.evaluate(()=>{window.__w=0;});
   // la ronda 1 pelea: el jugador no toca nada (invulnerable para que no lo saquen del foso)
   await h.p.evaluate(()=>{while(LN.col.phase!=='fight'){for(const h of heroes)h.invulnTimer=1e9;update(1000/60);}});
   const flagged=await h.p.evaluate(()=>{for(let f=0;f<40*60&&!(LN.afk&&LN.afk.flagged);f++){for(const h of heroes)h.invulnTimer=1e9;update(1000/60);}return !!(LN.afk&&LN.afk.flagged);});
   assert.equal(flagged,true,'30 s sin hacer nada en plena pelea = AFK');
   await finishCol(h.p,0);await h.p.waitForSelector('#col-result:not(.hidden)',{timeout:15000});
   const line=await h.p.textContent('#col-result .rk-line');assert.match(line,/sin puntos por inactividad/,line);
   await h.p.evaluate(()=>lanesStop('mainmenu'));const d=await stored(h.p);assert.equal(d.modes.col.mmr,1000,'ganar estando AFK: +0');assert.equal(d.log[0].afk,true);assert.equal(d.log[0].delta,0);
   // y estar activo no dispara nada: se mueve y ataca
   await h.p.evaluate(()=>colStart({champ:'tanque',seed:12}));
   const act=await h.p.evaluate(()=>{while(LN.col.phase!=='fight')update(1000/60);for(let f=0;f<45*60;f++){for(const h of heroes)h.invulnTimer=1e9;joyVec={x:Math.cos(f/50),y:Math.sin(f/50)};update(1000/60);}return !!(LN.afk&&LN.afk.flagged);});
   assert.equal(act,false,'moverse no es AFK');await h.p.evaluate(()=>{joyVec={x:0,y:0};lanesStop('mainmenu');});
   await done(h);ok('Coliseo: quedarse quieto 30 s en pelea = AFK (+0 aunque ganes); moverse no'); }

 /* ---- Guerra de Cristales contra bots ---- */
 { const h=await open(BASE);
   await h.p.evaluate(()=>lanesStart({champ:'mago',seed:21}));await step(h.p,2);
   await h.p.evaluate(()=>{for(let l=0;l<3;l++)for(let k=0;k<3;k++)LN.team[1].S[l*3+k].alive=false;LN.team[1].S[9].hp=1;lanesStructDamage(LN.team[1].S[9],50,0);});
   await h.p.waitForSelector('#lanes-result:not(.hidden)',{timeout:15000});assert.match(await h.p.textContent('#lanes-result .rk-line'),/RANGO GUERRA DE CRISTALES · Hierro III · 10\d\d \(\+\d+\) · contra bots vale la mitad/);
   await h.p.evaluate(()=>lanesStop('mainmenu'));let d=await stored(h.p);assert.equal(d.modes.cw.wins,1);assert.equal(d.modes.col.games,0,'otro modo sin tocar');
   // perder (cae tu cristal) resta, y se cuenta como derrota
   await h.p.evaluate(()=>lanesStart({champ:'mago',seed:22}));await step(h.p,2);
   await h.p.evaluate(()=>{for(let l=0;l<3;l++)for(let k=0;k<3;k++)LN.team[0].S[l*3+k].alive=false;LN.team[0].S[9].hp=1;lanesStructDamage(LN.team[0].S[9],50,1);});
   await h.p.waitForSelector('#lanes-result:not(.hidden)',{timeout:15000});await h.p.evaluate(()=>lanesStop('mainmenu'));d=await stored(h.p);assert.equal(d.modes.cw.losses,1);assert.equal(d.modes.cw.games,2);
   // AFK en Guerra de Cristales: 80 s sin tocar nada y gana su equipo → +0
   await h.p.evaluate(()=>{save.ladder.modes.cw.mmr=1100;persistNow();lanesStart({champ:'mago',seed:23});});
   const fl=await h.p.evaluate(()=>{for(let f=0;f<90*60&&!(LN.afk&&LN.afk.flagged);f++){for(const h of heroes)h.invulnTimer=1e9;update(1000/60);}return !!(LN.afk&&LN.afk.flagged);});assert.equal(fl,true,'75 s sin actuar = AFK');
   await h.p.evaluate(()=>{for(let l=0;l<3;l++)for(let k=0;k<3;k++)LN.team[1].S[l*3+k].alive=false;LN.team[1].S[9].hp=1;lanesStructDamage(LN.team[1].S[9],50,0);});
   await h.p.waitForSelector('#lanes-result:not(.hidden)',{timeout:15000});await h.p.evaluate(()=>lanesStop('mainmenu'));d=await stored(h.p);assert.equal(d.modes.cw.mmr,1100,'ganar AFK: +0');assert.equal(d.log[d.log.length-1].afk,true);
   await done(h);ok('Guerra de Cristales: victoria y derrota contra bots; AFK 75 s no suma'); }

 /* ---- Horda Infinita ---- */
 { const h=await open(BASE);
   const r=await h.p.evaluate(()=>{endlessPending=true;endlessBeginRun();startRun(1);for(let i=0;i<60*5;i++)update(1000/60);EN.round=12;EN.score=5000;endlessEndRun('defeat');
     return {line:(document.getElementById('en-rank-line')||{}).textContent,m:JSON.stringify(save.ladder.modes.horda)};});
   assert.match(r.line,/RANGO HORDA INFINITA · Hierro III · 1024 \(\+24\)/,r.line);
   let d=await stored(h.p);assert.equal(d.modes.horda.games,1);assert.equal(d.log[0].vs,'pve');assert.equal(d.log[0].round,12);
   // abandonar la contención (pausa → terminar) no suma aunque la ronda fuera buena
   await h.p.evaluate(()=>{endlessFinish&&endlessFinish();setState('mainmenu');renderMainMenu();});
   const q=await h.p.evaluate(()=>{endlessPending=true;endlessBeginRun();startRun(1);for(let i=0;i<60*25;i++){player.invulnTimer=1e9;joyVec={x:Math.cos(i/40),y:Math.sin(i/40)};update(1000/60);}joyVec={x:0,y:0};EN.round=30;EN.score=90000;endlessEndRun('quit');return JSON.stringify(save.ladder.log[save.ladder.log.length-1]);});
   const last=JSON.parse(q);assert.equal(last.abandon,true);assert.ok(last.delta<=0,'abandonar la Horda nunca suma: '+last.delta);assert.equal(last.reason,'abandon');
   // AFK en la Horda
   await h.p.evaluate(()=>{endlessFinish&&endlessFinish();setState('mainmenu');renderMainMenu();});
   const a=await h.p.evaluate(()=>{endlessPending=true;endlessBeginRun();startRun(1);LADDER_AFK_MS.horda=8000;for(let i=0;i<60*12;i++){player.invulnTimer=1e9;update(1000/60);}EN.round=25;EN.score=40000;const afk=!!(EN.local&&EN.local.afk);endlessEndRun('defeat');return {afk,last:save.ladder.log[save.ladder.log.length-1]};});
   assert.equal(a.afk,true,'quieto más que el umbral (en el juego 45 s; la prueba lo baja a 8 s porque a los ~20 s sale la elección de bendición) = AFK');assert.ok(a.last.delta<=0&&a.last.afk,'AFK nunca suma: '+JSON.stringify(a.last));
   await done(h);ok('Horda Infinita: la ronda cuenta contra la par; abandonar y AFK nunca suman'); }

 /* ---- salas en línea (cliente de Convergencia) y entrenamiento ---- */
 { const h=await open(BASE);
   const r=await h.p.evaluate(()=>{
     const a=ladderOnLegacy({mode:'cw',outcome:'win',humansOpp:2,id:'room-1',durationMs:120000});
     const b=ladderOnLegacy({mode:'cw',outcome:'win',humansOpp:2,id:'room-1',durationMs:120000});
     const c=ladderOnLegacy({mode:'col',outcome:'loss',humansOpp:0,id:'room-2',durationMs:120000});
     const d=ladderOnLegacy({mode:'cw',outcome:'loss',abandon:true,humansOpp:1,id:'room-3',durationMs:90000});
     return {a,b:b&&b.reason,c,d};});
   assert.equal(r.a.counted,true);assert.equal(r.a.vs,'humans');assert.equal(r.a.delta,20,'contra personas vale completo');assert.equal(r.b,'duplicate');assert.equal(r.c.vs,'bots');assert.ok(r.d.delta<=-8&&r.d.reason==='abandon');
   const d=await stored(h.p);assert.equal(d.modes.cw.games,2);assert.equal(d.modes.cw.abandons,1);assert.equal(d.modes.col.games,1);
   // el entrenamiento guiado (ALPHA_TRAINING) y el banco de pruebas nunca cuentan
   const e=await h.p.evaluate(()=>{const before=JSON.stringify(save.ladder);const had=typeof ALPHA_TRAINING!=='undefined';if(had)ALPHA_TRAINING.active=true;const x=ladderOnLegacy({mode:'cw',outcome:'win',humansOpp:1,id:'train-1',durationMs:120000});if(had)ALPHA_TRAINING.active=false;return {had,reason:x&&x.reason,same:before===JSON.stringify(save.ladder)};});
   if(e.had){assert.equal(e.reason,'ineligible');assert.equal(e.same,true,'el entrenamiento no toca el rango');}
   await done(h);ok('salas en línea contra personas: valen completo, no se duplican, irse es abandono; el entrenamiento no cuenta'); }

 await browser.close();srv.kill();console.log('PASS rango en el juego: '+passed+' grupos');
})().catch(async e=>{console.error(e);try{await browser.close();}catch{}srv.kill();process.exit(1);});
