'use strict';
/* Conquista del Castillo (guerra de clanes, variante del motor real de Guerra de Cristales): partidas completas SIN interfaz, con reloj
 * virtual, contra bots, en los dos roles (ataca / defiende) y las tres dificultades. Verifica: arranca y termina, el castillo tiene la
 * forma prometida (puertas, torres, homenajes, corazón; los atacantes sin torres), las puertas resisten a los héroes, sin NaN ni fuego
 * amigo, el guardado real vuelve intacto, el parte de resultado es el que acepta el servidor (se valida con server/clans.js) y mide
 * la distribución de resultados (NO es un balance entre humanos: son bots).
 * Uso: node tools/lanes/castle-sim.js [partidas por combinación=1] [segundos máximos=720] [--balance]
 *  --balance: solo imprime la tabla de resultados (sin exigir un mínimo de victorias de cada lado). */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const clans=require('../../server/clans.js');
const args=process.argv.slice(2).filter(a=>!a.startsWith('--')),BAL=process.argv.includes('--balance');
const N=Number(args[0])||1,SECS=Number(args[1])||720,PORT=8895;
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const context=await b.newContext();
 const table=[];let n=0;
 for(const side of ['attack','defend'])for(const tier of [1,2,3])for(let g=0;g<N;g++){
  const p=await context.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof lanesStart==='function'&&typeof CASTLE==='object',null,{timeout:60000});
  const seed=1000*tier+g+(side==='defend'?500:0);
  const t0=Date.now();
  const r=await p.evaluate(({secs,side,tier,seed})=>{
   setState('mainmenu');const gold0=save.gold;const lvl0=save.champions.mago&&save.champions.mago.level;
   const ok=lanesStart({champ:['mago','tanque','soporte','guerrero'][seed%4],seed,mode:'castle',castle:{side,tier,clanName:'Cuervos de Ceniza',clanTag:'ccz',rivalIdx:seed}});
   const rep={ok,side,tier,friendly:0,nan:0,frames:0,heroes:heroes.length,gateHeroMult:null};
   // forma del castillo
   const A=LN.team[0].S,D=LN.team[1].S;
   rep.shape={atkTowersAlive:A.filter(s=>s.kind==='tower'&&s.alive).length,atkBanner:A.filter(s=>s.castle==='banner'&&s.alive).length,gates:D.filter(s=>s.castle==='gate').length,towers:D.filter(s=>s.castle==='tower').length,keeps:D.filter(s=>s.castle==='keep').length,heart:D.filter(s=>s.castle==='heart').length,gatesFire:D.filter(s=>s.castle==='gate'&&!s.noFire).length};
   rep.myTeam=player.team;rep.names=[castleTeamLabel(0),castleTeamLabel(1)];
   // las puertas resisten a los héroes (55 %) y los homenajes no
   const gate=D.find(s=>s.castle==='gate'),tower=D.find(s=>s.castle==='tower');
   rep.gateMult=castleDmgMult(gate._lnProxy||{lanesProxy:true,kind:'struct',lnRef:gate});rep.towerMult=castleDmgMult({lanesProxy:true,kind:'struct',lnRef:tower});
   const dh=damageHero;damageHero=function(h,a,src,pt){const hp0=h&&h.hp,isF=h&&h.team!=null&&src&&!src.isPvp&&src!==h&&!h.isStruct&&lanesTeamOf(src)===h.team;if(!(a>=0))rep.nan++;const r=dh.call(this,h,a,src,pt);if(isF&&h.hp<hp0-0.01)rep.friendly++;return r;};
   const dt=1000/60;rep.maxEnemies=0;rep.gatesDownAt=null;rep.firstBreachAt=null;rep.maxLvl=0;
   for(let f=0;f<secs*60&&!LN.ended;f++){
    basicHeld=true;update(dt);rep.frames++;
    if(f%30===0){rep.maxEnemies=Math.max(rep.maxEnemies,enemies.length);rep.maxLvl=Math.max(rep.maxLvl,...heroes.map(h=>h.mlvl||0));
      if(rep.gatesDownAt==null&&D.some(s=>s.castle==='gate'&&!s.alive))rep.gatesDownAt=Math.round(LN.t/1000);
      if(rep.firstBreachAt==null&&D.some(s=>s.castle==='keep'&&!s.alive))rep.firstBreachAt=Math.round(LN.t/1000);}
    if(LN.t>20000&&f%600===0&&!LN.ended){for(const k of ['repair','ward','swarm','brute']){if(lanesBuy(player.team,k,player))break;}}
   }
   damageHero=dh;
   rep.ended=LN.ended;rep.winner=LN.winner;rep.why=LN.why;rep.t=Math.round(LN.t/1000);rep.wave=LN.wave;rep.report=LN.castleReport||null;
   rep.counts=LN.ended?castleCounts():null;rep.pk=LN.team.map(t=>t.pk);rep.kills=LN.team.map(t=>t.kills);
   rep.hp=D.map(s=>Math.round(s.hp));
   lanesStop('mainmenu');rep.restored=!LN&&save.gold===gold0&&(save.champions.mago&&save.champions.mago.level)===lvl0;
   return rep;},{secs:SECS,side,tier,seed});
  const wall=((Date.now()-t0)/1000).toFixed(0);
  const won=r.report&&r.report.result==='win';
  console.log(JSON.stringify({side,tier,seed,ended:r.ended,winner:r.winner,why:r.why,t:r.t,result:r.report&&r.report.result,gatesDownAt:r.gatesDownAt,firstBreachAt:r.firstBreachAt,pk:r.pk,wave:r.wave,maxLvl:r.maxLvl,maxEnemies:r.maxEnemies,wall:wall+'s'}));
  table.push({side,tier,won:!!won,atkWon:r.winner===0,t:r.t,why:r.why});
  assert.equal(r.ok,true,'arrancó');assert.equal(r.heroes,10);assert.equal(r.myTeam,side==='attack'?0:1,'el jugador está del lado elegido');
  assert.deepEqual(r.shape,{atkTowersAlive:0,atkBanner:1,gates:3,towers:3,keeps:3,heart:1,gatesFire:0},'forma del castillo');
  assert(r.names[0].includes('ASEDIO')&&r.names[1].includes('CASTILLO'),'etiquetas '+r.names);
  assert.equal(r.gateMult,0.55,'la puerta resiste a los héroes');assert.equal(r.towerMult,1,'la torre no');
  assert.equal(r.friendly,0,'sin fuego amigo');assert.equal(r.nan,0,'sin NaN');assert(r.maxEnemies<=300,'límite de criaturas');
  assert(r.restored,'guardado real restaurado');
  assert(r.ended,'la partida terminó dentro de '+SECS+' s virtuales (límite del castillo '+11*60+' s)');assert(r.t<=11*60+2,'no pasa del tiempo límite del castillo: '+r.t);
  assert(['cristal','estandarte','resistencia'].includes(r.why),'motivo '+r.why);
  assert.equal(r.winner===0,r.why==='cristal','solo el corazón caído da la victoria a los atacantes');
  if(r.why==='resistencia')assert(r.t>=11*60-1,'resistir = llegar al tiempo límite');
  const v=clans.validateWarReport(Object.assign({},r.report,{durationMs:Math.max(r.report.durationMs,120000)}));assert(v.ok,'el parte lo acepta el servidor: '+JSON.stringify(v));
  assert.equal(r.report.role,side);assert.equal(r.report.tier,tier);assert.equal(r.report.opponent,'bots');assert.match(r.report.matchId,/^cw-[0-9a-f]{24}$/);
  assert.deepEqual(errs,[],'sin errores de página: '+errs.slice(0,3).join(' | '));
  await p.close();n++;
 }
 await b.close();srv.kill();
 const sum=(f)=>{const rows=table.filter(f);return rows.length?Math.round(100*rows.filter(x=>x.won).length/rows.length)+'% ('+rows.filter(x=>x.won).length+'/'+rows.length+')':'-';};
 const atk=table.filter(x=>x.atkWon).length;
 console.log('Victorias del jugador: ataca '+sum(x=>x.side==='attack')+' · defiende '+sum(x=>x.side==='defend')+' · tier1 '+sum(x=>x.tier===1)+' · tier2 '+sum(x=>x.tier===2)+' · tier3 '+sum(x=>x.tier===3));
 console.log('Ganan los atacantes en '+atk+'/'+table.length+' partidas; duración media '+Math.round(table.reduce((a,x)=>a+x.t,0)/table.length)+' s');
 if(!BAL&&N>=2){assert(atk>0,'los atacantes ganan alguna vez');assert(atk<table.length,'los defensores ganan alguna vez');}
 console.log('PASS castle sim: '+n+' partidas');
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
