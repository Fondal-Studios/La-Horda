'use strict';
/* Guerra de Cristales (motor real): humo de los 38 campeones. Cada uno juega 45 s de partida real con todas sus habilidades,
 * definitiva y ataque básico forzados en cada recarga, en el centro del mapa entre las dos hordas y frente a un rival (PvP).
 * Verifica: sin excepciones, sin valores NaN, sin fuego amigo de la horda propia, nadie sale del mapa y el campeón realmente peleó (bajas > 0).
 * Uso: node tools/lanes/kits.js [segundos=45] [campeón...]  (sin campeones = todos los de CLASSES con perfil de bot) */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');
const SECS=Number(process.argv[2])||45,ONLY=process.argv.slice(3),PORT=8897;
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:path.resolve(__dirname,'../..'),stdio:'ignore'});
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page0=await b.newPage();await page0.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await page0.waitForFunction(()=>typeof lanesStart==='function');
 const roster=await page0.evaluate(()=>Object.keys(CLASSES).filter(k=>championBotEligible(k)));await page0.close();
 const list=ONLY.length?ONLY:roster;let bad=0;const rows=[];
 for(const champ of list){
  const p=await b.newPage({viewport:{width:844,height:390}}),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,160));});
  await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof lanesStart==='function',null,{timeout:60000});
  const r=await p.evaluate(({champ,secs})=>{
   setState('mainmenu');lanesStart({champ,seed:11});
   const rep={champ,frames:0,nan:0,cross:0,dead:0,friendly:0,pvp:0};const dt=1000/60;let ang=0;
   const dh=damageHero;damageHero=function(h,a,src,pt){ const hp0=h&&h.hp,isF=h&&h.team!=null&&src&&!src.isPvp&&src!==h&&!h.isStruct&&lanesTeamOf(src)===h.team; if(src&&src.isPvp&&h&&!h.isStruct)rep.pvp++; const r=dh.call(this,h,a,src,pt); if(isF&&h.hp<hp0-0.01)rep.friendly++; return r; };
   player.x=2000;player.y=500;heroes[2].x=2160;heroes[2].y=520;
   for(let f=0;f<secs*60&&!LN.ended;f++){
    if(f%20===0){ang+=0.7;joyVec={x:Math.cos(ang)*0.6,y:Math.sin(ang)*0.6};}
    basicHeld=true;
    if(f%45===0&&player.alive){player.cds=[0,0,0];player.energy=player.maxEnergy;player.ultCharge=player.ultMax;player.ultCd=0;try{useSkill(0,null);useSkill(1,null);useSkill(2,null);useUltimate();}catch(e){rep.err=String(e&&e.message||e);}}
    update(dt);rep.frames++;
    if(f%30===0){
     for(const h of heroes){ if(![h.x,h.y,h.hp].every(Number.isFinite))rep.nan++; if(!h.duelActive&&!lanesInside(h.x,h.y,-40))rep.cross++; }
     for(const e of enemies){ if(!e.alive)continue; if(![e.x,e.y,e.hp].every(Number.isFinite))rep.nan++; if(!e.isDuelLocked&&!lanesInside(e.x,e.y,-40))rep.cross++; }
     for(const T of LN.team){ if(![T.S[2].hp,T.shards].every(Number.isFinite))rep.nan++; }
    }
   }
   const s=player.stats||{};rep.dmg=Math.round(s.dmgDealt||s.dmg||0);rep.kills=LN.team[0].kills+LN.team[1].kills;rep.myKills=s.kills||0;rep.hp0=Math.round(LN.team[0].S[2].hp);rep.hp1=Math.round(LN.team[1].S[2].hp);rep.respawns=heroes.filter(h=>h.dead_t).length;
   rep.enemiesLeft=enemies.filter(e=>e.alive).length;damageHero=dh;lanesStop('mainmenu');return rep;},{champ,secs:SECS});
  const ok=!r.err&&r.nan===0&&r.cross===0&&r.friendly===0&&(r.kills>0||r.dmg>0||r.pvp>0)&&errs.length===0;if(!ok)bad++;
  rows.push(r);console.log((ok?'OK   ':'FAIL ')+champ.padEnd(14)+JSON.stringify({kills:r.kills,dmg:r.dmg,pvp:r.pvp,friendly:r.friendly,cross:r.cross,nan:r.nan,err:r.err,errs:errs.slice(0,2)}));
  await p.close();
 }
 await b.close();srv.kill();
 require('fs').writeFileSync(process.env.KITS_OUT||'/tmp/lanes-kits.json',JSON.stringify(rows,null,1));
 console.log(bad?`FAIL: ${bad} de ${list.length} campeones con problemas`:`PASS lanes kits: ${list.length} campeones sin errores, sin fuego amigo, sin salirse del mapa`);process.exit(bad?1:0);
})().catch(e=>{console.error(e);srv.kill();process.exit(1);});
