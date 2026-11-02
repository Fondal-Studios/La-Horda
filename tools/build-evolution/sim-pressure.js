'use strict';
/* Simulación BAJO PRESIÓN para validar ramas defensivas (la sim de 150 s en nivel 1 no distingue: 8/8 sobreviven).
   Nivel de arena alto, sin aliados que absorban, 90 s, N semillas. Mide la FRACCIÓN DE VIDA media y mínima
   (muestreada cada segundo, escudo incluido como vida efectiva) y muertes. Una rama defensiva debe mejorar la
   vida efectiva media y/o reducir muertes frente a la base, sin otra pérdida mayor de daño.
   Uso: LEVEL=12 SEEDS=... node tools/build-evolution/sim-pressure.js [salida.json] */
const fs=require('node:fs');const {openGame}=require('./lib');
(async()=>{const {browser,page,errors}=await openGame();
 const LEVEL=+(process.env.LEVEL||12),SEEDS=(process.env.SEEDS||'117,431,991,1303,2111,3571,4423,5381').split(',').map(Number);
 const plans=await page.evaluate(()=>[...new Set(SYN_BRANCHES.map(b=>b.champ))].map(k=>({k,branches:SYN_BRANCHES.filter(b=>b.champ===k).map(b=>({id:b.id,skill:b.skill,arch:b.arch}))})));
 await page.evaluate(()=>{__AP.start('tanque','bosque',1);__AP.sim(15000,33.333);__AP.on=false;});
 const runs=[];
 for(const pl of plans)for(const seed of SEEDS)for(const br of [null,...pl.branches]){
  runs.push(await page.evaluate(([k,br,seed,LEVEL])=>{
   let n=seed;Math.random=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};netMatch=null;save.stash=[];save.relics={hp:0,dmg:0,def:0,vel:0};
   for(const c in save.champions){const s=save.champions[c];s.unlocked=true;s.level=20;s.xp=0;s.equipment={};s.inventory=[];s.talents={nodes:{},mastery:null,masteryNodes:{}};s.skillMastery=[0,1,2].map(()=>({...mkMastery(),alloc:5}));s.ultMastery={...mkMastery(),alloc:5};}
   lobbyAllies=[];__AP.start(k,'bosque',LEVEL);player.synergy=br?{[br.skill]:br.id}:undefined;
   let sum=0,N=0,min=1,t=0;
   for(let s=0;s<90;s++){__AP.sim(1000,33.333);if(state!=="playing")break;const f=Math.min(1,(player.hp+(player.shield||0))/player.maxHp);sum+=f;N++;min=Math.min(min,f);if(!player.alive)break;}
   const out={key:k,branch:br?br.id:'base',arch:br?br.arch:'base',seed,alive:player.alive,meanEff:N?sum/N:0,minEff:min,damage:Math.round(player.stats.dmgDealt),err:__AP.err||null};setState('paused');return out;
  },[pl.k,br,seed,LEVEL]));process.stdout.write('.');
 }
 const avg=(rs,f)=>rs.reduce((s,r)=>s+r[f],0)/rs.length;
 const se=(rs,f)=>{const m=avg(rs,f);return Math.sqrt(rs.reduce((s,r)=>s+(r[f]-m)**2,0)/Math.max(1,rs.length-1)/rs.length);};
 const summary=[];
 for(const pl of plans){const base=runs.filter(r=>r.key===pl.k&&r.branch==='base');
  for(const id of ['base',...pl.branches.map(b=>b.id)]){const rs=runs.filter(r=>r.key===pl.k&&r.branch===id);
   summary.push({champ:pl.k,branch:id,arch:rs[0].arch,meanEff:+avg(rs,'meanEff').toFixed(3),effSE:+se(rs,'meanEff').toFixed(3),effVsBase:+((avg(rs,'meanEff')-avg(base,'meanEff'))*100).toFixed(1),minEff:+avg(rs,'minEff').toFixed(3),deaths:rs.filter(r=>!r.alive).length+'/'+rs.length,dmgVsBase:+((avg(rs,'damage')/Math.max(1,avg(base,'damage'))-1)*100).toFixed(1),errors:rs.filter(r=>r.error).length});}}
 console.log('\nnivel',LEVEL,'semillas',SEEDS.length);console.table(summary);
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({level:LEVEL,seeds:SEEDS,summary,errors},null,1)+'\n');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
