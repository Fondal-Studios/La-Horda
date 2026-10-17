'use strict';
/* Bots orientados a victoria — simulación headless en el motor real (Chromium, reloj virtual, sin interfaz).
 * Mide A/B si los bots se distraen con mobs irrelevantes y si eso cuesta partidas.
 *
 * Uso: node tools/bots/victory-sim.js [cw|col] [partidas=6] [segundos=420] [--cfg=legacy|victory|h2h] [--seed0=n] [--json] [--root=dir]
 *   legacy  = todos los equipos con el cerebro anterior (globalThis.BOT_VICTORY_TEAMS = [])
 *   victory = todos con el cerebro orientado a victoria
 *   h2h     = victoria contra legacy en la MISMA partida (se alternan los lados por semilla)
 * Guerra de Cristales (cw): % de golpes/daño de los bots a objetivos relevantes (héroes, estructuras, épicos) frente a súbditos y
 *   campamentos de la selva, golpes "desviados" (a un mob teniendo en alcance un héroe/estructura expuesta), tiempo con objetivo
 *   irrelevante, daño a estructuras, bajas, torres, ganador. Coliseo (col): daño a rivales, duelos ganados, muertes, anillo.
 * Los jugadores humanos no participan: el héroe del jugador lo conduce el mismo cerebro (y se excluye de las métricas). */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');
const args=process.argv.slice(2),flag=(n,d)=>{const a=args.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:d;};
const pos=args.filter(x=>!x.startsWith('--'));
const MODE=pos[0]==='col'?'col':'cw',N=Number(pos[1])||6,SECS=Number(pos[2])||(MODE==='col'?900:420),CFG=flag('cfg','victory'),JSON_OUT=args.includes('--json'),SEED0=Number(flag('seed0','0'));
const ROOT=path.resolve(flag('root',path.resolve(__dirname,'../..'))),PORT=8911+Math.floor(Math.random()*60);
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:ROOT,stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const context=await b.newContext();
 const runs=[];
 for(let g=0;g<N;g++){
  const p=await context.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`,{waitUntil:'domcontentloaded',timeout:180000});await p.waitForFunction(()=>typeof lanesStart==='function'&&typeof colStart==='function'&&typeof update==='function',null,{timeout:180000});
  const r=await p.evaluate(({secs,seed,mode,cfg})=>{
   setState('mainmenu');
   // qué equipos usan el cerebro nuevo (el motor lo lee en globalThis.BOT_VICTORY_TEAMS; sin definir = todos)
   const nT=mode==='col'?4:2,swap=seed%2===1;
   const vt=cfg==='legacy'?[]:cfg==='victory'?[...Array(nT).keys()]:(mode==='col'?(swap?[1,3]:[0,2]):(swap?[1]:[0]));
   globalThis.BOT_VICTORY_TEAMS=vt;
   const champs=['mago','tanque','soporte','guerrero'];
   const ok=mode==='col'?colStart({champ:champs[seed%4],seed:seed+1}):lanesStart({champ:champs[seed%4],seed:seed+1});
   const mk=()=>({hits:{hero:0,struct:0,epic:0,minion:0,camp:0},dmg:{hero:0,struct:0,epic:0,minion:0,camp:0},distracted:0,distractable:0,campByLaner:0,campByLanerBasic:0,basicHits:0,basicRel:0,deaths:0,tgt:{hero:0,struct:0,epic:0,minion:0,camp:0,none:0},st:{}});
   const M=[...Array(nT)].map(mk);
   const isBot=h=>h&&h!==player&&heroes.includes(h);
   const cat=e=>{ if(e.lanesProxy) return e.kind==='hero'?'hero':'struct'; if(e.team===2) return e.epicId!=null?'epic':'camp'; return 'minion'; };
   const rng=h=>(h.cls&&h.cls.basicRange)||120;
   const betterIn=(h)=>{ const R=rng(h)+40; for(const e of enemies){ if(!e.alive||e.team===h.team) continue; if(!e.lanesProxy) continue; if(e.kind==='hero'){ if(Math.hypot(e.x-h.x,e.y-h.y)<=R) return true; } else if(e.lnRef&&lanesExposed(e.lnRef)&&Math.hypot(e.x-h.x,e.y-h.y)<=R+e.radius) return true; } return false; };
   const de=damageEnemy;
   damageEnemy=function(e,amount,opts){
    const src=(opts&&opts.src)||(LN&&LN.cur)||player;
    if(isBot(src)&&e&&e.alive&&src.team!=null&&e.team!==src.team&&mode==='cw'){
     let blocked=false;try{blocked=lanesBlocksDamage(e,src);}catch(_){}
     if(!blocked){ const c=cat(e),m=M[src.team],eff=amount*(lanesDmgMult?lanesDmgMult(e,src):1);
      m.hits[c]++;m.dmg[c]+=eff;
      if(c==='minion'||c==='camp'){ m.distractable++; if(betterIn(src)) m.distracted++; }
      if(c==='camp'&&src.ln!==-1){ m.campByLaner++; if(opts&&opts.fromBasic) m.campByLanerBasic++; } if(opts&&opts.fromBasic){ m.basicHits++; if(c==='hero'||c==='struct'||c==='epic') m.basicRel++; } }
    } else if(isBot(src)&&mode==='col'&&e&&e.lanesProxy&&e.kind==='hero'&&e.team!==src.team){ const m=M[src.team]; m.hits.hero++; m.dmg.hero+=amount; }
    return de.apply(this,arguments);
   };
   const ring=[0,0,0,0];
   const dh=damageHero;damageHero=function(h,a,src,pt){ if(mode==='col'&&src&&src.isPvp&&src.from===null&&h&&h.team!=null&&h!==player) ring[h.team]+=a; return dh.apply(this,arguments); };
   const dt=1000/60,wasAlive=new Map();let frames=0,firstTower=[null,null],aiTime=0;
   for(let f=0;f<secs*60&&!LN.ended;f++){
    // el héroe del jugador usa el mismo cerebro que los bots (si no, el equipo 0 tendría una estatua)
    if(player&&player.alive){ try{ player._bot=true; const bm=botMove(player,dt); joyVec={x:bm.mx||0,y:bm.my||0}; if(f%40===0) botTryAbilities(player); basicHeld=true; }catch(e){ globalThis.__err=String(e&&e.stack||e); } }
    const t0=performance.now(); update(dt); aiTime+=performance.now()-t0; frames++;
    if(f%15===0){
     for(const h of heroes){ if(!isBot(h)) continue; const was=wasAlive.get(h); if(was&&!h.alive) M[h.team].deaths++; wasAlive.set(h,h.alive);
      if(!h.alive||!M[h.team]) continue; const t=h._tgt; let c='none'; if(t&&t.alive) c=cat(t); M[h.team].tgt[c]++; const s=h._ai?(h._ai.state+(h._ai.why?':'+h._ai.why:'')):'-'; M[h.team].st[s]=(M[h.team].st[s]||0)+1; } }
    if(mode==='cw'){ for(const T of [0,1]){ if(firstTower[T]===null&&lanesTowersAlive(1-T)<9) firstTower[T]=Math.round(LN.t/1000); } }
   }
   const rep={ok,cfg,vt,mode,swap,t:Math.round(LN.t/1000),ended:LN.ended,winner:LN.winner,M,ring,err:globalThis.__err||null,frames,msPerFrame:+(aiTime/frames).toFixed(3)};
   if(mode==='cw'){ rep.towers=[9-lanesTowersAlive(0),9-lanesTowersAlive(1)]; rep.crystal=LN.team.map(t=>Math.round(t.S[9].hp)); rep.pk=LN.team.map(t=>t.pk); rep.minionKills=LN.team.map(t=>t.kills); rep.firstTower=firstTower; }
   else { rep.pts=LN.team.map(t=>t.points); rep.wins=LN.team.map(t=>t.wins); rep.pk=LN.team.map(t=>t.pk); rep.rounds=LN.col.round; }
   damageEnemy=de;damageHero=dh;lanesStop('mainmenu');return rep;},{secs:SECS,seed:g+SEED0,mode:MODE,cfg:CFG});
  if(errs.length)r.pageErrors=errs.slice(0,3);
  runs.push(r);if(!JSON_OUT)console.error(`partida ${g+1}/${N} t=${r.t}s ganador=${r.winner} ${r.err?'ERR '+r.err.slice(0,200):''}`);
  await p.close();
 }
 await b.close();srv.kill();
 // ---- agregado ----
 const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0),pct=(a,b)=>b?Math.round(a/b*1000)/10:0;
 const out={mode:MODE,cfg:CFG,games:N,secs:SECS};
 // lado "nuevo" y "legacy" de cada partida: en victory/legacy son todos los equipos; en h2h, los listados en vt
 const sides=(r)=>{const n=r.M.length,all=[...Array(n).keys()];const nw=r.vt;return {nw,old:all.filter(i=>!nw.includes(i))};};
 const agg=(sel)=>{const a={hits:{hero:0,struct:0,epic:0,minion:0,camp:0},dmg:{hero:0,struct:0,epic:0,minion:0,camp:0},distracted:0,distractable:0,campByLaner:0,campByLanerBasic:0,basicHits:0,basicRel:0,deaths:0,tgt:{hero:0,struct:0,epic:0,minion:0,camp:0,none:0},st:{}};
  for(const r of runs)for(const i of sel(sides(r))){const m=r.M[i];for(const k in a.hits){a.hits[k]+=m.hits[k];a.dmg[k]+=m.dmg[k];a.tgt[k]+=m.tgt[k];}a.tgt.none+=m.tgt.none;a.distracted+=m.distracted;a.distractable+=m.distractable;a.campByLaner+=m.campByLaner;a.campByLanerBasic+=m.campByLanerBasic;a.basicHits+=m.basicHits;a.basicRel+=m.basicRel;a.deaths+=m.deaths;for(const s in m.st)a.st[s]=(a.st[s]||0)+m.st[s];}
  const H=a.hits,D=a.dmg,T=a.tgt,tot=Object.values(H).reduce((x,y)=>x+y,0),dt=Object.values(D).reduce((x,y)=>x+y,0),tt=Object.values(T).reduce((x,y)=>x+y,0);
  return {golpes:tot,pct_golpes_relevantes:pct(H.hero+H.struct+H.epic,tot),pct_golpes_a_mobs:pct(H.minion+H.camp,tot),pct_dano_relevante:pct(D.hero+D.struct+D.epic,dt),
   dano_a_estructuras_por_partida:Math.round(D.struct/N),dano_a_heroes_por_partida:Math.round(D.hero/N),golpes_a_campamentos_por_laner:Math.round(a.campByLaner/N),de_ellos_ataque_basico:Math.round(a.campByLanerBasic/N),pct_ataques_basicos_relevantes:pct(a.basicRel,a.basicHits),
   golpes_desviados:a.distracted,pct_mobs_golpeados_con_algo_mejor_en_alcance:pct(a.distracted,a.distractable),
   pct_tiempo_objetivo_relevante:pct(T.hero+T.struct+T.epic,tt),pct_tiempo_objetivo_mob:pct(T.minion+T.camp,tt),pct_tiempo_sin_objetivo:pct(T.none,tt),
   muertes_por_partida:+(a.deaths/N).toFixed(1),estados:a.st};};
 if(MODE==='cw'){
  const nw=agg(s=>s.nw),old=agg(s=>s.old);
  out.victoria=CFG==='legacy'?null:nw;out.legacy=CFG==='victory'?null:old;
  const res={w:0,l:0,d:0,tNew:0,tOld:0};
  for(const r of runs){const s=sides(r);res.tNew+=sum(s.nw,i=>r.towers[1-i]);res.tOld+=sum(s.old,i=>r.towers[1-i]);}
  out.torres_derribadas_por_partida={victoria:+(res.tNew/N).toFixed(2),legacy:+(res.tOld/N).toFixed(2)};
  if(CFG==='h2h'){for(const r of runs){const s=sides(r);if(r.winner===-1)res.d++;else if(s.nw.includes(r.winner))res.w++;else res.l++;}out.h2h={victorias_nuevo:res.w,victorias_legacy:res.l,sin_ganador:res.d};}
  else out.ganadores=runs.map(r=>r.winner);
  out.duracion_media_s=Math.round(sum(runs,r=>r.t)/N);out.ms_por_cuadro_update=+(sum(runs,r=>r.msPerFrame)/N).toFixed(2);
 } else {
  const nw={dano:0,duelos:0,puntos:0,muertes:0,anillo:0,pk:0},old={dano:0,duelos:0,puntos:0,muertes:0,anillo:0,pk:0};
  for(const r of runs){const s=sides(r);for(const [set,o] of [[s.nw,nw],[s.old,old]])for(const i of set){o.dano+=r.M[i].dmg.hero;o.duelos+=r.wins[i];o.puntos+=r.pts[i];o.muertes+=r.M[i].deaths;o.anillo+=r.ring[i];o.pk+=r.pk[i];}}
  const f=o=>({dano_a_rivales_por_torneo:Math.round(o.dano/N),duelos_ganados:o.duelos,puntos:o.puntos,muertes_por_torneo:+(o.muertes/N).toFixed(1),dano_del_anillo_por_torneo:Math.round(o.anillo/N),bajas:o.pk});
  out.victoria=CFG==='legacy'?null:f(nw);out.legacy=CFG==='victory'?null:f(old);out.torneos_terminados=runs.filter(r=>r.ended).length;out.duracion_media_s=Math.round(sum(runs,r=>r.t)/N);
 }
 out.errores=runs.filter(r=>r.err||r.pageErrors).map(r=>r.err||r.pageErrors);
 console.log(JSON.stringify(out,null,JSON_OUT?0:1));
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
