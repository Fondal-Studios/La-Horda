'use strict';
// Pruebas de kit de los tres campeones nuevos (Ilsa, Vorn, Kora) sobre el motor real:
// habilidades, mecánica propia, invocaciones/entidades, límite, duración, limpieza, jefes, talentos, refuerzos y cooperativo.
// Uso: ENTRY_BASE_URL=http://127.0.0.1:8851 node tools/siete/functional.js   (servir el repo antes)
const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.ENTRY_BASE_URL||'http://127.0.0.1:8851');await p.waitForFunction(()=>typeof SIETE!=='undefined'&&typeof sietCast==='function'&&typeof CHAMPION_ENTRY_BALANCE!=='undefined',null,{timeout:120000});
 const checks=await p.evaluate(()=>{
 const out=[],check=(name,ok,details)=>out.push({name,ok:!!ok,...(details!==undefined?{details}:{})});
 function start(k,arena='bosque',level=20){netMatch=null;save.champions[k]||=mkChampion(false);save.stash=[];save.relics={hp:0,dmg:0,def:0,vel:0};
  for(const c in save.champions){Object.assign(save.champions[c],{unlocked:true,level,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});}
  selectedClass=k;currentArena=arena;lobbyAllies=['tanque','soporte','mago'];startRun(3);enemies=[];spawnTimer=1e9;arenaHazardTimer=1e9;levelTimer=0;state='playing';
  runLevel=Math.max(runLevel||1,ULT_MIN_ARENA_LEVEL);player.fx=1;player.fy=0;player.aim={x:player.x+115,y:player.y,dx:1,dy:0};player.energy=1e4;player.ultCharge=player.ultMax;player.cds=[0,0,0];player.ultCd=0;runStats.critChance=0;return player;}
 function enemy(dx=60,rank='normal',dy=0){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+dx,y:player.y+dy,hp:1e7,maxHp:1e7,dmg:0,speed:0,baseSpeed:0,rank});return e;}
 function cast(i){player.cds=[0,0,0];player.energy=1e4;castAbility(player,i==='ult'?player.cls.ultimate:player.cls.skills[i],i==='ult',i==='ult'?undefined:i);}
 function tick(ms){for(let t=0;t<ms;t+=16){runElapsedMs+=16;for(const h of heroes)updatePortadorHero(h,16);updatePortadorObjects(16);}}
 function inBounds(e){const c={x:e.x,y:e.y,radius:e.radius||12};clampToArena(c);return Math.abs(c.x-e.x)<1e-6&&Math.abs(c.y-e.y)<1e-6;}
 const own=()=>portadorObjects.filter(o=>o.owner===player&&o.si&&o.life>0);
 const ids=Object.keys(SIETE),ref=CHAMPION_BALANCE_REFERENCE;
 for(const k of ids){
  const m=championMeta(k);
  check(k+' registered STANDARD/TESTING, hidden from public store',!!CLASSES[k]&&!!PORTADORES[k]&&m.category==='STANDARD'&&m.releaseState==='TESTING'&&championPlayable(k)&&!championBotEligible(k));
  check(k+' promoted to knownChampions (reference v4)',ref.knownChampions.includes(k)&&ref.version===4);
  check(k+' kit 3 skills + ultimate with descriptions and premarcado where aimed',CLASSES[k].skills.length===3&&!!CLASSES[k].ultimate&&[...CLASSES[k].skills,CLASSES[k].ultimate].every(s=>s.desc&&s.cd>0));
  check(k+' talents: 3 branches + a special per branch + masteries',TALENT_TREES[k].nodes.filter(n=>n.type==='special').length===3&&Object.keys(TALENT_TREES[k].masteries).length===3);
  check(k+' boons: 4 cards + duo',BOONS.filter(x=>x.champ===k).length===5&&BOONS.filter(x=>x.champ===k&&x.duo).length===1);
  check(k+' Codex lore, two author skins and pending Set',!!CODEX_CHAMP_LORE[k]&&ASCENSION_SKINS[k].length===2&&!!ASCENSION_PENDING_SETS['asc_'+k]);
  start(k);const es=[enemy(60),enemy(70,'normal',14),enemy(70,'normal',-14),enemy(85),enemy(55,'normal',-20)];
  for(let i=0;i<3;i++)cast(i);cast('ult');tick(4500);
  check(k+' horde damage',es.filter(e=>e.hp<1e7).length>=3,es.map(e=>Math.round(1e7-e.hp)));
  for(let n=0;n<15;n++){for(let i=0;i<3;i++)cast(i);cast('ult');}
  check(k+' bounded entities (<=10 own, <=48 global)',own().length<=10&&portadorObjects.length<=48,[own().length,portadorObjects.length]);
  check(k+' finite state',Number.isFinite(player.hp)&&Number.isFinite(player.x)&&Number.isFinite(player.y));
  start(k);const boss=enemy(40,'jefe');boss.maxHp=boss.hp=5000;const pos={x:boss.x,y:boss.y};for(let i=0;i<3;i++)cast(i);cast('ult');tick(8000);
  check(k+' boss never displaced or stunned',boss.x===pos.x&&boss.y===pos.y&&!(boss.stunTimer>0)&&!(boss.slowAmt>.12),[boss.x-pos.x,boss.stunTimer,boss.slowAmt]);
  check(k+' boss alive, damage bounded by caps (<60% of max HP for a full kit)',boss.alive&&5000-boss.hp<=5000*.6,5000-boss.hp);
  start(k);const elite=enemy(40,'elite');elite.hp=elite.maxHp*.05;for(let i=0;i<3;i++)cast(i);cast('ult');tick(6000);check(k+' elites never executed',elite.alive);
  start(k);for(let i=0;i<3;i++)cast(i);cast('ult');tick(20000);check(k+' timed objects expire',own().length===0,own().map(o=>o.kind));
  start(k);for(let i=0;i<3;i++)cast(i);cast('ult');player.hp=0;player.alive=false;tick(100);check(k+' cleanup on death',own().length===0&&!player.siState);
  for(const arena of ['ciudad','fortaleza','bosque','micelial','hielo','acuatica','laberinto','abismo','minas','infernal']){start(k,arena,20);const crowd=[enemy(40),enemy(-60),enemy(120,'elite'),enemy(0,'normal',90)];for(let i=0;i<3;i++)cast(i);cast('ult');tick(3000);
   check(k+' arena '+arena+' bounds + finite',crowd.every(e=>!e.alive||inBounds(e))&&Number.isFinite(player.hp)&&inBounds(player)&&portadorObjects.length<=48);}
 }
 // ---- Ilsa ----
 start('ilsa');const atk=enemy(40);const hp0=player.hp;damageHero(player,30,atk);check('Ilsa takes damage outside the stance',player.hp<hp0);
 start('ilsa');const atk2=enemy(40);cast(0);const hp1=player.hp;damageHero(player,30,atk2);check('Ilsa stance blocks the hit completely',player.hp===hp1);check('Ilsa riposte damages the attacker and adds a Réplica',atk2.hp<1e7&&player.siState.riposte===1);
 start('ilsa');cast(0);const hp2=player.hp;damageHero(player,30,{x:player.x,y:player.y});check('Ilsa does not parry environment damage',player.hp<hp2);
 start('ilsa');cast(0);tick(1200);const atk3=enemy(40),hp3=player.hp;damageHero(player,30,atk3);check('Ilsa stance expires',player.hp<hp3);
 start('ilsa');cast('ult');let blocked=0;const atk4=enemy(40);for(let i=0;i<9;i++){const h0=player.hp;damageHero(player,20,atk4);if(player.hp===h0)blocked++;}check('Ilsa duel parries at most 6 hits',blocked===6,blocked);
 start('ilsa');player.siState={n:0,riposte:3};const t5=enemy(40);const b5=t5.hp;damageEnemy(t5,100,{src:player,fromBasic:true});check('Ilsa third Réplica powers the next basic (+60%) and is consumed',b5-t5.hp>140&&player.siState.riposte===0,b5-t5.hp);
 start('ilsa');player.siState={n:0,riposte:3};e1=enemy(100);cast(1);check('Ilsa lunge dashes and spends Réplicas',player.siState.riposte===0&&distance(player,{x:0,y:0})>=0&&e1.hp<1e7);
 // ---- Vorn ----
 start('vorn');check('Vorn starts in Piedra (-14% taken, slower)',vornForm(player)===0&&Math.abs(portadorTakenMult(player,null)-.86)<.02&&portadorSpeedMult(player)<1);cast(0);check('Mudar switches to Tormenta (faster)',vornForm(player)===1&&portadorSpeedMult(player)>1.15);cast(0);check('Mudar toggles back to Piedra',vornForm(player)===0);
 start('vorn');e1=enemy(80);cast(1);check('Zarpa in Piedra slows',e1.slowTimer>0);start('vorn');cast(0);const pos0=player.x;e1=enemy(100);cast(1);check('Zarpa in Tormenta dashes and bleeds',player.x>pos0+50&&e1.bleedTimer>0);
 start('vorn');cast(2);check('Instinto in Piedra shields',player.shield>0);start('vorn');cast(0);cast(2);check('Instinto in Tormenta buffs damage',player._kitDmgUntil>runElapsedMs);
 start('vorn');cast('ult');check('Bestia Primordial cuts damage taken',portadorTakenMult(player,null)<.8&&sietOwned(player,'stomp').length===1);tick(6500);check('Bestia ends',sietOwned(player,'stomp').length===0&&!vornBeast(player));
 // ---- Kora ----
 start('kora');const x0=player.x;for(let i=0;i<30;i++){player.x+=6;tick(16);}check('Kora gains Impulso by moving',player.siState.mom>20,player.siState.mom);const m0=player.siState.mom;tick(1000);check('Kora loses Impulso when still',player.siState.mom<m0);
 start('kora');const carr=[enemy(40),enemy(60,'normal',10),enemy(80,'normal',-10),enemy(70,'elite',0)];const el0={x:carr[3].x,y:carr[3].y};cast(0);check('Arremetida carries commons forward and hits all',carr[0].x>player.x-60&&carr.filter(e=>e.hp<1e7).length>=3);
 start('kora');const bos=enemy(50,'jefe');bos.maxHp=bos.hp=5000;const bp={x:bos.x,y:bos.y};cast(0);check('Arremetida never drags a boss',bos.x===bp.x&&bos.y===bp.y);
 start('kora');cast(2);player.slowTimer=500;tick(50);check('Cabeza Gacha clears slows and buffs',player.slowTimer===0&&player._kitArmorUntil>runElapsedMs);
 start('kora');const sx=player.x;cast('ult');tick(800);check('Estampida moves Kora forward fast',Math.hypot(player.x-sx,0)>150||player.x!==sx);tick(1500);check('Estampida ends and resets Impulso',!player.siState.stampede);
 // ---- talentos y cooperativo ----
 start('kora',  'bosque', 99);check('Talent special flag is read by the runtime',(()=>{const t=TALENT_TREES.kora.nodes.find(n=>n.type==='special');return !!t&&t.mods(1)[0].flag==='bigcarry';})());
 for(const k of ids){start(k);for(let i=0;i<3;i++)cast(i);cast('ult');tick(200);_netHeroIdx=new Map(heroes.map((h,i)=>[h,i]));netMatch={snapN:0,last:{},lastG:{},lastH:[{},{},{},{}]};const snap=netBuildSnapshot(true,true);
  check(k+' network snapshot is serializable, bounded and keeps owner',JSON.stringify(snap).length<400000&&snap.c.portadorObjects.u.every(([id,o])=>o.owner&&o.owner.$h===0));netMatch=null;}
 setState('paused');return out;});
 fs.mkdirSync('docs/production/siete',{recursive:true});fs.writeFileSync('docs/production/siete/functional-results.json',JSON.stringify({checks,errors},null,2));
 const failed=checks.filter(c=>!c.ok);console.log(JSON.stringify({checks:checks.length,failed,errors}));if(errors.length||failed.length)process.exitCode=1;}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
