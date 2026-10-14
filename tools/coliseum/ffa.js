'use strict';
/* Coliseo — RONDA «TODOS CONTRA TODOS» (Chromium, reloj virtual). Verifica: cada 3.ª ronda (3, 6, 9; la 9.ª es la final) las cuatro duplas
 * pelean en el foso grande del medio; los duelos 2v2 de las otras rondas siguen su ciclo; puesto por equipo según quién cae (puntos 2/1/0/0),
 * desempate por tiempo (más vida), sin fuego amigo dentro de la dupla, anillo que se cierra y mata, espectador, marcador y mapa,
 * y que un torneo se puede decidir en esa ronda. Pantalla en 844×390 y 667×375.
 * Uso: node tools/coliseum/ffa.js   (SHOTS=carpeta para guardar capturas) */
const {chromium}=require('playwright');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');
const PORT=8908,root=path.resolve(__dirname,'../..'),SHOTS=process.env.SHOTS||'';
const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:root,stdio:'ignore'});
const FIX={tut:{training:1},starterChosen:true,starterGiftV1:true,starterSkin:'vale',playtestV1Bonus:true,campaignResetV1:true,campaignResetV2:true};
let browser,n=0;const ok=s=>{n++;console.log('ok  '+s);};
async function open(vp){
 const ctx=await browser.newContext({viewport:vp||{width:844,height:390},hasTouch:true});await ctx.addInitScript(f=>{try{localStorage.setItem('laHordaSave_v1',JSON.stringify(f));}catch(e){}},FIX);
 const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`http://127.0.0.1:${PORT}/index.html?lazy=0`);await p.waitForFunction(()=>typeof colStart==='function'&&typeof update==='function',null,{timeout:60000});
 await p.evaluate(()=>{save.tut=save.tut||{};save.tut.training=1;setState('mainmenu');});
 await p.evaluate(()=>{
  window.__start=(champ,seed)=>{const o=Object.keys(CLASSES).filter(k=>championBotEligible(k)).sort().filter(k=>k!==champ);return colStart({champ,seed,mate:o[0],rivals:o.slice(1,7)});};   // (plantel fijo: la prueba no depende del azar)
  window.__step=(secs,god)=>{for(let f=0;f<secs*60&&!LN.ended;f++){if(god)for(const h of heroes)h.invulnTimer=1e9;update(1000/60);}};
  window.__toFight=()=>{let g=0;while(LN.col.phase!=='fight'&&!LN.ended&&g++<60*200)update(1000/60);if(LN.col.phase!=='fight')throw new Error('no llegó a la pelea: fase '+LN.col.phase+' ronda '+LN.col.round+' ended '+LN.ended);};
  window.__kill=t=>{for(const h of heroes)if(h.team===t&&h.alive){h.invulnTimer=0;damageHero(h,1e9,{isPvp:true,from:null});if(h.alive){h.hp=0;h.alive=false;}}};   // (algún campeón evita morir: se lo fuerza)
  window.__toInter=()=>{let g=0;while(LN.col.phase!=='inter'&&g++<60*400)update(1000/60);};
  // pasa la fase de resultados sin elegir carta: las ofertas se resuelven solas y arranca la ronda siguiente
  window.__next=()=>{for(const T of LN.team)T.offer=null;LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);};
  // juega una ronda de duelos como empate (para que el torneo siga)
  window.__drawDuels=()=>{__toFight();colResolve(0,-1);colResolve(1,-1);update(1000/60);};
 });
 return {ctx,p,errs};
}
const done=async h=>{assert.deepEqual(h.errs,[],'sin errores de página: '+h.errs.join(' | '));await h.ctx.close();};

(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});

 /* ---- calendario: 3, 6 y 9 son todos contra todos; los duelos siguen su ciclo ---- */
 { const h=await open();const p=h.p;
   const rounds=await p.evaluate(()=>{__start('guerrero',2);const out=[];
     for(let r=1;r<=9;r++){const c=LN.col;out.push({round:c.round,kind:c.kind,pairs:c.kind==='duel'?JSON.stringify(c.pairs):'-',pit:[...new Set(heroes.map(x=>x.pit))].join(',')});
       if(c.kind==='ffa'){__toFight();for(const T of LN.team){T.points=0;}__kill(1);__kill(2);__kill(3);update(1000/60);for(const T of LN.team)T.points=0;}   // (se anula el puntaje para que el torneo no termine antes de la ronda 9)
       else __drawDuels();
       if(r<9)__next(); else break;}
     return {out,over:colOver(),phase:LN.col.phase};});
   assert.deepEqual(rounds.out.map(r=>r.kind),['duel','duel','ffa','duel','duel','ffa','duel','duel','ffa'],'cada 3.ª ronda es todos contra todos');
   const P=COL_PAIRINGS_JSON();function COL_PAIRINGS_JSON(){return [[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]].map(x=>JSON.stringify(x));}
   assert.deepEqual(rounds.out.filter(r=>r.kind==='duel').map(r=>r.pairs),[P[0],P[1],P[2],P[0],P[1],P[2]],'los tres emparejamientos siguen su ciclo aunque haya rondas de todos contra todos en el medio');
   assert.deepEqual(rounds.out.filter(r=>r.kind==='ffa').map(r=>r.pit),['2','2','2'],'todos en el foso del medio');assert.equal(rounds.out.filter(r=>r.kind==='duel').every(r=>r.pit==='0,1'),true);
   assert.equal(rounds.over,true,'la ronda 9 (final) cierra el torneo');
   await done(h);ok('calendario: rondas 3, 6 y 9 (la última es la final) son todos contra todos; los duelos 2v2 conservan su ciclo'); }

 /* ---- arranque de la ronda ---- */
 { const h=await open();const p=h.p;
   await p.evaluate(()=>{__start('guerrero',2);__drawDuels();__next();__toFight();colResolve(0,-1);colResolve(1,-1);update(1000/60);__next();});   // llega a la ronda 3
   const s=await p.evaluate(()=>{const c=LN.col,ctr=colPitCenter(2),R=colPitR(2);
     const ds=heroes.map(h=>({t:h.team,pit:h.pit,d:Math.hypot(h.x-ctr.x,h.y-ctr.y),inv:h.invulnTimer>0,fx:h.fx,fy:h.fy,x:h.x,y:h.y,alive:h.alive,hp:h.hp===h.maxHp}));
     const mates=[0,1,2,3].map(t=>{const a=heroes.filter(h=>h.team===t);return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);});
     const quad=[0,1,2,3].map(t=>{const a=heroes.filter(h=>h.team===t);return {x:(a[0].x+a[1].x)/2-ctr.x,y:(a[0].y+a[1].y)/2-ctr.y};});
     const fac=heroes.map(h=>((ctr.x-h.x)*h.fx+(ctr.y-h.y)*h.fy)>0);
     return {round:c.round,kind:c.kind,phase:c.phase,ringR:c.ringR,R,ds,mates,quad,fac,res:c.res,n:heroes.length,r440:COL.PIT_RS[2],pits:COL.PITS.length,center:ctr};});
   assert.equal(s.round,3);assert.equal(s.kind,'ffa');assert.equal(s.phase,'prep');assert.equal(s.n,8);assert.equal(s.ringR,440);assert.equal(s.pits,3);
   assert.ok(s.ds.every(d=>d.pit===2&&d.d<s.R-16&&d.inv&&d.alive&&d.hp),'los ocho en el foso grande, vivos, con vida plena e invulnerables en la cuenta regresiva');
   assert.ok(s.mates.every(m=>m>60&&m<160),'cada dupla junta: '+s.mates);
   assert.ok(s.quad.every(q=>Math.hypot(q.x,q.y)>150),'las duplas arrancan separadas');
   const dirs=s.quad.map(q=>Math.round(Math.atan2(q.y,q.x)/(Math.PI/2)));assert.equal(new Set(dirs.map(d=>((d%4)+4)%4)).size,4,'una dupla en cada punto cardinal: '+dirs);
   assert.equal(s.quad[0].y>0,true,'tu dupla, abajo');
   await done(h);ok('arranque: ocho luchadores en el foso grande, cuatro duplas en cruz, invulnerables en la cuenta regresiva'); }

 /* ---- puestos y puntos ---- */
 { const h=await open();const p=h.p;
   await p.evaluate(()=>{__start('guerrero',2);__drawDuels();__next();__drawDuels();__next();__toFight();});
   const r=await p.evaluate(()=>{
     const c=LN.col;for(const T of LN.team)T.points=0;
     // cae el equipo 1 (primero), después el 3, después el 2 → queda el 0
     __kill(1);__step(0.1,false);__kill(3);__step(0.1,false);const mid={out:c.ffaOut.slice(),phase:c.phase,res:!!c.res[2]};__kill(2);update(1000/60);
     return {mid,order:c.order,pts:LN.team.map(T=>T.points),ffaPts:LN.team.map(T=>T.ffaPts),ffa:LN.team.map(T=>T.ffa),ffaWins:LN.team.map(T=>T.ffaWins),duels:LN.team.map(T=>T.duels),wins:LN.team.map(T=>T.wins),last:c.last,phase:c.phase,over:colOver(),blocked:heroes.every(h=>true)};});
   assert.deepEqual(r.mid.out,[1,3],'orden de caída');assert.equal(r.mid.phase,'fight');assert.equal(r.mid.res,false,'con dos equipos en pie sigue la ronda');
   assert.deepEqual(r.order,[0,2,3,1],'puestos: 1.º el último en pie, después el último en caer…');assert.deepEqual(r.pts,[2,0,1,0],'1.º suma 2 puntos, 2.º suma 1');assert.deepEqual(r.ffaPts,r.pts);assert.deepEqual(r.ffa,[1,1,1,1]);assert.deepEqual(r.ffaWins,[1,0,0,0]);
   assert.deepEqual(r.duels,[2,2,2,2],'los puntos de esta ronda no cuentan como duelo');assert.equal(r.last,'¡GANASTE! +2 PUNTOS');assert.equal(r.phase,'inter');
   // nadie pierde vida cuando la ronda terminó
   const prot=await p.evaluate(()=>{const a=heroes.find(h=>h.alive);const hp0=a.hp;a.invulnTimer=0;damageHero(a,50,{isPvp:true,from:null});update(1000/60);return {hp0,hp1:a.hp,blocked:colBlocksDamage({lanesProxy:true,kind:'hero',lnRef:a})};});assert.equal(prot.blocked,true,'terminada la ronda, nadie recibe golpes');
   // tu equipo 2.º → +1 punto; tu equipo 3.º → sin puntos
   const alt=await p.evaluate(()=>{__next();__toFight();const c=LN.col;const kind=c.kind;return {kind,round:c.round};});assert.equal(alt.kind,'duel');assert.equal(alt.round,4);
   await done(h);ok('puestos: el último en pie gana 2 puntos, el 2.º 1; no cuenta como duelo; terminada la ronda nadie recibe golpes'); }
 { const h=await open();const p=h.p;
   await p.evaluate(()=>{__start('guerrero',2);__drawDuels();__next();__drawDuels();__next();__toFight();for(const T of LN.team)T.points=0;});
   const a=await p.evaluate(()=>{__kill(0);update(1000/60);__kill(2);update(1000/60);__kill(1);update(1000/60);return {order:LN.col.order,pts:LN.team.map(T=>T.points),last:LN.col.last};});
   assert.deepEqual(a.order,[3,1,2,0]);assert.deepEqual(a.pts,[0,1,0,2]);assert.equal(a.last,'PUESTO 4. · SIN PUNTOS','tu equipo cayó primero');
   await p.evaluate(()=>{__next();__drawDuels();__next();__drawDuels();__next();__toFight();for(const T of LN.team)T.points=0;});   // ronda 6 (otro todos contra todos)
   assert.equal(await p.evaluate(()=>LN.col.kind),'ffa');
   const b=await p.evaluate(()=>{__kill(3);update(1000/60);__kill(0);update(1000/60);__kill(1);update(1000/60);return {order:LN.col.order,last:LN.col.last,pts:LN.team.map(T=>T.points)};});
   assert.deepEqual(b.order,[2,1,0,3]);assert.equal(b.last,'PUESTO 3. · SIN PUNTOS');
   // dos equipos caen en el mismo cuadro: se desempata por bajas (y después por número de equipo)
   await p.evaluate(()=>{__next();__drawDuels();__next();__drawDuels();__next();__toFight();for(const T of LN.team)T.points=0;LN.team[2].pk=3;LN.team[1].pk=0;});   // ronda 9
   const c=await p.evaluate(()=>{__kill(1);__kill(2);__kill(3);update(1000/60);return {order:LN.col.order,out:LN.col.ffaOut};});
   assert.equal(c.order[0],0,'el último en pie gana');assert.equal(new Set(c.order).size,4);assert.ok(c.order.indexOf(2)<c.order.indexOf(1),'a igual caída, más bajas = mejor puesto');
   await done(h);ok('puestos: tu equipo cae 1.º → último; 3.º → sin puntos; empate de caída se desempata por bajas'); }
 { const h=await open();const p=h.p;
   await p.evaluate(()=>{__start('guerrero',2);__drawDuels();__next();__drawDuels();__next();__toFight();for(const T of LN.team)T.points=0;});
   const r=await p.evaluate(()=>{const c=LN.col;for(const o of heroes)o.invulnTimer=1e9;   // sin ring ni golpes: se acaba el tiempo
     const hp={0:0.7,1:1,2:0.5,3:0.9};for(const o of heroes)o.hp=o.maxHp*hp[o.team];c.t0=LN.t-COL.FFA_ROUND_MS+60;for(let i=0;i<8;i++)update(1000/60);
     return {order:c.order,pts:LN.team.map(T=>T.points),res:!!c.res[2]};});
   assert.deepEqual(r.order,[1,3,0,2],'al agotarse el tiempo gana el equipo con más vida');assert.deepEqual(r.pts,[0,2,0,1]);
   assert.equal(r.pts.reduce((a,b)=>a+b,0),3);
   await done(h);ok('tiempo agotado (90 s): los puestos se ordenan por vida restante'); }

 /* ---- sin fuego amigo, anillo, espectador ---- */
 { const h=await open();const p=h.p;
   await p.evaluate(()=>{__start('mago',12);__drawDuels();__next();__drawDuels();__next();__toFight();for(const o of heroes)o.invulnTimer=0;});
   const ff=await p.evaluate(()=>{const mate=heroes.find(x=>x.team===player.team&&x!==player),foe=heroes.find(x=>x.team!==player.team);
     const Pm=enemies.find(e=>e.lanesProxy&&e.lnRef===mate),Pf=enemies.find(e=>e.lanesProxy&&e.lnRef===foe);Pm.hp=LANES_BIG;Pf.hp=LANES_BIG;
     damageEnemy(Pm,200,{src:player,noCrit:true});damageEnemy(Pf,200,{src:player,noCrit:true});
     return {mate:LANES_BIG-Pm.hp,foe:LANES_BIG-Pf.hp,hpMate:mate.hp===mate.maxHp};});
   assert.equal(ff.mate,0,'los golpes de tu equipo no tocan a tu compañero');assert.ok(ff.foe>0,'pero sí a los rivales ('+ff.foe+')');
   // el anillo: 440 → 130 desde los 24 s, en 42 s
   const ring=await p.evaluate(()=>{const c=LN.col,out=[];for(const o of heroes)o.invulnTimer=1e9;
     for(const s of [0,COL.FFA_RING_START_MS,COL.FFA_RING_START_MS+COL.FFA_RING_SHRINK_MS/2,COL.FFA_RING_START_MS+COL.FFA_RING_SHRINK_MS]){c.t0=LN.t-s;update(1000/60);out.push(Math.round(c.ringR));}
     return out;});
   assert.deepEqual(ring,[440,440,285,130],'el anillo se achica de 440 a 130: '+ring);
   // quien queda afuera del anillo pierde vida y cae (el equipo 1 se queda sin gente → queda fuera)
   const rk=await p.evaluate(()=>{const c=LN.col,ctr=colPitCenter(2);for(const o of heroes){o.invulnTimer=0;if(o.team!==1){o.invulnTimer=1e9;o.x=ctr.x;o.y=ctr.y;}else{o.x=ctr.x+330;o.y=ctr.y;}}
     c.t0=LN.t-(COL.FFA_RING_START_MS+COL.FFA_RING_SHRINK_MS);const ev=[];for(let f=0;f<60*30&&!c.ffaOut.includes(1);f++){for(const o of heroes)if(o.team===1&&o.alive){o.x=ctr.x+330;o.y=ctr.y;}update(1000/60);}
     return {out:c.ffaOut.slice(),alive:heroes.filter(o=>o.team===1&&o.alive).length};});
   assert.deepEqual(rk.out,[1],'el anillo sacó al equipo 1');assert.equal(rk.alive,0);
   await done(h);ok('sin fuego amigo dentro de la dupla; anillo 440→130 y elimina a quien queda afuera'); }
 { const h=await open();const p=h.p;
   await p.evaluate(()=>{__start('tanque',13);__drawDuels();__next();__drawDuels();__next();__toFight();for(const T of LN.team)T.points=0;});
   // tu equipo cae entero: la cámara sigue a otro luchador vivo; no hay «otro duelo» (un solo foso); el marcador sigue vivo
   await p.evaluate(()=>{player.invulnTimer=0;damageHero(player,1e9,{isPvp:true,from:null});for(let i=0;i<5;i++)update(1000/60);colHudTick();});
   const sp=await p.evaluate(()=>({alive:player.alive,cam:CAM_SUBJECT&&CAM_SUBJECT.alive&&CAM_SUBJECT!==player,mate:CAM_SUBJECT&&CAM_SUBJECT.team===player.team,visible:!document.querySelector('.col-spec').classList.contains('hidden'),pitBtn:getComputedStyle(document.querySelector('.col-pit')).display,name:document.querySelector('.col-spec-name').textContent,note:document.querySelector('.col-note').textContent}));
   assert.equal(sp.alive,false);assert.equal(sp.cam,true,'la cámara sigue a otro luchador');assert.equal(sp.mate,true,'primero a tu compañero');assert.equal(sp.visible,true);assert.equal(sp.pitBtn,'none','sin «otro duelo»: hay un solo foso');assert.match(sp.name,/ESPECTANDO/);assert.match(sp.note,/TODOS CONTRA TODOS · quedan 4 equipos/);
   await p.evaluate(()=>{for(const o of heroes)if(o.team===player.team)__kill(o.team);update(1000/60);colHudTick();});
   const after=await p.evaluate(()=>({cam:CAM_SUBJECT&&CAM_SUBJECT.team!==player.team,note:document.querySelector('.col-note').textContent,out:LN.col.ffaOut.slice()}));
   assert.equal(after.cam,true,'si cae tu dupla, mirás a otro equipo');assert.deepEqual(after.out,[0]);assert.match(after.note,/quedan 3 equipos/);
   await done(h);ok('espectador en todos contra todos: sigue a tu compañero y después a otro equipo; sin botón «otro duelo»'); }

 /* ---- una ronda natural con bots (sin tocar nada) ---- */
 for(const seed of [31,32,33]){
   const h=await open();const p=h.p;
   const r=await p.evaluate(seed=>{__start('guerrero',seed);let friendly=0,nan=0;const dh=damageHero;damageHero=function(t,a,src,pt){const hp0=t&&t.hp,isF=t&&t.team!=null&&src&&!src.isPvp&&src!==t&&lanesTeamOf(src)===t.team;if(!(a>=0))nan++;const r=dh.call(this,t,a,src,pt);if(isF&&t.hp<hp0-0.01)friendly++;return r;};
     __drawDuels();__next();__drawDuels();__next();for(const T of LN.team)T.points=0;const t0=LN.t;__toFight();const f0=LN.t;
     let outside=0;for(let f=0;f<60*130&&LN.col.phase==='fight';f++){update(1000/60);if(f%30===0)for(const o of heroes){const c=colPitCenter(2);if(Math.hypot(o.x-c.x,o.y-c.y)>colPitR(2)+2)outside++;if(![o.x,o.y,o.hp].every(Number.isFinite))nan++;}}
     const c=LN.col;damageHero=dh;return {kind:c.kind,phase:c.phase,secs:Math.round((LN.t-f0)/1000),order:c.order,pts:LN.team.map(T=>T.points),friendly,nan,outside,pk:LN.team.map(T=>T.pk)};},seed);
   assert.equal(r.kind,'ffa');assert.equal(r.phase,'inter','la ronda terminó sola');assert.ok(r.secs<=92,'dentro del tiempo ('+r.secs+' s)');assert.deepEqual([...r.order].sort(),[0,1,2,3]);
   assert.deepEqual(r.pts,r.order.map((t,i)=>[t,[2,1,0,0][i]]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]),'puntos 2/1/0/0 por puesto');assert.equal(r.friendly,0,'sin fuego amigo');assert.equal(r.nan,0);assert.equal(r.outside,0,'nadie sale del foso grande');
   await done(h);ok(`ronda natural con bots (semilla ${seed}): terminó en ${r.secs} s, puestos ${r.order.join('>')} y puntos ${r.pts.join('/')}, ${r.pk.reduce((a,b)=>a+b,0)} bajas`);
 }

 /* ---- se puede decidir el torneo ---- */
 { const h=await open();const p=h.p;
   await p.evaluate(()=>{__start('guerrero',2);__toFight();LN.team[0].points=0;LN.team[1].points=1;colResolve(0,1);colResolve(1,2);update(1000/60);   // ronda 1: gana el 1 (2 pts) y el 2 (1 pt)
     __next();__toFight();colResolve(0,-1);colResolve(1,-1);update(1000/60);LN.team[1].points=2;__next();__toFight();});   // ronda 3: todos contra todos, el equipo 1 ya tiene 2
   const r=await p.evaluate(()=>{__kill(0);update(1000/60);__kill(2);update(1000/60);__kill(3);update(1000/60);return {order:LN.col.order,pts:LN.team.map(T=>T.points),over:colOver(),phase:LN.col.phase};});
   assert.equal(r.order[0],1);assert.equal(r.pts[1],4);assert.equal(r.over,true,'2 + 2 de la ronda ≥ 3: se decide ahí');
   await p.evaluate(()=>{LN.col.t0=LN.t-COL.INTER_MS;update(1000/60);});await p.waitForSelector('#col-result:not(.hidden)',{timeout:15000});
   const t=await p.textContent('#col-result');assert.match(t,/ÁMBAR GANA/);assert.match(t,/en TcT/);assert.match(t,/1 «todos contra todos»/);assert.match(await p.textContent('#col-result .rk-line'),/RANGO COLISEO/);
   // en el rango: 4.º puesto de 4 → resta contra los bots (peso medio)
   await p.evaluate(()=>lanesStop('mainmenu'));const L=await p.evaluate(()=>JSON.parse(localStorage.getItem('laHordaSave_v1')).ladder.modes.col);assert.equal(L.games,1);assert.ok(L.mmr<1000,'terminar último resta: '+L.mmr);
   await done(h);ok('un torneo se decide en el todos contra todos; el resultado lo muestra y el rango toma tu puesto'); }

 /* ---- pantalla ---- */
 for(const [w,hh] of [[844,390],[667,375]]){
   const h=await open({width:w,height:hh});const p=h.p;
   await p.evaluate(()=>{__start('guerrero',2);__drawDuels();__next();__drawDuels();__next();for(const T of LN.team)T.points=1;LN.team[2].points=2;colHudTick();});
   const prep=await p.evaluate(()=>({note:document.querySelector('.col-note').textContent,round:document.querySelector('.col-round').textContent,clock:document.querySelector('.col-clock').textContent}));
   assert.match(prep.note,/TODOS CONTRA TODOS · 1\.º \+2 · 2\.º \+1 puntos/);assert.equal(prep.round,'RONDA 3');
   await p.evaluate(()=>{__toFight();__step(1,true);colHudTick();});await p.waitForTimeout(100);
   const ui=await p.evaluate(()=>{
     const R=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height,sw:e.scrollWidth-e.clientWidth};};
     const sc=R('.col-score'),note=R('.col-note'),map=R('.col-map'),teams=[...document.querySelectorAll('.col-team')].length;
     const small=[...document.querySelectorAll('#col-hud *')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.display!=='none'&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)&&parseFloat(cs.fontSize)<14;}).map(e=>e.className);
     const px=document.querySelector('.col-map canvas').getContext('2d').getImageData(0,0,330,96).data;let lit=0;for(let i=0;i<px.length;i+=4)if(px[i]+px[i+1]+px[i+2]>200)lit++;
     return {sc,note,map,teams,small,vw:innerWidth,vh:innerHeight,text:document.querySelector('.col-note').textContent,clock:document.querySelector('.col-clock').textContent,ffa:document.getElementById('col-hud').classList.contains('col-ffa'),lit};});
   assert.equal(ui.teams,4);assert.ok(ui.sc.l>=0&&ui.sc.r<=ui.vw,w+': marcador dentro de la pantalla');assert.ok(ui.note.l>=0&&ui.note.r<=ui.vw&&ui.note.sw<=1,w+': aviso sin cortar');assert.ok(ui.note.t>=ui.sc.b-2,w+': el aviso no pisa el marcador');
   assert.deepEqual(ui.small,[],w+': letra < 14 px');assert.ok(ui.ffa);assert.match(ui.text,/quedan 4 equipos/);assert.ok(ui.lit>30,'el mapa dibuja los tres fosos y los luchadores');
   if(SHOTS) await p.screenshot({path:path.join(SHOTS,`ffa-${w}x${hh}.png`)});
   await done(h);ok(`pantalla todos contra todos ${w}x${hh}: marcador de cuatro equipos, aviso y mapa de tres fosos, letra >= 14 px`);
 }
 await browser.close();srv.kill();console.log('PASS coliseo todos contra todos: '+n+' grupos');
})().catch(async e=>{console.error(e);try{await browser.close();}catch{}srv.kill();process.exit(1);});
