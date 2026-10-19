'use strict';
/* Guerra de Cristales (MOBA 2D de tres carriles, 5 contra 5) en el motor real: simulación de partidas completas SIN interfaz (motor real en Chromium,
 * reloj virtual). Verifica: nada tira excepciones, sin fuego amigo de la horda, hay combate (bajas de súbditos, PvP), los héroes ganan
 * experiencia y suben de nivel, la selva reaparece y las cartas de horda se ofrecen y se aplican.
 * Uso: node tools/lanes/sim.js [partidas=3] [segundos=300] */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
require('./team-card-test.js');
const N=Number(process.argv[2])||3,SECS=Number(process.argv[3])||300,PORT=+process.env.LH_PORT||8893;
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const context=await b.newContext();
 for(let g=0;g<N;g++){
  const p=await context.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof lanesStart==='function'&&typeof update==='function',null,{timeout:60000});
  const r=await p.evaluate(({secs,seed})=>{
   setState('mainmenu');
   const ok=lanesStart({champ:['mago','tanque','soporte','guerrero'][seed%4],seed:seed+1});
   const rep={ok,friendly:0,maxEnemies:0,frames:0,towerShots:0,pvpHits:0,cardsTaken:[0,0],towersDown:[0,0],nan:0,heroes:heroes.length,maxLvl:0,campKills:0};
   // contadores: fuego amigo (golpe a un héroe del propio equipo que NO sea PvP) y PvP efectivo
   const dh=damageHero; damageHero=function(h,a,src,pt){ const hp0=h&&h.hp,isF=h&&h.team!=null&&src&&!src.isPvp&&src!==h&&!h.isStruct&&lanesTeamOf(src)===h.team; if(src&&src.isPvp&&h&&!h.isStruct) rep.pvpHits++; if(!(a>=0)) rep.nan++; const r=dh.call(this,h,a,src,pt); if(isF&&h.hp<hp0-0.01) rep.friendly++; return r; };
   const dt=1000/60;
   for(let f=0;f<secs*60&&!LN.ended;f++){
    basicHeld=true; update(dt); rep.frames++;
    if(f%30===0){ rep.maxEnemies=Math.max(rep.maxEnemies,enemies.length);
      rep.towerShots=Math.max(rep.towerShots,LN.shots.length);
      rep.maxLvl=Math.max(rep.maxLvl,...heroes.map(h=>h.mlvl||0)); }
    if(LN.t>20000&&f%600===0&&!LN.ended){ for(const k of ['repair','ward','swarm','brute']){ if(lanesBuy(0,k,player))break; } }
    if(f%600===0&&LN.camps)for(const c of LN.camps)if(c.mons.length&&c.mons.some(m=>m.alive))rep.campKills+=0;
   }
   rep.ended=LN.ended;rep.winner=LN.winner;rep.why=LN.why;rep.t=Math.round(LN.t/1000);rep.wave=LN.wave;rep.shards=LN.team.map(t=>t.shards);rep.kills=LN.team.map(t=>t.kills);rep.pk=LN.team.map(t=>t.pk);
   rep.cardsTaken=LN.team.map(t=>t.taken+(t.offer?1:0)+t.pendingCards);rep.towersDown=LN.team.map(t=>9-lanesTowersAlive(t.team));rep.struct=LN.team.map(t=>t.S.map(s=>Math.round(s.hp)));rep.camps=LN.camps.map(c=>c.mons.length);rep.jungle=enemies.filter(e=>e.alive&&e.team===2).length;
   rep.items=heroes.reduce((a,h)=>a+(h.itAtk||0)+(h.itHp||0)+(h.itSpd||0)+(h.itSiege||0)+(h.itRegen||0),0);rep.gold=heroes.map(h=>Math.round(h.gold||0));rep.alive=heroes.map(h=>h.alive);rep.setup=LN.setup;rep.mods=LN.team.map(t=>t.mods);
   damageHero=dh;
   lanesStop('mainmenu');rep.restored=!LN&&typeof save.champions.mago==='object';
   return rep;},{secs:SECS,seed:g});
  console.log(JSON.stringify(r));
  assert.equal(r.ok,true,'arrancó');assert.equal(r.heroes,10,'cinco contra cinco');assert.equal(r.friendly,0,'sin fuego amigo de la horda propia');assert.equal(r.nan,0,'sin daño NaN');
  assert(r.maxLvl>3,'los héroes ganaron experiencia y subieron de nivel');
  assert(r.cardsTaken[0]+r.cardsTaken[1]>=1,'se ofrecieron/eligieron cartas de horda por nivel');
  assert(r.items>0,'los bots compraron objetos en la base');assert(r.kills[0]+r.kills[1]>20,'las hordas combatieron');assert(r.jungle>0,'la selva tiene criaturas');
  assert(r.restored,'guardado real restaurado');
  assert.deepEqual(errs,[],'sin errores de página: '+errs.slice(0,3).join(' | '));
  await p.close();
 }
 await b.close();srv.kill();console.log('PASS lanes sim: '+N+' partidas');
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
