'use strict';
/* Potencial de limpieza de horda por campeón (herramienta de desarrollo, no forma parte del juego).
   Motor REAL en Chromium con el piloto automático de tools/balance/autopilot.js, mismo escenario para todos
   (Bosque, mismo nivel de campeón, mismo equipo salvo duplicados, sin equipo ni talentos) y semillas fijas.
   Por campeón y semilla mide, en una ventana de DURATION_MS:
     kills        bajas PERSONALES del jugador (player.stats.kills)
     teamKills    bajas del grupo (referencia de saturación: la horda es finita por oleada)
     dmg          daño útil del jugador
     areaDmg      daño de habilidades (no básicos ni procs) en golpes que alcanzan >= AREA_MIN enemigos distintos
                  dentro de una ventana de 150 ms
     areaHits     cuántos enemigos alcanzaron esos golpes
   Repite SEEDS veces y toma la MEDIANA. Agrupa por rol (roleCategory) y compara con la mediana de su rol,
   no con la global (AGENTS.md). El conjunto de referencia del rol son los campeones aprobados
   (docs/balance/champion-entry-reference.json -> knownChampions); los candidatos se miden y se marcan pero no
   mueven la mediana. Extremos = fuera de +-OUTLIER (35 %) de la mediana del rol en kills.
   Uso: SITE=http://127.0.0.1:8931 [KEYS=a,b] [DURATION_MS=45000] [LEVEL=20] [SEEDS=117,431,991,577,2027]
        node tools/balance/clear-potential.js [salida.json]
   Paralelo: SHARD=i/n (por ejemplo 0/4 ... 3/4) y luego MERGE=a.json,b.json,... node ... salida.json
   Navegador: CHROMIUM_PATH o el de Playwright. Las semillas fijan Math.random; el tiempo de cuadros y los
   efectos pueden consumir azar entre bloques, así que es reproducible por procedimiento, no bit a bit. */
const fs=require('node:fs'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const DURATION=+process.env.DURATION_MS||45000,LEVEL=+process.env.LEVEL||20,AREA_MIN=+process.env.AREA_MIN||3,OUTLIER=+process.env.OUTLIER||0.35;
const SEEDS=(process.env.SEEDS||'117,431,991,577,2027').split(',').map(Number),STEP=33.333;
const median=a=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):0;};
(async()=>{const MERGE=process.env.MERGE?process.env.MERGE.split(','):null;let browser=null;
try{
 let info,runs=[],keys;const errors=[];
 if(!MERGE){browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.SITE||'http://127.0.0.1:8931')+'/',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>typeof startRun==='function'&&typeof CLASSES!=='undefined',null,{timeout:120000});
 await page.addScriptTag({path:path.join(__dirname,'autopilot.js')});
 info=await page.evaluate(()=>Object.fromEntries(Object.keys(CLASSES).map(k=>[k,{role:CLASSES[k].roleCategory,name:CLASSES[k].name}])));
 keys=(process.env.KEYS||Object.keys(info).join(',')).split(',').filter(k=>info[k]);
 if(process.env.SHARD){const [i,n]=process.env.SHARD.split('/').map(Number);keys=keys.filter((k,j)=>j%n===i);}
 for(const k of keys){for(const seed of SEEDS){
  runs.push(await page.evaluate(([k,seed,dur,level,areaMin,step])=>{
   let n=seed;Math.random=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};netMatch=null;save.stash=[];save.relics={hp:0,dmg:0,def:0,vel:0};
   for(const c in save.champions){const s=save.champions[c];s.unlocked=true;s.level=level;s.xp=0;s.equipment={};s.inventory=[];s.talents={nodes:{},mastery:null,masteryNodes:{}};s.skillMastery=[0,1,2].map(()=>({...mkMastery(),alloc:0}));s.ultMastery={...mkMastery(),alloc:0};}
   save.champions[k]||=mkChampion(false);
   lobbyAllies=['tanque','soporte','mago'].map(c=>c===k?'guerrero':c);
   // medición de área: golpes de habilidad del jugador agrupados en ventanas de 150 ms
   const M={tick:0,frame:new Map(),areaDmg:0,areaHits:0};
   if(!window.__CP){window.__CP={orig:damageEnemy,M:null};
    window.damageEnemy=function(e,amount,opts){const m=window.__CP.M;if(!m||e.hp<=0)return window.__CP.orig.apply(this,arguments);
     const before=e.hp,r=window.__CP.orig.apply(this,arguments),o=opts||{},src=o.src||player;
     if(src===player&&!o.fromBasic&&!o.fromProc){const d=Math.max(0,before-Math.max(e.hp,0));let f=m.frame.get(e);if(!f){f={d:0};m.frame.set(e,f);}f.d+=d;}
     return r;};
   }
   window.__CP.M=M;
   const flush=()=>{if(M.frame.size>=areaMin){for(const f of M.frame.values()){M.areaDmg+=f.d;M.areaHits++;}}M.frame.clear();};
   __AP.start(k,'bosque',1);
   let t=0,lastFlush=0,alive=true,minHpPct=1;
   for(let i=0,N=Math.round(dur/step);i<N;i++){
    if(state==="buff")__AP.pickBuff();if(state!=="playing")break;
    update(step);t+=step;if(t-lastFlush>=150){flush();lastFlush=t;}if(player.alive)minHpPct=Math.min(minHpPct,player.hp/player.maxHp);else alive=false;
   }
   __AP.on=false;window.__CP.M=null;
   const out={key:k,seed,kills:player.stats.kills||0,teamKills:kills,dmg:Math.round(player.stats.dmgDealt),areaDmg:Math.round(M.areaDmg),areaHits:M.areaHits,
    casts:player.stats.skillCasts||0,alive:alive&&player.alive,minHpPct:+minHpPct.toFixed(3),runLevel,error:__AP.err||null};
   setState('paused');return out;
  },[k,seed,DURATION,LEVEL,AREA_MIN,STEP]));
 }process.stdout.write('.');if(process.argv[2])fs.writeFileSync(process.argv[2]+'.partial',JSON.stringify({info,runs,errors}));}
 }else{info={};for(const f of MERGE){const j=JSON.parse(fs.readFileSync(f,'utf8'));Object.assign(info,j.info);runs.push(...j.runs);errors.push(...j.errors);}}
 keys=[...new Set(runs.map(r=>r.key))];
 const ref=JSON.parse(fs.readFileSync(path.join(__dirname,'../../docs/balance/champion-entry-reference.json'),'utf8')),known=new Set(ref.knownChampions);
 // agregación: mediana por campeón, luego mediana del rol (solo aprobados)
 const champs=keys.map(k=>{const rs=runs.filter(r=>r.key===k),f=x=>median(rs.map(r=>r[x]));
  return {key:k,name:info[k].name,role:info[k].role,approved:known.has(k),kills:f('kills'),teamKills:f('teamKills'),dmg:f('dmg'),areaDmg:f('areaDmg'),areaHits:f('areaHits'),casts:f('casts'),
   survived:rs.filter(r=>r.alive).length+'/'+rs.length,minHpPct:f('minHpPct'),killsMin:Math.min(...rs.map(r=>r.kills)),killsMax:Math.max(...rs.map(r=>r.kills)),errors:rs.filter(r=>r.error).length};});
 const roles={};
 for(const role of [...new Set(champs.map(c=>c.role))]){const ref_=champs.filter(c=>c.role===role&&c.approved),all=champs.filter(c=>c.role===role);
  const src=ref_.length?ref_:all;roles[role]={n:all.length,refN:src.length,medianKills:median(src.map(c=>c.kills)),medianAreaDmg:median(src.map(c=>c.areaDmg)),medianDmg:median(src.map(c=>c.dmg))};}
 for(const c of champs){const R=roles[c.role];c.killsVsRole=R.medianKills?+(c.kills/R.medianKills).toFixed(2):null;c.areaVsRole=R.medianAreaDmg?+(c.areaDmg/R.medianAreaDmg).toFixed(2):null;
  c.outlier=c.killsVsRole===null?null:c.killsVsRole>1+OUTLIER?'alto':c.killsVsRole<1-OUTLIER?'bajo':null;}
 console.log('\n'+['rol','campeón','apr','kills(med)','min-max','x rol','área dmg','x rol','daño','vive','extremo'].join('\t'));
 for(const c of champs.sort((a,b)=>a.role.localeCompare(b.role)||b.kills-a.kills))console.log([c.role,c.key,c.approved?'si':'cand',c.kills,c.killsMin+'-'+c.killsMax,c.killsVsRole,c.areaDmg,c.areaVsRole,c.dmg,c.survived,c.outlier||''].join('\t'));
 console.log(JSON.stringify(roles));
 if(errors.length)console.log('pageerrors',errors.slice(0,5));
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({site:process.env.SITE,info,durationMs:DURATION,championLevel:LEVEL,seeds:SEEDS,areaMin:AREA_MIN,outlier:OUTLIER,roles,champs,runs,errors},null,1)+'\n');
}finally{if(browser)await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
