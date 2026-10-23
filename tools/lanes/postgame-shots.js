'use strict';
const {fetchReadyOk}=require('../lib/http-ready');

/* Capturas del POSTGAME (docs/modes/postgame/): hub bloqueado y desbloqueado, aviso de bloqueo, lobby y pantallas de resultado con recompensas
 * (Cristales y Coliseo) a 844×390 y 667×375. Servidor propio en un puerto libre.
 * Uso: node tools/lanes/postgame-shots.js [carpeta=docs/modes/postgame] */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const net=require('node:net');const fs=require('node:fs');
const freePort=()=>new Promise(r=>{const s=net.createServer().listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'../../docs/modes/postgame'));fs.mkdirSync(OUT,{recursive:true});
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
(async()=>{
 const PORT=await freePort(),root=path.resolve(__dirname,'../..');
 const srv=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 console.log('servidor propio en',PORT,'pid',srv.pid,'cwd',fs.readlinkSync('/proc/'+srv.pid+'/cwd'));
 for(let i=0;i<80;i++){try{if((await fetchReadyOk(`http://127.0.0.1:${PORT}/index.html`)))break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(const [w,h] of [[844,390],[667,375]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true});
  await ctx.addInitScript(f=>{try{if(!localStorage.getItem('laHordaSave_v1'))localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},FIX);
  const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`,{timeout:120000});
  await p.waitForFunction(()=>typeof setState==='function'&&typeof lanesStart==='function'&&typeof postgameSettle==='function',null,{timeout:90000});
  const shot=async n=>{await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,`${n}_${w}.png`)});};
  // 1) hub bloqueado (con el interruptor en "campaign"; por defecto viene "open")
  await p.evaluate(()=>{POSTGAME_GATE='campaign';});
  await p.evaluate(()=>{save.tut=save.tut||{};save.tut.training=1;persistNow();setState('mainmenu');renderMainMenu();document.getElementById('hub-postgame-title').scrollIntoView({block:'start'});});
  await shot('hub_bloqueado');
  // 2) aviso de bloqueo
  await p.evaluate(()=>document.getElementById('hub-crystal-btn').click());await p.waitForSelector('#pg-gate:not(.hidden)');await shot('aviso_bloqueo');
  // 3) lobby en Entrenamiento
  await p.click('#pg-gate-train');await p.waitForFunction(()=>state==='crystalwars');await shot('lobby_entrenamiento');
  await p.evaluate(()=>{CrystalWarsUI.close();});
  // 4) hub desbloqueado (campaña terminada y algo de historial)
  await p.evaluate(()=>{window.__questsNow=new Date(2026,9,19,12,0,0).getTime();save.arenasCleared.infernal=true;save.champions.mago.unlocked=true;const P=postgameState();P.modes.cw=Object.assign(P.modes.cw,{played:9,wins:6,losses:3,streak:3,best:4,trophies:85});P.modes.col=Object.assign(P.modes.col,{played:3,wins:1,losses:2,streak:0,best:1,trophies:15});setState('mainmenu');renderMainMenu();document.getElementById('hub-postgame-title').scrollIntoView({block:'start'});});
  await shot('hub_desbloqueado');
  await p.evaluate(()=>document.getElementById('hub-crystal-btn').click());await p.waitForFunction(()=>state==='crystalwars');await shot('lobby_postgame');
  await p.evaluate(()=>{CrystalWarsUI.close();setState('mainmenu');});
  // 5) resultado de Cristales con recompensas (gana 4 torres, 3 bajas, 1 épico)
  await p.evaluate(()=>{lanesStart({champ:'mago',seed:41});for(let i=0;i<30;i++)update(1000/60);LN.t=420000;player.pgKills=3;LN.team[player.team].tk=4;LN.team[player.team].epicsTaken=1;lanesFinish(player.team,'cristal');lanesShowResult();});
  await p.waitForSelector('#lanes-result:not(.hidden) .ln-res-pg',{timeout:120000});await shot('resultado_cristales');
  await p.evaluate(()=>document.querySelector('#lanes-result .ln-exit').click());
  // 6) segunda victoria: se corta con el tope diario
  await p.evaluate(()=>{for(let k=0;k<3;k++){lanesStart({champ:'mago',seed:50+k});for(let i=0;i<30;i++)update(1000/60);LN.t=420000;player.pgKills=4;LN.team[player.team].tk=5;LN.team[player.team].epicsTaken=2;lanesFinish(player.team,'cristal');postgameSettle(LN);if(k<2)lanesStop('mainmenu');}lanesShowResult();});
  await p.waitForSelector('#lanes-result:not(.hidden) .ln-res-pg',{timeout:120000});await shot('resultado_tope_diario');
  await p.evaluate(()=>document.querySelector('#lanes-result .ln-exit').click());
  // 7) resultado del Coliseo (día siguiente)
  await p.evaluate(()=>{window.__questsNow=new Date(2026,9,20,12,0,0).getTime();colStart({champ:'mago',seed:61});for(let i=0;i<30;i++)update(1000/60);const mine=player.team,T=LN.team[mine];T.points=3;T.wins=3;T.duels=3;player.pgKills=2;LN.t=200000;LN.winner=mine;LN.ended=true;LN.why='torneo';LN.col.round=3;colShowResult();});
  await p.waitForSelector('#col-result:not(.hidden) .ln-res-pg',{timeout:120000});await shot('resultado_coliseo');
  await p.evaluate(()=>document.querySelector('#col-result .ln-exit').click());
  if(errs.length)console.log('errores de página:',errs.slice(0,3));
  await ctx.close();
 }
 await b.close();srv.kill();console.log('Capturas en',OUT);
})().catch(e=>{console.error(e);process.exit(1);});
