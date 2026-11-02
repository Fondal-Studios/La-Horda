'use strict';
/* Build Evolution en HORDA INFINITA (partida completa en el juego real): la decisión de rama aparece en las cartas del
   modo (boonBuildOffers con endless=true), se elige, la rama actúa durante varias rondas y no hay errores.
   Uso: SITE=http://127.0.0.1:8771 node tools/build-evolution/t_synergy_endless.js */
const {openGame}=require('./lib');
(async()=>{const {browser,page,errors}=await openGame();let fail=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?'  '+JSON.stringify(x).slice(0,300):''));if(!c)fail++;};
 const r=await page.evaluate(()=>{const out={};
  let n=4242;Math.random=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};netMatch=null;
  for(const c in save.champions){const s=save.champions[c];s.unlocked=true;s.level=20;s.xp=0;s.equipment={};s.inventory=[];s.talents={nodes:{},mastery:null,masteryNodes:{}};s.skillMastery=[0,1,2].map(()=>({...mkMastery(),alloc:5}));s.ultMastery={...mkMastery(),alloc:5};}
  lobbyAllies=[];selectedClass='mago';endlessBeginRun();startRun(1);__AP.on=false;
  out.endless=endlessOn();out.round0=EN.round;
  player.invulnTimer=1e9;enemies.length=0;
  // fin de la ronda -> pantalla de cartas del modo
  const cardsAt=()=>document.querySelectorAll('#buff-cards .buff-card').length;
  for(let i=0;i<4000&&state!=='buff';i++){levelTimer=levelDuration+1;update(16.67);}
  out.state=state;out.cards=[...document.querySelectorAll('#buff-cards .buff-card')].map(c=>({syn:c.classList.contains('syn-branch'),t:c.textContent.replace(/\s+/g,' ').trim().slice(0,70)}));
  const syn=document.querySelector('#buff-cards .buff-card.syn-branch');
  if(syn){syn.click();}
  out.after=state;out.synergy=player.synergy||null;
  // varias rondas con la rama activa: piloto automático real, sin morir
  __AP.on=true;let t=0;for(let s=0;s<40;s++){__AP.sim(1000,33.333);if(state==='buff'&&typeof __AP.pickBuff==='function')__AP.pickBuff();}
  out.round1=EN.round;out.alive=player.alive;out.err=__AP.err||null;out.dmg=Math.round(player.stats.dmgDealt);
  return out;});
 ok(r.endless,'Horda Infinita activa',{round:r.round0});
 ok(r.state==='buff'&&r.cards.length===3,'pantalla de cartas del modo con 3 opciones',r.cards);
 ok(r.cards.filter(c=>c.syn).length===2,'dos cartas de rama en la oferta del modo');
 ok(r.synergy&&Object.keys(r.synergy).length===1,'la rama elegida queda aplicada',r.synergy);
 ok(r.err===null&&r.dmg>0,'el piloto automático juega 40 s con la rama sin errores y causa daño',{dmg:r.dmg,round:r.round1,alive:r.alive,err:r.err});
 ok(errors.length===0,'sin errores de página',errors.slice(0,3));
 console.log(fail?'FALLÓ '+fail:'PASS');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
