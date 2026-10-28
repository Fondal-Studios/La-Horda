'use strict';
const fs=require('fs'),H=require('../lib/serve'),OUT=process.env.OUT;fs.mkdirSync(OUT,{recursive:true});
(async()=>{const site=await H.startSite(),b=await H.launch(),errors=[];try{const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>{requestAnimationFrame=()=>0;});await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady(),null,{polling:100});
const result=await p.evaluate(()=>{const rows=[],checks=[];const check=(name,pass,data)=>checks.push({name,pass:!!pass,data});
for(const arena of ['bosque','laberinto','coliseum']){
 selectedClass='nano_gm';currentArena=arena;netMatch=null;const c=save.champions.nano_gm;c.unlocked=true;c.level=99;c.equipment={};c.talents={nodes:{},mastery:null,masteryNodes:{}};for(const m of c.skillMastery)m.alloc=0;startRun(1);state='playing';enemies=[];
 const wall=labyrinthWalls.find(w=>Math.hypot(w.x,w.y)<500)||labyrinthWalls[0];const h=player;let target={x:h.x+180,y:h.y+100};
 if(wall){const n={x:-Math.sin(wall.rot),y:Math.cos(wall.rot)};h.x=wall.x+n.x*(wall.thick/2+100);h.y=wall.y+n.y*(wall.thick/2+100);target={x:wall.x+Math.cos(wall.rot)*30,y:wall.y+Math.sin(wall.rot)*30};}
 const before={x:h.x,y:h.y},areas=[],calls=[],teleports=[],oldA=ascArea,oldF=kvbFx,oldT=ascTeleport;
 ascArea=function(h,p,r,...a){areas.push({x:p.x,y:p.y,r});return oldA.call(this,h,p,r,...a);};kvbFx=function(...a){calls.push(a);return oldF.apply(this,a);};ascTeleport=function(h,p){const r=oldT(h,p);teleports.push({dest:{...p},moved:r,after:{x:h.x,y:h.y}});return r;};
 h.energy=1e5;h.cds=[0,0,0];const len=Math.hypot(target.x-h.x,target.y-h.y);useSkill(2,{...target,dx:(target.x-h.x)/len,dy:(target.y-h.y)/len});ascArea=oldA;kvbFx=oldF;ascTeleport=oldT;
 const call=calls.find(x=>x[0]==='nano.invert'),after={x:h.x,y:h.y},endpoint=call?{x:call[1]+Math.cos(call[4])*call[5],y:call[2]+Math.sin(call[4])*call[5]}:null;
 const r={arena,wall:wall?{...wall}:null,target,before,after,areas,teleports,call,endpoint,displacedFromAim:Math.hypot(after.x-target.x,after.y-target.y)};rows.push(r);
 check('endpoint actual '+arena,endpoint&&Math.hypot(endpoint.x-after.x,endpoint.y-after.y)<1e-7,r);
}
for(const action of ['sentence','invert'])for(const optional of [undefined,0,NaN,70,536.76]){KVB.pool=[];KVB_FX['nano.'+action](0,0,30,.7,180,optional);const e=KVB.pool.find(e=>e.name===(action==='sentence'?'ng_burst_d':'ng_verdict'));const expected=Number.isFinite(optional)&&optional>0?Math.min(520,optional):Math.max(40,30*(action==='sentence'?2.3:1.3));check('legacy or numeric '+action+'/'+String(optional),e&&Math.abs(e.w/2-expected)<1e-8,{optional:String(optional),actual:e?.w/2,expected,scope:'synthetic callback, records shared520 cap; not all reachable builds'});kvbUpdate(1000);check('expires '+action+'/'+String(optional),KVB.pool.length===0);}
return{rows,checks,scope:'Actual useSkill and actual wall/collision/reachability implementations, fixture positions near existing wall. No collision override. Callback fallback/extreme probes synthetic, not reachable-build certification.'};});fs.writeFileSync(OUT+'/TELEPORT.json',JSON.stringify({...result,errors},null,2));console.log(JSON.stringify({checks:result.checks.length,failures:result.checks.filter(x=>!x.pass),rows:result.rows,errors}));if(errors.length||result.checks.some(x=>!x.pass))process.exitCode=1;
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
