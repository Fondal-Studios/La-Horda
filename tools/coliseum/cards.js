'use strict';
/* Coliseo — CARTAS DE ARENA (Chromium, reloj virtual). Verifica: la oferta (3 distintas, 2 de ronda + 1 de torneo, semilla fija), que elegir
 * aplica de verdad (vida, velocidad, daño, escudo, recarga, último aliento, regeneración, anillo), que la de ronda vale UNA ronda y la de
 * torneo queda, los topes (por carta, por equipo y duros), que los bots eligen solos y vos, si no elegís, al azar a los 12 s, que no hay
 * oferta al terminar el torneo, y la pantalla en 844×390 y 667×375 (mismos botones que la carta de horda, sin texto cortado ni tapar controles).
 * Uso: node tools/coliseum/cards.js   (SHOTS=carpeta para guardar capturas) */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const PORT=8907,root=path.resolve(__dirname,'../..'),SHOTS=process.env.SHOTS||'';
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:root,stdio:'ignore'});
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
let browser,n=0;const ok=s=>{n++;console.log('ok  '+s);};
async function open(vp){
 const ctx=await browser.newContext({viewport:vp||{width:844,height:390},hasTouch:true});await ctx.addInitScript(f=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},FIX);
 const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof colStart==='function'&&typeof update==='function',null,{timeout:60000});
 await p.evaluate(()=>{save.tut=save.tut||{};save.tut.training=1;setState('mainmenu');});return {ctx,p,errs};
}
const done=async h=>{assert.deepEqual(h.errs,[],'sin errores de página: '+h.errs.join(' | '));await h.ctx.close();};
// helpers dentro de la página
const PAGE=()=>{
 window.__step=(secs,god)=>{for(let f=0;f<secs*60&&!LN.ended;f++){if(god)for(const h of heroes)h.invulnTimer=1e9;update(1000/60);}};
 window.__start=(champ,seed)=>{const o=Object.keys(CLASSES).filter(k=>championBotEligible(k)).sort().filter(k=>k!==champ);return colStart({champ,seed,mate:o[0],rivals:o.slice(1,7)});};   // (plantel fijo: la prueba no depende del azar)
 window.__loose=()=>{COL.WIN_POINTS=99;COL.MAX_ROUNDS=99;};   // (la prueba juega muchas rondas seguidas: que el torneo no termine antes)
 window.__toFight=()=>{let g=0;while(LN.col.phase!=='fight'&&!LN.ended&&g++<60*200)update(1000/60);if(LN.col.phase!=='fight')throw new Error('no llegó a la pelea: fase '+LN.col.phase+' ronda '+LN.col.round+' ended '+LN.ended);};
 // termina la ronda actual (duelos: gana el equipo de menor número; todos contra todos: se cae todo el mundo salvo `w`) y deja la fase «inter» con la oferta abierta
 window.__endRound=(w)=>{const c=LN.col;if(c.kind==='ffa'){for(const h of heroes)if(h.team!==(w==null?0:w)){h.invulnTimer=0;damageHero(h,1e9,{isPvp:true,from:null});if(h.alive){h.hp=0;h.alive=false;}}}else{colResolve(0,c.pairs[0][0]);colResolve(1,c.pairs[1][0]);}update(1000/60);};
};
const ids=p=>p.evaluate(()=>LN.team.map(T=>T.offer&&T.offer.slice()));

(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});

 /* ---- oferta ---- */
 { const h=await open();const p=h.p;await p.evaluate(PAGE);
   await p.evaluate(()=>__start('guerrero',3));
   assert.deepEqual(await ids(p),[null,null,null,null],'en la ronda 1 no hay oferta');
   await p.evaluate(()=>{__toFight();__endRound();});
   const o=await ids(p);assert.ok(o.every(x=>x&&x.length===3),'cada equipo recibe 3 cartas');
   for(const x of o)assert.equal(new Set(x).size,3,'distintas');
   const scopes=await p.evaluate(()=>LN.team.map(T=>T.offer.map(id=>COL_CARDS[id].scope)));for(const s of scopes){assert.deepEqual(s,['ronda','ronda','torneo'],'2 de ronda + 1 de torneo');}
   // misma semilla → misma oferta
   const first=o;await p.evaluate(()=>{lanesStop();__start('guerrero',3);__toFight();__endRound();});assert.deepEqual(await ids(p),first,'semilla fija = oferta reproducible');
   await done(h);ok('oferta: 3 distintas (2 de ronda + 1 de torneo), solo después de la ronda 1 y reproducible'); }

 /* ---- efectos de cada carta ---- */
 { const h=await open();const p=h.p;await p.evaluate(PAGE);
   const cdLoss=()=>p.evaluate(()=>{__toFight();const h=player;h.cds=[10000,10000,10000];h.ultCd=10000;for(let f=0;f<60;f++){for(const o of heroes)o.invulnTimer=1e9;player.stunTimer=0;update(1000/60);}return {a:10000-h.cds[0],u:10000-h.ultCd};});
   const pickAs=(card)=>p.evaluate(card=>{const T=LN.team[0];if(!T.offer){__toFight();__endRound();}T.offer=[card,T.offer[1],T.offer[2]];return colPickCard(0,0);},card);
   await p.evaluate(()=>{__loose();__start('guerrero',4);});
   const base=await p.evaluate(()=>({hp:player._colHp0,spd:player._colSpd0,maxHp:player.maxHp}));assert.equal(base.hp,base.maxHp);
   // ronda 1 → 2 con «Piel de ceniza»
   assert.equal(await pickAs('piel'),true);await p.evaluate(()=>{LN.team[0].offer=null;});
   assert.equal(await p.evaluate(()=>LN.team[0].pick),'piel');
   await p.evaluate(()=>{for(const T of LN.team)T.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});
   let r=await p.evaluate(()=>({round:LN.col.round,phase:LN.col.phase,max:player.maxHp,hp:player.hp,mate:heroes[1].maxHp,mate0:heroes[1]._colHp0,foe:heroes[2].maxHp,foe0:heroes[2]._colHp0,pick:LN.team[0].pick,act:LN.team[0].activePick}));
   assert.equal(r.round,2);assert.equal(r.phase,'prep');assert.equal(r.max,Math.round(base.hp*1.15),'+15% de vida');assert.equal(r.hp,r.max);assert.equal(r.mate,Math.round(r.mate0*1.15),'también el compañero');assert.equal(r.foe,r.foe0,'los rivales sin carta no cambian');assert.equal(r.pick,null);assert.equal(r.act,'piel');
   const base1=await cdLoss();assert.ok(base1.a>900&&base1.a<=1010,'sin carta de recarga: 1 s = 1.000 ms '+JSON.stringify(base1));
   // ronda 2 → 3 (todos contra todos): «Marcha forzada»; la carta de ronda anterior ya no vale
   await p.evaluate(()=>{__toFight();__endRound();});assert.equal(await pickAs('paso'),true);
   await p.evaluate(()=>{for(const T of LN.team)T.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});
   r=await p.evaluate(()=>({round:LN.col.round,kind:LN.col.kind,max:player.maxHp,spd:player.baseSpeed,mods:LN.team[0].mods}));
   assert.equal(r.round,3);assert.equal(r.kind,'ffa');assert.equal(r.max,base.hp,'la carta de ronda de la ronda 2 ya expiró');assert.ok(Math.abs(r.spd-base.spd*1.10)<1e-6,'+10% de velocidad: '+r.spd+' vs '+base.spd);
   // escudo de brasas
   await p.evaluate(()=>{__toFight();__endRound();});await pickAs('escudo');await p.evaluate(()=>{for(const T of LN.team)T.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});
   r=await p.evaluate(()=>({sh:player.shield,max:player.maxHp,spd:player.baseSpeed,r:LN.col.round}));assert.equal(r.r,4);assert.equal(r.sh,Math.round(r.max*0.18),'escudo del 18% de la vida');assert.equal(r.spd,base.spd,'la velocidad volvió a la normal');
   // el escudo absorbe de verdad y dura solo los primeros ~22 s
   const abs=await p.evaluate(()=>{__toFight();player.invulnTimer=0;const hp0=player.hp,sh0=player.shield;damageHero(player,sh0/2,{isPvp:true,from:null});return {lostHp:hp0-player.hp,shLeft:player.shield,sh0};});
   assert.ok(abs.lostHp<abs.sh0*0.05&&abs.shLeft<abs.sh0,'el escudo absorbió el golpe '+JSON.stringify(abs));
   // mente fría: las esperas bajan más rápido (≈ ×1,136)
   await p.evaluate(()=>{__endRound();});await pickAs('mente');await p.evaluate(()=>{for(const T of LN.team)T.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});
   const cd=await cdLoss();assert.ok(cd.a/base1.a>1.12&&cd.a/base1.a<1.16&&cd.u/base1.a>1.12,'recarga −12% (×1,136): '+JSON.stringify({cd,base1}));
   // último aliento: una sola vez por ronda
   await p.evaluate(()=>{__endRound();});await pickAs('aliento');await p.evaluate(()=>{for(const T of LN.team)T.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});
   const la=await p.evaluate(()=>{__toFight();const h=heroes[1];for(const o of heroes)o.invulnTimer=1e9;h.hp=h.maxHp*0.25;update(1000/60);const a=h.hp/h.maxHp;h.hp=h.maxHp*0.25;update(1000/60);return {first:a,second:h.hp/h.maxHp};});
   assert.ok(Math.abs(la.first-0.45)<0.02,'cura el 20% al bajar del 30%: '+la.first);assert.ok(la.second<0.3,'solo una vez por ronda: '+la.second);
   await done(h);ok('efectos: vida, velocidad, escudo, recarga y último aliento; la carta de ronda expira al terminar la ronda'); }

 /* ---- daño, regeneración, anillo (cartas de torneo) ---- */
 { const h=await open();const p=h.p;await p.evaluate(PAGE);
   await p.evaluate(()=>{__loose();__start('mago',5);});
   // daño real contra un avatar: sin carta vs con «Garras afiladas» (+12 %) y «Temple» (+5 %)
   const dmg=()=>p.evaluate(()=>{__toFight();const P=enemies.find(e=>e.lanesProxy&&e.kind==='hero'&&e.team!==0&&e.lnRef.pit===player.pit);let s=0;for(let i=0;i<300;i++){P.hp=LANES_BIG;damageEnemy(P,100,{src:player,noCrit:true});s+=LANES_BIG-P.hp;}return s/300;});
   const d0=await dmg();
   await p.evaluate(()=>{__endRound();const T=LN.team[0];T.offer=['garras','temple','piel'];colPickCard(0,0);for(const t of LN.team)t.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});
   const d1=await dmg();assert.equal(await p.evaluate(()=>colDmgMult(player)),1.12,'multiplicador de «Garras afiladas»');assert.ok(Math.abs(d1/d0-1.12)<0.08,`+12% de daño real: ${d1/d0}`);
   await p.evaluate(()=>{__endRound();const T=LN.team[0];T.offer=['temple','piel','garras'];colPickCard(0,0);for(const t of LN.team)t.offer=null;});
   assert.equal(await p.evaluate(()=>LN.team[0].cards.temple),1,'«Temple» (torneo) queda anotada');
   await p.evaluate(()=>{for(const t of LN.team)t.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});   // ronda 3 (todos contra todos)
   assert.equal(await p.evaluate(()=>LN.col.round),3);const d2=await dmg();assert.equal(await p.evaluate(()=>colDmgMult(player)),1.05,'solo «Temple» (la de ronda expiró)');assert.ok(Math.abs(d2/d0-1.05)<0.08,`solo «Temple» (+5%): ${d2/d0}`);
   // regeneración 0,8 %/s
   await p.evaluate(()=>{__endRound();const T=LN.team[0];T.offer=['cierra','piel','garras'];colPickCard(0,0);for(const t of LN.team)t.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});
   const rgd=await p.evaluate(()=>{__toFight();const h0=heroes[1];for(const o of heroes)o.invulnTimer=1e9;h0.hp=h0.maxHp*0.5;const a=h0.hp;__step(2,true);const c=LN.col;return {v:(h0.hp-a)/h0.maxHp,phase:c.phase,round:c.round,kind:c.kind,res:c.res.map(Boolean),alive:h0.alive,M:h0._colM&&h0._colM.regen,team:h0.team,cards:LN.team[0].cards,pit:h0.pit};});const rg=rgd.v;
   assert.ok(Math.abs(rg-0.016)<0.003,'0,8% por segundo durante 2 s: '+JSON.stringify(rgd));
   await done(h);ok('daño real +12 % / +5 %, regeneración 0,8 %/s: aplicados de verdad y la de torneo se queda'); }
 { const h=await open();const p=h.p;await p.evaluate(PAGE);
   await p.evaluate(()=>{__loose();__start('tanque',6);});
   // «Piel de piedra»: el anillo duele 40 % menos (mismo héroe, misma ronda, con y sin la carta)
   const ring=()=>p.evaluate(()=>{__toFight();const c=LN.col;for(const o of heroes){o.invulnTimer=0;if(o!==player){o.stunTimer=1e9;o.invulnTimer=1e9;}}const ctr=colPitCenter(player.pit);
     c.t0=LN.t-(COL.RING_START_MS+COL.RING_SHRINK_MS*0.5);player.x=ctr.x+300;player.y=ctr.y;player.hp=player.maxHp;player.shield=0;const a=player.hp;
     for(let f=0;f<30;f++){player.x=ctr.x+300;player.y=ctr.y;update(1000/60);}return (a-player.hp)/player.maxHp;});
   const r0=await ring();assert.ok(r0>0.02,'el anillo duele: '+r0);
   await p.evaluate(()=>{LN.col.phase='fight';__endRound();const T=LN.team[0];T.offer=['piedra','piel','garras'];colPickCard(0,0);for(const t of LN.team)t.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});
   const r1=await ring();assert.ok(Math.abs(r1/r0-0.6)<0.08,`anillo −40 %: ${r1/r0}`);
   await done(h);ok('«Piel de piedra»: el anillo duele 40 % menos'); }

 /* ---- topes ---- */
 { const h=await open();const p=h.p;await p.evaluate(PAGE);
   const r=await p.evaluate(()=>{
     const out={};
     out.maxed=colModsOf({temple:2,robusto:2,cierra:2,piedra:1},'garras');out.maxed2=colModsOf({temple:2,robusto:2,cierra:2,piedra:1},'piel');out.tornCount=colTournCount({temple:2,robusto:1});
     // 3.000 combinaciones al azar: ningún acumulado pasa los topes duros
     let bad=0;const R=()=>Math.random();const ron=COL_CARD_IDS.filter(i=>COL_CARDS[i].scope==='ronda'),tor=COL_CARD_IDS.filter(i=>COL_CARDS[i].scope==='torneo');
     for(let i=0;i<3000;i++){const cards={};for(const id of tor)cards[id]=(R()*5)|0;const m=colModsOf(cards,ron[(R()*ron.length)|0]),C=COL.CARD_CAP;if(m.hp>C.hp+1e-9||m.dmg>C.dmg+1e-9||m.spd>C.spd+1e-9||m.cdr>C.cdr+1e-9||m.shield>C.shield+1e-9||m.regen>C.regen+1e-9||m.ring<C.ring-1e-9||m.last>C.last+1e-9||m.hp<1||m.dmg<1)bad++;}
     out.bad=bad;
     // topes por oferta: con 3 cartas de torneo ya tomadas no se ofrece ninguna de torneo; con el máximo de una carta tampoco esa
     __start('guerrero',8);__toFight();const T=LN.team[0];T.cards={temple:2,piedra:1};__endRound();out.capOffer=T.offer.map(id=>COL_CARDS[id].scope);
     T.cards={temple:2,robusto:1};T.offer=['temple','robusto','piel'];out.overCap=colPickCard(0,0);out.overCapCount=colTournCount(T.cards);   // ya hay 3: una más no entra
     T.cards={temple:2};T.offer=['temple','piel','garras'];out.overMax=colPickCard(0,0);out.overMaxN=T.cards.temple;
     T.cards={};out.badIdx=[colPickCard(0,7),colPickCard(0,-1)];
     return out;});
   assert.ok(r.maxed.dmg<=1.2+1e-9&&r.maxed.hp<=1.25&&r.maxed.regen<=0.016+1e-9,'topes duros '+JSON.stringify(r.maxed));assert.equal(r.maxed.dmg,1.2,'1,05²×1,12 = 1,23 → tope 1,20');assert.equal(r.maxed2.hp,1.25,'1,06²×1,15 = 1,29 → tope 1,25');assert.equal(r.tornCount,3);
   assert.equal(r.bad,0,'3.000 combinaciones al azar dentro de los topes');
   assert.deepEqual(r.capOffer,['ronda','ronda','ronda'],'con el tope de torneo lleno solo se ofrecen cartas de ronda');
   assert.equal(r.overCap,false);assert.equal(r.overCapCount,3);assert.equal(r.overMax,false,'una carta no pasa de su máximo');assert.equal(r.overMaxN,2);assert.deepEqual(r.badIdx,[false,false],'índices inválidos');
   await done(h);ok('topes: por carta, 3 de torneo por equipo, y topes duros del acumulado (3.000 combinaciones)'); }

 /* ---- bots y tiempo límite ---- */
 { const h=await open();const p=h.p;await p.evaluate(PAGE);
   await p.evaluate(()=>__start('soporte',9));await p.evaluate(()=>{__toFight();__endRound();});
   assert.ok((await ids(p)).every(Boolean));
   await p.evaluate(()=>__step(5,true));   // los bots eligen solos en <= 4,5 s; la tuya espera
   const a=await p.evaluate(()=>LN.team.map(T=>({off:!!T.offer,took:!!T.pick||colTournCount(T.cards)>0})));
   assert.equal(a[0].off,true,'la oferta del jugador espera');assert.ok(a.slice(1).every(x=>!x.off&&x.took),'los bots eligieron solos: '+JSON.stringify(a));
   assert.equal(await p.evaluate(()=>LN.col.phase),'inter','y la ronda no arranca mientras no elijas');
   await p.evaluate(()=>__step(8,true));   // 13 s en total: se elige sola
   const b=await p.evaluate(()=>({off:!!LN.team[0].offer,took:!!LN.team[0].pick||colTournCount(LN.team[0].cards)>0,round:LN.col.round,phase:LN.col.phase}));
   assert.equal(b.off,false);assert.equal(b.round,2,'arrancó la ronda 2');
   // al terminar el torneo no hay oferta
   await p.evaluate(()=>{__toFight();LN.team[0].points=COL.WIN_POINTS-1;colResolve(0,LN.col.pairs[0][0]===0?0:LN.col.pairs[0][0]);colResolve(1,LN.col.pairs[1][0]);update(1000/60);});
   assert.deepEqual(await ids(p),[null,null,null,null],'sin oferta cuando el torneo ya está decidido');
   await done(h);ok('bots eligen solos, la oferta del jugador se elige sola a los 12 s y no hay oferta al terminar el torneo'); }

 /* ---- pantalla ---- */
 for(const [w,hh] of [[844,390],[667,375]]){
   const h=await open({width:w,height:hh});const p=h.p;await p.evaluate(PAGE);
   await p.evaluate(()=>__start('guerrero',3));await p.evaluate(()=>{__toFight();__endRound();});
   await p.waitForSelector('.col-cards:not(.hidden) .ln-card');await p.waitForTimeout(150);
   const ui=await p.evaluate(()=>{
     const R=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};};
     const box=R('.col-cards'),cards=[...document.querySelectorAll('.col-cards .ln-card')].map(c=>{const r=c.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),sw:c.scrollWidth-c.clientWidth,sh:c.scrollHeight-c.clientHeight,name:c.querySelector('b').textContent};});
     const small=[...document.querySelectorAll('.col-cards *')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)&&parseFloat(cs.fontSize)<14;}).map(e=>e.className);
     const clip=[...document.querySelectorAll('.col-cards .ln-card *')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.className+':'+e.textContent.slice(0,16));
     const controls=['btn-s1','btn-s2','btn-s3','btn-ult','btn-basic','pause-btn'].map(id=>[id,R('#'+id)]).filter(x=>x[1]&&x[1].w>0);
     const hit=controls.filter(([id,r])=>!(r.r<=box.l||r.l>=box.r||r.b<=box.t||r.t>=box.b)).map(x=>x[0]);
     const sc=R('.col-score'),note=R('.col-note'),css=getComputedStyle(document.querySelector('.col-cards .ln-card')).minHeight,lnCss=(()=>{const e=document.createElement('div');return null;})();
     return {box,cards,small,clip,hit,scoreBottom:sc.b,noteBottom:note&&note.h?note.b:0,vw:innerWidth,vh:innerHeight,css,title:document.querySelector('.col-cards .ln-cards-title').textContent,fr:[...document.querySelectorAll('.col-cards .ln-card small')].map(s=>s.textContent)};});
   if(SHOTS) await p.screenshot({path:path.join(SHOTS,`cards-${w}x${hh}.png`)});
   assert.equal(ui.cards.length,3);assert.ok(ui.box.l>=0&&ui.box.r<=ui.vw&&ui.box.t>=0&&ui.box.b<=ui.vh,w+': las cartas entran en pantalla '+JSON.stringify(ui.box));
   assert.ok(ui.cards.every(c=>c.h>=48&&c.w>=48&&c.h===ui.cards[0].h&&Math.abs(c.w-ui.cards[0].w)<=1),w+': tres botones iguales y grandes '+JSON.stringify(ui.cards));
   assert.ok(ui.cards.every(c=>c.sw<=1&&c.sh<=1),w+': sin texto cortado '+JSON.stringify(ui.cards));assert.deepEqual(ui.clip,[],w+': nada desborda');assert.deepEqual(ui.small,[],w+': letra < 14 px');
   assert.deepEqual(ui.hit,[],w+': las cartas no tapan botones de juego');assert.ok(ui.box.t>=ui.scoreBottom,w+': no tapan el marcador');assert.ok(ui.box.t>=ui.noteBottom-1,w+': ni el aviso');
   assert.match(ui.fr.join('|'),/Próxima ronda/);assert.match(ui.fr.join('|'),/Todo el torneo/);
   // el alto es el mismo que el de la carta de horda de Guerra de Cristales (mismo CSS)
   const cwH=await p.evaluate(()=>{const row=document.createElement('div');row.className='lanes-hud';const c=document.createElement('div');c.className='ln-cards';c.style.visibility='hidden';c.innerHTML='<div class="ln-cards-row"><button class="ln-card">x</button></div>';row.appendChild(c);document.body.appendChild(row);const h=getComputedStyle(c.querySelector('.ln-card')).minHeight;row.remove();return h;});
   assert.equal(ui.css,cwH,w+': mismo alto mínimo que la carta de horda ('+cwH+')');
   // elegir con un toque
   const names=ui.cards.map(c=>c.name);await p.click('.col-cards .ln-card[data-i="1"]');
   assert.equal(await p.evaluate(()=>document.querySelector('.col-cards').classList.contains('hidden')),true,'la oferta se cierra al elegir');
   const took=await p.evaluate(()=>{const T=LN.team[0];return T.pick||Object.keys(T.cards).find(k=>T.cards[k]);});assert.ok(took,'la carta elegida quedó anotada');
   // el resumen de cartas activas aparece en el aviso de la ronda siguiente
   await p.evaluate(()=>{for(const T of LN.team)T.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);__toFight();update(1000/60);colHudTick();});
   const hand=await p.evaluate(()=>document.querySelector('.col-note').textContent);assert.match(hand,/★ /,w+': el aviso lista tus cartas activas: '+hand);
   const noteOv=await p.evaluate(()=>{const e=document.querySelector('.col-note');return e.scrollWidth>e.clientWidth+1;});assert.equal(noteOv,false);
   await done(h);ok(`pantalla de cartas ${w}x${hh}: 3 botones iguales (${ui.cards[0].w}×${ui.cards[0].h}), sin texto cortado, sin tapar controles`);
 }
 await browser.close();srv.kill();console.log('PASS coliseo cartas: '+n+' grupos');
})().catch(async e=>{console.error(e);try{await browser.close();}catch{}srv.kill();process.exit(1);});
