'use strict';
const fs=require('fs'),H=require('../lib/serve');
const D=process.env.OUT||'art-source/entregas/libertador-kit-20261025/cierre-01';fs.mkdirSync(D,{recursive:true});
(async()=>{const site=await H.startSite(),b=await H.launch(),errors=[],rows=[];try{
for(const mobile of [false,true]){const p=await b.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady()&&typeof libertadorFxStrip==='function');
for(const tier of [0,7])for(const slot of [0,1,2]){
const r=await p.evaluate(({tier,slot})=>{loop=()=>{};let vt=1000;performance.now=()=>vt;netMatch=null;
for(const c of Object.values(save.champions)){Object.assign(c,{unlocked:true,level:20,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});for(const m of c.skillMastery)m.alloc=tier;}
selectedClass='libertador';currentArena='bosque';lobbyAllies=['tanque','soporte'];startRun(1);state='playing';document.querySelectorAll('.screen').forEach(e=>e.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;player.energy=1e4;player.fx=1;player.fy=0;player.aim={x:player.x+400,y:player.y,dx:1,dy:0};for(const h of allies){h.x=player.x-70;h.y=player.y+80;h.stunTimer=1e9;}
for(let i=0;i<10;i++){vt+=16;update(16);render();}_arenaTitleUntil=0;sfaPool.length=0;champFx.length=0;
castAbility(player,player.cls.skills[slot],false,slot);
const cue=sfaPool.find(s=>s.theme.startsWith('libertador_')),ring=champFx.find(f=>f.type==='ring'),checks=[];const ck=(name,ok)=>checks.push({name,ok:!!ok});
ck('one native cue',sfaPool.filter(s=>s.theme.startsWith('libertador_')).length===1);
if(slot===1){ck('actual ring radius',Math.abs(cue.r-ring.r)<1e-8);ck('variant h',cue.theme==='libertador_command~h');}else{ck('actual travel extent',Math.abs(Math.hypot(cue.bx-cue.x,cue.by-cue.y)-player.smDashLeft)<1e-8);ck('variant correct',cue.theme===(slot===0?'libertador_bayonet':'libertador_charge~p'));}
const initial={phase:player.smPhase,r:cue?.r,ring: ring?.r,theme:cue?.theme};
const count=sfaPool.length;player.fused=true;castAbility(player,player.cls.skills[slot],false,slot);ck('fused cast no duplicate',sfaPool.length===count);player.fused=false;
const shots=[];for(let i=0;i<32;i++){vt+=16;update(16);render();if([4,13,29].includes(i))shots.push({t:(i+1)*16,png:document.getElementById('game').toDataURL()});}
window.SFA_OFF=true;const before=sfaPool.length;castAbility(player,player.cls.skills[slot],false,slot);ck('SFA_OFF no native cue',sfaPool.length===before);window.SFA_OFF=false;
return{tier,slot,checks,initial,shots};},{tier,slot});
for(const s of r.shots){s.file=`${mobile?'mobile':'desktop'}-tier${tier}-h${slot+1}-${s.t}.png`;fs.writeFileSync(D+'/'+s.file,Buffer.from(s.png.split(',')[1],'base64'));delete s.png;}rows.push({mobile,...r});console.log(mobile,tier,slot,r.checks);
}await p.close();}
fs.writeFileSync(D+'/CAST_CONTRACT.json',JSON.stringify({rows,errors,scope:'Real casts on fresh main with candidate SFA only; Bosque base/tier4; diagnostic captures, not full visual gate or relay.'},null,2));if(errors.length||rows.some(r=>r.checks.some(c=>!c.ok)))process.exitCode=1;
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
