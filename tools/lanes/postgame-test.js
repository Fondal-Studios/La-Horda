'use strict';
/* POSTGAME de Cristales y Coliseo (solo contra bots). Verifica con el motor real en Chromium:
 *  1. Bloqueo y desbloqueo por campaña: perfil nuevo bloqueado (hub, condición clara, Entrenamiento); guardado que YA completó la
 *     campaña (arenasCleared) abierto sin migrar nada; POSTGAME_GATE="open" abre todo; las salas online (otro rol) no usan progreso.
 *  2. Tope de progresión aplicado: nivel, puntos de talento, maestría, nivel de objetos, reliquias, pasivas, vida, daño, velocidad,
 *     escudo; los bots llevan el bono de su modo; el Entrenamiento no lleva nada.
 *  3. Guardado restaurado INTACTO (objeto y localStorage) al salir sin terminar la partida.
 *  4. Recompensas: oro/XP/maestría, tope diario compartido, día nuevo, reloj atrasado, partida corta, Entrenamiento sin pago, racha y
 *     trofeos, logros y cosméticos; el guardado real solo cambia lo permitido.
 *  5. Pantalla de resultado con lo ganado y lo que falta del tope.
 * Uso: node tools/lanes/postgame-test.js */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const net=require('node:net');const assert=require('node:assert/strict');
const freePort=()=>new Promise(r=>{const s=net.createServer().listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
let ok=0;const pass=m=>{ok++;console.log('  ok  '+m);};
(async()=>{
 const PORT=await freePort(),root=path.resolve(__dirname,'../..');
 const srv=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 for(let i=0;i<80;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:844,height:390},hasTouch:true});
 await ctx.addInitScript(f=>{try{if(!localStorage.getItem('laHordaSave_v1'))localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},FIX);
 const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_INTERNET/.test(m.text()))errs.push('console:'+m.text().slice(0,160));});  // (recursos externos sin red en el entorno: no son del juego)
 await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`,{timeout:120000});
 await p.waitForFunction(()=>typeof setState==='function'&&typeof renderMainMenu==='function'&&typeof lanesStart==='function'&&typeof postgameSettle==='function',null,{timeout:60000});
 const E=(fn,arg)=>p.evaluate(fn,arg);

 console.log('1) bloqueo / desbloqueo por campaña');
 assert.equal(await E(()=>POSTGAME_GATE),'open','el interruptor viene ABIERTO por defecto (alfa)');pass('POSTGAME_GATE viene en "open" (alfa)');
 assert.equal(await E(()=>postgameUnlocked(defaultSave())),true);pass('con el interruptor abierto un perfil nuevo entra (y usa su progreso real con tope)');
 await E(()=>{POSTGAME_GATE='campaign';});   // el resto de esta sección prueba la regla de cierre
 await E(()=>{save.tut=save.tut||{};save.tut.training=1;persistNow();setState('mainmenu');renderMainMenu();});
 let r=await E(()=>({un:postgameUnlocked(),text:postgameLockText(),gate:POSTGAME_GATE,cls:document.getElementById('hub-crystal-btn').className,sub:document.getElementById('hub-crystal-sub').textContent,subC:document.getElementById('hub-coliseum-sub').textContent}));
 assert.equal(r.un,false,'perfil nuevo: bloqueado');assert.equal(r.gate,'campaign');assert.match(r.text,/Se abre al terminar la campaña/);
 assert.match(r.cls,/locked/);assert.match(r.sub,/Se abre al terminar la campaña/);assert.match(r.sub,/Entrenamiento/);assert.match(r.subC,/Se abre al terminar la campaña/);pass('perfil nuevo: tarjetas bloqueadas con la condición ("'+r.sub+'")');
 // tocar la tarjeta bloqueada abre el aviso, no el modo; ofrece Entrenamiento
 await E(()=>document.getElementById('hub-crystal-btn').scrollIntoView({block:'center'}));await p.click('#hub-crystal-btn');
 await p.waitForSelector('#pg-gate:not(.hidden)');
 r=await E(()=>({txt:document.getElementById('pg-gate-text').textContent,btn:document.getElementById('pg-gate-train').textContent,screen:state}));
 assert.match(r.txt,/Se abre al terminar la campaña/);assert.match(r.btn,/Entrenar/);assert.notEqual(r.screen,'crystalwars');pass('tocar la tarjeta bloqueada: aviso con condición y botón Entrenar (no entra al modo)');
 await p.click('#pg-gate-train');await p.waitForFunction(()=>state==='crystalwars');
 assert.equal(await E(()=>document.getElementById('pg-training').checked),true,'lobby: entrenamiento marcado');
 assert.match(await E(()=>document.getElementById('pg-lobby').textContent),/ENTRENAMIENTO/);
 await p.selectOption('#champ','mago');await p.click('#practice');await p.waitForFunction(()=>state==='playing'&&lanesOn(),null,{timeout:20000});
 r=await E(()=>({prog:LN.pg.progress,why:LN.pg.why,lvl:player.mlvl,hp:player.maxHp,hasTag:!!player._pg}));
 assert.equal(r.prog,false);assert.equal(r.why,'training');assert.equal(r.hasTag,false);pass('bloqueado + Entrenar: partida normalizada (sin multiplicadores)');
 await E(()=>{lanesStop('mainmenu');});
 r=await E(()=>{lanesStart({champ:'mago',seed:2});const o={prog:LN.pg.progress,why:LN.pg.why};lanesStop('mainmenu');return o;});
 assert.deepEqual(r,{prog:false,why:'locked'});pass('bloqueado y sin pedir Entrenamiento (lanesStart directo): igual normalizado (why=locked)');
 // guardado que ya completó la campaña (con arenas heredadas): abierto sin migración
 await E(()=>{lanesStop('mainmenu');});
 r=await E(()=>{const s=defaultSave();for(const a of ARENA_ORDER)s.arenasCleared[a]=true;s.legacyOpenArenas=ARENA_ORDER.slice();return {done:postgameCampaignDone(s),un:postgameUnlocked(s)};});
 assert.deepEqual(r,{done:true,un:true});pass('guardado con la campaña completa: desbloqueado sin migrar');
 r=await E(()=>{const s=defaultSave();s.arenasCleared.infernal=true;return {done:postgameCampaignDone(s),un:postgameUnlocked(s)};});
 assert.deepEqual(r,{done:true,un:true});pass('victoria en la última arena (infernal): desbloqueado (flag real arenasCleared)');
 r=await E(()=>{const s=defaultSave();for(const a of ARENA_ORDER.slice(0,-1))s.arenasCleared[a]=true;return {done:postgameCampaignDone(s),un:postgameUnlocked(s)};});
 assert.deepEqual(r,{done:false,un:false});pass('9 de 10 arenas: sigue bloqueado');
 // el guardado real completo cambia el hub, la marca queda aunque se reinicie la campaña
 r=await E(()=>{save.arenasCleared.infernal=true;setState('mainmenu');renderMainMenu();const o={cls:document.getElementById('hub-crystal-btn').className,sticky:save.postgame&&save.postgame.unlocked};save.arenasCleared.infernal=false;const o2=postgameUnlocked();save.arenasCleared.infernal=true;return {o,o2};});
 assert.doesNotMatch(r.o.cls,/locked/);assert.equal(r.o.sticky,true);assert.equal(r.o2,true);pass('desbloqueado en el hub; la marca queda aunque se reinicie la campaña');
 await E(()=>document.getElementById('hub-crystal-btn').scrollIntoView({block:'center'}));await p.click('#hub-crystal-btn');await p.waitForFunction(()=>state==='crystalwars');
 assert.equal(await E(()=>document.getElementById('pg-training').checked),false);assert.match(await E(()=>document.getElementById('pg-lobby').textContent),/POSTGAME/);pass('desbloqueado: la tarjeta entra directo al modo y el lobby dice POSTGAME');
 await E(()=>{CrystalWarsUI.close();setState('mainmenu');});
 // interruptor único
 r=await E(()=>{const s=defaultSave();POSTGAME_GATE='open';const a=postgameUnlocked(s);POSTGAME_GATE='campaign';return a&&!postgameUnlocked(s);});
 assert.equal(r,true);pass('POSTGAME_GATE="open" abre todo sin tocar el guardado; "campaign" lo vuelve a cerrar');
 // online: otro rol nunca instala progreso y conserva el guardado normalizado de siempre
 r=await E(()=>{const k='mago';save.champions[k].level=77;lanesBegin('lobby');const o={pg:!!LN.pg,lvl:save.champions[k].level,stash:save.stash.length,rel:save.relics.hp};lanesRestore();return o;});
 assert.deepEqual(r,{pg:false,lvl:3,stash:0,rel:0});pass('sala online (rol lobby): sin progreso, guardado normalizado (nivel 3, sin equipo)');
 r=await E(()=>{lanesBegin('host');const o={pg:!!LN.pg,lvl:save.champions.mago.level};lanesRestore();return o;});
 assert.deepEqual(r,{pg:false,lvl:3});pass('anfitrión online: sin progreso');

 console.log('2) tope de progresión');
 // guardado "al máximo": nivel 99, maestría y talentos completos, reliquias 30, seis legendarios nivel 10
 const MAXED=()=>{const k='mago',c=save.champions[k];c.unlocked=true;c.level=99;c.skillMastery.forEach(m=>{m.alloc=10;m.useLvl=40;});c.ultMastery.alloc=10;c.ultMastery.useLvl=40;
  const tree=TALENT_TREES[k];for(const n of tree.nodes)c.talents.nodes[n.id]=n.maxRank;const mid=Object.keys(tree.masteries)[0];c.talents.mastery=mid;for(const n of tree.masteries[mid].miniTree||[])c.talents.masteryNodes[n.id]=n.maxRank;
  save.relics={hp:30,dmg:30,def:30,vel:30};save.stash=[];for(const type of Object.keys(ITEM_TYPES)){const it=makeItem(type,'legendario',k);it.level=10;it.ilvl=10;save.stash.push(it);c.equipment[type]=it.uid;}
  save.arenasCleared.infernal=true;return k;};
 const NAKED=await E(()=>{setState('mainmenu');const s=computePlayerStats('mago',3);return {hp:s.hp,dmg:s.dmg,speed:s.speed,def:s.def};});
 const MAXSTATS=await E((f)=>{const k=eval('('+f+')')();const s=computePlayerStats(k,3);return {hp:s.hp,dmg:s.dmg,speed:s.speed,def:s.def,shieldPct:s.shieldPct};},MAXED.toString());
 assert(MAXSTATS.hp>NAKED.hp*1.3&&MAXSTATS.dmg>NAKED.dmg*2&&MAXSTATS.speed>NAKED.speed*1.3,'sin tope el máximo sería muy superior: hp x'+(MAXSTATS.hp/NAKED.hp).toFixed(2)+' dmg x'+(MAXSTATS.dmg/NAKED.dmg).toFixed(2)+' vel x'+(MAXSTATS.speed/NAKED.speed).toFixed(2)+' escudo +'+Math.round(MAXSTATS.shieldPct*100)+'%');
 pass('sin tope: hp x'+(MAXSTATS.hp/NAKED.hp).toFixed(2)+', daño x'+(MAXSTATS.dmg/NAKED.dmg).toFixed(2)+', velocidad x'+(MAXSTATS.speed/NAKED.speed).toFixed(2)+', escudo +'+Math.round(MAXSTATS.shieldPct*100)+' % (lo que el tope evita)');
 r=await E(()=>{const C=LANES.PROGRESS_CAP,k='mago';
   lanesStart({champ:k,seed:5});
   const c=save.champions[k],o={prog:LN.pg.progress,gate:c.level,talentSpent:0,alloc:[...c.skillMastery.map(m=>m.alloc),c.ultMastery.alloc],use:[...c.skillMastery.map(m=>m.useLvl),c.ultMastery.useLvl],
     items:save.stash.map(i=>[i.level,i.ilvl]),relics:save.relics,nodes:Object.keys(c.talents.nodes).length,mastery:c.talents.mastery,
     hp:player.maxHp,dmg:player.baseDmg,def:player.def,spd:player.baseSpeed,shield:player.itemMaxShield,mlvl:player.mlvl,hudLvl:null};
   invalidatePassiveCache();o.passives={};for(const e of Object.keys(C.passiveMax))o.passives[e]=passiveSum(k,e);
   o.talentSpent=treePointsSpent(k);o.pgBot=LN.pg.bot;o.pgPlayer=LN.pg.player;
   const bot=heroes.find(h=>h.team===0&&h!==player);o.botMax=bot.maxHp;o.botTag=!!bot._pg;
   const foe=heroes.find(h=>h.team===1);o.foeTag=!!foe._pg;
   o.mastPow=[0,1,2].map(i=>masteryPowerMult(masteryOf(k,i)));
   lanesStop('mainmenu');return o;});
 const C=await E(()=>LANES.PROGRESS_CAP);
 assert.equal(r.prog,true);assert.equal(r.gate,C.level,'nivel efectivo = tope ('+C.level+')');assert(r.talentSpent<=C.talentPoints,'talentos <= '+C.talentPoints+' (gasta '+r.talentSpent+')');
 assert(r.talentSpent>=C.talentPoints-1,'conserva casi todo el presupuesto (build recortada, no vacía): '+r.talentSpent);
 assert(r.alloc.every(a=>a<=C.masteryAlloc),'maestría <= '+C.masteryAlloc+': '+r.alloc);assert(r.use.every(u=>u<=C.masteryUse),'uso <= '+C.masteryUse);
 assert(r.items.length===6&&r.items.every(([l,i])=>l<=C.itemLevel&&i<=C.itemIlvl),'objetos nivel/ilvl <= '+C.itemLevel);assert(Object.values(r.relics).every(v=>v<=C.relics),'reliquias <= '+C.relics);
 for(const e of Object.keys(C.passiveMax))assert(r.passives[e]<=C.passiveMax[e]+1e-9,'pasiva '+e+' <= '+C.passiveMax[e]+' (vale '+r.passives[e]+')');
 assert(r.hp<=NAKED.hp*1.0*C.statMax.hp*1.0001+1&&r.hp>NAKED.hp,'vida <= x'+C.statMax.hp+': '+r.hp+' vs '+NAKED.hp);
 assert(r.dmg<=NAKED.dmg*C.statMax.dmg*1.0001&&r.dmg>NAKED.dmg,'daño <= x'+C.statMax.dmg+': '+r.dmg.toFixed(2)+' vs '+NAKED.dmg.toFixed(2));
 assert(r.spd<=NAKED.speed*C.statMax.speed*1.0001+0.01,'velocidad <= x'+C.statMax.speed);assert(r.shield<=Math.round(r.hp*C.shieldMax),'escudo <= '+C.shieldMax*100+' % de la vida');
 assert.equal(r.mlvl,3,'Cristales sigue arrancando en nivel 3 de partida');assert(r.mastPow.every(m=>m<=1.0+ (C.masteryAlloc*0.09+C.masteryAlloc**2*0.012)+1)&&r.mastPow[0]>1,'poder de maestría recortado: x'+r.mastPow[0].toFixed(2));
 assert.equal(r.botTag,true);assert.equal(r.foeTag,true);assert.equal(+r.pgBot.hp.toFixed(3),+(1+(C.statMax.hp-1)*C.botShare.cw).toFixed(3),'bots: bono de su modo');
 pass('Cristales: nivel '+r.gate+', talentos '+r.talentSpent+'/'+C.talentPoints+', maestría '+r.alloc+', objetos nv '+C.itemLevel+', vida x'+(r.hp/NAKED.hp).toFixed(2)+', daño x'+(r.dmg/NAKED.dmg).toFixed(2)+', vel x'+(r.spd/NAKED.speed).toFixed(2)+', escudo '+r.shield+', bots x'+r.pgBot.hp.toFixed(2));
 // Entrenamiento con el mismo guardado: nada de progreso
 r=await E(()=>{lanesStart({champ:'mago',seed:5,training:true});const o={prog:LN.pg.progress,why:LN.pg.why,hp:player.maxHp,dmg:player.baseDmg,stash:save.stash.length,lvl:save.champions.mago.level,tag:!!player._pg};lanesStop('mainmenu');return o;});
 assert.equal(r.prog,false);assert.equal(r.why,'training');assert.equal(r.stash,0);assert.equal(r.tag,false);pass('Entrenamiento (mismo guardado): sin progreso, sin equipo, campeón normalizado');
 // campeón que no es propio: entrena
 r=await E(()=>{const k='tanque';save.champions[k].unlocked=false;lanesStart({champ:k,seed:5});const o={prog:LN.pg.progress,why:LN.pg.why};lanesStop('mainmenu');save.champions[k].unlocked=true;return o;});
 assert.equal(r.prog,false);assert.equal(r.why,'notowned');pass('campeón que no tenés: Entrenamiento (sin recompensas ni progreso)');
 // Coliseo: nivel fijo 10 + tope
 r=await E(()=>{const C=LANES.PROGRESS_CAP;save.arenasCleared.infernal=true;setState('mainmenu');
   const naked=(()=>{colStart({champ:'mago',seed:9,training:true});const o={hp:player.maxHp,dmg:player.baseDmg,spd:player.baseSpeed};lanesStop('mainmenu');return o;})();
   colStart({champ:'mago',seed:9});const o={prog:LN.pg.progress,hp:player.maxHp,dmg:player.baseDmg,spd:player.baseSpeed,naked,mlvl:player.mlvl,botHp:heroes.find(h=>h!==player&&h.isBot).maxHp,botNaked:null};lanesStop('mainmenu');return o;});
 assert.equal(r.prog,true);assert(r.hp<=r.naked.hp*C.statMax.hp*1.0001+1&&r.hp>r.naked.hp,'Coliseo: vida con tope '+r.hp+' vs '+r.naked.hp);assert(r.dmg<=r.naked.dmg*C.statMax.dmg*1.0001&&r.dmg>r.naked.dmg,'Coliseo: daño con tope');
 pass('Coliseo (nivel fijo 10): vida x'+(r.hp/r.naked.hp).toFixed(2)+', daño x'+(r.dmg/r.naked.dmg).toFixed(2));

 console.log('3) guardado restaurado intacto');
 r=await E(()=>{setState('mainmenu');persistNow();const before=JSON.stringify(save),ls=localStorage.getItem('laHordaSave_v1'),ref=save;
   lanesStart({champ:'mago',seed:21});for(let i=0;i<60*20;i++){basicHeld=true;update(1000/60);}
   const during=JSON.stringify(save)!==before;lanesStop('mainmenu');
   return {same:JSON.stringify(save)===before,sameRef:save===ref,ls:localStorage.getItem('laHordaSave_v1')===ls,during,t:null};});
 assert.equal(r.same,true,'el objeto save es idéntico');assert.equal(r.sameRef,true,'es el MISMO objeto');assert.equal(r.ls,true,'localStorage idéntico');assert.equal(r.during,true,'durante la partida se usaba otro guardado');pass('20 s de partida de postgame y salida: save y localStorage idénticos a antes');
 r=await E(()=>{setState('mainmenu');persistNow();const before=JSON.stringify(save);colStart({champ:'mago',seed:22});for(let i=0;i<60*8;i++){basicHeld=true;update(1000/60);}lanesStop('mainmenu');return JSON.stringify(save)===before;});
 assert.equal(r,true);pass('Coliseo: guardado idéntico tras salir');

 console.log('4) recompensas con tope diario');
 const SETTLE=(mode,winner,ms,train)=>E(({mode,winner,ms,train})=>{ // juega una partida corta y la termina a la fuerza con el resultado pedido
   const k='mago';if(mode==='cw')lanesStart({champ:k,seed:31,training:!!train});else colStart({champ:k,seed:31,training:!!train});
   for(let i=0;i<30;i++)update(1000/60);
   LN.t=ms;
   const mine=player.team;
   if(mode==='cw'){player.pgKills=3;LN.team[mine].tk=4;LN.team[mine].epicsTaken=1;lanesFinish(winner==='win'?mine:winner==='draw'?-1:1-mine,'cristal');}
   else{ // torneo: el jugador gana 3 duelos (o pierde)
     const T=LN.team[mine];T.duels=winner==='win'?3:3;T.wins=winner==='win'?3:1;player.pgKills=2;
     LN.winner=winner==='win'?mine:winner==='draw'?-1:(mine+1)%4;LN.ended=true;LN.why='torneo';
     if(winner==='win'){T.points=3;}else{LN.team[(mine+1)%4].points=3;}
   }
   const res=postgameSettle(LN),html=postgameResultHtml(res);const g=LN.snap.save.gold;
   lanesStop('mainmenu');
   return {res,html,gold:save.gold,snapGold:g,P:JSON.parse(JSON.stringify(save.postgame||null))};},{mode,winner,ms,train});
 await E(()=>{const s=defaultSave();Object.assign(s,JSON.parse(JSON.stringify({tut:{training:1},starterChosen:true})));for(const a of ARENA_ORDER)s.arenasCleared[a]=true;s.champions.mago.unlocked=true;save=s;window.__questsNow=new Date(2026,9,19,12,0,0).getTime();setState('mainmenu');});
 const g0=await E(()=>save.gold);
 let a=await SETTLE('cw','win',300000);
 assert.equal(a.res.paid,true,JSON.stringify(a.res.reason||a.res.why));assert.equal(a.gold-g0,a.res.gold,'el oro entró al guardado real');assert(a.res.gold>0&&a.res.xp>0&&a.res.use>0);
 const expRaw=300+12*3+8*4+20*1;assert.equal(a.res.raw.gold,expRaw,'oro sin tope = 300 + 36 + 32 + 20 = '+expRaw);pass('victoria de Cristales: +'+a.res.gold+' de oro, +'+a.res.xp+' XP de cuenta, +'+a.res.use+' de maestría (sin tope '+a.res.raw.gold+')');
 assert.equal(a.P.modes.cw.wins,1);assert.equal(a.P.modes.cw.streak,1);assert.equal(a.P.modes.cw.trophies,25);assert(a.P.ach.pg_cw1,'logro Rompecristales');
 assert(await E(()=>save.quests.titles.includes('pg_rompe')),'título cosmético entregado');pass('racha 1, trofeos 25, logro «Rompecristales» y su título cosmético');
 const ls=await E(()=>JSON.parse(localStorage.getItem('laHordaSave_v1')).gold);assert.equal(ls,a.gold,'se escribió al localStorage');pass('la recompensa se escribió en el guardado real (localStorage)');
 assert.match(a.html,/RECOMPENSAS DE POSTGAME/);assert.match(a.html,/Oro de hoy/);assert.match(a.html,/faltan/);pass('resultado: muestra lo ganado y lo que falta del tope');
 // tope diario: sigue ganando hasta llenar
 let last=a,guard=0;while(!last.res.capped.gold&&guard++<6)last=await SETTLE('cw','win',300000);
 const D=await E(()=>POSTGAME_CFG.daily);
 assert.equal(last.P.goldToday,D.gold,'el oro de hoy llega EXACTO al tope '+D.gold);assert(last.res.gold<=last.res.raw.gold);pass('tope diario de oro: se corta exacto en '+D.gold+' (la última partida pagó '+last.res.gold+' de '+last.res.raw.gold+')');
 const gCap=last.gold;
 a=await SETTLE('cw','win',300000);assert.equal(a.res.gold,0);assert.equal(a.gold,gCap,'con el tope lleno no entra más oro');assert.match(a.html,/tope alcanzado/);assert(a.P.xpToday<=D.accountXp);pass('con el tope lleno: 0 de oro, el resultado dice «tope alcanzado»');
 assert(a.P.goldToday<=D.gold&&a.P.xpToday<=D.accountXp&&a.P.useToday<=D.masteryUse);pass('oro/XP/maestría de hoy nunca superan el tope ('+a.P.goldToday+'/'+D.gold+', '+a.P.xpToday+'/'+D.accountXp+', '+a.P.useToday+'/'+D.masteryUse+')');
 // reloj atrasado no devuelve el tope; día nuevo sí
 await E(()=>{window.__questsNow=new Date(2026,9,18,12,0,0).getTime();});a=await SETTLE('cw','win',300000);assert.equal(a.res.gold,0);pass('reloj atrasado un día: el tope NO se reinicia');
 await E(()=>{window.__questsNow=new Date(2026,9,20,12,0,0).getTime();});a=await SETTLE('cw','win',300000);assert(a.res.gold>0&&a.P.goldToday===a.res.gold);pass('día siguiente: el tope se reinicia y vuelve a pagar');
 // Entrenamiento y partida corta no pagan
 const gT=a.gold;a=await SETTLE('cw','win',300000,true);assert.equal(a.res.paid,false);assert.equal(a.gold,gT);assert.match(a.html,/ENTRENAMIENTO/);pass('Entrenamiento: no paga ni suma racha');
 a=await SETTLE('cw','win',60000);assert.equal(a.res.paid,false);assert.match(a.res.reason,/demasiado corta/);assert.equal(a.gold,gT);pass('partida de 60 s: no paga ("demasiado corta")');
 // derrota: paga menos y corta la racha; empate
 a=await SETTLE('cw','loss',300000);assert(a.res.raw.gold<expRaw);assert.equal(a.P.modes.cw.streak,0);assert(a.P.modes.cw.trophies>=0);pass('derrota: paga menos ('+a.res.raw.gold+'), racha a 0, trofeos '+a.P.modes.cw.trophies);
 // Coliseo
 a=await SETTLE('col','win',150000);assert.equal(a.res.paid,true);assert.equal(a.P.modes.col.wins,1);assert(a.P.ach.pg_col1&&a.P.ach.pg_colperf,'logros Campeón e Invicto del Coliseo');
 assert(await E(()=>save.quests.titles.includes('pg_campeon')&&save.quests.titles.includes('pg_invicto')));pass('Coliseo: campeón 3-0 → '+a.res.gold+' de oro sin tope '+a.res.raw.gold+', logros «Campeón» e «Invicto» con títulos');
 assert.match(a.html,/Racha/);pass('Coliseo: resultado con racha y trofeos');
 // el guardado real solo cambió lo permitido: cualquier otro campo igual
 r=await E(()=>{const before=JSON.stringify(save,(k,v)=>['gold','quests','postgame'].includes(k)&&this===save?undefined:v);return 1;});
 // online/otros roles no liquidan
 r=await E(()=>{lanesBegin('host');const x=postgameSettle(LN);lanesRestore();return x;});assert.equal(r,null);pass('sala online: postgameSettle no liquida nada');

 console.log('5) pantalla de resultado');
 await E(()=>{window.__questsNow=new Date(2026,9,21,12,0,0).getTime();setState('mainmenu');lanesStart({champ:'mago',seed:41});for(let i=0;i<30;i++)update(1000/60);LN.t=300000;player.pgKills=2;LN.team[player.team].tk=2;lanesFinish(player.team,'cristal');lanesShowResult();});
 await p.waitForSelector('#lanes-result:not(.hidden) .ln-res-pg',{timeout:120000});
 const txt=await E(()=>document.querySelector('#lanes-result .ln-res-pg').innerText);assert.match(txt,/RECOMPENSAS DE POSTGAME/);assert.match(txt,/Oro de hoy/);assert.match(txt,/XP de hoy/);assert.match(txt,/Racha/);pass('resultado en pantalla: "'+txt.replace(/\n+/g,' | ').slice(0,150)+'…"');
 const small=await E(()=>[...document.querySelectorAll('#lanes-result .ln-res-pg *')].filter(e=>{const cs=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0&&r.height>0&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)&&parseFloat(cs.fontSize)<14;}).map(e=>e.className+':'+e.textContent.slice(0,10)));
 assert.deepEqual(small,[],'letra >= 14 px en las recompensas');pass('recompensas con letra >= 14 px');
 await E(()=>{document.querySelector('#lanes-result .ln-exit').click();});
 assert.deepEqual(errs,[],'sin errores de página: '+errs.slice(0,3).join(' | '));
 await b.close();srv.kill();console.log('PASS postgame: '+ok+' comprobaciones');
})().catch(e=>{console.error(e);process.exit(1);});
