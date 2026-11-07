'use strict';
/* Simulación reproducible de balance de Build Evolution 2.0 (piloto automático real, Bosque, nivel 20,
   hitos de evolución Nv.5, 8 semillas x 150 s, mismas partidas que tools/balance/known-champion-sim.js).
   Por campeón compara: sin rama (base) vs cada rama vs el techo por rol de docs/balance/champion-entry-reference.json.
   Mide también costo de CPU por paso de simulación. Uso: SITE=http://127.0.0.1:8771 node tools/build-evolution/sim-balance.js [salida.json] */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');const {openGame,ROOT}=require('./lib');
(async()=>{const {browser,page,errors}=await openGame();
 const ref=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/balance/champion-entry-reference.json'),'utf8'));
 const only=(process.env.CHAMPS||'').split(',').filter(Boolean);
 const plans=await page.evaluate(()=>[...new Set(SYN_BRANCHES.map(b=>b.champ))].map(k=>({k,role:CLASSES[k].roleCategory,branches:SYN_BRANCHES.filter(b=>b.champ===k).map(b=>({id:b.id,skill:b.skill}))}))).then(a=>a.filter(p=>!only.length||only.includes(p.k)));
 const runs=[],SEEDS=(process.env.SEEDS||'117,431,991,1303,2111,3571,4423,5381').split(',').map(Number);
 await page.evaluate(()=>{__AP.start('tanque','bosque',1);__AP.sim(20000,33.333);__AP.on=false;}); // calentamiento (JIT) fuera de la medición
 for(const pl of plans)for(const seed of SEEDS)for(const br of [null,...pl.branches]){
  runs.push(await page.evaluate(([k,br,seed])=>{
   let n=seed;Math.random=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};netMatch=null;save.stash=[];save.relics={hp:0,dmg:0,def:0,vel:0};
   for(const c in save.champions){const s=save.champions[c];s.unlocked=true;s.level=20;s.xp=0;s.equipment={};s.inventory=[];s.talents={nodes:{},mastery:null,masteryNodes:{}};s.skillMastery=[0,1,2].map(()=>({...mkMastery(),alloc:5}));s.ultMastery={...mkMastery(),alloc:5};}
   lobbyAllies=['tanque','soporte','mago'].map(c=>c===k?'guerrero':c);__AP.start(k,'bosque',1);
   player.synergy=br?{[br.skill]:br.id}:undefined;
   const t0=performance.now();__AP.sim(150000,33.333);const ms=performance.now()-t0;__AP.on=false;
   const team=heroes.filter(h=>h!==player);
   const out={key:k,branch:br?br.id:'base',seed,damage:Math.round(player.stats.dmgDealt),alive:player.alive,hp:Math.round(player.hp),casts:player.stats.skillCasts,
    teamTaken:Math.round(team.reduce((s,h)=>s+(h.stats?h.stats.dmgTaken:0),0)),taken:Math.round(player.stats.dmgTaken||0),healing:Math.round(player.stats.healingDone||0),cpuMs:Math.round(ms),error:__AP.err||null};setState('paused');return out;
  },[pl.k,br,seed]));process.stdout.write('.');
 }
 const m=(rs,f)=>Math.round(rs.reduce((s,r)=>s+r[f],0)/rs.length);
 const se=(rs,f)=>{const a=rs.map(r=>r[f]),mu=a.reduce((x,y)=>x+y,0)/a.length;return Math.sqrt(a.reduce((x,y)=>x+(y-mu)**2,0)/Math.max(1,a.length-1)/a.length);};
 const summary=[];
 for(const pl of plans){const base=runs.filter(r=>r.key===pl.k&&r.branch==='base');const ceil=Math.round(ref.roles[pl.role].simulation.meanDamage150s*1.35);
  for(const id of ['base',...pl.branches.map(b=>b.id)]){const rs=runs.filter(r=>r.key===pl.k&&r.branch===id);
   summary.push({champ:pl.k,branch:id,dmg:m(rs,'damage'),dmgVsBase:+((m(rs,'damage')/m(base,'damage')-1)*100).toFixed(1),dmgSEpct:+(se(rs,'damage')/m(base,'damage')*100).toFixed(1),taken:m(rs,'taken'),takenVsBase:+((m(rs,'taken')/Math.max(1,m(base,'taken'))-1)*100).toFixed(1),healing:m(rs,'healing'),survived:rs.filter(r=>r.alive).length+'/'+rs.length,cpuMs:m(rs,'cpuMs'),ceiling:ceil,underCeiling:m(rs,'damage')<=ceil,errors:rs.filter(r=>r.error).length});}}
 console.log('\n');console.table(summary);
 const dm=summary.filter(s=>s.branch!=='base');
 const verdict={maxDmgGainPct:Math.max(...dm.map(s=>s.dmgVsBase)),minDmgPct:Math.min(...dm.map(s=>s.dmgVsBase)),allUnderCeiling:dm.every(s=>s.underCeiling),errors:dm.reduce((a,s)=>a+s.errors,0)+errors.length,
  cpuOverheadPct:+((dm.reduce((a,s)=>a+s.cpuMs,0)/dm.length)/(summary.filter(s=>s.branch==='base').reduce((a,s)=>a+s.cpuMs,0)/plans.length)*100-100).toFixed(1)};
 console.log(JSON.stringify(verdict));
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({site:process.env.SITE||'http://127.0.0.1:8771',dataSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'js/data/build-synergy.js'))).digest('hex'),seeds:SEEDS,champs:plans.map(p=>p.k),verdict,summary,runs,errors},null,1)+'\n');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
