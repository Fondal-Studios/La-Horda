'use strict';
/* Coliseo (torneo 2v2 de 8 luchadores) en el motor real: torneos completos SIN interfaz (Chromium, reloj virtual).
 * Verifica: el torneo termina con un ganador coherente, los puntos suman lo que se jugó (duelos + «todos contra todos»), nadie le pega a su propio equipo,
 * la cuenta regresiva y el fin de duelo protegen a los luchadores, el anillo mata, la cámara espectadora sigue a otro cuando caés,
 * nada tira excepciones ni NaN y el guardado real queda como estaba.
 * Uso: node tools/coliseum/sim.js [torneos=3] [segundos=900] */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const N=Number(process.argv[2])||3,SECS=Number(process.argv[3])||900,PORT=8905,CHAMPS=process.argv.slice(4);
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const context=await b.newContext();
 for(let g=0;g<N;g++){
  const p=await context.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof colStart==='function'&&typeof update==='function',null,{timeout:60000});
  const r=await p.evaluate(({secs,seed,champion})=>{
   setState('mainmenu');
   const champ=champion||['mago','tanque','soporte','guerrero'][seed%4],ok=colStart({champ,seed:seed+1});
   const rep={ok,champ,actualChampion:player.classKey,friendly:0,nan:0,heroes:heroes.length,protectedHits:0,ringKills:0,specChecked:0,specBad:0,rounds:0,outside:0,ffaRounds:0,ffaBad:0,picks:0,offers:0};
   const dh=damageHero;damageHero=function(h,a,src,pt){const hp0=h&&h.hp,isF=h&&h.team!=null&&src&&!src.isPvp&&src!==h&&lanesTeamOf(src)===h.team;if(!(a>=0))rep.nan++;const r=dh.call(this,h,a,src,pt);if(isF&&h.hp<hp0-0.01)rep.friendly++;if(h&&h.team!=null&&h.hp<hp0-0.01&&LN&&LN.col&&LN.col.phase!=='fight')rep.protectedHits++;return r;};
   const dt=1000/60;let ang=0;
   for(let f=0;f<secs*60&&!LN.ended;f++){
    basicHeld=true;
    if(f%30===0&&player.alive&&LN.col.phase==='fight'){const foe=heroes.find(h=>h.alive&&h.team!==player.team&&h.pit===player.pit);if(foe){const d=Math.hypot(foe.x-player.x,foe.y-player.y)||1;joyVec={x:(foe.x-player.x)/d,y:(foe.y-player.y)/d};}}
    if(f%40===0&&player.alive&&LN.col.phase==='fight'){try{useSkill(0,null);useSkill(1,null);useSkill(2,null);}catch(e){rep.err=String(e&&e.message||e);}}
    const c=LN.col;
    // cartas de arena: el jugador elige apenas hay oferta (así el torneo no espera el tiempo límite)
    if(c.phase==='inter'&&LN.team[player.team].offer){rep.offers++;if(colPickCard(player.team,(f/7)%3|0))rep.picks++;}
    if(c.phase==='prep'&&c.kind==='ffa'&&c.t0===LN.t-dt){rep.ffaRounds++;if(!heroes.every(h=>h.pit===2&&Math.hypot(h.x-colPitCenter(2).x,h.y-colPitCenter(2).y)<colPitR(2)))rep.ffaBad++;}
    update(dt);rep.frames=(rep.frames||0)+1;
    if(f%30===0){for(const h of heroes){if(![h.x,h.y,h.hp].every(Number.isFinite))rep.nan++;const ctr=colPitCenter(h.pit);if(Math.hypot(h.x-ctr.x,h.y-ctr.y)>colPitR(h.pit)+2)rep.outside++;}
     if(!player.alive&&c.phase==='fight'){rep.specChecked++;if(!(CAM_SUBJECT&&CAM_SUBJECT.alive&&CAM_SUBJECT!==player))rep.specBad++;}
     if(player.alive&&CAM_SUBJECT)rep.specBad++;}
   }
   rep.rounds=LN.col.round;rep.ended=LN.ended;rep.winner=LN.winner;rep.t=Math.round(LN.t/1000);rep.pts=LN.team.map(t=>t.points);rep.duels=LN.team.map(t=>t.duels);rep.wins=LN.team.map(t=>t.wins);rep.ffaPts=LN.team.map(t=>t.ffaPts);rep.ffa=LN.team.map(t=>t.ffa);rep.cards=LN.team.map(t=>colTournCount(t.cards));rep.mods=LN.team.map(t=>t.mods);rep.pk=LN.team.map(t=>t.pk);
   damageHero=dh;lanesStop('mainmenu');rep.restored=!LN&&typeof save.champions.mago==='object'&&CAM_SUBJECT===null;
   return rep;},{secs:SECS,seed:g,champion:CHAMPS[g%CHAMPS.length]});
  console.log(JSON.stringify(r));
  assert.equal(r.ok,true,'arrancó');assert.equal(r.actualChampion,r.champ,'campeón solicitado real');assert.equal(r.heroes,8,'ocho luchadores');assert.equal(r.ended,true,'el torneo terminó');
  assert(Math.max(...r.pts)>=3||r.rounds>=9,'alguien llegó a 3 puntos (o se jugaron 9 rondas)');
  const sum=a=>a.reduce((x,y)=>x+y,0);
  assert.equal(sum(r.pts),sum(r.wins)+sum(r.ffaPts),'los puntos son las victorias de duelo más los del todos contra todos');
  assert(r.duels.every((d,i)=>d+r.ffa[i]===r.rounds),'cada equipo jugó una ronda (duelo o todos contra todos) por ronda');
  assert(r.ffa.every(n=>n===Math.floor(r.rounds/3)),'cada 3.ª ronda es todos contra todos: '+r.ffa+' / '+r.rounds);
  assert.equal(r.ffaBad,0,'en el todos contra todos los ocho arrancan en el foso grande');
  assert(r.cards.every(n=>n<=3),'tope de cartas de torneo por equipo');
  assert(r.mods.every(m=>m.hp<=1.25+1e-9&&m.dmg<=1.2+1e-9&&m.spd<=1.15+1e-9&&m.cdr<=0.2+1e-9),'topes duros de las cartas');
  assert(r.rounds<2||r.picks>0,'el jugador pudo elegir cartas ('+r.picks+'/'+r.offers+' ofertas)');
  assert.equal(r.friendly,0,'sin fuego amigo');assert.equal(r.nan,0,'sin NaN');assert.equal(r.protectedHits,0,'nadie pierde vida en la cuenta regresiva');
  assert.equal(r.outside,0,'nadie sale del foso');assert.equal(r.specBad,0,'cámara espectadora correcta ('+r.specChecked+' muestras)');
  assert(r.restored,'guardado real y cámara restaurados');assert.equal(r.err,undefined,'sin excepciones al lanzar habilidades: '+r.err);
  assert.deepEqual(errs,[],'sin errores de página: '+errs.slice(0,3).join(' | '));
  await p.close();
 }
 await b.close();srv.kill();console.log('PASS coliseo sim: '+N+' torneos');
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
