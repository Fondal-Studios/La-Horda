'use strict';
/* Prueba de runtime de Build Evolution 2.0 en el juego real (Chromium). Reproducible: azar con semilla.
   Mide, por rama, el efecto REAL frente a la misma habilidad sin rama (mismo azar, mismos maniquíes). */
const {openGame}=require('./lib');
(async()=>{
 const {browser,page,errors}=await openGame();let fail=0;const rows=[];
 const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};
 const res=await page.evaluate(()=>{
  const out={rows:[],checks:[]};const chk=(c,m)=>out.checks.push([!!c,m]);
  const seed=s=>{let n=s;Math.random=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};};
  const ENEMY='esqueleto';
  function setup(k,evoLvl){
   seed(7);netMatch=null;
   for(const c in save.champions){const s=save.champions[c];s.unlocked=true;s.level=20;s.equipment={};s.inventory=[];s.talents={nodes:{},mastery:null,masteryNodes:{}};s.skillMastery=[0,1,2].map(()=>({...mkMastery(),alloc:evoLvl}));s.ultMastery={...mkMastery(),alloc:evoLvl};}
   lobbyAllies=[];__AP.start(k,'bosque',1);__AP.on=false;
   enemies.length=0;player.x=0;player.y=0;player.fx=1;player.fy=0;player.energy=player.maxEnergy;player.synergy=undefined;player.boons={};
  }
  function dummies(n,rank){
   const ds=[];for(let i=0;i<n;i++){spawnEnemy(ENEMY,false,false);const e=enemies[enemies.length-1];
    const a=(i/n-0.5)*0.9,d=70+i*8;e.x=player.x+Math.cos(a)*d;e.y=player.y+Math.sin(a)*d;e.hp=e.maxHp=1e9;e.stunTimer=0;e.speed=0;e.atkCd=1e9;e.dmg=0;e.ranged=false;
    if(rank)e.rank=rank;ds.push(e);}return ds;
  }
  function run(k,idx,branchId,pre,rank){
   setup(k,5);const ds=dummies(5,rank);
   if(pre==="slow")for(const e of ds){e.slowTimer=5000;e.slowAmt=0.3;}
   if(pre==="mark")for(const e of ds){e._evoMarkT=runElapsedMs+9000;}
   const x0=ds.map(e=>[e.x,e.y]);const d0=player.stats.dmgDealt||0;
   if(branchId)player.synergy={[idx]:branchId};
   player.hp=player.maxHp*0.5;player.shield=0;seed(99);
   const sk=idx==="ult"?CLASSES[k].ultimate:CLASSES[k].skills[idx];
   player.cds[idx]=0;player.energy=player.maxEnergy;
   useSkill(idx,null);
   const cdAfter=player.cds[idx];let maxStun=0,maxSlow=0,maxShield=0,maxMark=0;
   for(let i=0;i<150;i++){update(16.67);for(const e of ds){maxMark=Math.max(maxMark,(e._evoMarkT||0)-runElapsedMs);maxStun=Math.max(maxStun,e.stunTimer||0);maxSlow=Math.max(maxSlow,(e.slowTimer>0?e.slowAmt:0)||0);}maxShield=Math.max(maxShield,player.shield||0);}
   const dmg=(player.stats.dmgDealt||0)-d0,mark=maxMark;
   const moved=ds.reduce((s,e,i)=>s+Math.hypot(e.x-x0[i][0],e.y-x0[i][1]),0);
   return {dmg,cdAfter,maxStun,maxSlow,maxShield:maxShield/player.maxHp,heal:(player.hp-player.maxHp*0.5)/player.maxHp,mark,moved,err:__AP.err||null};
  }
  // ---- eligibilidad / oferta / exclusividad ----
  setup('mago',4);chk(synPendingSkills(player).length===0,'Nv.4: sin decisión pendiente');
  setup('mago',5);const pend=synPendingSkills(player);chk(pend.length===2,'Nv.5: mago tiene 2 habilidades con decisión ('+pend.length+')');
  const offers=boonBuildOffers(player,BUFF_POOL,false);const syn=offers.filter(o=>o.startsWith('syn:'));
  chk(syn.length===2,'la oferta trae 2 cartas de rama');
  chk(new Set(syn.map(o=>SYN_BY_ID[o.slice(4)].arch)).size===2,'las dos ramas ofrecidas son de arquetipo distinto');
  chk(new Set(syn.map(o=>SYN_BY_ID[o.slice(4)].skill)).size===1,'las dos ramas son de la MISMA habilidad (decisión excluyente)');
  chk(offers.length===3,'la oferta sigue siendo de 3 cartas');
  chk(syn.every(o=>boonParseOpt(o)&&buffOptHTML(o,player).includes('Excluye')&&buffOptName(o)&&buffOptClass(o).includes('syn-branch')),'cartas con requisitos, efecto y exclusión legibles; compatibles con coop (boonParseOpt)');
  chk(buffApplyOpt(player,syn[0])===true&&synBranchFor(player,SYN_BY_ID[syn[0].slice(4)].skill),'elegir aplica la rama');
  chk(buffApplyOpt(player,syn[1])===false,'la rama rival queda cerrada');
  chk(synPendingSkills(player).every(p=>p.key!==SYN_BY_ID[syn[0].slice(4)].skill),'la habilidad ya no tiene decisión pendiente');
  setup('soporte',9);chk(synPendingSkills(player).length===0&&boonBuildOffers(player,BUFF_POOL,false).every(o=>!o.startsWith('syn:')),'campeón fuera del alcance inicial: oferta intacta');
  setup('mago',5);chk(synGrant(player,'tq_ariete')===false,'rama de otro campeón rechazada');
  // ---- efectos por rama ----
  const T={tq_ariete:['tanque',1],tq_quiebre:['tanque',1],tq_vortice:['tanque',0],tq_filo:['tanque',0],mg_quebradiza:['mago',1,'slow'],mg_glacial:['mago',1,'slow'],mg_tormenta:['mago',2],mg_tierra:['mago',2],cz_caceria:['cazadora',0,'mark'],cz_rastro:['cazadora',0],cz_cobertura:['cazadora',2],cz_marca:['cazadora',2]};
  for(const id in T){
   const [k,idx,pre]=T[id],base=run(k,idx,null,pre),br=run(k,idx,id,pre),b=SYN_BY_ID[id];
   const r={id,arch:b.arch,baseDmg:Math.round(base.dmg),brDmg:Math.round(br.dmg),dmgPct:base.dmg?+((br.dmg/base.dmg-1)*100).toFixed(1):null,shield:+br.maxShield.toFixed(3),heal:+br.heal.toFixed(3),stun:br.maxStun,slow:br.maxSlow,moved:Math.round(br.moved-base.moved),mark:Math.round(br.mark),cd:+(br.cdAfter/base.cdAfter).toFixed(3)};
   out.rows.push(r);chk(!base.err&&!br.err,id+': sin errores de simulación');
   chk(base.dmg>0,id+': la habilidad base golpea a los maniquíes (dmg='+Math.round(base.dmg)+')');
   chk(Math.abs(r.cd-b.cdMult)<0.03,id+': costo de enfriamiento aplicado (x'+r.cd+')');
   const f=b.fx;
   if(f.vsSlowed||f.vsMarked)chk(br.dmg>base.dmg*1.05,id+': daño condicional supera la base (+'+r.dmgPct+'%)');
   if(f.extra||f.chain)chk(br.dmg>base.dmg*1.05,id+': daño extra supera la base (+'+r.dmgPct+'%)');
   if(f.shield)chk(br.maxShield>base.maxShield+0.005&&br.maxShield<=f.shield.cap*1.3+0.001,id+': escudo dentro de tope ('+r.shield+')');
   if(f.heal)chk(br.heal>base.heal+0.005&&br.heal<=f.heal.cap*1.3+0.001,id+': cura dentro de tope ('+r.heal+')');
   if(f.slow)chk(br.maxSlow>=f.slow.amt-0.001,id+': ralentiza');
   if(f.stun)chk(br.maxStun>=f.stun.ms-1,id+': aturde (>= '+f.stun.ms+' ms; la embestida ya aturde por sí sola '+Math.round(base.maxStun)+')');
   if(f.pull)chk(r.moved>30,id+': acerca a los enemigos (+'+r.moved+' px de desplazamiento)');
   if(f.mark)chk(br.mark>base.mark+300,id+': marca más larga que la Firma ('+Math.round(base.mark)+' -> '+Math.round(br.mark)+' ms)');
   chk(br.dmg<base.dmg*1.6,id+': ningún efecto supera +60% del daño base');
  }
  // ---- jefes: control reducido, sin aturdir ni acercar ----
  const bq=run('tanque',1,'tq_quiebre',null,'jefe'),bv=run('tanque',0,'tq_vortice',null,'jefe'),bvb=run('tanque',0,null,null,'jefe');
  const bqb=run('tanque',1,null,null,'jefe');chk(bq.maxStun<=bqb.maxStun,'jefe: la rama no suma aturdimiento ('+bq.maxStun+' vs base '+bqb.maxStun+')');chk(bq.maxSlow<=Math.max(bqb.maxSlow,0.4*SYN_CFG.bossControl)+0.011,'jefe: ralentización reducida ('+bq.maxSlow+')');
  chk(Math.abs(bv.moved-bvb.moved)<3,'jefe: Vórtice de Acero no lo arrastra');
  // ---- tope de presupuesto ----
  setup('tanque',5);player.synergy={0:'tq_filo'};player._synWin=null;
  chk(synBudgetOk(player,1e12)<=player.baseDmg*runStats.dmgMult*SYN_CFG.budgetPerSec+1,'tope de daño extra por segundo');
  // ---- set: potencia ----
  setup('tanque',5);const b0=synPower(player,SYN_BY_ID.tq_ariete);chk(b0===1,'sin set: potencia x1');
  const _sn=setN;setN=(h,id)=>id==='baluarte'?2:_sn(h,id);const b2=synPower(player,SYN_BY_ID.tq_ariete);setN=_sn;chk(Math.abs(b2-1.2)<1e-9,'2 piezas del set: x1.2');
  const _s4=setN;setN=()=>6;chk(synPower(player,SYN_BY_ID.tq_ariete)<=SYN_CFG.setCap,'potencia con tope');setN=_s4;
  // ---- cooperativo: h.synergy viaja en el snapshot (el delta de héroe copia toda clave que no esté en NET_SKIP_KEYS) ----
  setup('tanque',5);player.synergy={1:'tq_ariete'};{const d=_netDeltaOf({},player,true);chk(d.synergy&&d.synergy[1]==='tq_ariete','cooperativo: h.synergy se replica en el snapshot del héroe');chk(!NET_SKIP_KEYS.has('synergy'),'synergy no está en NET_SKIP_KEYS');}
  // ---- los hitos existentes de skill-evolution siguen intactos ----
  setup('mago',5);chk(typeof skillEvoLines==='function'&&skillEvoLines('mago',CLASSES.mago.skills[1],1).length===4,'las 4 líneas de evolución originales siguen');
  chk(skillEvoHTML('mago',CLASSES.mago.skills[1],1,5).includes('Rama a elegir'),'panel muestra la rama a elegir');
  return out;});
 for(const [c,m] of res.checks)ok(c,m);
 console.table(res.rows);
 ok(!errors.length,'sin errores de página: '+errors.join('|'));
 console.log(fail?`\nFALLÓ (${fail}/${res.checks.length+1})`:`\nPASS (${res.checks.length+1} comprobaciones)`);
 await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
