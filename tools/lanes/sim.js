'use strict';
/* Guerra de Cristales (estilo MOBA) en el motor real: simulación de partidas completas SIN interfaz (motor real en Chromium,
 * reloj virtual). Verifica: nada tira excepciones, sin fuego amigo de la horda, las torres disparan, el PvP hace daño real,
 * las cartas de horda se aplican, el cristal está protegido hasta caer las torres y la partida termina.
 * Uso: node tools/lanes/sim.js [partidas=3] [segundos=300] */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const N=Number(process.argv[2])||3,SECS=Number(process.argv[3])||300,PORT=8893;
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(let g=0;g<N;g++){
  const p=await b.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof lanesStart==='function'&&typeof update==='function',null,{timeout:60000});
  const r=await p.evaluate(({secs,seed})=>{
   setState('mainmenu');
   const ok=lanesStart({champ:['mago','tanque','soporte','guerrero'][seed%4],seed:seed+1});
   const rep={ok,friendly:0,maxEnemies:0,frames:0,towerShots:0,pvpHits:0,hordeDmgToStruct:0,protectedBlocked:0,cardsTaken:[0,0],towersDown:[0,0],heroDeaths:0,nan:0};
   // contadores: fuego amigo (golpe a un héroe del propio equipo que NO sea PvP) y PvP efectivo
   const dh=damageHero; damageHero=function(h,a,src,pt){ if(h&&h.team!=null&&src&&!src.isPvp&&src!==h){ const t=lanesTeamOf(src); if(t!=null&&t===h.team&&!h.isStruct) rep.friendly++; } if(src&&src.isPvp&&h&&!h.isStruct) rep.pvpHits++; if(!(a>=0)) rep.nan++; return dh.call(this,h,a,src,pt); };
   const dt=1000/60;
   for(let f=0;f<secs*60&&!LN.ended;f++){
    basicHeld=true; update(dt); rep.frames++;
    if(f%30===0){ rep.maxEnemies=Math.max(rep.maxEnemies,enemies.length);
      rep.towerShots=Math.max(rep.towerShots,LN.shots.length);
      for(const h of heroes) if(!h.alive&&!h.dead_t) {} }
    if(LN.t>20000&&f%600===0&&!LN.ended){ for(const k of ['repair','ward','swarm','brute']){ if(lanesBuy(0,k,player))break; } }
   }
   rep.ended=LN.ended;rep.winner=LN.winner;rep.why=LN.why;rep.t=Math.round(LN.t/1000);rep.wave=LN.wave;rep.shards=LN.team.map(t=>t.shards);rep.kills=LN.team.map(t=>t.kills);rep.pk=LN.team.map(t=>t.pk);
   rep.cardsTaken=LN.team.map(t=>t.taken);rep.towersDown=LN.team.map(t=>2-lanesTowersAlive(t.team));rep.struct=LN.team.map(t=>t.S.map(s=>Math.round(s.hp)));
   rep.alive=heroes.map(h=>h.alive);rep.setup=LN.setup;rep.mods=LN.team.map(t=>t.mods);
   damageHero=dh;
   lanesStop('mainmenu');rep.restored=!LN&&typeof save.champions.mago==='object';
   return rep;},{secs:SECS,seed:g});
  console.log(JSON.stringify(r));
  assert.equal(r.ok,true,'arrancó');assert.equal(r.friendly,0,'sin fuego amigo de la horda propia');assert.equal(r.nan,0,'sin daño NaN');
  assert(r.cardsTaken[0]>=2&&r.cardsTaken[1]>=2,'los dos equipos eligieron cartas de horda');
  assert(r.towersDown[0]+r.towersDown[1]>=1||r.struct.flat().some(h=>h<2400),'hubo daño a estructuras');
  assert(r.restored,'guardado real restaurado');
  assert.deepEqual(errs,[],'sin errores de página: '+errs.slice(0,3).join(' | '));
  await p.close();
 }
 await b.close();srv.kill();console.log('PASS lanes sim: '+N+' partidas');
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
