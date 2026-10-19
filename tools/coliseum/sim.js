'use strict';
/* Coliseo (torneo 2v2 de 8 luchadores) en el motor real: torneos completos SIN interfaz (Chromium, reloj virtual).
 * Verifica: el torneo termina con un ganador coherente, los puntos suman lo que se jugó, nadie le pega a su propio equipo,
 * la cuenta regresiva y el fin de duelo protegen a los luchadores, el anillo mata, la cámara espectadora sigue a otro cuando caés,
 * nada tira excepciones ni NaN y el guardado real queda como estaba.
 * Uso: node tools/coliseum/sim.js [torneos=3] [segundos=900] */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const N=Number(process.argv[2])||3,SECS=Number(process.argv[3])||900,PORT=+process.env.LH_PORT||8905,CHAMPS=process.argv.slice(4);
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const context=await b.newContext();
 for(let g=0;g<N;g++){
  const p=await context.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`,{timeout:120000});await p.waitForFunction(()=>typeof colStart==='function'&&typeof update==='function',null,{timeout:60000});
  const r=await p.evaluate(({secs,seed,champion})=>{
   setState('mainmenu');
   const champ=champion||['mago','tanque','soporte','guerrero'][seed%4],ok=colStart({champ,seed:seed+1});
   const rep={ok,champ,actualChampion:player.classKey,friendly:0,nan:0,heroes:heroes.length,protectedHits:0,ringKills:0,specChecked:0,specBad:0,rounds:0,outside:0};
   const dh=damageHero;damageHero=function(h,a,src,pt){const hp0=h&&h.hp,isF=h&&h.team!=null&&src&&!src.isPvp&&src!==h&&lanesTeamOf(src)===h.team;if(!(a>=0))rep.nan++;const r=dh.call(this,h,a,src,pt);if(isF&&h.hp<hp0-0.01)rep.friendly++;if(h&&h.team!=null&&h.hp<hp0-0.01&&LN&&LN.col&&LN.col.phase!=='fight')rep.protectedHits++;return r;};
   const dt=1000/60;let ang=0;
   for(let f=0;f<secs*60&&!LN.ended;f++){
    basicHeld=true;
    if(f%30===0&&player.alive&&LN.col.phase==='fight'){const foe=heroes.find(h=>h.alive&&h.team!==player.team&&h.pit===player.pit);if(foe){const d=Math.hypot(foe.x-player.x,foe.y-player.y)||1;joyVec={x:(foe.x-player.x)/d,y:(foe.y-player.y)/d};}}
    if(f%40===0&&player.alive&&LN.col.phase==='fight'){try{useSkill(0,null);useSkill(1,null);useSkill(2,null);}catch(e){rep.err=String(e&&e.message||e);}}
    const c=LN.col;
    update(dt);rep.frames=(rep.frames||0)+1;
    if(f%30===0){for(const h of heroes){if(![h.x,h.y,h.hp].every(Number.isFinite))rep.nan++;const ctr=colPitCenter(h.pit);if(Math.hypot(h.x-ctr.x,h.y-ctr.y)>COL.PIT_R+2)rep.outside++;}
     if(!player.alive&&c.phase==='fight'){rep.specChecked++;if(!(CAM_SUBJECT&&CAM_SUBJECT.alive&&CAM_SUBJECT!==player))rep.specBad++;}
     if(player.alive&&CAM_SUBJECT)rep.specBad++;}
   }
   rep.rounds=LN.col.round;rep.ended=LN.ended;rep.winner=LN.winner;rep.t=Math.round(LN.t/1000);rep.pts=LN.team.map(t=>t.points);rep.duels=LN.team.map(t=>t.duels);rep.wins=LN.team.map(t=>t.wins);rep.pk=LN.team.map(t=>t.pk);
   damageHero=dh;lanesStop('mainmenu');rep.restored=!LN&&typeof save.champions.mago==='object'&&CAM_SUBJECT===null;
   return rep;},{secs:SECS,seed:g,champion:CHAMPS[g%CHAMPS.length]});
  console.log(JSON.stringify(r));
  assert.equal(r.ok,true,'arrancó');assert.equal(r.actualChampion,r.champ,'campeón solicitado real');assert.equal(r.heroes,8,'ocho luchadores');assert.equal(r.ended,true,'el torneo terminó');
  assert(Math.max(...r.pts)>=3||r.rounds>=9,'alguien llegó a 3 puntos (o se jugaron 9 rondas)');
  assert.equal(r.pts.reduce((a,b)=>a+b,0),r.wins.reduce((a,b)=>a+b,0),'los puntos son las victorias');
  assert(r.duels.every(d=>d===r.rounds),'cada equipo jugó un duelo por ronda');
  assert.equal(r.friendly,0,'sin fuego amigo');assert.equal(r.nan,0,'sin NaN');assert.equal(r.protectedHits,0,'nadie pierde vida en la cuenta regresiva');
  assert.equal(r.outside,0,'nadie sale del foso');assert.equal(r.specBad,0,'cámara espectadora correcta ('+r.specChecked+' muestras)');
  assert(r.restored,'guardado real y cámara restaurados');assert.equal(r.err,undefined,'sin excepciones al lanzar habilidades: '+r.err);
  assert.deepEqual(errs,[],'sin errores de página: '+errs.slice(0,3).join(' | '));
  await p.close();
 }
 await b.close();srv.kill();console.log('PASS coliseo sim: '+N+' torneos');
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
