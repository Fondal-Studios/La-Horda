'use strict';
/* Guerra de Cristales en el motor real: simulación de partidas completas SIN interfaz (motor real en Chromium,
 * reloj virtual). Verifica aislamiento de carriles, crisis de recursos, final, y que nada tire excepciones.
 * Uso: node tools/lanes/sim.js [partidas=3] [segundos=240] */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const N=Number(process.argv[2])||3,SECS=Number(process.argv[3])||240,PORT=8893;
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const out=[];
 for(let g=0;g<N;g++){
  const p=await b.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof lanesStart==='function'&&typeof update==='function',null,{timeout:60000});
  const r=await p.evaluate(({secs,seed})=>{
   setState('mainmenu');
   const ok=lanesStart({champ:['mago','tanque','soporte','guerrero'][seed%4],seed:seed+1});
   const rep={ok,leaks:0,crossLane:0,maxEnemies:0,frames:0};
   const dt=1000/60;
   for(let f=0;f<secs*60&&!LN.ended;f++){
    basicHeld=true; update(dt); rep.frames++;
    if(f%30===0){ rep.maxEnemies=Math.max(rep.maxEnemies,enemies.length);
      for(const e of enemies){ if(!e.alive)continue; if(e.isDuelLocked)continue; const l=laneOfPoint(e.x); if(e.lane!==l) rep.crossLane++; }
      for(const h of heroes){ if(!h.duelActive&&laneOfPoint(h.x)!==h.lane) rep.crossLane++; } }
    if(LN.t>20000&&f%600===0&&!LN.ended){ // el jugador compra lo que pueda (como una persona)
      const ln=LN.lane[0]; for(const k of ['repair','upgrade','ward','swarm']){ if(lanesBuy(0,k,player))break; } }
   }
   rep.ended=LN.ended;rep.winner=LN.winner;rep.t=Math.round(LN.t/1000);rep.hp=LN.lane.map(l=>Math.round(l.crystal.hp));rep.wave=LN.wave;rep.shards=LN.lane.map(l=>l.shards);rep.kills=LN.lane.map(l=>l.kills);
   rep.alive=heroes.map(h=>h.alive);rep.setup=LN.setup;
   lanesStop('mainmenu');rep.restored=!LN&&typeof save.champions.mago==='object';
   return rep;},{secs:SECS,seed:g});
  out.push(r);console.log(JSON.stringify(r));
  assert.equal(r.ok,true,'arrancó');assert.equal(r.crossLane,0,'ningún enemigo/héroe cruzó de carril');assert.deepEqual(errs,[],'sin errores de página: '+errs.slice(0,3).join(' | '));
  assert(r.kills[0]>0&&r.kills[1]>0,'los dos carriles combatieron');
  await p.close();
 }
 await b.close();srv.kill();console.log('PASS lanes sim: '+N+' partidas');
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
